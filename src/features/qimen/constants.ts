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

// 天干相克关系（击刑）- 记录每个天干克制哪个天干
export const TIAN_GAN_KE: Record<TianGan, TianGan> = {
  [TianGan.Jia]: TianGan.Wu,   // 甲克戊（木克土）
  [TianGan.Yi]: TianGan.Ji,    // 乙克己（木克土）
  [TianGan.Bing]: TianGan.Geng, // 丙克庚（火克金）
  [TianGan.Ding]: TianGan.Xin,  // 丁克辛（火克金）
  [TianGan.Wu]: TianGan.Ren,   // 戊克壬（土克水）
  [TianGan.Ji]: TianGan.Gui,   // 己克癸（土克水）
  [TianGan.Geng]: TianGan.Jia, // 庚克甲（金克木）
  [TianGan.Xin]: TianGan.Yi,   // 辛克乙（金克木）
  [TianGan.Ren]: TianGan.Bing, // 壬克丙（水克火）
  [TianGan.Gui]: TianGan.Ding  // 癸克丁（水克火）
};

// 天干入墓关系 - 记录每个天干对应的墓库地支
export const TIAN_GAN_RU_MU: Record<TianGan, DiZhi> = {
  [TianGan.Jia]: DiZhi.Wei,  // 甲木入未墓
  [TianGan.Yi]: DiZhi.Wei,   // 乙木入未墓
  [TianGan.Bing]: DiZhi.Xu,  // 丙火入戌墓
  [TianGan.Ding]: DiZhi.Xu,  // 丁火入戌墓
  [TianGan.Wu]: DiZhi.Chen,  // 戊土入辰墓
  [TianGan.Ji]: DiZhi.Chen,  // 己土入辰墓
  [TianGan.Geng]: DiZhi.Chou, // 庚金入丑墓
  [TianGan.Xin]: DiZhi.Chou,  // 辛金入丑墓
  [TianGan.Ren]: DiZhi.Chen,  // 壬水入辰墓
  [TianGan.Gui]: DiZhi.Chen   // 癸水入辰墓
};

// 地支相冲关系 - 记录每个地支对应的相冲地支
export const DI_ZHI_CHONG: Record<DiZhi, DiZhi> = {
  [DiZhi.Zi]: DiZhi.Wu,   // 子午相冲
  [DiZhi.Chou]: DiZhi.Wei, // 丑未相冲
  [DiZhi.Yin]: DiZhi.Shen, // 寅申相冲
  [DiZhi.Mao]: DiZhi.You,  // 卯酉相冲
  [DiZhi.Chen]: DiZhi.Xu,  // 辰戌相冲
  [DiZhi.Si]: DiZhi.Hai,   // 巳亥相冲
  [DiZhi.Wu]: DiZhi.Zi,    // 午子相冲
  [DiZhi.Wei]: DiZhi.Chou, // 未丑相冲
  [DiZhi.Shen]: DiZhi.Yin, // 申寅相冲
  [DiZhi.You]: DiZhi.Mao,  // 酉卯相冲
  [DiZhi.Xu]: DiZhi.Chen,  // 戌辰相冲
  [DiZhi.Hai]: DiZhi.Si    // 亥巳相冲
};

// 旬空关系 - 记录每个旬首对应的空亡地支
export const XUN_KONG: Record<TianGan, DiZhi[]> = {
  [TianGan.Jia]: [DiZhi.Xu, DiZhi.Hai],  // 甲子旬：戌亥空
  [TianGan.Yi]: [DiZhi.Xu, DiZhi.Hai],   // 乙丑旬：戌亥空（实际应该根据具体旬首判断）
  [TianGan.Bing]: [DiZhi.Shen, DiZhi.You], // 丙寅旬：申酉空
  [TianGan.Ding]: [DiZhi.Shen, DiZhi.You], // 丁卯旬：申酉空
  [TianGan.Wu]: [DiZhi.Wu, DiZhi.Wei],   // 戊辰旬：午未空
  [TianGan.Ji]: [DiZhi.Wu, DiZhi.Wei],   // 己巳旬：午未空
  [TianGan.Geng]: [DiZhi.Chen, DiZhi.Si], // 庚午旬：辰巳空
  [TianGan.Xin]: [DiZhi.Chen, DiZhi.Si],  // 辛未旬：辰巳空
  [TianGan.Ren]: [DiZhi.Yin, DiZhi.Mao],  // 壬申旬：寅卯空
  [TianGan.Gui]: [DiZhi.Yin, DiZhi.Mao]   // 癸酉旬：寅卯空
};

