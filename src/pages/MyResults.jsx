import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import testService from '../services/testService';

function MyResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, score

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await testService.getAllMyResults();
      setResults(response.result || []);
    } catch (error) {
      toast.error('Failed to load results');
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format IELTS band score from integer (e.g., 65 -> "6.5")
  const formatBandScore = (scoreInt) => {
    if (scoreInt === null || scoreInt === undefined) return '0.0';
    const bandScore = scoreInt / 10.0;
    return bandScore.toFixed(1);
  };

  // Check if result is IELTS test
  const isIeltsTest = (result) => {
    return result?.testType === 'IELTS';
  };

  // Get display score for result (band score for IELTS, percentage for TOEIC)
  const getDisplayScore = (result) => {
    if (isIeltsTest(result)) {
      // For IELTS, show overall band score from totalScore
      if (result.totalScore !== null && result.totalScore !== undefined) {
        return formatBandScore(result.totalScore);
      }
      // Fallback: calculate from listening and reading
      const listeningBand = result.listeningScore ? result.listeningScore / 10.0 : 0;
      const readingBand = result.readingScore ? result.readingScore / 10.0 : 0;
      if (listeningBand === 0 && readingBand === 0) return '0.0';
      const average = (listeningBand + readingBand) / 2.0;
      return (Math.round(average * 2) / 2).toFixed(1);
    }
    // For TOEIC, show percentage
    return getPercentage(result.totalCorrectAnswers, result.totalQuestions) + '%';
  };

  // Get score color based on test type
  const getScoreColor = (result) => {
    if (isIeltsTest(result)) {
      const bandScore = parseFloat(getDisplayScore(result));
      if (bandScore >= 7.0) return 'text-green-600';
      if (bandScore >= 6.0) return 'text-yellow-600';
      return 'text-red-600';
    }
    const percentage = getPercentage(result.totalCorrectAnswers, result.totalQuestions);
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get score background color based on test type
  const getScoreBgColor = (result) => {
    if (isIeltsTest(result)) {
      const bandScore = parseFloat(getDisplayScore(result));
      if (bandScore >= 7.0) return 'bg-green-50 border-green-200';
      if (bandScore >= 6.0) return 'bg-yellow-50 border-yellow-200';
      return 'bg-red-50 border-red-200';
    }
    const percentage = getPercentage(result.totalCorrectAnswers, result.totalQuestions);
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPercentage = (correct, total) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const isPassed = (result) => {
    if (isIeltsTest(result)) {
      const bandScore = parseFloat(getDisplayScore(result));
      return bandScore >= 6.0; // IELTS passing is typically 6.0+
    }
    return getPercentage(result.totalCorrectAnswers, result.totalQuestions) >= 60;
  };

  const filteredAndSortedResults = () => {
    let filtered = results;

    // Filter by pass/fail
    if (filter === 'passed') {
      filtered = filtered.filter(r => isPassed(r));
    } else if (filter === 'failed') {
      filtered = filtered.filter(r => !isPassed(r));
    }

    // Search by test name
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.testName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.completeTime) - new Date(a.completeTime)
      );
    } else if (sortBy === 'score') {
      filtered = [...filtered].sort((a, b) => {
        const scoreA = getPercentage(a.totalCorrectAnswers, a.totalQuestions);
        const scoreB = getPercentage(b.totalCorrectAnswers, b.totalQuestions);
        return scoreB - scoreA;
      });
    }

    return filtered;
  };

  const groupResultsByTest = (results) => {
    const grouped = {};
    results.forEach(result => {
      const testId = result.testId;
      if (!grouped[testId]) {
        grouped[testId] = {
          testId: testId,
          testName: result.testName,
          results: []
        };
      }
      grouped[testId].results.push(result);
    });
    return Object.values(grouped);
  };

  const filteredResults = filteredAndSortedResults();
  const groupedResults = groupResultsByTest(filteredResults);

  const totalAttempts = results.length;
  const passedAttempts = results.filter(r => isPassed(r)).length;
  const averageScore = results.length > 0
    ? results.reduce((sum, r) => {
        if (isIeltsTest(r)) {
          const bandScore = parseFloat(getDisplayScore(r));
          return sum + bandScore;
        }
        return sum + getPercentage(r.totalCorrectAnswers, r.totalQuestions);
      }, 0) / results.length
    : 0;
  
  // Format average score based on test types
  const formatAverageScore = () => {
    if (results.length === 0) return '0';
    const hasIelts = results.some(r => isIeltsTest(r));
    if (hasIelts) {
      return averageScore.toFixed(1);
    }
    return Math.round(averageScore) + '%';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Test Results</h1>
          <p className="text-gray-600">View all your test attempts and track your progress</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Passed Tests</p>
                <p className="text-3xl font-bold text-green-600">{passedAttempts}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className={`text-3xl font-bold ${results.length > 0 && isIeltsTest(results[0]) ? getScoreColor(results[0]) : getScoreColor({ totalCorrectAnswers: Math.round(averageScore), totalQuestions: 100 })}`}>
                  {formatAverageScore()}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Test</label>
              <input
                type="text"
                placeholder="Search by test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter by status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Results</option>
                <option value="passed">Passed (≥60%)</option>
                <option value="failed">Failed (&lt;60%)</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Latest First</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No results found</p>
            <p className="text-gray-500 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Start taking tests to see your results here'
              }
            </p>
            <button
              onClick={() => navigate('/tests')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Tests
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedResults.map(group => (
              <div key={group.testId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{group.testName}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.results.length} attempt{group.results.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/tests/${group.testId}`)}
                      className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Test →
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {group.results.map((result, index) => {
                    const displayScore = getDisplayScore(result);
                    const isIelts = isIeltsTest(result);
                    return (
                      <div
                        key={result.resultId || index}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/exam-results/${result.resultId}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              {/* Score Badge */}
                              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 ${getScoreBgColor(result)}`}>
                                <span className={`text-xl font-bold ${getScoreColor(result)}`}>
                                  {displayScore}
                                </span>
                              </div>

                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-gray-600">
                                    {new Date(result.completeTime).toLocaleString('vi-VN')}
                                  </span>
                                  {isIelts && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                      IELTS
                                    </span>
                                  )}
                                  {isPassed(result) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Passed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      Failed
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  {isIelts ? (
                                    <>
                                      {result.listeningScore && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                          </svg>
                                          Listening: <span className="font-semibold text-blue-600">{formatBandScore(result.listeningScore)}</span>
                                        </span>
                                      )}
                                      {result.readingScore && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                          </svg>
                                          Reading: <span className="font-semibold text-purple-600">{formatBandScore(result.readingScore)}</span>
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Correct: <span className="font-semibold text-green-600">{result.totalCorrectAnswers}</span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Wrong: <span className="font-semibold text-red-600">{result.totalQuestions - result.totalCorrectAnswers}</span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Total: <span className="font-semibold">{result.totalQuestions}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Part Results */}
                            {result.partResults && result.partResults.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">Performance by Part:</p>
                                <div className="flex flex-wrap gap-2">
                                  {result.partResults.map((part, idx) => {
                                    const partPercentage = part.totalQuestions > 0
                                      ? Math.round((part.correctAnswers / part.totalQuestions) * 100)
                                      : 0;
                                    return (
                                      <div key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs">
                                        <span className="text-gray-700 font-medium">{part.partName}</span>
                                        <span className={`font-semibold ${isIelts ? getScoreColor(result) : (partPercentage >= 80 ? 'text-green-600' : partPercentage >= 60 ? 'text-yellow-600' : 'text-red-600')}`}>
                                          {isIelts ? `${part.correctAnswers}/${part.totalQuestions}` : `${partPercentage}%`}
                                        </span>
                                        {!isIelts && (
                                          <span className="text-gray-500">
                                            ({part.correctAnswers}/{part.totalQuestions})
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* View Details Button */}
                          <div className="ml-6">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyResults;
