/**
 * 卦象解析模块
 */

import { Yao, YinYang } from './types';

/**
 * 根据六个爻获取卦名
 */
export function getGuaName(yaoList: Yao[]): { name: string; upperGua: string; lowerGua: string } {
  // 下卦（初爻、二爻、三爻）
  const lowerYao = yaoList.slice(0, 3).map(y => y.yinYang);
  const lowerGua = getTrigramName(lowerYao);

  // 上卦（四爻、五爻、六爻）
  const upperYao = yaoList.slice(3, 6).map(y => y.yinYang);
  const upperGua = getTrigramName(upperYao);

  // 根据上下卦获取卦名
  const guaName = getSixtyFourGuaName(upperGua, lowerGua);

  return {
    name: guaName,
    upperGua,
    lowerGua
  };
}

/**
 * 根据三个爻获取八卦名称
 */
function getTrigramName(yaoList: YinYang[]): string {
  const pattern = yaoList.map(y => y === YinYang.Yang ? '1' : '0').join('');

  const trigramMap: Record<string, string> = {
    '111': '乾',
    '011': '兑',
    '101': '离',
    '110': '震',
    '010': '巽',
    '001': '坎',
    '100': '艮',
    '000': '坤'
  };

  return trigramMap[pattern] || '未知';
}

/**
 * 根据上下卦获取六十四卦名称
 */
function getSixtyFourGuaName(upperGua: string, lowerGua: string): string {
  const guaMap: Record<string, Record<string, string>> = {
    '乾': { '乾': '乾为天', '兑': '天泽履', '离': '天火同人', '震': '天雷无妄', '巽': '天风姤', '坎': '天水讼', '艮': '天山遁', '坤': '天地否' },
    '兑': { '乾': '泽天夬', '兑': '兑为泽', '离': '泽火革', '震': '泽雷随', '巽': '泽风大过', '坎': '泽水困', '艮': '泽山咸', '坤': '泽地萃' },
    '离': { '乾': '火天大有', '兑': '火泽睽', '离': '离为火', '震': '火雷噬嗑', '巽': '火风鼎', '坎': '火水未济', '艮': '火山旅', '坤': '火地晋' },
    '震': { '乾': '雷天大壮', '兑': '雷泽归妹', '离': '雷火丰', '震': '震为雷', '巽': '雷风恒', '坎': '雷水解', '艮': '雷山小过', '坤': '雷地豫' },
    '巽': { '乾': '风天小畜', '兑': '风泽中孚', '离': '风火家人', '震': '风雷益', '巽': '巽为风', '坎': '风水涣', '艮': '风山渐', '坤': '风地观' },
    '坎': { '乾': '水天需', '兑': '水泽节', '离': '水火既济', '震': '水雷屯', '巽': '水风井', '坎': '坎为水', '艮': '水山蹇', '坤': '水地比' },
    '艮': { '乾': '山天大畜', '兑': '山泽损', '离': '山火贲', '震': '山雷颐', '巽': '山风蛊', '坎': '山水蒙', '艮': '艮为山', '坤': '山地剥' },
    '坤': { '乾': '地天泰', '兑': '地泽临', '离': '地火明夷', '震': '地雷复', '巽': '地风升', '坎': '地水师', '艮': '地山谦', '坤': '坤为地' }
  };

  return guaMap[upperGua]?.[lowerGua] || '未知卦';
}
