using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuyetToanController : ControllerBase
{
    private readonly IDbConnectionFactory _db;

    public QuyetToanController(IDbConnectionFactory db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy bảng tổng hợp quyết toán tài chính (Gọi View vw_TongHopQuyetToan)
    /// Hỗ trợ lọc theo Mã Nhân Viên hoặc Mã Phòng Ban (phục vụ UC-15 theo sơ đồ)
    /// </summary>
    [HttpGet("tonghop")]
    public async Task<IActionResult> GetTongHop([FromQuery] string? maNV, [FromQuery] string? maPB)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = @"SELECT * FROM vw_TongHopQuyetToan 
                        WHERE (@MaNV IS NULL OR MaNV = @MaNV)
                          AND (@MaPB IS NULL OR MaPB = @MaPB)";
            var result = await connection.QueryAsync<TongHopQuyetToanViewDto>(sql, new { MaNV = maNV, MaPB = maPB });
            return Ok(ApiResponse<IEnumerable<TongHopQuyetToanViewDto>>.Ok(result));
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
    /// Lấy chi tiết khai báo và chứng từ OCR đối soát (Gọi View vw_ChiTietKhaiBaoChungTu)
    /// </summary>
    [HttpGet("chung-tu")]
    public async Task<IActionResult> GetChungTu([FromQuery] string? maDeXuat)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT * FROM vw_ChiTietKhaiBaoChungTu WHERE (@MaDeXuat IS NULL OR MaDeXuat = @MaDeXuat)";
            var result = await connection.QueryAsync<ChiTietKhaiBaoChungTuViewDto>(sql, new { MaDeXuat = maDeXuat });
            return Ok(ApiResponse<IEnumerable<ChiTietKhaiBaoChungTuViewDto>>.Ok(result));
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
    /// Chốt sổ quyết toán và đóng băng hồ sơ (Gọi SP sp_ChotSoQuyetToan)
    /// Kích hoạt Trigger trg_KhoaDuLieuSauQuyetToan
    /// </summary>
    [HttpPost("chot-so")]
    public async Task<IActionResult> ChotSo([FromBody] ChotSoQuyetToanRequest request)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaQuyetToan", request.MaQuyetToan);
            parameters.Add("@MaDeXuat", request.MaDeXuat);
            parameters.Add("@MaNVKeToan", request.MaNVKeToan);

            await connection.ExecuteAsync(
                "sp_ChotSoQuyetToan",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<string>.Ok(request.MaQuyetToan, "Chốt sổ quyết toán và khóa hồ sơ thành công."));
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
    /// UC09: Nhân viên khai báo chi phí thực tế và đính kèm hóa đơn chứng từ OCR
    /// Ràng buộc BR13: DungLuongMB <= 500MB
    /// Ràng buộc BR14: NgayChi nằm trong khoảng NgayDi và NgayVe của chuyến đi
    /// </summary>
    [HttpPost("khai-bao")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> KhaiBaoChiPhi([FromBody] TaoPhieuKhaiBaoRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.MaDeXuat) || request.ChiTiet == null || !request.ChiTiet.Any())
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng cung cấp đầy đủ thông tin đề xuất và ít nhất một khoản chi thực tế."));
        }

        try
        {
            using var connection = _db.CreateConnection();
            if (connection.State != ConnectionState.Open)
                connection.Open();

            // 1. Kiểm tra đề xuất tồn tại và lấy thông tin chuyến đi
            var deXuat = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT MaDeXuat, MaNV, NgayDi, NgayVe, TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                new { request.MaDeXuat }
            );

            if (deXuat == null)
            {
                return BadRequest(ApiResponse<string>.Fail($"Không tìm thấy đề xuất công tác: {request.MaDeXuat}"));
            }

            // Kiểm tra trạng thái: Đề xuất đã duyệt, đã tạm ứng hoặc chờ quyết toán đều được khai báo hóa đơn chi phí
            string trangThai = deXuat.TrangThai?.ToString() ?? "";
            if (trangThai != "Đã tạm ứng" && trangThai != "Chờ quyết toán")
            {
                return BadRequest(ApiResponse<string>.Fail($"Hồ sơ đang ở trạng thái '{trangThai}'. Chuyến đi bắt buộc phải được Kế toán chi tiền tạm ứng trước mới được phép khai báo hóa đơn chi phí."));
            }

            DateTime ngayDi = Convert.ToDateTime(deXuat.NgayDi);
            DateTime ngayVe = Convert.ToDateTime(deXuat.NgayVe);

            // 2. Kiểm tra ràng buộc BR13 (Dung lượng <= 500MB) và BR14 (NgayChi trong khoảng NgayDi - NgayVe)
            for (int i = 0; i < request.ChiTiet.Count; i++)
            {
                var item = request.ChiTiet[i];
                if (item.DungLuongMB <= 0 || item.DungLuongMB > 500.0m)
                {
                    return BadRequest(ApiResponse<string>.Fail($"[Ràng buộc BR13]: Dung lượng chứng từ dòng #{i + 1} phải lớn hơn 0 và không vượt quá 500MB (hiện tại: {item.DungLuongMB}MB)."));
                }

                if (item.NgayChi < ngayDi || item.NgayChi > ngayVe)
                {
                    return BadRequest(ApiResponse<string>.Fail($"[Ràng buộc BR14]: Ngày chi ({item.NgayChi:dd/MM/yyyy}) của dòng #{i + 1} phải nằm trong khoảng thời gian chuyến đi ({ngayDi:dd/MM/yyyy} - {ngayVe:dd/MM/yyyy})."));
                }
            }

            using var tran = connection.BeginTransaction();
            try
            {
                // Kiểm tra xem đã có PhieuKhaiBao chưa
                var existingKb = await connection.QueryFirstOrDefaultAsync<string>(
                    "SELECT MaKhaiBao FROM PhieuKhaiBao WHERE MaDeXuat = @MaDeXuat",
                    new { request.MaDeXuat },
                    tran
                );

                string maKhaiBao = existingKb;
                if (string.IsNullOrWhiteSpace(maKhaiBao))
                {
                    maKhaiBao = "KB_" + DateTime.Now.ToString("yyyyMMddHHmmss");
                    await connection.ExecuteAsync(
                        "INSERT INTO PhieuKhaiBao (MaKhaiBao, MaDeXuat, NgayLap, TrangThai) VALUES (@MaKhaiBao, @MaDeXuat, GETDATE(), N'Chờ kiểm tra')",
                        new { MaKhaiBao = maKhaiBao, request.MaDeXuat },
                        tran
                    );
                }

                string uid = Guid.NewGuid().ToString("N")[..6];
                int idx = 1;
                foreach (var item in request.ChiTiet)
                {
                    string maCTKB = !string.IsNullOrWhiteSpace(item.MaCTKB) ? item.MaCTKB : $"CTKB_{uid}_{idx}";
                    string maCT = $"CT_{uid}_{idx}";
                    idx++;

                    // Thêm ChiTietKhaiBao
                    await connection.ExecuteAsync(@"
                        INSERT INTO ChiTietKhaiBao (MaCTKB, MaKhaiBao, MaLoaiCP, NgayChi, SoTienThucTe, TrangThaiHopLe)
                        VALUES (@MaCTKB, @MaKhaiBao, @MaLoaiCP, @NgayChi, @SoTienThucTe, N'Hợp lệ')",
                        new {
                            MaCTKB = maCTKB,
                            MaKhaiBao = maKhaiBao,
                            item.MaLoaiCP,
                            item.NgayChi,
                            item.SoTienThucTe
                        },
                        tran
                    );

                    // Đảm bảo cột LinkAnh và DataBocTach là NVARCHAR(MAX) tránh lỗi truncation
                    await connection.ExecuteAsync(@"
                        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ChungTuOCR' AND COLUMN_NAME = 'LinkAnh' AND (CHARACTER_MAXIMUM_LENGTH > 0 AND CHARACTER_MAXIMUM_LENGTH < 4000))
                        BEGIN
                            ALTER TABLE ChungTuOCR ALTER COLUMN LinkAnh NVARCHAR(MAX) NOT NULL;
                        END
                        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ChungTuOCR' AND COLUMN_NAME = 'DataBocTach' AND (CHARACTER_MAXIMUM_LENGTH > 0 AND CHARACTER_MAXIMUM_LENGTH < 4000))
                        BEGIN
                            ALTER TABLE ChungTuOCR ALTER COLUMN DataBocTach NVARCHAR(MAX) NULL;
                        END",
                        transaction: tran
                    );

                    // Xử lý lưu ảnh nếu là base64 data URL
                    string linkAnh = item.LinkAnh;
                    if (!string.IsNullOrWhiteSpace(linkAnh) && linkAnh.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                    {
                        try
                        {
                            var commaIdx = linkAnh.IndexOf(',');
                            if (commaIdx > 0)
                            {
                                var base64Data = linkAnh.Substring(commaIdx + 1);
                                byte[] imageBytes = Convert.FromBase64String(base64Data);

                                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "invoices");
                                if (!Directory.Exists(uploadsDir))
                                    Directory.CreateDirectory(uploadsDir);

                                string ext = linkAnh.Contains("image/jpeg") ? ".jpg" : (linkAnh.Contains("image/webp") ? ".webp" : ".png");
                                string imgFileName = $"{maCTKB}_{DateTime.Now:yyyyMMddHHmmss}{ext}";
                                string fullPath = Path.Combine(uploadsDir, imgFileName);

                                await System.IO.File.WriteAllBytesAsync(fullPath, imageBytes);
                                linkAnh = $"/uploads/invoices/{imgFileName}";
                            }
                        }
                        catch
                        {
                            linkAnh = $"/uploads/invoices/{maCTKB}.png";
                        }
                    }
                    else if (string.IsNullOrWhiteSpace(linkAnh))
                    {
                        linkAnh = $"/uploads/invoices/inv_{maCTKB}.png";
                    }

                    string dataOCR = string.IsNullOrWhiteSpace(item.DataBocTach)
                        ? $"{{\"SoHD\":\"HD-{maCTKB}\",\"Ngay\":\"{item.NgayChi:dd/MM/yyyy}\",\"TongTien\":{item.SoTienThucTe}}}"
                        : item.DataBocTach;

                    await connection.ExecuteAsync(@"
                        INSERT INTO ChungTuOCR (MaChungTu, MaCTKB, LinkAnh, DungLuongMB, DataBocTach)
                        VALUES (@MaChungTu, @MaCTKB, @LinkAnh, @DungLuongMB, @DataBocTach)",
                        new {
                            MaChungTu = maCT,
                            MaCTKB = maCTKB,
                            LinkAnh = linkAnh,
                            item.DungLuongMB,
                            DataBocTach = dataOCR
                        },
                        tran
                    );

                    // Thêm GiaiTrinhNgoaiLe nếu có
                    if (!string.IsNullOrWhiteSpace(item.LyDoGiaiTrinh))
                    {
                        string maGT = $"GT_{uid}_{idx}";
                        await connection.ExecuteAsync(@"
                            INSERT INTO GiaiTrinhNgoaiLe (MaGiaiTrinh, MaCTKB, LyDo, KQPheDuyet)
                            VALUES (@MaGiaiTrinh, @MaCTKB, @LyDo, N'Chờ duyệt ngoại lệ')",
                            new {
                                MaGiaiTrinh = maGT,
                                MaCTKB = maCTKB,
                                LyDo = item.LyDoGiaiTrinh
                            },
                            tran
                        );
                    }
                }

                // Cập nhật trạng thái chuyến đi sang 'Chờ quyết toán'
                await connection.ExecuteAsync(
                    "UPDATE DeXuatCongTac SET TrangThai = N'Chờ quyết toán' WHERE MaDeXuat = @MaDeXuat",
                    new { request.MaDeXuat },
                    tran
                );

                tran.Commit();
                return Ok(ApiResponse<string>.Ok(maKhaiBao, "Khai báo chi phí thực tế và đính kèm hóa đơn chứng từ thành công."));
            }
            catch
            {
                tran.Rollback();
                throw;
            }
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
    /// Kế toán đối soát và điều chỉnh số tiền thực chi trên chứng từ hóa đơn
    /// </summary>
    [HttpPut("dieu-chinh-chi-phi/{maCTKB}")]
    public async Task<IActionResult> DieuChinhChiPhi(string maCTKB, [FromBody] DieuChinhChiPhiRequest request)
    {
        if (request == null || request.SoTienDieuChinh < 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Số tiền điều chỉnh không hợp lệ (phải >= 0)."));
        }

        try
        {
            using var connection = _db.CreateConnection();
            var ctkb = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT c.MaCTKB, dx.TrangThai FROM ChiTietKhaiBao c " +
                "INNER JOIN PhieuKhaiBao kb ON c.MaKhaiBao = kb.MaKhaiBao " +
                "INNER JOIN DeXuatCongTac dx ON kb.MaDeXuat = dx.MaDeXuat " +
                "WHERE c.MaCTKB = @MaCTKB",
                new { maCTKB }
            );

            if (ctkb == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy khoản chi '{maCTKB}'."));
            }

            if ((string)ctkb.TrangThai == "Đã chốt sổ")
            {
                return BadRequest(ApiResponse<string>.Fail("Hồ sơ đã chốt sổ quyết toán, không thể điều chỉnh số tiền."));
            }

            await connection.ExecuteAsync(
                "UPDATE ChiTietKhaiBao SET SoTienThucTe = @SoTien WHERE MaCTKB = @MaCTKB",
                new { SoTien = request.SoTienDieuChinh, maCTKB }
            );

            return Ok(ApiResponse<string>.Ok(maCTKB, "Đã điều chỉnh số tiền chi phí thực tế thành công."));
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
}
