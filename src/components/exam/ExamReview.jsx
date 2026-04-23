import { useState } from 'react';
import PropTypes from 'prop-types';
import VocabularySidebar from './VocabularySidebar';
import GrammarPoints from './GrammarPoints';

/**
 * ExamReview Component
 * Displays detailed review of exam questions with:
 * - Explanations
 * - Highlighted passages
 * - Vocabulary extraction
 * - Grammar points
 */
function ExamReview({ question, questionNumber }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);

  // Helper to highlight text in passage
  const getHighlightedContent = () => {
    if (!question.questionContent) return null;
    
    if (question.highlightStart !== null && question.highlightEnd !== null) {
      const content = question.questionContent;
      const start = question.highlightStart;
      const end = question.highlightEnd;
      
      return (
        <div className="whitespace-pre-wrap">
          {content.substring(0, start)}
          <mark className="bg-yellow-200 font-semibold px-1 rounded">
            {content.substring(start, end)}
          </mark>
          {content.substring(end)}
        </div>
      );
    }
    
    return <div className="whitespace-pre-wrap">{question.questionContent}</div>;
  };

  // Handle word click in passage
  const handleWordClick = (word) => {
    // Find vocabulary item that matches the clicked word
    const vocabItem = question.vocabularyWords?.find(
      v => v.word.toLowerCase() === word.toLowerCase()
    );
    
    if (vocabItem) {
      setSelectedWord(vocabItem);
      setShowVocabulary(true);
    }
  };

  const hasVocabulary = question.vocabularyWords && question.vocabularyWords.length > 0;
  const hasGrammar = question.grammarPoints && question.grammarPoints.length > 0;
  const hasExplanation = question.explanation;

  return (
    <div className="space-y-6">
      {/* Header with Question Number */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Câu {questionNumber} - Chi tiết ôn tập
        </h3>
        
        {/* Quick Access Buttons */}
        <div className="flex gap-2">
          {hasVocabulary && (
            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showVocabulary
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              📚 Từ vựng ({question.vocabularyWords.length})
            </button>
          )}
          
          {hasGrammar && (
            <button
              onClick={() => setShowGrammar(!showGrammar)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showGrammar
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              📖 Ngữ pháp ({question.grammarPoints.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className={`${showVocabulary || showGrammar ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          {/* Question Content with Highlighting */}
          {question.questionContent && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Nội dung câu hỏi:
              </h4>
              <div className="text-gray-900 leading-relaxed text-base">
                {getHighlightedContent()}
              </div>
              
              {/* Vocabulary hints */}
              {hasVocabulary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">💡 Từ vựng trong câu hỏi:</p>
                  <div className="flex flex-wrap gap-2">
                    {question.vocabularyWords.map((vocab, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedWord(vocab);
                          setShowVocabulary(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 transition-colors"
                      >
                        <span className="font-medium">{vocab.word}</span>
                        {vocab.phonetic && (
                          <span className="text-xs text-purple-600">{vocab.phonetic}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Media - Image/Audio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.imageUrl && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Hình ảnh:</h4>
                <img
                  src={question.imageUrl}
                  alt={`Question ${questionNumber}`}
                  className="w-full rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {question.audioUrl && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Audio:</h4>
                <audio controls className="w-full">
                  <source src={question.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Explanation Section */}
          {hasExplanation && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Giải thích chi tiết
              </h4>
              <div className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                {question.explanation}
              </div>
            </div>
          )}

          {/* Answer Options Review */}
          {question.allAnswers && question.allAnswers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-4">Các đáp án:</h4>
              <div className="space-y-3">
                {question.allAnswers.map((answer, idx) => {
                  const isCorrect = answer.isCorrect;
                  const isUserAnswer = answer.answerId === question.userAnswerId;
                  
                  let borderColor, bgColor, textColor;
                  if (isUserAnswer && isCorrect) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                    textColor = 'text-green-700';
                  } else if (isUserAnswer) {
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-700';
                  } else if (isCorrect) {
                    borderColor = 'border-green-300';
                    bgColor = 'bg-green-50';
                    textColor = 'text-green-600';
                  } else {
                    borderColor = 'border-gray-200';
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-600';
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${borderColor} ${bgColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`font-bold text-lg min-w-[32px] ${textColor}`}>
                          {answer.mark}
                        </span>
                        <div className="flex-1">
                          {answer.content ? (
                            <p className="text-gray-900">{answer.content}</p>
                          ) : (
                            <p className="text-gray-500 italic">(Không có nội dung text)</p>
                          )}
                        </div>
                        {(isCorrect || isUserAnswer) && (
                          <div className="flex items-center gap-1">
                            {isUserAnswer && isCorrect && (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">
                                ✓ Bạn chọn đúng
                              </span>
                            )}
                            {isCorrect && !isUserAnswer && (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm bg-green-100 px-2 py-1 rounded">
                                ✓ Đáp án đúng
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm bg-red-100 px-2 py-1 rounded">
                                ✗ Bạn chọn sai
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Vocabulary or Grammar */}
        {(showVocabulary || showGrammar) && (
          <div className="lg:col-span-1">
            {showVocabulary && hasVocabulary && (
              <VocabularySidebar
                vocabularyWords={question.vocabularyWords}
                selectedWord={selectedWord}
                onSelectWord={setSelectedWord}
                onClose={() => setShowVocabulary(false)}
              />
            )}
            
            {showGrammar && hasGrammar && (
              <GrammarPoints
                grammarPoints={question.grammarPoints}
                onClose={() => setShowGrammar(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ExamReview.propTypes = {
  question: PropTypes.shape({
    questionId: PropTypes.string,
    questionContent: PropTypes.string,
    imageUrl: PropTypes.string,
    audioUrl: PropTypes.string,
    explanation: PropTypes.string,
    highlightStart: PropTypes.number,
    highlightEnd: PropTypes.number,
    userAnswerId: PropTypes.string,
    correctAnswerId: PropTypes.string,
    allAnswers: PropTypes.arrayOf(PropTypes.shape({
      answerId: PropTypes.string,
      mark: PropTypes.string,
      content: PropTypes.string,
      isCorrect: PropTypes.bool,
    })),
    vocabularyWords: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      word: PropTypes.string,
      phonetic: PropTypes.string,
      partOfSpeech: PropTypes.string,
      meaning: PropTypes.string,
      meaningEn: PropTypes.string,
      exampleSentence: PropTypes.string,
      exampleTranslation: PropTypes.string,
      audioUrl: PropTypes.string,
    })),
    grammarPoints: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      exampleSentences: PropTypes.arrayOf(PropTypes.string),
      level: PropTypes.string,
      category: PropTypes.string,
    })),
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
};

export default ExamReview;
