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
    tags: []
  });

  // 태그 입력 관련 상태
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [triggerChar, setTriggerChar] = useState('');
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
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

  // 커뮤니티 훅 사용
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
    addPost,
    loading,
    error
  } = useCommunity();

  // 필터링된 게시글 가져오기
  const filteredPosts = getFilteredAndSortedPosts();
  
  // 카테고리 목록
  const categories = getCategories();

  // 태그 관련 함수들
  const handleContentChange = (e) => {
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
        setTriggerChar(lastTriggerIndex === lastAtIndex ? '@' : '#');
        setTagSearchQuery(afterTrigger);
        setShowTagDropdown(true);
        setSelectedTagIndex(0);
      } else {
        setShowTagDropdown(false);
      }
    } else {
      setShowTagDropdown(false);
    }
  };

  const getFilteredTags = () => {
    const availableTags = getTagsByCategory(newPost.category);
    if (!tagSearchQuery) return availableTags;
    
    const filtered = availableTags.filter(tag =>
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
    
    // 검색 결과가 변경되면 선택된 인덱스 초기화
    if (filtered.length > 0 && selectedTagIndex >= filtered.length) {
      setSelectedTagIndex(0);
    }
    
    return filtered;
  };

  const insertTag = (tag) => {
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
      const newContent = beforeTrigger + triggerChar + tag + ' ' + afterCursor;
      const newCursorPos = beforeTrigger.length + triggerChar.length + tag.length + 1;
      
      setNewPost({ ...newPost, content: newContent });
      setShowTagDropdown(false);
      
      // 태그를 newPost.tags 배열에 추가
      if (!newPost.tags.includes(tag)) {
        setNewPost(prev => ({
          ...prev,
          content: newContent,
          tags: [...prev.tags, tag]
        }));
      }
      
      // 커서 위치 설정
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 새 게시글 작성 핸들러
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addPost(newPost);
      setShowPostModal(false);
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        tags: []
      });
      setShowTagDropdown(false);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      // 에러 처리 (토스트 메시지 등)
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
        {filteredPosts.map((post) => (
          <Link to={`/community/${post.id}`} key={post.id} className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center mb-3">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-10 h-10 rounded-full mr-3"
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
              
              {/* 태그 표시 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs text-gray-500">
                      +{post.tags.length - 3}개
                    </span>
                  )}
                </div>
              )}
              
              {post.images.length > 0 && (
                <div className="mb-4">
                  <img 
                    src={post.images[0]} 
                    alt="Post image" 
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-gray-500 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <i className="far fa-heart mr-1"></i>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="far fa-comment mr-1"></i>
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="far fa-eye mr-1"></i>
                    <span>{post.views}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {post.date}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* 새 게시글 모달 */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">새 글 작성</h3>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setShowTagDropdown(false);
                  setNewPost({
                    title: '',
                    content: '',
                    category: 'general',
                    tags: []
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handlePostSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select 
                  value={newPost.category}
                  onChange={(e) => {
                    setNewPost({...newPost, category: e.target.value});
                    setShowTagDropdown(false); // 카테고리 변경 시 드롭다운 닫기
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {categories.filter(c => c.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <div className="relative">
                  <textarea 
                    ref={contentTextareaRef}
                    value={newPost.content}
                    onChange={handleContentChange}
                    onKeyDown={(e) => {
                      if (showTagDropdown) {
                        const filteredTags = getFilteredTags();
                        
                        if (e.key === 'Escape') {
                          setShowTagDropdown(false);
                          e.preventDefault();
                        } else if (e.key === 'ArrowDown') {
                          setSelectedTagIndex(prev => 
                            prev < filteredTags.length - 1 ? prev + 1 : 0
                          );
                          e.preventDefault();
                        } else if (e.key === 'ArrowUp') {
                          setSelectedTagIndex(prev => 
                            prev > 0 ? prev - 1 : filteredTags.length - 1
                          );
                          e.preventDefault();
                        } else if (e.key === 'Enter' && filteredTags.length > 0) {
                          insertTag(filteredTags[selectedTagIndex]);
                          e.preventDefault();
                        }
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-40"
                    placeholder="내용을 입력하세요 (@ 또는 #을 입력하여 태그 추가)"
                    required
                  ></textarea>
                  
                  {/* 태그 드롭다운 */}
                  {showTagDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                      <div className="p-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">
                          {triggerChar === '@' ? '멘션' : '해시태그'} 태그 선택
                        </p>
                      </div>
                      {getFilteredTags().length > 0 ? (
                        getFilteredTags().map((tag, index) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => insertTag(tag)}
                            className={`w-full text-left px-3 py-2 flex items-center transition-colors ${
                              index === selectedTagIndex 
                                ? 'bg-primary bg-opacity-10 text-primary' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-primary mr-2">{triggerChar}</span>
                            <span>{tag}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          검색 결과가 없습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 선택된 태그 표시 */}
                {newPost.tags.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추가된 태그
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary bg-opacity-10 text-primary"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 추가
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500">이미지를 드래그하거나 클릭하여 업로드하세요.</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostModal(false);
                    setShowTagDropdown(false);
                    setNewPost({
                      title: '',
                      content: '',
                      category: 'general',
                      tags: []
                    });
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-orange-600"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default CommunityPage; 