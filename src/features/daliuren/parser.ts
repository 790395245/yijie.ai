/**
 * 大六壬解析器
 */

import { DaLiuRenPan } from './types';

/**
 * 将大六壬盘解析为文本描述
 */
export function parseDaLiuRenPan(pan: DaLiuRenPan): string {
  let result = '';

  result += `起课时间：${pan.year}年${pan.month}月${pan.day}日 ${pan.hour}时\n`;
  result += `年干支：${pan.ganZhi.year}\n`;
  result += `月干支：${pan.ganZhi.month}\n`;
  result += `日干支：${pan.ganZhi.day}\n`;
  result += `时干支：${pan.ganZhi.hour}\n\n`;

  result += '四课：\n';
  result += `第一课：${pan.siKe.diYiKe.tianGan}${pan.siKe.diYiKe.diZhi} ${pan.siKe.diYiKe.tianJiang}\n`;
  result += `第二课：${pan.siKe.diErKe.tianGan}${pan.siKe.diErKe.diZhi} ${pan.siKe.diErKe.tianJiang}\n`;
  result += `第三课：${pan.siKe.diSanKe.tianGan}${pan.siKe.diSanKe.diZhi} ${pan.siKe.diSanKe.tianJiang}\n`;
  result += `第四课：${pan.siKe.diSiKe.tianGan}${pan.siKe.diSiKe.diZhi} ${pan.siKe.diSiKe.tianJiang}\n\n`;

  result += '三传：\n';
  result += `初传：${pan.sanChuan.chuChuan.tianGan}${pan.sanChuan.chuChuan.diZhi} ${pan.sanChuan.chuChuan.tianJiang}\n`;
  result += `中传：${pan.sanChuan.zhongChuan.tianGan}${pan.sanChuan.zhongChuan.diZhi} ${pan.sanChuan.zhongChuan.tianJiang}\n`;
  result += `末传：${pan.sanChuan.moChuan.tianGan}${pan.sanChuan.moChuan.diZhi} ${pan.sanChuan.moChuan.tianJiang}\n`;

  return result;
}
