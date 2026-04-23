import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import lectureService from '../../services/lectureService';
import courseService from '../../services/courseService';
import LectureModal from '../../components/admin/LectureModal';

function AdminLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);

  useEffect(() => {
    loadCourse();
    loadLectures();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await courseService.getCourseById(courseId);
      setCourse(response.result);
    } catch (error) {
      toast.error('Failed to load course');
      console.error('Error loading course:', error);
    }
  };

  const loadLectures = async () => {
    try {
      setLoading(true);
      const response = await lectureService.getAllLecturesByCourse(courseId);
      setLectures(response.result || []);
    } catch (error) {
      toast.error('Failed to load lectures');
      console.error('Error loading lectures:', error);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = async (lectureData) => {
    try {
      await lectureService.createLecture(courseId, lectureData);
      toast.success('Lecture created successfully');
      loadLectures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create lecture');
    }
  };

  const handleUpdateLecture = async (lectureData) => {
    try {
      await lectureService.updateLecture(editingLecture.id, lectureData);
      toast.success('Lecture updated successfully');
      loadLectures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lecture');
    }
  };

  const handleDeleteLecture = async (lectureId, lectureTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${lectureTitle}"?`)) {
      return;
    }

    try {
      await lectureService.deleteLecture(lectureId);
      toast.success('Lecture deleted successfully');
      loadLectures();
    } catch (error) {
      toast.error('Failed to delete lecture');
      console.error('Error deleting lecture:', error);
    }
  };

  const handleTogglePublish = async (lecture) => {
    try {
      if (lecture.isPublished) {
        await lectureService.unpublishLecture(lecture.id);
        toast.success('Lecture unpublished');
      } else {
        await lectureService.publishLecture(lecture.id);
        toast.success('Lecture published');
      }
      loadLectures();
    } catch (error) {
      toast.error('Failed to update lecture status');
    }
  };

  const handleOpenModal = (lecture = null) => {
    setEditingLecture(lecture);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLecture(null);
  };

  // Move lecture up/down
  const handleMoveUp = async (index) => {
    if (index === 0) return;

    const newLectures = [...lectures];
    [newLectures[index - 1], newLectures[index]] = [newLectures[index], newLectures[index - 1]];

    try {
      const lectureIds = newLectures.map(l => l.id);
      await lectureService.reorderLectures(courseId, lectureIds);
      setLectures(newLectures);
      toast.success('Lecture moved up');
    } catch (error) {
      toast.error('Failed to reorder lectures');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === lectures.length - 1) return;

    const newLectures = [...lectures];
    [newLectures[index], newLectures[index + 1]] = [newLectures[index + 1], newLectures[index]];

    try {
      const lectureIds = newLectures.map(l => l.id);
      await lectureService.reorderLectures(courseId, lectureIds);
      setLectures(newLectures);
      toast.success('Lecture moved down');
    } catch (error) {
      toast.error('Failed to reorder lectures');
    }
  };

  const getLectureIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video size={20} className="text-blue-500" />;
      case 'FILE':
        return <Download size={20} className="text-green-500" />;
      case 'TEXT':
        return <FileText size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} />;
    }
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
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Courses
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course?.title} - Lectures
            </h1>
            <p className="mt-2 text-gray-600">
              Manage lectures for this course. Use arrows to reorder.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Lecture
          </button>
        </div>
      </div>

      {/* Lectures List */}
      {lectures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No lectures yet</p>
          <p className="text-gray-400 mt-2">Click "Add Lecture" to create your first lecture</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Order Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                    {index + 1}
                  </div>

                  {/* Lecture Type Icon */}
                  <div className="flex-shrink-0">
                    {getLectureIcon(lecture.type)}
                  </div>

                  {/* Lecture Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {lecture.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="capitalize">{lecture.type.toLowerCase()}</span>
                      {lecture.duration && (
                        <span>{lecture.duration} min</span>
                      )}
                      {!lecture.isPublished && (
                        <span className="text-amber-600 font-medium">Draft</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Move Up/Down Buttons */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUp size={20} />
                    </button>

                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === lectures.length - 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDown size={20} />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(lecture)}
                      className={`p-2 rounded-lg transition-colors ${
                        lecture.isPublished
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={lecture.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {lecture.isPublished ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>

                    <button
                      onClick={() => handleOpenModal(lecture)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>

                    <button
                      onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <LectureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={editingLecture ? handleUpdateLecture : handleCreateLecture}
        lecture={editingLecture}
      />
    </div>
  );
}

export default AdminLectures;
