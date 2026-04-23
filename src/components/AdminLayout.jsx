import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Puzzle,
  MessageSquare,
  CheckSquare,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: DollarSign, label: 'Revenue', path: '/admin/revenue' },
    { icon: FileText, label: 'Tests', path: '/admin/tests' },
    { icon: Puzzle, label: 'Part Tests', path: '/admin/part-tests' },
    { icon: MessageSquare, label: 'Question Groups', path: '/admin/question-groups' },
    { icon: CheckSquare, label: 'Questions', path: '/admin/questions' },
    { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: FolderOpen, label: 'Files', path: '/admin/files' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors"
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center px-4 py-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
