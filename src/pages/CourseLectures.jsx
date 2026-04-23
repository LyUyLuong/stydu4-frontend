import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  FileText,
  Download,
  Lock,
  CheckCircle,
  Clock,
  PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import lectureService from '../services/lectureService';
import courseService from '../services/courseService';

function CourseLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [course, setCourse] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
    loadLectures();
    loadMyCourses();
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
      const response = await lectureService.getPublishedLecturesByCourse(courseId);
      const lectureList = response.result || [];
      setLectures(lectureList);

      // Auto-select first lecture
      if (lectureList.length > 0 && !selectedLecture) {
        setSelectedLecture(lectureList[0]);
      }
    } catch (error) {
      toast.error('Failed to load lectures');
      console.error('Error loading lectures:', error);
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCourses = async () => {
    try {
      const response = await courseService.getEnrolledCourses();
      setMyCourses(response.result || []);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const isEnrolled = myCourses.some(c => c.courseId === courseId);

  const getLectureIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video size={18} className="text-blue-500" />;
      case 'FILE':
        return <Download size={18} className="text-green-500" />;
      case 'TEXT':
        return <FileText size={18} className="text-purple-500" />;
      default:
        return <FileText size={18} />;
    }
  };

  const renderLectureContent = () => {
    if (!selectedLecture) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <PlayCircle size={64} className="mx-auto mb-4 text-gray-300" />
            <p>Select a lecture to start learning</p>
          </div>
        </div>
      );
    }

    if (!isEnrolled) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <Lock size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Enroll to Access Lectures
            </h3>
            <p className="text-gray-600 mb-6">
              You need to enroll in this course to access the lecture content
            </p>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Course Details
            </button>
          </div>
        </div>
      );
    }

    // Render based on lecture type
    switch (selectedLecture.type) {
      case 'VIDEO':
        return renderVideoContent();
      case 'TEXT':
        return renderTextContent();
      case 'FILE':
        return renderFileContent();
      default:
        return <div className="text-gray-500">Unsupported lecture type</div>;
    }
  };

  const renderVideoContent = () => {
    if (!selectedLecture.content) {
      return <div className="text-gray-500">No video provided</div>;
    }

    // Check if it's a YouTube URL
    const isYouTube = selectedLecture.content.includes('youtube.com') || selectedLecture.content.includes('youtu.be');

    if (isYouTube) {
      // Extract YouTube video ID if it's a YouTube URL
      const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
          ? `https://www.youtube.com/embed/${match[2]}`
          : url;
      };

      const embedUrl = getYouTubeEmbedUrl(selectedLecture.content);

      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedLecture.title}
          ></iframe>
        </div>
      );
    }

    // Direct video file
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          src={selectedLecture.content}
          title={selectedLecture.title}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const renderTextContent = () => {
    return (
      <div className="prose max-w-none">
        <div className="bg-white p-8 rounded-lg">
          <pre className="whitespace-pre-wrap font-sans text-gray-700">
            {selectedLecture.content || 'No content available'}
          </pre>
        </div>
      </div>
    );
  };

  const renderFileContent = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Download size={64} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Downloadable File
          </h3>
          <p className="text-gray-600 mb-6">
            Click the button below to download the file
          </p>
          <a
            href={selectedLecture.content}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download File
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {course?.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lecture Content - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {selectedLecture && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedLecture.title}
                  </h2>
                  {selectedLecture.description && (
                    <p className="text-gray-600">{selectedLecture.description}</p>
                  )}
                  {selectedLecture.duration && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>{selectedLecture.duration} minutes</span>
                    </div>
                  )}
                </div>
              )}

              <div className="min-h-[400px]">
                {renderLectureContent()}
              </div>
            </div>
          </div>

          {/* Lecture List - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">
                  Course Content ({lectures.length} lectures)
                </h3>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {lectures.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No lectures available
                  </div>
                ) : (
                  lectures.map((lecture, index) => (
                    <button
                      key={lecture.id}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedLecture?.id === lecture.id
                          ? 'bg-primary-50 border-l-4 border-primary-600'
                          : 'hover:bg-gray-50'
                      } ${!isEnrolled ? 'cursor-not-allowed opacity-60' : ''}`}
                      disabled={!isEnrolled}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getLectureIcon(lecture.type)}
                            {!isEnrolled && <Lock size={14} className="text-gray-400" />}
                          </div>

                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {lecture.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {lecture.duration && (
                              <span>{lecture.duration} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseLectures;
