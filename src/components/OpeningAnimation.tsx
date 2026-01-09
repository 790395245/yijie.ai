/**
 * 开场动画组件 - 深色神秘主题
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface OpeningAnimationProps {
  onSelect: (type: string) => void;
}

const DIVINATION_TYPES = [
  { id: 'liuyao', name: '六爻', description: '卜筮之源·问天机', icon: '☰' },
  { id: 'ziwei', name: '紫微斗数', description: '星宿命盘·观命运', icon: '☆' },
  { id: 'qimen', name: '奇门遁甲', description: '奇门遁术·测吉凶', icon: '⚔' },
  { id: 'daliuren', name: '大六壬', description: '三式之首·断未来', icon: '☯' }
];

export function OpeningAnimation({ onSelect }: OpeningAnimationProps) {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* 背景星空装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-150"></div>
      </div>

      {/* 太极八卦旋转 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-[20rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 bg-clip-text text-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          ☯
        </motion.div>
      </div>

      {/* 占卜类型卡片 - 固定在底部 */}
      {showCards && (
        <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-6 max-w-6xl mx-auto px-8">
          {DIVINATION_TYPES.map((type, index) => (
            <motion.button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className="flex-1 bg-gradient-to-br from-gray-900/60 to-indigo-950/60 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-gray-900/80 hover:to-indigo-950/80 transition-all cursor-pointer shadow-2xl"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05, y: -5, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              transition={{
                delay: index * 0.2,
                duration: 0.6,
                ease: 'easeOut'
              }}
            >
              <div className="text-center">
                <div className="text-6xl mb-3 filter drop-shadow-lg">{type.icon}</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent mb-2">{type.name}</h3>
                <p className="text-indigo-300/80 text-sm font-light">{type.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* 副标题 - 固定在顶部 */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <p className="text-xl text-indigo-200/90 font-light tracking-wider">探索古老智慧 · 解读天地玄机</p>
      </motion.div>

      {/* 标题图片 - 居中 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center px-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <img
          src="/yijie-logo.png"
          alt="易解"
          className="w-full max-w-4xl h-auto filter drop-shadow-2xl"
          style={{ filter: 'invert(1) brightness(0.9)' }}
        />
      </motion.div>
    </motion.div>
  );
}
