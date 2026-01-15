import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { timePaiPan, ZiWeiPan, parseZiWeiPan } from '../index';
import { interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';
import { MessageContent } from '@/components/MessageContent';

interface ZiWeiDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ZiWeiDemo({ isSettingsOpen, onSettingsClose }: ZiWeiDemoProps) {
  const [result, setResult] = useState<ZiWeiPan | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('openai');
  const [model, setModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [enableAnimation] = useState<boolean>(true); // 紫微斗数暂不支持动画
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTimePaiPan = () => {
    const res = timePaiPan();
    setResult(res);
    setMessages([]);
    setUserQuestion('');
  };

  const handleInterpret = async () => {
    if (!result) return;

    const question = userQuestion.trim();

    const finalApiKey = apiKey.trim() || import.meta.env.VITE_DEFAULT_API_KEY || '';
    const finalApiUrl = apiUrl.trim() || import.meta.env.VITE_DEFAULT_API_URL || '';
    const finalApiType = apiType || (import.meta.env.VITE_DEFAULT_API_TYPE as 'openai' | 'claude') || 'openai';

    if (!finalApiKey) {
      alert('请先输入API密钥或配置环境变量');
      return;
    }
    if (finalApiType === 'openai' && !finalApiUrl) {
      alert('使用OpenAI时必须提供API URL或配置环境变量');
      return;
    }

    if (question) {
      setMessages(prev => [...prev, { role: 'user', content: question }]);
    }

    setIsInterpreting(true);
    setUserQuestion('');

    const assistantMessageIndex = messages.length + (question ? 1 : 0);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let fullPrompt = '';

      if (messages.length === 0) {
        const panText = parseZiWeiPan(result);
        fullPrompt = `你是一位精通紫微斗数的大师。请根据以下紫微斗数命盘进行详细解读：\n\n${panText}\n\n请从以下几个方面进行分析：\n1. 命宫分析\n2. 主星解读\n3. 十二宫位详解\n4. 性格特点\n5. 运势建议`;
        if (question) {
          fullPrompt += `\n\n用户问题：${question}`;
        }
      } else {
        fullPrompt = question || '请继续解读';
      }

      if (finalApiType === 'claude') {
        await interpretWithClaude(
          fullPrompt,
          finalApiKey,
          finalApiUrl || undefined,
          (chunk) => {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: newMessages[assistantMessageIndex].content + chunk
              };
              return newMessages;
            });
          },
          model || undefined
        );
      } else {
        await interpretWithOpenAI(
          fullPrompt,
          finalApiKey,
          finalApiUrl,
          (chunk) => {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: newMessages[assistantMessageIndex].content + chunk
              };
              return newMessages;
            });
          },
          model || undefined
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'AI解读失败');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <motion.button
          onClick={handleTimePaiPan}
          className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间排盘
        </motion.button>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        apiUrl={apiUrl}
        apiKey={apiKey}
        apiType={apiType}
        model={model}
        enableAnimation={enableAnimation}
        onApiUrlChange={setApiUrl}
        onApiKeyChange={setApiKey}
        onApiTypeChange={setApiType}
        onModelChange={setModel}
        onEnableAnimationChange={() => {}} // 紫微斗数暂不支持动画
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

      {messages.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/30 space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>🔮</span>
            <span>AI解读</span>
          </h3>
          <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === 'user'
                    ? 'bg-blue-900/30 border-blue-500/30'
                    : 'bg-purple-900/30 border-purple-500/30'
                } border rounded-lg p-3 sm:p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-300">
                    {message.role === 'user' ? '👤 您' : '🤖 AI'}
                  </span>
                </div>
                <MessageContent content={message.content} role={message.role} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {isInterpreting && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-purple-300">
              <div className="animate-pulse">●</div>
              <span className="text-xs sm:text-sm">正在生成解读...</span>
            </div>
          )}
        </motion.div>
      )}

      {/* AI解读输入框和按钮 - 固定在底部 */}
      {result && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isInterpreting) {
                  handleInterpret();
                }
              }}
              placeholder={messages.length === 0 ? "输入您的问题（可选），或直接点击获取解读..." : "继续提问..."}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
              disabled={isInterpreting}
            />
            <motion.button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isInterpreting ? '解读中...' : messages.length === 0 ? '🔮 获取解读' : '💬 发送'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
