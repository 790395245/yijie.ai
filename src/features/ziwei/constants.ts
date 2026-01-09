/**
 * 紫微斗数基础数据
 */

import { Gong, ZhuXing } from './types';

// 十二宫位顺序
export const GONG_LIST = [
  Gong.Ming, Gong.XiongDi, Gong.FuQi, Gong.ZiNv,
  Gong.CaiBo, Gong.JiE, Gong.QianYi, Gong.NuPu,
  Gong.GuanLu, Gong.TianZhai, Gong.FuDe, Gong.FuMu
];

// 十四主星顺序
export const ZHU_XING_LIST = [
  ZhuXing.ZiWei, ZhuXing.TianJi, ZhuXing.TaiYang, ZhuXing.WuQu,
  ZhuXing.TianTong, ZhuXing.LianZhen, ZhuXing.TianFu, ZhuXing.TaiYin,
  ZhuXing.TanLang, ZhuXing.JuMen, ZhuXing.TianXiang, ZhuXing.TianLiang,
  ZhuXing.QiSha, ZhuXing.PoJun
];

// 地支顺序
export const DI_ZHI_LIST = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥'
];
