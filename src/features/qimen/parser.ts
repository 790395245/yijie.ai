/**
 * 奇门遁甲解析器
 */

import { QiMenPan, GongInfo, TianGan, DiZhi } from './types';
import { GONG_NAMES, TIAN_GAN_KE, TIAN_GAN_RU_MU, DI_ZHI_CHONG, XUN_KONG } from './constants';

/**
 * 判断击刑（天干相克）
 * @param tianGan 当前宫位的天干
 * @param otherGongList 其他宫位列表
 * @returns 被克的天干，如果没有则返回undefined
 */
export function checkJiXing(tianGan: TianGan, otherGongList: GongInfo[]): TianGan | undefined {
  const keGan = TIAN_GAN_KE[tianGan];
  // 检查其他宫位中是否有被克的天干
  const hasKeGan = otherGongList.some(gong => gong.tianGan === keGan);
  return hasKeGan ? keGan : undefined;
}

/**
 * 判断入墓
 * @param tianGan 天干
 * @param diZhi 地支
 * @returns 是否入墓
 */
export function checkRuMu(tianGan: TianGan, diZhi: DiZhi): boolean {
  return TIAN_GAN_RU_MU[tianGan] === diZhi;
}

/**
 * 判断伏吟（天盘地盘相同）
 * @param _tianGan 天干
 * @param _diZhi 地支
 * @returns 是否伏吟
 */
export function checkFuYin(_tianGan: TianGan, _diZhi: DiZhi): boolean {
  // 简化判断：天干地支的索引相同视为伏吟
  // 实际奇门遁甲中伏吟的判断更复杂
  return false; // 暂时返回false，需要更复杂的逻辑
}

/**
 * 判断反吟（天盘地盘相冲）
 * @param diZhi 当前地支
 * @param originalDiZhi 原始地支（地盘）
 * @returns 是否反吟
 */
export function checkFanYin(diZhi: DiZhi, originalDiZhi: DiZhi): boolean {
  return DI_ZHI_CHONG[diZhi] === originalDiZhi;
}

/**
 * 判断空亡
 * @param diZhi 地支
 * @param xunShou 旬首
 * @returns 是否空亡
 */
export function checkKongWang(diZhi: DiZhi, xunShou: TianGan): boolean {
  const kongWangList = XUN_KONG[xunShou];
  return kongWangList.includes(diZhi);
}


/**
 * 将奇门遁甲盘解析为文本描述
 */
export function parseQiMenPan(pan: QiMenPan): string {
  let result = '';

  // 基本信息
  result += `起局时间：${pan.year}年${pan.month}月${pan.day}日 ${pan.hour}时\n`;
  result += `值符：${pan.zhiFu}\n`;
  result += `值使：${pan.zhiShi}\n`;
  result += `旬首：${pan.xunShou}\n\n`;

  // 九宫信息
  result += '九宫布局：\n';
  pan.gongList.forEach((gongInfo: GongInfo) => {
    result += parseGongInfo(gongInfo);
  });

  return result;
}

/**
 * 解析单个宫位信息
 */
function parseGongInfo(gongInfo: GongInfo): string {
  let result = `\n【${GONG_NAMES[gongInfo.gong]}】\n`;
  result += `  天干：${gongInfo.tianGan}\n`;
  result += `  地支：${gongInfo.diZhi}\n`;
  result += `  八门：${gongInfo.baMen}\n`;
  result += `  九星：${gongInfo.jiuXing}\n`;
  result += `  八神：${gongInfo.baShen}\n`;
  result += `  暗干：${gongInfo.anGan.join('、')}\n`;

  return result;
}
