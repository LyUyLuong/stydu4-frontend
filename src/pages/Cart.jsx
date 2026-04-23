import { useState, useEffect } from 'react';
import { ShoppingCart, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as cartService from '../services/cartService';
import orderService from '../services/orderService';
import courseService from '../services/courseService';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cart'); // 'cart', 'orders', or 'enrolled'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cartRes, ordersRes, coursesRes] = await Promise.all([
        cartService.getCartItems(),
        orderService.getMyOrders(),
        courseService.getEnrolledCourses()
      ]);

      if (cartRes.result) {
        setCartItems(cartRes.result);
      }

      if (ordersRes.result) {
        setOrders(ordersRes.result);
      }

      if (coursesRes.result) {
        setEnrolledCourses(coursesRes.result);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      await cartService.removeFromCart(courseId);
      toast.success('Đã xóa khỏi giỏ hàng');
      loadData();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Không thể xóa khỏi giỏ hàng');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await cartService.checkout();
      console.log('Checkout response:', response);
      if (response.result && response.result.checkoutUrl) {
        window.location.href = response.result.checkoutUrl;
      } else {
        toast.error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.response?.data?.message || 'Lỗi thanh toán');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: {
        icon: CheckCircle,
        text: 'Completed',
        className: 'bg-green-100 text-green-800',
      },
      PENDING: {
        icon: Clock,
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
      },
      FAILED: {
        icon: XCircle,
        text: 'Failed',
        className: 'bg-red-100 text-red-800',
      },
      CANCELLED: {
        icon: AlertCircle,
        text: 'Cancelled',
        className: 'bg-gray-100 text-gray-800',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart size={32} />
          My Learning
        </h1>
        <p className="mt-2 text-gray-600">View your order history and enrolled courses</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cart')}
            className={`${
              activeTab === 'cart'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <ShoppingCart size={18} />
            Giỏ hàng ({cartItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${
              activeTab === 'orders'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <CreditCard size={18} />
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`${
              activeTab === 'enrolled'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Package size={18} />
            Enrolled Courses ({enrolledCourses.length})
          </button>
        </nav>
      </div>

      {/* Cart Items Tab */}
      {activeTab === 'cart' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {cartItems.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
              <p className="text-gray-600">Thêm khóa học vào giỏ hàng để bắt đầu</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {item.courseImageUrl && (
                              <img
                                src={item.courseImageUrl}
                                alt={item.courseTitle}
                                className="h-12 w-12 rounded object-cover mr-4"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{item.courseTitle}</div>
                              <div className="text-sm text-gray-500 max-w-md truncate">
                                {item.courseDescription}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${item.coursePrice?.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.addedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRemoveFromCart(item.courseId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Checkout Section */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Items: {cartItems.length}</p>
                    <p className="text-lg font-bold text-gray-900">
                      Total: ${cartItems.reduce((sum, item) => sum + (item.coursePrice || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Your order history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.courseTitle}</div>
                          <div className="text-sm text-gray-500 max-w-md truncate">
                            {order.courseDescription}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${order.amount?.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enrolled Courses Tab */}
      {activeTab === 'enrolled' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {enrolledCourses.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
              <p className="text-gray-600">Start learning by enrolling in a course</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledCourses.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{enrollment.courseTitle}</div>
                          <div className="text-sm text-gray-500 max-w-md truncate">
                            {enrollment.courseDescription}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${enrollment.coursePrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.courseDuration}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(enrollment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
