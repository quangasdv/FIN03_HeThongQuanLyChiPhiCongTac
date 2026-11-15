using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DinhMucController : ControllerBase
{
    private readonly IDbConnectionFactory _db;

    public DinhMucController(IDbConnectionFactory db)
    {
        _db = db;
    }

    /// <summary>
    /// UC08: Lấy danh sách quy định định mức hiện hành
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDanhSach()
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    qd.MaQuyDinh,
                    qd.MaLoaiCP,
                    lcp.TenLoai AS TenLoaiChiPhi,
                    qd.CapBacApDung,
                    qd.SoTienToiDa,
                    qd.NgayHieuLuc,
                    qd.NgayHetHan,
                    CAST(CASE 
                        WHEN qd.NgayHieuLuc <= CAST(GETDATE() AS DATE) 
                         AND (qd.NgayHetHan IS NULL OR qd.NgayHetHan >= CAST(GETDATE() AS DATE)) 
                        THEN 1 ELSE 0 
                    END AS BIT) AS ConHieuLuc
                FROM QuyDinhDinhMuc qd
                INNER JOIN LoaiChiPhi lcp ON qd.MaLoaiCP = lcp.MaLoaiCP
                ORDER BY qd.CapBacApDung, qd.MaLoaiCP, qd.NgayHieuLuc DESC";

            var result = await connection.QueryAsync<DinhMucViewDto>(sql);
            return Ok(ApiResponse<IEnumerable<DinhMucViewDto>>.Ok(result));
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
    /// Lấy danh mục các loại chi phí để chọn trong form
    /// </summary>
    [HttpGet("loai-chi-phi")]
    public async Task<IActionResult> GetLoaiChiPhi()
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT MaLoaiCP, TenLoai FROM LoaiChiPhi ORDER BY MaLoaiCP";
            var result = await connection.QueryAsync<LoaiChiPhiDto>(sql);
            return Ok(ApiResponse<IEnumerable<LoaiChiPhiDto>>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// UC08: Thêm mới quy định định mức - Rule Engine
    /// Kiểm tra ràng buộc BR03: NgayHetHan >= NgayHieuLuc và không trùng lặp thời gian hiệu lực
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DinhMucCreateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.MaQuyDinh) || string.IsNullOrWhiteSpace(request.MaLoaiCP))
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng điền đầy đủ Mã quy định và Loại chi phí."));
        }

        if (string.IsNullOrWhiteSpace(request.CapBacApDung))
        {
            request.CapBacApDung = "Tất cả nhân viên";
        }

        if (request.SoTienToiDa <= 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Hạn mức chi phí tối đa phải lớn hơn 0."));
        }

        // Kiểm tra ngày hết hạn >= ngày hiệu lực
        if (request.NgayHetHan.HasValue && request.NgayHetHan.Value < request.NgayHieuLuc)
        {
            return BadRequest(ApiResponse<string>.Fail("Ngày hết hạn không được nhỏ hơn ngày bắt đầu hiệu lực."));
        }

        try
        {
            using var connection = _db.CreateConnection();

            // Kiểm tra trùng mã quy định
            var exists = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM QuyDinhDinhMuc WHERE UPPER(MaQuyDinh) = UPPER(@MaQuyDinh)",
                new { request.MaQuyDinh }
            );
            if (exists > 0)
            {
                return BadRequest(ApiResponse<string>.Fail($"Mã quy định '{request.MaQuyDinh}' đã tồn tại trong hệ thống."));
            }

            // BR03: Kiểm tra xung đột khoảng thời gian hiệu lực với quy định cùng loại chi phí và cấp bậc
            var checkOverlapSql = @"
                SELECT COUNT(1) FROM QuyDinhDinhMuc
                WHERE MaLoaiCP = @MaLoaiCP
                  AND CapBacApDung = @CapBacApDung
                  AND (
                      (NgayHetHan IS NULL AND (@NgayHetHan IS NULL OR @NgayHetHan >= NgayHieuLuc))
                      OR
                      (NgayHieuLuc <= ISNULL(@NgayHetHan, '2099-12-31') AND ISNULL(NgayHetHan, '2099-12-31') >= @NgayHieuLuc)
                  )";

            var overlapCount = await connection.ExecuteScalarAsync<int>(checkOverlapSql, new {
                request.MaLoaiCP,
                request.CapBacApDung,
                request.NgayHieuLuc,
                request.NgayHetHan
            });

            if (overlapCount > 0)
            {
                return BadRequest(ApiResponse<string>.Fail("Đã tồn tại phiên bản định mức cùng loại chi phí trùng lặp khoảng thời gian hiệu lực."));
            }

            var insertSql = @"
                INSERT INTO QuyDinhDinhMuc (MaQuyDinh, MaLoaiCP, CapBacApDung, SoTienToiDa, NgayHieuLuc, NgayHetHan)
                VALUES (@MaQuyDinh, @MaLoaiCP, @CapBacApDung, @SoTienToiDa, @NgayHieuLuc, @NgayHetHan)";

            await connection.ExecuteAsync(insertSql, new {
                request.MaQuyDinh,
                request.MaLoaiCP,
                request.CapBacApDung,
                request.SoTienToiDa,
                request.NgayHieuLuc,
                request.NgayHetHan
            });

            return Ok(ApiResponse<string>.Ok(request.MaQuyDinh, "Thiết lập quy định định mức mới thành công."));
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
    /// Cập nhật hạn mức hoặc đóng phiên bản quy định
    /// </summary>
    [HttpPut("{maQuyDinh}")]
    public async Task<IActionResult> Update(string maQuyDinh, [FromBody] DinhMucUpdateRequest request)
    {
        if (request == null || request.SoTienToiDa <= 0)
        {
            return BadRequest(ApiResponse<string>.Fail("Hạn mức chi phí tối đa phải lớn hơn 0."));
        }

        if (request.NgayHetHan.HasValue && request.NgayHetHan.Value < request.NgayHieuLuc)
        {
            return BadRequest(ApiResponse<string>.Fail("[Ràng buộc BR03]: Ngày hết hạn không được nhỏ hơn ngày hiệu lực."));
        }

        try
        {
            using var connection = _db.CreateConnection();
            var updateSql = @"
                UPDATE QuyDinhDinhMuc 
                SET SoTienToiDa = @SoTienToiDa,
                    NgayHieuLuc = @NgayHieuLuc,
                    NgayHetHan = @NgayHetHan
                WHERE MaQuyDinh = @MaQuyDinh";

            var rows = await connection.ExecuteAsync(updateSql, new {
                MaQuyDinh = maQuyDinh,
                request.SoTienToiDa,
                request.NgayHieuLuc,
                request.NgayHetHan
            });

            if (rows == 0)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy quy định: {maQuyDinh}"));
            }

            return Ok(ApiResponse<string>.Ok(maQuyDinh, "Cập nhật quy định định mức thành công."));
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
    /// Xóa quy định định mức
    /// </summary>
    [HttpDelete("{maQuyDinh}")]
    public async Task<IActionResult> Delete(string maQuyDinh)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var rows = await connection.ExecuteAsync(
                "DELETE FROM QuyDinhDinhMuc WHERE MaQuyDinh = @MaQuyDinh",
                new { MaQuyDinh = maQuyDinh }
            );

            if (rows == 0)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy quy định: {maQuyDinh}"));
            }

            return Ok(ApiResponse<string>.Ok(maQuyDinh, "Đã xóa quy định định mức thành công."));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail($"[Lỗi ràng buộc CSDL]: {ex.Message}"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }
}
