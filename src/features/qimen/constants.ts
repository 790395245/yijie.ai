/**
 * 奇门遁甲基础数据
 */

import { TianGan, DiZhi, BaMen, JiuXing, BaShen, Gong } from './types';

// 天干顺序
export const TIAN_GAN_LIST = [
  TianGan.Jia, TianGan.Yi, TianGan.Bing, TianGan.Ding, TianGan.Wu,
  TianGan.Ji, TianGan.Geng, TianGan.Xin, TianGan.Ren, TianGan.Gui
];

// 地支顺序
export const DI_ZHI_LIST = [
  DiZhi.Zi, DiZhi.Chou, DiZhi.Yin, DiZhi.Mao, DiZhi.Chen, DiZhi.Si,
  DiZhi.Wu, DiZhi.Wei, DiZhi.Shen, DiZhi.You, DiZhi.Xu, DiZhi.Hai
];

// 八门顺序
export const BA_MEN_LIST = [
  BaMen.Xiu, BaMen.Sheng, BaMen.Shang, BaMen.Du,
  BaMen.Jing, BaMen.Si, BaMen.Jing2, BaMen.Kai
];

// 九星顺序
export const JIU_XING_LIST = [
  JiuXing.TianPeng, JiuXing.TianRen, JiuXing.TianChong,
  JiuXing.TianFu, JiuXing.TianYing, JiuXing.TianRui,
  JiuXing.TianZhu, JiuXing.TianXin, JiuXing.TianQin
];

// 八神顺序
export const BA_SHEN_LIST = [
  BaShen.ZhiFu, BaShen.TengShe, BaShen.TaiYin, BaShen.LiuHe,
  BaShen.BaiHu, BaShen.XuanWu, BaShen.JiuDi, BaShen.JiuTian
];

// 九宫顺序（洛书顺序）
export const JIU_GONG_LIST = [
  Gong.Yi, Gong.Er, Gong.San, Gong.Si, Gong.Wu,
  Gong.Liu, Gong.Qi, Gong.Ba, Gong.Jiu
];

// 九宫名称
export const GONG_NAMES: Record<Gong, string> = {
  [Gong.Yi]: '坎一宫',
  [Gong.Er]: '坤二宫',
  [Gong.San]: '震三宫',
  [Gong.Si]: '巽四宫',
  [Gong.Wu]: '中五宫',
  [Gong.Liu]: '乾六宫',
  [Gong.Qi]: '兑七宫',
  [Gong.Ba]: '艮八宫',
  [Gong.Jiu]: '离九宫'
};

// 九宫方位
export const GONG_POSITIONS: Record<Gong, { row: number; col: number }> = {
  [Gong.Si]: { row: 0, col: 0 },  // 巽四宫 - 左上
  [Gong.Jiu]: { row: 0, col: 1 }, // 离九宫 - 中上
  [Gong.Er]: { row: 0, col: 2 },  // 坤二宫 - 右上
  [Gong.San]: { row: 1, col: 0 }, // 震三宫 - 左中
  [Gong.Wu]: { row: 1, col: 1 },  // 中五宫 - 中中
  [Gong.Qi]: { row: 1, col: 2 },  // 兑七宫 - 右中
  [Gong.Ba]: { row: 2, col: 0 },  // 艮八宫 - 左下
  [Gong.Yi]: { row: 2, col: 1 },  // 坎一宫 - 中下
  [Gong.Liu]: { row: 2, col: 2 }  // 乾六宫 - 右下
};
