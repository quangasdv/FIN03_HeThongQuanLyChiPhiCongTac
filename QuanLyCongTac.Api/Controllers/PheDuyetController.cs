using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;
using QuanLyCongTac.Api.Services;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PheDuyetController : ControllerBase
{
    private readonly IDbConnectionFactory _db;
    private readonly INhacNhoDuyetDonService _nhacNhoService;

    public PheDuyetController(IDbConnectionFactory db, INhacNhoDuyetDonService nhacNhoService)
    {
        _db = db;
        _nhacNhoService = nhacNhoService;
    }

    /// <summary>
    /// Quản lý phê duyệt hoặc từ chối đề xuất (Gọi SP sp_PheDuyetDeXuat - UC05)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> PheDuyet([FromBody] PheDuyetRequest request)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@MaDeXuat", request.MaDeXuat);
            parameters.Add("@MaQuanLy", request.MaQuanLy);
            parameters.Add("@HanhDong", request.HanhDong); // 'DUYET' hoặc 'TU_CHOI'
            parameters.Add("@GhiChu", request.GhiChu ?? (object)DBNull.Value);

            await connection.ExecuteAsync(
                "sp_PheDuyetDeXuat",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<string>.Ok(request.MaDeXuat, $"Xử lý phê duyệt '{request.HanhDong}' thành công."));
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
    /// UC12: Lấy danh sách giải trình chi phí ngoại lệ của nhân viên phòng ban mình
    /// </summary>
    [HttpGet("ngoai-le")]
    public async Task<IActionResult> GetDanhSachNgoaiLe([FromQuery] string? maPB, [FromQuery] string? trangThai)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    gt.MaGiaiTrinh,
                    gt.MaCTKB,
                    dx.MaDeXuat,
                    dx.MaNV,
                    nv.HoTen AS TenNhanVien,
                    pb.TenPB,
                    lcp.TenLoai AS TenLoaiChiPhi,
                    ctkb.NgayChi,
                    ctkb.SoTienThucTe,
                    gt.LyDo,
                    gt.KQPheDuyet,
                    ocr.LinkAnh,
                    ocr.DataBocTach
                FROM GiaiTrinhNgoaiLe gt
                INNER JOIN ChiTietKhaiBao ctkb ON gt.MaCTKB = ctkb.MaCTKB
                INNER JOIN PhieuKhaiBao kb ON ctkb.MaKhaiBao = kb.MaKhaiBao
                INNER JOIN DeXuatCongTac dx ON kb.MaDeXuat = dx.MaDeXuat
                INNER JOIN NhanVien nv ON dx.MaNV = nv.MaNV
                INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
                INNER JOIN LoaiChiPhi lcp ON ctkb.MaLoaiCP = lcp.MaLoaiCP
                LEFT JOIN ChungTuOCR ocr ON ctkb.MaCTKB = ocr.MaCTKB
                WHERE (@MaPB IS NULL OR nv.MaPB = @MaPB)
                  AND (@TrangThai IS NULL OR gt.KQPheDuyet = @TrangThai)
                ORDER BY ctkb.NgayChi DESC";

            var result = await connection.QueryAsync<GiaiTrinhNgoaiLeDto>(sql, new { MaPB = maPB, TrangThai = trangThai });
            return Ok(ApiResponse<IEnumerable<GiaiTrinhNgoaiLeDto>>.Ok(result));
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
    /// UC12: Quản lý phê duyệt đặc cách hoặc từ chối ngoại lệ chi phí
    /// </summary>
    [HttpPost("ngoai-le")]
    public async Task<IActionResult> PheDuyetNgoaiLe([FromBody] PheDuyetNgoaiLeRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.MaGiaiTrinh))
        {
            return BadRequest(ApiResponse<string>.Fail("Vui lòng cung cấp mã giải trình."));
        }

        try
        {
            using var connection = _db.CreateConnection();

            var item = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT gt.MaGiaiTrinh, gt.MaCTKB, dx.MaNV FROM GiaiTrinhNgoaiLe gt " +
                "INNER JOIN ChiTietKhaiBao ctkb ON gt.MaCTKB = ctkb.MaCTKB " +
                "INNER JOIN PhieuKhaiBao kb ON ctkb.MaKhaiBao = kb.MaKhaiBao " +
                "INNER JOIN DeXuatCongTac dx ON kb.MaDeXuat = dx.MaDeXuat " +
                "WHERE gt.MaGiaiTrinh = @MaGiaiTrinh",
                new { request.MaGiaiTrinh }
            );

            if (item == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy bản ghi giải trình '{request.MaGiaiTrinh}'."));
            }

            if (string.Equals((string)item.MaNV, request.MaQuanLy, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(ApiResponse<string>.Fail("[Quy tắc BR09]: Cấp quản lý không được tự phê duyệt ngoại lệ chi phí của chính mình."));
            }

            string ketQuaPheDuyet = request.HanhDong == "DUYET" ? "Đã duyệt đặc cách" : "Từ chối ngoại lệ";
            string trangThaiChiPhi = request.HanhDong == "DUYET" ? "Hợp lệ (Đặc cách)" : "Vượt hạn mức (Không duyệt)";

            var updateSql = @"
                UPDATE GiaiTrinhNgoaiLe 
                SET KQPheDuyet = @KetQuaPheDuyet 
                WHERE MaGiaiTrinh = @MaGiaiTrinh;

                UPDATE ChiTietKhaiBao 
                SET TrangThaiHopLe = @TrangThaiChiPhi 
                WHERE MaCTKB IN (SELECT MaCTKB FROM GiaiTrinhNgoaiLe WHERE MaGiaiTrinh = @MaGiaiTrinh);";

            await connection.ExecuteAsync(updateSql, new {
                KetQuaPheDuyet = ketQuaPheDuyet,
                TrangThaiChiPhi = trangThaiChiPhi,
                MaGiaiTrinh = request.MaGiaiTrinh
            });

            return Ok(ApiResponse<string>.Ok(request.MaGiaiTrinh, $"Đã cập nhật ngoại lệ '{request.MaGiaiTrinh}': {ketQuaPheDuyet}."));
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
    /// UC-06: Truy vấn danh sách các đơn chờ duyệt tồn đọng (kèm chỉ báo quá hạn 3 ngày)
    /// </summary>
    [HttpGet("nhac-nho/don-ton-dong")]
    public async Task<IActionResult> GetDonTonDong([FromQuery] string? maPB)
    {
        try
        {
            var result = await _nhacNhoService.GetDanhSachDonTonDongAsync(maPB);
            return Ok(ApiResponse<IEnumerable<DonTonDongNhacNhoDto>>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }

    /// <summary>
    /// UC-06: Kích hoạt tiến trình quét định thời & gửi email nhắc nhở duyệt đơn tự động (Sơ đồ Trang 19)
    /// </summary>
    [HttpPost("nhac-nho/kich-hoat-quet")]
    public async Task<IActionResult> KichHoatQuetNhacNho([FromQuery] string? maPB)
    {
        try
        {
            var result = await _nhacNhoService.QuetVaGuiNhacNhoAsync(maPB);
            return Ok(ApiResponse<KetQuaQuetNhacNhoDto>.Ok(result, "Tiến trình quét nhắc nhở duyệt đơn tự động hoàn thành."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Hệ thống]: {ex.Message}"));
        }
    }
}
