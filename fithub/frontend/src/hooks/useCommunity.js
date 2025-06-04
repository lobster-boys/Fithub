import { useState, useEffect, useMemo, useCallback } from 'react';

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
  const [posts, setPosts] = useState(POSTS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.LATEST);
  const [selectedTags, setSelectedTags] = useState([]);

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
        // 인기도 점수 계산 (좋아요 * 2 + 댓글 * 1.5 + 조회수 * 0.1)
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
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // 새 게시글 추가
  const addPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    
    try {
      // 실제 환경에서는 API 호출
      const newPost = {
        id: Math.max(...posts.map(p => p.id)) + 1,
        ...postData,
        author: {
          name: '사용자',
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        likes: 0,
        comments: 0,
        views: 0,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        images: postData.images || [],
        tags: postData.tags || [],
        isPopular: false,
        isPinned: false
      };
      
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      return newPost;
    } catch (err) {
      setError(err.message || '게시글 작성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [posts]);

  // 게시글 좋아요 토글
  const toggleLike = useCallback(async (postId) => {
    setLoading(true);
    try {
      // 실제 환경에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (err) {
      setError(err.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 조회수 증가
  const incrementViews = useCallback(async (postId) => {
    try {
      // 실제 환경에서는 API 호출
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, views: post.views + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('조회수 증가 실패:', err);
    }
  }, []);

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

  // 카테고리별 사용 가능한 태그 가져오기
  const getTagsByCategory = (categoryId) => {
    const categoryTags = {
      'all': [...new Set(posts.flatMap(post => post.tags))],
      'tips': ['웨이트', '유산소', '요가', '스트레스', '힐링', '명상', '초보자', '팁', '근력운동'],
      'questions': ['코어', '복근', '질문', '크런치', '다이어트', '식단', '직장인', '근력운동', '유산소', '선택'],
      'achievements': ['챌린지', '성취', '전신운동', '30일', '러닝', '5km', '초보자'],
      'general': ['홈트레이닝', '장비', '추천', '예산', '일반']
    };
    
    return categoryTags[categoryId] || [];
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

    // 현재 게시글과 동일한 태그를 가진 다른 게시글들 찾기
    const relatedPosts = posts
      .filter(post => {
        // 현재 게시글 제외
        if (post.id === parseInt(currentPostId)) return false;
        
        // 공통 태그가 있는지 확인
        return post.tags && post.tags.some(tag => currentPost.tags.includes(tag));
      })
      .map(post => {
        // 공통 태그 개수 계산 (관련도 점수)
        const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
        return {
          ...post,
          relevanceScore: commonTags.length,
          commonTags
        };
      })
      .sort((a, b) => {
        // 관련도 점수 높은 순으로 정렬, 같으면 최신순
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

  return {
    // 상태
    posts,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    selectedTags,
    setSelectedTags,

    // 기본 조회 함수
    getAllPosts,
    getPostsByCategory,
    getPostById,
    getCategories,

    // 추천 및 정렬
    getPopularPosts,
    getLatestPosts,
    getSortedPosts,
    getFilteredAndSortedPosts,

    // 검색 및 필터링
    searchPosts,

    // 태그 관련
    getTagsByCategory,
    toggleTag,
    clearTags,
    getSelectedTags,
    getRelatedPosts,

    // 게시글 관리
    addPost,
    toggleLike,
    incrementViews,

    // 유틸리티
    getCategoryName,
    getCategoryBadgeClass,
    getCommunityStats,

    // 상수
    SORT_OPTIONS,
    CATEGORIES
  };
};

export default useCommunity; 