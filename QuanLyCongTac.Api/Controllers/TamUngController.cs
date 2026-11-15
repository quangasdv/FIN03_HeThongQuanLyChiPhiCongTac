using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TamUngController : ControllerBase
{
    private readonly IDbConnectionFactory _db;

    public TamUngController(IDbConnectionFactory db)
    {
        _db = db;
    }

    /// <summary>
    /// Kế toán chi tiền tạm ứng cho đề xuất đã duyệt (Gọi SP sp_ChiTamUng - UC07)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> ChiTamUng([FromBody] ChiTamUngRequest request)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaTamUng", request.MaTamUng);
            parameters.Add("@MaDeXuat", request.MaDeXuat);
            parameters.Add("@MaNVKeToan", request.MaNVKeToan);
            parameters.Add("@SoTienChi", request.SoTienChi);

            await connection.ExecuteAsync(
                "sp_ChiTamUng",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<string>.Ok(request.MaTamUng, "Chi tiền tạm ứng thành công."));
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
