import axiosInstance from './axiosConfig';

// ========== 게시글 (Posts) ==========

// 게시글 목록 조회 (필터링: category, search)
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
    // FormData인 경우 Content-Type 헤더를 제거하여 브라우저가 자동 설정하도록 함
    const config = {};
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined // 기본 Content-Type 헤더 제거
      };
    }
    
    const response = await axiosInstance.post('/community/posts/', postData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (id, postData) => {
  try {
    // FormData인 경우 Content-Type 헤더를 제거하여 브라우저가 자동 설정하도록 함
    const config = {};
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined // 기본 Content-Type 헤더 제거
      };
    }
    
    const response = await axiosInstance.put(`/community/posts/${id}/`, postData, config);
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

// 게시글 좋아요/좋아요 취소
export const likePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/community/posts/${postId}/like/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 편의 함수들 (프론트엔드에서 자주 사용하는 패턴) ==========

// 카테고리별 게시글 조회
export const getPostsByCategory = async (category) => {
  return getPosts({ category });
};

// 게시글 검색
export const searchPosts = async (query) => {
  return getPosts({ search: query });
};

 