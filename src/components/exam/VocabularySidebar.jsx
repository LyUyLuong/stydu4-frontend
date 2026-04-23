import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import vocabularyService from '../../services/vocabularyService';

/**
 * VocabularySidebar Component
 * Displays vocabulary words with definitions, examples, and learning features
 */
function VocabularySidebar({ vocabularyWords, selectedWord, onSelectWord, onClose }) {
  const [bookmarkedWords, setBookmarkedWords] = useState(new Set());
  const [playingAudio, setPlayingAudio] = useState(null);

  // Handle bookmark toggle
  const handleToggleBookmark = async (wordId) => {
    try {
      await vocabularyService.toggleBookmark(wordId);
      setBookmarkedWords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(wordId)) {
          newSet.delete(wordId);
          toast.success('Đã bỏ bookmark');
        } else {
          newSet.add(wordId);
          toast.success('Đã thêm vào bookmark');
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Không thể bookmark từ này');
    }
  };

  // Handle add to learning list
  const handleAddToLearning = async (wordId) => {
    try {
      await vocabularyService.addVocabularyToUser(wordId);
      toast.success('Đã thêm vào danh sách học');
    } catch (error) {
      console.error('Error adding to learning:', error);
      toast.error('Không thể thêm từ vào danh sách học');
    }
  };

  // Play pronunciation audio
  const handlePlayAudio = (audioUrl, wordId) => {
    if (!audioUrl) {
      toast.error('Không có audio cho từ này');
      return;
    }

    const audio = new Audio(audioUrl);
    setPlayingAudio(wordId);
    
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      setPlayingAudio(null);
      toast.error('Không thể phát audio');
    };
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlayingAudio(null);
      toast.error('Không thể phát audio');
    });
  };

  // Get part of speech badge color
  const getPartOfSpeechColor = (pos) => {
    const colors = {
      NOUN: 'bg-blue-100 text-blue-800',
      VERB: 'bg-green-100 text-green-800',
      ADJECTIVE: 'bg-yellow-100 text-yellow-800',
      ADVERB: 'bg-purple-100 text-purple-800',
      PRONOUN: 'bg-pink-100 text-pink-800',
      PREPOSITION: 'bg-indigo-100 text-indigo-800',
      CONJUNCTION: 'bg-red-100 text-red-800',
      INTERJECTION: 'bg-orange-100 text-orange-800',
      PHRASAL_VERB: 'bg-teal-100 text-teal-800',
      IDIOM: 'bg-cyan-100 text-cyan-800',
    };
    return colors[pos] || 'bg-gray-100 text-gray-800';
  };

  // Get difficulty level color
  const getDifficultyColor = (level) => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-800',
      ELEMENTARY: 'bg-lime-100 text-lime-800',
      INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
      UPPER_INTERMEDIATE: 'bg-orange-100 text-orange-800',
      ADVANCED: 'bg-red-100 text-red-800',
      PROFICIENT: 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const displayWord = selectedWord || vocabularyWords[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Từ vựng
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

      {/* Word List Navigation */}
      {vocabularyWords.length > 1 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Chọn từ:</p>
          <div className="flex flex-wrap gap-2">
            {vocabularyWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => onSelectWord(word)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  displayWord?.id === word.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                {word.word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Details */}
      {displayWord && (
        <div className="p-4 space-y-4">
          {/* Word Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {displayWord.word}
                </h4>
                {displayWord.phonetic && (
                  <p className="text-gray-600 italic">{displayWord.phonetic}</p>
                )}
              </div>
              
              {/* Audio Button */}
              {displayWord.audioUrl && (
                <button
                  onClick={() => handlePlayAudio(displayWord.audioUrl, displayWord.id)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  disabled={playingAudio === displayWord.id}
                >
                  {playingAudio === displayWord.id ? (
                    <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {displayWord.partOfSpeech && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartOfSpeechColor(displayWord.partOfSpeech)}`}>
                  {displayWord.partOfSpeech}
                </span>
              )}
              {displayWord.level && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(displayWord.level)}`}>
                  {displayWord.level}
                </span>
              )}
              {displayWord.topic && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {displayWord.topic}
                </span>
              )}
            </div>
          </div>

          {/* Meaning */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h5 className="font-semibold text-blue-900 mb-2">Nghĩa tiếng Việt:</h5>
            <p className="text-blue-900">{displayWord.meaning}</p>
          </div>

          {/* English Meaning */}
          {displayWord.meaningEn && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <h5 className="font-semibold text-purple-900 mb-2">English Definition:</h5>
              <p className="text-purple-900">{displayWord.meaningEn}</p>
            </div>
          )}

          {/* Example Sentence */}
          {displayWord.exampleSentence && (
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h5 className="font-semibold text-green-900 mb-2">Ví dụ:</h5>
              <p className="text-green-900 italic mb-2">&quot;{displayWord.exampleSentence}&quot;</p>
              {displayWord.exampleTranslation && (
                <p className="text-green-800 text-sm">{displayWord.exampleTranslation}</p>
              )}
            </div>
          )}

          {/* Synonyms, Antonyms, Related Words */}
          {(displayWord.synonyms?.length > 0 || displayWord.antonyms?.length > 0 || displayWord.relatedWords?.length > 0) && (
            <div className="space-y-3">
              {displayWord.synonyms?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm">Từ đồng nghĩa:</h5>
                  <div className="flex flex-wrap gap-2">
                    {displayWord.synonyms.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {displayWord.antonyms?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm">Từ trái nghĩa:</h5>
                  <div className="flex flex-wrap gap-2">
                    {displayWord.antonyms.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {displayWord.relatedWords?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2 text-sm">Từ liên quan:</h5>
                  <div className="flex flex-wrap gap-2">
                    {displayWord.relatedWords.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleToggleBookmark(displayWord.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                bookmarkedWords.has(displayWord.id)
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bookmarkedWords.has(displayWord.id) ? '⭐ Đã bookmark' : '☆ Bookmark'}
            </button>
            
            <button
              onClick={() => handleAddToLearning(displayWord.id)}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              + Thêm vào học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

VocabularySidebar.propTypes = {
  vocabularyWords: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    word: PropTypes.string.isRequired,
    phonetic: PropTypes.string,
    partOfSpeech: PropTypes.string,
    meaning: PropTypes.string.isRequired,
    meaningEn: PropTypes.string,
    exampleSentence: PropTypes.string,
    exampleTranslation: PropTypes.string,
    audioUrl: PropTypes.string,
    imageUrl: PropTypes.string,
    level: PropTypes.string,
    topic: PropTypes.string,
    synonyms: PropTypes.arrayOf(PropTypes.string),
    antonyms: PropTypes.arrayOf(PropTypes.string),
    relatedWords: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
  selectedWord: PropTypes.object,
  onSelectWord: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VocabularySidebar;
