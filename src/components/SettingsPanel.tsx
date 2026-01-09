/**
 * 设置面板组件
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  apiKey: string;
  apiType: 'openai' | 'claude';
  onApiUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onApiTypeChange: (type: 'openai' | 'claude') => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  apiUrl,
  apiKey,
  apiType,
  onApiUrlChange,
  onApiKeyChange,
  onApiTypeChange
}: SettingsPanelProps) {
  // 临时状态，用于编辑
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempApiType, setTempApiType] = useState(apiType);

  // 当弹窗打开时，同步父组件的值到临时状态
  useEffect(() => {
    if (isOpen) {
      setTempApiUrl(apiUrl);
      setTempApiKey(apiKey);
      setTempApiType(apiType);
    }
  }, [isOpen, apiUrl, apiKey, apiType]);

  // 保存设置
  const handleSave = () => {
    onApiUrlChange(tempApiUrl);
    onApiKeyChange(tempApiKey);
    onApiTypeChange(tempApiType);
    onClose();
  };

  // 取消设置
  const handleCancel = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />

          {/* 设置面板 - 弹窗式，永远居中 */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto border border-purple-500/30 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* 标题 */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">设置</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* API配置 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">API配置</h3>

                  {/* API类型选择 */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">API类型</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTempApiType('claude')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          tempApiType === 'claude'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        Claude
                      </button>
                      <button
                        onClick={() => setTempApiType('openai')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          tempApiType === 'openai'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        OpenAI
                      </button>
                    </div>
                  </div>

                  {/* API URL */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">API URL</label>
                    <input
                      type="text"
                      value={tempApiUrl}
                      onChange={(e) => setTempApiUrl(e.target.value)}
                      placeholder={tempApiType === 'claude' ? '可选，默认官方' : '必填'}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* API密钥 */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">API密钥</label>
                    <input
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder={tempApiType === 'claude' ? 'sk-ant-...' : 'sk-...'}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
