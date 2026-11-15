namespace QuanLyCongTac.Api.DTOs;

// Model hứng dữ liệu từ View: vw_DanhSachDeXuat
public class DeXuatViewDto
{
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string TenNhanVien { get; set; } = string.Empty;
    public string? ChucVu { get; set; }
    public string? MaPB { get; set; }
    public string? TenPB { get; set; }
    public string MucDich { get; set; } = string.Empty;
    public DateTime NgayDi { get; set; }
    public DateTime NgayVe { get; set; }
    public int SoNgayCongTac { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? LyDoTuChoi { get; set; }
    public decimal SoTienTamUngDeNghi { get; set; }
    public decimal SoTienTamUngThucTe { get; set; }
    public decimal TongKinhPhiDuToan { get; set; }
    public decimal TongThucChi { get; set; }
    public decimal TienBuTru { get; set; }
}

// Model nhận dữ liệu từ Frontend để gọi SP: sp_TaoDeXuatVaDuToan hoặc Lưu Bản Nháp
public class TaoDeXuatRequest
{
    public string MaDeXuat { get; set; } = string.Empty;
    public string MaNV { get; set; } = string.Empty;
    public string MucDich { get; set; } = string.Empty;
    public DateTime NgayDi { get; set; }
    public DateTime NgayVe { get; set; }
    public decimal SoTienTamUngDeNghi { get; set; }
    public string? TrangThai { get; set; } = "Chờ duyệt"; // "Bản nháp" hoặc "Chờ duyệt"
    public List<ChiTietDuToanItemRequest> ChiTiet { get; set; } = new();
}

public class ChiTietDuToanItemRequest
{
    public string MaLoaiCP { get; set; } = string.Empty;
    public string? TenLoaiChiPhi { get; set; }
    public decimal SoTienDuKien { get; set; }
    public string? LyDoGiaiTrinh { get; set; }
}

public class DeXuatDetailDto
{
    public DeXuatViewDto DeXuat { get; set; } = new();
    public List<ChiTietDuToanItemRequest> ChiTiet { get; set; } = new();
}
