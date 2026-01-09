/**
 * 奇门遁甲核心类型定义
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

// 八门
export enum BaMen {
  Kai = '开门',
  Xiu = '休门',
  Sheng = '生门',
  Shang = '伤门',
  Du = '杜门',
  Jing = '景门',
  Si = '死门',
  Jing2 = '惊门'
}

// 九星
export enum JiuXing {
  TianPeng = '天蓬',
  TianRen = '天任',
  TianChong = '天冲',
  TianFu = '天辅',
  TianYing = '天英',
  TianRui = '天芮',
  TianZhu = '天柱',
  TianXin = '天心',
  TianQin = '天禽'
}

// 八神
export enum BaShen {
  ZhiFu = '值符',
  TengShe = '腾蛇',
  TaiYin = '太阴',
  LiuHe = '六合',
  BaiHu = '白虎',
  XuanWu = '玄武',
  JiuDi = '九地',
  JiuTian = '九天'
}

// 宫位（九宫）
export enum Gong {
  Yi = 1,   // 坎一宫
  Er = 2,   // 坤二宫
  San = 3,  // 震三宫
  Si = 4,   // 巽四宫
  Wu = 5,   // 中五宫
  Liu = 6,  // 乾六宫
  Qi = 7,   // 兑七宫
  Ba = 8,   // 艮八宫
  Jiu = 9   // 离九宫
}

// 宫位信息
export interface GongInfo {
  gong: Gong;              // 宫位
  tianGan: TianGan;        // 天干
  diZhi: DiZhi;            // 地支
  baMen: BaMen;            // 八门
  jiuXing: JiuXing;        // 九星
  baShen: BaShen;          // 八神
  anGan: TianGan[];        // 暗干（三奇六仪）
}

// 奇门遁甲盘
export interface QiMenPan {
  year: number;            // 年
  month: number;           // 月
  day: number;             // 日
  hour: number;            // 时
  zhiFu: JiuXing;          // 值符
  zhiShi: BaMen;           // 值使
  xunShou: TianGan;        // 旬首
  gongList: GongInfo[];    // 九宫信息
}
