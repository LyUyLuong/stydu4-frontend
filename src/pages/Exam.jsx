import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import testService from '../services/testService';

function Exam() {
  const { testId, mode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [startedAt, setStartedAt] = useState(null); // ✅ NEW: Track exam start time

  const selectedParts = location.state?.selectedParts || [];

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Please login to take the exam');
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    loadExam();
  }, [testId, mode]);

  // ✅ NEW: Initialize or restore exam start time
  useEffect(() => {
    if (!testId) return;

    const storageKey = `exam_${testId}_${mode}_startedAt`;
    const savedStartTime = localStorage.getItem(storageKey);

    if (savedStartTime) {
      // Restore start time if browser was refreshed
      setStartedAt(savedStartTime);
      console.log('Exam start time restored from localStorage:', savedStartTime);
    } else {
      // New exam start - save timestamp
      const now = new Date().toISOString();
      setStartedAt(now);
      localStorage.setItem(storageKey, now);
      console.log('Exam start time initialized:', now);
    }

    // Cleanup function to remove start time on unmount (when navigating away)
    return () => {
      // Don't cleanup here - we need it to survive refresh
    };
  }, [testId, mode]);

  // Prevent accidental page reload/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if user has answered at least one question
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers]);

  const loadExam = async () => {
    try {
      setLoading(true);
      let response;
      
      if (mode === 'full') {
        response = await testService.getTestQuestions(testId);
      } else {
        response = await testService.getPracticeQuestions(testId, selectedParts);
      }
      
      const result = response.result;
      
      // Sort parts by part number (Part 1, Part 2, ..., Part 7)
      if (result && result.parts) {
        response.result.parts.sort((a, b) => {
          const getPartNumber = (partName) => {
            if (!partName) return 999;
            const match = partName.match(/part\s*(\d+)/i);
            return match ? parseInt(match[1]) : 999;
          };
          return getPartNumber(a.partName) - getPartNumber(b.partName);
        });
        
        response.result.parts.forEach(part => {
          // Sort individual questions by question name/number
          if (part.questions) {
            part.questions.sort((a, b) => {
              const getQuestionNumber = (questionName) => {
                if (!questionName) return 999;
                const match = questionName.match(/(\d+)/);
                return match ? parseInt(match[1]) : 999;
              };
              return getQuestionNumber(a.name) - getQuestionNumber(b.name);
            });
            
            // Sort answers by mark (A, B, C, D) for each question
            part.questions.forEach(question => {
              if (question.answers) {
                question.answers.sort((a, b) => {
                  const markA = (a.mark || '').toUpperCase();
                  const markB = (b.mark || '').toUpperCase();
                  return markA.localeCompare(markB);
                });
              }
            });
          }
          
          // Sort question groups and questions within groups
          if (part.questionGroups) {
            // Sort question groups by group name/number
            part.questionGroups.sort((a, b) => {
              const getGroupNumber = (groupName) => {
                if (!groupName) return 999;
                const match = groupName.match(/(\d+)/);
                return match ? parseInt(match[1]) : 999;
              };
              return getGroupNumber(a.questionGroupName) - getGroupNumber(b.questionGroupName);
            });
            
            part.questionGroups.forEach(group => {
              if (group.questions) {
                // Sort questions within the group
                group.questions.sort((a, b) => {
                  const getQuestionNumber = (questionName) => {
                    if (!questionName) return 999;
                    const match = questionName.match(/(\d+)/);
                    return match ? parseInt(match[1]) : 999;
                  };
                  return getQuestionNumber(a.name) - getQuestionNumber(b.name);
                });
                
                // Sort answers for each question
                group.questions.forEach(question => {
                  if (question.answers) {
                    question.answers.sort((a, b) => {
                      const markA = (a.mark || '').toUpperCase();
                      const markB = (b.mark || '').toUpperCase();
                      return markA.localeCompare(markB);
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      setExam(response.result);
    } catch (error) {
      toast.error('Failed to load exam');
      console.error('Error loading exam:', error);
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleTextAnswerChange = (questionId, textValue) => {
    // For FILL_IN_BLANK, store the text value
    // We'll match it with the correct answer when submitting
    setAnswers(prev => ({
      ...prev,
      [questionId]: textValue
    }));
  };

  const submitExam = async () => {
    try {
      setSubmitting(true);

      // ✅ NEW: Validate startedAt before submitting
      if (!startedAt) {
        toast.error('Cannot determine exam start time. Please refresh and try again.');
        console.error('startedAt is null - cannot submit exam');
        setSubmitting(false);
        setShowConfirmSubmit(false);
        return;
      }

      // ✅ NEW: Calculate actual duration from client side (more accurate)
      const startTime = new Date(startedAt).getTime();
      const endTime = new Date().getTime();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      console.log('Exam duration calculated on client:', durationSeconds, 'seconds');

      // Process answers: for FILL_IN_BLANK, find matching answer ID
      const answersArray = Object.entries(answers)
        .filter(([_, answerValue]) => answerValue != null && answerValue !== '')
        .map(([questionId, answerValue]) => {
          // Find the question to check its type
          let question = null;
          for (const part of exam.parts) {
            // Check individual questions
            question = part.questions?.find(q => q.id === questionId);
            if (question) break;

            // Check questions in question groups
            if (part.questionGroups) {
              for (const group of part.questionGroups) {
                question = group.questions?.find(q => q.id === questionId);
                if (question) break;
              }
              if (question) break;
            }
          }

          if (question && question.type === 'FILL_IN_BLANK') {
            // For FILL_IN_BLANK, match text with answer content (case-insensitive)
            const userText = String(answerValue).trim().toLowerCase();
            const matchingAnswer = question.answers?.find(ans =>
              ans.content?.trim().toLowerCase() === userText
            );

            return {
              questionId: String(questionId),
              answerId: matchingAnswer ? String(matchingAnswer.id) : String(answerValue)
            };
          }

          // For MULTIPLE_CHOICE, answerId is already correct
          return {
            questionId: String(questionId),
            answerId: String(answerValue)
          };
        });

      // ✅ NEW: Include startedAt and duration in the submission
      const response = await testService.submitTest(
        testId,
        answersArray,
        mode === 'practice' ? selectedParts : null,
        startedAt,  // ✅ Pass start time to backend
        durationSeconds  // ✅ Pass actual duration from client
      );

      toast.success('Exam submitted successfully!');

      // ✅ NEW: Clean up localStorage after successful submit
      const storageKey = `exam_${testId}_${mode}_startedAt`;
      localStorage.removeItem(storageKey);
      console.log('Cleaned up exam start time from localStorage');

      // Use resultId instead of id
      const resultId = response.result?.resultId;
      if (resultId) {
        navigate(`/exam-results/${resultId}`);
      } else {
        console.error('No resultId in response:', response);
        toast.error('Failed to get result ID');
      }
    } catch (error) {
      // Check if it's a rate limit error
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.message || 'Bạn đã nộp bài quá nhiều lần. Vui lòng chờ một chút và thử lại.', {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit exam');
      }
      console.error('Error submitting exam:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Detect part type from part name
  const getPartType = (partName) => {
    if (!partName) return 'unknown';
    const name = partName.toLowerCase();
    if (name.includes('part 1') || name.includes('part1')) return 'part1';
    if (name.includes('part 2') || name.includes('part2')) return 'part2';
    if (name.includes('part 3') || name.includes('part3')) return 'part3';
    if (name.includes('part 4') || name.includes('part4')) return 'part4';
    if (name.includes('part 5') || name.includes('part5')) return 'part5';
    if (name.includes('part 6') || name.includes('part6')) return 'part6';
    if (name.includes('part 7') || name.includes('part7')) return 'part7';
    return 'unknown';
  };

  const getCurrentPart = () => {
    if (!exam || !exam.parts || exam.parts.length === 0) return null;
    return exam.parts[currentPartIndex];
  };

  const getTotalQuestions = () => {
    if (!exam || !exam.parts) return 0;
    
    let total = 0;
    exam.parts.forEach(part => {
      // Count questions in questionGroups
      if (part.questionGroups && part.questionGroups.length > 0) {
        part.questionGroups.forEach(group => {
          total += group.questions?.length || 0;
        });
      }
      // Count individual questions
      if (part.questions && part.questions.length > 0) {
        total += part.questions.length;
      }
    });
    
    return total;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const canGoPrevious = () => {
    return currentPartIndex > 0;
  };

  const canGoNext = () => {
    return currentPartIndex < exam.parts.length - 1;
  };

  const handlePrevious = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPartIndex < exam.parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper: extract question number from name (e.g. "Q7" -> "7", "Q32" -> "32")
  const getDisplayNumber = (name) => {
    if (!name) return '?';
    const match = name.match(/(\d+)/);
    return match ? match[1] : '?';
  };

  // Render entire part at once
  const renderContent = () => {
    const part = getCurrentPart();
    
    if (!part) return null;

    const partType = getPartType(part.partName);

    return (
      <div className="space-y-8">
        {/* Part with Question Groups (Part 3, 4, 6, 7) */}
        {part.questionGroups && part.questionGroups.length > 0 ? (
          part.questionGroups.map((group, groupIndex) => (
            <div key={group.id || groupIndex} className="border-b pb-8 last:border-b-0">
              <div className="mb-6 bg-blue-50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-blue-900">
                  {(() => {
                    const nums = (group.questions || []).map(q => {
                      const m = q.name?.match(/(\d+)/);
                      return m ? parseInt(m[1]) : null;
                    }).filter(n => n !== null).sort((a, b) => a - b);
                    if (nums.length > 1) return `Questions ${nums[0]} - ${nums[nums.length - 1]}`;
                    if (nums.length === 1) return `Question ${nums[0]}`;
                    return `Question Group ${groupIndex + 1}`;
                  })()}
                  {group.questions?.length > 0 && ` (${group.questions.length} questions)`}
                </p>
              </div>
              
              {partType === 'part3' || partType === 'part4' 
                ? renderPart3Or4(group)
                : renderPart6Or7(group)
              }
            </div>
          ))
        ) : (
          /* Part with Individual Questions (Part 1, 2, 5) */
          part.questions && part.questions.map((question, questionIndex) => (
            <div key={question.id} className="border-b pb-8 last:border-b-0">
              <div className="mb-6 bg-blue-50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-blue-900">Question {getDisplayNumber(question.name)}</p>
              </div>
              
              {partType === 'part1' 
                ? renderPart1(question)
                : partType === 'part2'
                ? renderPart2(question)
                : renderPart5(question)
              }
            </div>
          ))
        )}
      </div>
    );
  };

  // Part 1: Image + Answers A/B/C/D only (no answer content)
  const renderPart1 = (question) => {
    return (
      <div className="space-y-6">
        {/* Question Image */}
        {question.imageUrl && (
          <div className="flex justify-center mb-6">
            <img 
              src={question.imageUrl} 
              alt="Question" 
              className="max-w-lg rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Answers - Only letters A/B/C/D */}
        <div className="grid grid-cols-2 gap-4">
          {question.answers && question.answers.map((answer) => (
            <label
              key={answer.id}
              className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                answers[question.id] === answer.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={answer.id}
                checked={answers[question.id] === answer.id}
                onChange={() => handleAnswerSelect(question.id, answer.id)}
                className="sr-only"
              />
              <span className="text-3xl font-bold">
                {answer.mark}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Part 2: Answers A/B/C only (no content)
  const renderPart2 = (question) => {
    return (
      <div className="space-y-6">
        {/* Answers - Only letters A/B/C */}
        <div className="grid grid-cols-3 gap-4">
          {question.answers && question.answers.slice(0, 3).map((answer) => (
            <label
              key={answer.id}
              className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                answers[question.id] === answer.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={answer.id}
                checked={answers[question.id] === answer.id}
                onChange={() => handleAnswerSelect(question.id, answer.id)}
                className="sr-only"
              />
              <span className="text-3xl font-bold">
                {answer.mark}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Part 3, 4: Question Group with audio/image + questions with content
  const renderPart3Or4 = (questionGroup) => {
    return (
      <div className="space-y-6">
        {/* Question Group Image */}
        {questionGroup.imageUrl && (
          <div className="flex justify-center mb-6">
            <img 
              src={questionGroup.imageUrl} 
              alt="Question Group" 
              className="max-w-md rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Questions in Group */}
        {questionGroup.questions && questionGroup.questions.map((question, qIndex) => (
          <div key={question.id} className="border-t pt-6 first:border-t-0 first:pt-0">
            {/* Question Content */}
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {getDisplayNumber(question.name)}. {question.content}
              </p>
            </div>

            {/* Render answers based on question type */}
            <div className="ml-4">
              {renderAnswerInput(question)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Part 5: Incomplete Sentences - Single question with content
  const renderPart5 = (question) => {
    return (
      <div className="space-y-6">
        {/* Question Content */}
        {question.content && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-lg text-gray-900 whitespace-pre-wrap">{question.content}</p>
          </div>
        )}

        {/* Render answers based on question type */}
        {renderAnswerInput(question)}
      </div>
    );
  };

  // Part 6, 7: Reading Comprehension - Question Group with passage
  const renderPart6Or7 = (questionGroup) => {
    return (
      <div className="space-y-6">
        {/* Question Group Image (if any) */}
        {questionGroup.imageUrl && (
          <div className="flex justify-center mb-6">
            <img 
              src={questionGroup.imageUrl} 
              alt="Passage" 
              className="max-w-2xl rounded-lg shadow-md w-full"
            />
          </div>
        )}

        {/* Passage Content */}
        {questionGroup.content && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {questionGroup.content}
            </p>
          </div>
        )}

        {/* Questions in Group */}
        {questionGroup.questions && questionGroup.questions.map((question, qIndex) => (
          <div key={question.id} className="border-t pt-6 first:border-t-0 first:pt-0">
            {/* Question Content */}
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {getDisplayNumber(question.name)}. {question.content}
              </p>
            </div>

            {/* Render answers based on question type */}
            <div className="ml-4">
              {renderAnswerInput(question)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render answer input based on question type
  const renderAnswerInput = (question) => {
    const questionType = question.type || 'MULTIPLE_CHOICE';

    if (questionType === 'FILL_IN_BLANK') {
      // Render text input for fill-in-blank questions
      const userAnswer = answers[question.id] || '';

      return (
        <div className="space-y-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Your answer:</span>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="mt-2 block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 focus:ring focus:ring-primary-200 transition-all"
            />
          </label>
          <p className="text-sm text-gray-500">
            Hint: Answer should match exactly (case-insensitive)
          </p>
        </div>
      );
    }

    // Default: render multiple choice (radio buttons)
    return (
      <div className="space-y-3">
        {question.answers && question.answers.map((answer) => (
          <label
            key={answer.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              answers[question.id] === answer.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={answer.id}
              checked={answers[question.id] === answer.id}
              onChange={() => handleAnswerSelect(question.id, answer.id)}
              className="w-5 h-5 text-primary-600 mt-0.5"
            />
            <span className="ml-3">
              <span className="font-semibold mr-2">({answer.mark})</span>
              <span className="text-gray-700">{answer.content}</span>
            </span>
          </label>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam not found</h2>
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

  const part = getCurrentPart();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              You have answered {getAnsweredCount()} out of {getTotalQuestions()} questions.
              Are you sure you want to submit?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.testName}</h1>
              <p className="text-gray-600 mt-1">
                {mode === 'full' ? 'Full Test' : 'Practice Mode'}
                {part && ` - ${part.partName}`}
              </p>
            </div>
          </div>

          {/* Test Audio (if available) */}
          {exam.audioUrl && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Test Audio</p>
              <audio controls className="w-full">
                <source src={exam.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* Progress */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>Progress: {getAnsweredCount()} / {getTotalQuestions()} answered</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderContent()}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={handlePrevious}
                  disabled={!canGoPrevious()}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {canGoNext() ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              
              {/* Questions Progress Summary */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Questions Progress</p>
                <p className="text-lg font-bold text-blue-600">
                  {getAnsweredCount()} / {getTotalQuestions()}
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getTotalQuestions() > 0 ? (getAnsweredCount() / getTotalQuestions()) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                {exam.parts && exam.parts.map((p, pIndex) => {
                  // Calculate total questions in this part
                  let partQuestionCount = 0;
                  
                  // Count questions in question groups
                  if (p.questionGroups && p.questionGroups.length > 0) {
                    partQuestionCount += p.questionGroups.reduce((sum, group) => sum + (group.questions?.length || 0), 0);
                  }
                  
                  // Count individual questions
                  if (p.questions && p.questions.length > 0) {
                    partQuestionCount += p.questions.length;
                  }
                  
                  // Calculate answered questions in this part
                  let partAnsweredCount = 0;
                  
                  // Count answered questions in question groups
                  if (p.questionGroups && p.questionGroups.length > 0) {
                    p.questionGroups.forEach(group => {
                      group.questions?.forEach(q => {
                        if (answers[q.id]) partAnsweredCount++;
                      });
                    });
                  }
                  
                  // Count answered individual questions
                  if (p.questions && p.questions.length > 0) {
                    p.questions.forEach(q => {
                      if (answers[q.id]) partAnsweredCount++;
                    });
                  }
                  
                  const isActive = pIndex === currentPartIndex;
                  const isFullyAnswered = partAnsweredCount === partQuestionCount && partQuestionCount > 0;
                  const isPartiallyAnswered = partAnsweredCount > 0 && partAnsweredCount < partQuestionCount;
                  
                  return (
                    <div key={p.partId} className="border-b pb-4 last:border-b-0">
                      <button
                        onClick={() => setCurrentPartIndex(pIndex)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isFullyAnswered
                            ? 'bg-green-50 hover:bg-green-100'
                            : isPartiallyAnswered
                            ? 'bg-yellow-50 hover:bg-yellow-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {p.partName}
                            </h4>
                            <p className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                              {partAnsweredCount} / {partQuestionCount} answered
                            </p>
                          </div>
                          
                          {/* Status Indicator */}
                          <div className="flex items-center gap-2">
                            {isFullyAnswered && !isActive && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            {isPartiallyAnswered && !isActive && (
                              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                            {isActive && (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Current Part</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 rounded border border-green-200"></div>
                  <span className="text-gray-600">All answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-50 rounded border border-yellow-200"></div>
                  <span className="text-gray-600">Partially answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded border border-gray-300"></div>
                  <span className="text-gray-600">Not answered</span>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exam;
