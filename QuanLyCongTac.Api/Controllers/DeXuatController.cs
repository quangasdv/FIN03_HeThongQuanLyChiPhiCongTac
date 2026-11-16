using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeXuatController : ControllerBase
{
    private readonly IDbConnectionFactory _db;

    public DeXuatController(IDbConnectionFactory db)
    {
        _db = db;
    }

    /// <summary>
    /// Lấy danh sách đề xuất công tác:
    /// - Hỗ trợ lọc theo mã nhân viên (maNV)
    /// - Hỗ trợ lọc theo phòng ban (maPB)
    /// - Hỗ trợ lọc theo trạng thái (trangThai: ALL, CHO_DUYET, DA_DUYET, CHO_QUYET_TOAN, DA_CHOT_SO...)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDanhSach([FromQuery] string? maNV, [FromQuery] string? maPB, [FromQuery] string? trangThai)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT * FROM vw_DanhSachDeXuat WHERE (@MaNV IS NULL OR MaNV = @MaNV) AND (@MaPB IS NULL OR MaPB = @MaPB)";

            if (!string.IsNullOrWhiteSpace(trangThai) && trangThai != "ALL")
            {
                var dbStatus = trangThai.ToUpper() switch
                {
                    "BAN_NHAP" => "Bản nháp",
                    "CHO_DUYET" => "Chờ duyệt",
                    "DA_DUYET" => "Đã duyệt",
                    "TU_CHOI" => "Từ chối",
                    "DA_TAM_UNG" => "Đã tạm ứng",
                    "CHO_QUYET_TOAN" => "Chờ quyết toán",
                    "DA_CHOT_SO" => "Đã chốt sổ",
                    "DA_HUY" => "Đã hủy",
                    _ => trangThai
                };
                sql += " AND TrangThai = @TrangThai";
                var resultWithStatus = await connection.QueryAsync<DeXuatViewDto>(sql, new { MaNV = maNV, MaPB = maPB, TrangThai = dbStatus });
                return Ok(ApiResponse<IEnumerable<DeXuatViewDto>>.Ok(resultWithStatus));
            }

            var result = await connection.QueryAsync<DeXuatViewDto>(sql, new { MaNV = maNV, MaPB = maPB });
            return Ok(ApiResponse<IEnumerable<DeXuatViewDto>>.Ok(result));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Server]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Xem chi tiết một đề xuất kèm bảng dự toán (phục vụ xem chi tiết hoặc chỉnh sửa bản nháp)
    /// </summary>
    [HttpGet("{maDeXuat}")]
    public async Task<IActionResult> GetById(string maDeXuat)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var dx = await connection.QueryFirstOrDefaultAsync<DeXuatViewDto>(
                "SELECT * FROM vw_DanhSachDeXuat WHERE MaDeXuat = @MaDeXuat",
                new { maDeXuat }
            );

            if (dx == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy đề xuất '{maDeXuat}'."));
            }

            var chiTietSql = @"
                SELECT dt.MaLoaiCP, lcp.TenLoai AS TenLoaiChiPhi, dt.SoTienDuKien, dt.LyDoGiaiTrinh
                FROM ChiTietDuToan dt
                INNER JOIN LoaiChiPhi lcp ON dt.MaLoaiCP = lcp.MaLoaiCP
                WHERE dt.MaDeXuat = @MaDeXuat";

            var chiTiet = (await connection.QueryAsync<ChiTietDuToanItemRequest>(chiTietSql, new { maDeXuat })).ToList();

            var detail = new DeXuatDetailDto
            {
                DeXuat = dx,
                ChiTiet = chiTiet
            };

            return Ok(ApiResponse<DeXuatDetailDto>.Ok(detail));
        }
        catch (SqlException ex)
        {
            return BadRequest(ApiResponse<string>.Fail(SqlErrorHelper.Translate(ex)));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Fail($"[Lỗi Server]: {ex.Message}"));
        }
    }

    /// <summary>
    /// Lập đề xuất công tác và chi tiết dự toán:
    /// - Hỗ trợ "Bản nháp" (Lưu tạm)
    /// - Hỗ trợ "Chờ duyệt" (Gửi duyệt chính thức - gọi SP sp_TaoDeXuatVaDuToan)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> TaoDeXuat([FromBody] TaoDeXuatRequest request)
    {
        if (request == null || request.ChiTiet == null || !request.ChiTiet.Any())
        {
            return BadRequest(ApiResponse<string>.Fail("Bảng dự toán không được để trống."));
        }

        // Kiểm tra ngày về >= ngày đi
        if (request.NgayVe < request.NgayDi)
        {
            return BadRequest(ApiResponse<string>.Fail("Ngày kết thúc chuyến đi phải lớn hơn hoặc bằng ngày bắt đầu (Ngày về >= Ngày đi)."));
        }

        // Tự động gom nhóm các dòng cùng loại chi phí để bảo đảm tính toàn vẹn (tránh vi phạm PK_ChiTietDuToan)
        var consolidatedChiTiet = request.ChiTiet
            .GroupBy(c => c.MaLoaiCP)
            .Select(g => new ChiTietDuToanItemRequest
            {
                MaLoaiCP = g.Key,
                SoTienDuKien = g.Sum(x => x.SoTienDuKien),
                LyDoGiaiTrinh = string.Join("; ", g.Where(x => !string.IsNullOrWhiteSpace(x.LyDoGiaiTrinh)).Select(x => x.LyDoGiaiTrinh))
            })
            .ToList();

        // Tính tổng dự toán
        decimal tongDuToan = consolidatedChiTiet.Sum(c => c.SoTienDuKien);
        if (request.SoTienTamUngDeNghi > tongDuToan)
        {
            return BadRequest(ApiResponse<string>.Fail("Số tiền tạm ứng đề nghị không được vượt quá 100% tổng dự toán."));
        }

        bool isDraft = string.Equals(request.TrangThai, "Bản nháp", StringComparison.OrdinalIgnoreCase);

        try
        {
            using var connection = _db.CreateConnection();

            // 1. Xử lý LƯU BẢN NHÁP
            if (isDraft)
            {
                var existingStatus = await connection.ExecuteScalarAsync<string>(
                    "SELECT TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                    new { request.MaDeXuat }
                );

                if (existingStatus != null)
                {
                    if (existingStatus != "Bản nháp")
                    {
                        return BadRequest(ApiResponse<string>.Fail($"Không thể lưu đè đề xuất '{request.MaDeXuat}' vì hồ sơ đang ở trạng thái '{existingStatus}'."));
                    }

                    // Cập nhật bản nháp đã có
                    await connection.ExecuteAsync(@"
                        UPDATE DeXuatCongTac 
                        SET MucDich = @MucDich, NgayDi = @NgayDi, NgayVe = @NgayVe, SoTienTamUngDeNghi = @SoTienTamUngDeNghi 
                        WHERE MaDeXuat = @MaDeXuat;

                        DELETE FROM ChiTietDuToan WHERE MaDeXuat = @MaDeXuat;",
                        new { request.MaDeXuat, request.MucDich, request.NgayDi, request.NgayVe, request.SoTienTamUngDeNghi }
                    );

                    foreach (var item in consolidatedChiTiet)
                    {
                        await connection.ExecuteAsync(@"
                            INSERT INTO ChiTietDuToan (MaDeXuat, MaLoaiCP, SoTienDuKien, LyDoGiaiTrinh)
                            VALUES (@MaDeXuat, @MaLoaiCP, @SoTienDuKien, @LyDoGiaiTrinh)",
                            new { request.MaDeXuat, item.MaLoaiCP, item.SoTienDuKien, item.LyDoGiaiTrinh }
                        );
                    }

                    return Ok(ApiResponse<string>.Ok(request.MaDeXuat, "Cập nhật bản nháp đề xuất thành công."));
                }
                else
                {
                    // Tạo mới bản nháp
                    await connection.ExecuteAsync(@"
                        INSERT INTO DeXuatCongTac (MaDeXuat, MaNV, MucDich, NgayDi, NgayVe, TrangThai, SoTienTamUngDeNghi)
                        VALUES (@MaDeXuat, @MaNV, @MucDich, @NgayDi, @NgayVe, N'Bản nháp', @SoTienTamUngDeNghi)",
                        new { request.MaDeXuat, request.MaNV, request.MucDich, request.NgayDi, request.NgayVe, request.SoTienTamUngDeNghi }
                    );

                    foreach (var item in consolidatedChiTiet)
                    {
                        await connection.ExecuteAsync(@"
                            INSERT INTO ChiTietDuToan (MaDeXuat, MaLoaiCP, SoTienDuKien, LyDoGiaiTrinh)
                            VALUES (@MaDeXuat, @MaLoaiCP, @SoTienDuKien, @LyDoGiaiTrinh)",
                            new { request.MaDeXuat, item.MaLoaiCP, item.SoTienDuKien, item.LyDoGiaiTrinh }
                        );
                    }

                    return Ok(ApiResponse<string>.Ok(request.MaDeXuat, "Lưu bản nháp đề xuất công tác thành công. Đơn chưa gửi cho Quản lý."));
                }
            }

            // 2. Xử lý GỬI DUYỆT CHÍNH THỨC (Gọi SP sp_TaoDeXuatVaDuToan)
            // Nếu đơn này trước đó đã lưu nháp, xóa bản nháp cũ để SP tạo mới thành công
            var draftExists = await connection.ExecuteScalarAsync<string>(
                "SELECT TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                new { request.MaDeXuat }
            );

            if (draftExists != null)
            {
                if (draftExists == "Bản nháp")
                {
                    await connection.ExecuteAsync("DELETE FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat", new { request.MaDeXuat });
                }
                else
                {
                    return BadRequest(ApiResponse<string>.Fail($"Mã đề xuất '{request.MaDeXuat}' đã tồn tại ở trạng thái '{draftExists}'."));
                }
            }

            var table = new DataTable();
            table.Columns.Add("MaLoaiCP", typeof(string));
            table.Columns.Add("SoTienDuKien", typeof(decimal));
            table.Columns.Add("LyDoGiaiTrinh", typeof(string));

            foreach (var item in consolidatedChiTiet)
            {
                table.Rows.Add(
                    item.MaLoaiCP,
                    item.SoTienDuKien,
                    item.LyDoGiaiTrinh ?? (object)DBNull.Value
                );
            }

            var parameters = new DynamicParameters();
            parameters.Add("@MaDeXuat", request.MaDeXuat);
            parameters.Add("@MaNV", request.MaNV);
            parameters.Add("@MucDich", request.MucDich);
            parameters.Add("@NgayDi", request.NgayDi);
            parameters.Add("@NgayVe", request.NgayVe);
            parameters.Add("@SoTienTamUngDeNghi", request.SoTienTamUngDeNghi);
            parameters.Add("@ChiTietDuToan", table.AsTableValuedParameter("ChiTietDuToanType"));

            await connection.ExecuteAsync(
                "sp_TaoDeXuatVaDuToan",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return Ok(ApiResponse<string>.Ok(request.MaDeXuat, "Lập đề xuất công tác và gửi duyệt thành công."));
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
    /// Nộp đơn từ Bản nháp sang Chờ duyệt
    /// </summary>
    [HttpPost("{maDeXuat}/submit")]
    public async Task<IActionResult> SubmitDraft(string maDeXuat)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var item = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                new { maDeXuat }
            );

            if (item == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy đề xuất '{maDeXuat}'."));
            }

            if ((string)item.TrangThai != "Bản nháp")
            {
                return BadRequest(ApiResponse<string>.Fail($"Không thể nộp đơn vì trạng thái hiện tại là '{item.TrangThai}', không phải 'Bản nháp'."));
            }

            await connection.ExecuteAsync(
                "UPDATE DeXuatCongTac SET TrangThai = N'Chờ duyệt' WHERE MaDeXuat = @MaDeXuat",
                new { maDeXuat }
            );

            return Ok(ApiResponse<string>.Ok(maDeXuat, "Đã nộp đề xuất công tác để Quản lý phê duyệt thành công."));
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
    /// Nhân viên xác nhận đã đi công tác về và hoàn thành chuyến đi -> Chuyển trạng thái sang "Chờ quyết toán"
    /// Kế toán sẽ mở hồ sơ này ra để đối soát chứng từ và chốt sổ
    /// </summary>
    [HttpPost("{maDeXuat}/hoan-thanh-chuyen-di")]
    public async Task<IActionResult> HoanThanhChuyenDi(string maDeXuat)
    {
        try
        {
            using var connection = _db.CreateConnection();
            string cleanCode = (maDeXuat ?? "").Trim();
            var dx = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                new { MaDeXuat = cleanCode }
            );

            if (dx == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy đề xuất '{cleanCode}'."));
            }

            string currentStatus = (dx.TrangThai?.ToString() ?? "").Trim();
            if (currentStatus != "Đã tạm ứng" && currentStatus != "Đã duyệt" && currentStatus != "Chờ quyết toán")
            {
                return BadRequest(ApiResponse<string>.Fail($"Hồ sơ đang ở trạng thái '{currentStatus}'. Chỉ chuyến đi đã được duyệt hoặc đã tạm ứng mới có thể xác nhận hoàn thành chuyến đi."));
            }

            await connection.ExecuteAsync(
                "UPDATE DeXuatCongTac SET TrangThai = N'Chờ quyết toán' WHERE MaDeXuat = @MaDeXuat",
                new { MaDeXuat = cleanCode }
            );

            return Ok(ApiResponse<string>.Ok(cleanCode, "Xác nhận hoàn thành chuyến đi thành công. Hồ sơ đã chuyển sang Kế toán để đối soát chứng từ và chốt sổ quyết toán."));
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
    /// Xóa đề xuất (nếu là Bản nháp) hoặc Hủy đề xuất (nếu đang Chờ duyệt)
    /// </summary>
    [HttpDelete("{maDeXuat}")]
    public async Task<IActionResult> XoaHoacHuy(string maDeXuat)
    {
        try
        {
            using var connection = _db.CreateConnection();
            var status = await connection.ExecuteScalarAsync<string>(
                "SELECT TrangThai FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat",
                new { maDeXuat }
            );

            if (status == null)
            {
                return NotFound(ApiResponse<string>.Fail($"Không tìm thấy đề xuất '{maDeXuat}'."));
            }

            if (status == "Bản nháp")
            {
                await connection.ExecuteAsync("DELETE FROM DeXuatCongTac WHERE MaDeXuat = @MaDeXuat", new { maDeXuat });
                return Ok(ApiResponse<string>.Ok(maDeXuat, "Đã xóa bản nháp đề xuất thành công."));
            }
            else if (status == "Chờ duyệt")
            {
                await connection.ExecuteAsync("UPDATE DeXuatCongTac SET TrangThai = N'Đã hủy' WHERE MaDeXuat = @MaDeXuat", new { maDeXuat });
                return Ok(ApiResponse<string>.Ok(maDeXuat, "Đã hủy đề xuất công tác thành công."));
            }
            else
            {
                return BadRequest(ApiResponse<string>.Fail($"Không thể hủy đơn khi hồ sơ đã ở trạng thái '{status}'."));
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
}
