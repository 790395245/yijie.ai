import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LiuYaoDemo } from './features/liuyao/components/LiuYaoDemo'
import { QiMenDemo } from './features/qimen/components/QiMenDemo'
import { DaLiuRenDemo } from './features/daliuren/components/DaLiuRenDemo'
import { ZiWeiDemo } from './features/ziwei/components/ZiWeiDemo'
import { OpeningAnimation } from './components/OpeningAnimation'
import { BackToTop } from './components/BackToTop'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showOpening, setShowOpening] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleDivinationSelect = (type: string) => {
    if (type !== 'liuyao' && type !== 'qimen' && type !== 'daliuren' && type !== 'ziwei') {
      alert('敬请期待！此功能正在开发中...')
      return
    }
    setSelectedType(type)
    setShowOpening(false)
  }

  const handleBack = () => {
    setShowOpening(true)
    setSelectedType(null)
  }

  return (
    <>
      {/* 开场动画 - 全屏显示 */}
      <AnimatePresence>
        {showOpening && (
          <OpeningAnimation onSelect={handleDivinationSelect} />
        )}
      </AnimatePresence>

      {/* 主应用 - 只在开场动画结束后显示 */}
      {!showOpening && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 relative overflow-hidden">
          {/* 背景装饰 - 星空效果 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
            <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-300"></div>
          </div>

          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
            <header className="text-center mb-6 sm:mb-8 md:mb-12 relative">
              {/* 返回按钮 */}
              <button
                onClick={handleBack}
                className="absolute left-0 top-0 p-2 sm:p-3 text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/30 rounded-lg transition-all flex items-center gap-1 sm:gap-2 backdrop-blur-sm border border-purple-500/20"
                title="返回"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm sm:text-base">返回</span>
              </button>

              {/* 设置按钮 */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute right-0 top-0 p-2 sm:p-3 text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/30 rounded-lg transition-all backdrop-blur-sm border border-purple-500/20"
                title="设置"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* 标题区域 */}
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 tracking-wide">
                  易解
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-indigo-200/90 font-light tracking-wider">
                  探索古老智慧 · 解读天地玄机
                </p>

                {/* 周易八卦简介 */}
                <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-md rounded-xl border border-purple-500/20 shadow-2xl">
                  <p className="text-indigo-200/80 text-xs sm:text-sm leading-relaxed">
                    周易八卦，源自中华文明五千年的智慧结晶。以阴阳为基，演化八卦，推演六十四卦，
                    揭示天地万物运行之理。通过AI技术，让古老的占卜艺术焕发新生，
                    为您解读人生疑惑，洞察未来趋势。
                  </p>
                </div>
              </div>
            </header>

            <main className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-gray-900/80 to-indigo-950/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-purple-500/20">
                {selectedType === 'liuyao' && (
                  <LiuYaoDemo
                    isSettingsOpen={isSettingsOpen}
                    onSettingsClose={() => setIsSettingsOpen(false)}
                  />
                )}
                {selectedType === 'qimen' && (
                  <QiMenDemo
                    isSettingsOpen={isSettingsOpen}
                    onSettingsClose={() => setIsSettingsOpen(false)}
                  />
                )}
                {selectedType === 'daliuren' && (
                  <DaLiuRenDemo
                    isSettingsOpen={isSettingsOpen}
                    onSettingsClose={() => setIsSettingsOpen(false)}
                  />
                )}
                {selectedType === 'ziwei' && (
                  <ZiWeiDemo
                    isSettingsOpen={isSettingsOpen}
                    onSettingsClose={() => setIsSettingsOpen(false)}
                  />
                )}
              </div>
            </main>
          </div>

          {/* 回到顶部按钮 */}
          <BackToTop />
        </div>
      )}
    </>
  )
}

export default App
