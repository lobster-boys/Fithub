import api from '../api';
import { handleApiError } from '../../utils/errorHandler';
import { formatDietStats, formatDateForApi } from '../../utils/dietTransformers';

/**
 * 식단 기록 관련 API 서비스
 */
export const dietLogService = {
  /**
   * 식단 기록 목록 조회
   */
  async getDietLogs(params = {}) {
    try {
      const response = await api.get('/diet/logs/', { params });
      const logs = response.data.results || response.data;
      
      return {
        data: Array.isArray(logs) ? logs : [],
        pagination: response.data.results ? {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        } : null
      };
    } catch (error) {
      throw handleApiError(error, 'DietLogService.getDietLogs', '식단 기록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 날짜별 식단 기록 조회
   */
  async getDietLogsByDate(date) {
    const formattedDate = formatDateForApi(date);
    return this.getDietLogs({ date: formattedDate });
  },

  /**
   * 식사 타입별 식단 기록 조회
   */
  async getDietLogsByMealType(mealType, date = null) {
    const params = { meal_type: mealType };
    if (date) {
      params.date = formatDateForApi(date);
    }
    return this.getDietLogs(params);
  },

  /**
   * 날짜 범위별 식단 기록 조회
   */
  async getDietLogsByDateRange(dateFrom, dateTo) {
    return this.getDietLogs({
      date_from: formatDateForApi(dateFrom),
      date_to: formatDateForApi(dateTo)
    });
  },

  /**
   * 식단 기록 상세 조회
   */
  async getDietLog(logId) {
    try {
      const response = await api.get(`/diet/logs/${logId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.getDietLog', '식단 기록 상세 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 식단 기록 생성 (단일 음식)
   */
  async createDietLog(logData) {
    try {
      const formattedData = {
        food_id: logData.food_id || logData.food,
        date: formatDateForApi(logData.date || new Date()),
        meal_type: logData.meal_type || 'breakfast',
        quantity: parseFloat(logData.quantity || logData.amount || 100)
      };
      
      const response = await api.post('/diet/logs/', formattedData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.createDietLog', '식단 기록 생성에 실패했습니다.');
    }
  },

  /**
   * 식사 기록 생성 (복수 음식)
   */
  async createMealLog(mealData) {
    try {
      const formattedData = {
        meal_name: mealData.meal_name || '',
        meal_time: mealData.meal_time || mealData.meal_type || 'breakfast',
        date: formatDateForApi(mealData.date || new Date()),
        foods: mealData.foods.map(food => ({
          food_id: food.id,
          quantity: parseFloat(food.quantity || 100)
        })),
        notes: mealData.notes || ''
      };
      
      const response = await api.post('/diet/logs/create-meal/', formattedData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.createMealLog', '식사 기록 생성에 실패했습니다.');
    }
  },

  /**
   * 여러 식단 기록 일괄 생성
   */
  async createMultipleDietLogs(logsData) {
    try {
      const promises = logsData.map(logData => this.createDietLog(logData));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.createMultipleDietLogs', '식단 기록 일괄 생성에 실패했습니다.');
    }
  },

  /**
   * 추천 기반 식단 기록 생성
   */
  async createDietLogFromRecommendation(recommendationData) {
    try {
      const formattedData = {
        recommendations: recommendationData.recommendations || [],
        date: formatDateForApi(recommendationData.date || new Date())
      };
      
      const response = await api.post('/diet/logs/from-recommendation/', formattedData);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      throw handleApiError(error, 'DietLogService.createDietLogFromRecommendation', '추천 기반 식단 기록 생성에 실패했습니다.');
    }
  },

  /**
   * 식단 기록 수정
   */
  async updateDietLog(logId, logData) {
    try {
      const formattedData = {
        ...logData,
        date: formatDateForApi(logData.date),
        quantity: parseFloat(logData.quantity || logData.amount || 100),
        calories: parseFloat(logData.calories || 0)
      };
      
      const response = await api.put(`/diet/logs/${logId}/`, formattedData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.updateDietLog', '식단 기록 수정에 실패했습니다.');
    }
  },

  /**
   * 식단 기록 부분 수정
   */
  async patchDietLog(logId, logData) {
    try {
      const response = await api.patch(`/diet/logs/${logId}/`, logData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.patchDietLog', '식단 기록 부분 수정에 실패했습니다.');
    }
  },

  /**
   * 식단 기록 삭제
   */
  async deleteDietLog(logId) {
    try {
      const response = await api.delete(`/diet/logs/${logId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'DietLogService.deleteDietLog', '식단 기록 삭제에 실패했습니다.');
    }
  },

  /**
   * 여러 식단 기록 일괄 삭제
   */
  async deleteMultipleDietLogs(logIds) {
    try {
      const promises = logIds.map(logId => this.deleteDietLog(logId));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      if (failed.length > 0) {
        console.warn(`${failed.length}개의 식단 기록 삭제에 실패했습니다.`);
      }
      
      return {
        successful: successful.length,
        failed: failed.length,
        total: logIds.length
      };
    } catch (error) {
      throw handleApiError(error, 'DietLogService.deleteMultipleDietLogs', '식단 기록 일괄 삭제에 실패했습니다.');
    }
  },

  /**
   * 날짜별 모든 식단 기록 삭제
   */
  async deleteDietLogsByDate(date) {
    try {
      const { data: logs } = await this.getDietLogsByDate(date);
      const logIds = logs.map(log => log.id);
      
      if (logIds.length === 0) {
        return { successful: 0, failed: 0, total: 0 };
      }
      
      return this.deleteMultipleDietLogs(logIds);
    } catch (error) {
      throw handleApiError(error, 'DietLogService.deleteDietLogsByDate', '해당 날짜의 식단 기록 삭제에 실패했습니다.');
    }
  },

  /**
   * 식단 통계 조회
   */
  async getDietStats(date = null) {
    try {
      const params = date ? { date: formatDateForApi(date) } : {};
      const response = await api.get('/diet/logs/stats/', { params });
      return formatDietStats(response.data);
    } catch (error) {
      throw handleApiError(error, 'DietLogService.getDietStats', '식단 통계를 불러오는데 실패했습니다.');
    }
  }
};

export default dietLogService; 