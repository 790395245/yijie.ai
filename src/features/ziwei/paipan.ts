/**
 * 紫微斗数排盘算法
 */

import { ZiWeiPan, GongInfo, ZhuXing } from './types';
import { GONG_LIST, ZHU_XING_LIST, DI_ZHI_LIST } from './constants';

/**
 * 时间排盘
 * @param date 排盘时间，默认为当前时间
 */
export function timePaiPan(date: Date = new Date()): ZiWeiPan {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 简化算法：根据时间确定命宫
  const mingGongIndex = (month + hour) % 12;
  const mingGong = GONG_LIST[mingGongIndex];

  // 生成十二宫信息
  const gongList = generateGongList(mingGongIndex, year, month, day);

  return {
    year,
    month,
    day,
    hour,
    mingGong,
    gongList
  };
}

/**
 * 生成十二宫信息
 */
function generateGongList(mingGongIndex: number, year: number, month: number, day: number): GongInfo[] {
  const gongList: GongInfo[] = [];

  for (let i = 0; i < 12; i++) {
    const gongIndex = (mingGongIndex + i) % 12;
    const gong = GONG_LIST[gongIndex];
    const diZhi = DI_ZHI_LIST[gongIndex];

    // 简化算法：根据宫位和时间确定主星
    const zhuXing: ZhuXing[] = [];
    const starIndex1 = (gongIndex + year + month) % 14;
    const starIndex2 = (gongIndex + day) % 14;

    zhuXing.push(ZHU_XING_LIST[starIndex1]);
    if (starIndex1 !== starIndex2) {
      zhuXing.push(ZHU_XING_LIST[starIndex2]);
    }

    gongList.push({ gong, diZhi, zhuXing });
  }

  return gongList;
}
