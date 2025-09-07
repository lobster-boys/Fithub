import React, { useState, useEffect } from 'react';
import { Share2, Save, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import useWorkoutData from '../../hooks/useWorkoutData';
import { useRoutineShare } from '../../hooks/useRoutineShare';
import Button from '../common/Button';
import Input from '../common/Input';
import RoutineShareModal from './RoutineShareModal';

const WorkoutRoutineForm = ({ routine = null, onSave, onCancel }) => {
  const {
    createRoutine,
    updateRoutine,
    loading: workoutLoading,
    error: workoutError
  } = useWorkoutData();

  const {
    toggleRoutinePublic,
    loading: shareLoading,
    error: shareError
  } = useRoutineShare();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    is_public: false,
    exercises: []
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);

  useEffect(() => {
    if (routine) {
      setFormData({
        title: routine.title || '',
        description: routine.description || '',
        difficulty: routine.difficulty || 'beginner',
        is_public: routine.is_public || false,
        exercises: routine.exercises || []
      });
      setCurrentRoutine(routine);
    }
  }, [routine]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      exercises: updatedExercises
    }));
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_name: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest_time: 60,
          notes: ''
        }
      ]
    }));
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedRoutine;
      if (routine?.id) {
        savedRoutine = await updateRoutine(routine.id, formData);
      } else {
        savedRoutine = await createRoutine(formData);
      }
      
      setCurrentRoutine(savedRoutine);
      
      if (onSave) {
        onSave(savedRoutine);
      }
    } catch (err) {
      console.error('Failed to save routine:', err);
    }
  };

  const handleTogglePublic = async () => {
    if (!currentRoutine?.id) return;
    
    try {
      const result = await toggleRoutinePublic(currentRoutine.id);
      setFormData(prev => ({
        ...prev,
        is_public: result.is_public
      }));
      setCurrentRoutine(prev => ({
        ...prev,
        is_public: result.is_public
      }));
    } catch (err) {
      console.error('Failed to toggle public status:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {routine?.id ? '루틴 수정' : '새 루틴 만들기'}
            </h2>
            <div className="flex space-x-2">
              {currentRoutine?.id && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleTogglePublic}
                    disabled={shareLoading}
                    className="flex items-center"
                  >
                    {formData.is_public ? (
                      <>
                        <Unlock size={16} className="mr-2" />
                        공개
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="mr-2" />
                        비공개
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center"
                  >
                    <Share2 size={16} className="mr-2" />
                    공유
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {(workoutError || shareError) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {workoutError || shareError}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  루틴 이름 *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="루틴 이름을 입력하세요"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  난이도
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="루틴에 대한 설명을 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 운동 목록 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">운동 목록</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addExercise}
                  className="flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  운동 추가
                </Button>
              </div>

              <div className="space-y-4">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">운동 {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          운동명 *
                        </label>
                        <Input
                          type="text"
                          value={exercise.exercise_name}
                          onChange={(e) => handleExerciseChange(index, 'exercise_name', e.target.value)}
                          placeholder="운동명을 입력하세요"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          세트
                        </label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          반복 횟수
                        </label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          중량 (kg)
                        </label>
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          휴식 시간 (초)
                        </label>
                        <Input
                          type="number"
                          value={exercise.rest_time}
                          onChange={(e) => handleExerciseChange(index, 'rest_time', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          메모
                        </label>
                        <Input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                          placeholder="메모를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.exercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>운동을 추가해보세요!</p>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                >
                  취소
                </Button>
              )}
              <Button
                type="submit"
                disabled={workoutLoading || formData.exercises.length === 0}
                className="flex items-center"
              >
                <Save size={16} className="mr-2" />
                {workoutLoading ? '저장 중...' : (routine?.id ? '수정' : '저장')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && currentRoutine && (
        <RoutineShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          routine={currentRoutine}
        />
      )}
    </div>
  );
};

export default WorkoutRoutineForm;
