import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
  // 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState('all');

  // 게시글 모달 상태
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  // 샘플 게시글 데이터
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '초보자를 위한 웨이트 트레이닝 팁',
      content: '안녕하세요! 오늘은 처음 웨이트 트레이닝을 시작하시는 분들을 위한 꿀팁을 공유해드리려고 합니다...',
      category: 'tips',
      author: {
        name: '근육맨',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      likes: 24,
      comments: 12,
      date: '2023-05-15',
      images: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80']
    },
    {
      id: 2,
      title: '오늘의 운동 인증합니다! 드디어 100kg 벤치프레스 성공',
      content: '6개월간의 노력 끝에 드디어 벤치프레스 100kg에 성공했습니다! 정말 기분이 좋네요...',
      category: 'achievements',
      author: {
        name: '헬린이탈출',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
      },
      likes: 56,
      comments: 18,
      date: '2023-05-17',
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80']
    },
    {
      id: 3,
      title: '다이어트 식단 어떻게 관리하세요?',
      content: '살을 빼려고 노력 중인데, 식단 관리가 정말 어렵네요. 다들 어떻게 관리하시는지 팁 좀 부탁드려요...',
      category: 'questions',
      author: {
        name: '다이어터',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
      },
      likes: 32,
      comments: 45,
      date: '2023-05-18',
      images: []
    },
    {
      id: 4,
      title: '요가로 스트레스 관리하는 방법',
      content: '오늘은 스트레스를 해소하는 데 도움이 되는 간단한 요가 동작들을 공유해 드리려고 합니다...',
      category: 'tips',
      author: {
        name: '요가마스터',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      likes: 45,
      comments: 8,
      date: '2023-05-19',
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1520&q=80']
    }
  ]);

  // 카테고리별 게시글 필터링
  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeTab);
  
  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'tips', name: '운동 팁' },
    { id: 'questions', name: '질문/답변' },
    { id: 'achievements', name: '인증/후기' },
    { id: 'general', name: '자유 게시판' }
  ];

  // 새 게시글 작성 핸들러
  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    const newPostObj = {
      id: posts.length + 1,
      ...newPost,
      author: {
        name: '사용자',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
      },
      likes: 0,
      comments: 0,
      date: new Date().toISOString().split('T')[0],
      images: []
    };
    
    setPosts([newPostObj, ...posts]);
    setShowPostModal(false);
    setNewPost({
      title: '',
      content: '',
      category: 'general'
    });
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

      {/* 카테고리 탭 */}
      <div className="flex overflow-x-auto pb-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
              activeTab === category.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
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
              
              {post.images.length > 0 && (
                <div className="mb-4">
                  <img 
                    src={post.images[0]} 
                    alt="Post image" 
                    className="rounded-lg w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center text-gray-500 text-sm">
                <div className="flex items-center mr-4">
                  <i className="far fa-heart mr-1"></i>
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center">
                  <i className="far fa-comment mr-1"></i>
                  <span>{post.comments}</span>
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
                onClick={() => setShowPostModal(false)}
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
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
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
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-40"
                  placeholder="내용을 입력하세요"
                  required
                ></textarea>
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
                  onClick={() => setShowPostModal(false)}
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

// 카테고리에 맞는 배경색 클래스 반환
function getCategoryBadgeClass(category) {
  switch (category) {
    case 'tips':
      return 'bg-blue-100 text-blue-800';
    case 'questions':
      return 'bg-purple-100 text-purple-800';
    case 'achievements':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 카테고리 ID에 해당하는 이름 반환
function getCategoryName(categoryId) {
  const categoryMap = {
    'tips': '운동 팁',
    'questions': '질문/답변',
    'achievements': '인증/후기',
    'general': '자유 게시판'
  };
  
  return categoryMap[categoryId] || '기타';
}

export default CommunityPage; 