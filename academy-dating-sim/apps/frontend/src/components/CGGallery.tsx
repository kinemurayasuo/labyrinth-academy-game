import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CGGalleryEntry } from '../../types/advanced-game';

interface CGGalleryProps {
  entries: CGGalleryEntry[];
  onClose: () => void;
}

export const CGGallery: React.FC<CGGalleryProps> = ({ entries, onClose }) => {
  const [selectedCG, setSelectedCG] = useState<CGGalleryEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const characters = [...new Set(entries.map(e => e.characterId))];
  const unlockedCount = entries.filter(e => e.unlocked).length;
  const completionRate = Math.round((unlockedCount / entries.length) * 100);

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.characterId === filter);

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const handleViewCG = (entry: CGGalleryEntry) => {
    if (entry.unlocked) {
      setSelectedCG(entry);
      entry.viewCount++;
    }
  };

  const characterColors: Record<string, string> = {
    sakura: '#FF69B4',
    yuki: '#87CEEB',
    luna: '#9370DB',
    mystery: '#4B0082',
    akane: '#DC143C',
    hana: '#FFB6C1',
    rin: '#32CD32',
    mei: '#FF6347',
    sora: '#4169E1'
  };

  return (
    <div className="cg-gallery fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      <div className="gallery-header bg-gradient-to-r from-purple-900 to-pink-900 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">CG Gallery</h1>
            <div className="flex items-center gap-4 text-white">
              <span>Collection: {unlockedCount}/{entries.length}</span>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span>{completionRate}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white text-3xl hover:text-gray-300 transition"
          >
            ×
          </button>
        </div>
      </div>

      <div className="gallery-filters p-4 bg-gray-900">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Characters
          </button>
          {characters.map(char => (
            <button
              key={char}
              onClick={() => setFilter(char)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === char
                  ? 'text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: filter === char ? characterColors[char] : undefined
              }}
            >
              {char.charAt(0).toUpperCase() + char.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-content flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {paginatedEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`cg-thumbnail relative rounded-lg overflow-hidden cursor-pointer ${
                    entry.unlocked ? 'hover:scale-105' : ''
                  } transition-transform`}
                  onClick={() => handleViewCG(entry)}
                  style={{
                    aspectRatio: '16/9',
                    border: `2px solid ${
                      entry.unlocked ? characterColors[entry.characterId] : '#4B5563'
                    }`
                  }}
                >
                  {entry.unlocked ? (
                    <>
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-3 text-white">
                          <h3 className="font-semibold text-sm">{entry.title}</h3>
                          <p className="text-xs opacity-80">{entry.description}</p>
                          <p className="text-xs mt-1">Views: {entry.viewCount}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-2">🔒</span>
                        <p className="text-gray-500 text-sm">Locked</p>
                        {entry.unlockCondition.affinity && (
                          <p className="text-xs text-gray-600 mt-1">
                            Affinity {entry.unlockCondition.affinity}+
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="pagination mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedCG && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cg-viewer fixed inset-0 bg-black bg-opacity-95 z-60 flex items-center justify-center"
            onClick={() => setSelectedCG(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedCG.imageUrl}
                alt={selectedCG.title}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedCG.title}</h2>
                <p className="text-gray-200">{selectedCG.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Character: {selectedCG.characterId} | Views: {selectedCG.viewCount}
                </p>
              </div>
              <button
                onClick={() => setSelectedCG(null)}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CGGallery;