import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Award, Clock } from 'lucide-react';

function Progress() {
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    totalStudyTime: 0,
    coursesEnrolled: 0,
  });

  useEffect(() => {
    // TODO: Load progress data from API
    setStats({
      testsCompleted: 15,
      averageScore: 750,
      totalStudyTime: 45,
      coursesEnrolled: 3,
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="mt-2 text-gray-600">Track your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tests Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.testsCompleted}</p>
            </div>
            <BarChart className="h-12 w-12 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Study Time (hours)</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudyTime}</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Courses Enrolled</p>
              <p className="text-3xl font-bold text-gray-900">{stats.coursesEnrolled}</p>
            </div>
            <Award className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">TOEIC Practice Test {i}</p>
                  <p className="text-xs text-gray-500">Completed 2 days ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">Score: {650 + i * 20}</p>
                <p className="text-xs text-gray-500">+{i * 10} points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progress;
