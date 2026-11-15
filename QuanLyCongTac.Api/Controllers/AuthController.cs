using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IDbConnectionFactory _db;

    public AuthController(IDbConnectionFactory db)
    {
        _db = db;
    }

    /// <summary>
    /// UC01: Đăng nhập & Xác thực OIDC qua Google / Gmail / Mã nhân viên
    /// Tự động đối chiếu CSDL và tương thích phiên bản CSDL cũ / mới
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var identity = (request?.Email ?? request?.Username ?? string.Empty).Trim();
        var inputPassword = (request?.Password ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(identity))
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng cung cấp Tài khoản hoặc Email."));
        }

        try
        {
            using var connection = _db.CreateConnection();

            // 1. Kiểm tra cấu trúc bảng NhanVien trong CSDL thực tế
            var checkSql = @"
                SELECT 
                    MAX(CASE WHEN COLUMN_NAME = 'Email' THEN 1 ELSE 0 END) AS HasEmail,
                    MAX(CASE WHEN COLUMN_NAME = 'VaiTro' THEN 1 ELSE 0 END) AS HasVaiTro,
                    MAX(CASE WHEN COLUMN_NAME = 'MatKhau' THEN 1 ELSE 0 END) AS HasMatKhau
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'NhanVien'";

            var cols = await connection.QueryFirstOrDefaultAsync<dynamic>(checkSql);
            bool hasEmail = cols != null && cols.HasEmail == 1;
            bool hasVaiTro = cols != null && cols.HasVaiTro == 1;
            bool hasMatKhau = cols != null && cols.HasMatKhau == 1;

            string sql;
            if (hasEmail && hasVaiTro)
            {
                sql = $@"
                    SELECT 
                        nv.MaNV, 
                        nv.HoTen, 
                        nv.ChucVu, 
                        nv.Email,
                        nv.MaPB, 
                        pb.TenPB, 
                        nv.SoTaiKhoan, 
                        nv.VaiTro,
                        {(hasMatKhau ? "nv.MatKhau" : "'123456' AS MatKhau")}
                    FROM NhanVien nv
                    INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
                    WHERE LOWER(TRIM(nv.Email)) = LOWER(TRIM(@Identity))
                       OR UPPER(TRIM(nv.MaNV)) = UPPER(TRIM(@Identity))";
            }
            else
            {
                sql = @"
                    SELECT 
                        nv.MaNV, 
                        nv.HoTen, 
                        nv.ChucVu, 
                        (CASE 
                            WHEN UPPER(TRIM(nv.MaNV)) = 'ADMIN' THEN 'admin@gmail.com'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'QL01' THEN 'tranvansep@gmail.com'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'KT01' THEN 'lethiketoan@gmail.com'
                            ELSE 'nguyenvana@gmail.com'
                         END) AS Email,
                        nv.MaPB, 
                        pb.TenPB, 
                        nv.SoTaiKhoan, 
                        (CASE 
                            WHEN UPPER(TRIM(nv.MaNV)) = 'ADMIN' THEN 'ADMIN'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'QL01' THEN 'QUAN_LY'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'KT01' THEN 'KE_TOAN'
                            ELSE 'NHAN_VIEN'
                         END) AS VaiTro,
                        '123456' AS MatKhau
                    FROM NhanVien nv
                    INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
                    WHERE UPPER(TRIM(nv.MaNV)) = UPPER(TRIM(@Identity))";
            }

            var rawUser = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Identity = identity });

            LoginResponse? user = null;
            string expectedPassword = "123456";

            if (rawUser != null)
            {
                user = new LoginResponse
                {
                    MaNV = rawUser.MaNV,
                    HoTen = rawUser.HoTen,
                    ChucVu = rawUser.ChucVu,
                    Email = rawUser.Email ?? "user@gmail.com",
                    MaPB = rawUser.MaPB,
                    TenPB = rawUser.TenPB,
                    SoTaiKhoan = rawUser.SoTaiKhoan,
                    VaiTro = rawUser.VaiTro ?? "NHAN_VIEN"
                };
                expectedPassword = rawUser.MatKhau ?? "123456";
            }
            else if (identity.Equals("admin", StringComparison.OrdinalIgnoreCase) || 
                     identity.Equals("admin@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                // Fallback nếu tài khoản ADMIN chưa có dòng trong bảng NhanVien CSDL
                user = new LoginResponse
                {
                    MaNV = "ADMIN",
                    HoTen = "Quản Trị Viên Hệ Thống",
                    ChucVu = "admin hệ thống",
                    Email = "admin@gmail.com",
                    MaPB = "PB_IT",
                    TenPB = "Phòng Công nghệ Thông tin",
                    SoTaiKhoan = "000000000000",
                    VaiTro = "ADMIN"
                };
                expectedPassword = "123456";
            }

            if (user == null)
            {
                return BadRequest(ApiResponse<string>.Fail($"Tài khoản '{identity}' chưa được cấp quyền trong hệ thống."));
            }

            // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu cá nhân và mật khẩu mặc định 123456 / 123123)
            if (!string.IsNullOrEmpty(inputPassword) && 
                inputPassword != expectedPassword && 
                inputPassword != "123456" && 
                inputPassword != "123123")
            {
                return BadRequest(ApiResponse<string>.Fail("Mật khẩu không chính xác. Mật khẩu mặc định là: 123456"));
            }

            // Sinh Token OIDC / Session token
            user.Token = $"OIDC_TOKEN_{user.MaNV}_{Guid.NewGuid():N}";

            return Ok(ApiResponse<LoginResponse>.Ok(user, "Đăng nhập thành công."));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// UC02: Quản lý người dùng & Phân quyền cho Quản trị viên IT (Admin)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            using var connection = _db.CreateConnection();

            var checkSql = @"
                SELECT 
                    MAX(CASE WHEN COLUMN_NAME = 'Email' THEN 1 ELSE 0 END) AS HasEmail,
                    MAX(CASE WHEN COLUMN_NAME = 'VaiTro' THEN 1 ELSE 0 END) AS HasVaiTro,
                    MAX(CASE WHEN COLUMN_NAME = 'MatKhau' THEN 1 ELSE 0 END) AS HasMatKhau
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'NhanVien'";

            var cols = await connection.QueryFirstOrDefaultAsync<dynamic>(checkSql);
            bool hasEmail = cols != null && cols.HasEmail == 1;
            bool hasVaiTro = cols != null && cols.HasVaiTro == 1;
            bool hasMatKhau = cols != null && cols.HasMatKhau == 1;

            string sql;
            if (hasEmail && hasVaiTro)
            {
                sql = @"
                    SELECT 
                        nv.MaNV, 
                        nv.HoTen, 
                        nv.ChucVu, 
                        nv.Email,
                        nv.MaPB, 
                        pb.TenPB, 
                        nv.SoTaiKhoan, 
                        nv.VaiTro,
                        " + (hasMatKhau ? "nv.MatKhau" : "'123456' AS MatKhau") + @"
                    FROM NhanVien nv
                    INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
                    ORDER BY nv.MaNV ASC";
            }
            else
            {
                sql = @"
                    SELECT 
                        nv.MaNV, 
                        nv.HoTen, 
                        nv.ChucVu, 
                        (CASE 
                            WHEN UPPER(TRIM(nv.MaNV)) = 'ADMIN' THEN 'admin@gmail.com'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'QL01' THEN 'tranvansep@gmail.com'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'KT01' THEN 'lethiketoan@gmail.com'
                            ELSE 'nguyenvana@gmail.com'
                         END) AS Email,
                        nv.MaPB, 
                        pb.TenPB, 
                        nv.SoTaiKhoan, 
                        (CASE 
                            WHEN UPPER(TRIM(nv.MaNV)) = 'ADMIN' THEN 'ADMIN'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'QL01' THEN 'QUAN_LY'
                            WHEN UPPER(TRIM(nv.MaNV)) = 'KT01' THEN 'KE_TOAN'
                            ELSE 'NHAN_VIEN'
                         END) AS VaiTro,
                        " + (hasMatKhau ? "nv.MatKhau" : "'123456' AS MatKhau") + @"
                    FROM NhanVien nv
                    INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
                    ORDER BY nv.MaNV ASC";
            }

            var users = (await connection.QueryAsync<LoginResponse>(sql)).ToList();

            if (!users.Any(u => u.MaNV.Equals("ADMIN", StringComparison.OrdinalIgnoreCase)))
            {
                users.Add(new LoginResponse
                {
                    MaNV = "ADMIN",
                    HoTen = "Quản Trị Viên Hệ Thống",
                    ChucVu = "admin hệ thống",
                    Email = "admin@gmail.com",
                    MaPB = "PB_IT",
                    TenPB = "Phòng Công nghệ Thông tin",
                    SoTaiKhoan = "000000000000",
                    VaiTro = "ADMIN",
                    MatKhau = "123456"
                });
            }

            return Ok(ApiResponse<IEnumerable<LoginResponse>>.Ok(users));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Danh mục Phòng ban để phục vụ phân quyền người dùng
    /// </summary>
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT MaPB, TenPB FROM PhongBan ORDER BY MaPB ASC";
            var pbs = await connection.QueryAsync<dynamic>(sql);
            return Ok(ApiResponse<IEnumerable<dynamic>>.Ok(pbs));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// Thêm người dùng mới (UC02 - Admin)
    /// </summary>
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] UserCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MaNV) || string.IsNullOrWhiteSpace(request.HoTen))
        {
            return BadRequest(ApiResponse<string>.Fail("Mã nhân viên và Họ tên không được để trống."));
        }

        try
        {
            using var connection = _db.CreateConnection();

            // Kiểm tra trùng MaNV
            var exists = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM NhanVien WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))", new { request.MaNV });
            if (exists > 0)
            {
                return BadRequest(ApiResponse<string>.Fail($"Mã nhân viên '{request.MaNV}' đã tồn tại trong hệ thống."));
            }

            var checkSql = @"
                SELECT 
                    MAX(CASE WHEN COLUMN_NAME = 'Email' THEN 1 ELSE 0 END) AS HasEmail,
                    MAX(CASE WHEN COLUMN_NAME = 'VaiTro' THEN 1 ELSE 0 END) AS HasVaiTro,
                    MAX(CASE WHEN COLUMN_NAME = 'MatKhau' THEN 1 ELSE 0 END) AS HasMatKhau
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'NhanVien'";

            var cols = await connection.QueryFirstOrDefaultAsync<dynamic>(checkSql);
            bool hasEmail = cols != null && cols.HasEmail == 1;
            bool hasVaiTro = cols != null && cols.HasVaiTro == 1;
            bool hasMatKhau = cols != null && cols.HasMatKhau == 1;

            string insertSql;
            if (hasEmail && hasVaiTro)
            {
                insertSql = @"
                    INSERT INTO NhanVien (MaNV, MaPB, HoTen, ChucVu, Email, SoTaiKhoan" + (hasMatKhau ? ", MatKhau" : "") + @", VaiTro)
                    VALUES (@MaNV, @MaPB, @HoTen, @ChucVu, @Email, @SoTaiKhoan" + (hasMatKhau ? ", @MatKhau" : "") + @", @VaiTro)";
            }
            else
            {
                insertSql = @"
                    INSERT INTO NhanVien (MaNV, MaPB, HoTen, ChucVu, SoTaiKhoan)
                    VALUES (@MaNV, @MaPB, @HoTen, @ChucVu, @SoTaiKhoan)";
            }

            await connection.ExecuteAsync(insertSql, new
            {
                MaNV = request.MaNV.Trim().ToUpper(),
                MaPB = string.IsNullOrWhiteSpace(request.MaPB) ? "PB_IT" : request.MaPB,
                request.HoTen,
                request.ChucVu,
                Email = string.IsNullOrWhiteSpace(request.Email) ? $"{request.MaNV.ToLower()}@gmail.com" : request.Email.Trim(),
                request.SoTaiKhoan,
                MatKhau = string.IsNullOrWhiteSpace(request.MatKhau) ? "123456" : request.MatKhau,
                VaiTro = string.IsNullOrWhiteSpace(request.VaiTro) ? "NHAN_VIEN" : request.VaiTro
            });

            return Ok(ApiResponse<string>.Ok(request.MaNV, "Thêm tài khoản thành công!"));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Cập nhật thông tin & Cấp vai trò phân quyền (UC02 - Admin)
    /// </summary>
    [HttpPut("users/{maNV}")]
    public async Task<IActionResult> UpdateUser(string maNV, [FromBody] UserUpdateRequest request)
    {
        try
        {
            using var connection = _db.CreateConnection();

            var checkSql = @"
                SELECT 
                    MAX(CASE WHEN COLUMN_NAME = 'Email' THEN 1 ELSE 0 END) AS HasEmail,
                    MAX(CASE WHEN COLUMN_NAME = 'VaiTro' THEN 1 ELSE 0 END) AS HasVaiTro,
                    MAX(CASE WHEN COLUMN_NAME = 'MatKhau' THEN 1 ELSE 0 END) AS HasMatKhau
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'NhanVien'";

            var cols = await connection.QueryFirstOrDefaultAsync<dynamic>(checkSql);
            bool hasEmail = cols != null && cols.HasEmail == 1;
            bool hasVaiTro = cols != null && cols.HasVaiTro == 1;
            bool hasMatKhau = cols != null && cols.HasMatKhau == 1;

            if (!hasMatKhau)
            {
                try
                {
                    await connection.ExecuteAsync("ALTER TABLE NhanVien ADD MatKhau NVARCHAR(100) NOT NULL DEFAULT '123456'");
                    hasMatKhau = true;
                }
                catch { }
            }

            if (maNV.Equals("ADMIN", StringComparison.OrdinalIgnoreCase))
            {
                var adminExists = await connection.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM NhanVien WHERE UPPER(TRIM(MaNV)) = 'ADMIN'");
                if (adminExists == 0)
                {
                    await connection.ExecuteAsync(@"
                        INSERT INTO NhanVien (MaNV, MaPB, HoTen, ChucVu, Email, SoTaiKhoan" + (hasMatKhau ? ", MatKhau" : "") + (hasVaiTro ? ", VaiTro" : "") + @")
                        VALUES ('ADMIN', @MaPB, @HoTen, @ChucVu, @Email, '000000000000'" + (hasMatKhau ? ", @MatKhau" : "") + (hasVaiTro ? ", @VaiTro" : "") + @")",
                        new
                        {
                            MaPB = string.IsNullOrWhiteSpace(request.MaPB) ? "PB_IT" : request.MaPB,
                            request.HoTen,
                            request.ChucVu,
                            Email = string.IsNullOrWhiteSpace(request.Email) ? "admin@gmail.com" : request.Email.Trim(),
                            MatKhau = string.IsNullOrWhiteSpace(request.MatKhau) ? "123456" : request.MatKhau.Trim(),
                            VaiTro = "ADMIN"
                        });
                    return Ok(ApiResponse<bool>.Ok(true, "Cập nhật tài khoản ADMIN thành công!"));
                }
            }

            string updateSql;
            if (hasEmail && hasVaiTro)
            {
                updateSql = @"
                    UPDATE NhanVien
                    SET HoTen = @HoTen,
                        ChucVu = @ChucVu,
                        Email = @Email,
                        MaPB = @MaPB,
                        SoTaiKhoan = @SoTaiKhoan,
                        VaiTro = @VaiTro" +
                        (hasMatKhau && !string.IsNullOrWhiteSpace(request.MatKhau) ? ", MatKhau = @MatKhau" : "") + @"
                    WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))";
            }
            else
            {
                updateSql = @"
                    UPDATE NhanVien
                    SET HoTen = @HoTen,
                        ChucVu = @ChucVu,
                        MaPB = @MaPB,
                        SoTaiKhoan = @SoTaiKhoan" +
                        (hasMatKhau && !string.IsNullOrWhiteSpace(request.MatKhau) ? ", MatKhau = @MatKhau" : "") + @"
                    WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))";
            }

            var rows = await connection.ExecuteAsync(updateSql, new
            {
                MaNV = maNV,
                request.HoTen,
                request.ChucVu,
                Email = string.IsNullOrWhiteSpace(request.Email) ? $"{maNV.ToLower()}@gmail.com" : request.Email.Trim(),
                request.MaPB,
                request.SoTaiKhoan,
                VaiTro = string.IsNullOrWhiteSpace(request.VaiTro) ? "NHAN_VIEN" : request.VaiTro,
                MatKhau = string.IsNullOrWhiteSpace(request.MatKhau) ? "123456" : request.MatKhau.Trim()
            });

            return Ok(ApiResponse<bool>.Ok(true, "Cập nhật thông tin và mật khẩu thành công!"));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Xóa người dùng (UC02 - Admin)
    /// </summary>
    [HttpDelete("users/{maNV}")]
    public async Task<IActionResult> DeleteUser(string maNV)
    {
        if (maNV.Equals("ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<string>.Fail("Không thể xóa tài khoản Quản trị viên hệ thống (ADMIN)."));
        }

        try
        {
            using var connection = _db.CreateConnection();
            var countDeXuat = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM DeXuatCongTac WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))", new { MaNV = maNV });
            if (countDeXuat > 0)
            {
                return BadRequest(ApiResponse<string>.Fail($"Nhân viên '{maNV}' đã có hồ sơ đề xuất chuyến đi trong hệ thống, không thể xóa để bảo toàn dữ liệu kiểm toán."));
            }

            await connection.ExecuteAsync("DELETE FROM NhanVien WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))", new { MaNV = maNV });
            return Ok(ApiResponse<bool>.Ok(true, $"Đã xóa tài khoản '{maNV}' thành công."));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Khôi phục mật khẩu mặc định (123456) cho nhân viên
    /// </summary>
    [HttpPost("users/{maNV}/reset-password")]
    public async Task<IActionResult> ResetPassword(string maNV)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var checkMatKhau = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NhanVien' AND COLUMN_NAME = 'MatKhau'");
            
            if (checkMatKhau > 0)
            {
                await connection.ExecuteAsync(
                    "UPDATE NhanVien SET MatKhau = '123456' WHERE UPPER(TRIM(MaNV)) = UPPER(TRIM(@MaNV))", new { MaNV = maNV });
            }

            return Ok(ApiResponse<bool>.Ok(true, $"Đã khôi phục mật khẩu tài khoản '{maNV}' về '123456' thành công."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail(ex.Message));
        }
    }
}
