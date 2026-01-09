import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performLiuYao, LiuYaoResult, YinYang } from '../index';
import { generateLiuYaoPrompt, interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';

interface LiuYaoDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

export function LiuYaoDemo({ isSettingsOpen, onSettingsClose }: LiuYaoDemoProps) {
  const [result, setResult] = useState<LiuYaoResult | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('claude');
  const [interpretation, setInterpretation] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);

  const handleRandomQiGua = () => {
    const res = performLiuYao('random');
    setResult(res);
    setInterpretation(''); // 清空之前的解读
  };

  const handleTimeQiGua = () => {
    const res = performLiuYao('time');
    setResult(res);
    setInterpretation(''); // 清空之前的解读
  };

  const handleInterpret = async () => {
    if (!result) return;
    if (!apiKey.trim()) {
      alert('请先输入API密钥');
      return;
    }
    if (apiType === 'openai' && !apiUrl.trim()) {
      alert('使用OpenAI时必须提供API URL');
      return;
    }

    setIsInterpreting(true);
    setInterpretation('');

    try {
      const prompt = generateLiuYaoPrompt(result);

      if (apiType === 'claude') {
        await interpretWithClaude(
          prompt,
          apiKey,
          apiUrl.trim() || undefined,
          (chunk) => {
            setInterpretation((prev) => prev + chunk);
          }
        );
      } else {
        await interpretWithOpenAI(
          prompt,
          apiKey,
          apiUrl,
          (chunk) => {
            setInterpretation((prev) => prev + chunk);
          }
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'AI解读失败');
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <motion.button
          onClick={handleRandomQiGua}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          随机起卦
        </motion.button>
        <motion.button
          onClick={handleTimeQiGua}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间起卦
        </motion.button>
      </div>

      {/* 获取AI解读按钮 */}
      {result && (
        <motion.button
          onClick={handleInterpret}
          disabled={isInterpreting || !apiKey.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isInterpreting ? '正在解读中...' : '🔮 获取AI解读'}
        </motion.button>
      )}

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        apiUrl={apiUrl}
        apiKey={apiKey}
        apiType={apiType}
        onApiUrlChange={setApiUrl}
        onApiKeyChange={setApiKey}
        onApiTypeChange={setApiType}
      />

      {result && (
        <AnimatePresence mode="wait">
          <motion.div
            key={result.benGua.name}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <GuaDisplay title="本卦" gua={result.benGua} />
            {result.bianGua && (
              <GuaDisplay title="变卦" gua={result.bianGua} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* AI解读结果显示 */}
      {interpretation && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔮</span>
            <span>AI解读</span>
          </h3>
          <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
            {interpretation}
          </div>
          {isInterpreting && (
            <div className="mt-4 flex items-center gap-2 text-purple-300">
              <div className="animate-pulse">●</div>
              <span className="text-sm">正在生成解读...</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// 卦象显示组件
function GuaDisplay({ title, gua }: { title: string; gua: any }) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3
        className="text-2xl font-bold text-white mb-4 text-center"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-3xl font-bold text-purple-300 mb-2">{gua.name}</p>
        <p className="text-lg text-gray-300">
          上卦：{gua.upperGua} | 下卦：{gua.lowerGua}
        </p>
      </motion.div>
      <div className="flex flex-col items-center space-y-2">
        {[...gua.yaoList].reverse().map((yao: any, index: number) => (
          <YaoLine key={index} yao={yao} position={6 - index} delay={index * 0.1} />
        ))}
      </div>
    </motion.div>
  );
}

// 爻线显示组件
function YaoLine({ yao, position, delay }: { yao: any; position: number; delay: number }) {
  const isYang = yao.yinYang === YinYang.Yang;

  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 + delay, duration: 0.3 }}
    >
      <span className="text-gray-400 w-8 text-right">{position}爻</span>
      <div className="flex gap-2">
        {isYang ? (
          <motion.div
            className={`w-32 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 + delay, duration: 0.4 }}
          />
        ) : (
          <>
            <motion.div
              className={`w-14 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + delay, duration: 0.4 }}
            />
            <motion.div
              className={`w-14 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + delay, duration: 0.4 }}
            />
          </>
        )}
      </div>
      <span className="text-gray-400 text-sm">
        {isYang ? '阳' : '阴'}{yao.isChanging ? ' (动)' : ''}
      </span>
    </motion.div>
  );
}
