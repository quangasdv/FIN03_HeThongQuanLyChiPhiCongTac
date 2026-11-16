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
    MatKhau     NVARCHAR(100)   NOT NULL DEFAULT ('123123'),
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
    LinkAnh         NVARCHAR(MAX)   NOT NULL,
    DungLuongMB     DECIMAL(8,2)    NOT NULL DEFAULT 1.0,
    DataBocTach     NVARCHAR(MAX)   NULL,
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
-- PHẦN II: DỮ LIỆU MẪU ĐẦY ĐỦ 100% CHO 12 BẢNG (ĐÃ TÍCH HỢP TẤT CẢ HỒ SƠ)
-- =========================================================================

-- 1. Phòng ban
INSERT INTO PhongBan (MaPB, TenPB) VALUES 
(N'PB_IT', N'Phòng Công nghệ Thông tin'),
(N'PB_KD', N'Phòng Kinh doanh B2B'),
(N'PB_KT', N'Phòng Kế toán - Tài chính');

-- 2. Nhân viên
INSERT INTO NhanVien (MaNV, MaPB, HoTen, ChucVu, Email, SoTaiKhoan, MatKhau, VaiTro) VALUES 
(N'ADMIN', N'PB_IT', N'Nguyễn Đăng Quang', N'Admin Hệ Thống', N'admin@gmail.com', N'000000000000', N'123123', N'ADMIN'),
(N'KT01', N'PB_KT', N'Lê Thị Thu', N'Kế toán thanh toán', N'lethithu@gmail.com', N'190311112222', N'123123', N'KE_TOAN'),
(N'NV01', N'PB_IT', N'Nguyễn Văn Thuận', N'Kỹ sư phần mềm Onsite', N'nguyenvanthuan@gmail.com', N'190368686868', N'123123', N'NHAN_VIEN'),
(N'NV02', N'PB_KT', N'Nguyễn Minh Tài', N'', N'nguyenminhtai@gmail.com', N'', N'123123', N'NHAN_VIEN'),
(N'QL01', N'PB_IT', N'Trần Định', N'Trưởng phòng IT', N'trandinh@gmail.com', N'190399999999', N'123123', N'QUAN_LY');

-- 3. Loại chi phí
INSERT INTO LoaiChiPhi (MaLoaiCP, TenLoai) VALUES 
(N'CP_DIENTHOAI', N'Cước di chuyển & Taxi'),
(N'CP_KHACHSAN', N'Tiền thuê phòng khách sạn'),
(N'CP_TIEPKHACH', N'Chi phí tiếp khách & Ngoại giao'),
(N'CP_VEMAYBAY', N'Vé máy bay khứ hồi');

-- 4. Quy định định mức
INSERT INTO QuyDinhDinhMuc (MaQuyDinh, MaLoaiCP, CapBacApDung, SoTienToiDa, NgayHieuLuc, NgayHetHan) VALUES 
(N'QD01', N'CP_KHACHSAN', N'Tất cả nhân viên', 9000000, '2026-01-01', '2027-11-30'),
(N'QD02', N'CP_VEMAYBAY', N'Tất cả nhân viên', 3000000, '2026-11-15', '2027-11-16'),
(N'QD03', N'CP_TIEPKHACH', N'Tất cả nhân viên', 5000000, '2026-01-01', '2027-11-30'),
(N'QD04', N'CP_DIENTHOAI', N'Tất cả nhân viên', 500000, '2026-11-15', '2027-01-04');

-- 5. Đơn đề xuất công tác
INSERT INTO DeXuatCongTac (MaDeXuat, MaNV, MucDich, NgayDi, NgayVe, TrangThai, LyDoTuChoi, SoTienTamUngDeNghi) VALUES 
(N'DX_261115_1073', N'NV01', N'Kí hợp đồng đối tác HCM', '2026-11-17', '2026-12-03', N'Đã chốt sổ', NULL, 3500000),
(N'DX_261115_2404', N'NV01', N'Khảo sát khách hàng HCM', '2026-11-15', '2026-11-20', N'Đã hủy', NULL, 0),
(N'DX_261115_4021', N'NV01', N'Khảo sát hiện trường TPHCM', '2026-11-19', '2026-12-01', N'Từ chối', N'', 5000000),
(N'DX_261115_4269', N'NV01', N'Khảo sát hiện trường TPHCM', '2026-11-19', '2026-12-01', N'Từ chối', N'', 5000000),
(N'DX_261115_4986', N'NV01', N'Test', '2026-11-25', '2026-11-30', N'Chờ duyệt', NULL, 10000000),
(N'DX_261115_5065', N'NV01', N'Khảo sát khách hàng HCM', '2026-11-15', '2026-11-20', N'Đã chốt sổ', NULL, 3500000),
(N'DX_261115_5269', N'NV01', N'Khảo sát hiện trạng Nha Trang', '2026-11-16', '2026-11-19', N'Đã hủy', NULL, 1700000),
(N'DX_261115_5862', N'NV01', N'Tham dự hội thảo Đà Lạt', '2026-11-15', '2026-11-15', N'Từ chối', N'', 700000),
(N'DX_261115_5870', N'NV01', N'Khảo sát hiện trường TPHCM', '2026-11-19', '2026-12-01', N'Từ chối', N'', 5000000),
(N'DX_261115_5893555555', N'NV01', N'Khảo sát hiện trường TPHCM', '2026-11-19', '2026-12-01', N'Đã hủy', NULL, 5000000),
(N'DX_261115_7473', N'NV01', N'Khảo sát hiện trường Suối Tiên', '2026-11-16', '2026-11-30', N'Từ chối', N'', 0),
(N'DX_261115_8282', N'NV01', N'Khảo sát hiện trường TPHCM', '2026-11-19', '2026-12-01', N'Đã hủy', NULL, 4000000),
(N'DX_261116_1683', N'NV01', N'Khảo sát hiện trạng Suối Tiên', '2026-11-18', '2026-11-29', N'Đã chốt sổ', NULL, 4500000),
(N'DX001', N'NV01', N'Triển khai Onsite và nghiệm thu phần mềm tại Đà Nẵng', '2026-11-01', '2026-11-05', N'Đã duyệt', NULL, 5000000);

-- 6. Chi tiết dự toán
INSERT INTO ChiTietDuToan (MaDeXuat, MaLoaiCP, SoTienDuKien, LyDoGiaiTrinh) VALUES 
(N'DX_261115_1073', N'CP_DIENTHOAI', 500000, N''),
(N'DX_261115_1073', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261115_1073', N'CP_VEMAYBAY', 2000000, N''),
(N'DX_261115_2404', N'CP_DIENTHOAI', 500000, N''),
(N'DX_261115_2404', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261115_2404', N'CP_VEMAYBAY', 2000000, N''),
(N'DX_261115_4021', N'CP_KHACHSAN', 1000000, NULL),
(N'DX_261115_4021', N'CP_VEMAYBAY', 3000000, NULL),
(N'DX_261115_4269', N'CP_KHACHSAN', 1000000, NULL),
(N'DX_261115_4269', N'CP_VEMAYBAY', 3000000, NULL),
(N'DX_261115_4986', N'CP_VEMAYBAY', 10000000, N''),
(N'DX_261115_5065', N'CP_DIENTHOAI', 500000, N''),
(N'DX_261115_5065', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261115_5065', N'CP_VEMAYBAY', 2000000, N''),
(N'DX_261115_5269', N'CP_DIENTHOAI', 700000, N'Giá taxi khu du lịch tăng'),
(N'DX_261115_5269', N'CP_VEMAYBAY', 1000000, N''),
(N'DX_261115_5862', N'CP_DIENTHOAI', 700000, N'Giá taxi khu du lịch tăng'),
(N'DX_261115_5870', N'CP_KHACHSAN', 1000000, NULL),
(N'DX_261115_5870', N'CP_VEMAYBAY', 3000000, NULL),
(N'DX_261115_5893555555', N'CP_KHACHSAN', 1000000, NULL),
(N'DX_261115_5893555555', N'CP_VEMAYBAY', 3000000, NULL),
(N'DX_261115_7473', N'CP_DIENTHOAI', 500000, N''),
(N'DX_261115_7473', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261115_7473', N'CP_VEMAYBAY', 3000000, N''),
(N'DX_261115_8282', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261115_8282', N'CP_VEMAYBAY', 3000000, N''),
(N'DX_261116_1683', N'CP_DIENTHOAI', 500000, N''),
(N'DX_261116_1683', N'CP_KHACHSAN', 1000000, N''),
(N'DX_261116_1683', N'CP_VEMAYBAY', 3000000, N''),
(N'DX001', N'CP_KHACHSAN', 3200000, NULL),
(N'DX001', N'CP_TIEPKHACH', 1500000, N'Ăn tối làm việc với Ban Giám đốc đối tác chốt nghiệm thu'),
(N'DX001', N'CP_VEMAYBAY', 2500000, NULL);

-- 7. Phiếu tạm ứng
INSERT INTO PhieuTamUng (MaTamUng, MaDeXuat, MaNVKeToan, NgayChi, SoTien) VALUES 
(N'TU_1103_525', N'DX_261116_1683', N'KT01', '2026-11-16 07:16:02', 4500000),
(N'TU_2819_244', N'DX_261115_5065', N'KT01', '2026-11-15 21:46:46', 3500000),
(N'TU_8754_873', N'DX_261115_1073', N'KT01', '2026-11-16 04:14:20', 3500000),
(N'TU001', N'DX001', N'KT01', '2026-10-30 09:00:00', 5000000);

-- 8. Phiếu khai báo
INSERT INTO PhieuKhaiBao (MaKhaiBao, MaDeXuat, NgayLap, TrangThai) VALUES 
(N'KB_20261115214840', N'DX_261115_5065', '2026-11-15 21:48:40', N'Chờ kiểm tra'),
(N'KB_20261116054350', N'DX_261115_1073', '2026-11-16 05:43:50', N'Chờ kiểm tra'),
(N'KB_20261116071650', N'DX_261116_1683', '2026-11-16 07:16:50', N'Chờ kiểm tra'),
(N'KB001', N'DX001', '2026-11-06 14:30:00', N'Đã kiểm tra');

-- 9. Chi tiết khai báo
INSERT INTO ChiTietKhaiBao (MaCTKB, MaKhaiBao, MaLoaiCP, NgayChi, SoTienThucTe, TrangThaiHopLe) VALUES 
(N'CTKB_3c7f96_1', N'KB_20261115214840', N'CP_DIENTHOAI', '2026-11-15', 420800, N'Hợp lệ'),
(N'CTKB_3c7f96_2', N'KB_20261115214840', N'CP_VEMAYBAY', '2026-11-15', 3600000, N'Hợp lệ'),
(N'CTKB_5d3b8e_1', N'KB_20261116054350', N'CP_DIENTHOAI', '2026-11-18', 124000, N'Hợp lệ'),
(N'CTKB_fdd5b2_1', N'KB_20261116071650', N'CP_VEMAYBAY', '2026-11-18', 3600000, N'Hợp lệ (Đặc cách)'),
(N'CTKB01', N'KB001', N'CP_VEMAYBAY', '2026-11-01', 2450000, N'Hợp lệ'),
(N'CTKB02', N'KB001', N'CP_KHACHSAN', '2026-11-05', 3200000, N'Hợp lệ'),
(N'CTKB03', N'KB001', N'CP_DIENTHOAI', '2026-11-01', 250000, N'Hợp lệ'),
(N'CTKB04', N'KB001', N'CP_TIEPKHACH', '2026-11-03', 1500000, N'Hợp lệ (Đặc cách)');

-- 10. Chứng từ OCR
INSERT INTO ChungTuOCR (MaChungTu, MaCTKB, LinkAnh, DungLuongMB, DataBocTach) VALUES 
(N'CT_3c7f96_1', N'CTKB_3c7f96_1', N'/uploads/invoices/CTKB_3c7f96_1_20261115214840.png', 0.22, N'{"DonVi":"Công ty CP Ánh Dương Việt Nam (Vinasun Taxi)","Ngay":"2025-10-02","TongTien":420800,"VAT":"","RawText":"End: Oct 03, 2025 07:52 AM\nPeriod : 53:24 win\nInitial : 20.00\nDistance 13.0 k 360.00\nWaiting 13:36 ® 40.60\n+Haoh lethdch | .00\nTotal : 420.80\nLưu y : co gia tri xuất hoa don\ngtgt trong ngay phat sinh\n...9 (HP\nTai : VI88. Lui\nVv: sg13997\nBien so xe : SO0E-\n56588\nwI: 03 02 035520\nSeri : v\n1/6.-203/11)/092)\nCam ơn quy khách, hen gap lai\nReceived with thanks\nLai xe/Driver Khachhang/Pasenger\nKy, ghi ten Ky, ghi\nten\n(Signature) ) (Signature\nI 39990404 AAS ám\n"}'),
(N'CT_3c7f96_2', N'CTKB_3c7f96_2', N'/uploads/invoices/CTKB_3c7f96_2_20261115214840.webp', 0.06, N'{"DonVi":"Công ty Cổ phần Hàng không Vietjet (Vietjet Air)","Ngay":"2026-11-15","TongTien":3600000,"VAT":"10%","RawText":"l4 Đông, thành phd Ha Nội. kh ba hi TY rey me khí\n1. Tiền vé (Due to VietJetAir)\n1.1 Giá cước (Air fare)\nSố vé Chuyénbay  Hanhtrinh Loại vó Số lượng Đơn giá Thành tién Loại tiền\n(PNR) (FigniNo)  (Route). (Farewpe),.....(Quantty).... (Umtpnce) (Amount) (Cu)\n58025297 VJ122 SGN-HAN K_Eco- Eco 1 1,410,000 1.410000 VND\n58025297 VJ167 HAN-SGN  K_Eco- Eco 1 1,410,000 1,410,000 VND\n1.2 Các loại phi dịch vu (Other charge) 280,000 VND\n1.3 Hoàn hủy vé máy bay (Refund amount) 0 VND\n1.4 Thué GTGT 10% (Value Added Tax) 310,000 VND\n1 Tăng s tần cha bo gb khoán hunt cla nhà chức vic 410000 VAO\n2. Khoản thu hộ của nhà chức trách (Authorized collection) 190,000 VND\nTổng cộng (Grand amount) 3,600,000 VND\nĐiều chỉnh giảm (Total refund amount) 0 VND\n3. Hình thức thanh toán (Payment method)\nTM/CK (Cash/Cheque) 3,600,000 VND\nViết bằng chữ (Amount in words) Batigusautrdmnghinddng mm\n"}'),
(N'CT_5d3b8e_1', N'CTKB_5d3b8e_1', N'/uploads/invoices/CTKB_5d3b8e_1_20261116054350.png', 0.17, N'{"DonVi":"Taxi Yên Bái","Ngay":"2024-08-02","TongTien":124000,"VAT":"","RawText":"YEN BAI\nSONHOA.SCOTAT\nBIEN LAI CUOC TAXI\ntaxi yen bai\nDia chi: to 33, duong nguyen\nphuc, tp yen bai\nDien thoai: 0293.86.86.86\nBien so xe: 21A-04824\nGio len xe : 08:52-02/08/2024\nGio xuong xe: 09:04-02/08/2024\nThoi gian cho: 0:01 phut\nKm chuyen di: 8.64 km\nSo tien theo km: 124.000 Vnd\nDon gia t/g cho: 40.000\nVnd/h\nTong tien cuoc: 124.000 Vnd\ncam on quy khach da su dung\ndich vu cua taxi yen bai\nhen gap lai quy khach lan sau\nLai xe\n(ky va ghi ro ho ten)"}'),
(N'CT_fdd5b2_1', N'CTKB_fdd5b2_1', N'/uploads/invoices/CTKB_fdd5b2_1_20261116071650.webp', 0.06, N'{"DonVi":"VietJetAir","Ngay":"2026-11-18","TongTien":3600000,"VAT":"10%","RawText":"Định chỉ (Address): số 18, tô 6, ngò 133, phô Phùng Hưng, phường Phúc La, quận Đông, thành phố Hà Nội\n1. Tiền vé (Due to VietJetAir)\n1.1 Giá cước (Air fare)\nSố vé (PNR) | Chuyến bay (FlightNo) | Hành trình (Route) | Loại vé (Fare type) | Số lượng (Quantity) | Đơn giá (Unit price) | Thành tiền (Amount) | Loại tiền (Currency)\n58025297 | VJ122 | SGN-HAN | K_Eco - Eco | 1 | 1,410,000 | 1,410,000 | VND\n58025297 | VJ167 | HAN-SGN | K_Eco - Eco | 1 | 1,410,000 | 1,410,000 | VND\n1.2 Các loại phí dịch vụ (Other charge) | 280,000 | VND\n1.3 Hoàn hủy vé máy bay (Refund amount) | 0 | VND\n1.4 Thuế GTGT 10% (Value Added Tax) | 310,000 | VND\n1.5 Tổng số tiền chưa bao gồm khoản thu hộ của nhà chức trách (Total amount excluding authorized collection) | 3,410,000 | VND\n2. Khoản thu hộ của nhà chức trách (Authorized collection) | 190,000 | VND\nTổng cộng (Grand amount) | 3,600,000 | VND\nĐiều chỉnh giảm (Total refund amount) | 0 | VND\n3. Hình thức thanh toán (Payment method)\nTM/CK (Cash/Cheque) | 3,600,000 | VND\nViết bằng chữ (Amount in words) | Ba triệu sáu trăm nghìn đồng"}'),
(N'OCR01', N'CTKB01', N'/HoaDonThucTe/xuat-hoa-don-ve-may-bay-3.webp', 2.4, N'{"DonVi":"Vietnam Airlines","Ngay":"20/11/2026","TongTien":2450000,"VAT":222727,"SoHD":"HD-VNA-9821","RawText":"TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM\nVé máy bay điện tử khứ hồi TP.HCM - Hà Nội\nKhách hàng: Nguyễn Văn Thuận\nGiá vé: 2.227.273 VNĐ\nThuế VAT: 222.727 VNĐ\nTổng thanh toán: 2.450.000 VNĐ"}'),
(N'OCR02', N'CTKB02', N'/HoaDonThucTe/1728633765023.png', 4.1, N'{"DonVi":"Khách Sạn Mường Thanh Grand","Ngay":"23/11/2026","TongTien":2500000,"VAT":227273,"SoHD":"HD-KS-5510","RawText":"KHÁCH SẠN MƯỜNG THANH GRAND\nHóa đơn dịch vụ lưu trú công tác\nTiền phòng: 2.272.727 VNĐ\nThuế VAT: 227.273 VNĐ\nTổng thanh toán: 2.500.000 VNĐ"}'),
(N'OCR03', N'CTKB03', N'/HoaDonThucTe/02_vinasun_taxi_real.png', 1.2, N'{"DonVi":"Công Ty CP Ánh Dương Việt Nam (Vinasun Taxi)","Ngay":"28/06/2027","TongTien":161500,"VAT":14682,"SoHD":"HD-VNS-8831","RawText":"VINASUN TAXI\nCước phí taxi đưa đón sân bay và hội thảo\nCự ly: 9.8 km - Đơn giá: 15.000 đ/km\nCộng tiền dịch vụ: 146.818 VNĐ\nThuế GTGT: 14.682 VNĐ\nTổng tiền thanh toán: 161.500 VNĐ"}'),
(N'OCR04', N'CTKB04', N'/HoaDonThucTe/1759803237-w-bill-3583-width975height1200.jpg', 3.5, N'{"DonVi":"Nhà Hàng Ẩm Thực Sông Hàn","Ngay":"22/11/2026","TongTien":1500000,"VAT":136364,"SoHD":"HD-NH-4412","RawText":"NHÀ HÀNG ẨM THỰC SÔNG HÀN\nHóa đơn thanh toán bàn tiệc tiếp khách đối tác\nTiền món ăn: 1.363.636 VNĐ\nThuế VAT: 136.364 VNĐ\nTổng thanh toán: 1.500.000 VNĐ"}');

-- 11. Giải trình ngoại lệ
INSERT INTO GiaiTrinhNgoaiLe (MaGiaiTrinh, MaCTKB, LyDo, KQPheDuyet) VALUES 
(N'GT_fdd5b2_2', N'CTKB_fdd5b2_1', N'Hết vé thường', N'Đã duyệt đặc cách'),
(N'GT001', N'CTKB04', N'Mời cơm làm việc ngoài giờ cùng 3 lãnh đạo đối tác ký biên bản bàn giao giai đoạn 1', N'Đã duyệt đặc cách');

-- 12. Phiếu quyết toán
INSERT INTO PhieuQuyetToan (MaQuyetToan, MaDeXuat, MaNVKeToan, NgayChotSo, TongTienThuc, TienBuTru, TrangThai) VALUES 
(N'QT_0192_783', N'DX_261115_1073', N'KT01', '2026-11-16 05:48:50', 124000, -3376000, N'Đã chốt sổ'),
(N'QT_3391_166', N'DX_261116_1683', N'KT01', '2026-11-16 07:18:23', 3600000, -900000, N'Đã chốt sổ'),
(N'QT_9211_364', N'DX_261115_5065', N'KT01', '2026-11-15 21:49:59', 4020800, 520800, N'Đã chốt sổ'),
(N'QT001', N'DX001', N'KT01', '2026-11-07 10:15:00', 7400000, 2400000, N'Đã chốt sổ');

GO
