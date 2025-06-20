import React, { useState, useEffect } from 'react';
import { X, Copy, Share2, Clock, Users, Settings } from 'lucide-react';
import { useRoutineShare } from '../../hooks/useRoutineShare';
import Button from '../common/Button';
import Input from '../common/Input';

const RoutineShareModal = ({ isOpen, onClose, routine }) => {
  const {
    shareLinks,
    sharePermissions,
    loading,
    error,
    createShareLink,
    fetchShareLinks,
    fetchSharePermissions,
    createSharePermission,
    deleteShareLink,
    deleteSharePermission,
    clearError
  } = useRoutineShare();

  const [activeTab, setActiveTab] = useState('link');
  const [linkData, setLinkData] = useState({
    routine: routine?.id,
    expires_at: '',
    is_active: true
  });
  const [permissionData, setPermissionData] = useState({
    routine: routine?.id,
    user: '',
    permission: 'view'
  });
  const [copiedUrl, setCopiedUrl] = useState('');

  useEffect(() => {
    if (isOpen && routine) {
      fetchShareLinks();
      fetchSharePermissions();
      setLinkData(prev => ({ ...prev, routine: routine.id }));
      setPermissionData(prev => ({ ...prev, routine: routine.id }));
    }
  }, [isOpen, routine, fetchShareLinks, fetchSharePermissions]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateShareLink = async (e) => {
    e.preventDefault();
    try {
      await createShareLink(linkData);
      setLinkData({
        routine: routine?.id,
        expires_at: '',
        is_active: true
      });
    } catch (err) {
      console.error('Failed to create share link:', err);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      await createSharePermission(permissionData);
      setPermissionData({
        routine: routine?.id,
        user: '',
        permission: 'view'
      });
    } catch (err) {
      console.error('Failed to create permission:', err);
    }
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '무제한';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            루틴 공유 - {routine?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Share2 className="inline w-4 h-4 mr-2" />
            공유 링크
          </button>
          <button
            onClick={() => setActiveTab('permission')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permission'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            사용자 권한
          </button>
        </div>

        {/* 공유 링크 탭 */}
        {activeTab === 'link' && (
          <div className="space-y-6">
            {/* 새 링크 생성 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">새 공유 링크 생성</h3>
              <form onSubmit={handleCreateShareLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    만료 날짜 (선택사항)
                  </label>
                  <Input
                    type="datetime-local"
                    value={linkData.expires_at}
                    onChange={(e) => setLinkData({ ...linkData, expires_at: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={linkData.is_active}
                    onChange={(e) => setLinkData({ ...linkData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    링크 활성화
                  </label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? '생성 중...' : '링크 생성'}
                </Button>
              </form>
            </div>

            {/* 기존 링크 목록 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">기존 공유 링크</h3>
              {shareLinks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">생성된 공유 링크가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div key={link.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {link.is_active ? '활성' : '비활성'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              만료: {formatDate(link.expires_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 break-all">
                            {link.share_url}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleCopyUrl(link.share_url)}
                            className={`p-1 rounded ${
                              copiedUrl === link.share_url
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => deleteShareLink(link.id)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 사용자 권한 탭 */}
        {activeTab === 'permission' && (
          <div className="space-y-6">
            {/* 새 권한 부여 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">사용자 권한 부여</h3>
              <form onSubmit={handleCreatePermission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자 ID
                  </label>
                  <Input
                    type="number"
                    placeholder="사용자 ID를 입력하세요"
                    value={permissionData.user}
                    onChange={(e) => setPermissionData({ ...permissionData, user: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    권한 레벨
                  </label>
                  <select
                    value={permissionData.permission}
                    onChange={(e) => setPermissionData({ ...permissionData, permission: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="view">보기 전용</option>
                    <option value="edit">편집 가능</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? '부여 중...' : '권한 부여'}
                </Button>
              </form>
            </div>

            {/* 기존 권한 목록 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">기존 사용자 권한</h3>
              {sharePermissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">부여된 권한이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {sharePermissions.map((permission) => (
                    <div key={permission.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">사용자 ID: {permission.user}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              permission.permission === 'admin' ? 'bg-red-100 text-red-800' :
                              permission.permission === 'edit' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {permission.permission === 'view' ? '보기' :
                               permission.permission === 'edit' ? '편집' : '관리자'}
                            </span>
                            <span className="text-xs text-gray-500">
                              부여자: {permission.granted_by}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSharePermission(permission.id)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoutineShareModal; 