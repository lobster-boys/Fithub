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
  
  // 대댓글 관련 상태
  const [replyingTo, setReplyingTo] = useState(null); // 답글 대상 댓글 ID
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const commentTextareaRef = useRef(null);

  // 커뮤니티 훅 사용
  const {
    getPostById,
    toggleLike,
    incrementViews,
    getCategoryName,
    getCategoryBadgeClass,
    getRelatedPosts,
    loading,
    error
  } = useCommunity();

  // 게시글 데이터
  const post = getPostById(postId);

  // 페이지 로드 시 조회수 증가 (한 번만 실행)
  useEffect(() => {
    if (postId) {
      incrementViews(parseInt(postId));
    }
  }, [postId]); // postId가 변경될 때만 실행

  // 샘플 댓글 데이터 (실제 환경에서는 API에서 가져올 데이터)
  useEffect(() => {
    if (post) {
      setComments([
        {
          id: 1,
          author: {
            name: '운동러버',
            avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
          },
          content: '정말 유용한 정보네요! 저도 따라해보겠습니다.',
          date: '2024-01-20',
          likes: 5,
          replies: []
        },
        {
          id: 2,
          author: {
            name: '헬스초보',
            avatar: 'https://randomuser.me/api/portraits/men/25.jpg'
          },
          content: '초보자도 쉽게 따라할 수 있을까요? 조금 더 자세한 설명 부탁드려요.',
          date: '2024-01-20',
          likes: 2,
          replies: [
            {
              id: 3,
              author: {
                name: post?.author?.name || '작성자',
                avatar: post?.author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'
              },
              content: '네, 초보자분도 충분히 따라하실 수 있어요! 처음에는 가벼운 무게부터 시작하시면 됩니다.',
              date: '2024-01-20',
              likes: 3
            }
          ]
        }
      ]);
    }
  }, [post]);

  // 모든 사용자 목록 가져오기 (멘션용)
  const getAllUsers = () => {
    const users = [post.author]; // 게시글 작성자
    
    // 댓글 작성자들 추가
    comments.forEach(comment => {
      if (!users.find(u => u.name === comment.author.name)) {
        users.push(comment.author);
      }
      // 대댓글 작성자들도 추가
      comment.replies?.forEach(reply => {
        if (!users.find(u => u.name === reply.author.name)) {
          users.push(reply.author);
        }
      });
    });
    
    return users;
  };

  // 멘션 감지 및 처리
  const handleCommentChange = (e) => {
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
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  // 필터링된 사용자 목록
  const getFilteredUsers = () => {
    const users = getAllUsers();
    if (!mentionQuery) return users;
    
    return users.filter(user =>
      user.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );
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
      const newContent = beforeAt + '@' + user.name + ' ' + afterCursor;
      const newCursorPos = beforeAt.length + user.name.length + 2;
      
      setNewComment(newContent);
      setShowMentionDropdown(false);
      
      // 커서 위치 설정
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // 댓글/대댓글 작성 핸들러
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // '@사용자명' 패턴 감지하여 대댓글 여부 판단
    const mentionMatch = newComment.match(/@(\w+)/);
    const isReply = mentionMatch && getAllUsers().some(user => user.name === mentionMatch[1]);
    
    if (isReply && mentionMatch) {
      // 대댓글 처리
      const mentionedUserName = mentionMatch[1];
      const parentComment = comments.find(comment => 
        comment.author.name === mentionedUserName || 
        comment.replies?.some(reply => reply.author.name === mentionedUserName)
      );
      
      if (parentComment) {
        const reply = {
          id: Date.now(), // 임시 ID
          author: {
            name: '사용자',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
          },
          content: newComment,
          date: new Date().toISOString().split('T')[0],
          likes: 0,
          mentionedUser: mentionedUserName
        };

        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === parentComment.id
              ? { ...comment, replies: [...(comment.replies || []), reply] }
              : comment
          )
        );
      }
    } else {
      // 일반 댓글 처리
      const comment = {
        id: Date.now(), // 임시 ID
        author: {
          name: '사용자',
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        content: newComment,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        replies: []
      };

      setComments([...comments, comment]);
    }

    setNewComment('');
    setShowCommentForm(false);
    setReplyingTo(null);
  };

  // 답글 버튼 클릭 핸들러
  const handleReplyClick = (comment) => {
    setReplyingTo(comment.id);
    setShowCommentForm(true);
    setNewComment(`@${comment.author.name} `);
    
    // 텍스트 영역에 포커스
    setTimeout(() => {
      if (commentTextareaRef.current) {
        commentTextareaRef.current.focus();
        commentTextareaRef.current.setSelectionRange(
          commentTextareaRef.current.value.length,
          commentTextareaRef.current.value.length
        );
      }
    }, 100);
  };

  // 댓글 내용에서 멘션 하이라이트
  const renderCommentContent = (content) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // 멘션된 사용자명
        const user = getAllUsers().find(u => u.name === part);
        if (user) {
          return (
            <span key={index} className="text-primary font-medium bg-primary bg-opacity-10 px-1 rounded">
              @{part}
            </span>
          );
        }
      }
      return part;
    });
  };

  // 좋아요 핸들러
  const handleLike = () => {
    if (post) {
      toggleLike(post.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Link 
            to="/community" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          뒤로가기
        </button>
      </div>

      {/* 게시글 내용 */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 게시글 헤더 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold text-lg">{post.author.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>조회 {post.views}</span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getCategoryBadgeClass(post.category)}`}>
              {getCategoryName(post.category)}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* 태그 표시 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 게시글 본문 */}
        <div className="p-6">
          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 이미지 표시 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`게시글 이미지 ${index + 1}`} 
                  className="w-full rounded-lg mb-4 last:mb-0"
                />
              ))}
            </div>
          )}

          {/* 게시글 액션 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <i className="far fa-heart"></i>
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <i className="far fa-comment"></i>
                <span>{comments.length}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors">
                <i className="far fa-share-square"></i>
                <span>공유</span>
              </button>
            </div>
            <button className="text-gray-600 hover:text-primary transition-colors">
              <i className="far fa-bookmark"></i>
            </button>
          </div>
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">댓글 {comments.length}개</h2>
          </div>

          {/* 댓글 작성 폼 */}
          {showCommentForm && (
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              {replyingTo && (
                <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-700">
                    <i className="fas fa-reply mr-2"></i>
                    답글 작성 중...
                  </p>
                </div>
              )}
              <form onSubmit={handleCommentSubmit}>
                <div className="flex space-x-4">
                  <img 
                    src="https://randomuser.me/api/portraits/lego/1.jpg" 
                    alt="사용자" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 relative">
                    <textarea
                      ref={commentTextareaRef}
                      value={newComment}
                      onChange={handleCommentChange}
                      onKeyDown={(e) => {
                        if (showMentionDropdown) {
                          const filteredUsers = getFilteredUsers();
                          
                          if (e.key === 'Escape') {
                            setShowMentionDropdown(false);
                            e.preventDefault();
                          } else if (e.key === 'ArrowDown') {
                            setSelectedMentionIndex(prev => 
                              prev < filteredUsers.length - 1 ? prev + 1 : 0
                            );
                            e.preventDefault();
                          } else if (e.key === 'ArrowUp') {
                            setSelectedMentionIndex(prev => 
                              prev > 0 ? prev - 1 : filteredUsers.length - 1
                            );
                            e.preventDefault();
                          } else if (e.key === 'Enter' && filteredUsers.length > 0) {
                            insertMention(filteredUsers[selectedMentionIndex]);
                            e.preventDefault();
                          }
                        }
                      }}
                      placeholder={replyingTo ? "답글을 입력하세요... (@사용자명으로 멘션)" : "댓글을 입력하세요... (@사용자명으로 멘션)"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none"
                      required
                    />
                    
                    {/* 멘션 드롭다운 */}
                    {showMentionDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                        <div className="p-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">
                            사용자 멘션
                          </p>
                        </div>
                        {getFilteredUsers().length > 0 ? (
                          getFilteredUsers().map((user, index) => (
                            <button
                              key={user.name}
                              type="button"
                              onClick={() => insertMention(user)}
                              className={`w-full text-left px-3 py-2 flex items-center transition-colors ${
                                index === selectedMentionIndex 
                                  ? 'bg-primary bg-opacity-10 text-primary' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <span className="text-primary mr-2">@</span>
                              <span>{user.name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-gray-500">
                        💡 @를 입력하여 사용자를 멘션할 수 있습니다
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCommentForm(false);
                            setNewComment('');
                            setReplyingTo(null);
                            setShowMentionDropdown(false);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                          {replyingTo ? '답글 작성' : '댓글 작성'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="divide-y divide-gray-100">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex space-x-4">
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name} 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{comment.author.name}</h4>
                        <span className="text-sm text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-gray-800 mb-3">{renderCommentContent(comment.content)}</p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-500">
                          <i className="far fa-heart"></i>
                          <span>{comment.likes}</span>
                        </button>
                        <button 
                          onClick={() => handleReplyClick(comment)}
                          className="text-sm text-gray-600 hover:text-primary"
                        >
                          답글
                        </button>
                      </div>

                      {/* 대댓글 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-6 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              <img 
                                src={reply.author.avatar} 
                                alt={reply.author.name} 
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-sm">{reply.author.name}</h5>
                                  <span className="text-xs text-gray-500">{reply.date}</span>
                                  {reply.mentionedUser && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                      답글
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-800 mb-2">{renderCommentContent(reply.content)}</p>
                                <div className="flex items-center space-x-3">
                                  <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-red-500">
                                    <i className="far fa-heart"></i>
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button 
                                    onClick={() => handleReplyClick(reply)}
                                    className="text-xs text-gray-600 hover:text-primary"
                                  >
                                    답글
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
              <div className="p-8 text-center">
                <i className="fas fa-comments text-gray-300 text-3xl mb-3"></i>
                <p className="text-gray-500 mb-4">아직 댓글이 없습니다.</p>
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  <i className="fas fa-plus mr-2"></i>
                  첫 번째 댓글 작성하기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 관련 게시글 추천 */}
      <section className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-6">관련 게시글</h2>
          {(() => {
            const relatedPosts = getRelatedPosts(postId, 3);
            
            if (relatedPosts.length === 0) {
              return (
                <div className="text-center text-gray-500 py-8">
                  <i className="fas fa-search text-3xl mb-3"></i>
                  <p>동일한 태그를 가진 관련 게시글이 없습니다.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/community/${relatedPost.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-primary hover:shadow-md"
                  >
                    {/* 게시글 이미지 */}
                    {relatedPost.images && relatedPost.images.length > 0 && (
                      <div className="mb-3">
                        <img
                          src={relatedPost.images[0]}
                          alt={relatedPost.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* 카테고리 배지 */}
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(relatedPost.category)}`}>
                        {getCategoryName(relatedPost.category)}
                      </span>
                    </div>
                    
                    {/* 제목 */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {relatedPost.title}
                    </h3>
                    
                    {/* 내용 미리보기 */}
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {relatedPost.content}
                    </p>
                    
                    {/* 공통 태그 표시 */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {relatedPost.commonTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-primary bg-opacity-10 text-primary rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {relatedPost.commonTags.length > 2 && (
                          <span className="inline-block px-2 py-1 text-xs text-gray-500">
                            +{relatedPost.commonTags.length - 2}개
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 작성자 및 통계 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <img
                          src={relatedPost.author.avatar}
                          alt={relatedPost.author.name}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span>{relatedPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <i className="far fa-heart mr-1"></i>
                          <span>{relatedPost.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="far fa-comment mr-1"></i>
                          <span>{relatedPost.comments}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="far fa-eye mr-1"></i>
                          <span>{relatedPost.views}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 관련도 표시 */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          공통 태그 {relatedPost.relevanceScore}개
                        </span>
                        <span className="text-xs text-primary">
                          자세히 보기 →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
};

export default ContentDetailPage; 