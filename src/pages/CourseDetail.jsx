import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import courseService from '../services/courseService';
import * as cartService from '../services/cartService';
import toast from 'react-hot-toast';

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseDetail();
    loadMyCourses();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      setCourse(response.result);
    } catch (error) {
      toast.error('Failed to load course details');
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCourses = async () => {
    try {
      const response = await courseService.getEnrolledCourses();
      setMyCourses(response.result || []);
    } catch (error) {
      console.error('Error loading my courses:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartService.addToCart(courseId);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const isEnrolled = myCourses.some(myCourse => myCourse.courseId === courseId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Image */}
            <div className="lg:w-1/3">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-64 lg:h-80 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:w-2/3">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {course.description || 'No description available'}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <DollarSign size={20} className="mr-2" />
                    <span className="text-sm font-medium">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600">
                    ${course.price || 0}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={20} className="mr-2" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {course.duration || 'N/A'} <span className="text-sm font-normal">days</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <BookOpen size={20} className="mr-2" />
                    <span className="text-sm font-medium">Tests</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {course.testCount || 0}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users size={20} className="mr-2" />
                    <span className="text-sm font-medium">Students</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {course.studentCount || 0}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isEnrolled ? (
                  <div className="flex-1">
                    <div className="flex items-center justify-center bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold">
                      <CheckCircle size={20} className="mr-2" />
                      Đã mua khóa học này
                    </div>
                    <Link
                      to={`/courses/${courseId}/lectures`}
                      className="mt-4 block w-full text-center bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      Bắt đầu học
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h3>
            <p className="text-gray-700 mb-6">
              {course.description || 'Detailed course information coming soon.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Features</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">
                  Access to {course.testCount || 0} practice tests
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">
                  {course.duration || 'Lifetime'} days of course access
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">
                  Track your progress and performance
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">
                  Detailed explanations and solutions
                </span>
              </li>
            </ul>

            {course.isPublished ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✓ This course is currently available for enrollment
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  ⚠ This course is not yet published
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enroll Section */}
        {!isEnrolled && (
          <div className="mt-8 bg-primary-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
                <p className="text-primary-100">
                  Join {course.studentCount || 0} students already enrolled in this course
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg whitespace-nowrap"
              >
                Enroll Now - ${course.price || 0}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
