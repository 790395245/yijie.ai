import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageContentProps {
  content: string;
  role?: 'user' | 'assistant';
}

/**
 * 解析消息内容，提取thinking标签和正常内容
 */
function parseMessageContent(content: string): {
  thinkingContent: string | null;
  normalContent: string;
} {
  // 匹配 <thinking>...</thinking> 标签
  const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
  const match = content.match(thinkingRegex);

  if (match) {
    const thinkingContent = match[1].trim();
    const normalContent = content.replace(thinkingRegex, '').trim();
    return { thinkingContent, normalContent };
  }

  return { thinkingContent: null, normalContent: content };
}

/**
 * 消息内容渲染组件
 * 支持识别和折叠thinking标签内容
 */
export function MessageContent({ content }: MessageContentProps) {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const { thinkingContent, normalContent } = parseMessageContent(content);

  // Markdown渲染配置
  const markdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-4 text-amber-300" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-5 mb-3 text-amber-300" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-4 mb-2 text-amber-300" {...props} />,
    p: ({ node, ...props }: any) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="mb-4 ml-6 space-y-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="mb-4 ml-6 space-y-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
    code: ({ node, ...props }: any) =>
      props.inline
        ? <code className="bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-200" {...props} />
        : <code className="block bg-purple-900/50 p-3 rounded my-3 overflow-x-auto" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-amber-500 pl-4 italic my-4" {...props} />,
  };

  return (
    <div className="space-y-3">
      {/* 思考内容区域 */}
      {thinkingContent && (
        <div className="border border-gray-600/50 rounded-lg overflow-hidden bg-gray-800/30">
          <button
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">💭</span>
              <span className="text-sm font-medium text-gray-300">思考过程</span>
            </div>
            <motion.span
              animate={{ rotate: isThinkingExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {isThinkingExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 border-t border-gray-600/50 text-gray-300 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {thinkingContent}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 正常内容区域 */}
      {normalContent && (
        <div className="text-gray-200 prose prose-invert prose-base max-w-none leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {normalContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
