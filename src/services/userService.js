import api from './api';

const userService = {
  // Lấy tất cả user (cho Admin)
  getAllUsers: async () => {
    // API: @GetMapping("/users")
    const response = await api.get('/users');
    return response.data;
  },

  // Tạo user mới
  createUser: async (data) => {
    // API: @PostMapping
    const response = await api.post('/users', data);
    return response.data;
  },

  // Cập nhật user
  updateUser: async (userId, data) => {
    // API: @PutMapping("/{userId}")
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  // Xóa user
  deleteUser: async (userId) => {
    // API: @DeleteMapping("/{userId}")
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Lấy thông tin của tôi (đã có trong authService, nhưng để đây cho đủ)
  getMyInfo: async () => {
    // API: @GetMapping("/myInfo")
    const response = await api.get('/myInfo');
    return response.data;
  },
  
  // TODO: Bạn nên tạo một endpoint (ví dụ: /roles) để lấy danh sách này
  // Tạm thời chúng ta sẽ hardcode ở component cha
};

export default userService;