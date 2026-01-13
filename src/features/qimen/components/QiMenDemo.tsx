import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calculate, QiMenResult, parseQiMenPan } from '../index';
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

// 符号解读数据
const symbolInterpretations: Record<string, Record<string, string>> = {
  baMen: {
    '休门': '休门属水，为休养生息之门。主休息、停顿、和平。利于休养、学习、修炼。不宜动作、出行。',
    '生门': '生门属土，为生长发育之门。主生机、发展、财利。利于求财、经商、婚姻。百事皆吉。',
    '伤门': '伤门属木，为伤害损失之门。主伤病、破财、官非。不利出行、求财。宜医疗、讨债。',
    '杜门': '杜门属木，为闭塞阻隔之门。主阻碍、隐藏、躲避。利于隐藏、修炼。不利出行、求财。',
    '景门': '景门属火，为光明显现之门。主文书、信息、名声。利于考试、求名、文书。不利求财。',
    '死门': '死门属土，为死亡终结之门。主死亡、终结、凶险。不利百事。宜吊丧、打猎、捕捉。',
    '惊门': '惊门属金，为惊恐不安之门。主惊恐、口舌、官非。不利出行、求财。宜律师、演讲。',
    '开门': '开门属金，为开通顺利之门。主开始、通达、顺利。利于出行、求财、开业。百事皆吉。'
  },
  jiuXing: {
    '天蓬': '天蓬星属水，为贼星。主盗贼、暗昧、阴谋。不利正事，利于暗中行事、捕盗。',
    '天任': '天任星属土，为富星。主财富、田土、婚姻。利于求财、置业、婚嫁。百事皆吉。',
    '天冲': '天冲星属木，为威星。主冲动、急躁、争斗。利于军事、竞争。不利和平事务。',
    '天辅': '天辅星属木，为谋星。主智慧、谋略、辅助。利于求学、谋事、辅佐。百事皆吉。',
    '天英': '天英星属火，为明星。主文明、光彩、血光。利于文书、考试。不利武事、出行。',
    '天芮': '天芮星属土，为病星。主疾病、灾祸、阴暗。不利百事。宜医疗、养病。',
    '天柱': '天柱星属金，为刚星。主刚强、支撑、阻碍。利于建筑、支撑。不利柔和事务。',
    '天心': '天心星属金，为医星。主医疗、慈善、智慧。利于医疗、求学、行善。百事皆吉。',
    '天禽': '天禽星属土，为巧星。主技巧、中正、和合。利于技艺、调解、中介。百事皆吉。'
  },
  baShen: {
    '值符': '值符为天乙贵人，主吉祥、贵人、权威。百事皆吉，遇之大利。',
    '腾蛇': '腾蛇主虚惊、怪异、虚假。主虚惊、梦幻、不实之事。',
    '太阴': '太阴主阴私、暗昧、女性。利于阴谋、暗中行事、女性之事。',
    '六合': '六合主和合、婚姻、中介。利于婚姻、合作、交易。百事皆吉。',
    '白虎': '白虎主凶恶、血光、官非。主凶险、争斗、伤害。不利百事。',
    '玄武': '玄武主盗贼、暗昧、失物。主盗贼、遗失、阴谋。不利正事。',
    '九地': '九地主柔顺、隐藏、坚守。利于防守、隐藏、坚守。不利进攻。',
    '九天': '九天主刚健、高远、进取。利于进攻、高升、远行。百事皆吉。'
  }
};

export function QiMenDemo({ isSettingsOpen, onSettingsClose }: QiMenDemoProps) {
  const [result, setResult] = useState<QiMenResult | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiType, setApiType] = useState<'openai' | 'claude'>('openai');
  const [model, setModel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 动画状态：10个阶段
  // stage1: 显示时间信息和干支
  // stage2: 显示局数、阴遁阳遁
  // stage3: 动态画出九宫
  // stage4: 八卦方位落入九宫
  // stage5: 地盘天干排列并落入宫中
  // stage6: 旬首、值符、值使出现
  // stage7: 天盘九星落入宫中
  // stage8: 地盘干复制到天盘位置
  // stage9: 八门展示并飞入宫中
  // stage10: 八神展示并飞入宫中
  // complete: 动画完成
  const [animationStage, setAnimationStage] = useState<string>('idle');
  const [stageProgress, setStageProgress] = useState<number>(0); // 当前阶段的进度（用于逐个元素动画）

  // 符号解读状态
  const [selectedSymbol, setSelectedSymbol] = useState<{
    type: string;
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 动画流程控制
  useEffect(() => {
    if (!result) return;

    let timer: NodeJS.Timeout;

    switch (animationStage) {
      case 'idle':
        // 开始动画：第一阶段 - 显示时间信息
        timer = setTimeout(() => {
          setAnimationStage('stage1');
        }, 100);
        break;

      case 'stage1':
        // 第一阶段：显示时间信息和干支（持续2秒）
        timer = setTimeout(() => {
          setAnimationStage('stage2');
        }, 2000);
        break;

      case 'stage2':
        // 第二阶段：显示局数、阴遁阳遁（持续1.5秒）
        timer = setTimeout(() => {
          setAnimationStage('stage3');
        }, 1500);
        break;

      case 'stage3':
        // 第三阶段：动态画出九宫（持续1秒）
        timer = setTimeout(() => {
          setAnimationStage('stage4');
        }, 1000);
        break;

      case 'stage4':
        // 第四阶段：八卦方位落入九宫（持续1秒）
        timer = setTimeout(() => {
          setAnimationStage('stage5');
          setStageProgress(0);
        }, 1000);
        break;

      case 'stage5':
        // 第五阶段：地盘天干逐个落入宫中
        if (stageProgress < 9) {
          timer = setTimeout(() => {
            setStageProgress(prev => prev + 1);
          }, 200);
        } else {
          timer = setTimeout(() => {
            setAnimationStage('stage6');
          }, 500);
        }
        break;

      case 'stage6':
        // 第六阶段：旬首、值符、值使出现（持续1.5秒）
        timer = setTimeout(() => {
          setAnimationStage('stage7');
          setStageProgress(0);
        }, 1500);
        break;

      case 'stage7':
        // 第七阶段：天盘九星落入宫中
        if (stageProgress < 9) {
          timer = setTimeout(() => {
            setStageProgress(prev => prev + 1);
          }, 200);
        } else {
          timer = setTimeout(() => {
            setAnimationStage('stage8');
          }, 500);
        }
        break;

      case 'stage8':
        // 第八阶段：地盘干复制到天盘位置（持续1秒）
        timer = setTimeout(() => {
          setAnimationStage('stage9');
          setStageProgress(0);
        }, 1000);
        break;

      case 'stage9':
        // 第九阶段：八门飞入宫中
        if (stageProgress < 8) {
          timer = setTimeout(() => {
            setStageProgress(prev => prev + 1);
          }, 200);
        } else {
          timer = setTimeout(() => {
            setAnimationStage('stage10');
            setStageProgress(0);
          }, 500);
        }
        break;

      case 'stage10':
        // 第十阶段：八神飞入宫中
        if (stageProgress < 8) {
          timer = setTimeout(() => {
            setStageProgress(prev => prev + 1);
          }, 200);
        } else {
          timer = setTimeout(() => {
            setAnimationStage('complete');
          }, 500);
        }
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [result, animationStage, stageProgress]);

  const handleTimeQiJu = () => {
    const res = calculate(new Date());
    setResult(res);
    setMessages([]);
    setUserQuestion('');
    // 重置动画状态
    setAnimationStage('idle');
    setStageProgress(0);
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

    // 创建 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
          model || undefined,
          abortController.signal // 传递 signal
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
          model || undefined,
          abortController.signal // 传递 signal
        );
      }
    } catch (error) {
      // 如果是用户主动取消，不显示错误
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('用户取消了AI解读');
      } else {
        alert(error instanceof Error ? error.message : 'AI解读失败');
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsInterpreting(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopInterpret = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex gap-3 sm:gap-4 justify-center">
        <motion.button
          onClick={handleTimeQiJu}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
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
          <QiMenPanDisplay
            key="qimen-pan"
            pan={result}
            animationStage={animationStage}
            stageProgress={stageProgress}
            onSymbolClick={setSelectedSymbol}
          />
        </AnimatePresence>
      )}

      {/* 符号解读弹窗 */}
      {selectedSymbol && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSymbol(null)}
        >
          <motion.div
            className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 backdrop-blur-md rounded-xl p-6 border border-amber-500/50 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-amber-300">{selectedSymbol.name}</h3>
              <button
                onClick={() => setSelectedSymbol(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-200 leading-relaxed">
              {selectedSymbol.description}
            </div>
          </motion.div>
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
                <div className="text-gray-200 prose prose-invert prose-sm max-w-none text-sm sm:text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
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
              onClick={isInterpreting ? handleStopInterpret : handleInterpret}
              disabled={false}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 ${
                isInterpreting
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              } text-white rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isInterpreting ? '⏹️ 停止生成' : messages.length === 0 ? '🔮 获取解读' : '💬 发送'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 奇门遁甲盘显示组件
function QiMenPanDisplay({ pan, animationStage, stageProgress, onSymbolClick }: {
  pan: QiMenResult;
  animationStage: string;
  stageProgress: number;
  onSymbolClick: (symbol: { type: string; name: string; description: string }) => void;
}) {
  // 第一阶段：显示时间信息和干支
  if (animationStage === 'stage1') {
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 min-h-[400px] flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6">
          <motion.h2
            className="text-4xl font-bold text-amber-300"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            时间起局
          </motion.h2>
          <motion.div
            className="space-y-3 text-2xl text-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-3xl font-bold text-white">{pan.basicInfo.date}</p>
            <p className="text-xl text-gray-300">{pan.basicInfo.lunarDate}</p>
            <p className="text-2xl text-cyan-300 mt-4">
              {pan.basicInfo.ganZhi?.year} {pan.basicInfo.ganZhi?.month} {pan.basicInfo.ganZhi?.day} {pan.basicInfo.ganZhi?.hour}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // 第二阶段：显示局数、阴遁阳遁
  if (animationStage === 'stage2') {
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 min-h-[400px] flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-8">
          <motion.div
            className="text-5xl font-bold text-amber-300"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {pan.juShu.fullName}
          </motion.div>
          <motion.div
            className="flex gap-8 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-2xl text-purple-300">
              值符：<span className="font-bold text-white">{pan.zhiFuXing}</span>
            </div>
            <div className="text-2xl text-blue-300">
              值使：<span className="font-bold text-white">{pan.zhiShiMen}</span>
            </div>
          </motion.div>
          <motion.div
            className="text-xl text-gray-300"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            旬首：{pan.xunShou}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // 第三阶段：动态画出九宫
  if (animationStage === 'stage3') {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3
          className="text-2xl font-bold text-white mb-6 text-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          奇门遁甲盘
        </motion.h3>
        <div className="grid grid-cols-3 gap-2 max-w-4xl mx-auto">
          {gongOrder.map((gongNum, index) => (
            <motion.div
              key={gongNum}
              className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-lg border border-amber-500/30 min-h-[180px]"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // 第四阶段：八卦方位落入九宫
  if (animationStage === 'stage4') {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    const baGuaNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.h3
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          奇门遁甲盘
        </motion.h3>
        <div className="grid grid-cols-3 gap-2 max-w-4xl mx-auto">
          {gongOrder.map((gongNum, index) => (
            <motion.div
              key={gongNum}
              className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-lg border border-amber-500/30 min-h-[180px] flex items-center justify-center relative"
            >
              <motion.div
                className="text-4xl font-bold text-amber-300"
                initial={{ y: -100, scale: 2, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                {baGuaNames[index]}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // 第五阶段及之后：显示九宫格，根据阶段显示不同内容
  const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const baGuaNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.h3
        className="text-2xl font-bold text-white mb-4 text-center"
      >
        奇门遁甲盘
      </motion.h3>

      {/* 第六阶段：显示旬首、值符、值使 */}
      {animationStage === 'stage6' && (
        <motion.div
          className="text-center mb-6 text-gray-300 space-y-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.p
            className="text-xl text-amber-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            旬首：{pan.xunShou}
          </motion.p>
          <motion.p
            className="text-xl text-purple-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            值符：{pan.zhiFuXing}（{pan.zhiFuGong}宫）
          </motion.p>
          <motion.p
            className="text-xl text-blue-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            值使：{pan.zhiShiMen}（{pan.zhiShiGong}宫）
          </motion.p>
        </motion.div>
      )}

      {/* complete阶段：显示完整信息 */}
      {animationStage === 'complete' && (
        <div className="text-center mb-6 text-gray-300">
          <p>起局时间：{pan.basicInfo.date}</p>
          <p>农历：{pan.basicInfo.lunarDate}</p>
          <p>局数：{pan.juShu.fullName}</p>
          <p>值符：{pan.zhiFuXing}（{pan.zhiFuGong}宫） | 值使：{pan.zhiShiMen}（{pan.zhiShiGong}宫） | 旬首：{pan.xunShou}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 max-w-4xl mx-auto">
        {gongOrder.map((gongNum, index) => {
          const gongKey = String(gongNum);
          const gongAnalysis = pan.jiuGongAnalysis[gongKey];
          return (
            <AnimatedGongCell
              key={gongKey}
              gongNum={gongNum}
              gongName={baGuaNames[index]}
              gongInfo={gongAnalysis}
              tianGan={pan.tianPan[gongKey]}
              diGan={pan.diPan[gongKey]}
              animationStage={animationStage}
              stageProgress={stageProgress}
              index={index}
              onSymbolClick={onSymbolClick}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// 动画宫位单元格组件 - 支持分阶段显示
function AnimatedGongCell({ gongNum, gongName, gongInfo, tianGan, diGan, animationStage, stageProgress, index, onSymbolClick }: {
  gongNum: number;
  gongName: string;
  gongInfo: any;
  tianGan?: string;
  diGan?: string;
  animationStage: string;
  stageProgress: number;
  index: number;
  onSymbolClick: (symbol: { type: string; name: string; description: string }) => void;
}) {
  // 处理符号点击
  const handleSymbolClick = (type: string, name: string) => {
    const description = symbolInterpretations[type]?.[name] || '暂无解读信息';
    onSymbolClick({ type, name, description });
  };

  // 第五阶段：地盘天干落入
  const showDiGan = animationStage === 'stage5' && index < stageProgress ||
                    ['stage6', 'stage7', 'stage8', 'stage9', 'stage10', 'complete'].includes(animationStage);

  // 第七阶段：天盘九星落入
  const showJiuXing = animationStage === 'stage7' && index < stageProgress ||
                      ['stage8', 'stage9', 'stage10', 'complete'].includes(animationStage);

  // 第八阶段：天盘干显示
  const showTianGan = ['stage8', 'stage9', 'stage10', 'complete'].includes(animationStage);

  // 第九阶段：八门落入
  const showBaMen = animationStage === 'stage9' && index < stageProgress ||
                    ['stage10', 'complete'].includes(animationStage);

  // 第十阶段：八神落入
  const showBaShen = animationStage === 'stage10' && index < stageProgress ||
                     animationStage === 'complete';

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 min-h-[180px] relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 顶部：宫位名称（八卦） */}
      <div className="text-center text-amber-300 font-bold text-base mb-3 border-b border-amber-500/20 pb-2">
        {gongName}
      </div>

      {/* 主体区域：使用网格布局 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* 左上：天盘干支 */}
        <div className="text-left">
          <div className="text-[10px] text-gray-400">天盘</div>
          {showTianGan && tianGan ? (
            <motion.div
              className="text-sm text-cyan-300 font-semibold"
              initial={{ scale: 2, opacity: 0, rotate: 360 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tianGan}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-600">-</div>
          )}
        </div>

        {/* 右上：八神 */}
        <div className="text-right">
          <div className="text-[10px] text-gray-400">八神</div>
          {showBaShen && (gongInfo.shen || gongInfo.baShen) ? (
            <motion.div
              className="text-sm text-pink-300 font-semibold cursor-pointer hover:text-pink-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('baShen', gongInfo.shen || gongInfo.baShen)}
              initial={{ scale: 3, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {gongInfo.shen || gongInfo.baShen}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-600">-</div>
          )}
        </div>

        {/* 左下：八门 */}
        <div className="text-left">
          <div className="text-[10px] text-gray-400">八门</div>
          {showBaMen && (gongInfo.men || gongInfo.baMen) ? (
            <motion.div
              className="text-sm text-purple-300 font-semibold cursor-pointer hover:text-purple-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('baMen', gongInfo.men || gongInfo.baMen)}
              initial={{ scale: 3, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {gongInfo.men || gongInfo.baMen}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-600">-</div>
          )}
        </div>

        {/* 右下：九星 */}
        <div className="text-right">
          <div className="text-[10px] text-gray-400">九星</div>
          {showJiuXing && (gongInfo.xing || gongInfo.jiuXing) ? (
            <motion.div
              className="text-sm text-blue-300 font-semibold cursor-pointer hover:text-blue-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('jiuXing', gongInfo.xing || gongInfo.jiuXing)}
              initial={{ y: -100, scale: 2, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {gongInfo.xing || gongInfo.jiuXing}
            </motion.div>
          ) : (
            <div className="text-sm text-gray-600">-</div>
          )}
        </div>
      </div>

      {/* 底部：地盘干支 */}
      <div className="text-center border-t border-amber-500/20 pt-2 mb-2">
        <div className="text-[10px] text-gray-400">地盘</div>
        {showDiGan && diGan ? (
          <motion.div
            className="text-sm text-orange-300 font-semibold"
            initial={{ y: -80, scale: 1.5, rotate: 180, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          >
            {diGan}
          </motion.div>
        ) : (
          <div className="text-sm text-gray-600">-</div>
        )}
      </div>

      {/* 状态标签区域 - 仅在complete阶段显示 */}
      {animationStage === 'complete' && (
        <div className="flex flex-wrap gap-1 justify-center">
          {gongInfo.jiXing && (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
              击刑
            </span>
          )}
          {gongInfo.ruMu && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-500/20 text-gray-300 rounded border border-gray-500/30">
              入墓
            </span>
          )}
          {gongInfo.fuYin && (
            <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30">
              伏吟
            </span>
          )}
          {gongInfo.fanYin && (
            <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
              反吟
            </span>
          )}
          {gongInfo.kongWang && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              空亡
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// 旧的宫位单元格组件（保留用于兼容）
function GongCell({ gongInfo, tianGan, diGan, delay, visible = true, onSymbolClick }: {
  gongInfo: any;
  tianGan?: string;
  diGan?: string;
  delay: number;
  visible?: boolean;
  onSymbolClick: (symbol: { type: string; name: string; description: string }) => void;
}) {
  // 处理符号点击
  const handleSymbolClick = (type: string, name: string) => {
    const description = symbolInterpretations[type]?.[name] || '暂无解读信息';
    onSymbolClick({ type, name, description });
  };
  return (
    <motion.div
      className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 min-h-[180px] relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: visible ? 1 : 0.8,
        opacity: visible ? 1 : 0
      }}
      transition={{ delay, duration: 0.3 }}
    >
      {/* 顶部：宫位名称 */}
      <div className="text-center text-amber-300 font-bold text-base mb-3 border-b border-amber-500/20 pb-2">
        {gongInfo.gongName}
      </div>

      {/* 主体区域：使用网格布局 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* 左上：天盘干支 */}
        <div className="text-left">
          <div className="text-[10px] text-gray-400">天盘</div>
          <div className="text-sm text-cyan-300 font-semibold">{tianGan || '-'}</div>
        </div>

        {/* 右上：八神 */}
        <div className="text-right">
          <div className="text-[10px] text-gray-400">八神</div>
          <div
            className="text-sm text-pink-300 font-semibold cursor-pointer hover:text-pink-200 hover:scale-110 transition-all"
            onClick={() => handleSymbolClick('baShen', gongInfo.shen || gongInfo.baShen)}
          >
            {gongInfo.shen || gongInfo.baShen || '-'}
          </div>
        </div>

        {/* 左下：八门 */}
        <div className="text-left">
          <div className="text-[10px] text-gray-400">八门</div>
          <div
            className="text-sm text-purple-300 font-semibold cursor-pointer hover:text-purple-200 hover:scale-110 transition-all"
            onClick={() => handleSymbolClick('baMen', gongInfo.men || gongInfo.baMen)}
          >
            {gongInfo.men || gongInfo.baMen || '-'}
          </div>
        </div>

        {/* 右下：九星 */}
        <div className="text-right">
          <div className="text-[10px] text-gray-400">九星</div>
          <div
            className="text-sm text-blue-300 font-semibold cursor-pointer hover:text-blue-200 hover:scale-110 transition-all"
            onClick={() => handleSymbolClick('jiuXing', gongInfo.xing || gongInfo.jiuXing)}
          >
            {gongInfo.xing || gongInfo.jiuXing || '-'}
          </div>
        </div>
      </div>

      {/* 底部：地盘干支 */}
      <div className="text-center border-t border-amber-500/20 pt-2 mb-2">
        <div className="text-[10px] text-gray-400">地盘</div>
        <div className="text-sm text-orange-300 font-semibold">{diGan || '-'}</div>
      </div>

      {/* 状态标签区域 */}
      <div className="flex flex-wrap gap-1 justify-center">
        {gongInfo.jiXing && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
            击刑
          </span>
        )}
        {gongInfo.ruMu && (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-500/20 text-gray-300 rounded border border-gray-500/30">
            入墓
          </span>
        )}
        {gongInfo.fuYin && (
          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30">
            伏吟
          </span>
        )}
        {gongInfo.fanYin && (
          <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
            反吟
          </span>
        )}
        {gongInfo.kongWang && (
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
            空亡
          </span>
        )}
      </div>
    </motion.div>
  );
}
