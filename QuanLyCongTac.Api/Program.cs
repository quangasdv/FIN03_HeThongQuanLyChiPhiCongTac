using Dapper;
using QuanLyCongTac.Api.Data;
using QuanLyCongTac.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Kestrel cho phép tải payload lớn (ảnh hóa đơn lên đến 500MB theo BR13)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 524288000; // 500MB
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = 524288000;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// 1. Cấu hình CORS cho phép React Frontend gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký DbConnectionFactory dùng Singleton để cung cấp kết nối SQL Server
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

// Đăng ký dịch vụ Quét nhắc nhở duyệt đơn tự động (UC-06 Sơ đồ Trang 19)
builder.Services.AddScoped<INhacNhoDuyetDonService, NhacNhoDuyetDonService>();
builder.Services.AddHostedService<NhacNhoDuyetDonBackgroundService>();

var app = builder.Build();

// Tự động nâng cấp độ dài cột LinkAnh và DataBocTach trong CSDL khi khởi động
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
    using var connection = db.CreateConnection();
    connection.Execute(@"
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ChungTuOCR' AND COLUMN_NAME = 'LinkAnh' AND (CHARACTER_MAXIMUM_LENGTH > 0 AND CHARACTER_MAXIMUM_LENGTH < 4000))
        BEGIN
            ALTER TABLE ChungTuOCR ALTER COLUMN LinkAnh NVARCHAR(MAX) NOT NULL;
        END
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ChungTuOCR' AND COLUMN_NAME = 'DataBocTach' AND (CHARACTER_MAXIMUM_LENGTH > 0 AND CHARACTER_MAXIMUM_LENGTH < 4000))
        BEGIN
            ALTER TABLE ChungTuOCR ALTER COLUMN DataBocTach NVARCHAR(MAX) NULL;
        END
    ");
}
catch (Exception ex)
{
    Console.WriteLine($"[Startup Migration Note]: {ex.Message}");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Hỗ trợ cả HTTP:5112 và HTTPS:7211 không bị ép chuyển hướng gây lỗi SSL certificate
app.UseStaticFiles();

// Phục vụ thêm thư mục HoaDonThucTe nếu client gọi trực tiếp qua backend API
var mainHoaDonPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "main", "HoaDonThucTe"));
if (Directory.Exists(mainHoaDonPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(mainHoaDonPath),
        RequestPath = "/HoaDonThucTe"
    });
}

// 2. Kích hoạt Middleware CORS (đặt trước app.UseAuthorization)
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// 3. Fallback Route xử lý lỗi 404 khi người dùng gọi sai URL endpoint API
app.MapFallback(async context =>
{
    context.Response.StatusCode = 404;
    context.Response.ContentType = "application/json; charset=utf-8";
    var response = new
    {
        success = false,
        message = $"Đường dẫn API '{context.Request.Path}' không tồn tại trong hệ thống FIN-03 (404 Not Found). Vui lòng kiểm tra lại URL.",
        data = (object?)null
    };
    await context.Response.WriteAsJsonAsync(response);
});

app.Run();
