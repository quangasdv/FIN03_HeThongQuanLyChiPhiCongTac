# HỆ THỐNG QUẢN LÝ CHI PHÍ CÔNG TÁC (FIN-03)

Báo cáo đồ án môn học: Phương pháp phát triển phần mềm hướng đối tượng (OOSD)
Sinh viên thực hiện: Nguyễn Đăng Quang - MSSV: 1250080152 - Lớp: 12_ĐH_CNPM2
Giảng viên hướng dẫn: ThS. Phạm Trọng Huynh
Khoa: Công nghệ Thông tin - Trường Đại học Tài nguyên và Môi trường TP.HCM
Mã nguồn GitHub: https://github.com/quangasdv/FIN03_HeThongQuanLyChiPhiCongTac

---

## MỤC LỤC

1. Giới thiệu hệ thống
2. Yêu cầu môi trường cài đặt
3. Hướng dẫn nạp cơ sở dữ liệu và dữ liệu mẫu
4. Hướng dẫn khởi chạy Backend và Frontend bằng Visual Studio
5. Hướng dẫn cấu hình Google Gemini Vision AI Key
6. Danh sách tài khoản kiểm thử
7. Quy trình nghiệp vụ đầy đủ của một đơn đề xuất
8. Tổng hợp các chức năng của hệ thống
9. Xử lý các sự cố thường gặp

---

## 1. GIỚI THIỆU HỆ THỐNG

Hệ thống Quản lý Chi phí Công tác (FIN-03) là giải pháp số hóa toàn diện quy trình công tác nội bộ dành cho doanh nghiệp và cơ quan tổ chức:

- Số hóa toàn diện quy trình truyền thống: Thay thế hoàn toàn các mẫu đơn giấy, hóa đơn in nhiệt dễ phai màu và các tệp bảng tính Excel theo dõi rời rạc, thiếu tính liên kết.
- Kiểm soát ngân sách tự động theo thời gian thực (Rule Engine): Tự động đối chiếu hạn mức chi tiêu theo từng cấp bậc chức vụ của nhân viên, từng loại chi phí và từng khung thời gian hiệu lực quy định.
- Công nghệ bóc tách hóa đơn tiêu chuẩn bằng Google Gemini Vision AI: Hệ thống lấy công nghệ thị giác trí tuệ nhân tạo Google Gemini Vision AI (Google Lens) làm chuẩn mực xử lý trung tâm, cho phép quét và đọc hiểu tự động 100% tiếng Việt từ hóa đơn, vé máy bay, biên lai cước xe, trích xuất chính xác tuyệt đối các trường: Số hóa đơn, Ngày lập, Đơn vị phát hành, Tổng tiền thực chi và Thuế VAT (đồng thời tích hợp Tesseract OCR chạy nội bộ làm cơ chế dự phòng).
- Cơ chế đối chiếu song song và cho phép chỉnh sửa dữ liệu linh hoạt (Human-in-the-Loop): Công nghệ OCR/AI đóng vai trò trợ lý nhập liệu tốc độ cao. Trường hợp ảnh chụp bị mờ, nhòe, lóa sáng hoặc OCR nhận diện sai lệch các trường thông tin (đặc biệt là Tổng tiền thực chi), cả Nhân viên (ở khâu khai báo) và Kế toán (ở khâu đối soát) đều được cung cấp màn hình so sánh trực quan song song giữa ảnh hóa đơn gốc và văn bản quét được, đồng thời có toàn quyền kiểm tra, chỉnh sửa lại trực tiếp số tiền và thông tin cho đúng 100% với thực tế trước khi chốt sổ.
- Quản lý chặt chẽ chu trình dòng tiền: Quản lý liên tục từ khâu Lập đề xuất và dự toán chi phí, Phê duyệt cấp quản lý, Chi tiền tạm ứng ngân quỹ, Đi công tác và Khai báo chi phí thực tế kèm chứng từ OCR/AI, Giải trình và Duyệt ngoại lệ đặc cách, cho đến khâu Kế toán đối soát, bù trừ tài chính hai chiều và Chốt sổ quyết toán.
- Đóng băng dữ liệu bảo vệ kiểm toán thuế (Trigger BR19): Tự động khóa cứng hồ sơ vĩnh viễn ở chế độ Chỉ đọc (Read-only) ngay sau khi kế toán chốt sổ, đảm bảo tính toàn vẹn và ngăn chặn tuyệt đối mọi hành vi chỉnh sửa, xóa dữ liệu lịch sử.

---

## 2. YEU CẦU MÔI TRƯỜNG CÀI ĐẶT

Máy tính cần được cài đặt sẵn các phần mềm và công cụ sau:

1. Hệ điều hành: Windows 10 hoặc Windows 11 (khuyến nghị).
2. .NET SDK: Phiên bản .NET 8.0 SDK (kiểm tra bằng lệnh: dotnet --version).
   Tải về tại: https://dotnet.microsoft.com/download/dotnet/8.0
3. Node.js và npm: Phiên bản Node.js 18.x trở lên, khuyến nghị Node.js 20.x LTS (kiểm tra bằng lệnh: node -v và npm -v).
   Tải về tại: https://nodejs.org/
4. Hệ quản trị cơ sở dữ liệu: Microsoft SQL Server (các phiên bản 2016, 2019, 2022 hoặc bản SQL Server Express).
5. Công cụ quản lý CSDL: SQL Server Management Studio (SSMS) hoặc Azure Data Studio.
6. Môi trường phát triển tích hợp (IDE): Microsoft Visual Studio 2022 (cần tích hợp sẵn workload "ASP.NET and web development").
7. Trình duyệt web: Google Chrome, Microsoft Edge hoặc Mozilla Firefox phiên bản mới nhất.

---

## 3. HƯỚNG DẪN NẠP CƠ SỞ DỮ LIỆU VÀ DỮ LIỆU MẪU

Cơ sở dữ liệu đã được đóng gói thành các tệp lệnh SQL chuẩn hóa, bao gồm toàn bộ cấu trúc 12 bảng, các ràng buộc toàn vẹn khóa ngoại và toàn bộ hồ sơ dữ liệu thực tế đã kiểm thử sẵn (14 chuyến đi ở đầy đủ các trạng thái: Đã chốt sổ, Đã duyệt, Chờ duyệt, Từ chối, Đã hủy).

Các bước thực hiện nạp CSDL qua SQL Server Management Studio (SSMS):

### Bước 3.1: Nạp kịch bản tạo bảng và dữ liệu mẫu (QuanLyCongTac.sql)
1. Khởi động SSMS và kết nối vào máy chủ SQL Server cục bộ trên máy tính (Localhost hoặc 127.0.0.1).
2. Chọn File -> Open -> File... và mở tệp tin:
   database/QuanLyCongTac.sql
3. Nhấn nút Execute (hoặc phím tắt F5) để thực thi.
4. Kết quả thực thi:
   - Tự động khởi tạo Database mang tên: QuanLyCongTac.
   - Tạo đầy đủ 12 bảng theo chuẩn ERD: PhongBan, NhanVien, LoaiChiPhi, QuyDinhDinhMuc, DeXuatCongTac, ChiTietDuToan, PhieuTamUng, PhieuKhaiBao, ChiTietKhaiBao, ChungTuOCR, GiaiTrinhNgoaiLe, PhieuQuyetToan.
   - Tự động nạp sẵn toàn bộ dữ liệu mẫu thực tế: 3 phòng ban, 5 tài khoản nhân viên theo từng vai trò, 4 danh mục loại chi phí, 4 quy tắc định mức, 14 hồ sơ chuyến đi kèm đầy đủ 32 khoản dự toán, 4 phiếu chi tạm ứng, 4 phiếu khai báo, 8 chứng từ OCR có đính kèm ảnh và JSON bóc tách dữ liệu, 2 giải trình ngoại lệ đã duyệt đặc cách, và 4 phiếu quyết toán chốt sổ.

### Bước 3.2: Nạp kịch bản Khung nhìn, Thủ tục và Triggers (Views_Procedures_Triggers.sql)
1. Trong SSMS, chọn File -> Open -> File... và mở tiếp tệp tin:
   database/Views_Procedures_Triggers.sql
2. Nhấn nút Execute (hoặc phím tắt F5) để thực thi.
3. Kết quả thực thi:
   - Tạo 3 Khung nhìn (Views) phục vụ báo cáo: vw_DanhSachDeXuat, vw_ChiTietKhaiBaoChungTu, vw_TongHopQuyetToan.
   - Tạo 4 Thủ tục lưu trữ (Stored Procedures) cốt lõi: sp_TaoDeXuatVaDuToan, sp_PheDuyetDeXuat, sp_ChiTamUng, sp_ChotSoQuyetToan.
   - Tạo 2 Ràng buộc toàn vẹn tự động (Triggers): trg_CheckDinhMucDuToan (kiểm tra định mức khi lập dự toán), trg_KhoaDuLieuSauQuyetToan (khóa đóng băng hồ sơ sau khi kế toán chốt sổ).

### Bước 3.3: Cấu hình chuỗi kết nối trong appsettings.json
Mở tệp tin: QuanLyCongTac.Api/appsettings.json
Kiểm tra chuỗi kết nối DefaultConnection sao cho phù hợp với cấu hình SQL Server trên máy tính của bạn:

- Trường hợp sử dụng tài khoản SQL Server (sa):
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=127.0.0.1;Database=QuanLyCongTac;User Id=sa;Password=123;TrustServerCertificate=True;"
}
```

- Trường hợp sử dụng chế độ xác thực Windows (Windows Authentication - không cần mật khẩu):
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=QuanLyCongTac;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

---

## 4. HƯỚNG DẪN KHỞI CHẠY BACKEND VÀ FRONTEND BẰNG VISUAL STUDIO

Dự án được cấu hình bằng một Solution duy nhất là QuanLyCongTac.sln chứa cả hai dự án Backend API và Frontend Web.

### Bước 4.1: Mở Solution trong Visual Studio 2022
1. Khởi động Visual Studio 2022.
2. Chọn Open a project or solution và điều hướng mở tệp tin QuanLyCongTac.sln tại thư mục gốc của dự án.
3. Cửa sổ Solution Explorer sẽ hiển thị cấu trúc gồm:
   - Dự án Backend: QuanLyCongTac.Api (ASP.NET Core Web API .NET 8).
   - Dự án Frontend: QuanLyCongTac.Web (React 19 + Vite).

### Bước 4.2: Khởi chạy Backend (QuanLyCongTac.Api)
1. Trong cửa sổ Solution Explorer, nhấp chuột phải vào dự án QuanLyCongTac.Api và chọn Set as Startup Project.
2. Kiểm tra hồ sơ khởi chạy trên thanh công cụ đang để là QuanLyCongTac.Api (hoặc http).
3. Nhấn phím F5 (Start Debugging) hoặc tổ hợp Ctrl + F5 (Start Without Debugging).
4. Cửa sổ Console của Backend sẽ hiển thị thông báo:
   Now listening on: http://localhost:5112
5. Backend đã sẵn sàng nhận kết nối. Bạn có thể kiểm tra trực tiếp tài liệu tương tác API Swagger tại:
   http://localhost:5112/swagger

### Bước 4.3: Khởi chạy Frontend (QuanLyCongTac.Web) bằng Terminal trong Visual Studio
1. Trên thanh bảng chọn của Visual Studio, vào menu View -> Terminal (hoặc nhấn tổ hợp phím tắt Ctrl + `).
2. Cửa sổ Developer PowerShell sẽ mở ra ở nửa dưới giao diện Visual Studio.
3. Di chuyển vào thư mục dự án Frontend bằng lệnh:
```powershell
cd QuanLyCongTac.Web
```
4. Cài đặt các gói thư viện phụ thuộc (chỉ cần thực hiện ở lần đầu tiên):
```powershell
npm install
```
5. Khởi động máy chủ phát triển Frontend:
```powershell
npm run dev
```
6. Cửa sổ Terminal sẽ xuất hiện thông báo:
   VITE ready in ... ms
   Local: http://localhost:5173/
7. Mở trình duyệt web và truy cập vào địa chỉ:
   http://localhost:5173

Lưu ý về cơ chế điều hướng cổng:
- Cổng 5112 (http://localhost:5112): Cung cấp các điểm cuối RESTful API backend và Swagger.
- Cổng 5173 (http://localhost:5173): Giao diện người dùng Web App chính của hệ thống.
- Máy chủ phát triển Vite đã được thiết lập sẵn cơ chế Reverse Proxy: Tất cả các yêu cầu gửi đến tiền tố /api sẽ được tự động chuyển tiếp ngầm đến Backend cổng 5112, hoàn toàn không gặp lỗi CORS hay xung đột cổng.

---

## 5. HƯỚNG DẪN CẤU HÌNH GOOGLE GEMINI VISION AI KEY

Hệ thống đặt công nghệ Google Gemini Vision AI làm chuẩn quét bóc tách hóa đơn chính thức nhằm đạt độ chính xác cao nhất đối với các hóa đơn tiếng Việt, hóa đơn in nhiệt và vé điện tử.

Để kích hoạt tính năng bóc tách AI tiêu chuẩn này, bạn thực hiện cấu hình theo các bước sau:

### Bước 5.1: Nhận mã khóa API miễn phí từ Google AI Studio
1. Truy cập vào trang quản lý chính thức của Google AI Studio:
   https://aistudio.google.com/
2. Đăng nhập bằng tài khoản Google / Gmail cá nhân của bạn.
3. Nhấn vào nút "Get API key" (hoặc "Create API key").
4. Chọn "Create API key in new project" (Tạo khóa trong dự án mới).
5. Sao chép (Copy) chuỗi ký tự API Key được cấp.

### Bước 5.2: Cài đặt API Key vào hệ thống (Chọn 1 trong 2 cách)

#### Cách 1: Cài đặt trực tiếp qua giao diện Web (Khuyên dùng)
1. Mở giao diện ứng dụng web tại: http://localhost:5173
2. Đăng nhập bằng tài khoản bất kỳ (ví dụ tài khoản Nhân viên: nguyenvanthuan@gmail.com / 123123).
3. Vào tab "Khai Báo Chi Phí".
4. Nhấn vào nút "Cấu hình AI Vision" trên thanh công cụ.
5. Dán chuỗi API Key của bạn vào ô nhập và nhấn "Lưu cấu hình".
6. Hệ thống sẽ lưu trữ an toàn khóa API vào trình duyệt của bạn (localStorage), từ đó mọi thao tác tải hóa đơn sẽ tự động được gửi qua Google Gemini Vision AI để bóc tách dữ liệu tức thì mà không cần chỉnh sửa mã nguồn.

#### Cách 2: Dán trực tiếp vào mã nguồn Frontend (Dành cho lập trình viên / Chạy cố định)
1. Mở tệp tin mã nguồn:
   QuanLyCongTac.Web/src/App.jsx
2. Tìm đến dòng 5819 (khai báo biến DEFAULT_GEMINI_KEY).
3. Dán chuỗi API Key vừa lấy từ Google AI Studio vào giữa hai dấu nháy đơn:
```javascript
const DEFAULT_GEMINI_KEY = 'DÁN_GEMINI_API_KEY_CỦA_BẠN_VÀO_ĐÂY';
```
4. Nhấn Ctrl + S để lưu tệp tin. Hệ thống sẽ tự động áp dụng khóa mặc định này cho toàn bộ người dùng mà không cần nhập qua giao diện.
(Lưu ý: Nếu bạn đẩy mã nguồn lên GitHub công khai, hãy xóa khóa này trước khi commit để tránh bị GitHub Push Protection chặn).

Ghi chú về cơ chế dự phòng: Trường hợp máy tính không có kết nối Internet hoặc chưa nhập API Key, hệ thống tự động chuyển sang cơ chế dự phòng sử dụng Tesseract OCR để nhận dạng cục bộ.

---

## 6. DANH SÁCH TÀI KHOẢN KIỂM THỬ

Hệ thống triển khai phân quyền theo mô hình RBAC (Role-Based Access Control) với 4 vai trò độc lập. Dữ liệu mẫu đã có sẵn các tài khoản sau (tất cả mật khẩu mặc định là: 123123 (hệ thống hỗ trợ đăng nhập song song cả 123123 và 123456)):

| Mã NV / Email đăng nhập | Mật khẩu | Họ và tên | Chức vụ và Phòng ban | Vai trò (Role) | Trách nhiệm chính trong hệ thống |
| :--- | :---: | :--- | :--- | :--- | :--- |
| nguyenvanthuan@gmail.com (NV01) | 123123 | Nguyễn Văn Thuận | Kỹ sư phần mềm Onsite (Phòng CNTT) | NHAN_VIEN | Lập đề xuất, khai báo chi phí thực tế, quét hóa đơn AI, giải trình ngoại lệ, xác nhận hoàn thành chuyến đi, xem bảng quyết toán BM5 |
| trandinh@gmail.com (QL01) | 123123 | Trần Định | Trưởng phòng IT (Phòng CNTT) | QUAN_LY | Phê duyệt hoặc từ chối đề xuất chuyến đi, xét duyệt đặc cách các khoản chi ngoại lệ vượt định mức, giám sát công tác phòng ban |
| lethithu@gmail.com (KT01) | 123123 | Lê Thị Thu | Kế toán thanh toán (Phòng Kế toán - Tài chính) | KE_TOAN | Giải ngân chi tiền tạm ứng, đối soát hóa đơn chứng từ, điều chỉnh số tiền thực tế, chốt sổ quyết toán khóa hồ sơ, cấu hình Rule Engine |
| admin@gmail.com (ADMIN) | 123123 | Nguyễn Đăng Quang | Quản trị viên hệ thống (Phòng CNTT) | ADMIN | Quản lý danh mục phòng ban, quản lý danh sách nhân sự, phân bổ vai trò tài khoản và đặt lại mật khẩu cho người dùng |
| nguyenminhtai@gmail.com (NV02) | 123123 | Nguyễn Minh Tài | Nhân viên (Phòng Kế toán - Tài chính) | NHAN_VIEN | Nhân viên thuộc phòng ban Kế toán thực hiện các quy trình lập đơn công tác tương tự NV01 |

---

## 7. QUY TRÌNH NGHIỆP VỤ ĐẦY ĐỦ CỦA MỘT ĐƠN ĐỀ XUẤT

Dưới đây là chu trình khép kín 8 bước từ thời điểm nhân viên tạo đơn cho đến khi hồ sơ được đóng băng vĩnh viễn:

```text
[Bước 1: NV01 Lập đề xuất & bảng dự toán]
        |
        v
[Bước 2: QL01 Phê duyệt chuyến đi]
        |
        v
[Bước 3: KT01 Giải ngân chi tiền tạm ứng]
        |
        v
[Bước 4: NV01 Đi công tác, Khai báo chi phí & Quét AI hóa đơn]
        |
        +---> Có khoản chi Vượt định mức? 
        |       |-- Có: [Bước 5: QL01 Duyệt đặc cách ngoại lệ]
        |       +-- Không: Chuyển thẳng tới Kế toán
        v
[Bước 6: NV01 Xác nhận Hoàn thành chuyến đi]
        |
        v
[Bước 7: KT01 Đối soát chứng từ, Điều chỉnh chi phí & Chốt sổ quyết toán]
        |
        v
[Bước 8: Trigger BR19 Tự động đóng băng vĩnh viễn hồ sơ (Read-only)]
```

### Chi tiết các bước thực hiện:

### Bước 1: Nhân viên lập đề xuất công tác và bảng dự toán chi phí (BM1, BM2)
- Tài khoản thực hiện: Đăng nhập NV01 / 123123 (Nguyễn Văn Thuận).
- Thao tác:
  1. Chọn tab "Đề Xuất Công Tác" -> Nhấn nút "Tạo Đề Xuất Mới".
  2. Điền các thông tin tổng quan: Mục đích công tác, Ngày đi, Ngày về.
  3. Điền số tiền đề nghị xin tạm ứng ngân quỹ (BM2).
  4. Thêm các dòng chi tiết dự toán chi phí (BM1): Vé máy bay khứ hồi, Tiền thuê phòng khách sạn, Cước di chuyển taxi, Chi phí tiếp khách.
  5. Hệ thống kích hoạt Rule Engine kiểm tra hạn mức: Nếu dòng dự toán nào vượt định mức quy định, hệ thống tự động yêu cầu nhập lý do giải trình ngay tại bảng dự toán.
  6. Nhấn nút "Lưu Đề Xuất". Đề xuất được lưu vào CSDL với mã tự động sinh (ví dụ: DX_261116_XXXX) và đặt ở trạng thái ban đầu là "Chờ duyệt".

### Bước 2: Quản lý phòng ban phê duyệt đề xuất công tác
- Tài khoản thực hiện: Đăng xuất, đăng nhập tài khoản QL01 / 123123 (Trần Định).
- Thao tác:
  1. Chọn tab "Phê Duyệt Đề Xuất".
  2. Tại danh sách đề xuất chờ duyệt của phòng ban, chọn đơn đề xuất của nhân viên vừa tạo.
  3. Kiểm tra chi tiết lịch trình công tác, mục đích và từng khoản dự toán chi phí.
  4. Nhấn nút "Duyệt Đề Xuất" (hoặc nhấn "Từ chối" kèm theo lý do từ chối cụ thể).
  5. Trạng thái đề xuất được cập nhật chuyển sang "Đã duyệt".

### Bước 3: Kế toán thanh toán giải ngân chi tiền tạm ứng
- Tài khoản thực hiện: Đăng xuất, đăng nhập tài khoản KT01 / 123123 (Lê Thị Thu).
- Thao tác:
  1. Chọn tab "Quản Lý Tạm Ứng".
  2. Tìm đơn đề xuất vừa được Quản lý duyệt trong danh sách chờ tạm ứng.
  3. Nhập số tiền thực tế giải ngân và chọn hình thức thanh toán (Chuyển khoản ngân hàng hoặc Tiền mặt).
  4. Nhấn nút "Xác Nhận Chi Tạm Ứng".
  5. Hệ thống gọi thủ tục sp_ChiTamUng, tự động sinh phiếu tạm ứng mang mã TU_... và chuyển trạng thái chuyến đi sang "Đã tạm ứng". Khi đó nhân viên mới đủ điều kiện khai báo hóa đơn.

### Bước 4: Nhân viên khai báo chi phí thực tế và quét bóc tách hóa đơn bằng Google Gemini Vision AI
- Tài khoản thực hiện: Đăng xuất, đăng nhập lại tài khoản NV01 / 123123.
- Thao tác:
  1. Chọn tab "Khai Báo Chi Phí".
  2. Chọn chuyến đi đang ở trạng thái đã tạm ứng để tạo phiếu khai báo chi phí.
  3. Nhấn "Thêm Khoản Chi & Hóa Đơn".
  
  Lưu ý quan trọng về tệp ảnh hóa đơn thực tế dùng cho kiểm thử:
  Để kiểm thử chính xác hiệu quả bóc tách thông minh của Google Gemini Vision AI, vui lòng sử dụng các hình ảnh hóa đơn thực tế đã được chuẩn bị sẵn trong thư mục dự án tại đường dẫn:
  so do va anh/HoaDonThucTe/
  Các tệp ảnh hóa đơn tiêu biểu sẵn sàng cho việc kiểm thử gồm có:
  - xuat-hoa-don-ve-may-bay-3.webp: Hóa đơn điện tử vé máy bay phù hợp kiểm thử khoản chi Vé máy bay khứ hồi.
  - 02_vinasun_taxi_real.png: Biên lai cước taxi Vinasun phù hợp kiểm thử khoản chi Di chuyển taxi.
  - 1728633765023.png: Hóa đơn dịch vụ lưu trú phòng nghỉ tại Khách sạn Mường Thanh Grand.
  - 1759803237-w-bill-3583-width975height1200.jpg: Hóa đơn thanh toán bàn tiệc tiếp khách tại Nhà hàng Ẩm Thực Sông Hàn.
  - 1441.png: Hóa đơn bán lẻ vật tư và các chi phí khác.

  4. Sau khi chọn tệp ảnh hóa đơn thực tế từ thư mục HoaDonThucTe nêu trên, nhấn nút "Bóc tách OCR":
     - Hệ thống kết nối Google Gemini Vision AI xử lý trực tiếp hình ảnh, tự động trích xuất các trường thông tin: Số hóa đơn, Ngày phát hành, Tên đơn vị cung cấp, Tổng số tiền thực thanh toán và Thuế VAT để tự động điền vào biểu mẫu khai báo.
     
     Lưu ý đặc biệt quan trọng về việc đối chiếu và chỉnh sửa của Nhân viên:
     Sau khi hệ thống quét xong, giao diện hiển thị trực quan song song giữa ảnh chụp hóa đơn gốc và toàn bộ dữ liệu text bóc tách được. Trong trường hợp hóa đơn bị mờ, chụp nghiêng, lóa sáng hoặc AI/OCR nhận diện sai lệch (ví dụ đọc nhầm số hoặc gán sai tổng tiền), Nhân viên hoàn toàn có thể so sánh trực tiếp ảnh gốc với text quét được để kiểm tra và chỉnh sửa lại các ô nhập liệu (Tổng tiền thực tế, Số hóa đơn, Ngày chi) cho đúng 100% với thực tế trước khi gửi duyệt.

  5. Kiểm tra định mức thực chi:
     - Nếu số tiền thực tế vượt định mức chi tiêu hiện hành, hệ thống hiển thị cảnh báo viền vàng và kích hoạt ô bắt buộc nhập "Lý do giải trình ngoại lệ vượt mức (BM4)".
  6. Nhấn nút "Lưu & Gửi Khai Báo".
  7. Nếu có khoản chi vượt định mức, hồ sơ tự động chuyển sang trạng thái "Chờ duyệt ngoại lệ". Nếu tất cả khoản chi đều nằm trong hạn mức, hồ sơ chuyển sang trạng thái chờ Kế toán đối soát.

### Bước 5: Quản lý phòng ban phê duyệt đặc cách ngoại lệ chi phí
- Tài khoản thực hiện: Đăng nhập QL01 / 123123.
- Thao tác:
  1. Chọn tab "Duyệt Ngoại Lệ".
  2. Hệ thống hiển thị danh sách các khoản chi vượt hạn mức kèm theo hình ảnh hóa đơn gốc, số tiền vượt mức và văn bản giải trình lý do của nhân viên.
  3. Quản lý nhấn nút "Duyệt Đặc Cách" (hoặc "Bác bỏ").
  4. Khoản chi được cập nhật kết quả phê duyệt thành "Đã duyệt đặc cách" và đồng bộ trạng thái chi phí hợp lệ.

### Bước 6: Nhân viên xác nhận hoàn thành chuyến đi
- Tài khoản thực hiện: Đăng nhập NV01 / 123123.
- Thao tác:
  1. Chọn tab "Đề Xuất Công Tác".
  2. Tìm chuyến đi đã kết thúc công tác thực địa và đã được Quản lý duyệt đặc cách ngoại lệ.
  3. Nhấn nút "Hoàn thành chuyến đi".
  4. Hệ thống kiểm tra toàn bộ điều kiện, xác nhận chuyến đi đã hoàn tất khai báo và chuyển toàn bộ hồ sơ sang cho bộ phận Kế toán chốt sổ.

### Bước 7: Kế toán đối soát chứng từ, điều chỉnh chi phí và chốt sổ quyết toán
- Tài khoản thực hiện: Đăng nhập KT01 / 123123.
- Thao tác:
  1. Chọn tab "Đối Soát & Quyết Toán".
  2. Chọn hồ sơ chuyến đi cần chốt sổ tài chính.
  3. Kế toán đối chiếu giữa số liệu AI bóc tách và ảnh chụp chứng từ gốc đính kèm:
     
     Lưu ý đặc biệt quan trọng về quyền kiểm tra và điều chỉnh của Kế toán:
     Tại màn hình đối soát, Kế toán được cung cấp bảng so sánh song song trực quan giữa ảnh hóa đơn gốc và dữ liệu text/OCR đã bóc tách. Nếu phát hiện AI/OCR quét sai, nhận diện nhầm số tiền, gán sai tổng tiền hoặc nhân viên khai báo chưa chuẩn xác, Kế toán hoàn toàn có quyền sử dụng chức năng "Điều chỉnh chi phí" ngay trên dòng chứng từ đó để chỉnh sửa lại số tiền thực chi được duyệt thanh toán về đúng giá trị thực tế hợp lệ trước khi bấm chốt sổ.

  4. Hệ thống tự động tính toán số tiền bù trừ tài chính theo quy định:
     Số tiền bù trừ = Tổng chi phí thực tế hợp lệ (sau điều chỉnh) - Số tiền đã chi tạm ứng
     - Nếu Tiền bù trừ > 0: Công ty lập lệnh chi trả thêm tiền cho nhân viên.
     - Nếu Tiền bù trừ < 0: Nhân viên có trách nhiệm nộp trả lại số tiền thừa vào quỹ công ty.
     - Nếu Tiền bù trừ = 0: Thanh toán tài chính cân bằng.
  5. Nhấn nút "Xác Nhận Chốt Sổ Quyết Toán & Khóa Hồ Sơ".

### Bước 8: Tự động khóa đóng băng dữ liệu kiểm toán (Trigger BR19)
- Sau khi thủ tục sp_ChotSoQuyetToan hoàn thành, hệ thống sinh mã phiếu quyết toán QT_... và cập nhật trạng thái đề xuất thành "Đã chốt sổ".
- Trigger trg_KhoaDuLieuSauQuyetToan được kích hoạt: Toàn bộ hồ sơ chuyến đi lập tức bị đóng băng vĩnh viễn ở chế độ Chỉ đọc (Read-only), ngăn chặn hoàn toàn mọi thao tác sửa đổi hoặc xóa đề xuất để bảo vệ tính pháp lý cho công tác kiểm toán thuế.
- Người dùng và kế toán có thể xem, tải hoặc in Bảng thanh toán quyết toán chi phí công tác theo đúng biểu mẫu BM5.

---

## 8. TỔNG HỢP CÁC CHỨC NĂNG CỦA HỆ THỐNG

### 8.1. Phân hệ dành cho Nhân viên (Role NHAN_VIEN)
- Quản lý danh sách chuyến đi công tác cá nhân: Theo dõi trạng thái, tiến độ và lịch sử toàn bộ các chuyến đi.
- Lập đề xuất công tác và Bảng dự toán chi phí: Nhập lịch trình, dự toán từng khoản mục và số tiền xin tạm ứng.
- Khai báo chi phí thực tế: Kê khai các hóa đơn phát sinh trong quá trình công tác.
- Tích hợp quét hóa đơn bằng Google Gemini Vision AI: Tải ảnh hóa đơn lên hệ thống, tự động nhận dạng và điền thông tin thông minh mà không cần nhập tay.
- Đối chiếu song song và quyền chỉnh sửa dữ liệu OCR: Cho phép Nhân viên xem trực quan song song giữa ảnh hóa đơn gốc và văn bản quét được để chủ động kiểm tra và sửa lại tổng tiền, số hóa đơn nếu AI/OCR quét sai lệch trước khi gửi duyệt.
- Giải trình ngoại lệ chi phí vượt định mức: Tự động cảnh báo vượt định mức và hỗ trợ gửi văn bản giải trình lý do trực tiếp lên Quản lý.
- Xác nhận hoàn thành chuyến đi: Đồng bộ trạng thái kết thúc chuyến đi để chuyển hồ sơ sang khâu kế toán.
- Xem Bảng thanh quyết toán chi phí công tác (Biểu mẫu BM5): Tra cứu chi tiết tổng chi, số tiền tạm ứng và khoản bù trừ tài chính.

### 8.2. Phân hệ dành cho Quản lý phòng ban (Role QUAN_LY)
- Phê duyệt đề xuất chuyến đi: Xem xét mục đích, lịch trình, ngân sách dự toán của nhân viên và ra quyết định Phê duyệt hoặc Từ chối.
- Xét duyệt chi phí ngoại lệ: Kiểm tra các khoản chi vượt định mức kèm theo ảnh chụp hóa đơn gốc và giải trình của nhân viên để ra quyết định Duyệt đặc cách hoặc Bác bỏ.
- Giám sát tiến độ công tác phòng ban: Theo dõi tổng thể tình hình đi công tác của tất cả nhân sự trong phòng ban.
- Tiếp nhận thông báo nhắc nhở đơn tồn đọng: Nhận cảnh báo tự động khi có các đơn đề xuất chờ duyệt quá hạn xử lý.

### 8.3. Phân hệ dành cho Kế toán thanh toán (Role KE_TOAN)
- Quản lý giải ngân chi tạm ứng: Tiếp nhận danh sách các đơn đã duyệt, thực hiện chi tiền tạm ứng và xuất phiếu tạm ứng.
- Đối soát chứng từ hóa đơn AI: So sánh trực quan song song dữ liệu bóc tách quang học với ảnh chụp hóa đơn gốc để kiểm tra tính hợp lệ.
- Quyền điều chỉnh số tiền thực chi: Cho phép Kế toán can thiệp chỉnh sửa lại số tiền hợp lệ của từng chứng từ nếu phát hiện AI/OCR quét sai hoặc gán sai tổng tiền trước khi chốt sổ.
- Chốt sổ quyết toán tài chính: Khóa sổ quyết toán và tính toán khoản tiền bù trừ tài chính hai chiều.
- Bảng tổng hợp quyết toán toàn viện (Dashboard Kế toán): Thống kê toàn bộ các chuyến đi đã chốt sổ, tổng kinh phí chi trả, tạm ứng và hướng xử lý tài chính.
- Quản trị động cơ quy tắc định mức (Rule Engine):
  + Quản lý danh mục các loại chi phí (Thêm mới, sửa thông tin loại chi phí).
  + Thiết lập hạn mức chi tiêu tối đa theo từng loại chi phí và cấp bậc nhân sự.
  + Quản lý lịch sử và thời hạn hiệu lực của từng quy định định mức theo từng phiên bản.

### 8.4. Phân hệ dành cho Quản trị viên hệ thống (Role ADMIN)
- Quản lý danh mục phòng ban: Thêm mới, cập nhật tên và xóa phòng ban trong toàn doanh nghiệp.
- Quản lý danh sách người dùng và nhân viên: Thêm mới nhân viên, điều chỉnh phòng ban, chức vụ, số tài khoản ngân hàng và email.
- Phân bổ vai trò tài khoản (Role Assignment): Cấp phát và điều chuyển quyền hạn giữa các vai trò NHAN_VIEN, QUAN_LY, KE_TOAN, ADMIN.
- Đặt lại mật khẩu (Reset Password): Khôi phục mật khẩu mặc định (123123) khi người dùng quên thông tin đăng nhập.

### 8.5. Dịch vụ nền tự động quét nhắc nhở đơn tồn đọng (Background Notification Worker)
- Cơ chế quét nền tự động: Định kỳ quét kiểm tra các đơn đề xuất ở trạng thái "Chờ duyệt" đã tồn đọng vượt quá số ngày quy định.
- Tự động phát thông báo: Gửi thông báo trực tiếp đến hệ thống để nhắc nhở Quản lý phòng ban kịp thời xét duyệt đơn, tránh ảnh hưởng đến kế hoạch công tác của nhân sự.

---

## 9. XỬ LÝ CÁC SỰ CỐ THƯỜNG GẶP

### 1. Lỗi không mở được Database "Cannot open database 'QuanLyCongTac'" hoặc "Login failed for user"
- Nguyên nhân: Chưa chạy script nạp CSDL trong SSMS hoặc mật khẩu sa trong tệp appsettings.json chưa khớp với máy chủ SQL Server.
- Cách khắc phục:
  1. Mở SSMS, kiểm tra database QuanLyCongTac đã hiển thị trong danh sách Object Explorer chưa. Nếu chưa có, mở và chạy lại tệp tin database/QuanLyCongTac.sql.
  2. Mở tệp tin QuanLyCongTac.Api/appsettings.json, kiểm tra lại tên Server, User Id và Password. Nếu máy tính sử dụng xác thực Windows Authentication, đổi chuỗi kết nối sang dạng:
     "DefaultConnection": "Server=.;Database=QuanLyCongTac;Trusted_Connection=True;TrustServerCertificate=True;"

### 2. Giao diện mở lên chỉ thấy trang trắng hoặc báo lỗi "Network Error"
- Nguyên nhân: Dự án Backend API chưa được khởi chạy hoặc đã bị dừng lại.
- Cách khắc phục: Kiểm tra cửa sổ Console Backend trong Visual Studio xem đã hiển thị dòng chữ "Now listening on: http://localhost:5112" chưa. Nếu chưa, nhấn Ctrl + F5 tại dự án QuanLyCongTac.Api để khởi chạy lại Backend.

### 3. Lỗi String or binary data would be truncated ở bảng ChungTuOCR
- Nguyên nhân: Cột DataBocTach chứa chuỗi dữ liệu JSON OCR có độ dài vượt quá giới hạn 1000 ký tự trên cấu trúc cũ.
- Cách khắc phục: Tệp tin kịch bản database/QuanLyCongTac.sql đã được cập nhật nâng cấp cột DataBocTach và LinkAnh lên kiểu NVARCHAR(MAX). Đảm bảo bạn đang sử dụng bản kịch bản CSDL mới nhất trong thư mục database/.

### 4. Lỗi chiếm dụng cổng kết nối (Port 5112 hoặc 5173 is already in use)
- Nguyên nhân: Có tiến trình ứng dụng cũ đang chạy ngầm chiếm giữ cổng mạng.
- Cách khắc phục: Mở cửa sổ PowerShell bằng quyền Administrator và chạy các câu lệnh sau để giải phóng cổng:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5112).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

---

Tài liệu hướng dẫn được hoàn thiện phục vụ công tác nghiệm thu đồ án môn học Phương pháp phát triển phần mềm hướng đối tượng (FIN-03).
