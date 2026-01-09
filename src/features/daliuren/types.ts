/**
 * 大六壬核心类型定义
 */

// 天干
export enum TianGan {
  Jia = '甲',
  Yi = '乙',
  Bing = '丙',
  Ding = '丁',
  Wu = '戊',
  Ji = '己',
  Geng = '庚',
  Xin = '辛',
  Ren = '壬',
  Gui = '癸'
}

// 地支
export enum DiZhi {
  Zi = '子',
  Chou = '丑',
  Yin = '寅',
  Mao = '卯',
  Chen = '辰',
  Si = '巳',
  Wu = '午',
  Wei = '未',
  Shen = '申',
  You = '酉',
  Xu = '戌',
  Hai = '亥'
}

// 十二天将
export enum TianJiang {
  GuiRen = '贵人',
  TengShe = '腾蛇',
  ZhuQue = '朱雀',
  LiuHe = '六合',
  GouChen = '勾陈',
  QingLong = '青龙',
  TianKong = '天空',
  BaiHu = '白虎',
  TaiChang = '太常',
  XuanWu = '玄武',
  TaiYin = '太阴',
  TianHou = '天后'
}

// 课位
export interface Ke {
  diZhi: DiZhi;        // 地支
  tianGan: TianGan;    // 天干
  tianJiang: TianJiang; // 天将
}

// 四课
export interface SiKe {
  diYiKe: Ke;   // 第一课
  diErKe: Ke;   // 第二课
  diSanKe: Ke;  // 第三课
  diSiKe: Ke;   // 第四课
}

// 三传
export interface SanChuan {
  chuChuan: Ke;  // 初传
  zhongChuan: Ke; // 中传
  moChuan: Ke;   // 末传
}

// 大六壬盘
export interface DaLiuRenPan {
  year: number;
  month: number;
  day: number;
  hour: number;
  ganZhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  siKe: SiKe;
  sanChuan: SanChuan;
}
