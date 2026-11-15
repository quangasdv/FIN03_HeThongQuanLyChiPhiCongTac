USE QuanLyCongTac;
GO

-- =========================================================================
-- PHẦN 1: TẠO CÁC KHUNG NHÌN (VIEWS) - ĐỔ DỮ LIỆU LÊN GIAO DIỆN / API
-- =========================================================================

-- 1. View danh sách đề xuất (Dùng cho Dashboard và màn hình duyệt của Sếp)
CREATE OR ALTER VIEW vw_DanhSachDeXuat AS
SELECT 
    dx.MaDeXuat,
    dx.MaNV,
    nv.HoTen AS TenNhanVien,
    nv.ChucVu,
    pb.MaPB,
    pb.TenPB,
    dx.MucDich,
    dx.NgayDi,
    dx.NgayVe,
    DATEDIFF(DAY, dx.NgayDi, dx.NgayVe) + 1 AS SoNgayCongTac,
    dx.TrangThai,
    dx.LyDoTuChoi,
    dx.SoTienTamUngDeNghi,
    ISNULL(tu.SoTien, 0) AS SoTienTamUngThucTe,
    ISNULL(dt.TongDuToan, 0) AS TongKinhPhiDuToan,
    ISNULL(qt.TongTienThuc, 0) AS TongThucChi,
    ISNULL(qt.TienBuTru, 0) AS TienBuTru
FROM DeXuatCongTac dx
INNER JOIN NhanVien nv ON dx.MaNV = nv.MaNV
INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
LEFT JOIN PhieuTamUng tu ON dx.MaDeXuat = tu.MaDeXuat
LEFT JOIN PhieuQuyetToan qt ON dx.MaDeXuat = qt.MaDeXuat
LEFT JOIN (
    SELECT MaDeXuat, SUM(SoTienDuKien) AS TongDuToan
    FROM ChiTietDuToan
    GROUP BY MaDeXuat
) dt ON dx.MaDeXuat = dt.MaDeXuat;
GO

-- 2. View chi tiết đối soát chứng từ & OCR (Dùng cho Kế toán kiểm tra hóa đơn)
CREATE OR ALTER VIEW vw_ChiTietKhaiBaoChungTu AS
SELECT 
    ctkb.MaCTKB,
    ctkb.MaKhaiBao,
    kb.MaDeXuat,
    dx.MaNV,
    nv.HoTen AS TenNhanVien,
    ctkb.MaLoaiCP,
    lcp.TenLoai AS TenLoaiChiPhi,
    ctkb.NgayChi,
    ctkb.SoTienThucTe,
    ctkb.TrangThaiHopLe,
    ocr.MaChungTu,
    ocr.LinkAnh,
    ocr.DungLuongMB,
    ocr.DataBocTach,
    gt.LyDo AS LyDoGiaiTrinhNgoaiLe,
    gt.KQPheDuyet AS KetQuaDuyetNgoaiLe
FROM ChiTietKhaiBao ctkb
INNER JOIN PhieuKhaiBao kb ON ctkb.MaKhaiBao = kb.MaKhaiBao
INNER JOIN DeXuatCongTac dx ON kb.MaDeXuat = dx.MaDeXuat
INNER JOIN NhanVien nv ON dx.MaNV = nv.MaNV
INNER JOIN LoaiChiPhi lcp ON ctkb.MaLoaiCP = lcp.MaLoaiCP
LEFT JOIN ChungTuOCR ocr ON ctkb.MaCTKB = ocr.MaCTKB
LEFT JOIN GiaiTrinhNgoaiLe gt ON ctkb.MaCTKB = gt.MaCTKB;
GO

-- 3. View tổng hợp quyết toán & phục vụ báo cáo thuế
CREATE OR ALTER VIEW vw_TongHopQuyetToan AS
SELECT 
    qt.MaQuyetToan,
    qt.MaDeXuat,
    dx.MaNV,
    dx.MucDich,
    nv.HoTen AS NguoiDiCongTac,
    pb.MaPB,
    pb.TenPB AS PhongBan,
    kt.HoTen AS KeToanChotSo,
    qt.NgayChotSo,
    ISNULL(tu.SoTien, 0) AS TienTamUng,
    qt.TongTienThuc AS TongChiHopLe,
    qt.TienBuTru,
    CASE 
        WHEN qt.TienBuTru > 0 THEN N'Công ty hoàn trả thêm cho NV'
        WHEN qt.TienBuTru < 0 THEN N'Thu hồi tiền thừa nộp lại quỹ'
        ELSE N'Không phát sinh chênh lệch'
    END AS HuongXuLyTaiChinh,
    qt.TrangThai AS TrangThaiHoSo
FROM PhieuQuyetToan qt
INNER JOIN DeXuatCongTac dx ON qt.MaDeXuat = dx.MaDeXuat
INNER JOIN NhanVien nv ON dx.MaNV = nv.MaNV
INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
INNER JOIN NhanVien kt ON qt.MaNVKeToan = kt.MaNV
LEFT JOIN PhieuTamUng tu ON dx.MaDeXuat = tu.MaDeXuat;
GO

-- =========================================================================
-- PHẦN 2: TẠO TYPE BẢNG VÀ STORED PROCEDURES (XỬ LÝ NGHIỆP VỤ)
-- =========================================================================

-- Tạo Type bảng để truyền danh sách chi tiết dự toán từ C# vào Stored Procedure
IF TYPE_ID('ChiTietDuToanType') IS NULL
BEGIN
    CREATE TYPE ChiTietDuToanType AS TABLE (
        MaLoaiCP        VARCHAR(20)     NOT NULL,
        SoTienDuKien    DECIMAL(18,2)   NOT NULL,
        LyDoGiaiTrinh   NVARCHAR(250)   NULL
    );
END
GO

-- 1. SP: Lập đề xuất và danh sách dự toán (Dùng Transaction và kiểm tra ràng buộc)
CREATE OR ALTER PROCEDURE sp_TaoDeXuatVaDuToan
    @MaDeXuat           VARCHAR(30),
    @MaNV               VARCHAR(20),
    @MucDich            NVARCHAR(250),
    @NgayDi             DATE,
    @NgayVe             DATE,
    @SoTienTamUngDeNghi DECIMAL(18,2),
    @ChiTietDuToan      ChiTietDuToanType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- BR04: Kiểm tra thời gian
        IF @NgayVe < @NgayDi
        BEGIN
            RAISERROR(N'Lỗi: Ngày kết thúc không được nhỏ hơn ngày bắt đầu công tác!', 16, 1);
            RETURN;
        END

        -- BR05: Bắt buộc phải có ít nhất 1 dòng dự toán
        IF NOT EXISTS (SELECT 1 FROM @ChiTietDuToan)
        BEGIN
            RAISERROR(N'Lỗi: Đề xuất công tác bắt buộc phải có ít nhất một khoản chi dự toán!', 16, 1);
            RETURN;
        END

        -- Tính tổng dự toán
        DECLARE @TongDuToan DECIMAL(18,2);
        SELECT @TongDuToan = SUM(SoTienDuKien) FROM @ChiTietDuToan;

        -- BR08: Kiểm tra hạn mức tạm ứng không vượt quá tổng dự toán
        IF @SoTienTamUngDeNghi > @TongDuToan
        BEGIN
            RAISERROR(N'Lỗi: Số tiền tạm ứng đề nghị không được vượt quá 100%% tổng dự toán!', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;

        -- 1. Thêm đề xuất
        INSERT INTO DeXuatCongTac (MaDeXuat, MaNV, MucDich, NgayDi, NgayVe, TrangThai, SoTienTamUngDeNghi)
        VALUES (@MaDeXuat, @MaNV, @MucDich, @NgayDi, @NgayVe, N'Chờ duyệt', @SoTienTamUngDeNghi);

        -- 2. Thêm các dòng dự toán (Tự động gộp theo MaLoaiCP để tránh lỗi khóa chính PK_ChiTietDuToan)
        INSERT INTO ChiTietDuToan (MaDeXuat, MaLoaiCP, SoTienDuKien, LyDoGiaiTrinh)
        SELECT 
            @MaDeXuat, 
            MaLoaiCP, 
            SUM(SoTienDuKien), 
            LTRIM(STRING_AGG(ISNULL(LyDoGiaiTrinh, ''), '; '))
        FROM @ChiTietDuToan
        GROUP BY MaLoaiCP;

        COMMIT TRANSACTION;

        SELECT 1 AS IsSuccess, N'Lập đề xuất công tác thành công!' AS Message, @MaDeXuat AS MaDeXuat;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 2. SP: Phê duyệt hoặc Từ chối đề xuất (Dành cho Quản lý)
CREATE OR ALTER PROCEDURE sp_PheDuyetDeXuat
    @MaDeXuat   VARCHAR(30),
    @MaQuanLy   VARCHAR(20),
    @HanhDong   VARCHAR(10),     -- 'DUYET' hoặc 'TU_CHOI'
    @GhiChu     NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra đơn tồn tại
        IF NOT EXISTS (SELECT 1 FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat)
        BEGIN
            RAISERROR(N'Lỗi: Đơn đề xuất không tồn tại trong hệ thống!', 16, 1);
            RETURN;
        END

        -- BR09: Không được tự duyệt đơn của chính mình
        IF EXISTS (SELECT 1 FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat AND MaNV = @MaQuanLy)
        BEGIN
            RAISERROR(N'Lỗi: Quản lý không được phép tự phê duyệt đơn đề xuất do chính mình tạo!', 16, 1);
            RETURN;
        END

        IF @HanhDong = 'DUYET'
        BEGIN
            UPDATE DeXuatCongTac
            SET TrangThai = N'Đã duyệt', LyDoTuChoi = NULL
            WHERE MaDeXuat = @MaDeXuat;

            SELECT 1 AS IsSuccess, N'Đã phê duyệt đề xuất công tác thành công!' AS Message;
        END
        ELSE IF @HanhDong = 'TU_CHOI'
        BEGIN
            UPDATE DeXuatCongTac
            SET TrangThai = N'Từ chối', LyDoTuChoi = @GhiChu
            WHERE MaDeXuat = @MaDeXuat;

            SELECT 1 AS IsSuccess, N'Đã từ chối đề xuất công tác!' AS Message;
        END
        ELSE
        BEGIN
            RAISERROR(N'Hành động không hợp lệ! Chỉ chấp nhận DUYET hoặc TU_CHOI.', 16, 1);
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 3. SP: Kế toán xuất quỹ tạm ứng
CREATE OR ALTER PROCEDURE sp_ChiTamUng
    @MaTamUng   VARCHAR(30),
    @MaDeXuat   VARCHAR(30),
    @MaNVKeToan VARCHAR(20),
    @SoTienChi  DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- BR11: Đơn phải ở trạng thái "Đã duyệt"
        IF NOT EXISTS (SELECT 1 FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat AND TrangThai = N'Đã duyệt')
        BEGIN
            RAISERROR(N'Lỗi: Đề xuất chưa được phê duyệt hoặc đã được tạm ứng trước đó!', 16, 1);
            RETURN;
        END

        -- BR12: Mỗi đơn chỉ được tạm ứng 1 lần
        IF EXISTS (SELECT 1 FROM PhieuTamUng WHERE MaDeXuat = @MaDeXuat)
        BEGIN
            RAISERROR(N'Lỗi: Đơn đề xuất này đã được giải ngân tạm ứng rồi!', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;

        INSERT INTO PhieuTamUng (MaTamUng, MaDeXuat, MaNVKeToan, NgayChi, SoTien)
        VALUES (@MaTamUng, @MaDeXuat, @MaNVKeToan, GETDATE(), @SoTienChi);

        UPDATE DeXuatCongTac
        SET TrangThai = N'Đã tạm ứng'
        WHERE MaDeXuat = @MaDeXuat;

        COMMIT TRANSACTION;

        SELECT 1 AS IsSuccess, N'Đã xác nhận xuất quỹ chi tạm ứng thành công!' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 4. SP: Kế toán chốt sổ quyết toán bù trừ
CREATE OR ALTER PROCEDURE sp_ChotSoQuyetToan
    @MaQuyetToan VARCHAR(30),
    @MaDeXuat    VARCHAR(30),
    @MaNVKeToan  VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra đơn đã ở trạng thái Chờ quyết toán chưa (Nhân viên đã hoàn thành chuyến đi)
        IF NOT EXISTS (SELECT 1 FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat AND TrangThai = N'Chờ quyết toán')
        BEGIN
            RAISERROR(N'Lỗi: Chuyến đi chưa được nhân viên xác nhận hoàn thành! Hồ sơ bắt buộc phải ở trạng thái "Chờ quyết toán" mới có thể chốt sổ.', 16, 1);
            RETURN;
        END

        -- BR17: Kiểm tra 100% chứng từ đã được kiểm tra (không còn khoản chờ)
        IF EXISTS (
            SELECT 1 FROM ChiTietKhaiBao ctkb
            INNER JOIN PhieuKhaiBao kb ON ctkb.MaKhaiBao = kb.MaKhaiBao
            WHERE kb.MaDeXuat = @MaDeXuat AND ctkb.TrangThaiHopLe LIKE N'%Chờ%'
        )
        BEGIN
            RAISERROR(N'Lỗi: Chưa kiểm tra xong toàn bộ chứng từ trong hồ sơ chuyến đi!', 16, 1);
            RETURN;
        END

        -- Tự động tính toán tổng thực chi hợp lệ
        DECLARE @TongThucChi DECIMAL(18,2) = 0;
        SELECT @TongThucChi = ISNULL(SUM(ctkb.SoTienThucTe), 0)
        FROM ChiTietKhaiBao ctkb
        INNER JOIN PhieuKhaiBao kb ON ctkb.MaKhaiBao = kb.MaKhaiBao
        WHERE kb.MaDeXuat = @MaDeXuat AND ctkb.TrangThaiHopLe LIKE N'%Hợp lệ%';

        -- Lấy số tiền đã tạm ứng
        DECLARE @SoTienTamUng DECIMAL(18,2) = 0;
        SELECT @SoTienTamUng = ISNULL(SoTien, 0)
        FROM PhieuTamUng WHERE MaDeXuat = @MaDeXuat;

        -- BR18: Tính bù trừ tự động
        DECLARE @TienBuTru DECIMAL(18,2) = @TongThucChi - @SoTienTamUng;

        BEGIN TRANSACTION;

        INSERT INTO PhieuQuyetToan (MaQuyetToan, MaDeXuat, MaNVKeToan, NgayChotSo, TongTienThuc, TienBuTru, TrangThai)
        VALUES (@MaQuyetToan, @MaDeXuat, @MaNVKeToan, GETDATE(), @TongThucChi, @TienBuTru, N'Đã chốt sổ');

        UPDATE DeXuatCongTac
        SET TrangThai = N'Đã chốt sổ'
        WHERE MaDeXuat = @MaDeXuat;

        COMMIT TRANSACTION;

        SELECT 
            1 AS IsSuccess, 
            N'Đã chốt sổ quyết toán thành công!' AS Message,
            @TongThucChi AS TongThucChi,
            @SoTienTamUng AS SoTienTamUng,
            @TienBuTru AS TienBuTru;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =========================================================================
-- PHẦN 3: TẠO CÁC TRIGGERS (TỰ ĐỘNG BẮT LỖI & TOÀN VẸN DỮ LIỆU)
-- =========================================================================

-- 1. Trigger kiểm tra định mức dự toán: Vượt mức bắt buộc phải có giải trình (BR07)
CREATE OR ALTER TRIGGER trg_CheckDinhMucDuToan
ON ChiTietDuToan
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu có dòng dự toán nào vượt định mức mà không có lý do giải trình (Áp dụng chung toàn bộ nhân viên)
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN DeXuatCongTac dx ON i.MaDeXuat = dx.MaDeXuat
        INNER JOIN QuyDinhDinhMuc qd ON i.MaLoaiCP = qd.MaLoaiCP 
                                    AND dx.NgayDi >= qd.NgayHieuLuc 
                                    AND (qd.NgayHetHan IS NULL OR dx.NgayDi <= qd.NgayHetHan)
        WHERE i.SoTienDuKien > qd.SoTienToiDa
          AND (i.LyDoGiaiTrinh IS NULL OR LTRIM(RTRIM(i.LyDoGiaiTrinh)) = '')
    )
    BEGIN
        RAISERROR(N'Lỗi nghiệp vụ (BR07): Khoản chi dự toán vượt quá định mức quy định của công ty! Bạn bắt buộc phải nhập "Lý do giải trình ngoại lệ" mới được lưu.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

-- 2. Trigger đóng băng hồ sơ: Đã chốt sổ thì cấm UPDATE / DELETE đề xuất (BR19)
CREATE OR ALTER TRIGGER trg_KhoaDuLieuSauQuyetToan
ON DeXuatCongTac
FOR UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra nếu đơn cũ đã ở trạng thái 'Đã chốt sổ' mà bị sửa/xóa
    IF EXISTS (SELECT 1 FROM deleted WHERE TrangThai = N'Đã chốt sổ')
    BEGIN
        RAISERROR(N'Lỗi nghiệp vụ (BR19): Hồ sơ chuyến đi này đã được chốt sổ quyết toán và bị khóa vĩnh viễn (Read-only) để phục vụ kiểm toán thuế! Không được phép chỉnh sửa hoặc xóa.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO