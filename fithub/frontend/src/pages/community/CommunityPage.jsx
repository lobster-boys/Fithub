import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useCommunity from '../../hooks/useCommunity';

const CommunityPage = () => {
  // 게시글 모달 상태
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    image: null,
    tags: []
  });

  // 태그/사용자 입력 관련 상태
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [triggerChar, setTriggerChar] = useState(''); // '@' 또는 '#'
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const contentTextareaRef = useRef(null);

  // 드롭다운 상태
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 커뮤니티 훅 사용 - 새로운 API 함수들 포함
  const {
    activeCategory,
    setActiveCategory,
    getFilteredAndSortedPosts,
    getCategories,
    getCategoryName,
    getCategoryBadgeClass,
    getTagsByCategory,
    toggleTag,
    clearTags,
    getSelectedTags,
    createPost,
    searchUsers,
    loading,
    error
  } = useCommunity();

  // 필터링된 게시글 가져오기
  const filteredPosts = getFilteredAndSortedPosts();
  
  // 카테고리 목록
  const categories = getCategories();

  // 컨텐츠 변경 핸들러 (사용자 태그 및 해시태그 지원)
  const handleContentChange = async (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setNewPost({ ...newPost, content: value });
    setCursorPosition(cursorPos);
    
    // '@' 또는 '#' 문자 감지
    const beforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    const lastTriggerIndex = Math.max(lastAtIndex, lastHashIndex);
    
    if (lastTriggerIndex !== -1) {
      const afterTrigger = beforeCursor.substring(lastTriggerIndex + 1);
      const hasSpace = afterTrigger.includes(' ');
      
      if (!hasSpace && afterTrigger.length <= 20) {
        const currentTrigger = lastTriggerIndex === lastAtIndex ? '@' : '#';
        setTriggerChar(currentTrigger);
        setSuggestionQuery(afterTrigger);
        setSelectedSuggestionIndex(0);
        
        // 사용자 태그인 경우 사용자 검색, 해시태그인 경우 기존 태그 검색
        if (currentTrigger === '@') {
          try {
            const users = await searchUsers(afterTrigger);
            setSuggestions(users.map(user => ({ type: 'user', ...user })));
          } catch (err) {
            console.error('사용자 검색 실패:', err);
            setSuggestions([]);
          }
        } else {
          // 해시태그 - 기존 태그에서 검색
          const availableTags = getTagsByCategory(newPost.category);
          const filteredTags = availableTags.filter(tag =>
            tag.toLowerCase().includes(afterTrigger.toLowerCase())
          );
          setSuggestions(filteredTags.map(tag => ({ type: 'tag', name: tag, id: tag })));
        }
        
        setShowSuggestionDropdown(true);
      } else {
        setShowSuggestionDropdown(false);
      }
    } else {
      setShowSuggestionDropdown(false);
    }
  };

  // 키보드 이벤트 핸들러 (드롭다운 네비게이션)
  const handleKeyDown = (e) => {
    if (!showSuggestionDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedSuggestionIndex]) {
          insertSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestionDropdown(false);
        break;
    }
  };

  // 제안 항목 삽입
  const insertSuggestion = (suggestion) => {
    const textarea = contentTextareaRef.current;
    const content = newPost.content;
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    
    // 마지막 트리거 문자 위치 찾기
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    const lastTriggerIndex = Math.max(lastAtIndex, lastHashIndex);
    
    if (lastTriggerIndex !== -1) {
      const beforeTrigger = content.substring(0, lastTriggerIndex);
      const suggestionText = suggestion.type === 'user' ? suggestion.username : suggestion.name;
      const newContent = beforeTrigger + triggerChar + suggestionText + ' ' + afterCursor;
      const newCursorPos = beforeTrigger.length + triggerChar.length + suggestionText.length + 1;
      
      setNewPost({ ...newPost, content: newContent });
      setShowSuggestionDropdown(false);
      
      // 커서 위치 설정
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // 새 게시글 작성 핸들러
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      await createPost(newPost);
      setShowPostModal(false);
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        image: null,
        tags: []
      });
      setShowSuggestionDropdown(false);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 이미지 파일 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 유효성 검사
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('이미지 크기는 5MB 이하만 가능합니다.');
        return;
      }
      
      setNewPost({ ...newPost, image: file });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">FitHub 커뮤니티</h1>
          <p className="text-gray-600">운동 관련 정보와 경험을 공유해보세요.</p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center mt-4 sm:mt-0"
        >
          <i className="fas fa-edit mr-2"></i>
          새 글 작성
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">게시글을 불러오는 중...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* 카테고리 탭 및 필터 */}
      <div className="mb-6">
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const availableTags = getTagsByCategory(category.id);
            const hasDropdown = availableTags.length > 0 && category.id !== 'all';
            
            return (
              <div key={category.id} className="relative" ref={showDropdown === category.id ? dropdownRef : null}>
                <button
                  onClick={() => {
                    setActiveCategory(category.id);
                    if (hasDropdown) {
                      setShowDropdown(showDropdown === category.id ? null : category.id);
                    } else {
                      setShowDropdown(null);
                    }
                    if (category.id !== activeCategory) {
                      clearTags(); // 카테고리 변경 시 태그 초기화
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.name}
                  {hasDropdown && (
                    <i className={`fas fa-chevron-down ml-2 transition-transform ${
                      showDropdown === category.id ? 'rotate-180' : ''
                    }`}></i>
                  )}
                </button>

                {/* 드롭다운 메뉴 */}
                {hasDropdown && showDropdown === category.id && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64 z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">태그 필터</h4>
                      {getSelectedTags().length > 0 && (
                        <button
                          onClick={clearTags}
                          className="text-sm text-primary hover:text-primary-dark"
                        >
                          전체 해제
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableTags.map((tag) => {
                        const isSelected = getSelectedTags().includes(tag);
                        return (
                          <label
                            key={tag}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTag(tag)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{tag}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 선택된 태그 표시 */}
        {getSelectedTags().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600 mr-2">선택된 태그:</span>
            {getSelectedTags().map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary bg-opacity-10 text-primary"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-primary-dark"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Link to={`/community/${post.id}`} key={post.id} className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`;
                    }}
                  />
                  <div>
                    <h3 className="font-bold">{post.author.name}</h3>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeClass(post.category)}`}>
                      {getCategoryName(post.category)}
                    </span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-700 line-clamp-3 mb-4">{post.content}</p>
                
                {/* 해시태그 표시 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 사용자 태그 표시 */}
                {post.userTags && post.userTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.userTags.map((userTag, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        @{userTag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 이미지 표시 */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="flex items-center mr-4">
                    <i className="fas fa-heart mr-1"></i>
                    {post.likes}
                  </span>
                  <span className="flex items-center mr-4">
                    <i className="fas fa-comment mr-1"></i>
                    {post.comments}
                  </span>
                  <span className="flex items-center">
                    <i className="fas fa-eye mr-1"></i>
                    {post.views}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-comments text-gray-400 text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">게시글이 없습니다</h3>
            <p className="text-gray-500 mb-4">첫 번째 게시글을 작성해보세요!</p>
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              게시글 작성하기
            </button>
          </div>
        )}
      </div>

      {/* 새 게시글 작성 모달 */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">새 게시글 작성</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setShowSuggestionDropdown(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handlePostSubmit}>
                {/* 카테고리 선택 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 제목 입력 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="게시글 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* 내용 입력 */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    💡 팁: @사용자명으로 사용자를 태그하고, #태그명으로 해시태그를 추가할 수 있습니다.
                  </div>
                  <textarea
                    ref={contentTextareaRef}
                    value={newPost.content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    placeholder="게시글 내용을 입력하세요&#10;&#10;@ + 사용자명으로 사용자 태그&#10;# + 태그명으로 해시태그 추가&#10;![이미지 설명](이미지URL)으로 마크다운 이미지 추가"
                    rows="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />

                  {/* 자동완성 드롭다운 */}
                  {showSuggestionDropdown && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id || suggestion.username}
                          onClick={() => insertSuggestion(suggestion)}
                          className={`px-3 py-2 cursor-pointer flex items-center ${
                            index === selectedSuggestionIndex ? 'bg-primary bg-opacity-10' : 'hover:bg-gray-50'
                          }`}
                        >
                          {suggestion.type === 'user' ? (
                            <>
                              <img
                                src={suggestion.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.username)}&background=random`}
                                alt={suggestion.username}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <div>
                                <div className="font-medium">{suggestion.username}</div>
                                {suggestion.name && suggestion.name !== suggestion.username && (
                                  <div className="text-xs text-gray-500">{suggestion.name}</div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-hashtag text-gray-400 mr-2"></i>
                              <span>{suggestion.name}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 이미지 업로드 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 (선택사항)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {newPost.image && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">선택된 파일: {newPost.image.name}</span>
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostModal(false);
                      setShowSuggestionDropdown(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '작성 중...' : '게시글 작성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage; 