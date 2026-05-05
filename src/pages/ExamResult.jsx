import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import testService from '../services/testService';
import ExamReview from '../components/exam/ExamReview';

function ExamResult() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'review'
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await testService.getExamResult(resultId);
      console.log('Exam Result Response:', response.result);
      console.log('Test Type:', response.result?.testType);
      setResult(response.result);
    } catch (error) {
      toast.error('Failed to load exam result');
      console.error('Error loading result:', error);
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (totalScore, totalQuestions) => {
    const percentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (totalScore, totalQuestions) => {
    const percentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPercentage = (totalScore, totalQuestions) => {
    return totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  };

  // Format IELTS band score from integer (e.g., 65 -> "6.5")
  const formatBandScore = (scoreInt) => {
    if (scoreInt === null || scoreInt === undefined) return '0.0';
    const bandScore = scoreInt / 10.0;
    return bandScore.toFixed(1);
  };

  // Check if this is an IELTS test
  const isIeltsTest = () => {
    return result?.testType === 'IELTS';
  };

  // Get proficiency level for IELTS band score
  const getIeltsProficiencyLevel = (bandScore) => {
    if (bandScore >= 9.0) return 'Expert User';
    if (bandScore >= 8.0) return 'Very Good User';
    if (bandScore >= 7.0) return 'Good User';
    if (bandScore >= 6.0) return 'Competent User';
    if (bandScore >= 5.0) return 'Modest User';
    if (bandScore >= 4.0) return 'Limited User';
    if (bandScore >= 3.0) return 'Extremely Limited User';
    if (bandScore >= 1.0) return 'Intermittent User';
    return 'Non User';
  };

  // Get overall IELTS band score
  // Use totalScore from backend (already calculated as overall band score for IELTS)
  const getOverallBandScore = () => {
    if (!isIeltsTest()) return null;
    // Backend already calculates overall band score in totalScore for IELTS
    if (result.totalScore !== null && result.totalScore !== undefined) {
      return result.totalScore / 10.0;
    }
    // Fallback: calculate from listening and reading if totalScore not available
    const listeningBand = result.listeningScore ? result.listeningScore / 10.0 : 0;
    const readingBand = result.readingScore ? result.readingScore / 10.0 : 0;
    if (listeningBand === 0 && readingBand === 0) return 0;
    const average = (listeningBand + readingBand) / 2.0;
    // Round to nearest 0.5
    return Math.round(average * 2) / 2;
  };

  // Format duration string (e.g., "195s" -> "3 phút 15 giây")
  const formatDuration = (durationStr) => {
    if (!durationStr) return 'N/A';
    
    // Parse duration string like "195s"
    const match = durationStr.match(/^(\d+)s$/);
    if (!match) return durationStr;
    
    const totalSeconds = parseInt(match[1]);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0) parts.push(`${seconds} giây`);
    
    return parts.length > 0 ? parts.join(' ') : '0 giây';
  };

  const toggleQuestionDetail = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Helper function to extract part number from part name
  const getPartNumber = (partName) => {
    if (!partName) return 999; // Put questions without part at the end
    const match = partName.match(/part\s*(\d+)/i);
    return match ? parseInt(match[1]) : 999;
  };

  // Sort questions by part number, then by question number within each part
  const getSortedQuestions = (questions) => {
    if (!questions || questions.length === 0) return [];
    
    // Create a map to group questions by part and maintain order
    const partMap = new Map();
    questions.forEach((question, originalIndex) => {
      const partNum = getPartNumber(question.partName);
      if (!partMap.has(partNum)) {
        partMap.set(partNum, []);
      }
      partMap.get(partNum).push({ ...question, originalIndex });
    });
    
    // Sort parts by part number
    const sortedParts = Array.from(partMap.entries()).sort((a, b) => a[0] - b[0]);
    
    // Sort questions within each part by question number, then flatten
    const sortedQuestions = sortedParts.flatMap(([partNum, partQuestions]) => {
      return partQuestions.sort((a, b) => {
        const getQNum = (content) => {
          if (!content) return 999;
          const match = content.match(/question\s*(\d+)/i);
          return match ? parseInt(match[1]) : 999;
        };
        return getQNum(a.questionContent) - getQNum(b.questionContent);
      });
    });
    
    return sortedQuestions;
  };

  // Check if any question has review data (explanation, vocabulary, or grammar)
  const hasReviewData = () => {
    return result?.questionResults?.some(q => 
      q.explanation || 
      (q.vocabularyWords && q.vocabularyWords.length > 0) ||
      (q.grammarPoints && q.grammarPoints.length > 0)
    );
  };

  // Navigate review questions
  const goToNextQuestion = () => {
    if (reviewQuestionIndex < result.questionResults.length - 1) {
      setReviewQuestionIndex(reviewQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (reviewQuestionIndex > 0) {
      setReviewQuestionIndex(reviewQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Result not found</h2>
          <button
            onClick={() => navigate('/tests')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            {isIeltsTest() ? (
              // IELTS Header - Show band score
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {getOverallBandScore().toFixed(1)}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {getIeltsProficiencyLevel(getOverallBandScore())}
                </h1>

                <p className="text-gray-600 mb-2">{result.testName}</p>
                <p className="text-sm text-gray-500 mb-4">Overall Band Score</p>
              </>
            ) : (
              // TOEIC Header - Show total score
              <>
                <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
                  <span className="text-4xl font-bold text-white">
                    {result.totalScore || 0}
                  </span>
                  <span className="text-xs text-blue-100 mt-1">/ 990</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.totalScore >= 800 ? 'Excellent!' :
                   result.totalScore >= 600 ? 'Good Job!' :
                   result.totalScore >= 400 ? 'Keep Practicing!' : 'Keep Trying!'}
                </h1>

                <p className="text-gray-600 mb-4">{result.testName}</p>
              </>
            )}

            <div className="flex items-center justify-center gap-8 text-sm">
              <div>
                <p className="text-gray-600">Thời gian hoàn thành</p>
                <p className="font-semibold text-gray-900">
                  {formatDuration(result.completeTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('results')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeTab === 'results'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Kết quả tổng quan
                </div>
              </button>
              
              {hasReviewData() && (
                <button
                  onClick={() => setActiveTab('review')}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors relative ${
                    activeTab === 'review'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Ôn tập chi tiết
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      New!
                    </span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Score Summary */}
        {activeTab === 'results' && (
          <>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Score Summary</h2>

          {isIeltsTest() ? (
            // IELTS Score Summary - Show band scores
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.listeningScore !== null && result.listeningScore !== undefined && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">Listening Band Score</p>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{formatBandScore(result.listeningScore)}</p>
                    <p className="text-xs text-gray-500">
                      {result.listeningCorrectAnswers || 0} / {result.listeningQuestions || result.totalQuestions || 0} correct
                    </p>
                  </div>
                )}

                {result.readingScore !== null && result.readingScore !== undefined && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">Reading Band Score</p>
                    <p className="text-3xl font-bold text-purple-600 mb-2">{formatBandScore(result.readingScore)}</p>
                    <p className="text-xs text-gray-500">
                      {result.readingCorrectAnswers || 0} / {result.readingQuestions || result.totalQuestions || 0} correct
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center border-2 border-blue-200">
                <p className="text-gray-600 text-sm mb-2">Overall Band Score</p>
                <p className="text-5xl font-bold text-blue-600 mb-2">{getOverallBandScore().toFixed(1)}</p>
                <p className="text-sm font-medium text-gray-700">{getIeltsProficiencyLevel(getOverallBandScore())}</p>
              </div>
            </div>
          ) : (
            // TOEIC Score Summary - Show traditional scores
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900">{result.totalQuestions}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600">{result.totalCorrectAnswers}</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Incorrect Answers</p>
                <p className="text-3xl font-bold text-red-600">{result.totalQuestions - result.totalCorrectAnswers}</p>
              </div>

              {/* TOEIC Listening/Reading Scores if available */}
              {(result.listeningScore || result.readingScore) && (
                <>
                  {result.listeningScore && (
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm mb-1">Listening Score</p>
                      <p className="text-3xl font-bold text-blue-600">{result.listeningScore}</p>
                      <p className="text-xs text-gray-500">Out of 495</p>
                    </div>
                  )}

                  {result.readingScore && (
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm mb-1">Reading Score</p>
                      <p className="text-3xl font-bold text-purple-600">{result.readingScore}</p>
                      <p className="text-xs text-gray-500">Out of 495</p>
                    </div>
                  )}

                  {result.listeningScore && result.readingScore && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center border-2 border-blue-200">
                      <p className="text-gray-600 text-sm mb-1">Total Score</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {result.totalScore !== null && result.totalScore !== undefined 
                          ? result.totalScore 
                          : result.listeningScore + result.readingScore}
                      </p>
                      <p className="text-xs text-gray-500">Out of 990</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Part-wise Results */}
        {result.partResults && result.partResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Part</h2>
            
            <div className="space-y-4">
              {result.partResults.map((part, index) => {
                if (isIeltsTest()) {
                  // IELTS: Show correct/total format, no percentage
                  const accuracy = part.totalQuestions > 0 ? (part.correctAnswers / part.totalQuestions) : 0;
                  // Color based on accuracy (similar to band score thresholds)
                  const getColorClass = () => {
                    if (accuracy >= 0.78) return { text: 'text-green-600', bg: 'bg-green-500' }; // ~7.0+
                    if (accuracy >= 0.67) return { text: 'text-yellow-600', bg: 'bg-yellow-500' }; // ~6.0+
                    return { text: 'text-red-600', bg: 'bg-red-500' }; // Below 6.0
                  };
                  const colors = getColorClass();
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{part.partName}</h3>
                        <span className={`font-bold text-lg ${colors.text}`}>
                          {part.correctAnswers} / {part.totalQuestions}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${colors.bg}`}
                          style={{ width: `${accuracy * 100}%` }}
                        ></div>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Correct answers: {part.correctAnswers} out of {part.totalQuestions} questions
                      </p>
                    </div>
                  );
                } else {
                  // TOEIC: Show percentage
                  const percentage = part.totalQuestions > 0 ? Math.round((part.correctAnswers / part.totalQuestions) * 100) : 0;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{part.partName}</h3>
                        <span className={`font-bold ${
                          percentage >= 80 ? 'text-green-600' :
                          percentage >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            percentage >= 80 ? 'bg-green-500' :
                            percentage >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {part.correctAnswers} / {part.totalQuestions} correct
                      </p>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Detailed Answers */}
        {result.questionResults && result.questionResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Question-by-Question Review</h2>
            
            <div className="space-y-2">
              {getSortedQuestions(result.questionResults).map((question, index) => {
                const isExpanded = expandedQuestions.has(question.questionId);
                
                return (
                  <div
                    key={question.questionId || index}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${
                      question.isCorrect 
                        ? 'border-green-200 hover:border-green-300' 
                        : 'border-red-200 hover:border-red-300'
                    }`}
                  >
                    {/* Collapsed View - Always Visible */}
                    <button
                      onClick={() => toggleQuestionDetail(question.questionId)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        question.isCorrect ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Question Number */}
                          <span className="font-bold text-gray-700 min-w-[60px]">
                            Câu {index + 1}
                          </span>
                          
                          {/* Part Badge (if available) */}
                          {question.partName && (
                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                              {question.partName}
                            </span>
                          )}
                          
                          {/* Answer Info */}
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            {/* Always show correct answer */}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Đáp án đúng:</span>
                              <span className="font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded max-w-xs truncate">
                                {question.correctAnswerContent || 'N/A'}
                              </span>
                            </div>
                            
                            {/* Show user answer - different display for correct/incorrect */}
                            {question.isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Chính xác
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Bạn chọn:</span>
                                <span className="font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded max-w-xs truncate">
                                  {question.userAnswerContent || 'Không trả lời'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Expand/Collapse Icon */}
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {isExpanded ? 'Ẩn' : 'Xem'}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded View - Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-white p-6">
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <p>Debug Info:</p>
                            <p>User Answer ID: {question.userAnswerId}</p>
                            <p>Correct Answer ID: {question.correctAnswerId}</p>
                          </div>
                        )}
                        
                        {/* Part Name */}
                        {question.partName && (
                          <div className="mb-4 pb-4 border-b">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {question.partName}
                            </span>
                          </div>
                        )}

                        {/* Question Content */}
                        {question.questionContent && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Câu hỏi:</h4>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded">{question.questionContent}</p>
                          </div>
                        )}

                        {/* Question Image */}
                        {question.imageUrl && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Hình ảnh:</h4>
                            <img
                              src={question.imageUrl}
                              alt={`Question ${index + 1}`}
                              className="max-w-md rounded-lg border border-gray-300 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Question Audio */}
                        {question.audioUrl && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Audio:</h4>
                            <audio controls className="w-full max-w-md">
                              <source src={question.audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}

                        {/* Answer Comparison */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-3">
                            {question.type === 'FILL_IN_BLANK' ? 'Câu trả lời:' : 'Các đáp án:'}
                          </h4>

                          {question.type === 'FILL_IN_BLANK' ? (
                            // Render FILL_IN_BLANK answer
                            <div className="space-y-3">
                              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                                <p className="text-sm text-gray-600 mb-1">Câu trả lời của bạn:</p>
                                <p className="text-lg font-medium text-gray-900">
                                  {question.userAnswer || <span className="text-gray-400 italic">(Chưa trả lời)</span>}
                                </p>
                              </div>

                              {question.correctAnswer && (
                                <div className={`p-4 rounded-lg border-2 ${
                                  question.isCorrect
                                    ? 'bg-green-50 border-green-500'
                                    : 'bg-red-50 border-red-500'
                                }`}>
                                  <p className="text-sm text-gray-600 mb-1">Đáp án đúng:</p>
                                  <p className="text-lg font-medium text-gray-900">{question.correctAnswer}</p>
                                  {question.isCorrect ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm mt-2">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Chính xác!
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm mt-2">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                      Sai rồi
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : question.allAnswers && question.allAnswers.length > 0 ? (
                            // Render MULTIPLE_CHOICE answers
                            <div className="space-y-2">
                              {question.allAnswers.map((answer, ansIdx) => {
                                const isCorrectAnswer = answer.isCorrect;
                                const isUserAnswer = answer.answerId === question.userAnswerId;
                                
                                // Debug log in development
                                if (process.env.NODE_ENV === 'development') {
                                  console.log(`Answer ${answer.mark}:`, {
                                    answerId: answer.answerId,
                                    isCorrect: answer.isCorrect,
                                    isUserAnswer: isUserAnswer,
                                    userAnswerId: question.userAnswerId,
                                    correctAnswerId: question.correctAnswerId
                                  });
                                }
                                
                                // Priority: User answer > Correct answer > Other
                                let borderColor, bgColor;
                                if (isUserAnswer && isCorrectAnswer) {
                                  // User selected correct answer - GREEN with thick border
                                  borderColor = 'border-green-500';
                                  bgColor = 'bg-green-50';
                                } else if (isUserAnswer) {
                                  // User selected wrong answer - RED
                                  borderColor = 'border-red-500';
                                  bgColor = 'bg-red-50';
                                } else if (isCorrectAnswer) {
                                  // Correct answer but user didn't select - LIGHT GREEN
                                  borderColor = 'border-green-300';
                                  bgColor = 'bg-green-50';
                                } else {
                                  // Other answers - GRAY
                                  borderColor = 'border-gray-200';
                                  bgColor = 'bg-gray-50 hover:bg-gray-100';
                                }
                                
                                return (
                                  <div
                                    key={ansIdx}
                                    className={`p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className={`font-bold text-lg min-w-[32px] ${
                                        isUserAnswer && isCorrectAnswer ? 'text-green-700' :
                                        isUserAnswer ? 'text-red-700' :
                                        isCorrectAnswer ? 'text-green-600' :
                                        'text-gray-600'
                                      }`}>
                                        {answer.mark}
                                      </span>
                                      
                                      <div className="flex-1">
                                        {answer.content ? (
                                          <p className="text-gray-900">{answer.content}</p>
                                        ) : (
                                          <p className="text-gray-500 italic">(No text content)</p>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-col items-end gap-1">
                                        {isUserAnswer && isCorrectAnswer ? (
                                          // User selected the correct answer
                                          <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Bạn chọn đúng
                                          </span>
                                        ) : isCorrectAnswer ? (
                                          // This is the correct answer but user didn't select it
                                          <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Đáp án đúng
                                          </span>
                                        ) : isUserAnswer ? (
                                          // User selected wrong answer
                                          <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm bg-red-100 px-2 py-1 rounded">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Bạn chọn sai
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Fallback nếu không có allAnswers
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Correct Answer */}
                              <div className="border-2 border-green-400 bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Đáp án đúng
                                </h4>
                                <p className="text-gray-900">{question.correctAnswerContent || 'N/A'}</p>
                              </div>

                              {/* User Answer */}
                              <div className={`border-2 rounded-lg p-4 ${
                                question.isCorrect 
                                  ? 'border-green-400 bg-green-50' 
                                  : 'border-red-400 bg-red-50'
                              }`}>
                                <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                                  question.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {question.isCorrect ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  Câu trả lời của bạn
                                </h4>
                                <p className="text-gray-900">{question.userAnswerContent || 'Không trả lời'}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Explanation (if available) */}
                        {question.explanation && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Giải thích:
                            </h4>
                            <p className="text-blue-900">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/tests')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Tests
          </button>
          <button
            onClick={() => navigate(`/tests/${result.testId}`)}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamResult;
