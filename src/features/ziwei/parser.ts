/**
 * 紫微斗数解析器
 */

import { ZiWeiPan } from './types';

/**
 * 将紫微斗数盘解析为文本描述
 */
export function parseZiWeiPan(pan: ZiWeiPan): string {
  let result = '';

  result += `排盘时间：${pan.year}年${pan.month}月${pan.day}日 ${pan.hour}时\n`;
  result += `命宫：${pan.mingGong}\n\n`;

  result += '十二宫位：\n';
  pan.gongList.forEach((gongInfo) => {
    result += `\n【${gongInfo.gong}】${gongInfo.diZhi}\n`;
    result += `  主星：${gongInfo.zhuXing.join('、')}\n`;
  });

  return result;
}
