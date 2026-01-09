/**
 * 大六壬基础数据
 */

import { TianGan, DiZhi, TianJiang } from './types';

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

// 十二天将顺序
export const TIAN_JIANG_LIST = [
  TianJiang.GuiRen, TianJiang.TengShe, TianJiang.ZhuQue, TianJiang.LiuHe,
  TianJiang.GouChen, TianJiang.QingLong, TianJiang.TianKong, TianJiang.BaiHu,
  TianJiang.TaiChang, TianJiang.XuanWu, TianJiang.TaiYin, TianJiang.TianHou
];

// 地支对应的天干（地支藏干）
export const DI_ZHI_CANG_GAN: Record<DiZhi, TianGan[]> = {
  [DiZhi.Zi]: [TianGan.Gui],
  [DiZhi.Chou]: [TianGan.Ji, TianGan.Gui, TianGan.Xin],
  [DiZhi.Yin]: [TianGan.Jia, TianGan.Bing, TianGan.Wu],
  [DiZhi.Mao]: [TianGan.Yi],
  [DiZhi.Chen]: [TianGan.Wu, TianGan.Yi, TianGan.Gui],
  [DiZhi.Si]: [TianGan.Bing, TianGan.Wu, TianGan.Geng],
  [DiZhi.Wu]: [TianGan.Ding, TianGan.Ji],
  [DiZhi.Wei]: [TianGan.Ji, TianGan.Ding, TianGan.Yi],
  [DiZhi.Shen]: [TianGan.Geng, TianGan.Ren, TianGan.Wu],
  [DiZhi.You]: [TianGan.Xin],
  [DiZhi.Xu]: [TianGan.Wu, TianGan.Xin, TianGan.Ding],
  [DiZhi.Hai]: [TianGan.Ren, TianGan.Jia]
};
