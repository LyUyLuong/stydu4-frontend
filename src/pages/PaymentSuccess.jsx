import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Đang xác minh thanh toán...');
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent double verification in React StrictMode
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;
      
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        setMessage('Không tìm thấy thông tin phiên thanh toán');
        return;
      }

      try {
        // Gọi API để verify payment session
        const response = await apiClient.get(`/payment/verify/${sessionId}`);
        
        if (response.data.result === true) {
          setStatus('success');
          setMessage('Thanh toán thành công! Đang chuyển hướng...');
          toast.success('Đã mua khóa học thành công!');
          
          // Redirect to courses page after 3 seconds
          setTimeout(() => {
            navigate('/courses');
          }, 3000);
        } else if (response.data.result === false) {
          // Payment might have been already processed
          console.log('Payment already processed or failed verification');
          setStatus('success');
          setMessage('Đang kiểm tra trạng thái thanh toán...');
          
          // Redirect anyway to let user check their courses
          setTimeout(() => {
            navigate('/courses');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Không thể xác minh thanh toán');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Lỗi xác minh thanh toán');
        toast.error('Lỗi xác minh thanh toán');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xác minh thanh toán
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                >
                  Xem khóa học của tôi
                </button>
                <button
                  onClick={() => navigate('/tests')}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lỗi thanh toán
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                >
                  Quay lại giỏ hàng
                </button>
                <button
                  onClick={() => navigate('/tests')}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
