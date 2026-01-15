import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performLiuYao, LiuYaoResult, YinYang } from '../index';
import { generateLiuYaoPrompt, interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';
import { MessageContent } from '@/components/MessageContent';

interface LiuYaoDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function LiuYaoDemo({ isSettingsOpen, onSettingsClose }: LiuYaoDemoProps) {
  const [result, setResult] = useState<LiuYaoResult | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('openai');
  const [model, setModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [enableAnimation] = useState<boolean>(true); // 六爻暂不支持动画
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到对话框底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRandomQiGua = () => {
    const res = performLiuYao('random');
    setResult(res);
    setMessages([]); // 清空对话历史
    setUserQuestion(''); // 清空输入框
  };

  const handleTimeQiGua = () => {
    const res = performLiuYao('time');
    setResult(res);
    setMessages([]); // 清空对话历史
    setUserQuestion(''); // 清空输入框
  };

  const handleInterpret = async () => {
    if (!result) return;

    const question = userQuestion.trim();

    // 使用用户设置或环境变量中的默认值
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

    // 添加用户问题到对话历史
    if (question) {
      setMessages(prev => [...prev, { role: 'user', content: question }]);
    }

    setIsInterpreting(true);
    setUserQuestion(''); // 清空输入框

    // 添加一个空的助手消息用于流式更新
    const assistantMessageIndex = messages.length + (question ? 1 : 0);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let fullPrompt = '';

      // 如果是第一次解读，包含卦象信息
      if (messages.length === 0) {
        fullPrompt = generateLiuYaoPrompt(result);
        if (question) {
          fullPrompt += `\n\n用户问题：${question}`;
        }
      } else {
        // 后续对话，只发送用户问题
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
      // 移除失败的助手消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <motion.button
          onClick={handleRandomQiGua}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          随机起卦
        </motion.button>
        <motion.button
          onClick={handleTimeQiGua}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间起卦
        </motion.button>
      </div>

      {/* 设置面板 */}
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
        onEnableAnimationChange={() => {}} // 六爻暂不支持动画
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

      {/* AI解读对话历史显示 */}
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
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 text-sm sm:text-base"
              disabled={isInterpreting}
            />
            <motion.button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
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

// 卦象显示组件
function GuaDisplay({ title, gua }: { title: string; gua: any }) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3
        className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">{gua.name}</p>
        <p className="text-base sm:text-lg text-gray-300">
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
      className="flex items-center gap-2 sm:gap-3 md:gap-4"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 + delay, duration: 0.3 }}
    >
      <span className="text-gray-400 w-6 sm:w-8 text-right text-xs sm:text-sm">{position}爻</span>
      <div className="flex gap-1 sm:gap-2">
        {isYang ? (
          <motion.div
            className={`w-20 sm:w-28 md:w-32 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 + delay, duration: 0.4 }}
          />
        ) : (
          <>
            <motion.div
              className={`w-9 sm:w-12 md:w-14 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + delay, duration: 0.4 }}
            />
            <motion.div
              className={`w-9 sm:w-12 md:w-14 h-2 rounded ${yao.isChanging ? 'bg-red-500' : 'bg-white'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + delay, duration: 0.4 }}
            />
          </>
        )}
      </div>
      <span className="text-gray-400 text-xs sm:text-sm">
        {isYang ? '阳' : '阴'}{yao.isChanging ? ' (动)' : ''}
      </span>
    </motion.div>
  );
}
