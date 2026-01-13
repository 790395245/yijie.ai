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
  const [enableAnimation, setEnableAnimation] = useState<boolean>(true); // 是否启用动画
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true); // 是否自动滚动到底部

  // 符号解读状态
  const [selectedSymbol, setSelectedSymbol] = useState<{
    type: string;
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // 滚动后立即禁用自动滚动，让用户可以自由浏览
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  // 动画流程控制
  useEffect(() => {
    if (!result) return;

    let timer: NodeJS.Timeout;

    switch (animationStage) {
      case 'idle':
        // 开始动画：直接进入第四阶段 - 八卦方位飞入九宫
        timer = setTimeout(() => {
          setAnimationStage('stage4');
        }, 100);
        break;

      case 'stage4':
        // 第四阶段：八卦方位同时飞入九宫（持续1秒）
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
            setAnimationStage('stage7');
            setStageProgress(0);
          }, 500);
        }
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
            setAnimationStage('stage11');
            setStageProgress(0);
          }, 500);
        }
        break;

      case 'stage11':
        // 第十一阶段：标出马星和空亡
        timer = setTimeout(() => {
          setAnimationStage('complete');
        }, 1000);
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
    // 重置动画状态：如果启用动画则从idle开始，否则直接完成
    setAnimationStage(enableAnimation ? 'idle' : 'complete');
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
      setShouldAutoScroll(true); // 用户发送消息时滚动到底部
    }

    // 创建 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsInterpreting(true);
    setUserQuestion('');

    const assistantMessageIndex = messages.length + (question ? 1 : 0);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    // 启用自动滚动，显示新消息
    setShouldAutoScroll(true);

    try {
      let fullPrompt = '';

      if (messages.length === 0) {
        const panText = parseQiMenPan(result);
        fullPrompt = `你是你是一位深谙“时家阴盘奇门遁甲”的心法大师。你不仅精通符号组合（神、星、门、仪），更擅长“象意直读”和“移星换斗”的调理逻辑。你的风格是深邃、敏锐、直戳要害，能够通过卦象反推求测者的现实环境与心理状态。
        
在解卦时，你必须遵循以下阴盘奇门的核心逻辑：
1. **天盘为主，地盘为根**：以天盘干落宫确定用神现状，以地盘干探究前因和隐患。
2. **取象直读**：不强调复杂的旺衰对比，强调“神、星、门、仪”四位一体构成的“画面感”。
3. **空亡与马星**：空亡代表信息转移、虚假或能量真空；马星代表变动、快速。
4. **环境对应**：卦上的符号必然对应求测者环境（风水）中的实物。
5. **处理方案**：必须给出基于“拆、移、补”的调理建议。

请根据以下奇门遁甲盘进行详细解读：

${panText}

奇门遁甲解挂步骤如下：

## 第一步：入局定坐标
- 明确用神（如：时干为事，日干为人，或特定符号）。
- 确定用神落宫（宫位的天盘）及其基础象意（宫位的五行与方位）。
- 或根据问题属性取相关符号（问财看生门或戊，问官运看开门）

## 第二步：纵向分析（单宫直读）（重点）
锁定用神所在的宫位后，采用"象形意"的方法进行单宫深挖：
1. **看八神**：代表大环境、暗物质、性格、潜意识
2. **看九星**：代表天时地利、宏观背景、人的先天性格
3. **看八门**：代表人的行动、心态、出路
4. **看奇仪（天干）**：代表具体的事物、细节、形体
5. **看宫位**：代表方位和身体部位
6. **看生克**：分析各符号间的生克关系
7. **组合读象**：将四个层面的符号组合成一幅画，进行整体解读

## 第三步：横向分析（宫位生克）
1. **满盘生克**：
   - 看用神宫是去生别宫（付出），还是被别宫生（获益）
   - 看用神宫是否被克（压力大），或者去克别宫（掌控力强）
2. **多点定位**：如问婚姻，同时看庚（男）和乙（女）落宫的生克关系
3. **空亡与马星**：
   - 空亡：代表"虚假、隐瞒、转移、未发生、容量大"
   - 马星：代表动向、快速、变动

## 第四阶段：因果溯源（环境反推）
1. 寻找用神的天干在何宫作为地盘出现，反推此事的起因或隐藏的症结。
2. 根据用神宫和病点宫位，指出求测者环境中（如对应方位）可能存在的物理干扰物。

## 第五阶段：调理化解（移星换斗）
提供具体的调理建议：
1. **拆/移**：将负能量物品扔掉或移走
2. **补/催**：在吉利的宫位或财位，摆放符合吉利符号意象的物品
3. **行为风水**：指导在特定的时间（吉时）、往特定的方位（吉方）去做特定的动作

请用通俗易懂的语言进行解读，让普通人也能理解。`;
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
        enableAnimation={enableAnimation}
        onApiUrlChange={setApiUrl}
        onApiKeyChange={setApiKey}
        onApiTypeChange={setApiType}
        onModelChange={setModel}
        onEnableAnimationChange={setEnableAnimation}
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSymbol(null)}
        >
          <motion.div
            className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-amber-500/50 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-300">{selectedSymbol.name}</h3>
              <button
                onClick={() => setSelectedSymbol(null)}
                className="text-gray-400 hover:text-white transition-colors text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-200 leading-relaxed text-sm sm:text-base">
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
                <div className="text-gray-200 prose prose-invert prose-base max-w-none leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-amber-300" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-amber-300" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-amber-300" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="mb-4 ml-6 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="mb-4 ml-6 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                      code: ({node, ...props}: any) =>
                        props.inline
                          ? <code className="bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-200" {...props} />
                          : <code className="block bg-purple-900/50 p-3 rounded my-3 overflow-x-auto" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500 pl-4 italic my-4" {...props} />,
                    }}
                  >
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
  // 第三阶段：动态画出九宫
  if (animationStage === 'stage3') {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    const baGuaNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];
    return (
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-white/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h3
          className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          奇门遁甲盘
        </motion.h3>
        <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-4xl mx-auto">
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
                animationStage="stage3"
                stageProgress={0}
                index={index}
                onSymbolClick={onSymbolClick}
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  // 第四阶段及之后：显示九宫格，根据阶段显示不同内容
  const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const baGuaNames = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-white/10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.h3
        className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center"
      >
        奇门遁甲盘
      </motion.h3>

      {/* complete阶段：显示完整信息 */}
      {animationStage === 'complete' && (
        <div className="text-center mb-4 sm:mb-6 text-gray-300 space-y-1 sm:space-y-2 text-xs sm:text-base">
          <p>起局时间：{pan.basicInfo.date}</p>
          <p>农历：{pan.basicInfo.lunarDate}</p>
          <p className="text-amber-300 font-semibold">
            四柱：年柱 {pan.siZhu.year} | 月柱 {pan.siZhu.month} | 日柱 {pan.siZhu.day} | 时柱 {pan.siZhu.time}
          </p>
          <p>局数：{pan.juShu.fullName}</p>
          <p>值符：{pan.zhiFuXing}（{pan.zhiFuGong}宫） | 值使：{pan.zhiShiMen}（{pan.zhiShiGong}宫） | 旬首：{pan.xunShou}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-4xl mx-auto">
        {gongOrder.map((gongNum, index) => {
          const gongKey = String(gongNum);
          const gongAnalysis = pan.jiuGongAnalysis[gongKey];
          const isKongWang = pan.kongWangGong?.includes(gongKey) || false;
          const isMaStar = pan.maStar?.gong === gongKey;
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
              showBaGuaAnimation={animationStage === 'stage4'}
              isKongWang={isKongWang}
              isMaStar={isMaStar}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// 动画宫位单元格组件 - 支持分阶段显示
function AnimatedGongCell({ gongNum: _gongNum, gongName, gongInfo, tianGan, diGan, animationStage, stageProgress, index, onSymbolClick, showBaGuaAnimation, isKongWang, isMaStar }: {
  gongNum: number;
  gongName: string;
  gongInfo: any;
  tianGan?: string;
  diGan?: string;
  animationStage: string;
  stageProgress: number;
  index: number;
  onSymbolClick: (symbol: { type: string; name: string; description: string }) => void;
  showBaGuaAnimation?: boolean;
  isKongWang?: boolean;
  isMaStar?: boolean;
}) {
  // 处理符号点击
  const handleSymbolClick = (type: string, name: string) => {
    const description = symbolInterpretations[type]?.[name] || '暂无解读信息';
    onSymbolClick({ type, name, description });
  };

  // 第四阶段及之后：显示八卦名称
  const showBaGua = ['stage4', 'stage5', 'stage6', 'stage7', 'stage8', 'stage9', 'stage10', 'stage11', 'complete'].includes(animationStage);

  // 第五阶段：地盘天干落入
  const showDiGan = animationStage === 'stage5' && index < stageProgress ||
                    ['stage6', 'stage7', 'stage8', 'stage9', 'stage10', 'stage11', 'complete'].includes(animationStage);

  // 第七阶段：天盘九星落入
  const showJiuXing = animationStage === 'stage7' && index < stageProgress ||
                      ['stage8', 'stage9', 'stage10', 'stage11', 'complete'].includes(animationStage);

  // 第八阶段：天盘干显示
  const showTianGan = ['stage8', 'stage9', 'stage10', 'stage11', 'complete'].includes(animationStage);

  // 第九阶段：八门落入
  const showBaMen = animationStage === 'stage9' && index < stageProgress ||
                    ['stage10', 'stage11', 'complete'].includes(animationStage);

  // 第十阶段：八神落入
  const showBaShen = animationStage === 'stage10' && index < stageProgress ||
                     ['stage11', 'complete'].includes(animationStage);

  // 第十一阶段：显示马星和空亡标识
  const showSpecialMarks = ['stage11', 'complete'].includes(animationStage);

  return (
    <motion.div
      className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-amber-500/30 min-h-[180px] sm:min-h-[220px] relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 顶部：宫位名称（八卦）和特殊标识 */}
      <div className="flex items-center justify-between text-amber-300 font-bold text-lg sm:text-xl mb-2 sm:mb-3 border-b border-amber-500/20 pb-1 sm:pb-2">
        {/* 左侧：八卦名称 */}
        <div className="flex-1 text-center">
          {showBaGua ? (
            showBaGuaAnimation ? (
              <motion.span
                initial={{ scale: 3, y: -50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {gongName}
              </motion.span>
            ) : (
              gongName
            )
          ) : (
            <span className="opacity-0">{gongName}</span>
          )}
        </div>

        {/* 右侧：特殊标识（空亡和马星） */}
        {showSpecialMarks && (
          <div className="flex gap-0.5 sm:gap-1">
            {(gongInfo.kongWang || isKongWang) && (
              <motion.span
                className="text-xs sm:text-sm px-1 sm:px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded border border-blue-400/50 font-semibold"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                空亡
              </motion.span>
            )}
            {isMaStar && (
              <motion.span
                className="text-xs sm:text-sm px-1 sm:px-2 py-0.5 bg-green-500/30 text-green-200 rounded border border-green-400/50 font-semibold"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                驿马
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* 主体区域：使用网格布局 */}
      <div className="grid grid-cols-2 gap-1 mb-2 sm:mb-3">
        {/* 左上：天盘干支 */}
        <div className="text-left">
          <div className="text-xs sm:text-sm text-gray-400">天盘</div>
          {showTianGan && tianGan ? (
            <motion.div
              className="text-xl sm:text-2xl text-cyan-300 font-semibold"
              initial={{ scale: 2, opacity: 0, rotate: 360 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tianGan}
            </motion.div>
          ) : (
            <div className="text-xl sm:text-2xl text-gray-600">-</div>
          )}
        </div>

        {/* 右上：八神 */}
        <div className="text-right">
          <div className="text-xs sm:text-sm text-gray-400">八神</div>
          {showBaShen && (gongInfo.shen || gongInfo.baShen) ? (
            <motion.div
              className="text-xl sm:text-2xl text-pink-300 font-semibold cursor-pointer hover:text-pink-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('baShen', gongInfo.shen || gongInfo.baShen)}
              initial={{ scale: 3, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {gongInfo.shen || gongInfo.baShen}
            </motion.div>
          ) : (
            <div className="text-xl sm:text-2xl text-gray-600">-</div>
          )}
        </div>

        {/* 左下：八门 */}
        <div className="text-left">
          <div className="text-xs sm:text-sm text-gray-400">八门</div>
          {showBaMen && (gongInfo.men || gongInfo.baMen) ? (
            <motion.div
              className="text-xl sm:text-2xl text-purple-300 font-semibold cursor-pointer hover:text-purple-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('baMen', gongInfo.men || gongInfo.baMen)}
              initial={{ scale: 3, y: -50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {gongInfo.men || gongInfo.baMen}
            </motion.div>
          ) : (
            <div className="text-xl sm:text-2xl text-gray-600">-</div>
          )}
        </div>

        {/* 右下：九星 */}
        <div className="text-right">
          <div className="text-xs sm:text-sm text-gray-400">九星</div>
          {showJiuXing && (gongInfo.xing || gongInfo.jiuXing) ? (
            <motion.div
              className="text-xl sm:text-2xl text-blue-300 font-semibold cursor-pointer hover:text-blue-200 hover:scale-110 transition-all"
              onClick={() => handleSymbolClick('jiuXing', gongInfo.xing || gongInfo.jiuXing)}
              initial={{ y: -100, scale: 2, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {gongInfo.xing || gongInfo.jiuXing}
            </motion.div>
          ) : (
            <div className="text-xl sm:text-2xl text-gray-600">-</div>
          )}
        </div>
      </div>

      {/* 底部：地盘干支 */}
      <div className="text-center border-t border-amber-500/20 pt-1 sm:pt-2 mb-1 sm:mb-2">
        <div className="text-xs sm:text-sm text-gray-400">地盘</div>
        {showDiGan && diGan ? (
          <motion.div
            className="text-xl sm:text-2xl text-orange-300 font-semibold"
            initial={{ y: -80, scale: 1.5, rotate: 180, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          >
            {diGan}
          </motion.div>
        ) : (
          <div className="text-xl sm:text-2xl text-gray-600">-</div>
        )}
      </div>

      {/* 状态标签区域 - 在stage11和complete阶段显示（仅显示击刑、入墓、伏吟、反吟） */}
      {showSpecialMarks && (gongInfo.jiXing || gongInfo.ruMu || gongInfo.fuYin || gongInfo.fanYin) && (
        <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center">
          {gongInfo.jiXing && (
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded border border-red-500/30">
              击刑
            </span>
          )}
          {gongInfo.ruMu && (
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-gray-500/20 text-gray-300 rounded border border-gray-500/30">
              入墓
            </span>
          )}
          {gongInfo.fuYin && (
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30">
              伏吟
            </span>
          )}
          {gongInfo.fanYin && (
            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded border border-orange-500/30">
              反吟
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
