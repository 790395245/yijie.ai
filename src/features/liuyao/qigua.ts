/**
 * 起卦算法
 */

import { Yao, YinYang } from './types';

/**
 * 随机起卦 - 模拟摇钱币
 * 三个硬币，正面为阳（3），反面为阴（2）
 * 三个正面 = 老阳（9）= 阳爻变阴
 * 三个反面 = 老阴（6）= 阴爻变阳
 * 两正一反 = 少阳（7）= 阳爻不变
 * 两反一正 = 少阴（8）= 阴爻不变
 */
export function randomQiGua(): Yao[] {
  const yaoList: Yao[] = [];

  for (let i = 1; i <= 6; i++) {
    // 模拟摇三个硬币
    const coin1 = Math.random() > 0.5 ? 3 : 2; // 正面3，反面2
    const coin2 = Math.random() > 0.5 ? 3 : 2;
    const coin3 = Math.random() > 0.5 ? 3 : 2;
    const sum = coin1 + coin2 + coin3;

    let yinYang: YinYang;
    let isChanging: boolean;

    if (sum === 9) {
      // 老阳 - 阳爻变阴
      yinYang = YinYang.Yang;
      isChanging = true;
    } else if (sum === 6) {
      // 老阴 - 阴爻变阳
      yinYang = YinYang.Yin;
      isChanging = true;
    } else if (sum === 7) {
      // 少阳 - 阳爻不变
      yinYang = YinYang.Yang;
      isChanging = false;
    } else {
      // sum === 8, 少阴 - 阴爻不变
      yinYang = YinYang.Yin;
      isChanging = false;
    }

    yaoList.push({
      position: i,
      yinYang,
      isChanging
    });
  }

  return yaoList;
}

/**
 * 时间起卦
 * 根据年月日时计算卦象
 * @param date 起卦时间，默认为当前时间
 */
export function timeQiGua(date: Date = new Date()): Yao[] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 上卦 = (年 + 月 + 日) % 8
  const upperNum = (year + month + day) % 8 || 8;

  // 下卦 = (年 + 月 + 日 + 时) % 8
  const lowerNum = (year + month + day + hour) % 8 || 8;

  // 动爻 = (年 + 月 + 日 + 时) % 6
  const changingYao = (year + month + day + hour) % 6 || 6;

  // 根据上下卦数字生成六个爻
  const yaoList: Yao[] = [];

  // 下卦三爻
  for (let i = 1; i <= 3; i++) {
    yaoList.push({
      position: i,
      yinYang: getYaoByNumber(lowerNum, i),
      isChanging: i === changingYao
    });
  }

  // 上卦三爻
  for (let i = 4; i <= 6; i++) {
    yaoList.push({
      position: i,
      yinYang: getYaoByNumber(upperNum, i - 3),
      isChanging: i === changingYao
    });
  }

  return yaoList;
}

/**
 * 根据卦数和位置获取爻的阴阳
 */
function getYaoByNumber(guaNum: number, position: number): YinYang {
  // 八卦对应的爻象（从下到上）
  const guaYao: Record<number, YinYang[]> = {
    1: [YinYang.Yang, YinYang.Yang, YinYang.Yang], // 乾
    2: [YinYang.Yin, YinYang.Yang, YinYang.Yang],  // 兑
    3: [YinYang.Yang, YinYang.Yin, YinYang.Yang],  // 离
    4: [YinYang.Yang, YinYang.Yang, YinYang.Yin],  // 震
    5: [YinYang.Yin, YinYang.Yang, YinYang.Yin],   // 巽
    6: [YinYang.Yin, YinYang.Yin, YinYang.Yang],   // 坎
    7: [YinYang.Yang, YinYang.Yin, YinYang.Yin],   // 艮
    8: [YinYang.Yin, YinYang.Yin, YinYang.Yin]     // 坤
  };

  return guaYao[guaNum][position - 1];
}
