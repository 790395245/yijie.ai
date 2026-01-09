/**
 * 奇门遁甲解析器
 */

import { QiMenPan, GongInfo } from './types';
import { GONG_NAMES } from './constants';

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
