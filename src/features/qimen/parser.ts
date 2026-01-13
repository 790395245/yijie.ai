/**
 * 奇门遁甲解析器
 */

import { QiMenPan, GongInfo, TianGan, DiZhi } from './types';
import { QiMenResult } from './qiju';
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
 * 将奇门遁甲盘解析为文本描述（支持旧类型）
 */
export function parseQiMenPan(pan: QiMenPan): string;
/**
 * 将奇门遁甲盘解析为文本描述（支持新类型）
 */
export function parseQiMenPan(pan: QiMenResult): string;
/**
 * 将奇门遁甲盘解析为文本描述（实现）
 */
export function parseQiMenPan(pan: QiMenPan | QiMenResult): string {
  // 类型守卫：检查是否为新的 QiMenResult 类型
  if ('basicInfo' in pan && 'jiuGongAnalysis' in pan) {
    return parseQiMenResult(pan as QiMenResult);
  }

  // 处理旧的 QiMenPan 类型
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
 * 解析新的 QiMenResult 类型
 */
function parseQiMenResult(result: QiMenResult): string {
  let text = '';

  // 基本信息
  text += `起局时间：${result.basicInfo.date}\n`;
  text += `农历：${result.basicInfo.lunarDate}\n`;
  text += `四柱：年柱${result.siZhu.year}、月柱${result.siZhu.month}、日柱${result.siZhu.day}、时柱${result.siZhu.time}\n`;
  text += `局数：${result.juShu.fullName}\n`;
  text += `值符：${result.zhiFuXing}（${result.zhiFuGong}宫）\n`;
  text += `值使：${result.zhiShiMen}（${result.zhiShiGong}宫）\n`;
  text += `旬首：${result.xunShou}\n`;

  // 添加空亡和马星信息
  if (result.kongWangZhi && result.kongWangZhi.length > 0) {
    text += `空亡：${result.kongWangZhi.join('、')}（对应${result.kongWangGong?.join('、')}宫）\n`;
  }
  if (result.maStar && result.maStar.zhi) {
    text += `驿马：${result.maStar.zhi}（${result.maStar.gong}宫）\n`;
  }
  text += '\n';

  // 九宫信息
  text += '九宫布局：\n';
  for (let i = 1; i <= 9; i++) {
    const gongAnalysis = result.jiuGongAnalysis[i];
    if (gongAnalysis) {
      text += `\n【${gongAnalysis.gongName}宫（${gongAnalysis.direction}）】\n`;
      text += `  天盘：${result.tianPan[i] || ''}\n`;
      text += `  地盘：${result.diPan[i] || ''}\n`;
      text += `  九星：${gongAnalysis.xing}\n`;
      text += `  八门：${gongAnalysis.men}\n`;
      text += `  八神：${gongAnalysis.shen}\n`;
      text += `  暗干：${result.anGan[i] || ''}\n`;
      text += `  吉凶：${gongAnalysis.jiXiongText}\n`;

      // 添加特殊标识
      const specialMarks = [];
      if (result.kongWangGong?.includes(String(i))) {
        specialMarks.push('空亡');
      }
      if (result.maStar?.gong === String(i)) {
        specialMarks.push('驿马');
      }
      if (specialMarks.length > 0) {
        text += `  特殊标识：${specialMarks.join('、')}\n`;
      }
    }
  }

  // 综合分析
  // text += `\n【综合分析】\n`;
  // text += `总体吉凶：${result.analysis.overallJiXiongText}\n`;
  // text += `最佳方位：${result.analysis.bestGong ? result.jiuGongAnalysis[result.analysis.bestGong]?.direction : '无'}\n`;
  // text += `\n建议：\n`;
  // result.analysis.suggestions.forEach((suggestion, index) => {
  //   text += `${index + 1}. ${suggestion}\n`;
  // });

  return text;
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
