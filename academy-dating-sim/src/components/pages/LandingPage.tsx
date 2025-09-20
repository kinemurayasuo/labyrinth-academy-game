import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onStartGame: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update active section based on scroll position
      const sections = ['home', 'features', 'characters', 'gameplay', 'download'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handlePlayNow = () => {
    onStartGame();
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Labyrinth Academy
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => scrollToSection('home')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'home' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  홈
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'features' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  특징
                </button>
                <button
                  onClick={() => scrollToSection('characters')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'characters' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  캐릭터
                </button>
                <button
                  onClick={() => scrollToSection('gameplay')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === 'gameplay' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  게임플레이
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={handlePlayNow}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all transform hover:scale-105"
                >
                  지금 플레이
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => scrollToSection('home')}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white w-full text-left"
              >
                홈
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white w-full text-left"
              >
                특징
              </button>
              <button
                onClick={() => scrollToSection('characters')}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white w-full text-left"
              >
                캐릭터
              </button>
              <button
                onClick={() => scrollToSection('gameplay')}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white w-full text-left"
              >
                게임플레이
              </button>
              <button
                onClick={() => navigate('/login')}
                className="block px-3 py-2 text-base font-medium bg-purple-600 hover:bg-purple-700 rounded-lg mx-2 text-center"
              >
                로그인
              </button>
              <button
                onClick={handlePlayNow}
                className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mx-2 text-center mt-2"
              >
                지금 플레이
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-blue-900/50"></div>
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 20}s`,
                }}
              >
                <div className="w-1 h-1 bg-purple-400/30 rounded-full blur-sm"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Labyrinth
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient animation-delay-1000">
                Academy
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4">
              마법과 로맨스가 만나는 곳
            </p>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              신비로운 미궁 학원에서 펼쳐지는 특별한 이야기.
              당신의 선택이 운명을 결정합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handlePlayNow}
              className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all transform hover:scale-110 shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                무료로 시작하기
              </span>
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 text-lg font-semibold border-2 border-purple-500 hover:bg-purple-500/20 rounded-full transition-all"
            >
              더 알아보기
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              게임 특징
            </h2>
            <p className="text-xl text-gray-400">
              Labyrinth Academy만의 특별한 경험
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">💕</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">로맨스 시스템</h3>
              <p className="text-gray-400">
                4명의 매력적인 히로인과 깊은 관계를 형성하세요.
                선물, 대화, 이벤트를 통해 호감도를 높이고 특별한 엔딩을 경험하세요.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">던전 탐험</h3>
              <p className="text-gray-400">
                신비로운 던전을 탐험하며 보물을 찾고 몬스터와 전투하세요.
                레벨업과 장비 강화로 더 강해지세요.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">학원 생활</h3>
              <p className="text-gray-400">
                수업 참여, 동아리 활동, 축제 등 다양한 학원 이벤트를 경험하세요.
                당신의 선택이 스토리를 바꿉니다.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">스탯 시스템</h3>
              <p className="text-gray-400">
                지능, 매력, 체력 등 6가지 스탯을 성장시키세요.
                스탯에 따라 새로운 선택지와 이벤트가 열립니다.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">수집 요소</h3>
              <p className="text-gray-400">
                다양한 아이템, 의상, CG 일러스트를 수집하세요.
                100% 달성에 도전해보세요.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold mb-3 text-purple-400">멀티 엔딩</h3>
              <p className="text-gray-400">
                당신의 선택에 따라 달라지는 10가지 이상의 엔딩.
                진정한 엔딩을 찾아보세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section id="characters" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              주요 캐릭터
            </h2>
            <p className="text-xl text-gray-400">
              당신과 함께할 특별한 인연들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Character Card - Sakura */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all hover:transform hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">🌸</span>
                </div>
                <h3 className="text-xl font-bold mb-2">사쿠라</h3>
                <p className="text-purple-400 mb-2">검술부 에이스</p>
                <p className="text-gray-400 text-sm">
                  강인한 외모와 달리 부드러운 마음을 가진 소녀.
                  검술 실력은 학원 최고 수준이다.
                </p>
              </div>
            </div>

            {/* Character Card - Yuki */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition-all hover:transform hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">❄️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">유키</h3>
                <p className="text-blue-400 mb-2">도서부 부장</p>
                <p className="text-gray-400 text-sm">
                  조용하고 지적인 성격의 소유자.
                  책을 사랑하며 신비로운 지식을 많이 알고 있다.
                </p>
              </div>
            </div>

            {/* Character Card - Luna */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all hover:transform hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">🌙</span>
                </div>
                <h3 className="text-xl font-bold mb-2">루나</h3>
                <p className="text-purple-400 mb-2">마법학부 수석</p>
                <p className="text-gray-400 text-sm">
                  천재적인 마법 재능을 가진 소녀.
                  밝고 활발한 성격으로 모두의 인기를 한 몸에 받는다.
                </p>
              </div>
            </div>

            {/* Character Card - Mystery */}
            <div className="group relative">
              <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl p-6 border border-gray-500/30 hover:border-gray-500/60 transition-all hover:transform hover:scale-105">
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-slate-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-6xl">❓</span>
                </div>
                <h3 className="text-xl font-bold mb-2">???</h3>
                <p className="text-gray-400 mb-2">수수께끼의 전학생</p>
                <p className="text-gray-400 text-sm">
                  갑작스럽게 나타난 신비한 전학생.
                  그녀의 정체는 아무도 모른다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Section */}
      <section id="gameplay" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              게임플레이
            </h2>
            <p className="text-xl text-gray-400">
              다양한 시스템으로 즐기는 학원 생활
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Gameplay Info */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">일정 관리</h3>
                  <p className="text-gray-400">
                    매일 아침, 점심, 저녁 시간대별로 다양한 활동을 선택하세요.
                    수업, 동아리, 아르바이트, 데이트 등 당신의 선택이 캐릭터를 성장시킵니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">대화 시스템</h3>
                  <p className="text-gray-400">
                    다양한 선택지를 통해 캐릭터들과 소통하세요.
                    당신의 대답에 따라 호감도와 스토리가 변화합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">퀘스트 시스템</h3>
                  <p className="text-gray-400">
                    메인 스토리와 서브 퀘스트를 완료하며 보상을 획득하세요.
                    숨겨진 퀘스트를 발견하면 특별한 보상이 기다립니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">도전 과제</h3>
                  <p className="text-gray-400">
                    100개 이상의 도전 과제를 달성하고 특별한 보상을 획득하세요.
                    숨겨진 업적을 모두 찾아보세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Gameplay Screenshots */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg aspect-video flex items-center justify-center border border-purple-500/30">
                <span className="text-4xl">🎮</span>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg aspect-video flex items-center justify-center border border-blue-500/30">
                <span className="text-4xl">🗺️</span>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg aspect-video flex items-center justify-center border border-green-500/30">
                <span className="text-4xl">⚔️</span>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg aspect-video flex items-center justify-center border border-orange-500/30">
                <span className="text-4xl">💕</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            무료로 플레이하고 특별한 모험을 시작하세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Web Version */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-purple-500/30">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold mb-3">웹 버전</h3>
              <p className="text-gray-400 mb-6">
                설치 없이 브라우저에서 바로 플레이
              </p>
              <button
                onClick={handlePlayNow}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg transition-all font-semibold"
              >
                웹으로 플레이
              </button>
            </div>

            {/* Android Version */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-green-500/30">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-3">Android</h3>
              <p className="text-gray-400 mb-6">
                Google Play 스토어에서 다운로드
              </p>
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-700 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                준비 중
              </button>
            </div>

            {/* iOS Version */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-blue-500/30">
              <div className="text-4xl mb-4">🍎</div>
              <h3 className="text-2xl font-bold mb-3">iOS</h3>
              <p className="text-gray-400 mb-6">
                App Store에서 다운로드
              </p>
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-700 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                준비 중
              </button>
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold mb-4">시스템 요구사항</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-400">최소 사양</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• 브라우저: Chrome 90+, Firefox 88+, Safari 14+</li>
                  <li>• 인터넷 연결 필요</li>
                  <li>• 1GB RAM</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-purple-400">권장 사양</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• 최신 버전 브라우저</li>
                  <li>• 안정적인 인터넷 연결</li>
                  <li>• 2GB+ RAM</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Labyrinth Academy
              </h3>
              <p className="text-gray-400 text-sm">
                마법과 로맨스가 만나는 학원 시뮬레이션 게임
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">게임</h4>
              <ul className="space-y-2">
                <li><button onClick={handlePlayNow} className="text-gray-400 hover:text-white transition-colors">플레이하기</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">특징</button></li>
                <li><button onClick={() => scrollToSection('characters')} className="text-gray-400 hover:text-white transition-colors">캐릭터</button></li>
                <li><button onClick={() => scrollToSection('gameplay')} className="text-gray-400 hover:text-white transition-colors">게임플레이</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">커뮤니티</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Reddit</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Forum</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">정보</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">문의하기</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">업데이트 노트</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 Labyrinth Academy. All rights reserved. Made with ❤️
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(5px) translateX(-5px);
          }
          75% {
            transform: translateY(-5px) translateX(5px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;