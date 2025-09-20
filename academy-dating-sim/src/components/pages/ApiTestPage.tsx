import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const ApiTestPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testApiResult, setTestApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test health check on component mount
  useEffect(() => {
    testHealthCheck();
  }, []);

  const testHealthCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.healthCheck();
      setHealthStatus(result);
    } catch (err) {
      setError('백엔드 연결 실패: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.testApi();
      setTestApiResult(result);
    } catch (err) {
      setError('API 테스트 실패: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.login('demo@academy-dating-sim.com', 'demo123');
      console.log('Login result:', result);
      alert('로그인 테스트 결과를 콘솔에서 확인하세요');
    } catch (err) {
      setError('로그인 테스트 실패: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            🔗 백엔드 API 연결 테스트
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
              <strong>오류:</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health Check */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🏥 Health Check</h2>
              <button
                onClick={testHealthCheck}
                disabled={isLoading}
                className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all"
              >
                {isLoading ? '테스트 중...' : '서버 상태 확인'}
              </button>
              {healthStatus && (
                <div className="bg-black/50 rounded p-3 text-sm">
                  <pre className="text-green-300 whitespace-pre-wrap">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* API Test */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🧪 API 테스트</h2>
              <button
                onClick={testApiEndpoint}
                disabled={isLoading}
                className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all"
              >
                {isLoading ? '테스트 중...' : 'API 엔드포인트 테스트'}
              </button>
              {testApiResult && (
                <div className="bg-black/50 rounded p-3 text-sm">
                  <pre className="text-blue-300 whitespace-pre-wrap">
                    {JSON.stringify(testApiResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Authentication Test */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🔐 인증 테스트</h2>
              <button
                onClick={testLogin}
                disabled={isLoading}
                className="w-full mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-all"
              >
                {isLoading ? '테스트 중...' : '로그인 테스트 (demo 계정)'}
              </button>
              <p className="text-gray-300 text-xs">
                데모 계정: demo@academy-dating-sim.com / demo123
              </p>
            </div>

            {/* Connection Status */}
            <div className="bg-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📊 연결 상태</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">프론트엔드:</span>
                  <span className="text-green-400">✅ http://localhost:5173</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">백엔드:</span>
                  <span className={healthStatus ? "text-green-400" : "text-red-400"}>
                    {healthStatus ? "✅" : "❌"} http://localhost:3001
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">데이터베이스:</span>
                  <span className="text-green-400">✅ Supabase PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;