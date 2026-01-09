import { useState } from 'react';
import { motion } from 'framer-motion';
import { timeQiKe, DaLiuRenPan, parseDaLiuRenPan } from '../index';
import { interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';

interface DaLiuRenDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

export function DaLiuRenDemo({ isSettingsOpen, onSettingsClose }: DaLiuRenDemoProps) {
  const [result, setResult] = useState<DaLiuRenPan | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('claude');
  const [interpretation, setInterpretation] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);

  const handleTimeQiKe = () => {
    const res = timeQiKe();
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
      const panText = parseDaLiuRenPan(result);
      const prompt = `你是一位精通大六壬的大师。请根据以下大六壬课式进行详细解读：\n\n${panText}\n\n请从以下几个方面进行分析：\n1. 四课分析\n2. 三传解读\n3. 天将含义\n4. 吉凶判断\n5. 具体建议`;

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
          onClick={handleTimeQiKe}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间起课
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
          <h3 className="text-2xl font-bold text-white mb-4 text-center">大六壬课式</h3>
          <div className="space-y-4 text-gray-300">
            <div>
              <p className="text-green-300">起课时间：{result.year}年{result.month}月{result.day}日 {result.hour}时</p>
              <p>年干支：{result.ganZhi.year} | 月干支：{result.ganZhi.month}</p>
              <p>日干支：{result.ganZhi.day} | 时干支：{result.ganZhi.hour}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-green-300 font-bold mb-2">四课</h4>
                <p className="text-sm">第一课：{result.siKe.diYiKe.tianGan}{result.siKe.diYiKe.diZhi} {result.siKe.diYiKe.tianJiang}</p>
                <p className="text-sm">第二课：{result.siKe.diErKe.tianGan}{result.siKe.diErKe.diZhi} {result.siKe.diErKe.tianJiang}</p>
                <p className="text-sm">第三课：{result.siKe.diSanKe.tianGan}{result.siKe.diSanKe.diZhi} {result.siKe.diSanKe.tianJiang}</p>
                <p className="text-sm">第四课：{result.siKe.diSiKe.tianGan}{result.siKe.diSiKe.diZhi} {result.siKe.diSiKe.tianJiang}</p>
              </div>
              <div className="bg-teal-900/20 p-4 rounded-lg">
                <h4 className="text-teal-300 font-bold mb-2">三传</h4>
                <p className="text-sm">初传：{result.sanChuan.chuChuan.tianGan}{result.sanChuan.chuChuan.diZhi} {result.sanChuan.chuChuan.tianJiang}</p>
                <p className="text-sm">中传：{result.sanChuan.zhongChuan.tianGan}{result.sanChuan.zhongChuan.diZhi} {result.sanChuan.zhongChuan.tianJiang}</p>
                <p className="text-sm">末传：{result.sanChuan.moChuan.tianGan}{result.sanChuan.moChuan.diZhi} {result.sanChuan.moChuan.tianJiang}</p>
              </div>
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
