import { useState, useEffect, useMemo, useCallback } from 'react';
import * as communityAPI from '../api/communityAPI';

// 카테고리 매핑 (프론트엔드 ↔ 백엔드)
const CATEGORY_MAPPING = {
  // 프론트엔드 → 백엔드
  'tips': 'fitness_tip',
  'questions': 'question_answer', 
  'achievements': 'certification_review',
  'general': 'free_board',
  
  // 백엔드 → 프론트엔드
  'fitness_tip': 'tips',
  'question_answer': 'questions',
  'certification_review': 'achievements', 
  'free_board': 'general'
};

// 커뮤니티 게시글 데이터 (실제 환경에서는 API에서 가져올 데이터)
const POSTS_DATA = [
  {
    id: 1,
    title: '초보자를 위한 웨이트 트레이닝 팁',
    content: '안녕하세요! 오늘은 처음 웨이트 트레이닝을 시작하시는 분들을 위한 꿀팁을 공유해드리려고 합니다. 첫째, 올바른 자세가 가장 중요합니다. 무게를 늘리는 것보다 정확한 폼으로 운동하는 것이 부상 예방과 효과적인 근육 발달에 도움이 됩니다...',
    category: 'tips',
    author: {
      name: '근육맨',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    likes: 124,
    comments: 23,
    views: 1250,
    date: '2024-01-20',
    createdAt: new Date('2024-01-20T10:30:00'),
    images: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'],
    tags: ['웨이트', '초보자', '팁', '근력운동'],
    isPopular: true,
    isPinned: false
  },
  {
    id: 2,
    title: '30일 전신 챌린지를 완료했어요! 🎉',
    content: '6개월간의 노력 끝에 드디어 30일 전신 챌린지를 완료했습니다! 정말 기분이 좋네요. 처음에는 힘들었지만 꾸준히 하니까 체력도 늘고 몸매도 많이 좋아졌어요. 제 진행 상황이 너무 자랑스럽습니다. 마지막 주는 힘들었지만 완전히 가치가 있었어요!',
    category: 'achievements',
    author: {
      name: 'Jessica Park',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    likes: 87,
    comments: 15,
    views: 890,
    date: '2024-01-19',
    createdAt: new Date('2024-01-19T14:20:00'),
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'],
    tags: ['챌린지', '성취', '전신운동', '30일'],
    isPopular: true,
    isPinned: false
  },
  {
    id: 3,
    title: '새로운 코어 크러셔 운동을 해보신 분 계신가요?',
    content: '새로운 코어 크러셔 운동을 해보신 분 계신가요? 자전거 크런치 중에 자세를 유지하는 팁이 필요합니다. 어떻게 하면 더 효과적으로 할 수 있을까요? 복근에 더 집중할 수 있는 방법도 알려주세요!',
    category: 'questions',
    author: {
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    likes: 45,
    comments: 32,
    views: 650,
    date: '2024-01-18',
    createdAt: new Date('2024-01-18T16:45:00'),
    images: [],
    tags: ['코어', '복근', '질문', '크런치'],
    isPopular: false,
    isPinned: false
  },
  {
    id: 4,
    title: '다이어트 식단 어떻게 관리하세요?',
    content: '살을 빼려고 노력 중인데, 식단 관리가 정말 어렵네요. 다들 어떻게 관리하시는지 팁 좀 부탁드려요. 특히 직장인이라 점심을 밖에서 먹어야 하는 경우가 많은데, 이럴 때는 어떻게 해야 할까요?',
    category: 'questions',
    author: {
      name: '다이어터',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    likes: 32,
    comments: 45,
    views: 780,
    date: '2024-01-17',
    createdAt: new Date('2024-01-17T12:30:00'),
    images: [],
    tags: ['다이어트', '식단', '직장인', '질문'],
    isPopular: false,
    isPinned: false
  },
  {
    id: 5,
    title: '요가로 스트레스 관리하는 방법',
    content: '오늘은 스트레스를 해소하는 데 도움이 되는 간단한 요가 동작들을 공유해 드리려고 합니다. 바쁜 일상 속에서도 쉽게 따라할 수 있는 동작들로 구성했어요. 하루 10분만 투자해도 몸과 마음이 한결 가벼워집니다.',
    category: 'tips',
    author: {
      name: '요가마스터',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    likes: 78,
    comments: 18,
    views: 920,
    date: '2024-01-16',
    createdAt: new Date('2024-01-16T09:15:00'),
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1520&q=80'],
    tags: ['요가', '스트레스', '힐링', '명상'],
    isPopular: true,
    isPinned: false
  },
  {
    id: 6,
    title: '홈트레이닝 장비 추천해주세요!',
    content: '집에서 운동하려고 하는데 어떤 장비를 사야 할지 모르겠어요. 공간이 많지 않아서 효율적인 장비 위주로 추천 부탁드립니다. 예산은 20만원 정도 생각하고 있어요.',
    category: 'questions',
    author: {
      name: '홈트초보',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    likes: 28,
    comments: 35,
    views: 540,
    date: '2024-01-15',
    createdAt: new Date('2024-01-15T20:10:00'),
    images: [],
    tags: ['홈트레이닝', '장비', '추천', '예산'],
    isPopular: false,
    isPinned: false
  },
  {
    id: 7,
    title: '러닝 3개월 후기 - 5km 완주 성공!',
    content: '3개월 전만 해도 1km도 뛰기 힘들었는데, 드디어 5km 완주에 성공했습니다! 처음에는 정말 힘들었지만 꾸준히 하니까 체력이 늘더라고요. 러닝 초보자분들에게 도움이 될 만한 팁들도 공유해드릴게요.',
    category: 'achievements',
    author: {
      name: '러닝러버',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    likes: 95,
    comments: 22,
    views: 1100,
    date: '2024-01-14',
    createdAt: new Date('2024-01-14T18:30:00'),
    images: ['https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'],
    tags: ['러닝', '5km', '성취', '초보자'],
    isPopular: true,
    isPinned: false
  },
  {
    id: 8,
    title: '근력운동 vs 유산소 운동, 어떤 게 더 좋을까요?',
    content: '다이어트를 위해서는 근력운동과 유산소 운동 중 어떤 것을 우선해야 할까요? 둘 다 해야 한다는 건 알지만, 시간이 부족할 때는 어떤 것을 선택해야 할지 고민이에요.',
    category: 'questions',
    author: {
      name: '운동고민러',
      avatar: 'https://randomuser.me/api/portraits/men/18.jpg'
    },
    likes: 52,
    comments: 28,
    views: 720,
    date: '2024-01-13',
    createdAt: new Date('2024-01-13T15:20:00'),
    images: [],
    tags: ['근력운동', '유산소', '다이어트', '선택'],
    isPopular: false,
    isPinned: false
  }
];

// 카테고리 정보
const CATEGORIES = [
  { id: 'all', name: '전체', icon: 'fas fa-list' },
  { id: 'tips', name: '운동 팁', icon: 'fas fa-lightbulb' },
  { id: 'questions', name: '질문/답변', icon: 'fas fa-question-circle' },
  { id: 'achievements', name: '인증/후기', icon: 'fas fa-trophy' },
  { id: 'general', name: '자유 게시판', icon: 'fas fa-comments' }
];

// 정렬 옵션
const SORT_OPTIONS = {
  LATEST: 'latest',        // 최신순
  POPULAR: 'popular',      // 인기순 (좋아요 + 댓글 + 조회수)
  LIKES: 'likes',          // 좋아요순
  COMMENTS: 'comments',    // 댓글순
  VIEWS: 'views'           // 조회수순
};

const useCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});  // postId별 댓글 저장
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.LATEST);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userCache, setUserCache] = useState({}); // 사용자 정보 캐시

  // ============ 유틸리티 함수들 ============

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const transformPostFromBackend = (backendPost) => {
    // 사용자 정보 처리 (새로운 UserBasicSerializer 구조에 맞게)
    const userData = backendPost.user || {};
    const displayName = userData.first_name && userData.last_name 
      ? `${userData.first_name} ${userData.last_name}`.trim()
      : userData.username || 'Unknown';
    
    return {
      id: backendPost.id,
      title: backendPost.title,
      content: backendPost.content,
      category: CATEGORY_MAPPING[backendPost.content_category] || 'general',
      author: {
        name: displayName,
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
      },
      likes: backendPost.like_count || 0,
      isLiked: backendPost.is_liked || false, // 백엔드에서 제공하는 좋아요 상태 (작성자 포함)
      comments: backendPost.comments?.length || 0,
      views: 0, // 백엔드에서 지원하지 않으므로 로컬에서 관리
      date: new Date(backendPost.created_at).toISOString().split('T')[0],
      createdAt: new Date(backendPost.created_at),
      updatedAt: new Date(backendPost.updated_at),
      images: backendPost.content_image ? [backendPost.content_image] : extractMarkdownImages(backendPost.content),
      tags: extractTagsFromContent(backendPost.content),
      userTags: extractUserTagsFromContent(backendPost.content),
      isPopular: (backendPost.like_count || 0) > 10,
      isPinned: false,
      rawBackendData: backendPost // 원본 데이터 보관
    };
  };

  // 프론트엔드 데이터를 백엔드 형식으로 변환
  const transformPostToBackend = (frontendPost) => {
    // 이미지가 있는 경우 FormData 사용
    if (frontendPost.image && frontendPost.image instanceof File) {
      const formData = new FormData();
      formData.append('title', frontendPost.title);
      formData.append('content', frontendPost.content);
      formData.append('content_category', CATEGORY_MAPPING[frontendPost.category] || 'free_board');
      formData.append('content_image', frontendPost.image);
      return formData;
    }
    
    // 이미지가 없는 경우 일반 객체 반환
    return {
      title: frontendPost.title,
      content: frontendPost.content,
      content_category: CATEGORY_MAPPING[frontendPost.category] || 'free_board'
    };
  };

  // 마크다운에서 이미지 URL 추출
  const extractMarkdownImages = (content) => {
    if (!content) return [];
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images = [];
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    return images;
  };

  // 컨텐츠에서 해시태그 추출 (#태그)
  const extractTagsFromContent = (content) => {
    if (!content) return [];
    const tagRegex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return [...new Set(tags)]; // 중복 제거
  };

  // 컨텐츠에서 사용자 태그 추출 (@사용자명)
  const extractUserTagsFromContent = (content) => {
    if (!content) return [];
    const userTagRegex = /@(\w+)/g;
    const userTags = [];
    let match;
    while ((match = userTagRegex.exec(content)) !== null) {
      userTags.push(match[1]);
    }
    return [...new Set(userTags)]; // 중복 제거
  };

  // 로컬 저장소에서 조회수 관리
  const getViewsFromStorage = (postId) => {
    const views = localStorage.getItem(`post_views_${postId}`);
    return views ? parseInt(views) : 0;
  };

  const setViewsToStorage = (postId, views) => {
    localStorage.setItem(`post_views_${postId}`, views.toString());
  };

  // ============ API 호출 함수들 ============

  // 전체 게시글 조회
  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const backendParams = { ...params };
      
      // 카테고리 매핑
      if (params.category && params.category !== 'all') {
        backendParams.category = CATEGORY_MAPPING[params.category];
        delete backendParams.category;
      }
      
      const response = await communityAPI.getPosts(backendParams);
      const postsArray = response.results || response || [];
      const transformedPosts = postsArray.map(post => {
        const transformed = transformPostFromBackend(post);
        // 로컬 저장소에서 조회수 가져오기
        transformed.views = getViewsFromStorage(post.id);
        return transformed;
      });
      
      setPosts(transformedPosts);
      return { results: transformedPosts, ...response };
    } catch (err) {
      setError(err.response?.data?.detail || '게시글을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 게시글 조회
  const fetchPost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityAPI.getPost(postId);
      const transformedPost = transformPostFromBackend(response);
      transformedPost.views = getViewsFromStorage(postId);
      
      // 기존 posts 배열에서 해당 게시글 업데이트
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === parseInt(postId) ? transformedPost : post
        )
      );
      
      return transformedPost;
    } catch (err) {
      setError(err.response?.data?.detail || '게시글을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 내 게시글 조회
  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityAPI.getMyPosts();
      const postsArray = response.results || response || [];
      const transformedPosts = postsArray.map(post => {
        const transformed = transformPostFromBackend(post);
        transformed.views = getViewsFromStorage(post.id);
        return transformed;
      });
      
      return transformedPosts;
    } catch (err) {
      setError(err.response?.data?.detail || '내 게시글을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시글 생성
  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    
    try {
      const backendData = transformPostToBackend(postData);
      console.log('DEBUG: 프론트엔드 원본 데이터:', postData);
      console.log('DEBUG: 백엔드로 전송할 데이터:', backendData);
      console.log('DEBUG: FormData 여부:', backendData instanceof FormData);
      
      // FormData인 경우 내용 출력
      if (backendData instanceof FormData) {
        console.log('DEBUG: FormData 내용:');
        for (let [key, value] of backendData.entries()) {
          console.log(`  ${key}:`, value);
        }
      }
      
      const response = await communityAPI.createPost(backendData);
      const transformedPost = transformPostFromBackend(response);
      
      // 새 게시글을 목록 맨 앞에 추가
      setPosts(prevPosts => [transformedPost, ...prevPosts]);
      
      return transformedPost;
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      
      // 구체적인 에러 메시지 처리
      let errorMessage = '게시글 작성에 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.title) {
          errorMessage = `제목: ${errorData.title[0]}`;
        } else if (errorData.content) {
          errorMessage = `내용: ${errorData.content[0]}`;
        } else if (errorData.content_category) {
          errorMessage = `카테고리: ${errorData.content_category[0]}`;
        } else if (errorData.content_image) {
          errorMessage = `이미지: ${errorData.content_image[0]}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } else if (err.response?.status === 413) {
        errorMessage = '업로드한 이미지 크기가 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.';
      } else if (err.response?.status >= 500) {
        errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시글 수정
  const updatePost = useCallback(async (postId, postData) => {
    setLoading(true);
    setError(null);
    
    try {
      const backendData = transformPostToBackend(postData);
      const response = await communityAPI.updatePost(postId, backendData);
      const transformedPost = transformPostFromBackend(response);
      transformedPost.views = getViewsFromStorage(postId);
      
      // 기존 게시글 업데이트
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === parseInt(postId) ? transformedPost : post
        )
      );
      
      return transformedPost;
    } catch (err) {
      setError(err.response?.data?.detail || '게시글 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시글 삭제
  const deletePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      await communityAPI.deletePost(postId);
      
      // 게시글 목록에서 제거
      setPosts(prevPosts => 
        prevPosts.filter(post => post.id !== parseInt(postId))
      );
      
      // 로컬 저장소에서 조회수 정보 제거
      localStorage.removeItem(`post_views_${postId}`);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || '게시글 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시글 좋아요 토글
  const toggleLike = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityAPI.likePost(postId);
      
      // 백엔드 응답에 따라 로컬 state 업데이트
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === parseInt(postId)
            ? { 
                ...post, 
                likes: response.like_count || 0, // 백엔드에서 제공하는 정확한 좋아요 수
                isLiked: response.liked || false // 백엔드에서 제공하는 좋아요 상태
              }
            : post
        )
      );
      
      return response;
    } catch (err) {
      setError(err.response?.data?.detail || '좋아요 처리에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 조회수 증가 (세션별 중복 방지 + 디바운싱)
  const incrementViews = useCallback(async (postId) => {
    try {
      // 세션별 조회 기록 확인 (같은 세션에서는 1번만 조회수 증가)
      const viewedPostsKey = 'fithub_viewed_posts';
      const sessionViewedPosts = JSON.parse(sessionStorage.getItem(viewedPostsKey) || '[]');
      
      // 이미 조회한 게시글이면 조회수 증가하지 않음
      if (sessionViewedPosts.includes(parseInt(postId))) {
        console.log(`게시글 ${postId}는 이미 이번 세션에서 조회했습니다.`);
        return;
      }
      
      // 디바운싱: 마지막 호출로부터 500ms 대기
      const debounceKey = `view_debounce_${postId}`;
      const lastViewTime = parseInt(sessionStorage.getItem(debounceKey) || '0');
      const currentTime = Date.now();
      
      if (currentTime - lastViewTime < 500) {
        console.log(`게시글 ${postId} 조회수 증가 디바운싱 중...`);
        return;
      }
      
      // 새로 조회하는 게시글이면 조회수 증가
      const currentViews = getViewsFromStorage(postId);
      const newViews = currentViews + 1;
      setViewsToStorage(postId, newViews);
      
      // 세션 조회 기록에 추가
      sessionViewedPosts.push(parseInt(postId));
      sessionStorage.setItem(viewedPostsKey, JSON.stringify(sessionViewedPosts));
      sessionStorage.setItem(debounceKey, currentTime.toString());
      
      // 로컬 state 업데이트
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === parseInt(postId)
            ? { ...post, views: newViews }
            : post
        )
      );
      
      console.log(`게시글 ${postId} 조회수 증가: ${currentViews} → ${newViews}`);
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  }, []);

  // ============ 댓글 관련 함수들 ============

  // 댓글 목록 조회
  const fetchComments = useCallback(async (postId) => {
    try {
      setLoading(true);
      const commentsData = await communityAPI.getComments(postId);
      setComments(prev => ({
        ...prev,
        [postId]: commentsData
      }));
      return commentsData;
    } catch (err) {
      console.error('댓글 조회 실패:', err);
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
      // 실패시 빈 배열 반환
      setComments(prev => ({
        ...prev,
        [postId]: []
      }));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 댓글 생성
  const createComment = useCallback(async (postId, content) => {
    try {
      setLoading(true);
      const newComment = await communityAPI.createComment(postId, { content });
      
      // 로컬 상태 업데이트
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      // 게시글의 댓글 수 증가
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === parseInt(postId)
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        )
      );
      
      return newComment;
    } catch (err) {
      console.error('댓글 생성 실패:', err);
      setError('댓글 작성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 댓글 수정
  const updateComment = useCallback(async (postId, commentId, content) => {
    try {
      setLoading(true);
      const updatedComment = await communityAPI.updateComment(postId, commentId, { content });
      
      // 로컬 상태 업데이트
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(comment =>
          comment.id === commentId ? updatedComment : comment
        )
      }));
      
      return updatedComment;
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      setError('댓글 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 댓글 삭제
  const deleteComment = useCallback(async (postId, commentId) => {
    try {
      setLoading(true);
      await communityAPI.deleteComment(postId, commentId);
      
      // 로컬 상태 업데이트
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(comment => comment.id !== commentId)
      }));
      
      // 게시글의 댓글 수 감소
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === parseInt(postId)
            ? { ...post, comments: Math.max((post.comments || 0) - 1, 0) }
            : post
        )
      );
      
      return true;
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      setError('댓글 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 댓글 좋아요 토글
  const toggleCommentLike = useCallback(async (postId, commentId) => {
    try {
      const response = await communityAPI.likeComment(commentId);
      
      // 로컬 상태 업데이트
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(comment =>
          comment.id === commentId 
            ? { 
                ...comment, 
                like_count: response.like_count,
                isLiked: response.liked 
              }
            : comment
        )
      }));
      
      return response;
    } catch (err) {
      console.error('댓글 좋아요 실패:', err);
      setError('댓글 좋아요에 실패했습니다.');
      throw err;
    }
  }, []);

  // 특정 게시글의 댓글 가져오기
  const getCommentsByPostId = useCallback((postId) => {
    return comments[postId] || [];
  }, [comments]);

  // ============ 사용자 태그 관련 함수들 ============

  // 사용자 검색 (태그 자동완성용)
  const searchUsers = useCallback(async (query) => {
    try {
      // 실제로는 사용자 검색 API를 호출해야 하지만, 현재는 더미 데이터 반환
      const dummyUsers = [
        { id: 1, username: '근육맨', name: '김철수' },
        { id: 2, username: 'Jessica', name: '제시카' },
        { id: 3, username: 'Michael', name: '마이클' },
        { id: 4, username: '다이어터', name: '이영희' },
        { id: 5, username: '요가마스터', name: '박요가' },
        { id: 6, username: '홈트초보', name: '홈트신' },
        { id: 7, username: '러닝러버', name: '런런이' },
        { id: 8, username: '운동고민러', name: '고민맨' }
      ];
      
      return dummyUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      return [];
    }
  }, []);

  // 태그된 사용자들 정보 가져오기
  const fetchTaggedUsersInfo = useCallback(async (userTags) => {
    try {
      // 실제로는 사용자 정보 API를 호출해야 하지만, 현재는 더미 데이터 반환
      const userInfo = {};
      userTags.forEach(username => {
        userInfo[username] = {
          id: Math.floor(Math.random() * 1000),
          username,
          name: username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
        };
      });
      
      return userInfo;
    } catch (err) {
      console.error('태그된 사용자 정보 조회 실패:', err);
      return {};
    }
  }, []);

  // ============ 기존 기능 함수들 (점진적 연동) ============

  // 전체 게시글 목록 가져오기
  const getAllPosts = () => {
    return posts;
  };

  // 카테고리별 게시글 필터링
  const getPostsByCategory = (categoryId) => {
    if (categoryId === 'all') {
      return posts;
    }
    return posts.filter(post => post.category === categoryId);
  };

  // 게시글 ID로 특정 게시글 가져오기
  const getPostById = (postId) => {
    return posts.find(post => post.id === parseInt(postId));
  };

  // 인기 게시글 가져오기 (홈페이지용)
  const getPopularPosts = (limit = 2) => {
    return posts
      .filter(post => post.isPopular)
      .sort((a, b) => {
        const scoreA = a.likes * 2 + a.comments * 1.5 + a.views * 0.1;
        const scoreB = b.likes * 2 + b.comments * 1.5 + b.views * 0.1;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  };

  // 최신 게시글 가져오기
  const getLatestPosts = (limit = 5) => {
    return [...posts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  };

  // 게시글 정렬
  const getSortedPosts = (postsToSort, sortOption = sortBy) => {
    const sortedPosts = [...postsToSort];
    
    switch (sortOption) {
      case SORT_OPTIONS.LATEST:
        return sortedPosts.sort((a, b) => b.createdAt - a.createdAt);
      
      case SORT_OPTIONS.POPULAR:
        return sortedPosts.sort((a, b) => {
          const scoreA = a.likes * 2 + a.comments * 1.5 + a.views * 0.1;
          const scoreB = b.likes * 2 + b.comments * 1.5 + b.views * 0.1;
          return scoreB - scoreA;
        });
      
      case SORT_OPTIONS.LIKES:
        return sortedPosts.sort((a, b) => b.likes - a.likes);
      
      case SORT_OPTIONS.COMMENTS:
        return sortedPosts.sort((a, b) => b.comments - a.comments);
      
      case SORT_OPTIONS.VIEWS:
        return sortedPosts.sort((a, b) => b.views - a.views);
      
      default:
        return sortedPosts;
    }
  };

  // 필터링 및 정렬된 게시글 가져오기
  const getFilteredAndSortedPosts = () => {
    let filteredPosts = getPostsByCategory(activeCategory);
    
    // 태그 필터링 적용
    if (selectedTags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        selectedTags.some(tag => post.tags.includes(tag))
      );
    }
    
    return getSortedPosts(filteredPosts, sortBy);
  };

  // 게시글 검색
  const searchPosts = (query) => {
    if (!query.trim()) return posts;

    const lowercaseQuery = query.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.author.name.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      post.userTags.some(userTag => userTag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // 카테고리 목록 가져오기
  const getCategories = () => {
    return CATEGORIES;
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : '기타';
  };

  // 카테고리 배지 클래스 가져오기
  const getCategoryBadgeClass = (categoryId) => {
    switch (categoryId) {
      case 'tips':
        return 'bg-blue-100 text-blue-800';
      case 'questions':
        return 'bg-purple-100 text-purple-800';
      case 'achievements':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 카테고리별 사용 가능한 태그 가져오기 (동적으로 게시글에서 추출)
  const getTagsByCategory = (categoryId) => {
    const categoryPosts = categoryId === 'all' ? posts : posts.filter(post => post.category === categoryId);
    const allTags = categoryPosts.flatMap(post => post.tags);
    return [...new Set(allTags)].sort();
  };

  // 태그 토글 함수
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 태그 초기화 함수
  const clearTags = () => {
    setSelectedTags([]);
  };

  // 선택된 태그들 가져오기
  const getSelectedTags = () => {
    return selectedTags;
  };

  // 관련 게시글 가져오기 (동일한 태그를 가진 게시글)
  const getRelatedPosts = (currentPostId, limit = 3) => {
    const currentPost = getPostById(currentPostId);
    if (!currentPost || !currentPost.tags || currentPost.tags.length === 0) {
      return [];
    }

    const relatedPosts = posts
      .filter(post => {
        if (post.id === parseInt(currentPostId)) return false;
        return post.tags && post.tags.some(tag => currentPost.tags.includes(tag));
      })
      .map(post => {
        const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
        return {
          ...post,
          relevanceScore: commonTags.length,
          commonTags
        };
      })
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit);

    return relatedPosts;
  };

  // 커뮤니티 통계 정보
  const getCommunityStats = useMemo(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    
    const categoryStats = CATEGORIES.slice(1).map(category => ({
      ...category,
      count: posts.filter(post => post.category === category.id).length
    }));

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalViews,
      categoryStats,
      popularPostsCount: posts.filter(post => post.isPopular).length
    };
  }, [posts]);

  // ============ 생명주기 ============

  // 컴포넌트 마운트 시 게시글 목록 로드
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    // 상태
    posts,
    comments,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    selectedTags,
    setSelectedTags,

    // API 함수들
    fetchPosts,
    fetchPost,
    fetchMyPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    incrementViews,

    // 댓글 관련 함수들
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    getCommentsByPostId,

    // 사용자 태그 관련
    searchUsers,
    fetchTaggedUsersInfo,

    // 기존 기능 함수들 (호환성 유지)
    getAllPosts,
    getPostsByCategory,
    getPostById,
    getCategories,
    getPopularPosts,
    getLatestPosts,
    getSortedPosts,
    getFilteredAndSortedPosts,
    searchPosts,
    getTagsByCategory,
    toggleTag,
    clearTags,
    getSelectedTags,
    getRelatedPosts,
    getCategoryName,
    getCategoryBadgeClass,
    getCommunityStats,

    // 호환성을 위한 별칭
    addPost: createPost,

    // 상수
    SORT_OPTIONS,
    CATEGORIES,
    CATEGORY_MAPPING
  };
};

export default useCommunity; 