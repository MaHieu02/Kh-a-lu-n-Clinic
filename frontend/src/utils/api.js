// API utilities cho hệ thống
export const API_BASE_URL = 'http://localhost:5000/api';

// Gọi API với xử lý lỗi
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    console.log(`Making API call to: ${url}`, finalOptions);
    const response = await fetch(url, finalOptions);
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data?.message || `HTTP error! status: ${response.status || 'unknown'}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return { 
        success: false, 
        error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

export const registerUser = async (userData) => {
  const role = userData?.role || 'patient';
  if (role !== 'patient') {
    // Với nhân sự: dùng endpoint yêu cầu quyền admin và kèm token nếu có
    try {
      const { getToken } = await import('@/utils/auth.js');
      const token = getToken();
      return apiCall('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.warn('registerUser: cannot import getToken, falling back without auth header', err);
      // Fallback nếu import thất bại
      return apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
  }
  // Bệnh nhân: dùng endpoint public
  return apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const checkUsernameExists = async (username) => {
  try {
    const result = await apiCall(`/users/check-username/${username}`);
    return result.success && result.exists;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, error: error.message };
  }
};

// Hàm đăng nhập
export const loginUser = async (credentials) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Hàm đăng xuất
export const logoutUser = async () => {
  return apiCall('/auth/logout', {
    method: 'POST',
  });
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  return apiCall('/auth/me');
};

// Lịch khám
export const createAppointment = async (appointmentData) => {
  return apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

export const getAppointments = async (query = {}) => {
  const searchParams = new URLSearchParams(query);
  return apiCall(`/appointments?${searchParams.toString()}`);
};

export const getAppointmentById = async (id) => {
  return apiCall(`/appointments/${id}`);
};

export const updateAppointment = async (id, updateData) => {
  return apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

export const cancelAppointment = async (id) => {
  return apiCall(`/appointments/${id}/cancel`, {
    method: 'PUT',
  });
};

// Hàm lấy bác sĩ
export const getDoctors = async (query = {}) => {
  const searchParams = new URLSearchParams(query);
  return apiCall(`/doctors?${searchParams.toString()}`);
};

export const getDoctorsBySpecialty = async (specialty) => {
  return apiCall(`/doctors?specialty=${specialty}&is_active=true`);
};

// Hàm lấy bệnh nhân
export const getPatients = async (query = {}) => {
  const searchParams = new URLSearchParams(query);
  return apiCall(`/patients?${searchParams.toString()}`);
};

export const getPatientByUserId = async (userId) => {
  return apiCall(`/patients/user/${userId}`);
};