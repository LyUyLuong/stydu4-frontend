import { useState, useEffect } from 'react';
import { X, Upload, FileAudio, Image as ImageIcon, Plus, Trash2, XCircle } from 'lucide-react';

const QuestionTestModal = ({ question, partTests, questionGroups, questionTypes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    type: '',
    description: '',
    imageId: '',
    audioId: '',
    partId: '',
    questionGroupId: '',
    answers: [{ content: '', isCorrect: false, mark: '' }]
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      console.log('Editing question:', question);
      console.log('Available partTests:', partTests);
      console.log('Question Audio URL:', question.audioUrl);
      console.log('Question Image URL:', question.imageUrl);
      console.log('Question Audio ID:', question.audioId);
      console.log('Question Image ID:', question.imageId);
      
      // Backend returns partTestId, not partId
      const partId = question.partTestId || question.partId || '';
      const questionGroupId = question.questionGroupId || '';
      
      // Map answers from API response (AnswerDetailResponse format)
      let mappedAnswers = [{ content: '', isCorrect: false, mark: '' }];
      if (question.answers && question.answers.length > 0) {
        mappedAnswers = question.answers.map(a => ({
          id: a.id, // Keep answer ID for update
          content: a.content || '',
          isCorrect: a.isCorrect || false,
          mark: a.mark || ''
        }));
      }
      
      setFormData({
        name: question.name || '',
        content: question.content || '',
        type: question.type || '',
        description: question.description || '',
        imageId: question.imageId || '',
        audioId: question.audioId || '',
        partId: partId.toString(),
        questionGroupId: questionGroupId.toString(),
        answers: mappedAnswers
      });
      
      console.log('Selected partTestId/partId:', partId);
      console.log('Mapped answers:', mappedAnswers);
    }
  }, [question, partTests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: field === 'isCorrect' ? value === 'true' : value
    };
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const addAnswer = () => {
    if (formData.answers.length < 10) {
      setFormData(prev => ({
        ...prev,
        answers: [...prev.answers, { content: '', isCorrect: false, mark: '' }]
      }));
    }
  };

  const removeAnswer = (index) => {
    if (formData.answers.length > 1) {
      const newAnswers = formData.answers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        answers: newAnswers
      }));
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setRemoveAudio(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
    }
  };

  const handleRemoveAudio = () => {
    setRemoveAudio(true);
    setAudioFile(null);
    setFormData(prev => ({ ...prev, audioId: '' }));
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.type.trim()) {
      setError('Type is required');
      return;
    }

    // Part and QuestionGroup are both optional
    // At least one can be null or both can be null
    // No validation required for partId or questionGroupId

    if (!formData.answers || formData.answers.length === 0) {
      setError('At least one answer is required');
      return;
    }

    const hasEmptyAnswer = formData.answers.some(a => !a.content.trim());
    if (hasEmptyAnswer) {
      setError('All answers must have content');
      return;
    }

    const hasCorrectAnswer = formData.answers.some(a => a.isCorrect);
    if (!hasCorrectAnswer) {
      setError('At least one answer must be marked as correct');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Modal submit - audioFile:', audioFile);
      console.log('Modal submit - imageFile:', imageFile);
      
      // Prepare data for backend
      // Remove answer IDs - backend will create new answers for both create and update
      const dataToSend = {
        ...formData,
        // Only include partId if it has a value
        partId: formData.partId || null,
        // Only include questionGroupId if it has a value
        questionGroupId: formData.questionGroupId || null,
        answers: formData.answers.map(({ id, ...answer }) => ({
          content: answer.content || '', // Allow empty content for Part 1, Part 2 (mark only)
          isCorrect: answer.isCorrect,
          // For FILL_IN_BLANK, mark should be null; for MULTIPLE_CHOICE, use the mark value or empty string
          mark: formData.type === 'FILL_IN_BLANK' ? null : (answer.mark || '')
        }))
      };
      
      console.log('Data to send to backend:', JSON.stringify(dataToSend, null, 2));
      
      await onSave(dataToSend, audioFile, imageFile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Create Question'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter question name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select question type</option>
                {questionTypes && questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part (Optional)
              </label>
              <select
                name="partId"
                value={formData.partId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">No part selected</option>
                {partTests.map(part => (
                  <option key={part.id} value={part.id.toString()}>
                    {part.name} ({part.type})
                  </option>
                ))}
              </select>
              {formData.partId && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected Part ID: {formData.partId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Group (Optional)
              </label>
              <select
                name="questionGroupId"
                value={formData.questionGroupId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">No group selected</option>
                {questionGroups
                  .filter(group => !formData.partId || group.partId?.toString() === formData.partId)
                  .map(group => (
                    <option key={group.id} value={group.id.toString()}>
                      {group.name} ({group.type})
                    </option>
                  ))}
              </select>
              {formData.questionGroupId && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected Group ID: {formData.questionGroupId}
                </p>
              )}
              {formData.partId && (
                <p className="text-xs text-blue-600 mt-1">
                  {questionGroups.filter(group => group.partId?.toString() === formData.partId).length} group(s) in selected part
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter question content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File
              </label>
              
              {/* Show existing audio if available */}
              {question?.audioUrl && !audioFile && !removeAudio && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileAudio size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">Current audio file</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="text-red-600 hover:text-red-800"
                      title="Remove audio"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                  <audio controls className="w-full" src={question.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <FileAudio size={20} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {audioFile ? audioFile.name : (question?.audioUrl ? 'Replace audio file' : 'Choose audio file')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image File
              </label>
              
              {/* Show existing image if available */}
              {question?.imageUrl && !imageFile && !removeImage && (
                <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ImageIcon size={16} className="text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Current image</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={question.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        View Full
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-800"
                        title="Remove image"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="w-full h-40 object-contain rounded bg-white"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<p class="text-sm text-red-600">Failed to load image</p>';
                    }}
                  />
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <ImageIcon size={20} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {imageFile ? imageFile.name : (question?.imageUrl ? 'Replace image file' : 'Choose image file')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Answers * (1-10)
              </label>
              <button
                type="button"
                onClick={addAnswer}
                disabled={formData.answers.length >= 10}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                <span>Add Answer</span>
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={answer.content}
                      onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={`Answer ${index + 1} content`}
                      required
                    />
                    <div className="flex items-center space-x-4">
                      <select
                        value={answer.isCorrect.toString()}
                        onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="false">Incorrect</option>
                        <option value="true">Correct</option>
                      </select>
                      <input
                        type="text"
                        value={answer.mark}
                        onChange={(e) => handleAnswerChange(index, 'mark', e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        placeholder="Mark (optional)"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnswer(index)}
                    disabled={formData.answers.length === 1}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionTestModal;
