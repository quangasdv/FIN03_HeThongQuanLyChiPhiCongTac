using Microsoft.Data.SqlClient;
using System.Text.RegularExpressions;

namespace QuanLyCongTac.Api.Data;

public static class SqlErrorHelper
{
    public static string Translate(SqlException ex)
    {
        // 1. Lỗi vi phạm Primary Key hoặc Unique Constraint (2627: Unique constraint, 2601: Unique index)
        if (ex.Number == 2627 || ex.Number == 2601)
        {
            var msg = ex.Message;
            if (msg.Contains("PK_DeXuatCongTac") || msg.Contains("dbo.DeXuatCongTac"))
            {
                var match = Regex.Match(msg, @"duplicate key value is \((.*?)\)");
                var key = match.Success ? match.Groups[1].Value : "";
                return $"Mã đề xuất công tác '{key}' đã tồn tại trong hệ thống. Vui lòng nhấn 'Làm mới mã' hoặc nhập mã đề xuất khác.";
            }

            if (msg.Contains("PK_ChiTietDuToan") || msg.Contains("dbo.ChiTietDuToan"))
            {
                return "Bảng dự toán có nhiều dòng trùng loại chi phí. Vui lòng gộp chung hoặc chọn các loại chi phí khác nhau.";
            }

            if (msg.Contains("UQ_PhieuTamUng_DeXuat") || msg.Contains("PK_PhieuTamUng") || msg.Contains("PhieuTamUng"))
            {
                return "Đề xuất công tác này đã được chi tiền tạm ứng trước đó (Mỗi chuyến đi chỉ được tạm ứng tối đa 1 lần).";
            }

            if (msg.Contains("UQ_PhieuQuyetToan_DeXuat") || msg.Contains("PK_PhieuQuyetToan") || msg.Contains("PhieuQuyetToan"))
            {
                return "Đề xuất này đã được chốt sổ quyết toán tài chính.";
            }

            if (msg.Contains("UQ_GiaiTrinh_ChiTiet") || msg.Contains("PK_GiaiTrinhNgoaiLe"))
            {
                return "Khoản chi này đã được tạo văn bản giải trình ngoại lệ trước đó.";
            }

            if (msg.Contains("UQ_NhanVien_Email"))
            {
                return "Địa chỉ email này đã được sử dụng bởi một nhân viên khác trong hệ thống.";
            }

            if (msg.Contains("PK_NhanVien") || msg.Contains("dbo.NhanVien"))
            {
                return "Mã nhân viên đã tồn tại trong hệ thống. Vui lòng nhập mã nhân viên khác.";
            }

            if (msg.Contains("PK_QuyDinhDinhMuc") || msg.Contains("dbo.QuyDinhDinhMuc"))
            {
                return "Mã quy định định mức đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác.";
            }

            if (msg.Contains("PK_ChiTietKhaiBao") || msg.Contains("ChiTietKhaiBao"))
            {
                return "Mã khoản chi khai báo thực tế đã tồn tại trong hệ thống.";
            }

            if (msg.Contains("PK_ChungTuOCR") || msg.Contains("UQ_ChungTuOCR_ChiTiet") || msg.Contains("ChungTuOCR"))
            {
                return "Chứng từ hóa đơn đã được đính kèm vào một khoản chi khác trước đó.";
            }

            if (msg.Contains("PK_PhieuKhaiBao") || msg.Contains("UQ_PhieuKhaiBao_DeXuat") || msg.Contains("PhieuKhaiBao"))
            {
                return "Đề xuất công tác này đã có phiếu khai báo chi phí trong hệ thống.";
            }

            var generalMatch = Regex.Match(msg, @"duplicate key value is \((.*?)\)");
            var dupKey = generalMatch.Success ? $" (Mã bị trùng: {generalMatch.Groups[1].Value})" : "";
            return $"Dữ liệu bị trùng lặp khóa chính hoặc mã định danh đã tồn tại trong hệ thống{dupKey}.";
        }

        // 2. Lỗi vi phạm CHECK constraint hoặc FOREIGN KEY constraint (547)
        if (ex.Number == 547)
        {
            var msg = ex.Message;
            if (msg.Contains("CK_DeXuat_Ngay") || (msg.Contains("NgayVe") && msg.Contains("NgayDi")))
            {
                return "Ngày kết thúc chuyến đi phải lớn hơn hoặc bằng ngày bắt đầu (Ngày về >= Ngày đi).";
            }

            if (msg.Contains("CK_ChungTu_DungLuong") || msg.Contains("DungLuongMB"))
            {
                return "Dung lượng tệp ảnh chứng từ hóa đơn phải lớn hơn 0 và không vượt quá 500MB.";
            }

            if (msg.Contains("CK_DinhMuc_Ngay"))
            {
                return "Ngày hết hạn định mức không được nhỏ hơn ngày bắt đầu hiệu lực.";
            }

            if (msg.Contains("CK_TamUng_SoTien") || msg.Contains("SoTienTamUngDeNghi"))
            {
                return "Số tiền đề nghị tạm ứng không hợp lệ hoặc vượt quá tổng kinh phí dự toán.";
            }

            if (msg.Contains("FK_NhanVien_PhongBan"))
            {
                return "Phòng ban được gán cho nhân viên không tồn tại trong hệ thống.";
            }

            if (msg.Contains("FK_ChiTietDuToan_LoaiChiPhi") || msg.Contains("FK_ChiTietKhaiBao_LoaiChiPhi"))
            {
                return "Loại chi phí được chọn không tồn tại trong danh mục hệ thống.";
            }

            if (msg.Contains("FK_"))
            {
                return "Dữ liệu liên kết không hợp lệ hoặc đối tượng tham chiếu không tồn tại trong cơ sở dữ liệu.";
            }

            return "Dữ liệu không đáp ứng các ràng buộc toàn vẹn của hệ thống.";
        }

        // 3. Lỗi từ Trigger hoặc RAISERROR / THROW từ Stored Procedure (50000)
        if (ex.Number == 50000 || ex.Class >= 16)
        {
            var msg = ex.Message;
            msg = Regex.Replace(msg, @"The statement has been terminated\.?", "").Trim();

            if (msg.Contains("trg_CheckDinhMucDuToan") || msg.Contains("vượt định mức") || msg.Contains("giải trình"))
            {
                return "Khoản chi dự toán vượt định mức quy định nhưng chưa có lý do giải trình ngoại lệ. Vui lòng nhập lý do giải trình.";
            }

            if (msg.Contains("trg_KhoaDuLieuSauQuyetToan") || msg.Contains("chốt sổ") || msg.Contains("khóa"))
            {
                return "Hồ sơ chuyến đi đã chốt sổ quyết toán và bị đóng băng vĩnh viễn (Read-only). Không được phép chỉnh sửa hoặc xóa.";
            }

            if (msg.Contains("tự duyệt") || msg.Contains("chính mình"))
            {
                return "Cấp quản lý không được phép tự phê duyệt đề xuất công tác hoặc giải trình ngoại lệ của chính mình.";
            }

            if (msg.Contains("Đã duyệt"))
            {
                return "Chỉ được phép chi tạm ứng khi đề xuất công tác đang ở trạng thái 'Đã duyệt'.";
            }

            if (msg.Contains("chờ") || msg.Contains("chưa duyệt") || msg.Contains("hợp lệ"))
            {
                return "Chỉ được chốt sổ quyết toán khi toàn bộ chứng từ hóa đơn đã được đối soát và xác nhận hợp lệ.";
            }

            return !string.IsNullOrWhiteSpace(msg) ? msg : "Yêu cầu vi phạm quy tắc nghiệp vụ của hệ thống.";
        }

        // 4. Mặc định các lỗi khác
        var cleanMsg = Regex.Replace(ex.Message, @"The statement has been terminated\.?", "").Trim();
        return cleanMsg;
    }
}
