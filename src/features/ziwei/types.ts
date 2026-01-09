/**
 * 紫微斗数核心类型定义
 */

// 十二宫位
export enum Gong {
  Ming = '命宫',
  XiongDi = '兄弟宫',
  FuQi = '夫妻宫',
  ZiNv = '子女宫',
  CaiBo = '财帛宫',
  JiE = '疾厄宫',
  QianYi = '迁移宫',
  NuPu = '奴仆宫',
  GuanLu = '官禄宫',
  TianZhai = '田宅宫',
  FuDe = '福德宫',
  FuMu = '父母宫'
}

// 主星
export enum ZhuXing {
  ZiWei = '紫微',
  TianJi = '天机',
  TaiYang = '太阳',
  WuQu = '武曲',
  TianTong = '天同',
  LianZhen = '廉贞',
  TianFu = '天府',
  TaiYin = '太阴',
  TanLang = '贪狼',
  JuMen = '巨门',
  TianXiang = '天相',
  TianLiang = '天梁',
  QiSha = '七杀',
  PoJun = '破军'
}

// 宫位信息
export interface GongInfo {
  gong: Gong;
  diZhi: string;
  zhuXing: ZhuXing[];
}

// 紫微斗数盘
export interface ZiWeiPan {
  year: number;
  month: number;
  day: number;
  hour: number;
  mingGong: Gong;
  gongList: GongInfo[];
}
