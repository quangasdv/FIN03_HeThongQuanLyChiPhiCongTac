import axios from 'axios';

// Cấu hình URL trỏ vào Backend Web API ASP.NET Core qua Vite Proxy cố định
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 0. Xác thực & Đăng nhập OIDC (Google SSO)
export const login = (emailOrUser, password = '') => 
    api.post('/Auth/login', { email: emailOrUser, username: emailOrUser, password });
export const getUsers = () => api.get('/Auth/users');
export const getDepartments = () => api.get('/Auth/departments');
export const createDepartment = (data) => api.post('/Auth/departments', data);
export const updateDepartment = (maPB, data) => api.put(`/Auth/departments/${maPB}`, data);
export const deleteDepartment = (maPB) => api.delete(`/Auth/departments/${maPB}`);
export const createUser = (data) => api.post('/Auth/users', data);
export const updateUser = (maNV, data) => api.put(`/Auth/users/${maNV}`, data);
export const deleteUser = (maNV) => api.delete(`/Auth/users/${maNV}`);
export const resetPassword = (maNV) => api.post(`/Auth/users/${maNV}/reset-password`);

// 1. Đề xuất công tác (View vw_DanhSachDeXuat & SP sp_TaoDeXuatVaDuToan)
// Hỗ trợ lọc theo { maNV, maPB, trangThai }
export const getDanhSachDeXuat = (params) => api.get('/DeXuat', { params });
export const getDeXuatDetail = (maDeXuat) => api.get(`/DeXuat/${maDeXuat}`);
export const taoDeXuat = (data) => api.post('/DeXuat', data);
export const submitDeXuat = (maDeXuat) => api.post(`/DeXuat/${maDeXuat}/submit`);
export const hoanThanhChuyenDi = (maDeXuat) => api.post(`/DeXuat/${encodeURIComponent(maDeXuat)}/hoan-thanh-chuyen-di`, {});
export const xoaDeXuat = (maDeXuat) => api.delete(`/DeXuat/${maDeXuat}`);

// 2. Phê duyệt đề xuất & Ngoại lệ chi phí (SP sp_PheDuyetDeXuat)
export const pheDuyetDeXuat = (data) => api.post('/PheDuyet', data);
export const getDanhSachNgoaiLe = (params) => api.get('/PheDuyet/ngoai-le', { params });
export const pheDuyetNgoaiLe = (data) => api.post('/PheDuyet/ngoai-le', data);
// Nhắc nhở duyệt đơn tự động (Scheduler)
export const getDonTonDong = (params) => api.get('/PheDuyet/nhac-nho/don-ton-dong', { params });
export const kichHoatQuetNhacNho = (params) => api.post('/PheDuyet/nhac-nho/kich-hoat-quet', null, { params });

// 3. Chi tạm ứng (SP sp_ChiTamUng)
export const chiTamUng = (data) => api.post('/TamUng', data);

// 4. Quyết toán tài chính & OCR (SP sp_ChotSoQuyetToan & View vw_TongHopQuyetToan)
export const getTongHopQuyetToan = (params) => api.get('/QuyetToan/tonghop', { params });
export const getChungTu = (maDeXuat) => api.get('/QuyetToan/chung-tu', { params: { maDeXuat } });
export const chotSoQuyetToan = (data) => api.post('/QuyetToan/chot-so', data);
export const dieuChinhChiPhi = (maCTKB, data) => api.put(`/QuyetToan/dieu-chinh-chi-phi/${maCTKB}`, data);
export const khaiBaoChiPhi = (data) => api.post('/QuyetToan/khai-bao', data);

// 5. Cấu hình quy tắc định mức (Rule Engine)
export const getDinhMuc = () => api.get('/DinhMuc');
export const getLoaiChiPhi = () => api.get('/DinhMuc/loai-chi-phi');
export const createDinhMuc = (data) => api.post('/DinhMuc', data);
export const updateDinhMuc = (maQuyDinh, data) => api.put(`/DinhMuc/${maQuyDinh}`, data);
export const deleteDinhMuc = (maQuyDinh) => api.delete(`/DinhMuc/${maQuyDinh}`);

export default api;
