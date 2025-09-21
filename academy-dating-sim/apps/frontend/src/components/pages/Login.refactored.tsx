import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, ModalActions } from '../ui';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = memo(({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await onLogin(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, onLogin, navigate]);

  const handleResetPassword = useCallback(async () => {
    if (!resetEmail) {
      setResetMessage('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();
      if (result.success) {
        setResetMessage(`임시 비밀번호가 이메일로 전송되었습니다.`);
        setTimeout(() => {
          setShowResetModal(false);
          setResetEmail('');
          setResetMessage('');
        }, 3000);
      } else {
        setResetMessage('비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      setResetMessage('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [resetEmail]);

  const handleNavigateToSignup = useCallback(() => {
    navigate('/account-creation');
  }, [navigate]);

  const handleNavigateBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">
            로그인
          </CardTitle>
          <p className="text-center text-purple-200 mt-2">
            계정에 로그인하여 게임을 계속하세요
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              disabled={isLoading}
              variant="filled"
              error={!!error}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              type="password"
              label="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
              variant="filled"
              error={!!error}
              errorMessage={error}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm text-purple-200 hover:text-white transition-colors"
                disabled={isLoading}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                로그인
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/30 text-purple-200">또는</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleNavigateToSignup}
                disabled={isLoading}
              >
                새 계정 만들기
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleNavigateBack}
                disabled={isLoading}
              >
                ← 메인으로 돌아가기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetEmail('');
          setResetMessage('');
        }}
        title="비밀번호 재설정"
        footer={
          <ModalActions
            onCancel={() => setShowResetModal(false)}
            onConfirm={handleResetPassword}
            confirmText="재설정 요청"
            cancelText="취소"
            isLoading={isLoading}
          />
        }
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            등록된 이메일 주소로 임시 비밀번호를 보내드립니다.
          </p>
          <Input
            type="email"
            label="이메일 주소"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={isLoading}
            error={!!resetMessage && !resetMessage.includes('전송되었습니다')}
            helperText={resetMessage}
          />
        </div>
      </Modal>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;