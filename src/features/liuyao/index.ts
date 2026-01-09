/**
 * 六爻占卜模块主入口
 */

export * from './types';
export * from './constants';
export * from './qigua';
export * from './parser';

import { Yao } from './types';
import { randomQiGua, timeQiGua } from './qigua';
import { getGuaName } from './parser';

/**
 * 六爻占卜结果
 */
export interface LiuYaoResult {
  benGua: {
    name: string;
    upperGua: string;
    lowerGua: string;
    yaoList: Yao[];
  };
  bianGua?: {
    name: string;
    upperGua: string;
    lowerGua: string;
    yaoList: Yao[];
  };
  hasChangingYao: boolean;
}

/**
 * 执行六爻占卜
 * @param method 起卦方式：'random' | 'time'
 * @param date 时间起卦时使用的日期
 */
export function performLiuYao(
  method: 'random' | 'time' = 'random',
  date?: Date
): LiuYaoResult {
  // 起卦
  const yaoList = method === 'random' ? randomQiGua() : timeQiGua(date);

  // 获取本卦
  const benGuaInfo = getGuaName(yaoList);

  // 检查是否有变爻
  const hasChangingYao = yaoList.some(yao => yao.isChanging);

  let bianGuaInfo;
  if (hasChangingYao) {
    // 生成变卦（变爻阴阳互换）
    const bianYaoList = yaoList.map(yao => ({
      ...yao,
      yinYang: yao.isChanging
        ? (yao.yinYang === '阳' ? '阴' as const : '阳' as const)
        : yao.yinYang,
      isChanging: false
    }));
    bianGuaInfo = getGuaName(bianYaoList);
  }

  return {
    benGua: {
      ...benGuaInfo,
      yaoList
    },
    bianGua: bianGuaInfo ? {
      ...bianGuaInfo,
      yaoList: yaoList.map(yao => ({
        ...yao,
        yinYang: yao.isChanging
          ? (yao.yinYang === '阳' ? '阴' as const : '阳' as const)
          : yao.yinYang,
        isChanging: false
      }))
    } : undefined,
    hasChangingYao
  };
}
