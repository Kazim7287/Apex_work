const API_BASE_URL =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

export const apiFetch = async (endpoint, options = {}) => {
  const storedAdminData = localStorage.getItem('adminData');

  let token = null;

  if (storedAdminData) {
    try {
      const adminData = JSON.parse(storedAdminData);
      token = adminData?.token;
    } catch (error) {
      console.error('Invalid adminData:', error);
    }
  }

  const headers = {
    Accept: 'application/json',
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: 'include',
    }
  );

  return response;
};

export default apiFetch;