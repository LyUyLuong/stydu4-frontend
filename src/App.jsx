import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLectures from './pages/CourseLectures';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminTests from './pages/admin/AdminTests';
import AdminPartTests from './pages/admin/AdminPartTests';
import AdminQuestionGroups from './pages/admin/AdminQuestionGroups';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCourses from './pages/admin/AdminCourses';
import AdminLectures from './pages/admin/AdminLectures';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminFiles from './pages/admin/AdminFiles';
import Exam from './pages/Exam';
import ExamResult from './pages/ExamResult';
import PaymentSuccess from './pages/PaymentSuccess';
import MyResults from './pages/MyResults';

// Store
import useAuthStore from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1 min-h-[calc(100vh-16rem)]">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            
            {/* Public route - anyone can view tests list */}
            <Route path="/tests" element={<Tests />} />
            
            {/* Public route - anyone can view test details */}
            <Route path="/tests/:testId" element={<TestDetail />} />
            
            {/* Protected routes - require authentication */}
            <Route
              path="/exam/:testId/:mode"
              element={
                <ProtectedRoute>
                  <Exam />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/exam-results/:resultId"
              element={
                <ProtectedRoute>
                  <ExamResult />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/:courseId/lectures"
              element={
                <ProtectedRoute>
                  <CourseLectures />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-results"
              element={
                <ProtectedRoute>
                  <MyResults />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="tests" element={<AdminTests />} />
              <Route path="part-tests" element={<AdminPartTests />} />
              <Route path="question-groups" element={<AdminQuestionGroups />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:courseId/lectures" element={<AdminLectures />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="files" element={<AdminFiles />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/tests" replace />} />
          </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

