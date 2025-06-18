import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCommunity from '../../hooks/useCommunity';

const ContentDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  // 댓글 관련 상태
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState([]);
  
  // 사용자 멘션 관련 상태
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const commentTextareaRef = useRef(null);

  // 커뮤니티 훅 사용 - 새로운 API 함수들 포함
  const {
    fetchPost,
    getPostById,
    toggleLike,
    incrementViews,
    getCategoryName,
    getCategoryBadgeClass,
    getRelatedPosts,
    searchUsers,
    loading,
    error
  } = useCommunity();

  // 게시글 데이터
  const [currentPost, setCurrentPost] = useState(null);

  // 페이지 로드 시 게시글 데이터 로드 및 조회수 증가
  useEffect(() => {
    const loadPost = async () => {
      if (postId) {
        try {
          // 먼저 로컬에서 찾기
          let post = getPostById(postId);
          
          // 로컬에 없으면 API에서 가져오기
          if (!post) {
            post = await fetchPost(postId);
          }
          
          setCurrentPost(post);
          
          // 조회수 증가
          incrementViews(parseInt(postId));
          
          // 댓글 데이터 로드 (실제로는 댓글 API를 호출해야 함)
          loadComments(post);
        } catch (err) {
          console.error('게시글 로드 실패:', err);
        }
      }
    };

    loadPost();
  }, [postId, fetchPost, getPostById, incrementViews]);

  // 댓글 데이터 로드 (임시 더미 데이터)
  const loadComments = (post) => {
    if (post) {
      // 실제로는 댓글 API에서 데이터를 가져와야 함
      const dummyComments = [
        {
          id: 1,
          author: {
            name: '운동러버',
            username: 'workout_lover',
            avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
          },
          content: '정말 유용한 정보네요! 저도 따라해보겠습니다. @' + (post.author?.name || '작성자') + ' 감사합니다!',
          date: '2024-01-20',
          likes: 5,
          isLiked: false,
          replies: []
        },
        {
          id: 2,
          author: {
            name: '헬스초보',
            username: 'gym_newbie',
            avatar: 'https://randomuser.me/api/portraits/men/25.jpg'
          },
          content: '초보자도 쉽게 따라할 수 있을까요? 조금 더 자세한 설명 부탁드려요.',
          date: '2024-01-20',
          likes: 2,
          isLiked: false,
          replies: [
            {
              id: 3,
              author: {
                name: post?.author?.name || '작성자',
                username: post?.author?.username || 'author',
                avatar: post?.author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'
              },
              content: '@헬스초보 네, 초보자분도 충분히 따라하실 수 있어요! 처음에는 가벼운 무게부터 시작하시면 됩니다.',
              date: '2024-01-20',
              likes: 3,
              isLiked: false
            }
          ]
        }
      ];
      setComments(dummyComments);
    }
  };

  // 멘션 감지 및 처리
  const handleCommentChange = async (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setNewComment(value);
    setCursorPosition(cursorPos);
    
    // '@' 문자 감지
    const beforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      const hasSpace = afterAt.includes(' ');
      
      if (!hasSpace && afterAt.length <= 20) {
        setMentionQuery(afterAt);
        setSelectedMentionIndex(0);
        
        try {
          // 사용자 검색 API 호출
          const users = await searchUsers(afterAt);
          setMentionSuggestions(users);
          setShowMentionDropdown(users.length > 0);
        } catch (err) {
          console.error('사용자 검색 실패:', err);
          setMentionSuggestions([]);
          setShowMentionDropdown(false);
        }
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (!showMentionDropdown || mentionSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (mentionSuggestions[selectedMentionIndex]) {
          insertMention(mentionSuggestions[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        setShowMentionDropdown(false);
        break;
    }
  };

  // 멘션 삽입
  const insertMention = (user) => {
    const textarea = commentTextareaRef.current;
    const content = newComment;
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    
    // 마지막 '@' 위치 찾기
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = content.substring(0, lastAtIndex);
      const newContent = beforeAt + '@' + user.username + ' ' + afterCursor;
      const newCursorPos = beforeAt.length + user.username.length + 2;
      
      setNewComment(newContent);
      setShowMentionDropdown(false);
      
      // 커서 위치 설정
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // 실제로는 댓글 생성 API를 호출해야 함
      const newCommentData = {
        id: Date.now(), // 임시 ID
        author: {
          name: '현재사용자', // 실제로는 로그인한 사용자 정보
          username: 'current_user',
          avatar: 'https://ui-avatars.com/api/?name=현재사용자&background=random'
        },
        content: newComment,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        isLiked: false,
        replies: []
      };

      setComments(prevComments => [...prevComments, newCommentData]);
      setNewComment('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLike = async (commentId) => {
    try {
      // 실제로는 댓글 좋아요 API를 호출해야 함
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { 
                ...comment, 
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked 
              }
            : comment
        )
      );
    } catch (err) {
      console.error('댓글 좋아요 실패:', err);
    }
  };

  // 게시글 좋아요 핸들러
  const handlePostLike = async () => {
    if (!currentPost) return;
    
    try {
      await toggleLike(currentPost.id);
      // 로컬 상태 업데이트는 useCommunity 훅에서 처리됨
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  // 멘션이 포함된 텍스트 렌더링
  const renderTextWithMentions = (content) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // 멘션된 사용자명
        return (
          <span key={index} className="text-primary font-medium bg-primary bg-opacity-10 px-1 rounded">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  // 마크다운 이미지 렌더링
  const renderMarkdownImages = (content) => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts = content.split(imageRegex);
    
    const result = [];
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) {
        result.push(<span key={i}>{renderTextWithMentions(parts[i])}</span>);
      }
      if (parts[i + 1] !== undefined && parts[i + 2]) {
        result.push(
          <img
            key={i + 1}
            src={parts[i + 2]}
            alt={parts[i + 1]}
            className="max-w-full h-auto rounded-lg my-2"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        );
      }
    }
    
    return result.length > 0 ? result : renderTextWithMentions(content);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-red-800 mb-2">오류 발생</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/community')} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 게시글이 없는 경우
  if (!currentPost) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center bg-yellow-50 p-8 rounded-lg">
          <i className="fas fa-search text-yellow-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-yellow-600 mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <button 
            onClick={() => navigate('/community')} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 관련 게시글
  const relatedPosts = getRelatedPosts(postId, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        커뮤니티로 돌아가기
      </button>

      {/* 게시글 상세 */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* 게시글 헤더 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={currentPost.author.avatar}
                alt={currentPost.author.name}
                className="w-12 h-12 rounded-full mr-4"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPost.author.name)}&background=random`;
                }}
              />
              <div>
                <h3 className="font-bold text-lg">{currentPost.author.name}</h3>
                <p className="text-sm text-gray-500">{currentPost.date}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getCategoryBadgeClass(currentPost.category)}`}>
              {getCategoryName(currentPost.category)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{currentPost.title}</h1>
        </div>

        {/* 게시글 내용 */}
        <div className="p-6">
          <div className="prose max-w-none mb-6">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {renderMarkdownImages(currentPost.content)}
            </div>
          </div>

          {/* 해시태그 */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPost.tags.map((tag, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 사용자 태그 */}
          {currentPost.userTags && currentPost.userTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPost.userTags.map((userTag, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  @{userTag}
                </span>
              ))}
            </div>
          )}

          {/* 게시글 액션 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={handlePostLike}
                className={`flex items-center space-x-1 transition-colors ${
                  currentPost.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <i className={`${currentPost.isLiked ? 'fas' : 'far'} fa-heart`}></i>
                <span>{currentPost.likes}</span>
              </button>
              
              <button
                onClick={() => setShowCommentForm(true)}
                className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
              >
                <i className="far fa-comment"></i>
                <span>{comments.length}</span>
              </button>
              
              <div className="flex items-center space-x-1 text-gray-500">
                <i className="far fa-eye"></i>
                <span>{currentPost.views}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <i className="fas fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <i className="fas fa-comments mr-2"></i>
            댓글 ({comments.length})
          </h2>

          {/* 댓글 작성 폼 */}
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="relative">
                <textarea
                  ref={commentTextareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyDown={handleKeyDown}
                  placeholder="댓글을 입력하세요... (@사용자명으로 멘션 가능)"
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />

                {/* 멘션 자동완성 드롭다운 */}
                {showMentionDropdown && mentionSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                    {mentionSuggestions.map((user, index) => (
                      <div
                        key={user.id}
                        onClick={() => insertMention(user)}
                        className={`px-3 py-2 cursor-pointer flex items-center ${
                          index === selectedMentionIndex ? 'bg-primary bg-opacity-10' : 'hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                          alt={user.username}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <div>
                          <div className="font-medium">{user.username}</div>
                          {user.name && user.name !== user.username && (
                            <div className="text-xs text-gray-500">{user.name}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment('');
                    setShowMentionDropdown(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  댓글 작성
                </button>
              </div>
            </form>
          )}

          {/* 댓글 작성 버튼 */}
          {!showCommentForm && (
            <button
              onClick={() => setShowCommentForm(true)}
              className="w-full p-3 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6"
            >
              댓글을 입력하세요...
            </button>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{comment.date}</span>
                      </div>
                      <div className="text-gray-800 mb-2">
                        {renderTextWithMentions(comment.content)}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <i className={`${comment.isLiked ? 'fas' : 'far'} fa-heart`}></i>
                          <span>{comment.likes}</span>
                        </button>
                        <button className="text-sm text-gray-500 hover:text-primary transition-colors">
                          답글
                        </button>
                      </div>

                      {/* 대댓글 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-3 ml-4">
                              <img
                                src={reply.author.avatar}
                                alt={reply.author.name}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.name)}&background=random`;
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{reply.author.name}</span>
                                  <span className="text-xs text-gray-500">{reply.date}</span>
                                </div>
                                <div className="text-gray-800 text-sm mb-2">
                                  {renderTextWithMentions(reply.content)}
                                </div>
                                <div className="flex items-center space-x-4">
                                  <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                                    <i className="far fa-heart"></i>
                                    <span>{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-comments text-4xl mb-3"></i>
                <p>아직 댓글이 없습니다.</p>
                <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 관련 게시글 */}
      {relatedPosts.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <i className="fas fa-link mr-2"></i>
              관련 게시글
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/community/${relatedPost.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium mb-2 line-clamp-2">{relatedPost.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedPost.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{relatedPost.author.name}</span>
                    <span>{relatedPost.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ContentDetailPage; 