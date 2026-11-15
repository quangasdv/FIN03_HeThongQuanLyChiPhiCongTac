namespace QuanLyCongTac.Api.DTOs;

// 1. Phê duyệt đề xuất (gọi sp_PheDuyetDeXuat)
public class PheDuyetRequest
{
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaQuanLy { get; set; } = string.Empty;
    public string HanhDong { get; set; } = "DUYET"; // 'DUYET' hoặc 'TU_CHOI'
    public string? GhiChu { get; set; }
}

// 2. Chi tạm ứng (gọi sp_ChiTamUng)
public class ChiTamUngRequest
{
    public string MaTamUng { get; set; } = string.Empty;
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNVKeToan { get; set; } = string.Empty;
    public decimal SoTienChi { get; set; }
}

// 3. Chốt sổ quyết toán (gọi sp_ChotSoQuyetToan)
public class ChotSoQuyetToanRequest
{
    public string MaQuyetToan { get; set; } = string.Empty;
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNVKeToan { get; set; } = string.Empty;
}

// 4. View tổng hợp quyết toán (gọi vw_TongHopQuyetToan)
public class TongHopQuyetToanViewDto
{
    public string MaQuyetToan { get; set; } = string.Empty;
    public string MaDeXuat { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public string MucDich { get; set; } = string.Empty;
    public string NguoiDiCongTac { get; set; } = string.Empty;
    public string? MaPB { get; set; }
    public string PhongBan { get; set; } = string.Empty;
    public string KeToanChotSo { get; set; } = string.Empty;
    public DateTime NgayChotSo { get; set; }
    public decimal TienTamUng { get; set; }
    public decimal TongChiHopLe { get; set; }
    public decimal TienBuTru { get; set; }
    public string HuongXuLyTaiChinh { get; set; } = string.Empty;
    public string TrangThaiHoSo { get; set; } = string.Empty;
}

// 5. View đối soát chứng từ (gọi vw_ChiTietKhaiBaoChungTu)
public class ChiTietKhaiBaoChungTuViewDto
{
    public string MaCTKB { get; set; } = string.Empty;
    public string MaKhaiBao { get; set; } = string.Empty;
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string TenNhanVien { get; set; } = string.Empty;
    public string MaLoaiCP { get; set; } = string.Empty;
    public string TenLoaiChiPhi { get; set; } = string.Empty;
    public DateTime NgayChi { get; set; }
    public decimal SoTienThucTe { get; set; }
    public string TrangThaiHopLe { get; set; } = string.Empty;
    public string? MaChungTu { get; set; }
    public string? LinkAnh { get; set; }
    public decimal? DungLuongMB { get; set; }
    public string? DataBocTach { get; set; }
    public string? LyDoGiaiTrinhNgoaiLe { get; set; }
    public string? KetQuaDuyetNgoaiLe { get; set; }
}


// 6. Request tạo phiếu khai báo chi phí thực tế & chứng từ OCR (UC09)
public class TaoPhieuKhaiBaoRequest
{
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public List<ChiTietKhaiBaoItemRequest> ChiTiet { get; set; } = new();
}

public class ChiTietKhaiBaoItemRequest
{
    public string? MaCTKB { get; set; }
    public string MaLoaiCP { get; set; } = string.Empty;
    public DateTime NgayChi { get; set; }
    public decimal SoTienThucTe { get; set; }
    public string? LinkAnh { get; set; }
    public decimal DungLuongMB { get; set; } = 1.0m;
    public string? DataBocTach { get; set; }
    public string? LyDoGiaiTrinh { get; set; }
}


// 7. Cấu hình quy định định mức (UC08 - Rule Engine)
public class DinhMucViewDto
{
    public string MaQuyDinh { get; set; } = string.Empty;
    public string MaLoaiCP { get; set; } = string.Empty;
    public string TenLoaiChiPhi { get; set; } = string.Empty;
    public string CapBacApDung { get; set; } = string.Empty;
    public decimal SoTienToiDa { get; set; }
    public DateTime NgayHieuLuc { get; set; }
    public DateTime? NgayHetHan { get; set; }
    public bool ConHieuLuc { get; set; }
}

public class DinhMucCreateRequest
{
    public string MaQuyDinh { get; set; } = string.Empty;
    public string MaLoaiCP { get; set; } = string.Empty;
    public string CapBacApDung { get; set; } = string.Empty;
    public decimal SoTienToiDa { get; set; }
    public DateTime NgayHieuLuc { get; set; }
    public DateTime? NgayHetHan { get; set; }
}

public class DinhMucUpdateRequest
{
    public decimal SoTienToiDa { get; set; }
    public DateTime NgayHieuLuc { get; set; }
    public DateTime? NgayHetHan { get; set; }
}

public class LoaiChiPhiDto
{
    public string MaLoaiCP { get; set; } = string.Empty;
    public string TenLoai { get; set; } = string.Empty;
}

// 8. Phê duyệt ngoại lệ chi phí (UC12 - Quản lý)
public class GiaiTrinhNgoaiLeDto
{
    public string MaGiaiTrinh { get; set; } = string.Empty;
    public string MaCTKB { get; set; } = string.Empty;
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string TenNhanVien { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string TenLoaiChiPhi { get; set; } = string.Empty;
    public DateTime NgayChi { get; set; }
    public decimal SoTienThucTe { get; set; }
    public string LyDo { get; set; } = string.Empty;
    public string KQPheDuyet { get; set; } = string.Empty;
    public string? LinkAnh { get; set; }
    public string? DataBocTach { get; set; }
}

public class PheDuyetNgoaiLeRequest
{
    public string MaGiaiTrinh { get; set; } = string.Empty;
    public string MaQuanLy { get; set; } = string.Empty;
    public string HanhDong { get; set; } = string.Empty; // 'DUYET' hoặc 'TU_CHOI'
    public string? GhiChu { get; set; }
}

// 9. Nhắc nhở duyệt đơn tự động (UC06 - Sơ đồ Trang 19)
public class DonTonDongNhacNhoDto
{
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string TenNhanVien { get; set; } = string.Empty;
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string MucDich { get; set; } = string.Empty;
    public DateTime NgayDi { get; set; }
    public DateTime NgayVe { get; set; }
    public decimal SoTienTamUngDeNghi { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? MaQuanLy { get; set; }
    public string? TenQuanLy { get; set; }
    public string? EmailQuanLy { get; set; }
    public int SoNgayTonDong { get; set; }
    public bool DaQuaHan3Ngay { get; set; }
    public string NoiDungNhacNho { get; set; } = string.Empty;
}

public class KetQuaQuetNhacNhoDto
{
    public DateTime ThoiGianQuet { get; set; } = DateTime.Now;
    public int TongSoDonChoDuyet { get; set; }
    public int SoDonQuaHan3Ngay { get; set; }
    public int SoEmailDaGui { get; set; }
    public List<DonTonDongNhacNhoDto> DanhSachDonQuaHan { get; set; } = new();
    public List<string> NhatKyHoatDong { get; set; } = new();
}

// 10. Kế toán điều chỉnh số tiền chi phí thực tế khi đối soát
public class DieuChinhChiPhiRequest
{
    public decimal SoTienDieuChinh { get; set; }
    public string? GhiChu { get; set; }
}
