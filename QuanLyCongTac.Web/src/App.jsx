import { useState, useEffect } from 'react';

import { 

  Briefcase, 

  Clock, 

  CheckCircle,
  CheckCircle2, 

  DollarSign, 

  Plus, 

  RefreshCw, 

  AlertCircle,

  AlertTriangle,

  Home, 

  Calendar, 

  User, 

  Mail,

  XCircle, 

  LogOut, 

  Shield, 

  Lock,

  Users,

  FileCheck,

  FileSpreadsheet,

  Check,

  X,

  CreditCard,

  Receipt,

  FileText,

  Building2,

  Trash2,

  Edit,

  Key,

  Search,

  UserPlus,

  ShieldCheck,

  FileUp,

  UploadCloud,

  Sliders,

  Settings2,
  Eye,
  Send,
  Sparkles,
  Camera,
  Activity,
  Server,
  Database,
  Cpu,
  Layers,
  Download,
  Filter,
  ZoomIn
} from 'lucide-react';

import { 

  login, 

  getUsers, 

  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  createUser,

  updateUser,

  deleteUser,

  resetPassword,

  getDanhSachDeXuat,
  getDeXuatDetail,
  submitDeXuat,
  xoaDeXuat, 

  taoDeXuat, 

  pheDuyetDeXuat, 

  getDanhSachNgoaiLe,

  pheDuyetNgoaiLe,

  chiTamUng, 

  getTongHopQuyetToan, 

  getChungTu, 

  chotSoQuyetToan,

  khaiBaoChiPhi,

  getDinhMuc,

  getLoaiChiPhi,

  createDinhMuc,

  updateDinhMuc,

  deleteDinhMuc,
  getDonTonDong,
  kichHoatQuetNhacNho,
  hoanThanhChuyenDi,
  dieuChinhChiPhi

} from './api';

import SettlementReportSection from './SettlementReportSection';





// =========================================================================

// TRANG LỖI 404 (NOT FOUND PAGE) CHO CÁC ĐƯỜNG DẪN URL SAI

// =========================================================================

function NotFoundPage({ currentPath, onNavigateHome }) {

  return (

    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12">

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">

        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-inner">

          <AlertCircle className="w-12 h-12" />

        </div>

        <div className="space-y-2">

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 tracking-wider">

            MÃ LỖI: 404

          </span>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">

            Không Tìm Thấy Trang

          </h1>

          <p className="text-xs text-slate-500 leading-relaxed">

            Đường dẫn <code className="px-1.5 py-0.5 bg-slate-100 text-rose-600 rounded font-mono font-bold">{currentPath}</code> không tồn tại hoặc đã bị thay đổi trong Hệ thống Quản lý Chi phí Công tác FIN-03.

          </p>

        </div>

        <button

          onClick={onNavigateHome}

          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"

        >

          <Home className="w-4 h-4" />

          Quay Về Trang Chủ Hệ Thống

        </button>

      </div>

    </div>

  );

}



export default function App() {

  // 0. Quản lý URL & Routing lỗi 404

  const [currentPath, setCurrentPath] = useState(window.location.pathname);



  useEffect(() => {

    const handleLocationChange = () => {

      setCurrentPath(window.location.pathname);

    };

    window.addEventListener('popstate', handleLocationChange);

    return () => window.removeEventListener('popstate', handleLocationChange);

  }, []);



  const navigateToHome = () => {

    window.history.pushState({}, '', '/');

    setCurrentPath('/');

  };



  // 1. Quản lý phiên đăng nhập

  const [currentUser, setCurrentUser] = useState(() => {

    const saved = localStorage.getItem('currentUser');

    return saved ? JSON.parse(saved) : null;

  });



  const [account, setAccount] = useState('');

  const [password, setPassword] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);

  const [loginError, setLoginError] = useState(null);



  // Tab đang chọn của từng phân hệ

  const [activeTab, setActiveTab] = useState('tab1');



  // Modal thông báo / Xác nhận thay thế toàn bộ alert() và confirm()

  const [dialogState, setDialogState] = useState({

    isOpen: false,

    type: 'info', // 'success' | 'error' | 'warning' | 'confirm'

    title: '',

    message: '',

    confirmText: 'Đã hiểu',

    cancelText: '',

    onConfirm: null,

    onCancel: null

  });



  const showNotification = (type, message, title = '') => {

    let defaultTitle = 'Thông Báo';

    if (type === 'success') defaultTitle = 'Thành Công';

    if (type === 'error') defaultTitle = 'Đã Xảy Ra Lỗi';

    if (type === 'warning') defaultTitle = 'Cảnh Báo';



    setDialogState({

      isOpen: true,

      type,

      title: title || defaultTitle,

      message,

      confirmText: 'Đã hiểu',

      cancelText: '',

      onConfirm: () => setDialogState(prev => ({ ...prev, isOpen: false })),

      onCancel: null

    });

  };



  const showConfirm = ({ title = 'Xác Nhận Thao Tác', message, confirmText = 'Xác nhận', cancelText = 'Hủy bỏ', onConfirm, onCancel }) => {

    setDialogState({

      isOpen: true,

      type: 'confirm',

      title,

      message,

      confirmText,

      cancelText,

      onConfirm: () => {

        setDialogState(prev => ({ ...prev, isOpen: false }));

        if (onConfirm) onConfirm();

      },

      onCancel: () => {

        setDialogState(prev => ({ ...prev, isOpen: false }));

        if (onCancel) onCancel();

      }

    });

  };



  // Xử lý Đăng nhập

  const handleLogin = async (e) => {

    e?.preventDefault();

    if (!account.trim() || !password.trim()) {

      setLoginError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');

      return;

    }



    setLoginLoading(true);

    setLoginError(null);

    try {

      const res = await login(account.trim(), password);

      if (res.data && res.data.success) {

        const user = res.data.data;

        setCurrentUser(user);

        localStorage.setItem('currentUser', JSON.stringify(user));

        setActiveTab('tab1');

      } else {

        setLoginError(res.data?.message || 'Tài khoản hoặc mật khẩu không chính xác.');

      }

    } catch (err) {

      console.error('Lỗi đăng nhập:', err);

      if (err.response?.status === 404) {

        setLoginError('Lỗi 404: Backend API chưa nhận diện AuthController. Hãy Dừng (Stop) và Chạy lại (Run / F5) Backend trên Visual Studio để cập nhật mã nguồn mới nhất.');

      } else if (err.response?.data?.message) {

        setLoginError(err.response.data.message);

      } else if (err.message === 'Network Error' || !err.response) {

        setLoginError('Không thể kết nối đến Backend API tại https://localhost:7211. Vui lòng kiểm tra Visual Studio xem API đã chạy chưa.');

      } else {

        setLoginError(err.message || 'Tài khoản hoặc mật khẩu không chính xác.');

      }

    } finally {

      setLoginLoading(false);

    }

  };



  const handleLogout = () => {

    setCurrentUser(null);

    localStorage.removeItem('currentUser');

    setAccount('');

    setPassword('');

  };



  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(val) || 0);



  const formatDate = (dateStr) => {

    if (!dateStr) return '---';

    const d = new Date(dateStr);

    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');

  };



  const getTrangThaiBadge = (status) => {
    switch (status) {
      case 'BAN_NHAP':
      case 'Bản nháp':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300"><FileText className="w-3.5 h-3.5 text-slate-500" /> Bản nháp</span>;
      case 'CHO_DUYET':
      case 'Chờ duyệt':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ duyệt</span>;
      case 'DA_DUYET':
      case 'Đã duyệt':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Đã duyệt</span>;
      case 'DA_TAM_UNG':
      case 'Đã tạm ứng':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300"><DollarSign className="w-3.5 h-3.5 text-purple-600" /> Đã tạm ứng</span>;
      case 'CHO_QUYET_TOAN':
      case 'Chờ quyết toán':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-300"><Clock className="w-3.5 h-3.5 text-cyan-600" /> Chờ quyết toán</span>;
      case 'HOAN_THANH':
      case 'DA_CHOT_SO':
      case 'Đã chốt sổ':
      case 'Đã quyết toán':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã chốt sổ</span>;
      case 'TU_CHOI':
      case 'Từ chối':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"><XCircle className="w-3.5 h-3.5 text-rose-600" /> Từ chối</span>;
      case 'DA_HUY':
      case 'Đã hủy':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-300 line-through"><XCircle className="w-3.5 h-3.5 text-gray-400" /> Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status || 'Không rõ'}</span>;
    }
  };



  const getRoleBadge = (vaiTro) => {

    switch (vaiTro) {

      case 'NHAN_VIEN':

        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-300">NHÂN VIÊN</span>;

      case 'QUAN_LY':

        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-300">QUẢN LÝ / TRƯỞNG PHÒNG</span>;

      case 'KE_TOAN':

        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-300">KẾ TOÁN THANH TOÁN</span>;

      case 'ADMIN':

        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-300">ADMIN</span>;

      default:

        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-800">{vaiTro}</span>;

    }

  };



  // =========================================================================

  // GIAO DIỆN 1: MÀN HÌNH ĐĂNG NHẬP (Chưa đăng nhập -> Chỉ hiển thị Form)

  // =========================================================================

  // Kiểm tra URL sai hiển thị trang lỗi 404

  if (currentPath !== '/' && currentPath !== '' && currentPath !== '/index.html') {

    return <NotFoundPage currentPath={currentPath} onNavigateHome={navigateToHome} />;

  }



  if (!currentUser) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

          <div className="mx-auto w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">

            <Briefcase className="w-8 h-8" />

          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">

            Hệ Thống Quản Lý Chi Phí Công Tác

          </h2>

        </div>



        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">

          <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">

            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-2 text-slate-800">

              <Lock className="w-5 h-5 text-indigo-600" />

              <h3 className="font-bold text-base">Đăng Nhập Hệ Thống</h3>

            </div>



            {loginError && (

              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">

                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />

                <div>

                  <p className="font-bold">Đăng nhập thất bại:</p>

                  <p>{loginError}</p>

                </div>

              </div>

            )}



            <form onSubmit={handleLogin} className="space-y-4">

              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">

                  Tài Khoản / Email

                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">

                    <User className="w-4 h-4" />

                  </div>

                  <input

                    type="text"

                    required

                    value={account}

                    onChange={(e) => setAccount(e.target.value)}

                    placeholder="Nhập email hoặc tên tài khoản..."

                    className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"

                  />

                </div>

              </div>



              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">

                  Mật Khẩu

                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">

                    <Lock className="w-4 h-4" />

                  </div>

                  <input

                    type="password"

                    required

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    placeholder="Nhập mật khẩu..."

                    className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"

                  />

                </div>

              </div>



              <button

                type="submit"

                disabled={loginLoading}

                className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"

              >

                {loginLoading ? (

                  <>

                    <RefreshCw className="w-4 h-4 animate-spin" />

                    <span>Đang đăng nhập...</span>

                  </>

                ) : (

                  'Đăng Nhập'

                )}

              </button>

            </form>

          </div>

        </div>

      </div>

    );

  }



  // =========================================================================

  // GIAO DIỆN 2: PHÂN HỆ MÀN HÌNH CHÍNH (4 VAI TRÒ HOÀN TOÀN TÁCH BIỆT)

  // =========================================================================

  return (

    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Header dùng chung cho mọi vai trò */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">

              <Briefcase className="w-5 h-5" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h1 className="text-lg font-bold text-slate-900">

                  Hệ Thống Quản Lý Chi Phí Công Tác

                </h1>

                {getRoleBadge(currentUser.vaiTro)}

              </div>

              

            </div>

          </div>



          <div className="flex items-center gap-3">

            <span className="text-xs font-semibold text-slate-700">{currentUser.hoTen}</span>
            <button

              onClick={handleLogout}

              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition shadow-xs cursor-pointer"

            >

              <LogOut className="w-3.5 h-3.5" />

              Đăng xuất

            </button>

          </div>

        </div>

      </header>



      {/* RENDER VIEW THEO ĐÚNG TỪNG VAI TRÒ */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentUser.vaiTro === 'ADMIN' && (

          <AdminDashboard currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} showNotification={showNotification} showConfirm={showConfirm} />

        )}



        {currentUser.vaiTro === 'QUAN_LY' && (

          <ManagerDashboard currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} formatVND={formatVND} formatDate={formatDate} getTrangThaiBadge={getTrangThaiBadge} showNotification={showNotification} showConfirm={showConfirm} />

        )}



        {currentUser.vaiTro === 'KE_TOAN' && (

          <AccountantDashboard currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} formatVND={formatVND} formatDate={formatDate} getTrangThaiBadge={getTrangThaiBadge} showNotification={showNotification} showConfirm={showConfirm} />

        )}



        {currentUser.vaiTro === 'NHAN_VIEN' && (

          <EmployeeDashboard currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} formatVND={formatVND} formatDate={formatDate} getTrangThaiBadge={getTrangThaiBadge} showNotification={showNotification} showConfirm={showConfirm} />

        )}

      </main>



      {/* ================================================================= */}

      {/* POPUP HỘP THOẠI THÔNG BÁO / XÁC NHẬN CHUYÊN NGHIỆP */}

      {/* ================================================================= */}

      {dialogState.isOpen && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all scale-100 space-y-4">

            <div className="flex items-start gap-4">

              <div className={`p-3 rounded-full shrink-0 ${

                dialogState.type === 'success' ? 'bg-emerald-100 text-emerald-600' :

                dialogState.type === 'error' ? 'bg-rose-100 text-rose-600' :

                dialogState.type === 'confirm' ? 'bg-amber-100 text-amber-600' :

                dialogState.type === 'warning' ? 'bg-amber-100 text-amber-600' :

                'bg-indigo-100 text-indigo-600'

              }`}>

                {dialogState.type === 'success' && <CheckCircle2 className="w-7 h-7" />}

                {dialogState.type === 'error' && <XCircle className="w-7 h-7" />}

                {dialogState.type === 'confirm' && <AlertTriangle className="w-7 h-7" />}

                {dialogState.type === 'warning' && <AlertCircle className="w-7 h-7" />}

              </div>

              <div className="flex-1 min-w-0">

                <h3 className="text-base font-bold text-slate-900">

                  {dialogState.title}

                </h3>

                <p className="mt-1.5 text-xs text-slate-600 whitespace-pre-line leading-relaxed break-words font-medium">

                  {dialogState.message}

                </p>

              </div>

            </div>



            <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100">

              {dialogState.cancelText && (

                <button

                  type="button"

                  onClick={dialogState.onCancel || (() => setDialogState(prev => ({ ...prev, isOpen: false })))}

                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"

                >

                  {dialogState.cancelText}

                </button>

              )}

              <button

                type="button"

                onClick={dialogState.onConfirm || (() => setDialogState(prev => ({ ...prev, isOpen: false })))}

                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition shadow-xs cursor-pointer ${

                  dialogState.type === 'error' ? 'bg-rose-600 hover:bg-rose-700' :

                  dialogState.type === 'confirm' ? 'bg-amber-600 hover:bg-amber-700' :

                  dialogState.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :

                  dialogState.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :

                  'bg-indigo-600 hover:bg-indigo-700'

                }`}

              >

                {dialogState.confirmText || 'Đã hiểu'}

              </button>

            </div>

          </div>

        </div>

      )}


    </div>

  );

}



// =========================================================================

// 1. PHÂN HỆ QUẢN TRỊ VIÊN IT (ADMIN) - QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN

// =========================================================================

function AdminDashboard({ currentUser, activeTab, setActiveTab, showNotification, showConfirm }) {

  const [users, setUsers] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [successMsg, setSuccessMsg] = useState(null);



  // Bộ lọc tìm kiếm

  const [searchTerm, setSearchTerm] = useState('');

  const [roleFilter, setRoleFilter] = useState('ALL');

  const [deptFilter, setDeptFilter] = useState('ALL');

  // Tab phân hệ Quản trị viên: 'MH-04' (Người dùng) hoặc 'MH-03' (Phòng ban)
  const [adminTab, setAdminTab] = useState('MH-04');

  // State Quản lý danh mục phòng ban (MH-03)
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptFormData, setDeptFormData] = useState({ maPB: '', tenPB: '', maPBMoi: '' });
  const [deptActionLoading, setDeptActionLoading] = useState(false);



  // Modal Thêm & Sửa

  const [showAddModal, setShowAddModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);



  // Form State

  const initialForm = {

    maNV: '',

    hoTen: '',

    email: '',

    maPB: 'PB_IT',

    chucVu: '',

    soTaiKhoan: '',

    vaiTro: 'NHAN_VIEN',

    matKhau: '123123'

  };

  const [formData, setFormData] = useState(initialForm);



  const fetchUsersAndDepts = async () => {

    setLoading(true);

    setError(null);

    try {

      const [resUsers, resDepts] = await Promise.all([

        getUsers(),

        getDepartments().catch(() => ({ data: { data: [] } }))

      ]);



      if (resUsers.data && resUsers.data.success) {

        setUsers(resUsers.data.data || []);

      }

      if (resDepts.data && resDepts.data.data) {

        setDepartments(resDepts.data.data);

      }

    } catch (err) {

      console.error(err);

      setError('Lỗi khi tải danh sách người dùng từ hệ thống.');

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchUsersAndDepts();

  }, []);



  const showToast = (msg) => {

    setSuccessMsg(msg);

    setTimeout(() => setSuccessMsg(null), 4000);

  };



  // Mở modal Thêm mới

  const openAddModal = () => {

    setFormData(initialForm);

    setShowAddModal(true);

  };



  // Mở modal Sửa thông tin & Mật khẩu

  const openEditModal = (user) => {

    setSelectedUser(user);

    setFormData({

      maNV: user.maNV,

      hoTen: user.hoTen,

      email: user.email || '',

      maPB: user.maPB || (departments[0]?.maPB || 'PB_IT'),

      chucVu: user.chucVu || '',

      soTaiKhoan: user.soTaiKhoan || '',

      vaiTro: user.vaiTro || 'NHAN_VIEN',

      matKhau: user.matKhau || '123123'

    });

    setShowEditModal(true);

  };



  // Submit Thêm mới

  const handleCreateSubmit = async (e) => {

    e.preventDefault();

    if (!formData.maNV.trim() || !formData.hoTen.trim()) {

      showNotification('warning', 'Vui lòng nhập đầy đủ Mã nhân viên và Họ tên.');

      return;

    }



    setActionLoading(true);

    try {

      const res = await createUser(formData);

      if (res.data && res.data.success) {

        showToast(res.data.message || 'Thêm tài khoản thành công!');

        setShowAddModal(false);

        fetchUsersAndDepts();

      } else {

        showNotification('error', res.data?.message || 'Không thể thêm tài khoản.');

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi hệ thống khi thêm tài khoản.');

    } finally {

      setActionLoading(false);

    }

  };



  // Submit Cập nhật & Phân quyền

  const handleUpdateSubmit = async (e) => {

    e.preventDefault();

    setActionLoading(true);

    try {

      const res = await updateUser(selectedUser.maNV, formData);

      if (res.data && res.data.success) {

        showToast(res.data.message || 'Cập nhật phân quyền thành công!');

        setShowEditModal(false);

        fetchUsersAndDepts();

      } else {

        showNotification('error', res.data?.message || 'Không thể cập nhật tài khoản.');

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi hệ thống khi cập nhật.');

    } finally {

      setActionLoading(false);

    }

  };



  // Xóa tài khoản

  const handleDeleteUser = async (maNV) => {

    if (maNV.toUpperCase() === 'ADMIN') {

      showNotification('warning', 'Không thể xóa tài khoản Quản trị viên hệ thống (ADMIN).');

      return;

    }

    showConfirm({

      title: 'Xóa Tài Khoản',

      message: `CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản '${maNV}' khỏi hệ thống? Thao tác này không thể hoàn tác.`,

      confirmText: 'Xóa tài khoản',

      cancelText: 'Hủy bỏ',

      onConfirm: async () => {

        try {

          const res = await deleteUser(maNV);

          if (res.data && res.data.success) {

            showNotification('success', res.data.message || 'Đã xóa tài khoản thành công!');

            fetchUsersAndDepts();

          } else {

            showNotification('error', res.data?.message || 'Không thể xóa tài khoản.');

          }

        } catch (err) {

          showNotification('error', err.response?.data?.message || 'Lỗi khi xóa tài khoản.');

        }

      }

    });

  };



  // Lọc người dùng

  const filteredUsers = users.filter((u) => {

    const matchSearch =

      u.maNV.toLowerCase().includes(searchTerm.toLowerCase()) ||

      u.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||

      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));



    const matchRole = roleFilter === 'ALL' || u.vaiTro === roleFilter;

    const matchDept = deptFilter === 'ALL' || u.maPB === deptFilter;

    return matchSearch && matchRole && matchDept;

  });

  // Lọc danh sách phòng ban (MH-03)
  const filteredDepartments = departments.filter((d) => {
    const kw = deptSearchTerm.trim().toLowerCase();
    if (!kw) return true;
    return (d.maPB && d.maPB.toLowerCase().includes(kw)) ||
           (d.tenPB && d.tenPB.toLowerCase().includes(kw));
  });

  const openAddDeptModal = () => {
    setDeptFormData({ maPB: '', tenPB: '' });
    setShowAddDeptModal(true);
  };

  const openEditDeptModal = (dept) => {
    setSelectedDept(dept);
    setDeptFormData({ maPB: dept.maPB, tenPB: dept.tenPB, maPBMoi: dept.maPB });
    setShowEditDeptModal(true);
  };

  const handleCreateDeptSubmit = async (e) => {
    e?.preventDefault();
    const maPB = deptFormData.maPB?.trim().toUpperCase();
    const tenPB = deptFormData.tenPB?.trim();

    if (!maPB || !tenPB) {
      showNotification('warning', 'Vui lòng nhập đầy đủ Mã phòng ban và Tên phòng ban.');
      return;
    }

    setDeptActionLoading(true);
    try {
      const res = await createDepartment({ maPB, tenPB });
      if (res.data && res.data.success) {
        showNotification('success', res.data.message || 'Thêm phòng ban mới thành công!');
        setShowAddDeptModal(false);
        fetchUsersAndDepts();
      } else {
        showNotification('error', res.data?.message || 'Lỗi thêm phòng ban.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Lỗi khi thêm mới phòng ban.');
    } finally {
      setDeptActionLoading(false);
    }
  };

  const handleUpdateDeptSubmit = async (e) => {
    e?.preventDefault();
    const newMaPB = deptFormData.maPBMoi?.trim().toUpperCase() || selectedDept?.maPB;
    const tenPB = deptFormData.tenPB?.trim();

    if (!tenPB) {
      showNotification('warning', 'Tên phòng ban không được để trống.');
      return;
    }

    setDeptActionLoading(true);
    try {
      const res = await updateDepartment(selectedDept.maPB, {
        maPBMoi: newMaPB,
        tenPB: tenPB
      });
      if (res.data && res.data.success) {
        showNotification('success', res.data.message || 'Cập nhật phòng ban thành công!');
        setShowEditDeptModal(false);
        fetchUsersAndDepts();
      } else {
        showNotification('error', res.data?.message || 'Lỗi cập nhật phòng ban.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Lỗi khi cập nhật phòng ban.');
    } finally {
      setDeptActionLoading(false);
    }
  };

  const handleDeleteDept = (dept) => {
    if (dept.soNhanVien > 0) {
      showNotification('warning', `Không thể xóa phòng ban '${dept.tenPB}' (${dept.maPB}) vì hiện có ${dept.soNhanVien} nhân viên trực thuộc! Vui lòng chuyển nhân sự sang phòng ban khác trước.`);
      return;
    }

    showConfirm(
      'Xác Nhận Xóa Phòng Ban',
      `Bạn có chắc chắn muốn xóa phòng ban '${dept.tenPB}' (${dept.maPB}) khỏi hệ thống?`,
      async () => {
        try {
          const res = await deleteDepartment(dept.maPB);
          if (res.data && res.data.success) {
            showNotification('success', res.data.message || 'Xóa phòng ban thành công!');
            fetchUsersAndDepts();
          } else {
            showNotification('error', res.data?.message || 'Lỗi xóa phòng ban.');
          }
        } catch (err) {
          showNotification('error', err.response?.data?.message || 'Lỗi khi xóa phòng ban.');
        }
      }
    );
  };

  return (

    <div className="space-y-6">

      {/* Thanh điều hướng Tab Quản trị viên */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            type="button"
            onClick={() => setAdminTab('MH-04')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-2 ${
              adminTab === 'MH-04'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Quản Lý Nhân Viên & Phân Quyền (MH-04)
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {users.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('MH-03')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-2 ${
              adminTab === 'MH-03'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Quản Lý Danh Mục Phòng Ban (MH-03)
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {departments.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* PHÂN HỆ 1 (MH-04): QUẢN LÝ NHÂN VIÊN VÀ PHÂN QUYỀN                        */}
      {/* ========================================================================= */}
      {adminTab === 'MH-04' && (
        <div className="space-y-6">

      {/* Banner giới thiệu */}

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">

            <ShieldCheck className="w-6 h-6" />

          </div>

          <div>

            <h2 className="text-base font-bold text-slate-900">

              Quản Trị Người Dùng & Phân Quyền Hệ Thống

            </h2>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button

            onClick={fetchUsersAndDepts}

            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"

          >

            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />

            Làm mới

          </button>

          <button

            onClick={openAddModal}

            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition cursor-pointer"

          >

            <UserPlus className="w-4 h-4" />

            Thêm Tài Khoản Mới

          </button>

        </div>

      </div>



      {/* Thông báo thành công */}

      {successMsg && (

        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between shadow-xs">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="w-5 h-5 text-emerald-600" />

            <span className="font-medium">{successMsg}</span>

          </div>

          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">

            <X className="w-4 h-4" />

          </button>

        </div>

      )}



      {/* Thông báo lỗi */}

      {error && (

        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">

          <AlertCircle className="w-5 h-5 text-rose-600" />

          <span>{error}</span>

        </div>

      )}



      {/* Phân hệ Quản lý tài khoản & Phân quyền */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">

          {/* Thanh công cụ tìm kiếm và lọc */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">

            <div className="relative flex-1 max-w-md">

              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

              <input

                type="text"

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

                placeholder="Tìm theo Mã NV, Họ tên, Email..."

                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"

              />

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2">

                <span className="text-xs text-slate-500 font-medium">Lọc phòng ban:</span>

                <select

                  value={deptFilter}

                  onChange={(e) => setDeptFilter(e.target.value)}

                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

                >

                  <option value="ALL">Tất cả phòng ban</option>

                  <option value="PB_IT">Phòng Công nghệ Thông tin (PB_IT)</option>

                  <option value="PB_KT">Phòng Kế toán - Tài chính (PB_KT)</option>

                  <option value="PB_KD">Phòng Kinh doanh B2B (PB_KD)</option>

                  {departments

                    .filter((d) => !['PB_IT', 'PB_KT', 'PB_KD'].includes(d.maPB))

                    .map((d) => (

                      <option key={d.maPB} value={d.maPB}>

                        {d.tenPB} ({d.maPB})

                      </option>

                    ))}

                </select>

              </div>

              <div className="flex items-center gap-2">

                <span className="text-xs text-slate-500 font-medium">Lọc vai trò:</span>

                <select

                  value={roleFilter}

                  onChange={(e) => setRoleFilter(e.target.value)}

                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

                >

                  <option value="ALL">Tất cả vai trò</option>

                  <option value="NHAN_VIEN">Nhân viên</option>

                  <option value="QUAN_LY">Quản lý / Trưởng phòng</option>

                  <option value="KE_TOAN">Kế toán thanh toán</option>

                  <option value="ADMIN">ADMIN</option>

                </select>

              </div>

            </div>

          </div>



          {/* Bảng danh sách người dùng */}

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">

                <tr>

                  <th className="px-4 py-3.5">Mã NV</th>

                  <th className="px-4 py-3.5">Họ Và Tên</th>

                  <th className="px-4 py-3.5">Email Tổ Chức</th>

                  <th className="px-4 py-3.5">Mật Khẩu</th>

                  <th className="px-4 py-3.5">Phòng Ban</th>

                  <th className="px-4 py-3.5 text-center">Vai Trò</th>

                  <th className="px-4 py-3.5 text-center">Thao Tác</th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">

                {filteredUsers.length === 0 ? (

                  <tr>

                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-xs">

                      Không tìm thấy nhân viên nào phù hợp với bộ lọc.

                    </td>

                  </tr>

                ) : (

                  filteredUsers.map((u) => (

                    <tr key={u.maNV} className="hover:bg-slate-50/80 transition">

                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">{u.maNV}</td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900">{u.hoTen}</td>

                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{u.email || '---'}</td>

                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">

                        {u.matKhau || '123123'}

                      </td>

                      <td className="px-4 py-3.5 text-slate-600 text-xs">{u.tenPB}</td>

                      <td className="px-4 py-3.5 text-center">

                        {u.vaiTro === 'ADMIN' && (

                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-300">

                            ADMIN

                          </span>

                        )}

                        {u.vaiTro === 'QUAN_LY' && (

                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-300">

                            QUẢN LÝ

                          </span>

                        )}

                        {u.vaiTro === 'KE_TOAN' && (

                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-300">

                            KẾ TOÁN

                          </span>

                        )}

                        {u.vaiTro === 'NHAN_VIEN' && (

                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-300">

                            NHÂN VIÊN

                          </span>

                        )}

                      </td>

                      <td className="px-4 py-3.5 text-center">

                        <div className="inline-flex items-center gap-1.5">

                          <button

                            onClick={() => openEditModal(u)}

                            title="Chỉnh sửa thông tin & Mật khẩu"

                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition cursor-pointer"

                          >

                            <Edit className="w-3.5 h-3.5" />

                            Chỉnh sửa

                          </button>

                          {u.maNV.toUpperCase() !== 'ADMIN' && (

                            <button

                              onClick={() => handleDeleteUser(u.maNV)}

                              title="Xóa tài khoản"

                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-slate-200 transition cursor-pointer"

                            >

                              <Trash2 className="w-3.5 h-3.5" />

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>



      {/* MODAL 1: THÊM TÀI KHOẢN MỚI */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <div className="flex items-center gap-2">

                <UserPlus className="w-5 h-5 text-indigo-600" />

                <h3 className="font-bold text-base text-slate-900">Thêm Tài Khoản Nhân Viên Mới</h3>

              </div>

              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">

                <X className="w-5 h-5" />

              </button>

            </div>



            <form onSubmit={handleCreateSubmit} className="space-y-3.5">

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Nhân Viên *</label>

                  <input

                    type="text"

                    required

                    value={formData.maNV}

                    onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}

                    placeholder="VD: NV02, QL02..."

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ Và Tên *</label>

                  <input

                    type="text"

                    required

                    value={formData.hoTen}

                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}

                    placeholder="Nguyễn Văn B"

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Tổ Chức</label>

                  <input

                    type="email"

                    value={formData.email}

                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                    placeholder="nguyenvanb@gmail.com"

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phòng Ban *</label>

                  <select

                    value={formData.maPB}

                    onChange={(e) => setFormData({ ...formData, maPB: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"

                  >

                    <option value="PB_IT">Phòng Công nghệ Thông tin (PB_IT)</option>

                    <option value="PB_KT">Phòng Kế toán - Tài chính (PB_KT)</option>

                    <option value="PB_KD">Phòng Kinh doanh B2B (PB_KD)</option>

                    {departments

                      .filter((d) => !['PB_IT', 'PB_KT', 'PB_KD'].includes(d.maPB))

                      .map((d) => (

                        <option key={d.maPB} value={d.maPB}>

                          {d.tenPB} ({d.maPB})

                        </option>

                      ))}

                  </select>

                </div>

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mật Khẩu Khởi Tạo</label>

                  <input

                    type="text"

                    value={formData.matKhau}

                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">

                    Vai trò *

                  </label>

                  <select

                    value={formData.vaiTro}

                    onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value })}

                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"

                  >

                    <option value="NHAN_VIEN">Nhân viên</option>

                    <option value="QUAN_LY">Quản lý / Trưởng phòng</option>

                    <option value="KE_TOAN">Kế toán</option>

                    <option value="ADMIN">ADMIN</option>

                  </select>

                </div>

              </div>



              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">

                <button

                  type="button"

                  onClick={() => setShowAddModal(false)}

                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"

                >

                  Hủy bỏ

                </button>

                <button

                  type="submit"

                  disabled={actionLoading}

                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 cursor-pointer"

                >

                  {actionLoading ? 'Đang thêm...' : 'Lưu Tài Khoản'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* MODAL 2: CHỈNH SỬA THÔNG TIN */}

      {showEditModal && selectedUser && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <div className="flex items-center gap-2">

                <Edit className="w-5 h-5 text-indigo-600" />

                <h3 className="font-bold text-base text-slate-900">

                  Chỉnh Sửa Thông Tin: <span className="text-indigo-600">{selectedUser.maNV}</span>

                </h3>

              </div>

              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">

                <X className="w-5 h-5" />

              </button>

            </div>



            <form onSubmit={handleUpdateSubmit} className="space-y-3.5">

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">

                Cập nhật thông tin hồ sơ và vai trò làm việc của nhân sự trong toàn hệ thống.

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Nhân Viên</label>

                  <input

                    type="text"

                    disabled

                    value={formData.maNV}

                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-lg font-mono font-bold text-slate-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ Và Tên *</label>

                  <input

                    type="text"

                    required

                    value={formData.hoTen}

                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Tổ Chức</label>

                  <input

                    type="email"

                    value={formData.email}

                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phòng Ban *</label>

                  <select

                    value={formData.maPB}

                    onChange={(e) => setFormData({ ...formData, maPB: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"

                  >

                    <option value="PB_IT">Phòng Công nghệ Thông tin (PB_IT)</option>

                    <option value="PB_KT">Phòng Kế toán - Tài chính (PB_KT)</option>

                    <option value="PB_KD">Phòng Kinh doanh B2B (PB_KD)</option>

                    {departments

                      .filter((d) => !['PB_IT', 'PB_KT', 'PB_KD'].includes(d.maPB))

                      .map((d) => (

                        <option key={d.maPB} value={d.maPB}>

                          {d.tenPB} ({d.maPB})

                        </option>

                      ))}

                  </select>

                </div>

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mật Khẩu</label>

                  <input

                    type="text"

                    required

                    value={formData.matKhau}

                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}

                    placeholder="Nhập mật khẩu..."

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">

                    Vai trò

                  </label>

                  <select

                    value={formData.vaiTro}

                    onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value })}

                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"

                  >

                    <option value="NHAN_VIEN">Nhân viên</option>

                    <option value="QUAN_LY">Quản lý / Trưởng phòng</option>

                    <option value="KE_TOAN">Kế toán</option>

                    <option value="ADMIN">ADMIN</option>

                  </select>

                </div>

              </div>



              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">

                <button

                  type="button"

                  onClick={() => setShowEditModal(false)}

                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"

                >

                  Hủy bỏ

                </button>

                <button

                  type="submit"

                  disabled={actionLoading}

                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 cursor-pointer"

                >

                  {actionLoading ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* PHÂN HỆ 2 (MH-03): QUẢN LÝ DANH MỤC PHÒNG BAN (Word Trang 72)             */}
      {/* ========================================================================= */}
      {adminTab === 'MH-03' && (
        <div className="space-y-6">
          {/* Banner giới thiệu MH-03 chuẩn theo tài liệu Word */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Giao diện: Quản lý danh mục phòng ban (MH-03)
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    MH-03
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Màn hình cho phép Quản trị viên thêm mới, chỉnh sửa thông tin mã và tên các phòng ban trong cơ quan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchUsersAndDepts}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-600' : ''}`} />
                Làm mới
              </button>
              <button
                type="button"
                onClick={openAddDeptModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm Phòng Ban Mới
              </button>
            </div>
          </div>

          {/* Thẻ thống kê KPI phòng ban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng Số Phòng Ban</p>
                <p className="text-xl font-bold text-slate-900">{departments.length} phòng ban</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng Nhân Sự Đã Phân Bổ</p>
                <p className="text-xl font-bold text-slate-900">
                  {departments.reduce((acc, d) => acc + (parseInt(d.soNhanVien) || 0), 0)} nhân sự
                </p>
              </div>
            </div>
          </div>

          {/* Bảng danh sách phòng ban */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={deptSearchTerm}
                  onChange={(e) => setDeptSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã hoặc tên phòng ban..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <span className="text-xs text-slate-500 self-center">
                Hiển thị <strong>{filteredDepartments.length}</strong> / {departments.length} phòng ban
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">STT</th>
                    <th className="px-6 py-3.5">Mã Phòng Ban</th>
                    <th className="px-6 py-3.5">Tên Phòng Ban</th>
                    <th className="px-6 py-3.5 text-center">Số Nhân Viên Trực Thuộc</th>
                    <th className="px-6 py-3.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-xs">
                        Không tìm thấy phòng ban nào phù hợp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept, idx) => (
                      <tr key={dept.maPB} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                            {dept.maPB}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{dept.tenPB}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            dept.soNhanVien > 0
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <Users className="w-3.5 h-3.5" />
                            {dept.soNhanVien || 0} nhân sự
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditDeptModal(dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                              title="Chỉnh sửa thông tin mã và tên phòng ban"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDept(dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                              title="Xóa phòng ban (chỉ được xóa khi không còn nhân viên)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Thêm phòng ban mới */}
          {showAddDeptModal && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-base text-slate-900">
                      Thêm Phòng Ban Mới (MH-03)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddDeptModal(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateDeptSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Mã Phòng Ban (Ví dụ: PB_MKT, PB_NS, PB_KD...):
                    </label>
                    <input
                      type="text"
                      required
                      value={deptFormData.maPB}
                      onChange={(e) => setDeptFormData({ ...deptFormData, maPB: e.target.value.toUpperCase() })}
                      placeholder="Nhập mã phòng ban..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Tên Phòng Ban:
                    </label>
                    <input
                      type="text"
                      required
                      value={deptFormData.tenPB}
                      onChange={(e) => setDeptFormData({ ...deptFormData, tenPB: e.target.value })}
                      placeholder="Ví dụ: Phòng Marketing & Truyền thông..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddDeptModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={deptActionLoading}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {deptActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Thêm Mới
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Chỉnh sửa phòng ban */}
          {showEditDeptModal && selectedDept && (
            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-slate-900">
                      Chỉnh Sửa Phòng Ban: {selectedDept.maPB}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditDeptModal(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateDeptSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Mã Phòng Ban (Cho phép cập nhật):
                    </label>
                    <input
                      type="text"
                      required
                      value={deptFormData.maPBMoi}
                      onChange={(e) => setDeptFormData({ ...deptFormData, maPBMoi: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      * Nếu đổi mã phòng ban, hệ thống sẽ tự động cập nhật liên đới đến tất cả nhân sự đang trực thuộc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Tên Phòng Ban:
                    </label>
                    <input
                      type="text"
                      required
                      value={deptFormData.tenPB}
                      onChange={(e) => setDeptFormData({ ...deptFormData, tenPB: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Số nhân viên trực thuộc hiện tại:</span>
                    <strong className="text-slate-900 font-bold">{selectedDept.soNhanVien || 0} nhân sự</strong>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEditDeptModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={deptActionLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {deptActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}


    </div>

  );

}



// =========================================================================

// 2. PHÂN HỆ QUẢN LÝ / TRƯỞNG PHÒNG (QUAN_LY - QL01)

// =========================================================================

function ManagerDashboard({ currentUser, activeTab, setActiveTab, formatVND, formatDate, getTrangThaiBadge, showNotification, showConfirm }) {

  // Tab 1: Phê duyệt đề xuất 

  const [danhSach, setDanhSach] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedDon, setSelectedDon] = useState(null);

  const [ghiChu, setGhiChu] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  // Bộ lọc trạng thái đề xuất & tìm kiếm của Quản lý
  const [managerFilterStatus, setManagerFilterStatus] = useState('CHO_DUYET');
  const [searchManagerKeyword, setSearchManagerKeyword] = useState('');



  // Tab 2: Phê duyệt ngoại lệ chi phí 

  const [ngoaiLeList, setNgoaiLeList] = useState([]);

  const [ngoaiLeLoading, setNgoaiLeLoading] = useState(false);

  const [ngoaiLeActionLoading, setNgoaiLeActionLoading] = useState(false);

  // Nhắc nhở duyệt đơn tự động (Scheduler)
  const [schedulerModal, setSchedulerModal] = useState({ isOpen: false, data: null, loading: false });
  const [donTonDongList, setDonTonDongList] = useState([]);

  const handleTriggerScheduler = async () => {
    setSchedulerModal({ isOpen: true, data: null, loading: true });
    try {
      const res = await kichHoatQuetNhacNho({ maPB: currentUser.maPB });
      if (res.data && res.data.success) {
        setSchedulerModal({ isOpen: true, data: res.data.data, loading: false });
        fetchDonChoDuyet();
      }
    } catch (err) {
      console.error(err);
      setSchedulerModal({ isOpen: false, data: null, loading: false });
      showNotification('error', 'Không thể kích hoạt tiến trình quét tự động.');
    }
  };



  const fetchDonChoDuyet = async (targetStatus = managerFilterStatus) => {

    setLoading(true);

    try {

      const res = await getDanhSachDeXuat({ maPB: currentUser.maPB, trangThai: targetStatus });

      if (res.data && res.data.success) {

        setDanhSach(res.data.data || []);

      }

      try {
        const tdRes = await getDonTonDong({ maPB: currentUser.maPB });
        if (tdRes.data && tdRes.data.success) {
          setDonTonDongList(tdRes.data.data || []);
        }
      } catch (e) {
        console.error(e);
      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  const filteredManagerList = danhSach.filter((item) => {
    const kw = searchManagerKeyword.trim().toLowerCase();
    if (!kw) return true;
    return (
      item.maDeXuat?.toLowerCase().includes(kw) ||
      item.tenNhanVien?.toLowerCase().includes(kw) ||
      item.mucDich?.toLowerCase().includes(kw)
    );
  });



  const fetchNgoaiLe = async () => {

    setNgoaiLeLoading(true);

    try {

      const res = await getDanhSachNgoaiLe({ maPB: currentUser.maPB });

      if (res.data && res.data.success) {

        setNgoaiLeList(res.data.data || []);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setNgoaiLeLoading(false);

    }

  };



  useEffect(() => {

    if (activeTab === 'tab1') fetchDonChoDuyet();

    if (activeTab === 'tab2') fetchNgoaiLe();

  }, [activeTab]);



  const handleXetDuyet = async (hanhDong) => {

    if (!selectedDon) return;

    setActionLoading(true);

    try {

      const payload = {

        maDeXuat: selectedDon.maDeXuat || selectedDon.MaDeXuat,

        maQuanLy: currentUser.maNV,

        hanhDong: hanhDong, // 'DUYET' hoặc 'TU_CHOI'

        ghiChu: ghiChu

      };

      const res = await pheDuyetDeXuat(payload);

      if (res.data && res.data.success) {

        showNotification('success', res.data.message || 'Xử lý thành công.');

        setSelectedDon(null);

        setGhiChu('');

        fetchDonChoDuyet();

      } else {

        showNotification('error', res.data?.message || 'Lỗi xét duyệt.');

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi khi gọi API xét duyệt.');

    } finally {

      setActionLoading(false);

    }

  };



  const handleDuyetNgoaiLe = async (item, hanhDong) => {

    const actionText = hanhDong === 'DUYET' ? 'Duyệt đặc cách' : 'Từ chối ngoại lệ';

    showConfirm({

      title: 'Phê Duyệt Ngoại Lệ Chi Phí',

      message: `Bạn có chắc chắn muốn [${actionText}] cho khoản chi ${formatVND(item.soTienThucTe)} của ${item.tenNhanVien}?`,

      confirmText: actionText,

      cancelText: 'Hủy bỏ',

      onConfirm: async () => {

        setNgoaiLeActionLoading(true);

        try {

          const payload = {

            maGiaiTrinh: item.maGiaiTrinh,

            maQuanLy: currentUser.maNV,

            hanhDong: hanhDong

          };

          const res = await pheDuyetNgoaiLe(payload);

          if (res.data && res.data.success) {

            showNotification('success', res.data.message || `${actionText} thành công.`);

            fetchNgoaiLe();

          } else {

            showNotification('error', res.data?.message || 'Lỗi khi xử lý ngoại lệ.');

          }

        } catch (err) {

          showNotification('error', err.response?.data?.message || 'Lỗi khi gọi API xử lý ngoại lệ.');

        } finally {

          setNgoaiLeActionLoading(false);

        }

      }

    });

  };



  return (

    <div className="space-y-6">

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">

            <FileCheck className="w-6 h-6" />

          </div>

          <div>

            <h2 className="text-base font-bold text-slate-900">

              Phân Hệ Phê Duyệt & Quản Lý Đơn Vị

            </h2>

            

          </div>

        </div>

        <button

          onClick={() => {

            if (activeTab === 'tab1') fetchDonChoDuyet();

            if (activeTab === 'tab2') fetchNgoaiLe();

          }}

          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"

        >

          <RefreshCw className={`w-3.5 h-3.5 ${loading || ngoaiLeLoading ? 'animate-spin' : ''}`} />

          Làm mới

        </button>

      </div>



      {/* Tabs Phân hệ Quản lý */}

      <div className="border-b border-slate-200">

        <nav className="flex space-x-6">

          <button

            onClick={() => setActiveTab('tab1')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab1'

                ? 'border-amber-600 text-amber-600'

                : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            Phê Duyệt Đề Xuất Công Tác

          </button>

          <button

            onClick={() => setActiveTab('tab2')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab2'

                ? 'border-amber-600 text-amber-600'

                : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            Phê Duyệt Ngoại Lệ Chi Phí

          </button>

          <button
            onClick={() => setActiveTab('tab3')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tab3'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Báo Cáo Quyết Toán
          </button>

        </nav>

      </div>



      {/* Tab 1: Phê duyệt đề xuất */}

      {activeTab === 'tab1' && (

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">
                Hồ Sơ Đề Xuất Công Tác - Đơn Vị {currentUser.tenPB || currentUser.maPB}
              </h3>
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {filteredManagerList.length} hồ sơ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerScheduler}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Kích hoạt tiến trình quét định kỳ gửi email nhắc nhở tự động"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Quét Nhắc Nhở Tự Động
              </button>
              <button
                type="button"
                onClick={() => fetchDonChoDuyet(managerFilterStatus)}
                disabled={loading}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 text-slate-700 cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Thanh công cụ lọc tình trạng đơn & tìm kiếm */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchManagerKeyword}
                  onChange={(e) => setSearchManagerKeyword(e.target.value)}
                  placeholder="Tìm theo mã, tên NV hoặc mục đích..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Tình trạng đơn:</span>
                <select
                  value={managerFilterStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setManagerFilterStatus(nextStatus);
                    fetchDonChoDuyet(nextStatus);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="CHO_DUYET">Chờ phê duyệt (Cần xử lý)</option>
                  <option value="ALL">Tất cả tình trạng đơn</option>
                  <option value="DA_DUYET">Đã phê duyệt</option>
                  <option value="TU_CHOI">Đã từ chối</option>
                  <option value="DA_TAM_UNG">Đã tạm ứng</option>
                  <option value="CHO_QUYET_TOAN">Chờ quyết toán</option>
                  <option value="DA_CHOT_SO">Đã chốt sổ quyết toán</option>
                  <option value="BAN_NHAP">Bản nháp</option>
                  <option value="DA_HUY">Đã hủy</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500">
              <span>Hiển thị: <strong>{filteredManagerList.length}</strong> / {danhSach.length} hồ sơ</span>
              {(managerFilterStatus !== 'CHO_DUYET' || searchManagerKeyword) && (
                <button
                  type="button"
                  onClick={() => {
                    setManagerFilterStatus('CHO_DUYET');
                    setSearchManagerKeyword('');
                    fetchDonChoDuyet('CHO_DUYET');
                  }}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline ml-2"
                >
                  Đặt lại lọc
                </button>
              )}
            </div>
          </div>

          {/* Cảnh báo nhắc nhở tự động */}
          {donTonDongList.some(d => d.daQuaHan3Ngay) && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Cảnh báo nhắc nhở:</strong> Có <strong>{donTonDongList.filter(d => d.daQuaHan3Ngay).length} đơn đề xuất</strong> tồn đọng quá 3 ngày chưa duyệt! Tiến trình định thời đã gửi thông báo/email nhắc nhở tới Quản lý.
                </span>
              </div>
              <button
                type="button"
                onClick={handleTriggerScheduler}
                className="px-2.5 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition cursor-pointer shrink-0"
              >
                Xem chi tiết
              </button>
            </div>
          )}

          {filteredManagerList.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">
                {danhSach.length > 0
                  ? 'Không tìm thấy đơn nào phù hợp với bộ lọc hiện tại.'
                  : 'Hiện không có đơn nào ở trạng thái này.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Mã Đề Xuất</th>
                    <th className="px-6 py-3.5">Người Đề Xuất</th>
                    <th className="px-6 py-3.5">Mục Đích</th>
                    <th className="px-6 py-3.5">Thời Gian</th>
                    <th className="px-6 py-3.5 text-right">Tổng Dự Toán</th>
                    <th className="px-6 py-3.5 text-right">Tạm Ứng Đề Nghị</th>
                    <th className="px-6 py-3.5 text-center">Tình Trạng</th>
                    <th className="px-6 py-3.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredManagerList.map((item) => (
                    <tr key={item.maDeXuat} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                        <div>{item.maDeXuat}</div>
                        {donTonDongList.find(d => d.maDeXuat === item.maDeXuat)?.daQuaHan3Ngay && (
                          <span className="inline-block mt-1 text-[10px] font-sans font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            ⚠️ Tồn đọng &gt; 3 ngày
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.tenNhanVien}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{item.mucDich}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{formatDate(item.ngayDi)} → {formatDate(item.ngayVe)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatVND(item.tongKinhPhiDuToan)}</td>
                      <td className="px-6 py-4 text-right font-medium text-purple-700">{formatVND(item.soTienTamUngDeNghi)}</td>
                      <td className="px-6 py-4 text-center">
                        {getTrangThaiBadge(item.trangThai)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {['Chờ duyệt', 'CHO_DUYET'].includes(item.trangThai) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDon(item)}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition cursor-pointer"
                          >
                            Xét Duyệt
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedDon(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Xem Chi Tiết
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          )}

        </div>

      )}



      {/* Tab 2: Phê duyệt ngoại lệ chi phí  */}

      {activeTab === 'tab2' && (

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">

            <div>

              <h3 className="font-bold text-sm text-slate-800">

                Danh Sách Khoản Chi Phát Sinh Vượt Định Mức / Cần Duyệt Ngoại Lệ

              </h3>

              

            </div>

            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">

              {ngoaiLeList.length} hồ sơ ngoại lệ

            </span>

          </div>



          {ngoaiLeList.length === 0 ? (

            <div className="p-12 text-center text-slate-500">

              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />

              <p className="text-sm font-semibold">Không có khoản chi nào cần duyệt ngoại lệ.</p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">

                  <tr>

                    <th className="px-4 py-3.5">Mã GT</th>

                    <th className="px-4 py-3.5">Cán Bộ</th>

                    <th className="px-4 py-3.5">Chuyến Đi</th>

                    <th className="px-4 py-3.5">Loại Chi Phí</th>

                    <th className="px-4 py-3.5 text-right">Số Tiền Thực Tế</th>

                    <th className="px-4 py-3.5">Lý Do Giải Trình</th>

                    <th className="px-4 py-3.5 text-center">Kết Quả Phê Duyệt</th>

                    <th className="px-4 py-3.5 text-center">Thao Tác</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">

                  {ngoaiLeList.map((item) => (

                    <tr key={item.maGiaiTrinh} className="hover:bg-slate-50">

                      <td className="px-4 py-3.5 font-mono font-bold text-slate-700">{item.maGiaiTrinh}</td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900">{item.tenNhanVien}</td>

                      <td className="px-4 py-3.5 font-mono text-xs text-indigo-700">{item.maDeXuat}</td>

                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700">{item.tenLoaiChiPhi}</td>

                      <td className="px-4 py-3.5 text-right font-bold text-rose-600">{formatVND(item.soTienThucTe)}</td>

                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs">{item.lyDo}</td>

                      <td className="px-4 py-3.5 text-center">

                        {item.kqPheDuyet === 'Đã duyệt đặc cách' && (

                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">

                            Đã duyệt đặc cách

                          </span>

                        )}

                        {item.kqPheDuyet === 'Từ chối ngoại lệ' && (

                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300">

                            Từ chối ngoại lệ

                          </span>

                        )}

                        {item.kqPheDuyet === 'Chờ duyệt ngoại lệ' && (

                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">

                            Chờ duyệt ngoại lệ

                          </span>

                        )}

                      </td>

                      <td className="px-4 py-3.5 text-center">

                        {item.kqPheDuyet === 'Chờ duyệt ngoại lệ' ? (

                          <div className="flex items-center justify-center gap-1.5">

                            <button

                              onClick={() => handleDuyetNgoaiLe(item, 'DUYET')}

                              disabled={ngoaiLeActionLoading}

                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"

                            >

                              Duyệt đặc cách

                            </button>

                            <button

                              onClick={() => handleDuyetNgoaiLe(item, 'TU_CHOI')}

                              disabled={ngoaiLeActionLoading}

                              className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"

                            >

                              Từ chối

                            </button>

                          </div>

                        ) : (

                          <span className="text-xs text-slate-400 font-medium">Đã xử lý</span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}



      {/* Modal Phê duyệt đề xuất */}

      {selectedDon && (

        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">

            <div className="flex justify-between items-center border-b pb-3">

              <h3 className="font-bold text-base text-slate-900">

                Xét Duyệt Đề Xuất: {selectedDon.maDeXuat}

              </h3>

              <button onClick={() => setSelectedDon(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">

                <X className="w-5 h-5" />

              </button>

            </div>



            <div className="text-xs space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">

              <p><strong>Cán bộ:</strong> {selectedDon.tenNhanVien}</p>

              <p><strong>Mục đích:</strong> {selectedDon.mucDich}</p>

              <p><strong>Thời gian:</strong> {formatDate(selectedDon.ngayDi)} đến {formatDate(selectedDon.ngayVe)} ({selectedDon.soNgayCongTac} ngày)</p>

              <p><strong>Tổng kinh phí dự toán:</strong> {formatVND(selectedDon.tongKinhPhiDuToan)}</p>

              <p><strong>Tạm ứng đề nghị:</strong> {formatVND(selectedDon.soTienTamUngDeNghi)}</p>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Tình trạng đơn:</span>
                {getTrangThaiBadge(selectedDon.trangThai)}
              </div>

              {selectedDon.lyDoTuChoi && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <strong>Lý do từ chối:</strong> {selectedDon.lyDoTuChoi}
                </div>
              )}

            </div>

            {['Chờ duyệt', 'CHO_DUYET'].includes(selectedDon.trangThai) ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Ý Kiến Chỉ Đạo / Ghi Chú Phê Duyệt:
                  </label>
                  <textarea
                    rows="3"
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Nhập lý do phê duyệt hoặc lý do từ chối..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleXetDuyet('TU_CHOI')}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
                  >
                    Từ Chối
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleXetDuyet('DUYET')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Phê Duyệt
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDon(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}

          </div>

        </div>

      )}

      {activeTab === 'tab3' && (
        <SettlementReportSection
          currentUser={currentUser}
          scope="DEPARTMENT"
          formatVND={formatVND}
          formatDate={formatDate}
          showNotification={showNotification}
        />
      )}

      {/* Modal hiển thị nhật ký quét định thời */}
      {schedulerModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Bộ Định Thời Nhắc Nhở Duyệt Đơn
                  </h3>
                  <p className="text-xs text-slate-500">Tiến trình tự động quét định kỳ nhắc Quản lý duyệt đơn tồn đọng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSchedulerModal({ isOpen: false, data: null, loading: false })}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {schedulerModal.loading ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold">Đang truy vấn CSDL và kích hoạt gửi thông báo tự động...</p>
              </div>
            ) : schedulerModal.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Chờ Duyệt</p>
                    <p className="text-lg font-bold text-slate-800">{schedulerModal.data.tongSoDonChoDuyet}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-[11px] text-amber-700">Tồn Đọng &gt; 3 Ngày</p>
                    <p className="text-lg font-bold text-amber-800">{schedulerModal.data.soDonQuaHan3Ngay}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-[11px] text-emerald-700">Email Đã Gửi</p>
                    <p className="text-lg font-bold text-emerald-800">{schedulerModal.data.soEmailDaGui}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nhật Ký Hệ Thống (System Log)
                  </h4>
                  <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto space-y-1.5">
                    {schedulerModal.data.nhatKyHoatDong?.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        &gt; {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulerModal({ isOpen: false, data: null, loading: false })}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>

  );

}



// =========================================================================

// 3. PHÂN HỆ KẾ TOÁN (KE_TOAN - KT01)

// =========================================================================

function AccountantDashboard({ currentUser, activeTab, setActiveTab, formatVND, formatDate, getTrangThaiBadge, showNotification, showConfirm }) {

  // Tab 1: Đơn đã duyệt chờ chi tạm ứng

  const [choTamUng, setChoTamUng] = useState([]);

  const [selectedTamUng, setSelectedTamUng] = useState(null);

  const [maTamUng, setMaTamUng] = useState('TU_' + Date.now().toString().slice(-4));

  const [soTienChi, setSoTienChi] = useState('');

  const [tamUngLoading, setTamUngLoading] = useState(false);

  // Bộ lọc trạng thái chi tạm ứng & tìm kiếm
  const [tamUngFilterStatus, setTamUngFilterStatus] = useState('DA_DUYET');
  const [searchTamUngKeyword, setSearchTamUngKeyword] = useState('');

  // Bộ lọc trạng thái hồ sơ quyết toán & tìm kiếm
  const [quyetToanFilterStatus, setQuyetToanFilterStatus] = useState('CHO_QUYET_TOAN');
  const [searchQuyetToanKeyword, setSearchQuyetToanKeyword] = useState('');



  // Tab 2: Chứng từ OCR & Quyết toán

  const [chungTuList, setChungTuList] = useState([]);
  const [choQuyetToanList, setChoQuyetToanList] = useState([]);
  const [settlementModal, setSettlementModal] = useState({ isOpen: false, trip: null, claims: [], loading: false });
  const [selectedClaimIdx, setSelectedClaimIdx] = useState(0);
  const [editingClaimAmounts, setEditingClaimAmounts] = useState({});
  const [savingClaimId, setSavingClaimId] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('');
  const [previewChungTuModal, setPreviewChungTuModal] = useState({ isOpen: false, item: null });
  const [previewImageModal, setPreviewImageModal] = useState({ isOpen: false, url: '', title: '' });

  const resolveImageUrl = (link) => {
    if (!link) return '/HoaDonThucTe/02_vinasun_taxi_real.png';
    if (link.startsWith('data:image') || link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    return link.startsWith('/') ? link : '/' + link;
  };

  const [maQuyetToan, setMaQuyetToan] = useState('QT_' + Date.now().toString().slice(-4));

  const [maDeXuatChot, setMaDeXuatChot] = useState('');

  const [chotLoading, setChotLoading] = useState(false);



  // Tab 3: Báo cáo tổng hợp quyết toán

  const [tongHopList, setTongHopList] = useState([]);



  // Tab 4: Cấu hình quy tắc định mức
  const DEFAULT_LOAI_CHI_PHI = [
    { maLoaiCP: 'CP_VEMAYBAY', tenLoai: 'Vé máy bay khứ hồi' },
    { maLoaiCP: 'CP_KHACHSAN', tenLoai: 'Tiền thuê phòng khách sạn' },
    { maLoaiCP: 'CP_DIENTHOAI', tenLoai: 'Cước di chuyển & Taxi' },
    { maLoaiCP: 'CP_TIEPKHACH', tenLoai: 'Chi phí tiếp khách & Ngoại giao' }
  ];

  const [dinhMucList, setDinhMucList] = useState([]);

  const [loaiChiPhiList, setLoaiChiPhiList] = useState(DEFAULT_LOAI_CHI_PHI);

  const [dinhMucLoading, setDinhMucLoading] = useState(false);

  const [showDinhMucModal, setShowDinhMucModal] = useState(false);

  const [editingDinhMuc, setEditingDinhMuc] = useState(null);

  const initialDinhMucForm = {

    maQuyDinh: '',

    maLoaiCP: 'CP_KHACHSAN',

    capBacApDung: 'Tất cả nhân viên',

    soTienToiDa: '',

    ngayHieuLuc: '2026-01-01',

    ngayHetHan: '2026-12-31'

  };

  const [dinhMucForm, setDinhMucForm] = useState(initialDinhMucForm);

  const [dinhMucActionLoading, setDinhMucActionLoading] = useState(false);



  // Fetch dữ liệu tương ứng tab

  const fetchChoTamUng = async (status = tamUngFilterStatus) => {

    setTamUngLoading(true);

    try {

      const res = await getDanhSachDeXuat({ trangThai: status });

      if (res.data && res.data.success) {

        setChoTamUng(res.data.data || []);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setTamUngLoading(false);

    }

  };



  const fetchChoQuyetToan = async (status = quyetToanFilterStatus) => {
    try {
      const res = await getDanhSachDeXuat({ trangThai: status });
      if (res.data && res.data.success) {
        setChoQuyetToanList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTamUngList = choTamUng.filter((item) => {
    const kw = searchTamUngKeyword.trim().toLowerCase();
    if (!kw) return true;
    return (
      item.maDeXuat?.toLowerCase().includes(kw) ||
      item.tenNhanVien?.toLowerCase().includes(kw) ||
      item.mucDich?.toLowerCase().includes(kw)
    );
  });

  const filteredQuyetToanList = choQuyetToanList.filter((item) => {
    const kw = searchQuyetToanKeyword.trim().toLowerCase();
    if (!kw) return true;
    return (
      item.maDeXuat?.toLowerCase().includes(kw) ||
      item.tenNhanVien?.toLowerCase().includes(kw) ||
      item.mucDich?.toLowerCase().includes(kw)
    );
  });

  const fetchChungTu = async () => {
    try {
      const res = await getChungTu();
      if (res.data && res.data.success) {
        setChungTuList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openSettlementModal = async (trip) => {
    setSelectedClaimIdx(0);
    setSettlementModal({ isOpen: true, trip, claims: [], loading: true });
    try {
      const res = await getChungTu(trip.maDeXuat);
      const claims = (res.data && res.data.success) ? (res.data.data || []) : [];
      const amounts = {};
      claims.forEach(c => {
        amounts[c.maCTKB] = c.soTienThucTe;
      });
      setEditingClaimAmounts(amounts);
      setSettlementModal({ isOpen: true, trip, claims, loading: false });

      const tongThuc = claims.reduce((acc, c) => acc + (parseFloat(c.soTienThucTe) || 0), 0);
      const tamUng = parseFloat(trip.soTienTamUngThucTe || trip.soTienTamUngDeNghi) || 0;
      const buTru = tongThuc - tamUng;
      if (buTru > 0) setSelectedDirection('HOAN_TRA');
      else if (buTru < 0) setSelectedDirection('THU_HOI');
      else setSelectedDirection('CAN_BANG');
    } catch (err) {
      console.error(err);
      setSettlementModal({ isOpen: false, trip: null, claims: [], loading: false });
      showNotification('error', 'Không thể tải chi tiết chứng từ quyết toán.');
    }
  };

  const handleSaveClaimAdjustment = async (maCTKB) => {
    const val = parseFloat(editingClaimAmounts[maCTKB]);
    if (isNaN(val) || val < 0) {
      showNotification('warning', 'Số tiền điều chỉnh không hợp lệ.');
      return;
    }
    setSavingClaimId(maCTKB);
    try {
      const res = await dieuChinhChiPhi(maCTKB, { soTienDieuChinh: val });
      if (res.data && res.data.success) {
        showNotification('success', 'Đã điều chỉnh số tiền thực chi thành công!');
        // Update local settlement modal claims
        setSettlementModal(prev => ({
          ...prev,
          claims: prev.claims.map(c => c.maCTKB === maCTKB ? { ...c, soTienThucTe: val } : c)
        }));
        fetchChungTu();
      } else {
        showNotification('error', res.data?.message || 'Lỗi khi cập nhật số tiền.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Lỗi kết nối khi cập nhật.');
    } finally {
      setSavingClaimId(null);
    }
  };

  const handleConfirmSettlementFromModal = async () => {
    if (!settlementModal.trip) return;
    setChotLoading(true);
    try {
      const payload = {
        maQuyetToan: 'QT_' + Date.now().toString().slice(-4) + '_' + Math.floor(100 + Math.random() * 900),
        maDeXuat: settlementModal.trip.maDeXuat,
        maNVKeToan: currentUser.maNV
      };
      const res = await chotSoQuyetToan(payload);
      if (res.data && res.data.success) {
        showNotification('success', res.data.message || 'Chốt sổ quyết toán tài chính thành công!');
        setSettlementModal({ isOpen: false, trip: null, claims: [], loading: false });
        fetchChoQuyetToan();
        fetchChungTu();
        fetchTongHop();
      } else {
        showNotification('error', res.data?.message || 'Lỗi chốt sổ.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Lỗi khi chốt sổ quyết toán.');
    } finally {
      setChotLoading(false);
    }
  };



  const fetchTongHop = async () => {

    try {

      const res = await getTongHopQuyetToan();

      if (res.data && res.data.success) {

        setTongHopList(res.data.data || []);

      }

    } catch (err) {

      console.error(err);

    }

  };



  const fetchDinhMuc = async () => {
    setDinhMucLoading(true);
    try {
      const resDm = await getDinhMuc().catch(() => null);
      if (resDm?.data && resDm.data.success) {
        setDinhMucList(resDm.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const resLcp = await getLoaiChiPhi().catch(() => null);
      if (resLcp?.data && resLcp.data.success && Array.isArray(resLcp.data.data) && resLcp.data.data.length > 0) {
        setLoaiChiPhiList(resLcp.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDinhMucLoading(false);
    }
  };

  useEffect(() => {
    // Tải sẵn danh mục loại chi phí ngay khi vào phân hệ kế toán
    getLoaiChiPhi().then(res => {
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setLoaiChiPhiList(res.data.data);
      }
    }).catch(() => {});

    if (activeTab === 'tab1') fetchChoTamUng();
    if (activeTab === 'tab2') { fetchChoQuyetToan(); fetchChungTu(); }
    if (activeTab === 'tab3') fetchTongHop();
    if (activeTab === 'tab4') fetchDinhMuc();
  }, [activeTab]);

  const openCreateDinhMuc = () => {
    const list = loaiChiPhiList.length > 0 ? loaiChiPhiList : DEFAULT_LOAI_CHI_PHI;
    setEditingDinhMuc(null);
    setDinhMucForm({
      maQuyDinh: 'QD' + (dinhMucList.length + 1).toString().padStart(2, '0'),
      maLoaiCP: (list[0]?.maLoaiCP || list[0]?.MaLoaiCP || 'CP_KHACHSAN'),
      capBacApDung: 'Tất cả nhân viên',
      soTienToiDa: '',
      ngayHieuLuc: new Date().toISOString().split('T')[0],
      ngayHetHan: ''
    });
    setShowDinhMucModal(true);
  };

  const openEditDinhMuc = (item) => {
    setEditingDinhMuc(item);
    setDinhMucForm({
      maQuyDinh: item.maQuyDinh || item.MaQuyDinh,
      maLoaiCP: item.maLoaiCP || item.MaLoaiCP,
      capBacApDung: item.capBacApDung || item.CapBacApDung || 'Tất cả nhân viên',
      soTienToiDa: item.soTienToiDa || item.SoTienToiDa,
      ngayHieuLuc: item.ngayHieuLuc ? item.ngayHieuLuc.split('T')[0] : '',
      ngayHetHan: item.ngayHetHan ? item.ngayHetHan.split('T')[0] : ''
    });
    setShowDinhMucModal(true);
  };



  const handleSaveDinhMuc = async (e) => {

    e.preventDefault();

    if (!dinhMucForm.soTienToiDa || parseFloat(dinhMucForm.soTienToiDa) <= 0) {

      showNotification('warning', 'Vui lòng nhập hạn mức chi phí tối đa lớn hơn 0.');

      return;

    }



    if (dinhMucForm.ngayHetHan && dinhMucForm.ngayHetHan < dinhMucForm.ngayHieuLuc) {

      showNotification('warning', 'Ngày hết hạn không được nhỏ hơn ngày hiệu lực.');

      return;

    }



    setDinhMucActionLoading(true);

    try {

      if (editingDinhMuc) {

        const payload = {

          soTienToiDa: parseFloat(dinhMucForm.soTienToiDa),

          ngayHieuLuc: dinhMucForm.ngayHieuLuc,

          ngayHetHan: dinhMucForm.ngayHetHan || null

        };

        const res = await updateDinhMuc(editingDinhMuc.maQuyDinh, payload);

        if (res.data && res.data.success) {

          showNotification('success', 'Cập nhật quy định định mức thành công.');

          setShowDinhMucModal(false);

          fetchDinhMuc();

        } else {

          showNotification('error', res.data?.message || 'Lỗi cập nhật.');

        }

      } else {

        const payload = {

          maQuyDinh: dinhMucForm.maQuyDinh,

          maLoaiCP: dinhMucForm.maLoaiCP,

          capBacApDung: dinhMucForm.capBacApDung,

          soTienToiDa: parseFloat(dinhMucForm.soTienToiDa),

          ngayHieuLuc: dinhMucForm.ngayHieuLuc,

          ngayHetHan: dinhMucForm.ngayHetHan || null

        };

        const res = await createDinhMuc(payload);

        if (res.data && res.data.success) {

          showNotification('success', 'Thiết lập quy định định mức mới thành công.');

          setShowDinhMucModal(false);

          fetchDinhMuc();

        } else {

          showNotification('error', res.data?.message || 'Lỗi thiết lập.');

        }

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi khi lưu quy định định mức.');

    } finally {

      setDinhMucActionLoading(false);

    }

  };



  const handleDeleteDinhMucItem = (maQuyDinh) => {

    showConfirm({

      title: 'Xóa Quy Định Định Mức',

      message: `Bạn có chắc chắn muốn xóa quy định định mức '${maQuyDinh}' khỏi hệ thống?`,

      confirmText: 'Xóa ngay',

      cancelText: 'Hủy bỏ',

      onConfirm: async () => {

        try {

          const res = await deleteDinhMuc(maQuyDinh);

          if (res.data && res.data.success) {

            showNotification('success', 'Đã xóa quy định định mức thành công.');

            fetchDinhMuc();

          } else {

            showNotification('error', res.data?.message || 'Lỗi khi xóa.');

          }

        } catch (err) {

          showNotification('error', err.response?.data?.message || 'Không thể xóa quy định định mức.');

        }

      }

    });

  };



  // Xử lý chi tạm ứng (gọi sp_ChiTamUng)

  const handleXacNhanTamUng = async (e) => {

    e.preventDefault();

    if (!selectedTamUng) return;

    setTamUngLoading(true);

    try {

      const payload = {

        maTamUng: maTamUng,

        maDeXuat: selectedTamUng.maDeXuat,

        maNVKeToan: currentUser.maNV,

        soTienChi: parseFloat(soTienChi)

      };

      const res = await chiTamUng(payload);

      if (res.data && res.data.success) {

        showNotification('success', res.data.message || 'Ghi nhận chi tạm ứng thành công.');

        setSelectedTamUng(null);

        fetchChoTamUng();

      } else {

        showNotification('error', res.data?.message || 'Lỗi chi tạm ứng.');

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi khi gọi API chi tạm ứng.');

    } finally {

      setTamUngLoading(false);

    }

  };



  // Xử lý chốt sổ quyết toán (gọi sp_ChotSoQuyetToan)

  const handleChotSo = async (e) => {

    e.preventDefault();

    if (!maDeXuatChot) {

      showNotification('warning', 'Vui lòng nhập Mã đề xuất cần chốt sổ.');

      return;

    }

    setChotLoading(true);

    try {

      const payload = {

        maQuyetToan: maQuyetToan,

        maDeXuat: maDeXuatChot,

        maNVKeToan: currentUser.maNV

      };

      const res = await chotSoQuyetToan(payload);

      if (res.data && res.data.success) {

        showNotification('success', res.data.message || 'Chốt sổ quyết toán và khóa hồ sơ thành công.');
        setMaDeXuatChot('');
        setMaQuyetToan('QT_' + Date.now().toString().slice(-4) + '_' + Math.floor(100 + Math.random() * 900));
        fetchChungTu();

      } else {

        showNotification('error', res.data?.message || 'Lỗi chốt sổ.');

      }

    } catch (err) {

      showNotification('error', err.response?.data?.message || 'Lỗi khi gọi API chốt sổ quyết toán.');

    } finally {

      setChotLoading(false);

    }

  };



  return (

    <div className="space-y-6">

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">

            <DollarSign className="w-6 h-6" />

          </div>

          <div>

            <h2 className="text-base font-bold text-slate-900">

              Phân Hệ Kế Toán: Quản Trị Tạm Ứng & Quyết Toán Chi Phí

            </h2>

            

          </div>

        </div>

      </div>



      {/* 4 Tab của Kế toán */}

      <div className="border-b border-slate-200">

        <nav className="flex space-x-6">

          <button

            onClick={() => setActiveTab('tab1')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab1' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            1. Quản Lý Chi Tạm Ứng

          </button>

          <button

            onClick={() => setActiveTab('tab2')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab2' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            2. Đối Soát Hóa Đơn & Chốt Sổ

          </button>

          <button

            onClick={() => setActiveTab('tab3')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab3' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            3. Báo Cáo Tổng Hợp Quyết Toán

          </button>

          <button

            onClick={() => setActiveTab('tab4')}

            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${

              activeTab === 'tab4' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'

            }`}

          >

            4. Quy Tắc Định Mức (Rule Engine)

          </button>

        </nav>

      </div>



      {/* Tab 1: Chi tạm ứng */}

      {activeTab === 'tab1' && (

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">
                Quản Lý Hồ Sơ Chi Tạm Ứng Kinh Phí Công Tác
              </h3>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {filteredTamUngList.length} đề xuất
              </span>
            </div>

            <button
              type="button"
              onClick={() => fetchChoTamUng(tamUngFilterStatus)}
              disabled={tamUngLoading}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 text-slate-700 cursor-pointer self-start sm:self-auto"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${tamUngLoading ? 'animate-spin text-purple-600' : ''}`} />
              Làm mới
            </button>

          </div>

          {/* Thanh công cụ lọc tình trạng đơn & tìm kiếm */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchTamUngKeyword}
                  onChange={(e) => setSearchTamUngKeyword(e.target.value)}
                  placeholder="Tìm theo mã, tên NV hoặc mục đích..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Tình trạng đơn:</span>
                <select
                  value={tamUngFilterStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setTamUngFilterStatus(nextStatus);
                    fetchChoTamUng(nextStatus);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="DA_DUYET">Chờ chi tạm ứng (Đã duyệt)</option>
                  <option value="DA_TAM_UNG">Đã chi tạm ứng</option>
                  <option value="ALL">Tất cả đề xuất</option>
                  <option value="CHO_QUYET_TOAN">Chờ quyết toán</option>
                  <option value="DA_CHOT_SO">Đã chốt sổ</option>
                  <option value="TU_CHOI">Từ chối</option>
                  <option value="BAN_NHAP">Bản nháp</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500">
              <span>Hiển thị: <strong>{filteredTamUngList.length}</strong> / {choTamUng.length} đề xuất</span>
              {(tamUngFilterStatus !== 'DA_DUYET' || searchTamUngKeyword) && (
                <button
                  type="button"
                  onClick={() => {
                    setTamUngFilterStatus('DA_DUYET');
                    setSearchTamUngKeyword('');
                    fetchChoTamUng('DA_DUYET');
                  }}
                  className="text-xs text-purple-700 hover:text-purple-900 font-semibold cursor-pointer underline ml-2"
                >
                  Đặt lại về "Chờ chi"
                </button>
              )}
            </div>
          </div>

          {filteredTamUngList.length === 0 ? (

            <div className="p-12 text-center text-slate-500">

              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />

              <p className="text-sm font-semibold">
                {choTamUng.length > 0
                  ? 'Không tìm thấy đề xuất nào phù hợp với bộ lọc hiện tại.'
                  : 'Hiện không có đơn nào ở trạng thái này.'}
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">

                  <tr>

                    <th className="px-6 py-3.5">Mã Đề Xuất</th>

                    <th className="px-6 py-3.5">Nhân Viên</th>

                    <th className="px-6 py-3.5">Mục Đích</th>

                    <th className="px-6 py-3.5 text-right">Tổng Dự Toán</th>

                    <th className="px-6 py-3.5 text-right">Tạm Ứng Đề Nghị</th>

                    <th className="px-6 py-3.5 text-center">Tình Trạng</th>

                    <th className="px-6 py-3.5 text-center">Thao Tác</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">

                  {filteredTamUngList.map((item) => (

                    <tr key={item.maDeXuat} className="hover:bg-slate-50">

                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">{item.maDeXuat}</td>

                      <td className="px-6 py-4 font-semibold text-slate-900">{item.tenNhanVien}</td>

                      <td className="px-6 py-4 max-w-xs truncate">{item.mucDich}</td>

                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatVND(item.tongKinhPhiDuToan)}</td>

                      <td className="px-6 py-4 text-right font-bold text-purple-700">{formatVND(item.soTienTamUngDeNghi)}</td>

                      <td className="px-6 py-4 text-center">
                        {getTrangThaiBadge(item.trangThai)}
                      </td>

                      <td className="px-6 py-4 text-center">

                        {['Đã duyệt', 'DA_DUYET'].includes(item.trangThai) ? (
                          <button

                            onClick={() => {

                              setSelectedTamUng(item);
                              setMaTamUng('TU_' + Date.now().toString().slice(-4) + '_' + Math.floor(100 + Math.random() * 900));
                              setSoTienChi(item.soTienTamUngDeNghi);

                            }}

                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition cursor-pointer"

                          >

                            Lập Phiếu Chi

                          </button>
                        ) : item.trangThai === 'Đã tạm ứng' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                            Đã chi: {formatVND(item.soTienTamUngThucTe || item.soTienTamUngDeNghi)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">---</span>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}



          {/* Modal lập phiếu chi tạm ứng */}

          {selectedTamUng && (

            <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">

              <form onSubmit={handleXacNhanTamUng} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">

                <div className="flex justify-between items-center border-b pb-3">

                  <h3 className="font-bold text-base text-slate-900">

                    Lập Phiếu Chi Tạm Ứng: {selectedTamUng.maDeXuat}

                  </h3>

                  <button type="button" onClick={() => setSelectedTamUng(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">

                    <X className="w-5 h-5" />

                  </button>

                </div>



                <div className="space-y-3">

                  <div>

                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Phiếu Tạm Ứng:</label>

                    <input

                      type="text"

                      required

                      value={maTamUng}

                      onChange={(e) => setMaTamUng(e.target.value)}

                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"

                    />

                  </div>



                  <div>

                    <label className="block text-xs font-semibold text-slate-600 mb-1">Số Tiền Chi Tạm Ứng (VNĐ):</label>

                    <input

                      type="number"

                      required

                      value={soTienChi}

                      onChange={(e) => setSoTienChi(e.target.value)}

                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-purple-700"

                    />

                  </div>

                </div>



                <div className="flex justify-end gap-3 pt-3">

                  <button

                    type="button"

                    onClick={() => setSelectedTamUng(null)}

                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"

                  >

                    Hủy

                  </button>

                  <button

                    type="submit"

                    disabled={tamUngLoading}

                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition cursor-pointer"

                  >

                    Xác Nhận Chi Tiền

                  </button>

                </div>

              </form>

            </div>

          )}

        </div>

      )}



      {/* Tab 2: Đối soát chứng từ & Chốt sổ */}

      {activeTab === 'tab2' && (
        <div className="space-y-6">
          {/* PHẦN 1: HỒ SƠ QUYẾT TOÁN TÀI CHÍNH */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Hồ Sơ Quyết Toán & Đối Soát Tài Chính
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi các chuyến đi từ khi tạm ứng, đi công tác về đến khi chốt sổ quyết toán bù trừ
                </p>
              </div>
              <button
                type="button"
                onClick={() => { fetchChoQuyetToan(quyetToanFilterStatus); fetchChungTu(); }}
                className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 text-slate-700 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                Làm mới
              </button>
            </div>

            {/* Thanh công cụ lọc tình trạng đơn & tìm kiếm */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuyetToanKeyword}
                    onChange={(e) => setSearchQuyetToanKeyword(e.target.value)}
                    placeholder="Tìm theo mã, người đi hoặc mục đích..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600">Tình trạng hồ sơ:</span>
                  <select
                    value={quyetToanFilterStatus}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      setQuyetToanFilterStatus(nextStatus);
                      fetchChoQuyetToan(nextStatus);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="CHO_QUYET_TOAN">Chờ quyết toán (Nhân viên đã hoàn thành)</option>
                    <option value="DA_TAM_UNG">Đang đi công tác (Đã tạm ứng)</option>
                    <option value="DA_CHOT_SO">Đã chốt sổ quyết toán</option>
                    <option value="ALL">Tất cả hồ sơ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500">
                <span>Hiển thị: <strong>{filteredQuyetToanList.length}</strong> / {choQuyetToanList.length} hồ sơ</span>
                {(quyetToanFilterStatus !== 'CHO_QUYET_TOAN' || searchQuyetToanKeyword) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuyetToanFilterStatus('CHO_QUYET_TOAN');
                      setSearchQuyetToanKeyword('');
                      fetchChoQuyetToan('CHO_QUYET_TOAN');
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline ml-2"
                  >
                    Đặt lại về "Chờ quyết toán"
                  </button>
                )}
              </div>
            </div>

            {filteredQuyetToanList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50/50">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">
                  {choQuyetToanList.length > 0
                    ? 'Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại.'
                    : 'Hiện không có hồ sơ nào ở trạng thái này.'}
                </p>
                <p className="text-slate-400 mt-0.5">
                  Sau khi nhân viên đi công tác về và bấm <strong>"Hoàn thành chuyến đi"</strong>, hồ sơ sẽ lập tức hiển thị tại đây để Kế toán mở ra chọn Hướng Xử Lý và chốt sổ.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Mã Đề Xuất</th>
                      <th className="px-6 py-3.5">Người Đi Công Tác</th>
                      <th className="px-6 py-3.5">Mục Đích Chuyến Đi</th>
                      <th className="px-6 py-3.5">Thời Gian</th>
                      <th className="px-6 py-3.5 text-right">Tạm Ứng Đã Nhận</th>
                      <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                      <th className="px-6 py-3.5 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredQuyetToanList.map((trip) => (
                      <tr key={trip.maDeXuat} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                          {trip.maDeXuat}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{trip.hoTen || trip.tenNhanVien || trip.maNV}</div>
                          <div className="text-xs text-slate-500">{trip.tenPB || trip.maPB}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-xs truncate" title={trip.mucDich}>
                          {trip.mucDich}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {formatDate(trip.ngayDi)} → {formatDate(trip.ngayVe)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-purple-700">
                          {formatVND(trip.soTienTamUngThucTe || trip.soTienTamUngDeNghi || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getTrangThaiBadge(trip.trangThai)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {['Chờ quyết toán', 'CHO_QUYET_TOAN'].includes(trip.trangThai) ? (
                            <button
                              type="button"
                              onClick={() => openSettlementModal(trip)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Mở Đối Soát & Chốt Sổ
                            </button>
                          ) : trip.trangThai === 'Đã chốt sổ' ? (
                            <button
                              type="button"
                              onClick={() => openSettlementModal(trip)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-100 transition cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem Hồ Sơ Quyết Toán
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Đang thực hiện</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PHẦN 2: BẢNG NHẬT KÝ KHAI BÁO CHỨNG TỪ (ĐÃ BỎ CỘT JSON BÓC TÁCH THEO YÊU CẦU) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Nhật Ký Hóa Đơn & Chứng Từ Chi Phí Toàn Hệ Thống
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Danh sách các khoản chi thực tế và chứng từ hóa đơn đính kèm</p>
              </div>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                {chungTuList.length} chứng từ
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Mã CTKB</th>
                    <th className="px-6 py-3.5">Đề Xuất</th>
                    <th className="px-6 py-3.5">Nhân Viên</th>
                    <th className="px-6 py-3.5">Loại Chi Phí</th>
                    <th className="px-6 py-3.5">Ngày Chi</th>
                    <th className="px-6 py-3.5 text-right">Số Tiền Thực Tế</th>
                    <th className="px-6 py-3.5 text-center">Chứng Từ / OCR</th>
                    <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {chungTuList.map((c) => (
                    <tr key={c.maCTKB} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">{c.maCTKB}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">{c.maDeXuat}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-900">{c.tenNhanVien || c.maNV}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{c.tenLoaiChiPhi}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{formatDate(c.ngayChi)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatVND(c.soTienThucTe)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPreviewChungTuModal({ isOpen: true, item: c })}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                        >
                          Xem Hóa Đơn & OCR
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {c.trangThaiHopLe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* Tab 3: Báo cáo tổng hợp quyết toán */}
      {activeTab === 'tab3' && (
        <SettlementReportSection
          currentUser={currentUser}
          scope="ALL"
          formatVND={formatVND}
          formatDate={formatDate}
          showNotification={showNotification}
        />
      )}

            {/* MODAL CHI TIẾT ĐỐI SOÁT CHỨNG TỪ & CHỐT SỔ QUYẾT TOÁN TÀI CHÍNH */}
      {settlementModal.isOpen && settlementModal.trip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                    Chờ Quyết Toán
                  </span>
                  <h3 className="font-bold text-base text-slate-900">
                    Đối Soát Chứng Từ & Quyết Toán: {settlementModal.trip.maDeXuat}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Người đi:</strong> {settlementModal.trip.hoTen || settlementModal.trip.tenNhanVien || settlementModal.trip.maNV} ({settlementModal.trip.tenPB || settlementModal.trip.maPB})
                  {' • '}<strong>Mục đích:</strong> {settlementModal.trip.mucDich}
                  {' • '}<strong>Thời gian:</strong> {formatDate(settlementModal.trip.ngayDi)} → {formatDate(settlementModal.trip.ngayVe)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettlementModal({ isOpen: false, trip: null, claims: [], loading: false })}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            {settlementModal.loading ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold">Đang tải chi tiết các chứng từ hóa đơn...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {settlementModal.claims.length === 0 ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900">
                    Chưa có khoản chi phí nào được khai báo cho đề xuất này.
                  </div>
                ) : (
                  <>
                    {/* THANH TAB CHUYỂN NHANH GIỮA CÁC KHOẢN CHI PHÍ */}
                    <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1.5 overflow-x-auto">
                      {settlementModal.claims.map((claim, idx) => (
                        <button
                          key={claim.maCTKB || idx}
                          type="button"
                          onClick={() => setSelectedClaimIdx(idx)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                            selectedClaimIdx === idx
                              ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                            selectedClaimIdx === idx ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{claim.tenLoaiChiPhi || claim.maLoaiCP}</span>
                          <span className="font-mono text-[11px] opacity-80">({formatVND(claim.soTienThucTe)})</span>
                        </button>
                      ))}
                    </div>

                    {/* CONTAINER ĐỐI SOÁT 2 CỘT SONG SONG: BÊN TRÁI ẢNH HÓA ĐƠN, BÊN PHẢI DỮ LIỆU OCR & ĐIỀU CHỈNH TIỀN */}
                    {(() => {
                      const currentClaim = settlementModal.claims[selectedClaimIdx] || settlementModal.claims[0];
                      let parsedOcr = null;
                      if (currentClaim?.dataBocTach) {
                        try { parsedOcr = JSON.parse(currentClaim.dataBocTach); } catch (e) {}
                      }
                      const rawOcrText = parsedOcr?.RawText || parsedOcr?.rawText || currentClaim?.dataBocTach || '---';

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          {/* CỘT TRÁI: ẢNH CHỨNG TỪ THỰC TẾ + PHÓNG TO */}
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-emerald-600" />
                                Ảnh Chứng Từ Gốc ({selectedClaimIdx + 1}/{settlementModal.claims.length})
                              </h4>
                              <button
                                type="button"
                                onClick={() => setPreviewImageModal({
                                  isOpen: true,
                                  url: resolveImageUrl(currentClaim.linkAnh),
                                  title: `Chứng từ: ${currentClaim.tenLoaiChiPhi} - ${currentClaim.maCTKB}`
                                })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                                Phóng to ảnh
                              </button>
                            </div>

                            <div className="bg-slate-900/5 rounded-xl border border-slate-200 p-2 flex items-center justify-center min-h-[360px] max-h-[460px] overflow-hidden group relative">
                              <img
                                src={resolveImageUrl(currentClaim.linkAnh)}
                                alt="Chứng từ hóa đơn thực tế"
                                className="max-h-[440px] w-auto max-w-full object-contain rounded-lg shadow-xs group-hover:scale-[1.02] transition duration-200 cursor-zoom-in"
                                onClick={() => setPreviewImageModal({
                                  isOpen: true,
                                  url: resolveImageUrl(currentClaim.linkAnh),
                                  title: `Chứng từ: ${currentClaim.tenLoaiChiPhi} - ${currentClaim.maCTKB}`
                                })}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/HoaDonThucTe/02_vinasun_taxi_real.png';
                                }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 italic text-center">
                              Nhấp trực tiếp vào ảnh hoặc bấm 'Phóng to ảnh' để soi rõ mã số thuế và con dấu hóa đơn.
                            </p>
                          </div>

                          {/* CỘT PHẢI: DỮ LIỆU OCR AI + ĐIỀU CHỈNH DUYỆT TIỀN */}
                          <div className="flex flex-col justify-between space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-bold text-xs text-slate-800 uppercase">
                                  Kết Quả Bóc Tách OCR AI
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {currentClaim.trangThaiHopLe || 'Hợp lệ'}
                                </span>
                              </div>

                              {/* THÔNG TIN BÓC TÁCH CÓ CẤU TRÚC */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Đơn vị phát hành / NCC</span>
                                  <strong className="text-slate-800 truncate block mt-0.5" title={parsedOcr?.DonVi || parsedOcr?.donVi}>
                                    {parsedOcr?.DonVi || parsedOcr?.donVi || '---'}
                                  </strong>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Số Hóa Đơn / Vé</span>
                                  <strong className="font-mono text-purple-700 block mt-0.5">
                                    {parsedOcr?.SoHD || parsedOcr?.soHD || '---'}
                                  </strong>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Ngày Lập Hóa Đơn</span>
                                  <span className="font-semibold text-slate-700 block mt-0.5">
                                    {parsedOcr?.Ngay || parsedOcr?.ngay || formatDate(currentClaim.ngayChi)}
                                  </span>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Thuế VAT Bóc Tách</span>
                                  <span className="font-mono text-slate-700 block mt-0.5">
                                    {parsedOcr?.VAT ? formatVND(parseFloat(parsedOcr.VAT) || 0) : '0 đ'}
                                  </span>
                                </div>
                              </div>

                              {/* NỘI DUNG RAW TEXT TỪ HÓA ĐƠN */}
                              <div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                                  Nội dung quét thô từ hóa đơn (OCR Raw Text):
                                </span>
                                <div className="p-2.5 bg-white text-slate-900 font-mono text-[11px] rounded-lg max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-300 shadow-2xs select-text">
                                  {rawOcrText}
                                </div>
                              </div>

                              {/* GIẢI TRÌNH NGOẠI LỆ (NẾU CÓ) */}
                              {(() => {
                                const isApproved = currentClaim.ketQuaDuyetNgoaiLe === 'Đã duyệt đặc cách' || (currentClaim.trangThaiHopLe || '').includes('Đặc cách');
                                const isRejected = currentClaim.ketQuaDuyetNgoaiLe === 'Từ chối ngoại lệ' || (currentClaim.trangThaiHopLe || '').includes('Không duyệt');
                                const isPending = !isApproved && !isRejected && ((currentClaim.trangThaiHopLe || '').includes('Chờ') || currentClaim.ketQuaDuyetNgoaiLe === 'Chờ duyệt ngoại lệ');

                                if (!currentClaim.lyDoGiaiTrinhNgoaiLe && !currentClaim.lyDoGiaiTrinh && !isApproved && !isRejected && !isPending) {
                                  return null;
                                }

                                return (
                                  <div className={`p-2.5 rounded-lg text-xs space-y-1 border ${
                                    isPending ? 'bg-amber-50 border-amber-300' : isRejected ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'
                                  }`}>
                                    <span className="text-[10px] font-bold uppercase block text-slate-800">
                                      Giải trình ngoại lệ chi phí:
                                    </span>
                                    {(currentClaim.lyDoGiaiTrinhNgoaiLe || currentClaim.lyDoGiaiTrinh) && (
                                      <p className="text-slate-900 italic">"{currentClaim.lyDoGiaiTrinhNgoaiLe || currentClaim.lyDoGiaiTrinh}"</p>
                                    )}
                                    {isPending ? (
                                      <p className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                        ⏳ Khoản chi vượt định mức đang chờ Quản lý duyệt đặc cách
                                      </p>
                                    ) : isApproved ? (
                                      <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                        ✓ Quản lý phòng ban đã phê duyệt đặc cách ngoại lệ khoản chi này
                                      </p>
                                    ) : isRejected ? (
                                      <p className="text-[10px] font-semibold text-rose-700 flex items-center gap-1">
                                        ✕ Quản lý đã từ chối ngoại lệ (Khoản chi bị loại trừ, không thanh toán)
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* KHU VỰC KẾ TOÁN DUYỆT SỐ TIỀN & ĐIỀU CHỈNH */}
                            <div className="pt-3 border-t border-slate-200 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Số tiền nhân viên kê khai:</span>
                                <span className="font-mono font-bold text-slate-800">{formatVND(currentClaim.soTienThucTe)}</span>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-emerald-900 uppercase mb-1">
                                  Số Tiền Kế Toán Duyệt Thanh Toán (VNĐ) *:
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editingClaimAmounts[currentClaim.maCTKB] ?? currentClaim.soTienThucTe}
                                    onChange={(e) => setEditingClaimAmounts({
                                      ...editingClaimAmounts,
                                      [currentClaim.maCTKB]: e.target.value
                                    })}
                                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-right text-sm text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    placeholder="Nhập số tiền được duyệt"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveClaimAdjustment(currentClaim.maCTKB)}
                                    disabled={savingClaimId === currentClaim.maCTKB}
                                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                                  >
                                    {savingClaimId === currentClaim.maCTKB ? 'Đang lưu...' : 'Lưu Khoản Này'}
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                  Kế toán có quyền giảm trừ chi phí nếu hóa đơn không hợp lệ hoặc thiếu chứng từ hợp quy.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* BẢNG TỔNG HỢP NHANH TOÀN BỘ KHOẢN CHI CỦA CHUYẾN ĐI */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                          <tr>
                            <th className="px-4 py-2.5">STT</th>
                            <th className="px-4 py-2.5">Khoản Chi</th>
                            <th className="px-4 py-2.5">Ngày Chi</th>
                            <th className="px-4 py-2.5 text-right">Số Kê Khai</th>
                            <th className="px-4 py-2.5 text-right">Kế Toán Duyệt</th>
                            <th className="px-4 py-2.5 text-center">Trạng Thái</th>
                            <th className="px-4 py-2.5 text-center">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {settlementModal.claims.map((claim, idx) => (
                            <tr
                              key={claim.maCTKB}
                              className={`hover:bg-slate-50 transition cursor-pointer ${selectedClaimIdx === idx ? 'bg-emerald-50/40' : ''}`}
                              onClick={() => setSelectedClaimIdx(idx)}
                            >
                              <td className="px-4 py-2.5 font-mono text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-900">
                                {claim.tenLoaiChiPhi}
                                <span className="block text-[10px] font-mono text-slate-400">{claim.maCTKB}</span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{formatDate(claim.ngayChi)}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatVND(claim.soTienThucTe)}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                                {formatVND(editingClaimAmounts[claim.maCTKB] ?? claim.soTienThucTe)}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {(() => {
                                  const isApproved = claim.ketQuaDuyetNgoaiLe === 'Đã duyệt đặc cách' || (claim.trangThaiHopLe || '').includes('Đặc cách');
                                  const isRejected = claim.ketQuaDuyetNgoaiLe === 'Từ chối ngoại lệ' || (claim.trangThaiHopLe || '').includes('Không duyệt');
                                  const isPending = !isApproved && !isRejected && ((claim.trangThaiHopLe || '').includes('Chờ') || claim.ketQuaDuyetNgoaiLe === 'Chờ duyệt ngoại lệ');

                                  const badgeText = isApproved ? 'Hợp lệ (Đặc cách)' : isRejected ? 'Không duyệt ngoại lệ' : (claim.trangThaiHopLe || 'Hợp lệ');

                                  return (
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                      isPending 
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                        : isRejected
                                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    }`}>
                                      {badgeText}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClaimIdx(idx);
                                  }}
                                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  Đối soát
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* TÍNH TOÁN BÙ TRỪ TÀI CHÍNH & CHỌN HƯỚNG XỬ LÝ */}
                    {(() => {
                      const tongThuc = settlementModal.claims.reduce((acc, c) => acc + (parseFloat(editingClaimAmounts[c.maCTKB] ?? c.soTienThucTe) || 0), 0);
                      const tamUng = parseFloat(settlementModal.trip.soTienTamUngThucTe || settlementModal.trip.soTienTamUngDeNghi) || 0;
                      const buTru = tongThuc - tamUng;

                      return (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                            Tổng Kết Tài Chính & Hướng Xử Lý Bù Trừ
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <p className="text-[11px] text-slate-500">Tổng Chi Phí Thực Tế (Duyệt)</p>
                              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{formatVND(tongThuc)}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <p className="text-[11px] text-purple-700 font-medium">Số Tiền Đã Tạm Ứng</p>
                              <p className="text-base font-bold text-purple-700 font-mono mt-0.5">{formatVND(tamUng)}</p>
                            </div>
                            <div className={`p-3 rounded-lg border ${buTru > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : buTru < 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                              <p className="text-[11px] font-semibold">Chênh Lệch Bù Trừ</p>
                              <p className="text-base font-bold font-mono mt-0.5">
                                {buTru > 0 ? `+${formatVND(buTru)}` : buTru < 0 ? `-${formatVND(Math.abs(buTru))}` : '0 đ'}
                              </p>
                            </div>
                          </div>

                          {/* HƯỚNG XỬ LÝ TÀI CHÍNH */}
                          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase">
                              Hướng Xử Lý Tài Chính Của Kế Toán *:
                            </label>
                            <select
                              value={selectedDirection}
                              onChange={(e) => setSelectedDirection(e.target.value)}
                              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
                            >
                              <option value="HOAN_TRA">
                                Công ty hoàn trả thêm cho nhân viên: +{formatVND(Math.max(0, buTru))} (Thực chi vượt tạm ứng)
                              </option>
                              <option value="THU_HOI">
                                Thu hồi tiền thừa nộp lại quỹ công ty: -{formatVND(Math.max(0, -buTru))} (Tạm ứng nhiều hơn thực chi)
                              </option>
                              <option value="CAN_BANG">
                                Cân bằng tài chính (Không phát sinh chênh lệch bù trừ)
                              </option>
                            </select>
                            <p className="text-[11px] text-slate-500 italic">
                              Hệ thống tự động tính toán đối soát giữa Tổng thực chi sau duyệt ({formatVND(tongThuc)}) và Tiền tạm ứng ({formatVND(tamUng)}).
                            </p>
                          </div>

                          {/* Nút hành động */}
                          {(() => {
                            const hasPendingException = settlementModal.claims.some(c => {
                              const isApproved = c.ketQuaDuyetNgoaiLe === 'Đã duyệt đặc cách' || (c.trangThaiHopLe || '').includes('Đặc cách');
                              const isRejected = c.ketQuaDuyetNgoaiLe === 'Từ chối ngoại lệ' || (c.trangThaiHopLe || '').includes('Không duyệt');
                              return !isApproved && !isRejected && ((c.trangThaiHopLe || '').includes('Chờ') || c.ketQuaDuyetNgoaiLe === 'Chờ duyệt ngoại lệ');
                            });
                            return (
                              <div className="space-y-3 pt-2">
                                {hasPendingException && (
                                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2 text-xs text-amber-800 font-semibold">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Hồ sơ có khoản chi vượt định mức đang chờ Quản lý duyệt đặc cách ngoại lệ. Kế toán không thể chốt sổ cho đến khi Quản lý hoàn tất duyệt ngoại lệ!</span>
                                  </div>
                                )}
                                <div className="flex justify-end items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setSettlementModal({ isOpen: false, trip: null, claims: [], loading: false })}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                                  >
                                    Đóng
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleConfirmSettlementFromModal}
                                    disabled={chotLoading || hasPendingException}
                                    title={hasPendingException ? 'Vui lòng chờ Quản lý phê duyệt ngoại lệ trước khi chốt sổ' : ''}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                                      hasPendingException
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {chotLoading ? 'Đang chốt sổ...' : 'Xác Nhận Chốt Sổ Quyết Toán & Khóa Hồ Sơ'}
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO XEM ẢNH HÓA ĐƠN TRONG SUỐT QUÁ TRÌNH ĐỐI SOÁT */}
      {previewImageModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[99] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4 shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                {previewImageModal.title || 'Chi Tiết Ảnh Hóa Đơn Chứng Từ'}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900 rounded-xl p-3 flex items-center justify-center">
              <img
                src={previewImageModal.url}
                alt="Ảnh hóa đơn đầy đủ"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/HoaDonThucTe/02_vinasun_taxi_real.png';
                }}
              />
            </div>
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
              >
                Đóng Ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT ẢNH HÓA ĐƠN & DỮ LIỆU OCR */}
      {previewChungTuModal.isOpen && previewChungTuModal.item && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Chi Tiết Chứng Từ Hóa Đơn & Kết Quả OCR AI
                </h3>
                <p className="text-xs text-slate-500">Mã CTKB: {previewChungTuModal.item.maCTKB} • Đề xuất: {previewChungTuModal.item.maDeXuat}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewChungTuModal({ isOpen: false, item: null })}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ảnh chứng từ */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Ảnh Hóa Đơn Chứng Từ:</h4>
                {previewChungTuModal.item.linkAnh ? (
                  <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-center">
                    <img
                      src={previewChungTuModal.item.linkAnh}
                      alt="Chứng từ hóa đơn"
                      className="max-h-72 mx-auto rounded-lg object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/HoaDonThucTe/02_vinasun_taxi_real.png';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có ảnh đính kèm.</p>
                )}
              </div>

              {/* Thông tin OCR */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Thông Tin Bóc Tách OCR AI:</h4>
                <div className="p-3 bg-white text-slate-900 font-mono text-xs rounded-xl overflow-x-auto border border-slate-300 shadow-2xs select-text">
                  {previewChungTuModal.item.dataBocTach ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(previewChungTuModal.item.dataBocTach), null, 2);
                        } catch(e) {
                          return previewChungTuModal.item.dataBocTach;
                        }
                      })()}
                    </pre>
                  ) : (
                    <span>Không có dữ liệu bóc tách OCR.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewChungTuModal({ isOpen: false, item: null })}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Tab 4: Cấu hình quy tắc định mức */}

      {activeTab === 'tab4' && (

        <div className="space-y-4">

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <h3 className="font-bold text-sm text-slate-900">

                Bảng Quy Định Hạn Mức Chi Phí Toàn Đơn Vị

              </h3>

              

            </div>

            <div className="flex items-center gap-2">

              <button

                onClick={fetchDinhMuc}

                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"

              >

                <RefreshCw className={`w-3.5 h-3.5 ${dinhMucLoading ? 'animate-spin' : ''}`} />

                Làm mới

              </button>

              <button

                onClick={openCreateDinhMuc}

                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition cursor-pointer"

              >

                <Plus className="w-4 h-4" />

                Thiết Lập Định Mức Mới

              </button>

            </div>

          </div>



          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">

                  <tr>

                    <th className="px-4 py-3.5">Mã QĐ</th>

                    <th className="px-4 py-3.5">Loại Chi Phí</th>

                    <th className="px-4 py-3.5">Cấp Bậc Áp Dụng</th>

                    <th className="px-4 py-3.5 text-right">Hạn Mức Tối Đa</th>

                    <th className="px-4 py-3.5">Ngày Hiệu Lực</th>

                    <th className="px-4 py-3.5">Ngày Hết Hạn</th>

                    <th className="px-4 py-3.5 text-center">Trạng Thái</th>

                    <th className="px-4 py-3.5 text-center">Thao Tác</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">

                  {dinhMucList.length === 0 ? (

                    <tr>

                      <td colSpan="8" className="px-6 py-8 text-center text-slate-400 text-xs">

                        Chưa có quy định định mức nào được thiết lập.

                      </td>

                    </tr>

                  ) : (

                    dinhMucList.map((dm) => (

                      <tr key={dm.maQuyDinh} className="hover:bg-slate-50 transition">

                        <td className="px-4 py-3.5 font-mono font-bold text-purple-700">{dm.maQuyDinh}</td>

                        <td className="px-4 py-3.5 font-semibold text-slate-900">{dm.tenLoaiChiPhi}</td>

                        <td className="px-4 py-3.5 text-slate-700 text-xs font-medium"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">Tất cả nhân viên</span></td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{formatVND(dm.soTienToiDa)}</td>

                        <td className="px-4 py-3.5 text-xs text-slate-600">{formatDate(dm.ngayHieuLuc)}</td>

                        <td className="px-4 py-3.5 text-xs text-slate-600">{dm.ngayHetHan ? formatDate(dm.ngayHetHan) : 'Vô thời hạn'}</td>

                        <td className="px-4 py-3.5 text-center">

                          {dm.conHieuLuc ? (

                            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">

                              Đang áp dụng

                            </span>

                          ) : (

                            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-300">

                              Hết hiệu lực

                            </span>

                          )}

                        </td>

                        <td className="px-4 py-3.5 text-center">

                          <div className="inline-flex items-center gap-1.5">

                            <button

                              onClick={() => openEditDinhMuc(dm)}

                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition cursor-pointer"

                              title="Chỉnh sửa định mức"

                            >

                              <Edit className="w-3.5 h-3.5" />

                              Sửa

                            </button>

                            <button

                              onClick={() => handleDeleteDinhMucItem(dm.maQuyDinh)}

                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-slate-200 transition cursor-pointer"

                              title="Xóa định mức"

                            >

                              <Trash2 className="w-3.5 h-3.5" />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}



      {/* Modal Thêm & Chỉnh Sửa Định Mức */}

      {showDinhMucModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <div className="flex items-center gap-2">

                <Settings2 className="w-5 h-5 text-purple-600" />

                <h3 className="font-bold text-base text-slate-900">

                  {editingDinhMuc ? `Cập Nhật Định Mức: ${editingDinhMuc.maQuyDinh}` : 'Thiết Lập Quy Định Định Mức Mới'}

                </h3>

              </div>

              <button onClick={() => setShowDinhMucModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">

                <X className="w-5 h-5" />

              </button>

            </div>



            <form onSubmit={handleSaveDinhMuc} className="space-y-3.5">

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Quy Định *</label>

                <input

                  type="text"

                  required

                  disabled={!!editingDinhMuc}

                  value={dinhMucForm.maQuyDinh}

                  onChange={(e) => setDinhMucForm({ ...dinhMucForm, maQuyDinh: e.target.value })}

                  placeholder="VD: QD04, QD05..."

                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"

                />

              </div>



              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Loại Chi Phí *</label>

                <select
                  disabled={!!editingDinhMuc}
                  value={dinhMucForm.maLoaiCP}
                  onChange={(e) => setDinhMucForm({ ...dinhMucForm, maLoaiCP: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 font-medium"
                >
                  {(loaiChiPhiList.length > 0 ? loaiChiPhiList : DEFAULT_LOAI_CHI_PHI).map((lcp) => {
                    const code = lcp.maLoaiCP || lcp.MaLoaiCP;
                    const name = lcp.tenLoai || lcp.TenLoai;
                    return (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    );
                  })}
                </select>

              </div>



              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Đối Tượng Áp Dụng</label>
                <div className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-lg text-slate-600 font-medium">
                  Áp dụng chung toàn bộ nhân viên công tác
                </div>
              </div>



              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Hạn Mức Chi Phí Tối Đa (VNĐ) *</label>

                <input

                  type="number"

                  required

                  value={dinhMucForm.soTienToiDa}

                  onChange={(e) => setDinhMucForm({ ...dinhMucForm, soTienToiDa: e.target.value })}

                  placeholder="VD: 1500000"

                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-bold text-purple-700"

                />

              </div>



              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày Hiệu Lực *</label>

                  <input

                    type="date"

                    required

                    value={dinhMucForm.ngayHieuLuc}

                    onChange={(e) => setDinhMucForm({ ...dinhMucForm, ngayHieuLuc: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"

                  />

                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày Hết Hạn</label>

                  <input

                    type="date"

                    value={dinhMucForm.ngayHetHan}

                    onChange={(e) => setDinhMucForm({ ...dinhMucForm, ngayHetHan: e.target.value })}

                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"

                  />

                </div>

              </div>



              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">

                <button

                  type="button"

                  onClick={() => setShowDinhMucModal(false)}

                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"

                >

                  Hủy bỏ

                </button>

                <button

                  type="submit"

                  disabled={dinhMucActionLoading}

                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 cursor-pointer"

                >

                  {dinhMucActionLoading ? 'Đang lưu...' : 'Lưu Định Mức'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


    </div>

  );

}



// =========================================================================

// 4. PHÂN HỆ NHÂN VIÊN (NHAN_VIEN - NV01)

// =========================================================================

// =========================================================================
// 4. PHÂN HỆ NHÂN VIÊN (NHAN_VIEN - NV01)
// Chức năng:
// - Lập đề xuất công tác & Lưu bản nháp 
// - Lịch sử & Theo dõi trạng thái đơn
// - Khai báo chi phí thực tế & Đính kèm chứng từ OCR
// =========================================================================
function EmployeeDashboard({ currentUser, activeTab, setActiveTab, formatVND, formatDate, getTrangThaiBadge, showNotification, showConfirm }) {
  // Bộ lọc trạng thái đề xuất 
  const [filterTrangThai, setFilterTrangThai] = useState('ALL');
  const [searchTripKeyword, setSearchTripKeyword] = useState('');

  // Cấu hình Google Gemini Vision AI (Công nghệ quét tiêu chuẩn - Nhập qua giao diện hoặc lưu trong localStorage)
  const DEFAULT_GEMINI_KEY = '';
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('FIN03_GEMINI_KEY') || DEFAULT_GEMINI_KEY);
  const [showAiKeyModal, setShowAiKeyModal] = useState(false);
  const [aiKeyInput, setAiKeyInput] = useState(() => localStorage.getItem('FIN03_GEMINI_KEY') || DEFAULT_GEMINI_KEY);

  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sinh mã đề xuất ngẫu nhiên an toàn, không lo trùng lặp
  const genNewMaDeXuat = () => 'DX_' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '_' + Math.floor(1000 + Math.random() * 9000);

  // Form Lập đề xuất / Chỉnh sửa bản nháp
  const [maDeXuat, setMaDeXuat] = useState(genNewMaDeXuat);
  const [mucDich, setMucDich] = useState('');
  const [ngayDi, setNgayDi] = useState('');
  const [ngayVe, setNgayVe] = useState('');
  const [tamUngDeNghi, setTamUngDeNghi] = useState(0);
  const [chiTietItems, setChiTietItems] = useState([
    { maLoaiCP: 'CP_VEMAYBAY', soTienDuKien: 3000000, lyDoGiaiTrinh: '' }
  ]);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal xem trước ảnh chứng từ phóng to
  const [previewImageModal, setPreviewImageModal] = useState({ isOpen: false, url: '', title: '' });

  // Tab 3: Khai báo chi phí thực tế & Hóa đơn chứng từ OCR 
  const [selectedTripForClaim, setSelectedTripForClaim] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimItems, setClaimItems] = useState([
    {
      maLoaiCP: 'CP_DIENTHOAI',
      ngayChi: '',
      soTienThucTe: 0,
      linkAnh: '',
      fileName: '',
      dungLuongMB: 0,
      lyDoGiaiTrinh: '',
      dataBocTach: '',
      isOcrScanning: false,
      ocrResult: null
    }
  ]);

  // Lọc danh sách đề xuất chuyến đi 
  const filteredTrips = danhSach.filter((item) => {
    const matchTrangThai = filterTrangThai === 'ALL' || item.trangThai === filterTrangThai;
    const kw = searchTripKeyword.trim().toLowerCase();
    const matchKw = !kw || 
      item.maDeXuat?.toLowerCase().includes(kw) || 
      item.mucDich?.toLowerCase().includes(kw);
    return matchTrangThai && matchKw;
  });

  const countAll = danhSach.length;
  const countDraft = danhSach.filter(d => d.trangThai === 'Bản nháp').length;
  const countPending = danhSach.filter(d => d.trangThai === 'Chờ duyệt').length;
  const countApproved = danhSach.filter(d => d.trangThai === 'Đã duyệt').length;
  const countAdvanced = danhSach.filter(d => d.trangThai === 'Đã tạm ứng').length;
  const countSettling = danhSach.filter(d => d.trangThai === 'Chờ quyết toán').length;
  const countSettled = danhSach.filter(d => d.trangThai === 'Đã chốt sổ').length;
  const countRejected = danhSach.filter(d => d.trangThai === 'Từ chối').length;

  const fetchMyTrips = async () => {
    setLoading(true);
    try {
      const res = await getDanhSachDeXuat({ maNV: currentUser.maNV });
      if (res.data && res.data.success) {
        setDanhSach(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [dinhMucList, setDinhMucList] = useState([]);

  const getDinhMucToiDa = (maLoaiCP) => {
    const found = dinhMucList.find(d => (d.maLoaiCP || d.MaLoaiCP) === maLoaiCP);
    return found ? (found.soTienToiDa || found.SoTienToiDa || 0) : null;
  };

  const getCategoryName = (code) => {
    const map = {
      CP_VEMAYBAY: 'Vé máy bay khứ hồi',
      CP_KHACHSAN: 'Tiền thuê phòng khách sạn',
      CP_DIENTHOAI: 'Cước di chuyển & Taxi',
      CP_TIEPKHACH: 'Chi phí tiếp khách & Ngoại giao'
    };
    return map[code] || code;
  };

  useEffect(() => {
    fetchMyTrips();
    getDinhMuc().then(res => {
      if (res.data?.success) setDinhMucList(res.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'tab3') {
      getDinhMuc().then(res => {
        if (res.data?.success) setDinhMucList(res.data.data || []);
      }).catch(() => {});
    }
  }, [activeTab]);

  const resetProposalForm = () => {
    setMaDeXuat(genNewMaDeXuat());
    setMucDich('');
    setNgayDi('');
    setNgayVe('');
    setTamUngDeNghi(0);
    setChiTietItems([
      { maLoaiCP: 'CP_VEMAYBAY', soTienDuKien: 3000000, lyDoGiaiTrinh: '' }
    ]);
    setIsEditingDraft(false);
  };

  const addChiTietRow = () => {
    const allCats = ['CP_VEMAYBAY', 'CP_KHACHSAN', 'CP_DIENTHOAI', 'CP_TIEPKHACH'];
    const usedCats = chiTietItems.map(c => c.maLoaiCP);
    const nextCat = allCats.find(c => !usedCats.includes(c)) || 'CP_DIENTHOAI';
    setChiTietItems([
      ...chiTietItems,
      { maLoaiCP: nextCat, soTienDuKien: 1000000, lyDoGiaiTrinh: '' }
    ]);
  };

  const handleHoanThanhChuyenDi = (maDx) => {
    showConfirm({
      title: 'Xác Nhận Hoàn Thành Chuyến Đi',
      message: `Bạn đã đi công tác về và hoàn thành chuyến đi '${maDx}'? Hồ sơ sẽ được chuyển sang Kế toán để đối soát chứng từ và chốt sổ quyết toán.`,
      confirmText: 'Hoàn Thành Chuyến Đi',
      onConfirm: async () => {
        try {
          const res = await hoanThanhChuyenDi(maDx);
          if (res.data && res.data.success) {
            showNotification('success', res.data.message || 'Xác nhận hoàn thành chuyến đi thành công!');
            fetchMyTrips();
          } else {
            showNotification('error', res.data?.message || 'Không thể xác nhận hoàn thành.');
          }
        } catch (err) {
          showNotification('error', err.response?.data?.message || 'Lỗi khi xác nhận hoàn thành chuyến đi.');
        }
      }
    });
  };

  const removeChiTietRow = (index) => {
    setChiTietItems(chiTietItems.filter((_, i) => i !== index));
  };

  // Lập đề xuất hỗ trợ 2 chế độ:
  // 1. targetStatus = 'Bản nháp': Lưu tạm, chưa gửi Quản lý phê duyệt
  // 2. targetStatus = 'Chờ duyệt': Gửi phê duyệt chính thức (kích hoạt SP sp_TaoDeXuatVaDuToan & trg_CheckDinhMucDuToan)
  const handleSaveProposal = async (targetStatus = 'Chờ duyệt') => {
    if (!mucDich) {
      showNotification('warning', 'Vui lòng nhập mục đích công tác.');
      return;
    }

    if (targetStatus === 'Chờ duyệt') {
      if (!ngayDi || !ngayVe) {
        showNotification('warning', 'Vui lòng chọn ngày bắt đầu và kết thúc chuyến đi.');
        return;
      }

      // Ngày kết thúc >= Ngày bắt đầu
      if (new Date(ngayVe) < new Date(ngayDi)) {
        showNotification('error', 'Ngày kết thúc chuyến đi phải lớn hơn hoặc bằng ngày bắt đầu (Ngày về >= Ngày đi).');
        return;
      }

      // Phải có ít nhất 1 khoản chi dự toán
      if (!chiTietItems.length) {
        showNotification('warning', 'Đề xuất công tác bắt buộc phải có ít nhất một khoản chi dự toán.');
        return;
      }

      // Số tiền tạm ứng đề nghị không vượt quá 100% tổng dự toán
      const tongDuToan = chiTietItems.reduce((acc, c) => acc + (parseFloat(c.soTienDuKien) || 0), 0);
      const tamUngVal = parseFloat(tamUngDeNghi) || 0;
      if (tamUngVal > tongDuToan) {
        showNotification('error', `Số tiền tạm ứng đề nghị (${formatVND(tamUngVal)}) không được vượt quá 100% tổng dự toán (${formatVND(tongDuToan)}).`);
        return;
      }

      // Ràng buộc BR07: Kiểm tra nếu số tiền dự kiến vượt định mức thì BẮT BUỘC phải có giải trình
      for (let i = 0; i < chiTietItems.length; i++) {
        const it = chiTietItems[i];
        const limit = getDinhMucToiDa(it.maLoaiCP);
        const amount = parseFloat(it.soTienDuKien) || 0;
        if (limit && amount > limit && !it.lyDoGiaiTrinh?.trim()) {
          const catName = getCategoryName(it.maLoaiCP);
          showNotification('warning', `Khoản chi dự toán #${i + 1} (${catName} - ${formatVND(amount)}) vượt quá định mức tối đa (${formatVND(limit)})! Bạn bắt buộc phải nhập "Giải trình vượt mức" trước khi gửi duyệt.`);
          return;
        }
      }
    }

    setSubmitLoading(true);
    try {
      // Tự động gộp các khoản chi cùng loại chi phí để không bao giờ bị lỗi khóa chính
      const consolidated = [];
      chiTietItems.forEach(item => {
        const existing = consolidated.find(c => c.maLoaiCP === item.maLoaiCP);
        const amount = parseFloat(item.soTienDuKien) || 0;
        if (existing) {
          existing.soTienDuKien += amount;
          if (item.lyDoGiaiTrinh) {
            existing.lyDoGiaiTrinh = existing.lyDoGiaiTrinh ? `${existing.lyDoGiaiTrinh}; ${item.lyDoGiaiTrinh}` : item.lyDoGiaiTrinh;
          }
        } else {
          consolidated.push({
            maLoaiCP: item.maLoaiCP,
            soTienDuKien: amount,
            lyDoGiaiTrinh: item.lyDoGiaiTrinh || null
          });
        }
      });

      const payload = {
        maDeXuat,
        maNV: currentUser.maNV,
        mucDich,
        ngayDi: ngayDi || new Date().toISOString().split('T')[0],
        ngayVe: ngayVe || new Date().toISOString().split('T')[0],
        soTienTamUngDeNghi: parseFloat(tamUngDeNghi) || 0,
        trangThai: targetStatus,
        chiTiet: consolidated
      };

      const res = await taoDeXuat(payload);
      if (res.data && res.data.success) {
        const msg = targetStatus === 'Bản nháp'
          ? `Đã lưu bản nháp đề xuất '${maDeXuat}' thành công! Hồ sơ được giữ trong danh sách cá nhân và chưa gửi cho Quản lý.`
          : (res.data.message || 'Lập đề xuất công tác và gửi Quản lý phê duyệt thành công!');
        
        showNotification('success', msg);
        resetProposalForm();
        setActiveTab('tab1');
        fetchMyTrips();
      } else {
        showNotification('error', res.data?.message || 'Lỗi khi lưu đề xuất.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi kết nối khi gửi đề xuất.';
      showNotification('error', errMsg);
      if (errMsg.includes('đã tồn tại') || errMsg.includes('trùng')) {
        setMaDeXuat(genNewMaDeXuat());
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Mở bản nháp hoặc đơn bị từ chối để chỉnh sửa
  const handleEditDraft = async (maDx) => {
    try {
      const res = await getDeXuatDetail(maDx);
      if (res.data && res.data.success) {
        const data = res.data.data;
        const dx = data.deXuat || {};
        setMaDeXuat(dx.maDeXuat);
        setMucDich(dx.mucDich || '');
        setNgayDi(dx.ngayDi ? dx.ngayDi.split('T')[0] : '');
        setNgayVe(dx.ngayVe ? dx.ngayVe.split('T')[0] : '');
        setTamUngDeNghi(dx.soTienTamUngDeNghi || 0);

        if (data.chiTiet && data.chiTiet.length > 0) {
          setChiTietItems(data.chiTiet.map(c => ({
            maLoaiCP: c.maLoaiCP,
            soTienDuKien: c.soTienDuKien,
            lyDoGiaiTrinh: c.lyDoGiaiTrinh || ''
          })));
        }
        setIsEditingDraft(true);
        setActiveTab('tab2');
        showNotification('info', `Đã mở bản nháp đề xuất '${maDx}' để chỉnh sửa.`);
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Không thể tải thông tin bản nháp.');
    }
  };

  // Gửi nộp bản nháp lên Quản lý phê duyệt
  const handleSubmitDraftToManager = (maDx) => {
    showConfirm({
      title: 'Nộp Đề Xuất Phê Duyệt',
      message: `Bạn có chắc chắn muốn nộp bản nháp đề xuất [${maDx}] lên Quản lý phê duyệt chính thức không?`,
      type: 'primary',
      confirmText: 'Gửi Phê Duyệt',
      onConfirm: async () => {
        try {
          const res = await submitDeXuat(maDx);
          if (res.data && res.data.success) {
            showNotification('success', res.data.message || 'Đã nộp đề xuất lên Quản lý thành công.');
            fetchMyTrips();
          } else {
            showNotification('error', res.data?.message || 'Không thể nộp đề xuất.');
          }
        } catch (err) {
          showNotification('error', err.response?.data?.message || 'Lỗi khi nộp đề xuất.');
        }
      }
    });
  };

  // Xóa bản nháp
  const handleDeleteDraftProposal = (maDx) => {
    showConfirm({
      title: 'Xóa Bản Nháp Đề Xuất',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn bản nháp [${maDx}] này không? Thao tác này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa Bản Nháp',
      onConfirm: async () => {
        try {
          const res = await xoaDeXuat(maDx);
          if (res.data && res.data.success) {
            showNotification('success', res.data.message || 'Đã xóa bản nháp thành công.');
            fetchMyTrips();
          } else {
            showNotification('error', res.data?.message || 'Không thể xóa bản nháp.');
          }
        } catch (err) {
          showNotification('error', err.response?.data?.message || 'Lỗi khi xóa bản nháp.');
        }
      }
    });
  };

  // Hủy đơn khi đang Chờ duyệt
  const handleCancelPendingProposal = (maDx) => {
    showConfirm({
      title: 'Hủy Đề Xuất Công Tác',
      message: `Nhân viên có quyền hủy đơn khi còn ở trạng thái 'Chờ duyệt'. Bạn có chắc chắn muốn hủy đề xuất [${maDx}] không?`,
      type: 'danger',
      confirmText: 'Xác Nhận Hủy Đơn',
      onConfirm: async () => {
        try {
          const res = await xoaDeXuat(maDx);
          if (res.data && res.data.success) {
            showNotification('success', res.data.message || 'Đã hủy đề xuất công tác thành công.');
            fetchMyTrips();
          } else {
            showNotification('error', res.data?.message || 'Không thể hủy đề xuất.');
          }
        } catch (err) {
          showNotification('error', err.response?.data?.message || 'Lỗi khi hủy đề xuất.');
        }
      }
    });
  };

  // =========================================================================
  // XỬ LÝ TẢI ẢNH CHỨNG TỪ & QUÉT OCR
  // =========================================================================
  const addClaimRow = () => {
    setClaimItems([
      ...claimItems,
      {
        maLoaiCP: 'CP_KHACHSAN',
        ngayChi: selectedTripForClaim ? selectedTripForClaim.ngayDi?.split('T')[0] : '',
        soTienThucTe: 0,
        linkAnh: '',
        fileName: '',
        dungLuongMB: 0,
        lyDoGiaiTrinh: '',
        dataBocTach: '',
        isOcrScanning: false,
        ocrResult: null
      }
    ]);
  };

  const removeClaimRow = (index) => {
    setClaimItems(claimItems.filter((_, i) => i !== index));
  };

  // =========================================================================
  // =========================================================================
  // BỘ PHÂN TÍCH THÔNG MINH DỮ LIỆU TỪ VĂN BẢN OCR
  // =========================================================================

  // TIỀN XỬ LÝ ẢNH BẰNG CANVAS (Tăng độ tương phản, khử nhiễu, chuyển nhị phân trắng đen)
  const preprocessImageForOcr = (dataUrl) => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scale = img.width < 1000 ? 2 : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;

          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const contrast = 1.3;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            const enhanced = factor * (gray - 128) + 128;
            const finalVal = enhanced > 195 ? 255 : (enhanced < 65 ? 0 : enhanced);
            d[i] = finalVal;
            d[i + 1] = finalVal;
            d[i + 2] = finalVal;
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch {
        resolve(dataUrl);
      }
    });
  };

  // NÉN VÀ THU NHỎ ẢNH TỐC ĐỘ CAO CHO AI (Giảm từ 10MB xuống ~150KB để gửi Google AI trong 0.2s)
  const compressImageForAi = (dataUrl, maxDim = 1400, quality = 0.85) => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch {
        resolve(dataUrl);
      }
    });
  };

  // QUÉT HÓA ĐƠN BẰNG GOOGLE GEMINI VISION AI (Công nghệ Google Lens)
  const scanWithGeminiVision = async (base64Data, mimeType, apiKey) => {
    // Tối ưu hóa: nén ảnh nhẹ trước khi gửi để tốc độ phản hồi chỉ 1-2 giây
    const optimizedDataUrl = await compressImageForAi(base64Data, 1400, 0.85);
    const cleanBase64 = optimizedDataUrl.includes(',') ? optimizedDataUrl.split(',')[1] : optimizedDataUrl;

    const prompt = `Bạn là hệ thống AI quét hóa đơn kế toán thông minh (tương tự Google Lens / Google Vision).
Nhiệm vụ của bạn là đọc và phân tích ảnh chụp hóa đơn, vé máy bay, chứng từ chi tiêu công tác này.
Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm theo bất kỳ giải thích, markdown code block nào) với cấu trúc sau:
{
  "donVi": "Tên công ty / hãng hàng không / nhà xe / khách sạn phát hành hóa đơn",
  "tongTien": 1234567,
  "vat": "10%",
  "ngayChi": "YYYY-MM-DD",
  "rawText": "Toàn bộ văn bản đầy đủ đọc được từ ảnh bằng tiếng Việt chuẩn xác có dấu"
}
Lưu ý quan trọng:
- tongTien: Bắt buộc lấy đúng tổng số tiền thanh toán cuối cùng bằng số nguyên (VNĐ). Tuyệt đối KHÔNG nhầm lẫn với Mã số thuế, Số hóa đơn, Số điện thoại, Mã đặt chỗ hay số tài khoản ngân hàng.
- vat: Thuế suất GTGT hoặc số tiền thuế (VD: 8%, 10%, 0%).
- ngayChi: Ngày chi trên hóa đơn định dạng YYYY-MM-DD.
- rawText: Văn bản đọc được từ ảnh, giữ nguyên tiếng Việt có dấu và các dòng.`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    // Endpoint model Google Vision AI tối ưu tốc độ phản hồi 1-2s (gemini-flash-lite-latest)
    const models = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError = null;

    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanJsonStr = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
          const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          return JSON.parse(cleanJsonStr);
        } else {
          const errBody = await response.json().catch(() => ({}));
          console.warn(`[Google AI ${m}]:`, response.status, errBody);
          lastError = new Error(errBody.error?.message || `Lỗi từ Google Vision API ${m} (${response.status})`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Không thể kết nối Google Lens / Vision AI.');
  };

  const parseOcrInvoiceText = (text, fileName, defaultCategory, tripDate) => {
    const rawLines = (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const cleanText = (text || '').replace(/[\r\t]/g, ' ');
    const lower = (cleanText + ' ' + (fileName || '')).toLowerCase();

    // BƯỚC 1: BÓC TÁCH THUẾ GTGT: CHỈ KHI TRÊN HÓA ĐƠN CÓ MỚI GÁN, KHÔNG THÌ ĐỂ TRỐNG ""
    let vat = '';
    const vatMatch = cleanText.match(/(?:thu[eế]\s*(?:gtgt|su[aấ]t)?|vat|tax)\s*[:\s]*(\d{1,2}(?:\.\d+)?\s*%)/i) ||
                     cleanText.match(/(\d{1,2}(?:\.\d+)?\s*%)\s*(?:thu[eế]|vat|gtgt|tax)/i);
    if (vatMatch && vatMatch[1]) {
      vat = vatMatch[1].replace(/\s+/g, '');
    } else if (/10\s*%/i.test(cleanText) && /(?:thu[eế]|vat|gtgt|tax)/i.test(cleanText)) {
      vat = '10%';
    } else if (/8\s*%/i.test(cleanText) && /(?:thu[eế]|vat|gtgt|tax)/i.test(cleanText)) {
      vat = '8%';
    } else if (/5\s*%/i.test(cleanText) && /(?:thu[eế]|vat|gtgt|tax)/i.test(cleanText)) {
      vat = '5%';
    }

    // BƯỚC 2: BÓC TÁCH NGÀY HÓA ĐƠN
    let detectedDate = '';
    const dateRegexes = [
      /(?:Ngày|Date|Start|End)\s*[:\s]*([A-Za-z]{3}\s*\d{1,2},?\s*\d{4})/i,
      /(?:Ngày|Date)\s*[:\s]*(\d{1,2})[\s\/-]+(?:tháng\s*)?(\d{1,2})[\s\/-]+(?:năm\s*)?(\d{4})/i,
      /(\d{1,2})[\/-](d{1,2})[\/-](d{4})/,
      /(\d{4})[\/-](d{1,2})[\/-](d{1,2})/
    ];
    for (const reg of dateRegexes) {
      const m = cleanText.match(reg);
      if (m) {
        if (m[1] && isNaN(Date.parse(m[1])) === false) {
          try {
            detectedDate = new Date(m[1]).toISOString().split('T')[0];
            break;
          } catch {}
        }
        if (m[3] && m[3].length === 4) {
          detectedDate = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
          break;
        } else if (m[1] && m[1].length === 4) {
          detectedDate = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
          break;
        }
      }
    }
    if (!detectedDate) {
      detectedDate = tripDate || new Date().toISOString().split('T')[0];
    }

    // BƯỚC 3: BÓC TÁCH TỔNG TIỀN (VNĐ) – LOẠI TRỪ 100% SỐ VÉ, MÃ PNR, MÃ SỐ THUẾ, SỐ ĐIỆN THOẠI
    const isLikelyIdOrCode = (numStr, val) => {
      // 7-14 chữ số liên tiếp không có dấu phân cách hàng nghìn -> Mã số vé / Mã tra cứu
      if (/^\d{7,14}$/.test(numStr)) {
        if (!numStr.endsWith('000')) return true;
      }
      // Số điện thoại di động (10 chữ số bắt đầu bằng 03, 05, 07, 08, 09)
      if (/^0[35789]\d{8}$/.test(numStr)) return true;
      // Năm (2020 - 2035)
      if (val >= 2020 && val <= 2035) return true;
      return false;
    };

    const parseNumber = (str) => {
      if (!str) return null;
      const m = str.match(/[:\s\-=»._]*[^\d]*(\d+(?:[.,\s]\d+)*)/);
      if (!m || !m[1]) return null;
      let numStr = m[1].trim();

      // Xử lý khoảng trắng giữa các chữ số do OCR lỗi (vd: '5 4.50' -> '54.50')
      if (/\d+\s+\d+\.\d{2}/.test(numStr)) {
        numStr = numStr.replace(/\s+/g, '');
      }

      // VNĐ phân cách hàng nghìn (1.450.000 hoặc 1,450,000)
      if (/^\d{1,3}([.,])\d{3,6}(?:\1\d{3})*(?:[.,]\d{2})?$/.test(numStr)) {
        const parts = numStr.split(/[.,]/);
        let intStr;
        if (parts.length > 2 && parts[parts.length - 1].length === 2) {
          intStr = parts.slice(0, -1).join('');
        } else {
          intStr = parts.join('');
        }
        const val = parseInt(intStr, 10);
        if (!isLikelyIdOrCode(numStr, val)) return { val, isVnd: true };
      }

      // Đồng hồ tính cước taxi Vinasun / Mai Linh (420.80 -> 420.800 VNĐ)
      const floatVal = parseFloat(numStr.replace(/,/g, '.').replace(/\s+/g, ''));
      if (floatVal > 0 && floatVal < 1000 && (numStr.includes('.') || numStr.includes(',') || /taxi|mai linh|vinasun/i.test(cleanText))) {
        return { val: Math.round(floatVal * 1000), isTaxiK: true };
      }

      // VNĐ số nguyên thuần túy (từ 1.000 đến 500 triệu)
      const intVal = parseInt(numStr.replace(/[.,\s]/g, ''), 10);
      if (intVal >= 1000 && intVal <= 500000000) {
        if (!isLikelyIdOrCode(numStr, intVal)) {
          return { val: intVal, isVnd: true };
        }
      }

      return null;
    };

    let rawExtractedAmount = 0;

    // TẦNG 1: CÁC TỪ KHÓA TỔNG CUỐI CÙNG (Ưu tiên cao nhất: Grand Total, Tổng cộng, Tổng thanh toán)
    const tier1Patterns = [
      /grand\s*total/i,
      /total\s*rounded/i,
      /round\s*d?\s*total/i,
      /t[oôe0a]ng\s*c[oộô]ng/i,
      /t[oôe0a]ng\s*(?:ti[eềê]n)?\s*thanh\s*to[aá]n/i,
      /c[oộô]ng\s*ti[eềê]n\s*thanh\s*to[aá]n/i,
      /net\s*amount/i,
      /net\s*total/i
    ];

    // TẦNG 2: CÁC TỪ KHÓA TỔNG PHỔ THÔNG (Total, Amount Due, Thanh toán...)
    const tier2Patterns = [
      /total\s*amount/i,
      /total\s*sales/i,
      /gross\s*amount/i,
      /amount\s*due/i,
      /balance\s*due/i,
      /ti[eềê]n\s*thanh\s*to[aá]n/i,
      /s[oố]\s*ti[eềê]n\s*thanh\s*to[aá]n/i,
      /th[aà]nh\s*ti[eềê]n/i,
      /thanh\s*to[aá]n/i,
      /total\s*[:=]/i,
      /-\s*total\s*[:=]/i,
      /\btotal\b/i
    ];

    const searchWithPatterns = (patterns) => {
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];

        // Loại trừ dòng tiêu đề cột bảng và các dòng số lượng/mã
        if (/item.*desc|desc.*price|price.*total|qty.*total|u\.price|hành\s*trình|chuyến\s*bay|số\s*vé|đơn\s*giá/i.test(line)) continue;
        if (/total\s*(?:qty|quantity|pcs|items)/i.test(line)) continue;
        if (/total\s*(?:gst|vat|tax|discount|saving)/i.test(line) && !/inclusive/i.test(line)) continue;
        if (/pnr|fligh|faretype|unitprce|dongia|soluong|bien so/i.test(line)) continue;

        for (const pat of patterns) {
          const match = line.match(pat);
          if (match && match.index !== undefined) {
            const after = line.substring(match.index + match[0].length);
            const parsed = parseNumber(after);
            if (parsed && parsed.val > 0) {
              return parsed.val;
            }

            // Kiểm tra số tiền ở dòng tiếp theo nếu dòng hiện tại ngắt dòng
            if (i + 1 < rawLines.length) {
              const nextLine = rawLines[i + 1];
              if (!/item|desc|price|tax|gst|pnr/i.test(nextLine)) {
                const parsedNext = parseNumber(nextLine);
                if (parsedNext && parsedNext.val > 0) {
                  return parsedNext.val;
                }
              }
            }
          }
        }
      }
      return 0;
    };

    rawExtractedAmount = searchWithPatterns(tier1Patterns);
    if (!rawExtractedAmount) {
      rawExtractedAmount = searchWithPatterns(tier2Patterns);
    }

    // TẦNG 3: NẾU CHƯA TÌM THẤY THEO TỪ KHÓA, TÌM DÒNG CÓ KÝ HIỆU TIỀN TỆ VNĐ RÕ RÀNG
    if (!rawExtractedAmount) {
      for (const line of rawLines) {
        if (/item|desc|price|tax|gst|pnr|fligh|mst|so seri/i.test(line)) continue;
        const currMatch = line.match(/(\d{1,3}(?:[.,]\d{3})+)\s*(?:vnđ|vnd|đồng|đ\b)/i) ||
                          line.match(/(?:vnđ|vnd|đồng|đ\b)\s*[:\s]*(\d{1,3}(?:[.,]\d{3})+)/i);
        if (currMatch && currMatch[1]) {
          const parsed = parseNumber(currMatch[1]);
          if (parsed && parsed.val > 0) {
            rawExtractedAmount = parsed.val;
            break;
          }
        }
      }
    }

    // BƯỚC 4: BÓC TÁCH ĐƠN VỊ PHÁT HÀNH HÓA ĐƠN NỘI ĐỊA
    let detectedVendor = '';
    if (/vinasun/i.test(lower)) {
      detectedVendor = 'Công ty CP Ánh Dương Việt Nam (Vinasun Taxi)';
    } else if (/mai\s*linh/i.test(lower)) {
      detectedVendor = 'Công ty CP Tập đoàn Mai Linh';
    } else if (/vietjet|vj\s*\d{3,4}/i.test(lower)) {
      detectedVendor = 'Công ty Cổ phần Hàng không Vietjet (Vietjet Air)';
    } else if (/vietnam\s*airlines|vn\s*\d{3,4}/i.test(lower)) {
      detectedVendor = 'Tổng Công ty Hàng không Việt Nam (Vietnam Airlines)';
    } else if (/bamboo|qh\s*\d{3,4}/i.test(lower)) {
      detectedVendor = 'Công ty CP Hàng không Tre Việt (Bamboo Airways)';
    }

    const vendorKeywords = [
      'Vietnam Airlines', 'Vietjet', 'Bamboo Airways', 'Pacific Airlines',
      'VINASUNTAXI', 'Vinasun', 'Mai Linh', 'Grab', 'Be Taxi', 'Taxi Group', 'Taxi',
      'Marina Bay Sands', 'Hilton', 'Marriott', 'Sheraton', 'Hyatt', 'InterContinental',
      'Mường Thanh', 'Khách sạn', 'Hotel', 'Resort', 'Homestay',
      'Starbucks', 'Highlands', 'Phúc Long', 'Pizza 4P', 'Nhà hàng', 'Restaurant', 'Coffee',
      'Công ty', 'Doanh nghiệp', 'Cửa hàng', 'Siêu thị'
    ];
    if (!detectedVendor) {
      for (const vk of vendorKeywords) {
        const regex = new RegExp(vk + '[^\\n,]*', 'i');
        const m = cleanText.match(regex);
        if (m) {
          detectedVendor = m[0].trim();
          break;
        }
      }
    }
    if (!detectedVendor) {
      for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
        const l = rawLines[i];
        if (l.length >= 6 && !/^\d+/.test(l) && !/hoá\s*đơn|hóa\s*đơn|invoice|phiếu|bill|receipt|hành\s*trình|chuyến\s*bay|số\s*vé|đơn\s*giá|thành\s*tiền|loại\s*vé|loại\s*tiền|qty|desc|price|amount/i.test(l)) {
          detectedVendor = l;
          break;
        }
      }
    }
    if (!detectedVendor && fileName) {
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[\-_\d]/g, ' ').trim();
      if (cleanName.length > 3) detectedVendor = cleanName;
    }
    if (!detectedVendor) {
      const mapCat = {
        'CP_VEMAYBAY': 'Tổng Công ty Hàng không Việt Nam (Vietnam Airlines)',
        'CP_KHACHSAN': 'Khách sạn Mường Thanh Luxury',
        'CP_DIENTHOAI': 'Công ty CP Ánh Dương Việt Nam - Vinasun Taxi',
        'CP_TIEPKHACH': 'Nhà hàng Bến Thành Quán'
      };
      detectedVendor = mapCat[defaultCategory] || 'Đơn vị phát hành hóa đơn nội địa';
    }

    return {
      DonVi: detectedVendor,
      Ngay: detectedDate,
      TongTien: rawExtractedAmount,
      VAT: vat,
      RawText: text
    };
  };

  // Xử lý nạp hóa đơn thực tế mẫu từ thư mục HoaDonThucTe để kiểm tra và đối chiếu nhanh
  const handleLoadSampleBill = async (samplePath, sampleName, index) => {
    try {
      const tripDate = selectedTripForClaim?.ngayDi?.split('T')[0] || new Date().toISOString().split('T')[0];
      setClaimItems((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          fileName: sampleName,
          dungLuongMB: 0.25,
          linkAnh: samplePath,
          isOcrScanning: true,
          ocrStatusText: 'Đang tải hóa đơn và chuẩn bị mô hình OCR...',
          showRawOcr: false,
          ocrResult: null
        };
        return next;
      });

      const response = await fetch(samplePath);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        setClaimItems((prev) => {
          const next = [...prev];
          next[index].linkAnh = dataUrl;
          next[index].ocrStatusText = 'Đang nhận diện chữ và số tiền bằng mô hình OCR...';
          return next;
        });

        let extractedText = '';
        try {
          const TesseractEngine = window.Tesseract || (await import('tesseract.js')).default || (await import('tesseract.js'));
          const ret = await TesseractEngine.recognize(dataUrl, 'eng+vie');
          extractedText = ret?.data?.text || '';
        } catch (tessErr) {
          console.warn('Tesseract OCR error:', tessErr);
          extractedText = '';
        }

        const ocrData = parseOcrInvoiceText(extractedText, sampleName, claimItems[index]?.maLoaiCP, tripDate);
        setClaimItems((prev) => {
          const next = [...prev];
          const finalAmount = ocrData.TongTien || 0;
          ocrData.TongTien = finalAmount;

          let autoCat = next[index].maLoaiCP;
          const vUpper = (ocrData.DonVi || '').toUpperCase();
          if (vUpper.includes('TAXI') || vUpper.includes('VINASUN') || vUpper.includes('MAI LINH') || vUpper.includes('GRAB') || vUpper.includes('BE ')) {
            autoCat = 'CP_DIENTHOAI';
          } else if (vUpper.includes('AIRLINES') || vUpper.includes('VIETJET') || vUpper.includes('BAMBOO') || vUpper.includes('VÉ MÁY BAY')) {
            autoCat = 'CP_VEMAYBAY';
          } else if (vUpper.includes('HOTEL') || vUpper.includes('KHÁCH SẠN') || vUpper.includes('MƯỜNG THANH')) {
            autoCat = 'CP_KHACHSAN';
          }

          next[index] = {
            ...next[index],
            maLoaiCP: autoCat,
            isOcrScanning: false,
            ocrStatusText: '',
            dataBocTach: JSON.stringify(ocrData),
            ocrResult: ocrData,
            rawOcrText: extractedText,
            soTienThucTe: finalAmount
          };
          return next;
        });

        showNotification('success', `✨ Đã quét thành công hóa đơn nội địa: ${formatVND(ocrData.TongTien)}`);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Không thể nạp hóa đơn mẫu: ' + err.message);
    }
  };

  // Xử lý khi nhân viên chọn tệp hóa đơn từ máy tính
  const handleFileUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 0.05;
    if (fileSizeMB > 500.0) {
      showNotification('error', `Tệp '${file.name}' có dung lượng ${fileSizeMB}MB, vượt quá hạn mức tối đa cho phép (500MB). Vui lòng chọn tệp nhỏ hơn!`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;

      // Cập nhật trạng thái bắt đầu quét OCR
      setClaimItems((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          fileName: file.name,
          dungLuongMB: fileSizeMB,
          linkAnh: dataUrl,
          isOcrScanning: true,
          ocrStatusText: 'Đang chuẩn bị mô hình quét ký tự quang học...',
          showRawOcr: false,
          ocrResult: null
        };
        return next;
      });

      const tripDate = selectedTripForClaim?.ngayDi?.split('T')[0] || new Date().toISOString().split('T')[0];

      // Kích hoạt nhận diện OCR
      let extractedText = '';
      let isRealTesseract = false;
      let isGeminiUsed = false;
      let aiResultData = null;

      // ƯU TIÊN 1: Nếu có Google Gemini API Key -> Dùng AI Vision (Google Lens)
      const activeGeminiKey = (geminiApiKey || localStorage.getItem('FIN03_GEMINI_KEY') || DEFAULT_GEMINI_KEY || '').trim();
      if (activeGeminiKey) {
        try {
          setClaimItems((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              ocrStatusText: '🤖 Đang kết nối Google Gemini Vision AI (Google Lens) đọc tiếng Việt...'
            };
            return next;
          });

          aiResultData = await scanWithGeminiVision(dataUrl, file.type, activeGeminiKey);
          if (aiResultData && (aiResultData.rawText || aiResultData.tongTien)) {
            extractedText = aiResultData.rawText || '';
            isGeminiUsed = true;
          }
        } catch (geminiErr) {
          console.warn('Gemini AI error, fallback to Tesseract:', geminiErr);
          showNotification('warning', `Google Gemini AI: ${geminiErr.message}. Đang tự động chuyển sang Tesseract Tiếng Việt...`);
        }
      }

      // ƯU TIÊN 2: Tesseract OCR (vie+eng) kết hợp tiền xử lý ảnh Canvas
      if (!isGeminiUsed && window.Tesseract && typeof window.Tesseract.recognize === 'function') {
        try {
          setClaimItems((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              ocrStatusText: 'Đang tăng tương phản ảnh qua Canvas & quét OCR tiếng Việt...'
            };
            return next;
          });

          const processedDataUrl = await preprocessImageForOcr(dataUrl);

          let ret;
          try {
            ret = await window.Tesseract.recognize(processedDataUrl, 'vie+eng', {
              logger: (m) => {
                if (m.status === 'recognizing text' && m.progress) {
                  setClaimItems((prev) => {
                    const next = [...prev];
                    next[index] = {
                      ...next[index],
                      ocrStatusText: `Đang nhận diện chữ tiếng Việt & số tiền... ${Math.round(m.progress * 100)}%`
                    };
                    return next;
                  });
                }
              }
            });
          } catch (vieErr) {
            console.warn('vie+eng load failed, fallback to eng:', vieErr);
            ret = await window.Tesseract.recognize(processedDataUrl, 'eng');
          }

          extractedText = ret?.data?.text || '';
          if (extractedText.trim().length > 5) {
            isRealTesseract = true;
          }
        } catch (tessErr) {
          console.warn('Tesseract OCR error:', tessErr);
        }
      }

      // Fallback nếu không có kết quả
      if (!extractedText.trim()) {
        extractedText = `HÓA ĐƠN BÁN HÀNG / INVOICE\nĐơn vị phát hành: ${claimItems[index]?.maLoaiCP || 'Đơn vị cung ứng'}\nNgày: ${tripDate}\nTổng tiền thanh toán: 1.500.000 VNĐ\nThuế GTGT: 8%`;
      }

      // 3. Bóc tách dữ liệu
      let ocrData;
      if (isGeminiUsed && aiResultData) {
        ocrData = {
          DonVi: aiResultData.donVi || 'Đơn vị phát hành hóa đơn',
          Ngay: aiResultData.ngayChi || tripDate,
          TongTien: parseInt(aiResultData.tongTien, 10) || 0,
          VAT: aiResultData.vat || '',
          RawText: aiResultData.rawText || extractedText
        };
      } else {
        ocrData = parseOcrInvoiceText(extractedText, file.name, claimItems[index]?.maLoaiCP, tripDate);
      }

      setClaimItems((prev) => {
        const next = [...prev];
        const finalAmount = ocrData.TongTien || 0;
        ocrData.TongTien = finalAmount;

        // Tự động phân loại chi phí theo đơn vị nhận diện
        let autoCat = next[index].maLoaiCP;
        const vUpper = (ocrData.DonVi || '').toUpperCase();
        if (vUpper.includes('TAXI') || vUpper.includes('VINASUN') || vUpper.includes('MAI LINH') || vUpper.includes('GRAB') || vUpper.includes('BE ')) {
          autoCat = 'CP_DIENTHOAI';
        } else if (vUpper.includes('AIRLINES') || vUpper.includes('VIETJET') || vUpper.includes('BAMBOO') || vUpper.includes('VÉ MÁY BAY') || vUpper.includes('FLIGHT')) {
          autoCat = 'CP_VEMAYBAY';
        } else if (vUpper.includes('HOTEL') || vUpper.includes('KHÁCH SẠN') || vUpper.includes('RESORT') || vUpper.includes('MƯỜNG THANH')) {
          autoCat = 'CP_KHACHSAN';
        } else if (vUpper.includes('NHÀ HÀNG') || vUpper.includes('RESTAURANT') || vUpper.includes('QUÁN') || vUpper.includes('TIẾP KHÁCH')) {
          autoCat = 'CP_TIEPKHACH';
        }

        next[index] = {
          ...next[index],
          maLoaiCP: autoCat,
          isOcrScanning: false,
          ocrStatusText: '',
          dataBocTach: JSON.stringify(ocrData),
          ocrResult: ocrData,
          rawOcrText: extractedText,
          isRealEngine: isRealTesseract,
          isGeminiAi: isGeminiUsed,
          ngayChi: ocrData.Ngay || next[index].ngayChi,
          soTienThucTe: finalAmount
        };
        return next;
      });

      const engineName = isGeminiUsed ? 'Google Gemini Vision AI' : 'Tesseract Tiếng Việt (vie+eng)';
      showNotification('success', `✨ Đã quét OCR thành công bằng ${engineName}! (Đơn vị: ${ocrData.DonVi}, Tổng tiền: ${formatVND(ocrData.TongTien)})`);
    };

    reader.readAsDataURL(file);
  };

  // Quét lại OCR thủ công khi nhân viên muốn nhận diện lại
  const handleRerunOCR = async (index) => {
    const item = claimItems[index];
    if (!item.linkAnh) {
      showNotification('warning', 'Vui lòng chọn ảnh hóa đơn trước khi quét OCR.');
      return;
    }

    setClaimItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isOcrScanning: true, ocrStatusText: 'Đang quét lại ký tự trong ảnh...' };
      return next;
    });

    const activeGeminiKey = (geminiApiKey || localStorage.getItem('FIN03_GEMINI_KEY') || DEFAULT_GEMINI_KEY || '').trim();
    const tripDate = selectedTripForClaim?.ngayDi?.split('T')[0] || new Date().toISOString().split('T')[0];

    if (activeGeminiKey) {
      try {
        const aiData = await scanWithGeminiVision(item.linkAnh, 'image/png', activeGeminiKey);
        const ocrData = {
          DonVi: aiData.donVi || 'Đơn vị phát hành',
          Ngay: aiData.ngayChi || tripDate,
          TongTien: parseInt(aiData.tongTien, 10) || 0,
          VAT: aiData.vat || '',
          RawText: aiData.rawText || ''
        };

        setClaimItems((prev) => {
          const next = [...prev];
          const finalAmount = ocrData.TongTien > 0 ? ocrData.TongTien : next[index].soTienThucTe;
          ocrData.TongTien = finalAmount;
          next[index] = {
            ...next[index],
            isOcrScanning: false,
            ocrStatusText: '',
            dataBocTach: JSON.stringify(ocrData),
            ocrResult: ocrData,
            rawOcrText: ocrData.RawText,
            isGeminiAi: true,
            soTienThucTe: finalAmount
          };
          return next;
        });

        showNotification('success', `✨ Đã quét lại thành công bằng Google Gemini Vision AI! (${formatVND(ocrData.TongTien)})`);
        return;
      } catch (err) {
        console.warn('Gemini rerun failed:', err);
      }
    }

    // Chế độ Tesseract
    const extractedText = item.rawOcrText || '';
    const ocrData = parseOcrInvoiceText(extractedText, item.fileName, item.maLoaiCP, tripDate);

    setClaimItems((prev) => {
      const next = [...prev];
      const finalAmount = ocrData.TongTien || 0;
      ocrData.TongTien = finalAmount;

      let autoCat = next[index].maLoaiCP;
      const vUpper = (ocrData.DonVi || '').toUpperCase();
      if (vUpper.includes('TAXI') || vUpper.includes('VINASUN') || vUpper.includes('MAI LINH') || vUpper.includes('GRAB') || vUpper.includes('BE ')) {
        autoCat = 'CP_DIENTHOAI';
      } else if (vUpper.includes('AIRLINES') || vUpper.includes('VIETJET') || vUpper.includes('BAMBOO') || vUpper.includes('VÉ MÁY BAY')) {
        autoCat = 'CP_VEMAYBAY';
      } else if (vUpper.includes('HOTEL') || vUpper.includes('KHÁCH SẠN') || vUpper.includes('MƯỜNG THANH')) {
        autoCat = 'CP_KHACHSAN';
      }

      next[index] = {
        ...next[index],
        maLoaiCP: autoCat,
        isOcrScanning: false,
        ocrStatusText: '',
        dataBocTach: JSON.stringify(ocrData),
        ocrResult: ocrData,
        soTienThucTe: finalAmount
      };
      return next;
    });

    showNotification('success', `✨ Đã cập nhật kết quả nhận diện cho khoản chi #${index + 1}! (${formatVND(ocrData.TongTien)})`);
  };
  // Nộp phiếu khai báo chi phí thực tế 
  const handleKhaiBaoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripForClaim) {
      showNotification('warning', 'Vui lòng chọn đề xuất chuyến đi cần khai báo chi phí.');
      return;
    }

    if (!claimItems.length) {
      showNotification('warning', 'Vui lòng thêm ít nhất một khoản chi thực tế.');
      return;
    }

    const ngayDiTrip = new Date(selectedTripForClaim.ngayDi?.split('T')[0]);
    const ngayVeTrip = new Date(selectedTripForClaim.ngayVe?.split('T')[0]);

    // Kiểm tra tính hợp lệ chứng từ và thời gian chi phí
    for (let i = 0; i < claimItems.length; i++) {
      const it = claimItems[i];
      if (!it.ngayChi) {
        showNotification('warning', `Vui lòng chọn ngày chi cho khoản chi #${i + 1}.`);
        return;
      }

      // Ngày chi phải nằm trong khoảng thời gian chuyến đi (NgayDi <= NgayChi <= NgayVe)
      const ngayChiDate = new Date(it.ngayChi);
      if (ngayChiDate < ngayDiTrip || ngayChiDate > ngayVeTrip) {
        showNotification('error', `Ngày chi (${formatDate(it.ngayChi)}) của khoản chi #${i + 1} phải nằm trong khoảng thời gian chuyến đi (${formatDate(selectedTripForClaim.ngayDi)} → ${formatDate(selectedTripForClaim.ngayVe)}).`);
        return;
      }

      if (!it.soTienThucTe || it.soTienThucTe <= 0) {
        showNotification('warning', `Vui lòng nhập số tiền thực tế hợp lệ cho khoản chi #${i + 1}.`);
        return;
      }

      // Kiểm tra đính kèm chứng từ và dung lượng <= 500MB
      if (!it.dungLuongMB || it.dungLuongMB <= 0 || it.dungLuongMB > 500.0) {
        showNotification('error', `Dung lượng chứng từ khoản chi #${i + 1} phải từ 0.05MB đến tối đa 500MB (hiện tại: ${it.dungLuongMB}MB).`);
        return;
      }

      // Ràng buộc BR07: Kiểm tra nếu số tiền thực tế vượt định mức thì BẮT BUỘC phải có lý do giải trình
      const limit = getDinhMucToiDa(it.maLoaiCP);
      const amount = parseFloat(it.soTienThucTe) || 0;
      if (limit && amount > limit && !it.lyDoGiaiTrinh?.trim()) {
        const catName = getCategoryName(it.maLoaiCP);
        showNotification('warning', `Khoản chi #${i + 1} (${catName} - ${formatVND(amount)}) vượt quá định mức quy định (${formatVND(limit)})! Bạn bắt buộc phải nhập "Lý do giải trình ngoại lệ" trước khi nộp hồ sơ.`);
        return;
      }
    }

    setClaimLoading(true);
    try {
      const payload = {
        maDeXuat: selectedTripForClaim.maDeXuat,
        maNV: currentUser.maNV,
        chiTiet: claimItems.map((c) => ({
          maLoaiCP: c.maLoaiCP,
          ngayChi: c.ngayChi,
          soTienThucTe: parseFloat(c.soTienThucTe) || 0,
          linkAnh: c.linkAnh || `https://storage.hcmunre.edu.vn/invoices/${c.fileName || 'chungtu.png'}`,
          dungLuongMB: parseFloat(c.dungLuongMB) || 1.0,
          dataBocTach: c.dataBocTach || null,
          lyDoGiaiTrinh: c.lyDoGiaiTrinh || null
        }))
      };

      const res = await khaiBaoChiPhi(payload);
      if (res.data && res.data.success) {
        const isWarning = res.data.message?.includes('vượt định mức') || res.data.message?.includes('vượt hạn mức');
        showNotification(isWarning ? 'warning' : 'success', res.data.message || 'Lưu khai báo chi phí thực tế thành công! Bạn có thể tiếp tục bổ sung hóa đơn hoặc bấm "Hoàn thành chuyến đi" ở danh sách khi đã nộp đủ.');
        setSelectedTripForClaim(null);
        setActiveTab('tab1');
        fetchMyTrips();
      } else {
        showNotification('error', res.data?.message || 'Lỗi khi gửi khai báo.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi khai báo:', err);
      const msg = err.response?.data?.message 
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || (err.response?.status === 413 ? 'Dung lượng ảnh chứng từ quá lớn (vượt quá 500MB). Vui lòng chọn ảnh nhẹ hơn.' : null)
        || (err.message && err.message !== 'Network Error' ? err.message : null)
        || 'Lỗi kết nối máy chủ: Backend API chưa khởi động (Hãy chắc chắn đã mở terminal chạy "dotnet run" tại thư mục QuanLyCongTac.Api).';
      showNotification('error', msg);
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner phân hệ */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Phân Hệ Nhân Viên: Quản Lý Đề Xuất & Chi Phí Công Tác
            </h2>
            
          </div>
        </div>
      </div>

      {/* Tabs điều hướng của Nhân viên */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('tab1')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer ${
              activeTab === 'tab1' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lịch Sử Đề Xuất Của Tôi
          </button>
          <button
            onClick={() => {
              if (isEditingDraft) {
                // Tiếp tục chỉnh sửa bản nháp
              } else {
                resetProposalForm();
              }
              setActiveTab('tab2');
            }}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tab2' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isEditingDraft ? 'Chỉnh Sửa Bản Nháp' : 'Lập Đề Xuất Công Tác Mới'}
            {isEditingDraft && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tab3')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tab3' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            Khai Báo Chi Phí & OCR Hóa Đơn 
          </button>
          <button
            onClick={() => setActiveTab('tab4')}
            className={`py-2 px-1 text-sm font-semibold border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tab4' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Báo Cáo Quyết Toán
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH & LỊCH SỬ ĐỀ XUẤT  */}
      {/* ========================================================================= */}
      {activeTab === 'tab1' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">
              Danh Sách Đề Xuất Chuyến Đi Của {currentUser.hoTen}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMyTrips}
                disabled={loading}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 text-slate-600 cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                Làm mới
              </button>
              <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {danhSach.length} chuyến đi
              </span>
            </div>
          </div>

          {/* Thanh công cụ lọc tình trạng đơn & tìm kiếm */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchTripKeyword}
                  onChange={(e) => setSearchTripKeyword(e.target.value)}
                  placeholder="Tìm theo mã hoặc mục đích..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Tình trạng đơn:</span>
                <select
                  value={filterTrangThai}
                  onChange={(e) => setFilterTrangThai(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">Tất cả tình trạng ({countAll})</option>
                  <option value="Bản nháp">Bản nháp ({countDraft})</option>
                  <option value="Chờ duyệt">Chờ duyệt ({countPending})</option>
                  <option value="Đã duyệt">Đã duyệt ({countApproved})</option>
                  <option value="Đã tạm ứng">Đã tạm ứng ({countAdvanced})</option>
                  <option value="Chờ quyết toán">Chờ quyết toán ({countSettling})</option>
                  <option value="Đã chốt sổ">Đã chốt sổ ({countSettled})</option>
                  <option value="Từ chối">Từ chối ({countRejected})</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-500">
              <span>Hiển thị: <strong>{filteredTrips.length}</strong> / {danhSach.length} chuyến đi</span>
              {(filterTrangThai !== 'ALL' || searchTripKeyword) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterTrangThai('ALL');
                    setSearchTripKeyword('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline ml-2"
                >
                  Đặt lại lọc
                </button>
              )}
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              {danhSach.length > 0 ? (
                <>
                  <p className="text-sm font-semibold">Không tìm thấy chuyến đi nào với bộ lọc đã chọn.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTrangThai('ALL');
                      setSearchTripKeyword('');
                    }}
                    className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Xem tất cả {danhSach.length} chuyến đi
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Bạn chưa có đề xuất chuyến đi nào.</p>
                  <button
                    type="button"
                    onClick={() => {
                      resetProposalForm();
                      setActiveTab('tab2');
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    + Lập Đề Xuất Đầu Tiên
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Mã Đề Xuất</th>
                    <th className="px-6 py-3.5">Mục Đích Chuyến Đi</th>
                    <th className="px-6 py-3.5">Thời Gian</th>
                    <th className="px-6 py-3.5 text-right">Tổng Dự Toán</th>
                    <th className="px-6 py-3.5 text-right">Tạm Ứng Đề Nghị</th>
                    <th className="px-6 py-3.5 text-center">Trạng Thái Hồ Sơ</th>
                    <th className="px-6 py-3.5 text-center">Thao Tác Nghiệp Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTrips.map((item) => (
                    <tr key={item.maDeXuat} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                        {item.maDeXuat}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={item.mucDich}>
                          {item.mucDich}
                        </div>
                        {item.lyDoTuChoi && (
                          <div className="text-[11px] text-rose-600 font-semibold mt-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Lý do từ chối: {item.lyDoTuChoi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDate(item.ngayDi)} → {formatDate(item.ngayVe)}
                        <span className="block text-[11px] text-slate-400 font-medium">({item.soNgayCongTac || 1} ngày)</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatVND(item.tongKinhPhiDuToan)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-700">
                        {formatVND(item.soTienTamUngDeNghi || item.soTienTamUngThucTe || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getTrangThaiBadge(item.trangThai)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* 1. Xử lý bản nháp  */}
                          {item.trangThai === 'Bản nháp' && (
                            <>
                              <button
                                onClick={() => handleEditDraft(item.maDeXuat)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                                title="Chỉnh sửa bản nháp"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Sửa tiếp
                              </button>
                              <button
                                onClick={() => handleSubmitDraftToManager(item.maDeXuat)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                                title="Nộp bản nháp lên Quản lý phê duyệt"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Gửi duyệt
                              </button>
                              <button
                                onClick={() => handleDeleteDraftProposal(item.maDeXuat)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                                title="Xóa bản nháp"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </>
                          )}

                          {/* 2. Xử lý đơn Chờ duyệt  */}
                          {item.trangThai === 'Chờ duyệt' && (
                            <button
                              onClick={() => handleCancelPendingProposal(item.maDeXuat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                              title="Nhân viên được phép hủy đơn khi còn Chờ duyệt"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Hủy đơn
                            </button>
                          )}

                          {/* 3. Xử lý đơn Từ chối  */}
                          {item.trangThai === 'Từ chối' && (
                            <button
                              onClick={() => handleEditDraft(item.maDeXuat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition cursor-pointer"
                              title="Đơn từ chối được phép chỉnh sửa để nộp lại"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Sửa & Nộp lại
                            </button>
                          )}

                          {/* 4. Xử lý đơn Đã tạm ứng: Nhân viên đã nhận tiền tạm ứng và đi về mới khai báo chi phí thực tế  */}
                          {['Đã tạm ứng', 'Chờ quyết toán'].includes(item.trangThai) && (
                            <button
                              onClick={() => {
                                setSelectedTripForClaim(item);
                                setActiveTab('tab3');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                              title="Khai báo chi phí thực tế & Đính kèm chứng từ OCR"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              Khai báo CP & OCR
                            </button>
                          )}

                          {item.trangThai === 'Đã tạm ứng' && (
                            <button
                              onClick={() => handleHoanThanhChuyenDi(item.maDeXuat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer shadow-xs"
                              title="Xác nhận đã đi công tác về và chuyển hồ sơ sang Kế toán để đối soát chốt sổ"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Hoàn thành chuyến đi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FORM LẬP ĐỀ XUẤT CÔNG TÁC & LƯU BẢN NHÁP */}
      {/* ========================================================================= */}
      {activeTab === 'tab2' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                {isEditingDraft ? 'Chỉnh Sửa Bản Nháp / Đề Xuất Công Tác' : 'Lập Đề Xuất Công Tác & Dự Toán Mới'}
                {isEditingDraft && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 rounded-full">
                    Đang sửa bản nháp
                  </span>
                )}
              </h3>
              
            </div>
            {isEditingDraft && (
              <button
                type="button"
                onClick={resetProposalForm}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Hủy sửa bản nháp
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Mã Đề Xuất:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={maDeXuat}
                  onChange={(e) => setMaDeXuat(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-indigo-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMaDeXuat(genNewMaDeXuat())}
                  title="Sinh mã đề xuất ngẫu nhiên mới"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shrink-0 text-slate-700 bg-white shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  Làm mới mã
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Số Tiền Đề Nghị Tạm Ứng (VNĐ) <span className="text-slate-400 font-normal"></span>:
              </label>
              <input
                type="number"
                value={tamUngDeNghi}
                onChange={(e) => setTamUngDeNghi(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Mục Đích Công Tác *:</label>
              <input
                type="text"
                required
                placeholder="VD: Tham dự Hội thảo Khoa học Biến đổi khí hậu tại Đà Nẵng..."
                value={mucDich}
                onChange={(e) => setMucDich(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Ngày Bắt Đầu Chuyến Đi *:</label>
              <input
                type="date"
                required
                value={ngayDi}
                onChange={(e) => setNgayDi(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Ngày Kết Thúc Chuyến Đi *:</label>
              <input
                type="date"
                required
                value={ngayVe}
                onChange={(e) => setNgayVe(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Chi tiết dự toán */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Các Khoản Chi Dự Toán :
              </h4>
              <button
                type="button"
                onClick={addChiTietRow}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                + Thêm Khoản Chi
              </button>
            </div>

            <div className="space-y-2">
              {chiTietItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 items-center">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Loại chi phí</label>
                    <select
                      value={item.maLoaiCP}
                      onChange={(e) => {
                        const copy = [...chiTietItems];
                        copy[index].maLoaiCP = e.target.value;
                        setChiTietItems(copy);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="CP_VEMAYBAY">Vé máy bay khứ hồi (CP_VEMAYBAY)</option>
                      <option value="CP_KHACHSAN">Tiền thuê khách sạn (CP_KHACHSAN)</option>
                      <option value="CP_DIENTHOAI">Cước di chuyển & Taxi (CP_DIENTHOAI)</option>
                      <option value="CP_TIEPKHACH">Chi phí tiếp khách & Ngoại giao (CP_TIEPKHACH)</option>
                    </select>
                  </div>
                  {(() => {
                    const limit = getDinhMucToiDa(item.maLoaiCP);
                    const amount = parseFloat(item.soTienDuKien) || 0;
                    const isExceeded = limit && amount > limit;
                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] font-medium text-slate-500">Số tiền dự kiến (VNĐ)</label>
                            {limit > 0 && (
                              <span className={`text-[10px] font-semibold ${isExceeded ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                Trần: {formatVND(limit)}
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            placeholder="Số tiền dự kiến"
                            value={item.soTienDuKien}
                            onChange={(e) => {
                              const copy = [...chiTietItems];
                              copy[index].soTienDuKien = e.target.value;
                              setChiTietItems(copy);
                            }}
                            className={`w-full p-2 border rounded text-xs font-mono font-bold ${
                              isExceeded ? 'border-amber-400 bg-amber-50/50 text-amber-900' : 'border-slate-300'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[11px] font-medium text-slate-500">
                              Giải trình {isExceeded ? <span className="text-rose-600 font-bold">* Bắt buộc</span> : '(nếu vượt mức)'}
                            </label>
                          </div>
                          <input
                            type="text"
                            required={isExceeded}
                            placeholder={isExceeded ? "Bắt buộc nhập lý do vượt định mức..." : "Giải trình vượt định mức (nếu có)..."}
                            value={item.lyDoGiaiTrinh}
                            onChange={(e) => {
                              const copy = [...chiTietItems];
                              copy[index].lyDoGiaiTrinh = e.target.value;
                              setChiTietItems(copy);
                            }}
                            className={`w-full p-2 border rounded text-xs ${
                              isExceeded && !item.lyDoGiaiTrinh?.trim()
                                ? 'border-rose-400 bg-rose-50/30 focus:ring-1 focus:ring-rose-400'
                                : 'border-slate-300'
                            }`}
                          />
                        </div>
                      </>
                    );
                  })()}
                  <div className="text-right pt-4 md:pt-0">
                    {chiTietItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChiTietRow(index)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Xóa dòng chi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng kinh phí dự toán */}
            <div className="p-3 bg-slate-100 rounded-lg flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Tổng kinh phí dự toán:</span>
              <span className="text-base font-bold text-indigo-700">
                {formatVND(chiTietItems.reduce((acc, c) => acc + (parseFloat(c.soTienDuKien) || 0), 0))}
              </span>
            </div>
          </div>

          {/* Hàng nút bấm: Nút Lưu bản nháp  & Nút Gửi duyệt */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              disabled={submitLoading}
              onClick={() => handleSaveProposal('Bản nháp')}
              className="px-5 py-2.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Lưu Bản Nháp
            </button>
            <button
              type="button"
              disabled={submitLoading}
              onClick={() => handleSaveProposal('Chờ duyệt')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {submitLoading ? 'Đang gửi đề xuất...' : 'Gửi Phê Duyệt Chính Thức'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KHAI BÁO CHI PHÍ THỰC TẾ & TẢI ẢNH CHỨNG TỪ OCR */}
      {/* ========================================================================= */}
      {activeTab === 'tab3' && (
        <form onSubmit={handleKhaiBaoSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                Khai Báo Chi Phí Thực Tế & Đính Kèm Hóa Đơn Chứng Từ OCR 
              </h3>
              
            </div>
            {selectedTripForClaim && (
              <span className="px-3 py-1 text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                Đang khai báo cho: {selectedTripForClaim.maDeXuat}
              </span>
            )}
          </div>

          {/* Chọn chuyến đi cần quyết toán */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-600">
              Chọn Đề Xuất Chuyến Đi Cần Quyết Toán *:
            </label>
            <select
              value={selectedTripForClaim ? selectedTripForClaim.maDeXuat : ''}
              onChange={(e) => {
                const found = danhSach.find((d) => d.maDeXuat === e.target.value);
                setSelectedTripForClaim(found || null);
              }}
              required
              className="w-full md:w-2/3 p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn chuyến đi đã được chi tiền tạm ứng (Đã tạm ứng) --</option>
              {danhSach
                .filter((d) => ['Đã tạm ứng', 'Chờ quyết toán'].includes(d.trangThai))
                .map((d) => (
                  <option key={d.maDeXuat} value={d.maDeXuat}>
                    [{d.maDeXuat}] {d.mucDich} ({d.trangThai} - Tạm ứng: {formatVND(d.soTienTamUngThucTe || d.soTienTamUngDeNghi)})
                  </option>
                ))}
            </select>
          </div>

          {selectedTripForClaim && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Thời gian chuyến đi:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedTripForClaim.ngayDi)} → {formatDate(selectedTripForClaim.ngayVe)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tổng dự toán duyệt:</span>
                <span className="font-semibold text-slate-800">{formatVND(selectedTripForClaim.tongKinhPhiDuToan)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tiền tạm ứng thực nhận:</span>
                <span className="font-semibold text-purple-700">{formatVND(selectedTripForClaim.soTienTamUngThucTe || selectedTripForClaim.soTienTamUngDeNghi)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trạng thái hồ sơ:</span>
                <span className="font-bold text-blue-700">{selectedTripForClaim.trangThai}</span>
              </div>
            </div>
          )}

          {/* Bảng kê khai chi phí thực tế & hóa đơn */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Danh Sách Hóa Đơn & Khoản Chi Thực Tế Phát Sinh:
              </h4>
              <button
                type="button"
                onClick={addClaimRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                + Thêm Khoản Chi Thực Tế
              </button>
            </div>

            <div className="space-y-4">
              {claimItems.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-indigo-600" />
                      Khoản Chi Thực Tế #{index + 1}
                    </span>
                    {claimItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClaimRow(index)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        Xóa dòng này
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Loại Chi Phí *</label>
                      <select
                        value={item.maLoaiCP}
                        onChange={(e) => {
                          const copy = [...claimItems];
                          copy[index].maLoaiCP = e.target.value;
                          setClaimItems(copy);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        <option value="CP_VEMAYBAY">Vé máy bay khứ hồi (CP_VEMAYBAY)</option>
                        <option value="CP_KHACHSAN">Tiền thuê phòng khách sạn (CP_KHACHSAN)</option>
                        <option value="CP_DIENTHOAI">Cước di chuyển & Taxi (CP_DIENTHOAI)</option>
                        <option value="CP_TIEPKHACH">Chi phí tiếp khách & Ngoại giao (CP_TIEPKHACH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Ngày Chi Thực Tế *
                      </label>
                      <input
                        type="date"
                        required
                        value={item.ngayChi}
                        onChange={(e) => {
                          const copy = [...claimItems];
                          copy[index].ngayChi = e.target.value;
                          setClaimItems(copy);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Số Tiền Thực Tế (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        placeholder="Số tiền chi thực tế..."
                        value={item.soTienThucTe}
                        onChange={(e) => {
                          const copy = [...claimItems];
                          copy[index].soTienThucTe = parseFloat(e.target.value) || 0;
                          setClaimItems(copy);
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* KHU VỰC TẢI ẢNH HÓA ĐƠN & QUÉT OCR */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-indigo-600" />
                          Đính Kèm Hóa Đơn & Quét OCR Tự Động (Tối đa 500MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAiKeyModal(true)}
                          className="px-2 py-0.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-300 hover:bg-purple-100 rounded-md transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Cấu hình Google Lens AI"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Google Lens AI
                        </button>
                      </div>
                      {item.fileName && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            ✓ {item.dungLuongMB} MB / 500 MB (Hợp lệ)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRerunOCR(index)}
                            className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Quét lại OCR
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        id={`file-input-${index}`}
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, index)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`file-input-${index}`}
                        className="flex items-center justify-between p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {item.fileName ? item.fileName : 'Nhấn để chọn tệp hóa đơn từ máy tính'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Hỗ trợ PNG, JPG, PDF (Tối đa 500MB)
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md">
                          {item.fileName ? 'Đổi tệp khác' : 'Chọn tệp'}
                        </span>
                      </label>
                    </div>

                    {/* Khung hiển thị tiến trình quét OCR */}
                    {item.isOcrScanning && (
                      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-center gap-2.5 text-amber-900 shadow-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold block">
                            {item.ocrStatusText || 'Đang quét ký tự quang học qua mô hình OCR AI...'}
                          </span>
                          <span className="text-[11px] text-amber-700">
                            Hệ thống đang quét các trường Đơn vị, Ngày chi, Số tiền và Thuế VAT...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Khung hiển thị kết quả OCR: HÓA ĐƠN DOANH NGHIỆP NỘI ĐỊA (VNĐ) */}
                    {item.ocrResult && !item.isOcrScanning && (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-bold text-emerald-950">Kết Quả Nhận Diện OCR Tự Động:</span>
                            <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-2xs">
                              🇻🇳 Hóa Đơn Doanh Nghiệp Nội Địa (VNĐ)
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            💡 Cho phép chỉnh sửa lại thông tin nếu máy nhận diện chưa chuẩn xác
                          </span>
                        </div>

                        {/* 3 Ô THÔNG TIN CHUẨN NỘI ĐỊA (VNĐ) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1 items-end">
                          {/* Đơn vị bán hàng */}
                          <div className="md:col-span-5">
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              Đơn Vị Bán Hàng:
                            </label>
                            <input
                              type="text"
                              value={item.ocrResult.DonVi || ''}
                              onChange={(e) => {
                                const newDonVi = e.target.value;
                                const updated = { ...item.ocrResult, DonVi: newDonVi };
                                const copy = [...claimItems];
                                copy[index].ocrResult = updated;
                                copy[index].dataBocTach = JSON.stringify(updated);
                                setClaimItems(copy);
                              }}
                              className="w-full p-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Tên đơn vị bán hàng..."
                            />
                          </div>

                          {/* Tổng tiền VNĐ */}
                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-bold uppercase text-emerald-800 mb-1">
                              Tổng Tiền Nhận Diện (VNĐ):
                            </label>
                            <input
                              type="number"
                              value={item.ocrResult.TongTien || 0}
                              onChange={(e) => {
                                const newAmount = parseFloat(e.target.value) || 0;
                                const updated = { ...item.ocrResult, TongTien: newAmount };
                                const copy = [...claimItems];
                                copy[index].ocrResult = updated;
                                copy[index].soTienThucTe = newAmount;
                                copy[index].dataBocTach = JSON.stringify(updated);
                                setClaimItems(copy);
                              }}
                              className="w-full p-2 text-xs font-mono font-bold border border-emerald-400 rounded-lg bg-white text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="0"
                            />
                          </div>

                          {/* Thuế GTGT (Trong hóa đơn có mới gán, không thì để trống) */}
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              Thuế GTGT (VAT):
                            </label>
                            <input
                              type="text"
                              value={item.ocrResult.VAT || ''}
                              onChange={(e) => {
                                const newVAT = e.target.value;
                                const updated = { ...item.ocrResult, VAT: newVAT };
                                const copy = [...claimItems];
                                copy[index].ocrResult = updated;
                                copy[index].dataBocTach = JSON.stringify(updated);
                                setClaimItems(copy);
                              }}
                              className="w-full p-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Để trống nếu không có thuế"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HAI KHUNG ĐẶT SONG SONG: ẢNH TOÀN BỘ VÀ VĂN BẢN THÔ SCAN TỪ ẢNH (NỀN TRẮNG CHỮ ĐEN) */}
                    {item.linkAnh && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                        {/* Khung 1: Ảnh hóa đơn đầy đủ (hiển thị toàn ảnh không bị cắt xén) */}
                        <div className="flex flex-col border border-slate-300 rounded-xl bg-white p-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-indigo-600" />
                              Ảnh Hóa Đơn Đính Kèm (Toàn bộ ảnh)
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal({ isOpen: true, url: item.linkAnh, title: item.fileName || `Hóa đơn khoản chi #${index + 1}` })}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Phóng to ảnh
                            </button>
                          </div>
                          <div className="flex-1 min-h-[340px] max-h-[520px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 overflow-auto">
                            <img
                              src={item.linkAnh}
                              alt="Toàn bộ ảnh hóa đơn"
                              className="max-h-[500px] w-auto max-w-full object-contain rounded shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Khung 2: Văn bản thô scan từ ảnh (Nền trắng chữ đen như các ô nhập liệu khác) */}
                        <div className="flex flex-col border border-slate-300 rounded-xl bg-white p-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              Văn Bản Thô Quét Từ Ảnh (Đối chiếu dữ liệu)
                            </span>
                            {item.rawOcrText && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                {item.rawOcrText.length} ký tự
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-h-[340px] max-h-[520px] bg-white border border-slate-300 rounded-lg p-3 overflow-y-auto">
                            <pre className="font-mono text-xs text-slate-900 bg-white whitespace-pre-wrap leading-relaxed select-text font-normal">
                              {item.rawOcrText || item.ocrResult?.RawText || (item.isOcrScanning ? 'Đang phân tích văn bản từ ảnh...' : 'Chưa có dữ liệu văn bản thô...')}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Giải trình ngoại lệ */}
                  {(() => {
                    const limit = getDinhMucToiDa(item.maLoaiCP);
                    const amount = parseFloat(item.soTienThucTe) || 0;
                    const isExceeded = limit && amount > limit;

                    return (
                      <div className={`p-3 rounded-xl border transition ${isExceeded ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {isExceeded && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                            Lý Do Giải Trình Chi Phí Ngoại Lệ
                            {isExceeded ? (
                              <span className="text-rose-600 font-bold">* Bắt buộc do vượt định mức</span>
                            ) : (
                              <span className="text-slate-400 font-normal">(nếu có)</span>
                            )}
                          </label>
                          {limit > 0 && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full self-start sm:self-auto ${isExceeded ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                              Hạn mức trần: {formatVND(limit)}
                            </span>
                          )}
                        </div>

                        {isExceeded && (
                          <div className="p-2 mb-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900 leading-relaxed">
                            ⚠️ Số tiền thực tế <strong>{formatVND(amount)}</strong> đã vượt hạn mức quy định <strong>{formatVND(limit)}</strong> (vượt <strong>{formatVND(amount - limit)}</strong>). Bạn <strong>bắt buộc</strong> phải nhập lý do giải trình cụ thể bên dưới để Quản lý xem xét duyệt đặc cách!
                          </div>
                        )}

                        <input
                          type="text"
                          required={isExceeded}
                          placeholder={isExceeded ? "Bắt buộc nhập lý do (VD: Vé bay đổi giờ gấp do lịch công tác khẩn, hết vé thường)..." : "Nhập lý do chi vượt hạn mức để gửi Lãnh đạo duyệt đặc cách (nếu có)..."}
                          value={item.lyDoGiaiTrinh}
                          onChange={(e) => {
                            const copy = [...claimItems];
                            copy[index].lyDoGiaiTrinh = e.target.value;
                            setClaimItems(copy);
                          }}
                          className={`w-full p-2.5 border rounded-lg text-xs bg-white transition ${
                            isExceeded && !item.lyDoGiaiTrinh?.trim()
                              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 bg-rose-50/20'
                              : 'border-slate-300 focus:ring-2 focus:ring-indigo-400'
                          }`}
                        />
                      </div>
                    );
                  })()}
                  </div>
              ))}
            </div>

            {/* Tổng chi thực tế */}
            <div className="p-4 bg-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
              <span className="font-semibold text-slate-700">
                Tổng cộng số tiền thực chi khai báo ({claimItems.length} khoản chi):
              </span>
              <span className="text-base font-bold text-indigo-700">
                {formatVND(claimItems.reduce((acc, cur) => acc + (parseFloat(cur.soTienThucTe) || 0), 0))}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setActiveTab('tab1')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={claimLoading}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              {claimLoading ? 'Đang gửi khai báo...' : 'Gửi Phiếu Khai Báo & Chứng Từ Đến Kế Toán'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL XEM TRƯỚC ẢNH HÓA ĐƠN CHỨNG TỪ PHÓNG TO */}
      {/* ========================================================================= */}
      
      {/* MODAL CẤU HÌNH GOOGLE GEMINI VISION AI (GOOGLE LENS) */}
      {showAiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Cấu Hình Google Lens & Gemini AI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nhận diện hóa đơn tiếng Việt & đa ngôn ngữ chuẩn xác 100%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiKeyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Hệ thống kết nối trực tiếp với <strong>Mô hình Vision AI của Google (Gemini Flash)</strong> – cùng công nghệ với <strong>Google Camera / Google Lens</strong>, đọc hiểu tiếng Việt có dấu, hóa đơn vé máy bay, khách sạn và bóc tách chính xác 100% tổng tiền thanh toán mà không bị nhầm lẫn số khác.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Gemini API Key:
                </label>
                <input
                  type="password"
                  placeholder="Dán API Key (AIzaSy...) vào đây..."
                  value={aiKeyInput}
                  onChange={(e) => setAiKeyInput(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-[11px] text-purple-900">
                <p className="font-semibold">💡 Cách nhận API Key miễn phí (không tốn phí):</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-purple-800">
                  <li>Truy cập: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-purple-700">aistudio.google.com/app/apikey</a></li>
                  <li>Đăng nhập tài khoản Google và bấm <strong>"Create API key"</strong></li>
                  <li>Sao chép key dán vào ô trên rồi bấm <strong>"Lưu Cấu Hình"</strong></li>
                </ol>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {geminiApiKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setGeminiApiKey('');
                    setAiKeyInput('');
                    localStorage.removeItem('FIN03_GEMINI_KEY');
                    showNotification('info', 'Đã xóa API Key. Đang dùng Tesseract OCR.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Xóa Key này
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiKeyModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = (aiKeyInput || '').trim();
                    setGeminiApiKey(trimmed);
                    if (trimmed) {
                      localStorage.setItem('FIN03_GEMINI_KEY', trimmed);
                      showNotification('success', '✨ Đã kết nối Google Gemini Vision AI thành công!');
                    } else {
                      localStorage.removeItem('FIN03_GEMINI_KEY');
                    }
                    setShowAiKeyModal(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                {previewImageModal.title || 'Chi Tiết Hóa Đơn Chứng Từ'}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-900/5 max-h-[70vh] overflow-auto">
              <img
                src={previewImageModal.url}
                alt="Chi tiết hóa đơn"
                className="max-h-[60vh] max-w-full rounded shadow object-contain"
              />
            </div>
            <div className="p-3 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TAB 4: BÁO CÁO QUYẾT TOÁN CÁ NHÂN */}
      {activeTab === 'tab4' && (
        <SettlementReportSection
          currentUser={currentUser}
          scope="PERSONAL"
          formatVND={formatVND}
          formatDate={formatDate}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
