-- =========================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG TÁC PHÍ VÀ CHI PHÍ CHUYẾN ĐI (FIN-03)
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU & BƠM DỮ LIỆU MẪU ĐẦY ĐỦ 12 BẢNG
-- CHUẨN ERD & QUY TẮC NGHIỆP VỤ BR01 - BR19
-- HỆ QUẢN TRỊ CSDL: MICROSOFT SQL SERVER
-- =========================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyCongTac')
BEGIN
    CREATE DATABASE QuanLyCongTac;
END
GO

USE QuanLyCongTac;
GO

-- XÓA BẢNG CŨ THEO THỨ TỰ RÀNG BUỘC (NẾU CẦN RESET LẠI)
IF OBJECT_ID('PhieuQuyetToan', 'U') IS NOT NULL DROP TABLE PhieuQuyetToan;
IF OBJECT_ID('GiaiTrinhNgoaiLe', 'U') IS NOT NULL DROP TABLE GiaiTrinhNgoaiLe;
IF OBJECT_ID('ChungTuOCR', 'U') IS NOT NULL DROP TABLE ChungTuOCR;
IF OBJECT_ID('ChiTietKhaiBao', 'U') IS NOT NULL DROP TABLE ChiTietKhaiBao;
IF OBJECT_ID('PhieuKhaiBao', 'U') IS NOT NULL DROP TABLE PhieuKhaiBao;
IF OBJECT_ID('PhieuTamUng', 'U') IS NOT NULL DROP TABLE PhieuTamUng;
IF OBJECT_ID('ChiTietDuToan', 'U') IS NOT NULL DROP TABLE ChiTietDuToan;
IF OBJECT_ID('DeXuatCongTac', 'U') IS NOT NULL DROP TABLE DeXuatCongTac;
IF OBJECT_ID('QuyDinhDinhMuc', 'U') IS NOT NULL DROP TABLE QuyDinhDinhMuc;
IF OBJECT_ID('LoaiChiPhi', 'U') IS NOT NULL DROP TABLE LoaiChiPhi;
IF OBJECT_ID('NhanVien', 'U') IS NOT NULL DROP TABLE NhanVien;
IF OBJECT_ID('PhongBan', 'U') IS NOT NULL DROP TABLE PhongBan;
GO

-- =========================================================================
-- PHẦN I: TẠO 12 BẢNG CƠ SỞ DỮ LIỆU
-- =========================================================================

-- 1. BẢNG PHÒNG BAN (PhongBan)
CREATE TABLE PhongBan (
    MaPB        VARCHAR(20)     NOT NULL,
    TenPB       NVARCHAR(100)   NOT NULL,
    CONSTRAINT PK_PhongBan PRIMARY KEY (MaPB)
);
GO

-- 2. BẢNG NHÂN VIÊN (NhanVien) - BR01: Bắt buộc thuộc 1 phòng ban (NOT NULL)
CREATE TABLE NhanVien (
    MaNV        VARCHAR(20)     NOT NULL,
    MaPB        VARCHAR(20)     NOT NULL,
    HoTen       NVARCHAR(120)   NOT NULL,
    ChucVu      NVARCHAR(50)    NOT NULL,
    Email       VARCHAR(100)    NOT NULL,
    SoTaiKhoan  VARCHAR(20)     NULL,
    MatKhau     NVARCHAR(100)   NOT NULL DEFAULT ('123456'),
    VaiTro      VARCHAR(20)     NOT NULL DEFAULT ('NHAN_VIEN'),
    CONSTRAINT PK_NhanVien PRIMARY KEY (MaNV),
    CONSTRAINT UQ_NhanVien_Email UNIQUE (Email),
    CONSTRAINT FK_NhanVien_PhongBan FOREIGN KEY (MaPB) 
        REFERENCES PhongBan(MaPB) ON UPDATE CASCADE
);
GO

-- 3. BẢNG LOẠI CHI PHÍ (LoaiChiPhi)
CREATE TABLE LoaiChiPhi (
    MaLoaiCP    VARCHAR(20)     NOT NULL,
    TenLoai     NVARCHAR(100)   NOT NULL,
    CONSTRAINT PK_LoaiChiPhi PRIMARY KEY (MaLoaiCP)
);
GO

-- 4. BẢNG QUY ĐỊNH ĐỊNH MỨC (QuyDinhDinhMuc) - BR03: Phiên bản thời gian
CREATE TABLE QuyDinhDinhMuc (
    MaQuyDinh       VARCHAR(20)     NOT NULL,
    MaLoaiCP        VARCHAR(20)     NOT NULL,
    CapBacApDung    NVARCHAR(50)    NOT NULL,
    SoTienToiDa     DECIMAL(18,2)   NOT NULL,
    NgayHieuLuc     DATE            NOT NULL,
    NgayHetHan      DATE            NULL,
    CONSTRAINT PK_QuyDinhDinhMuc PRIMARY KEY (MaQuyDinh),
    CONSTRAINT FK_QuyDinh_LoaiCP FOREIGN KEY (MaLoaiCP) 
        REFERENCES LoaiChiPhi(MaLoaiCP) ON UPDATE CASCADE,
    CONSTRAINT CK_QuyDinh_SoTien CHECK (SoTienToiDa >= 0),
    CONSTRAINT CK_QuyDinh_ThoiGian CHECK (NgayHetHan IS NULL OR NgayHetHan >= NgayHieuLuc)
);
GO

-- 5. BẢNG ĐỀ XUẤT CÔNG TÁC (DeXuatCongTac) - BR04: NgayVe >= NgayDi
CREATE TABLE DeXuatCongTac (
    MaDeXuat            VARCHAR(30)     NOT NULL,
    MaNV                VARCHAR(20)     NOT NULL,
    MucDich             NVARCHAR(250)   NOT NULL,
    NgayDi              DATE            NOT NULL,
    NgayVe              DATE            NOT NULL,
    TrangThai           NVARCHAR(50)    NOT NULL DEFAULT N'Chờ duyệt',
    LyDoTuChoi          NVARCHAR(250)   NULL,
    SoTienTamUngDeNghi  DECIMAL(18,2)   NOT NULL DEFAULT 0,
    CONSTRAINT PK_DeXuatCongTac PRIMARY KEY (MaDeXuat),
    CONSTRAINT FK_DeXuat_NhanVien FOREIGN KEY (MaNV) 
        REFERENCES NhanVien(MaNV),
    CONSTRAINT CK_DeXuat_NgayThang CHECK (NgayVe >= NgayDi),
    CONSTRAINT CK_DeXuat_TienTamUng CHECK (SoTienTamUngDeNghi >= 0)
);
GO

-- 6. BẢNG CHI TIẾT DỰ TOÁN (ChiTietDuToan) - BR05, BR07
CREATE TABLE ChiTietDuToan (
    MaDeXuat        VARCHAR(30)     NOT NULL,
    MaLoaiCP        VARCHAR(20)     NOT NULL,
    SoTienDuKien    DECIMAL(18,2)   NOT NULL,
    LyDoGiaiTrinh   NVARCHAR(250)   NULL, -- Bắt buộc nếu dự toán vượt định mức
    CONSTRAINT PK_ChiTietDuToan PRIMARY KEY (MaDeXuat, MaLoaiCP),
    CONSTRAINT FK_ChiTietDT_DeXuat FOREIGN KEY (MaDeXuat) 
        REFERENCES DeXuatCongTac(MaDeXuat) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietDT_LoaiCP FOREIGN KEY (MaLoaiCP) 
        REFERENCES LoaiChiPhi(MaLoaiCP),
    CONSTRAINT CK_ChiTietDT_SoTien CHECK (SoTienDuKien >= 0)
);
GO

-- 7. BẢNG PHIẾU TẠM ỨNG (PhieuTamUng) - BR12: Quan hệ 1 - 0..1 (UNIQUE MaDeXuat)
CREATE TABLE PhieuTamUng (
    MaTamUng        VARCHAR(30)     NOT NULL,
    MaDeXuat        VARCHAR(30)     NOT NULL,
    MaNVKeToan      VARCHAR(20)     NOT NULL,
    NgayChi         DATETIME        NOT NULL DEFAULT GETDATE(),
    SoTien          DECIMAL(18,2)   NOT NULL,
    CONSTRAINT PK_PhieuTamUng PRIMARY KEY (MaTamUng),
    CONSTRAINT UQ_PhieuTamUng_DeXuat UNIQUE (MaDeXuat),
    CONSTRAINT FK_TamUng_DeXuat FOREIGN KEY (MaDeXuat) 
        REFERENCES DeXuatCongTac(MaDeXuat),
    CONSTRAINT FK_TamUng_KeToan FOREIGN KEY (MaNVKeToan) 
        REFERENCES NhanVien(MaNV),
    CONSTRAINT CK_TamUng_SoTien CHECK (SoTien > 0)
);
GO

-- 8. BẢNG PHIẾU KHAI BÁO (PhieuKhaiBao) - 1 Đề xuất có tối đa 1 Phiếu khai báo
CREATE TABLE PhieuKhaiBao (
    MaKhaiBao       VARCHAR(30)     NOT NULL,
    MaDeXuat        VARCHAR(30)     NOT NULL,
    NgayLap         DATETIME        NOT NULL DEFAULT GETDATE(),
    TrangThai       NVARCHAR(50)    NOT NULL DEFAULT N'Chờ kiểm tra',
    CONSTRAINT PK_PhieuKhaiBao PRIMARY KEY (MaKhaiBao),
    CONSTRAINT UQ_PhieuKhaiBao_DeXuat UNIQUE (MaDeXuat),
    CONSTRAINT FK_KhaiBao_DeXuat FOREIGN KEY (MaDeXuat) 
        REFERENCES DeXuatCongTac(MaDeXuat)
);
GO

-- 9. BẢNG CHI TIẾT KHAI BÁO (ChiTietKhaiBao) - Khoản chi thực tế
CREATE TABLE ChiTietKhaiBao (
    MaCTKB          VARCHAR(30)     NOT NULL,
    MaKhaiBao       VARCHAR(30)     NOT NULL,
    MaLoaiCP        VARCHAR(20)     NOT NULL,
    NgayChi         DATE            NOT NULL,
    SoTienThucTe    DECIMAL(18,2)   NOT NULL,
    TrangThaiHopLe  NVARCHAR(50)    NOT NULL DEFAULT N'Chờ kiểm tra',
    CONSTRAINT PK_ChiTietKhaiBao PRIMARY KEY (MaCTKB),
    CONSTRAINT FK_ChiTietKB_Phieu FOREIGN KEY (MaKhaiBao) 
        REFERENCES PhieuKhaiBao(MaKhaiBao) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietKB_LoaiCP FOREIGN KEY (MaLoaiCP) 
        REFERENCES LoaiChiPhi(MaLoaiCP),
    CONSTRAINT CK_ChiTietKB_SoTien CHECK (SoTienThucTe >= 0)
);
GO

-- 10. BẢNG CHỨNG TỪ OCR (ChungTuOCR) - BR13: Dung lượng file <= 500MB
CREATE TABLE ChungTuOCR (
    MaChungTu       VARCHAR(30)     NOT NULL,
    MaCTKB          VARCHAR(30)     NOT NULL,
    LinkAnh         NVARCHAR(255)   NOT NULL,
    DungLuongMB     DECIMAL(8,2)    NOT NULL DEFAULT 1.0,
    DataBocTach     NVARCHAR(1000)  NULL,
    CONSTRAINT PK_ChungTuOCR PRIMARY KEY (MaChungTu),
    CONSTRAINT UQ_ChungTuOCR_ChiTiet UNIQUE (MaCTKB),
    CONSTRAINT FK_ChungTuOCR_ChiTiet FOREIGN KEY (MaCTKB) 
        REFERENCES ChiTietKhaiBao(MaCTKB) ON DELETE CASCADE,
    CONSTRAINT CK_ChungTuOCR_DungLuong CHECK (DungLuongMB > 0 AND DungLuongMB <= 500.0)
);
GO

-- 11. BẢNG GIẢI TRÌNH NGOẠI LỆ (GiaiTrinhNgoaiLe)
CREATE TABLE GiaiTrinhNgoaiLe (
    MaGiaiTrinh     VARCHAR(30)     NOT NULL,
    MaCTKB          VARCHAR(30)     NOT NULL,
    LyDo            NVARCHAR(250)   NOT NULL,
    KQPheDuyet      NVARCHAR(50)    NOT NULL DEFAULT N'Chờ duyệt ngoại lệ',
    CONSTRAINT PK_GiaiTrinhNgoaiLe PRIMARY KEY (MaGiaiTrinh),
    CONSTRAINT UQ_GiaiTrinh_ChiTiet UNIQUE (MaCTKB),
    CONSTRAINT FK_GiaiTrinh_ChiTiet FOREIGN KEY (MaCTKB) 
        REFERENCES ChiTietKhaiBao(MaCTKB) ON DELETE CASCADE
);
GO

-- 12. BẢNG PHIẾU QUYẾT TOÁN (PhieuQuyetToan) - BR17, BR18, BR19
CREATE TABLE PhieuQuyetToan (
    MaQuyetToan     VARCHAR(30)     NOT NULL,
    MaDeXuat        VARCHAR(30)     NOT NULL,
    MaNVKeToan      VARCHAR(20)     NOT NULL,
    NgayChotSo      DATETIME        NOT NULL DEFAULT GETDATE(),
    TongTienThuc    DECIMAL(18,2)   NOT NULL DEFAULT 0,
    TienBuTru       DECIMAL(18,2)   NOT NULL DEFAULT 0, -- BR18: TongTienThuc - SoTienTamUng
    TrangThai       NVARCHAR(50)    NOT NULL DEFAULT N'Đã chốt sổ',
    CONSTRAINT PK_PhieuQuyetToan PRIMARY KEY (MaQuyetToan),
    CONSTRAINT UQ_PhieuQuyetToan_DeXuat UNIQUE (MaDeXuat),
    CONSTRAINT FK_QuyetToan_DeXuat FOREIGN KEY (MaDeXuat) 
        REFERENCES DeXuatCongTac(MaDeXuat),
    CONSTRAINT FK_QuyetToan_KeToan FOREIGN KEY (MaNVKeToan) 
        REFERENCES NhanVien(MaNV)
);
GO

-- =========================================================================
-- PHẦN II: DỮ LIỆU MẪU ĐẦY ĐỦ 100% CHO 12 BẢNG (KỊCH BẢN CHUYẾN ĐI ĐÀ NẴNG)
-- =========================================================================

-- 1. Phòng ban
INSERT INTO PhongBan (MaPB, TenPB) VALUES 
('PB_IT', N'Phòng Công nghệ Thông tin'),
('PB_KT', N'Phòng Kế toán - Tài chính'),
('PB_KD', N'Phòng Kinh doanh B2B');

-- 2. Nhân viên
INSERT INTO NhanVien (MaNV, MaPB, HoTen, ChucVu, Email, SoTaiKhoan, MatKhau, VaiTro) VALUES 
('NV01', 'PB_IT', N'Nguyễn Văn A', N'Kỹ sư phần mềm Onsite', 'nguyenvana@gmail.com', '190368686868', '123456', 'NHAN_VIEN'),
('QL01', 'PB_IT', N'Trần Văn Sếp', N'Trưởng phòng IT', 'tranvansep@gmail.com', '190399999999', '123456', 'QUAN_LY'),
('KT01', 'PB_KT', N'Lê Thị Kế Toán', N'Kế toán thanh toán', 'lethiketoan@gmail.com', '190311112222', '123456', 'KE_TOAN'),
('ADMIN', 'PB_IT', N'Quản Trị Viên Hệ Thống', N'admin hệ thống', 'admin@gmail.com', '000000000000', '123456', 'ADMIN');

-- 3. Loại chi phí
INSERT INTO LoaiChiPhi (MaLoaiCP, TenLoai) VALUES 
('CP_VEMAYBAY', N'Vé máy bay khứ hồi'),
('CP_KHACHSAN', N'Tiền thuê phòng khách sạn'),
('CP_DIENTHOAI', N'Cước di chuyển & Taxi'),
('CP_TIEPKHACH', N'Chi phí tiếp khách & Ngoại giao');

-- 4. Quy định định mức (BR03)
INSERT INTO QuyDinhDinhMuc (MaQuyDinh, MaLoaiCP, CapBacApDung, SoTienToiDa, NgayHieuLuc, NgayHetHan) VALUES 
('QD01', 'CP_KHACHSAN', N'Nhân viên', 800000, '2026-01-01', '2026-12-31'),
('QD02', 'CP_KHACHSAN', N'Trưởng phòng', 1500000, '2026-01-01', '2026-12-31'),
('QD03', 'CP_TIEPKHACH', N'Nhân viên', 1000000, '2026-01-01', '2026-12-31');

-- 5. Đơn đề xuất công tác (Chuyến đi 5 ngày 4 đêm Đà Nẵng)
INSERT INTO DeXuatCongTac (MaDeXuat, MaNV, MucDich, NgayDi, NgayVe, TrangThai, SoTienTamUngDeNghi) VALUES 
('DX001', 'NV01', N'Triển khai Onsite và nghiệm thu phần mềm tại Đà Nẵng', '2026-11-01', '2026-11-05', N'Đã duyệt', 5000000);

-- 6. Chi tiết dự toán (Tổng dự toán = 2.5tr + 3.2tr + 1.5tr = 7.200.000đ)
INSERT INTO ChiTietDuToan (MaDeXuat, MaLoaiCP, SoTienDuKien, LyDoGiaiTrinh) VALUES 
('DX001', 'CP_VEMAYBAY', 2500000, NULL),
('DX001', 'CP_KHACHSAN', 3200000, NULL), -- 4 đêm x 800k = 3.2tr (Đúng định mức)
('DX001', 'CP_TIEPKHACH', 1500000, N'Ăn tối làm việc với Ban Giám đốc đối tác chốt nghiệm thu'); -- Vượt định mức 1tr -> Giải trình

-- 7. Phiếu tạm ứng (Kế toán chi tạm ứng 5.000.000đ trước ngày đi)
INSERT INTO PhieuTamUng (MaTamUng, MaDeXuat, MaNVKeToan, NgayChi, SoTien) VALUES 
('TU001', 'DX001', 'KT01', '2026-10-30 09:00:00', 5000000);

-- 8. Phiếu khai báo (Đi về nộp hồ sơ ngày 06/11/2026)
INSERT INTO PhieuKhaiBao (MaKhaiBao, MaDeXuat, NgayLap, TrangThai) VALUES 
('KB001', 'DX001', '2026-11-06 14:30:00', N'Đã kiểm tra');

-- 9. Chi tiết khai báo (Tổng thực chi = 7.400.000đ)
INSERT INTO ChiTietKhaiBao (MaCTKB, MaKhaiBao, MaLoaiCP, NgayChi, SoTienThucTe, TrangThaiHopLe) VALUES 
('CTKB01', 'KB001', 'CP_VEMAYBAY',  '2026-11-01', 2450000, N'Hợp lệ'),
('CTKB02', 'KB001', 'CP_KHACHSAN',  '2026-11-05', 3200000, N'Hợp lệ'),
('CTKB03', 'KB001', 'CP_DIENTHOAI', '2026-11-01', 250000,  N'Hợp lệ'),
('CTKB04', 'KB001', 'CP_TIEPKHACH', '2026-11-03', 1500000, N'Hợp lệ (Đặc cách)');

-- 10. Chứng từ OCR (Link ảnh hóa đơn dung lượng <= 500MB và dữ liệu bóc tách)
INSERT INTO ChungTuOCR (MaChungTu, MaCTKB, LinkAnh, DungLuongMB, DataBocTach) VALUES 
('OCR01', 'CTKB01', N'/uploads/2026/11/ve_may_bay_vj01.pdf', 2.4, 
 N'{"SoHD":"VJ-88992","Ngay":"01/11/2026","DonVi":"Vietjet Air","TongTien":2450000,"VAT":222727}'),
('OCR02', 'CTKB02', N'/uploads/2026/11/hd_khachsan_danang.jpg', 4.1, 
 N'{"SoHD":"HD-00291","Ngay":"05/11/2026","DonVi":"Khách sạn Mường Thanh","TongTien":3200000,"VAT":290909}'),
('OCR03', 'CTKB03', N'/uploads/2026/11/bienlai_taxi_mailinh.png', 1.2, 
 N'{"SoHD":"ML-55102","Ngay":"01/11/2026","DonVi":"Taxi Mai Linh ĐN","TongTien":250000,"VAT":0}'),
('OCR04', 'CTKB04', N'/uploads/2026/11/hd_nhahang_madamelan.jpg', 3.5, 
 N'{"SoHD":"MDL-9912","Ngay":"03/11/2026","DonVi":"Nhà Hàng Madame Lân","TongTien":1500000,"VAT":136364}');

-- 11. Giải trình ngoại lệ (Cho khoản tiếp khách 1.5tr)
INSERT INTO GiaiTrinhNgoaiLe (MaGiaiTrinh, MaCTKB, LyDo, KQPheDuyet) VALUES 
('GT001', 'CTKB04', N'Mời cơm làm việc ngoài giờ cùng 3 lãnh đạo đối tác ký biên bản bàn giao giai đoạn 1', N'Đã duyệt đặc cách');

-- 12. Phiếu quyết toán (Chốt sổ ngày 07/11/2026: 7.4tr thực chi - 5tr tạm ứng = +2.4tr)
INSERT INTO PhieuQuyetToan (MaQuyetToan, MaDeXuat, MaNVKeToan, NgayChotSo, TongTienThuc, TienBuTru, TrangThai) VALUES 
('QT001', 'DX001', 'KT01', '2026-11-07 10:15:00', 7400000, 2400000, N'Đã chốt sổ');

GO