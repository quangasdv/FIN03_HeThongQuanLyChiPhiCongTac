import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Search, 
  Calendar, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Minus
} from 'lucide-react';
import { getTongHopQuyetToan, getDepartments } from './api';

/**
 * Xem Báo Cáo Quyết Toán Tài Chính & Xuất Excel
 * Phục vụ: 
 * - Nhân viên (scope="PERSONAL"): Chỉ xem các chuyến đi của chính mình
 * - Quản lý (scope="DEPARTMENT"): Xem các chuyến đi thuộc phòng ban của mình
 * - Kế toán (scope="ALL"): Xem toàn bộ hồ sơ quyết toán toàn trường / toàn công ty
 */
export default function SettlementReportSection({ 
  currentUser, 
  scope = 'ALL', 
  formatVND, 
  formatDate, 
  showNotification 
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Bộ lọc báo cáo quyết toán
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [filterPhongBan, setFilterPhongBan] = useState('ALL');
  const [filterHuongXuLy, setFilterHuongXuLy] = useState('ALL');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (scope === 'PERSONAL' && currentUser?.maNV) {
        params.maNV = currentUser.maNV;
      } else if (scope === 'DEPARTMENT' && currentUser?.maPB) {
        params.maPB = currentUser.maPB;
      }
      const res = await getTongHopQuyetToan(params);
      if (res.data && res.data.success) {
        setList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      if (showNotification) {
        showNotification('error', 'Không thể tải bảng báo cáo quyết toán tài chính.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    if (scope === 'ALL') {
      getDepartments()
        .then((res) => {
          if (res.data && res.data.success) {
            setDepartments(res.data.data || []);
          }
        })
        .catch(() => {});
    }
  }, [scope, currentUser?.maNV, currentUser?.maPB]);

  // Bộ lọc dữ liệu theo thời gian, phòng ban, từ khóa và hướng tài chính
  const filteredList = list.filter((item) => {
    const kw = searchKeyword.trim().toLowerCase();
    const matchKw =
      !kw ||
      item.maQuyetToan?.toLowerCase().includes(kw) ||
      item.maDeXuat?.toLowerCase().includes(kw) ||
      item.nguoiDiCongTac?.toLowerCase().includes(kw) ||
      item.mucDich?.toLowerCase().includes(kw);

    const matchPB =
      filterPhongBan === 'ALL' ||
      item.maPB === filterPhongBan ||
      item.phongBan === filterPhongBan;

    let matchHuong = true;
    if (filterHuongXuLy === 'HOAN_TRA') {
      matchHuong = item.tienBuTru > 0;
    } else if (filterHuongXuLy === 'THU_HOI') {
      matchHuong = item.tienBuTru < 0;
    } else if (filterHuongXuLy === 'KHONG_CHENH_LECH') {
      matchHuong = item.tienBuTru === 0;
    }

    let matchDate = true;
    if (tuNgay && item.ngayChotSo) {
      matchDate = matchDate && new Date(item.ngayChotSo) >= new Date(tuNgay + 'T00:00:00');
    }
    if (denNgay && item.ngayChotSo) {
      matchDate = matchDate && new Date(item.ngayChotSo) <= new Date(denNgay + 'T23:59:59');
    }

    return matchKw && matchPB && matchHuong && matchDate;
  });

  // Thống kê nhanh
  const totalCount = filteredList.length;
  const totalTamUng = filteredList.reduce((acc, cur) => acc + (cur.tienTamUng || 0), 0);
  const totalThucChi = filteredList.reduce((acc, cur) => acc + (cur.tongChiHopLe || 0), 0);
  const totalBuTru = filteredList.reduce((acc, cur) => acc + (cur.tienBuTru || 0), 0);

  // Xuất file Excel / CSV UTF-8 kèm BOM
  const handleExportExcel = () => {
    if (filteredList.length === 0) {
      if (showNotification) {
        showNotification('warning', 'Không có dữ liệu trong kỳ báo cáo để xuất file!');
      }
      return;
    }

    const headers = [
      'Mã Quyết Toán',
      'Mã Đề Xuất',
      'Người Đi Công Tác',
      'Phòng Ban',
      'Mục Đích Chuyến Đi',
      'Kế Toán Chốt Sổ',
      'Ngày Chốt Sổ',
      'Tiền Tạm Ứng (VNĐ)',
      'Tổng Chi Hợp Lệ (VNĐ)',
      'Tiền Bù Trừ (VNĐ)',
      'Hướng Xử Lý Tài Chính',
      'Trạng Thái Hồ Sơ'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredList.map((item) =>
      [
        escapeCsv(item.maQuyetToan),
        escapeCsv(item.maDeXuat),
        escapeCsv(item.nguoiDiCongTac),
        escapeCsv(item.phongBan),
        escapeCsv(item.mucDich),
        escapeCsv(item.keToanChotSo || '—'),
        escapeCsv(formatDate ? formatDate(item.ngayChotSo) : item.ngayChotSo),
        item.tienTamUng || 0,
        item.tongChiHopLe || 0,
        item.tienBuTru || 0,
        escapeCsv(item.huongXuLyTaiChinh),
        escapeCsv(item.trangThaiHoSo)
      ].join(',')
    );

    // BOM UTF-8 (\uFEFF) giúp Excel trên Windows đọc chuẩn tiếng Việt có dấu
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    link.href = url;
    link.setAttribute('download', `BaoCao_QuyetToan_${scope}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showNotification) {
      showNotification('success', `Đã xuất ${filteredList.length} dòng báo cáo quyết toán ra file Excel (.csv UTF-8)!`);
    }
  };

  const getHeaderTitle = () => {
    if (scope === 'PERSONAL') return `Báo Cáo Quyết Toán Chuyến Đi Của ${currentUser?.hoTen || 'Cá Nhân'}`;
    if (scope === 'DEPARTMENT') return `Báo Cáo Quyết Toán Chuyến Đi ${currentUser?.tenPB || currentUser?.maPB || 'Phòng Ban'}`;
    return 'Bảng Tổng Hợp Quyết Toán Tài Chính Toàn Trường (vw_TongHopQuyetToan)';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút Xuất Excel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{getHeaderTitle()}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp số liệu quyết toán, bù trừ chi phí thực tế và xuất file báo cáo thuế (Chuẩn nội địa 100% VNĐ)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 text-slate-700 cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Làm mới
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Tải file Excel (.csv UTF-8)"
          >
            <Download className="w-4 h-4" />
            Xuất Excel (CSV)
          </button>
        </div>
      </div>

      {/* 2. Thẻ thống kê tài chính nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Hồ Sơ Đã Quyết Toán</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalCount} chuyến đi</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Tiền Tạm Ứng</p>
            <p className="text-xl font-bold text-purple-700 mt-0.5">
              {formatVND ? formatVND(totalTamUng) : totalTamUng.toLocaleString() + ' đ'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Thực Chi Hợp Lệ</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">
              {formatVND ? formatVND(totalThucChi) : totalThucChi.toLocaleString() + ' đ'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            totalBuTru > 0 
              ? 'bg-emerald-50 text-emerald-600' 
              : totalBuTru < 0 
                ? 'bg-amber-50 text-amber-600' 
                : 'bg-slate-50 text-slate-600'
          }`}>
            {totalBuTru > 0 ? (
              <ArrowDownLeft className="w-6 h-6" />
            ) : totalBuTru < 0 ? (
              <ArrowUpRight className="w-6 h-6" />
            ) : (
              <Minus className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              {totalBuTru > 0 ? 'Tổng Chi Trả Thêm Cho NV' : totalBuTru < 0 ? 'Tổng Tiền Cần Thu Hồi' : 'Cân Bằng Quỹ'}
            </p>
            <p className={`text-xl font-bold mt-0.5 ${
              totalBuTru > 0 ? 'text-emerald-700' : totalBuTru < 0 ? 'text-amber-700' : 'text-slate-700'
            }`}>
              {formatVND ? formatVND(Math.abs(totalBuTru)) : Math.abs(totalBuTru).toLocaleString() + ' đ'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Thanh bộ lọc đa tiêu chí (Thời gian, Phòng ban, Hướng xử lý, Từ khóa) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo Mã QT, Mã ĐX, Người đi, Mục đích..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Lọc phòng ban (Chỉ dành cho Kế toán / Toàn trường) */}
            {scope === 'ALL' && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={filterPhongBan}
                  onChange={(e) => setFilterPhongBan(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                >
                  <option value="ALL">-- Tất cả phòng ban --</option>
                  {departments.map((d) => (
                    <option key={d.maPB} value={d.maPB}>
                      {d.tenPB}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lọc hướng xử lý tài chính */}
            <select
              value={filterHuongXuLy}
              onChange={(e) => setFilterHuongXuLy(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
            >
              <option value="ALL">-- Tất cả hướng bù trừ --</option>
              <option value="HOAN_TRA">Hoàn trả thêm cho NV</option>
              <option value="THU_HOI">Thu hồi tiền nộp lại quỹ</option>
              <option value="KHONG_CHENH_LECH">Không chênh lệch</option>
            </select>

            {/* Lọc khoảng thời gian */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Từ:</span>
              <input
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none border-b border-slate-300"
              />
              <span>Đến:</span>
              <input
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
                className="bg-transparent text-xs text-slate-700 focus:outline-none border-b border-slate-300"
              />
              {(tuNgay || denNgay) && (
                <button
                  onClick={() => {
                    setTuNgay('');
                    setDenNgay('');
                  }}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                  title="Xóa lọc ngày"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bảng danh sách báo cáo chi tiết */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">
            Chi Tiết Danh Sách Hồ Sơ Quyết Toán ({filteredList.length} hồ sơ)
          </h3>
          <span className="text-xs text-slate-500">
            Đơn vị tiền tệ: <strong className="text-slate-800">VNĐ</strong>
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Không tìm thấy hồ sơ quyết toán nào phù hợp với bộ lọc.</p>
            {(searchKeyword || tuNgay || denNgay || filterPhongBan !== 'ALL' || filterHuongXuLy !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setTuNgay('');
                  setDenNgay('');
                  setFilterPhongBan('ALL');
                  setFilterHuongXuLy('ALL');
                }}
                className="mt-3 px-3.5 py-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg font-semibold hover:bg-emerald-100 transition cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Mã QT</th>
                  <th className="px-6 py-3.5">Mã Đề Xuất</th>
                  <th className="px-6 py-3.5">Người Đi Công Tác</th>
                  <th className="px-6 py-3.5">Phòng Ban</th>
                  <th className="px-6 py-3.5">Ngày Chốt</th>
                  <th className="px-6 py-3.5 text-right">Tạm Ứng</th>
                  <th className="px-6 py-3.5 text-right">Chi Hợp Lệ</th>
                  <th className="px-6 py-3.5 text-right">Bù Trừ Chênh Lệch</th>
                  <th className="px-6 py-3.5">Hướng Xử Lý Tài Chính</th>
                  <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredList.map((t) => (
                  <tr key={t.maQuyetToan} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">{t.maQuyetToan}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      <div>{t.maDeXuat}</div>
                      <div className="text-[11px] text-slate-400 font-sans truncate max-w-[200px]" title={t.mucDich}>
                        {t.mucDich}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.nguoiDiCongTac}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{t.phongBan}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {formatDate ? formatDate(t.ngayChotSo) : t.ngayChotSo?.split('T')[0]}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-purple-700">
                      {formatVND ? formatVND(t.tienTamUng) : t.tienTamUng.toLocaleString() + ' đ'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-700">
                      {formatVND ? formatVND(t.tongChiHopLe) : t.tongChiHopLe.toLocaleString() + ' đ'}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      t.tienBuTru > 0 ? 'text-emerald-700' : t.tienBuTru < 0 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      {t.tienBuTru > 0 ? '+' : ''}{formatVND ? formatVND(t.tienBuTru) : t.tienBuTru.toLocaleString() + ' đ'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        t.tienBuTru > 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : t.tienBuTru < 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {t.huongXuLyTaiChinh}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {t.trangThaiHoSo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
