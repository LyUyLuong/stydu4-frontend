import { useEffect, useState } from 'react';
import { 
  FileText, 
  Users, 
  BookOpen, 
  AlertCircle, 
  RotateCcw, 
  Calendar,
  ShoppingCart,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalCourses: 0,
    activeTests: 0,
    recentTests: [],
    recentEnrollments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDateTime = new Date(dateRange.startDate).toISOString();
      const endDateTime = new Date(dateRange.endDate + 'T23:59:59').toISOString();
      
      const data = await dashboardService.getAllStats(startDateTime, endDateTime);
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const quickActions = [
    { label: 'Create Test', icon: FileText, color: 'blue', path: '/admin/tests' },
    { label: 'Create Course', icon: BookOpen, color: 'purple', path: '/admin/courses' },
    { label: 'Manage Users', icon: Users, color: 'green', path: '/admin/users' },
    { label: 'Upload Files', icon: Plus, color: 'orange', path: '/admin/files' },
  ];

  const statCards = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: formatNumber(stats.totalUsers), 
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: null
    },
    { 
      icon: FileText, 
      label: 'Total Tests', 
      value: formatNumber(stats.totalTests), 
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      subValue: `${stats.activeTests} active`,
      trend: null
    },
    { 
      icon: BookOpen, 
      label: 'Total Courses', 
      value: formatNumber(stats.totalCourses), 
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: null
    },
    { 
      icon: Award, 
      label: 'Total Enrollments', 
      value: formatNumber(stats.recentEnrollments?.length || 0), 
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      subValue: 'recent enrollments',
      trend: null
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border-2 border-transparent hover:border-${action.color}-200 hover:shadow-md transition-all group`}
          >
            <div className={`p-2 bg-${action.color}-50 rounded-lg group-hover:bg-${action.color}-100 transition-colors`}>
              <action.icon className={`h-5 w-5 text-${action.color}-600`} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filter by Date:</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center pt-6">
              <span className="text-gray-400">→</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))} days selected
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500">{stat.subValue}</p>
                )}
                {stat.trend !== null && stat.trend !== undefined && stat.trend !== 0 && !isNaN(parseFloat(stat.trend)) && (
                  <div className="flex items-center gap-1 mt-2">
                    {parseFloat(stat.trend) >= 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {Number(stat.trend).toFixed(1)}% {stat.trendLabel || ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          {Math.abs(Number(stat.trend)).toFixed(1)}% {stat.trendLabel || ''}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Tests
              </h2>
              <button
                onClick={() => navigate('/admin/tests')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentTests && stats.recentTests.length > 0 ? (
                stats.recentTests.slice(0, 5).map((test) => (
                  <div 
                    key={test.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{test.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{test.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          test.status === 1 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {test.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        {test.numberOfParticipants || 0}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">participants</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tests available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Recent Enrollments
              </h2>
              <button
                onClick={() => navigate('/admin/courses')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                stats.recentEnrollments.slice(0, 5).map((enrollment) => (
                  <div 
                    key={enrollment.id} 
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.courseName || 'Unknown Course'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">{enrollment.userName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(enrollment.enrolledAt || new Date())}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {enrollment.status || 'Enrolled'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent enrollments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
