import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import courseService from '../services/courseService';
import * as cartService from '../services/cartService';
import toast from 'react-hot-toast';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my-courses'

  useEffect(() => {
    loadCourses();
    loadMyCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      setCourses(response.result || []);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error loading courses:', error);
      setCourses([]);
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
      setMyCourses([]);
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      await cartService.addToCart(courseId);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  // Transform enrollment data to course format for My Courses tab
  const transformedMyCourses = myCourses.map(enrollment => ({
    id: enrollment.courseId,
    title: enrollment.courseTitle,
    description: enrollment.courseDescription,
    price: enrollment.coursePrice,
    duration: enrollment.courseDuration,
    imageUrl: enrollment.courseImageUrl
  }));

  const displayCourses = activeTab === 'all' ? courses : transformedMyCourses;

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
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="mt-2 text-gray-600">Browse and enroll in courses</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-courses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Courses ({myCourses.length})
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Course Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title || course.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-sm font-medium opacity-75">No Image</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <Link to={`/courses/${course.id}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
                  {course.title || course.name}
                </h3>
              </Link>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  ${course.price || 0}
                </span>
                <span className="text-sm text-gray-500">
                  {course.duration || 'N/A'} days
                </span>
              </div>

              <div className="space-y-2">
                {activeTab === 'all' ? (
                  // Check if user already owns this course
                  myCourses.some(myCourse => myCourse.courseId === course.id) ? (
                    <>
                      <div className="text-center">
                        <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                          ✓ Đã mua
                        </span>
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAddToCart(course.id)}
                        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                      <Link
                        to={`/courses/${course.id}`}
                        className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                    </>
                  )
                ) : (
                  <Link
                    to={`/courses/${course.id}`}
                    className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Continue Learning
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {displayCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {activeTab === 'all' ? 'No courses available' : 'You have not enrolled in any courses yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
