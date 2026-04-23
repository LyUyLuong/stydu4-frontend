import apiClient from './api';

export const addToCart = async (courseId) => {
  const response = await apiClient.post(`/cart/add/${courseId}`);
  return response.data;
};

export const getCartItems = async () => {
  const response = await apiClient.get('/cart/items');
  return response.data;
};

export const removeFromCart = async (courseId) => {
  const response = await apiClient.delete(`/cart/remove/${courseId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await apiClient.delete('/cart/clear');
  return response.data;
};

export const getCartCount = async () => {
  const response = await apiClient.get('/cart/count');
  return response.data;
};

export const getTotalPrice = async () => {
  const response = await apiClient.get('/cart/total');
  return response.data;
};

export const checkout = async () => {
  const response = await apiClient.post('/cart/checkout');
  return response.data;
};

