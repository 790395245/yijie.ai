import { useState } from 'react';
import { motion } from 'framer-motion';
import { timePaiPan, ZiWeiPan, parseZiWeiPan } from '../index';
import { interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';

interface ZiWeiDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

export function ZiWeiDemo({ isSettingsOpen, onSettingsClose }: ZiWeiDemoProps) {
  const [result, setResult] = useState<ZiWeiPan | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('claude');
  const [interpretation, setInterpretation] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);

  const handleTimePaiPan = () => {
    const res = timePaiPan();
    setResult(res);
    setInterpretation('');
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
      const panText = parseZiWeiPan(result);
      const prompt = `你是一位精通紫微斗数的大师。请根据以下紫微斗数命盘进行详细解读：\n\n${panText}\n\n请从以下几个方面进行分析：\n1. 命宫分析\n2. 主星解读\n3. 十二宫位详解\n4. 性格特点\n5. 运势建议`;

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
          onClick={handleTimePaiPan}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间排盘
        </motion.button>
      </div>

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
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4 text-center">紫微斗数命盘</h3>
          <div className="space-y-4">
            <div className="text-center text-gray-300">
              <p>排盘时间：{result.year}年{result.month}月{result.day}日 {result.hour}时</p>
              <p className="text-purple-300 font-bold mt-2">命宫：{result.mingGong}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {result.gongList.map((gongInfo, index) => (
                <div
                  key={index}
                  className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20"
                >
                  <div className="text-purple-300 font-bold text-sm mb-1">{gongInfo.gong}</div>
                  <div className="text-xs text-gray-400">{gongInfo.diZhi}</div>
                  <div className="text-xs text-gray-300 mt-1">
                    {gongInfo.zhuXing.join('、')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {interpretation && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
