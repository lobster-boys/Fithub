import axiosInstance from './axiosConfig';

// ========== 게시글 관련 API ==========

// 게시글 목록 조회
export const getPosts = async (params) => {
  try {
    const response = await axiosInstance.get('/community/posts/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 상세 조회
export const getPost = async (id) => {
  try {
    const response = await axiosInstance.get(`/community/posts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 생성
export const createPost = async (postData) => {
  try {
    const response = await axiosInstance.post('/community/posts/', postData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (id, postData) => {
  try {
    const response = await axiosInstance.put(`/community/posts/${id}/`, postData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (id) => {
  try {
    const response = await axiosInstance.delete(`/community/posts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 내 게시글 조회
export const getMyPosts = async () => {
  try {
    const response = await axiosInstance.get('/community/posts/my_posts/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 인기 게시글 조회
export const getPopularPosts = async () => {
  try {
    const response = await axiosInstance.get('/community/posts/popular/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 최근 게시글 조회
export const getRecentPosts = async () => {
  try {
    const response = await axiosInstance.get('/community/posts/recent/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 검색
export const searchPosts = async (query) => {
  try {
    const response = await axiosInstance.get('/community/posts/search/', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 카테고리별 게시글 조회
export const getPostsByCategory = async (category) => {
  try {
    const response = await axiosInstance.get('/community/posts/by_category/', {
      params: { category }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 좋아요
export const likePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/community/posts/${postId}/like/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 좋아요 취소
export const unlikePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/community/posts/${postId}/like/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 북마크
export const bookmarkPost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/community/posts/${postId}/bookmark/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 북마크 취소
export const unbookmarkPost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/community/posts/${postId}/bookmark/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 북마크한 게시글 조회
export const getBookmarkedPosts = async () => {
  try {
    const response = await axiosInstance.get('/community/posts/bookmarked/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 신고
export const reportPost = async (postId, reason) => {
  try {
    const response = await axiosInstance.post(`/community/posts/${postId}/report/`, {
      reason: reason
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 