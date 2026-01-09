import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { timeQiJu, QiMenPan, parseQiMenPan, GongInfo, GONG_NAMES } from '../index';
import { interpretWithClaude, interpretWithOpenAI } from '@/lib/ai';
import { SettingsPanel } from '@/components/SettingsPanel';

interface QiMenDemoProps {
  isSettingsOpen: boolean;
  onSettingsClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function QiMenDemo({ isSettingsOpen, onSettingsClose }: QiMenDemoProps) {
  const [result, setResult] = useState<QiMenPan | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('openai');
  const [model, setModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTimeQiJu = () => {
    const res = timeQiJu();
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
        const panText = parseQiMenPan(result);
        fullPrompt = `你是一位精通奇门遁甲的大师。请根据以下奇门遁甲盘进行详细解读：\n\n${panText}\n\n请从以下几个方面进行分析：\n1. 整体格局分析\n2. 值符值使的意义\n3. 九宫布局的吉凶\n4. 具体建议`;
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
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <motion.button
          onClick={handleTimeQiJu}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          时间起局
        </motion.button>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        apiUrl={apiUrl}
        apiKey={apiKey}
        apiType={apiType}
        model={model}
        onApiUrlChange={setApiUrl}
        onApiKeyChange={setApiKey}
        onApiTypeChange={setApiType}
        onModelChange={setModel}
      />

      {result && (
        <AnimatePresence mode="wait">
          <QiMenPanDisplay key="qimen-pan" pan={result} />
        </AnimatePresence>
      )}

      {messages.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔮</span>
            <span>AI解读</span>
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === 'user'
                    ? 'bg-blue-900/30 border-blue-500/30'
                    : 'bg-purple-900/30 border-purple-500/30'
                } border rounded-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-300">
                    {message.role === 'user' ? '👤 您' : '🤖 AI'}
                  </span>
                </div>
                <div className="text-gray-200 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {isInterpreting && (
            <div className="mt-4 flex items-center gap-2 text-purple-300">
              <div className="animate-pulse">●</div>
              <span className="text-sm">正在生成解读...</span>
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
          <div className="flex gap-3">
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
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
              disabled={isInterpreting}
            />
            <motion.button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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

// 奇门遁甲盘显示组件
function QiMenPanDisplay({ pan }: { pan: QiMenPan }) {
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
        奇门遁甲盘
      </motion.h3>

      <div className="text-center mb-6 text-gray-300">
        <p>起局时间：{pan.year}年{pan.month}月{pan.day}日 {pan.hour}时</p>
        <p>值符：{pan.zhiFu} | 值使：{pan.zhiShi} | 旬首：{pan.xunShou}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-4xl mx-auto">
        {pan.gongList.map((gongInfo, index) => (
          <GongCell key={index} gongInfo={gongInfo} delay={index * 0.05} />
        ))}
      </div>
    </motion.div>
  );
}

// 宫位单元格组件
function GongCell({ gongInfo, delay }: { gongInfo: GongInfo; delay: number }) {
  return (
    <motion.div
      className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 min-h-[120px]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="text-center space-y-1">
        <div className="text-amber-300 font-bold text-sm mb-2">
          {GONG_NAMES[gongInfo.gong]}
        </div>
        <div className="text-xs text-gray-300 space-y-0.5">
          <div>天干: {gongInfo.tianGan}</div>
          <div>地支: {gongInfo.diZhi}</div>
          <div className="text-purple-300">{gongInfo.baMen}</div>
          <div className="text-blue-300">{gongInfo.jiuXing}</div>
          <div className="text-pink-300">{gongInfo.baShen}</div>
        </div>
      </div>
    </motion.div>
  );
}
