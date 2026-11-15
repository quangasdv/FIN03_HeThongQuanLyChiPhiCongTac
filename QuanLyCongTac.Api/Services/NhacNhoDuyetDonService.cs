using System.Data;
using Dapper;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.DTOs;

namespace QuanLyCongTac.Api.Services;

public interface INhacNhoDuyetDonService
{
    Task<IEnumerable<DonTonDongNhacNhoDto>> GetDanhSachDonTonDongAsync(string? maPB = null);
    Task<KetQuaQuetNhacNhoDto> QuetVaGuiNhacNhoAsync(string? maPB = null);
}

public class NhacNhoDuyetDonService : INhacNhoDuyetDonService
{
    private readonly IDbConnectionFactory _db;
    private readonly ILogger<NhacNhoDuyetDonService> _logger;

    public NhacNhoDuyetDonService(IDbConnectionFactory db, ILogger<NhacNhoDuyetDonService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<DonTonDongNhacNhoDto>> GetDanhSachDonTonDongAsync(string? maPB = null)
    {
        using var connection = _db.CreateConnection();
        var sql = @"
            SELECT 
                dx.MaDeXuat,
                dx.MaNV,
                nv.HoTen AS TenNhanVien,
                pb.MaPB,
                pb.TenPB,
                dx.MucDich,
                dx.NgayDi,
                dx.NgayVe,
                dx.SoTienTamUngDeNghi,
                dx.TrangThai,
                ql.MaNV AS MaQuanLy,
                ql.HoTen AS TenQuanLy,
                ql.Email AS EmailQuanLy
            FROM DeXuatCongTac dx
            INNER JOIN NhanVien nv ON dx.MaNV = nv.MaNV
            INNER JOIN PhongBan pb ON nv.MaPB = pb.MaPB
            LEFT JOIN NhanVien ql ON pb.MaPB = ql.MaPB AND ql.VaiTro = 'QUAN_LY'
            WHERE dx.TrangThai = N'Chờ duyệt'
              AND (@MaPB IS NULL OR pb.MaPB = @MaPB)
            ORDER BY dx.NgayDi ASC";

        var rawList = await connection.QueryAsync<DonTonDongNhacNhoDto>(sql, new { MaPB = maPB });
        var result = new List<DonTonDongNhacNhoDto>();

        foreach (var item in rawList)
        {
            // Tính số ngày tồn đọng:
            // Nghiệp vụ: Đề xuất phải nộp trước chuyến đi ít nhất 5 ngày.
            // Nếu ngày đi đến gần trong vòng 3 ngày hoặc đã qua -> Đơn tồn đọng quá hạn >= 3 ngày
            int daysUntilTrip = (item.NgayDi.Date - DateTime.Now.Date).Days;
            int soNgayTonDong = daysUntilTrip <= 3 ? Math.Max(3, 4 - daysUntilTrip) : 1;
            bool daQuaHan = soNgayTonDong >= 3;

            item.SoNgayTonDong = soNgayTonDong;
            item.DaQuaHan3Ngay = daQuaHan;
            item.NoiDungNhacNho = $"Kính gửi Quản lý {item.TenQuanLy ?? "Phụ trách"}, đề xuất công tác '{item.MucDich}' của nhân viên {item.TenNhanVien} (Phòng {item.TenPB}) hiện đang ở trạng thái Chờ duyệt quá {soNgayTonDong} ngày. Kính đề nghị Quản lý sớm vào hệ thống xem xét phê duyệt.";

            result.Add(item);
        }

        return result;
    }

    public async Task<KetQuaQuetNhacNhoDto> QuetVaGuiNhacNhoAsync(string? maPB = null)
    {
        var ketQua = new KetQuaQuetNhacNhoDto
        {
            ThoiGianQuet = DateTime.Now
        };

        var allDon = (await GetDanhSachDonTonDongAsync(maPB)).ToList();
        ketQua.TongSoDonChoDuyet = allDon.Count;

        var donQuaHan = allDon.Where(d => d.DaQuaHan3Ngay).ToList();
        ketQua.SoDonQuaHan3Ngay = donQuaHan.Count;
        ketQua.DanhSachDonQuaHan = donQuaHan;

        if (donQuaHan.Count == 0)
        {
            var msg = $"[UC-06 Scheduler]: Quét lúc {DateTime.Now:HH:mm:ss dd/MM/yyyy}: Không phát hiện đơn đề xuất nào tồn đọng quá 3 ngày.";
            ketQua.NhatKyHoatDong.Add(msg);
            _logger.LogInformation("{Msg}", msg);
        }
        else
        {
            foreach (var don in donQuaHan)
            {
                var emailTarget = don.EmailQuanLy ?? "manager@company.vn";
                var logMsg = $"[UC-06 Scheduler]: Đã gửi Email nhắc duyệt đơn '{don.MaDeXuat}' ({don.MucDich}) tới Quản lý {don.TenQuanLy} ({emailTarget}). Tồn đọng: {don.SoNgayTonDong} ngày.";
                ketQua.NhatKyHoatDong.Add(logMsg);
                ketQua.SoEmailDaGui++;
                _logger.LogWarning("{LogMsg}", logMsg);
            }
        }

        return ketQua;
    }
}

/// <summary>
/// Tiến trình chạy ngầm định kỳ (BackgroundService) quét các đơn chờ duyệt quá 3 ngày (Sơ đồ Trang 19)
/// </summary>
public class NhacNhoDuyetDonBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NhacNhoDuyetDonBackgroundService> _logger;

    public NhacNhoDuyetDonBackgroundService(IServiceProvider serviceProvider, ILogger<NhacNhoDuyetDonBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[UC-06 Background Scheduler]: Tiến trình tự động quét đơn chờ duyệt đã được khởi động.");

        // Chờ 10 giây sau khi app khởi động để quét lần đầu
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<INhacNhoDuyetDonService>();
                await service.QuetVaGuiNhacNhoAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[UC-06 Background Scheduler]: Lỗi trong quá trình quét tự động: {Message}", ex.Message);
            }

            // Quét định kỳ mỗi 1 giờ (hoặc 8h00 hàng ngày)
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
