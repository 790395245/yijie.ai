/**
 * 八卦基础数据
 */

import { BaGua, WuXing, YinYang } from './types';

// 八卦基础数据
export const BA_GUA_DATA: Record<string, BaGua> = {
  乾: {
    name: '乾',
    symbol: '☰',
    wuxing: WuXing.Jin,
    yaoList: [YinYang.Yang, YinYang.Yang, YinYang.Yang]
  },
  兑: {
    name: '兑',
    symbol: '☱',
    wuxing: WuXing.Jin,
    yaoList: [YinYang.Yin, YinYang.Yang, YinYang.Yang]
  },
  离: {
    name: '离',
    symbol: '☲',
    wuxing: WuXing.Huo,
    yaoList: [YinYang.Yang, YinYang.Yin, YinYang.Yang]
  },
  震: {
    name: '震',
    symbol: '☳',
    wuxing: WuXing.Mu,
    yaoList: [YinYang.Yang, YinYang.Yang, YinYang.Yin]
  },
  巽: {
    name: '巽',
    symbol: '☴',
    wuxing: WuXing.Mu,
    yaoList: [YinYang.Yin, YinYang.Yang, YinYang.Yin]
  },
  坎: {
    name: '坎',
    symbol: '☵',
    wuxing: WuXing.Shui,
    yaoList: [YinYang.Yin, YinYang.Yin, YinYang.Yang]
  },
  艮: {
    name: '艮',
    symbol: '☶',
    wuxing: WuXing.Tu,
    yaoList: [YinYang.Yang, YinYang.Yin, YinYang.Yin]
  },
  坤: {
    name: '坤',
    symbol: '☷',
    wuxing: WuXing.Tu,
    yaoList: [YinYang.Yin, YinYang.Yin, YinYang.Yin]
  }
};
