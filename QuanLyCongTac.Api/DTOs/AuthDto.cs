namespace QuanLyCongTac.Api.DTOs;

public class LoginRequest
{
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class LoginResponse
{
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string ChucVu { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MaPB { get; set; } = string.Empty;
    public string TenPB { get; set; } = string.Empty;
    public string? SoTaiKhoan { get; set; }
    public string VaiTro { get; set; } = string.Empty;
    public string MatKhau { get; set; } = "123456";
    public string Token { get; set; } = string.Empty;
}

public class UserCreateRequest
{
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string ChucVu { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MaPB { get; set; } = string.Empty;
    public string? SoTaiKhoan { get; set; }
    public string VaiTro { get; set; } = "NHAN_VIEN";
    public string? MatKhau { get; set; } = "123456";
}

public class UserUpdateRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string ChucVu { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MaPB { get; set; } = string.Empty;
    public string? SoTaiKhoan { get; set; }
    public string VaiTro { get; set; } = "NHAN_VIEN";
    public string? MatKhau { get; set; }
}
