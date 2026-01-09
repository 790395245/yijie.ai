/**
 * 六爻占卜核心类型定义
 */

// 五行
export enum WuXing {
  Jin = '金',    // 金
  Mu = '木',     // 木
  Shui = '水',   // 水
  Huo = '火',    // 火
  Tu = '土'      // 土
}

// 阴阳
export enum YinYang {
  Yang = '阳',
  Yin = '阴'
}

// 爻的状态
export interface Yao {
  position: number;      // 位置 (1-6)
  yinYang: YinYang;      // 阴阳
  isChanging: boolean;   // 是否变爻
}

// 八卦
export interface BaGua {
  name: string;          // 卦名
  symbol: string;        // 卦符号
  wuxing: WuXing;        // 五行属性
  yaoList: YinYang[];    // 三个爻的阴阳
}

// 六十四卦
export interface LiuShiSiGua {
  number: number;        // 卦序
  name: string;          // 卦名
  upperGua: string;      // 上卦
  lowerGua: string;      // 下卦
  yaoList: Yao[];        // 六个爻
}
