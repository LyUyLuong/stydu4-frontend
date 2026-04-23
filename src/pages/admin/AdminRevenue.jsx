import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShoppingCart,
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';

function AdminRevenue() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    periodRevenue: 0,
    totalOrders: 0,
    periodOrders: 0,
    averageOrderValue: 0,
    growthRate: 0,
    dailyRevenue: [],
    monthlyRevenue: [],
    topCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [dateRange]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDateTime = new Date(dateRange.startDate).toISOString();
      const endDateTime = new Date(dateRange.endDate + 'T23:59:59').toISOString();

      const data = await dashboardService.getRevenueAnalytics(startDateTime, endDateTime);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching revenue analytics:', err);
      setError('Failed to load revenue analytics. Please try again later.');
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

  const setQuickDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (monthName) => {
    const months = {
      JANUARY: 'Jan', FEBRUARY: 'Feb', MARCH: 'Mar', APRIL: 'Apr',
      MAY: 'May', JUNE: 'Jun', JULY: 'Jul', AUGUST: 'Aug',
      SEPTEMBER: 'Sep', OCTOBER: 'Oct', NOVEMBER: 'Nov', DECEMBER: 'Dec'
    };
    return months[monthName] || monthName;
  };

  const exportToCSV = () => {
    const data = viewMode === 'daily' ? analytics.dailyRevenue : analytics.monthlyRevenue;
    const headers = viewMode === 'daily'
      ? ['Date', 'Revenue', 'Order Count']
      : ['Month', 'Year', 'Revenue', 'Order Count'];

    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        if (viewMode === 'daily') {
          return [row.date, row.revenue, row.orderCount].join(',');
        } else {
          return [getMonthName(row.monthName), row.year, row.revenue, row.orderCount].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${viewMode}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      icon: DollarSign,
      label: 'Total Revenue (All Time)',
      value: formatCurrency(analytics.totalRevenue),
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      icon: TrendingUp,
      label: 'Period Revenue',
      value: formatCurrency(analytics.periodRevenue),
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: analytics.growthRate,
      trendLabel: 'of total revenue'
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: formatNumber(analytics.totalOrders),
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subValue: `${analytics.periodOrders} in period`
    },
    {
      icon: BarChart3,
      label: 'Average Order Value',
      value: formatCurrency(analytics.averageOrderValue),
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    }
  ];

  if (loading && !analytics.dailyRevenue.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...(viewMode === 'daily'
      ? analytics.dailyRevenue.map(d => d.revenue)
      : analytics.monthlyRevenue.map(d => d.revenue)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze course sales revenue</p>
        </div>
        <button
          onClick={fetchRevenueAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Date Range:</span>
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
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600">Quick:</span>
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setQuickDateRange(days)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))} days selected
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={fetchRevenueAnalytics}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500">{stat.subValue}</p>
                )}
                {stat.trend !== null && stat.trend !== undefined && stat.trend !== 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {parseFloat(stat.trend) >= 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {Number(stat.trend).toFixed(1)}% {stat.trendLabel}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          {Math.abs(Number(stat.trend)).toFixed(1)}% {stat.trendLabel}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Revenue Trend
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    viewMode === 'daily'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-6">
          {viewMode === 'daily' && analytics.dailyRevenue.length > 0 ? (
            <div className="space-y-3">
              {analytics.dailyRevenue.map((day, index) => {
                const percentage = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{day.orderCount} orders</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(day.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {percentage > 15 && (
                          <span className="text-xs font-medium text-white">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'monthly' && analytics.monthlyRevenue.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthlyRevenue.map((month, index) => {
                const percentage = (month.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getMonthName(month.monthName)} {month.year}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{month.orderCount} orders</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(month.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {percentage > 15 && (
                          <span className="text-xs font-medium text-white">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No revenue data available for this period</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting the date range</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Top Performing Courses
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Revenue from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topCourses && analytics.topCourses.length > 0 ? (
                analytics.topCourses.map((course, index) => {
                  const performancePercentage = analytics.periodRevenue > 0
                    ? ((course.revenue / analytics.periodRevenue) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(course.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{course.totalEnrollments}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-600">{formatCurrency(course.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(performancePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{performancePercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No course revenue data available for this period</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting the date range</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminRevenue;
