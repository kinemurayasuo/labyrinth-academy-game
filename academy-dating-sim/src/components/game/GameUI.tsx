import React from 'react';
import { useGameStore } from '../../store/useGameStore';

const GameUI: React.FC = () => {
  const {
    playerName,
    currentDay,
    currentPeriod,
    money,
    energy,
    level,
    currentLocation,
    changeLocation,
    advanceTime
  } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 text-white">
      {/* Header */}
      <div className="bg-black/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">Day</span>
              <span className="font-bold">{currentDay}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">Period</span>
              <span className="font-bold">{currentPeriod}</span>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="text-green-400">💰</span>
              <span className="font-bold">{money}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚡</span>
              <span className="font-bold">{energy}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">Level</span>
              <span className="font-bold">{level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Academy Dating Sim</h1>
          <p className="text-xl text-blue-300">Welcome, {playerName}!</p>
          <p className="text-gray-300 mt-2">Current Location: {currentLocation}</p>
        </div>

        {/* Location Navigation */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => changeLocation('classroom')}
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition"
          >
            📚 Classroom
          </button>
          <button
            onClick={() => changeLocation('cafeteria')}
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition"
          >
            🍽️ Cafeteria
          </button>
          <button
            onClick={() => changeLocation('library')}
            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition"
          >
            📖 Library
          </button>
          <button
            onClick={() => changeLocation('gym')}
            className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition"
          >
            🏃 Gym
          </button>
          <button
            onClick={() => changeLocation('rooftop')}
            className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg transition"
          >
            🌅 Rooftop
          </button>
          <button
            onClick={() => changeLocation('clubroom')}
            className="bg-pink-600 hover:bg-pink-700 p-4 rounded-lg transition"
          >
            🎭 Club Room
          </button>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={advanceTime}
              className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded transition"
            >
              ⏰ Advance Time
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 p-3 rounded transition">
              💬 Talk to Character
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 p-3 rounded transition">
              📋 View Quests
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 p-3 rounded transition">
              🎒 Inventory
            </button>
          </div>
        </div>

        {/* Character Status */}
        <div className="mt-8 bg-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Character Relationships</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded">
              <p className="text-sm text-gray-300">No relationships yet</p>
              <p className="text-xs text-gray-400 mt-2">Meet characters to build relationships!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;