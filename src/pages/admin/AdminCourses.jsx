import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, BookOpen } from 'lucide-react';
import courseService from '../../services/courseService';
import CourseModal from '../../components/admin/CourseModal';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCoursesForAdmin();
      if (response.result) {
        setCourses(response.result);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await courseService.publishCourse(courseId);
      toast.success('Course published successfully!');
      fetchCourses(); // Refresh list
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to publish course');
    }
  };

  const handleUnpublish = async (courseId) => {
    try {
      await courseService.unpublishCourse(courseId);
      toast.success('Course unpublished successfully!');
      fetchCourses(); // Refresh list
    } catch (error) {
      console.error('Error unpublishing course:', error);
      toast.error('Failed to unpublish course');
    }
  };

  const handleCreateCourse = async (courseData, imageFile) => {
    try {
      // First create the course
      const response = await courseService.createCourse(courseData);
      const newCourse = response.result;

      // If there's an image file, upload it
      if (imageFile && newCourse?.id) {
        await courseService.uploadCourseImage(newCourse.id, imageFile);
      }

      fetchCourses(); // Refresh list
    } catch (error) {
      console.error('Error creating course:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleUpdateCourse = async (courseData, imageFile) => {
    try {
      // Update course data
      await courseService.updateCourse(editingCourse.id, courseData);

      // If there's a new image file, upload it
      if (imageFile) {
        await courseService.uploadCourseImage(editingCourse.id, imageFile);
      }

      toast.success('Course updated successfully!');
      setEditingCourse(null);
      fetchCourses(); // Refresh list
    } catch (error) {
      console.error('Error updating course:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600 mt-1">Manage courses and learning materials</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading courses...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-500">
                        {course.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${course.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.durationInHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {course.isPublished ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          <Eye size={14} />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                          <EyeOff size={14} />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/courses/${course.id}/lectures`)}
                          className="flex items-center gap-1 rounded bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-700 transition-colors"
                          title="Manage lectures"
                        >
                          <BookOpen size={16} />
                          Lectures
                        </button>
                        {course.isPublished ? (
                          <button
                            onClick={() => handleUnpublish(course.id)}
                            className="flex items-center gap-1 rounded bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-700 transition-colors"
                            title="Unpublish course"
                          >
                            <EyeOff size={16} />
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(course.id)}
                            className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 transition-colors"
                            title="Publish course"
                          >
                            <Eye size={16} />
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(course)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit course"
                        >
                          <Edit2 size={18} />
                        </button>
                        {/* <button
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete course"
                        >
                          <Trash2 size={18} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={editingCourse ? handleUpdateCourse : handleCreateCourse}
        course={editingCourse}
      />
    </div>
  );
};

export default AdminCourses;
