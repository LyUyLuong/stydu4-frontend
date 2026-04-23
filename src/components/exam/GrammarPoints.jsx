import PropTypes from 'prop-types';

/**
 * GrammarPoints Component
 * Displays grammar points with explanations and examples
 */
function GrammarPoints({ grammarPoints, onClose }) {
  // Get difficulty level color
  const getDifficultyColor = (level) => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-800 border-green-300',
      ELEMENTARY: 'bg-lime-100 text-lime-800 border-lime-300',
      INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      UPPER_INTERMEDIATE: 'bg-orange-100 text-orange-800 border-orange-300',
      ADVANCED: 'bg-red-100 text-red-800 border-red-300',
      PROFICIENT: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Tenses': 'bg-blue-100 text-blue-800',
      'Conditionals': 'bg-indigo-100 text-indigo-800',
      'Passive Voice': 'bg-purple-100 text-purple-800',
      'Reported Speech': 'bg-pink-100 text-pink-800',
      'Modal Verbs': 'bg-cyan-100 text-cyan-800',
      'Relative Clauses': 'bg-teal-100 text-teal-800',
      'Prepositions': 'bg-green-100 text-green-800',
      'Articles': 'bg-lime-100 text-lime-800',
      'Comparatives': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Ngữ pháp
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Grammar Points List */}
      <div className="p-4 space-y-4">
        {grammarPoints && grammarPoints.length > 0 ? (
          grammarPoints.map((point, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 ${getDifficultyColor(point.level)}`}
            >
              {/* Header */}
              <div className="mb-3">
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  {point.title}
                </h4>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {point.level && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(point.level).split(' ')[0]} ${getDifficultyColor(point.level).split(' ')[1]}`}>
                      {point.level}
                    </span>
                  )}
                  {point.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(point.category)}`}>
                      {point.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 bg-white bg-opacity-60 p-3 rounded border border-current border-opacity-20">
                <h5 className="font-semibold text-gray-700 mb-2 text-sm">Giải thích:</h5>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {point.description}
                </p>
              </div>

              {/* Example Sentences */}
              {point.exampleSentences && point.exampleSentences.length > 0 && (
                <div className="bg-white bg-opacity-60 p-3 rounded border border-current border-opacity-20">
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Ví dụ:
                  </h5>
                  <ul className="space-y-2">
                    {point.exampleSentences.map((sentence, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-500 font-bold min-w-[20px]">{idx + 1}.</span>
                        <span className="text-gray-900 italic">&quot;{sentence}&quot;</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Không có ngữ pháp nào cho câu hỏi này</p>
          </div>
        )}
      </div>

      {/* Footer Tips */}
      <div className="sticky bottom-0 bg-blue-50 border-t border-blue-200 p-3">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            💡 Tip: Hãy đọc kỹ giải thích và ví dụ để hiểu rõ cách sử dụng ngữ pháp trong từng ngữ cảnh.
          </span>
        </p>
      </div>
    </div>
  );
}

GrammarPoints.propTypes = {
  grammarPoints: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    exampleSentences: PropTypes.arrayOf(PropTypes.string),
    level: PropTypes.string,
    category: PropTypes.string,
  })),
  onClose: PropTypes.func.isRequired,
};

export default GrammarPoints;
