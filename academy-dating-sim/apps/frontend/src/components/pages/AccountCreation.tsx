import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AccountCreationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AccountCreationProps {
  onCreateAccount: (data: AccountCreationData) => boolean;
}

const AccountCreation: React.FC<AccountCreationProps> = ({ onCreateAccount }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<AccountCreationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) return '아이디를 입력해주세요.';
    if (formData.username.length < 3) return '아이디는 최소 3자 이상이어야 합니다.';
    if (!formData.email.trim()) return '이메일을 입력해주세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '올바른 이메일 형식을 입력해주세요.';
    if (!formData.password.trim()) return '비밀번호를 입력해주세요.';
    if (formData.password.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다.';
    if (formData.password !== formData.confirmPassword) return '비밀번호가 일치하지 않습니다.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate account creation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = onCreateAccount(formData);
      if (success) {
        alert('계정이 성공적으로 생성되었습니다!');
        navigate('/login');
      } else {
        setError('계정 생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('계정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            계정 생성
          </h1>
          <p className="text-purple-200">
            Labyrinth Academy에 오신 것을 환영합니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">아이디</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="아이디를 입력하세요 (3자 이상)"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">비밀번호 확인</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-300 font-semibold mb-2">서비스 약관</h4>
            <div className="text-purple-200 text-sm space-y-1">
              <p>• 본 게임은 18세 이상 이용 가능합니다</p>
              <p>• 부적절한 사용자명은 제재될 수 있습니다</p>
              <p>• 게임 데이터는 로컬에 저장됩니다</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>계정 생성 중...</span>
              </div>
            ) : (
              '계정 생성'
            )}
          </button>
        </form>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            onClick={() => navigate('/')}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← 홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-purple-300 hover:text-white transition-colors"
          >
            이미 계정이 있나요? 로그인 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;