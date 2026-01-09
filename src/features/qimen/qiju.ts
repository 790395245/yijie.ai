/**
 * 奇门遁甲起局算法
 */

import {
  QiMenPan,
  GongInfo,
  TianGan
} from './types';
import {
  TIAN_GAN_LIST,
  DI_ZHI_LIST,
  BA_MEN_LIST,
  JIU_XING_LIST,
  BA_SHEN_LIST,
  JIU_GONG_LIST
} from './constants';

/**
 * 时间起局
 * @param date 起局时间，默认为当前时间
 */
export function timeQiJu(date: Date = new Date()): QiMenPan {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 简化算法：根据时间计算局数
  // 实际奇门遁甲需要根据节气、阴阳遁等复杂规则
  const juShu = ((month + day + hour) % 9) + 1;

  // 确定值符（九星之首）
  const zhiFuIndex = (juShu - 1) % 9;
  const zhiFu = JIU_XING_LIST[zhiFuIndex];

  // 确定值使（八门之首）
  const zhiShiIndex = (juShu - 1) % 8;
  const zhiShi = BA_MEN_LIST[zhiShiIndex];

  // 确定旬首（天干）
  const xunShouIndex = (year + month + day) % 10;
  const xunShou = TIAN_GAN_LIST[xunShouIndex];

  // 生成九宫信息
  const gongList = generateGongList(juShu, hour);

  return {
    year,
    month,
    day,
    hour,
    zhiFu,
    zhiShi,
    xunShou,
    gongList
  };
}

/**
 * 生成九宫信息
 * @param juShu 局数
 * @param hour 时辰
 */
function generateGongList(juShu: number, hour: number): GongInfo[] {
  const gongList: GongInfo[] = [];

  for (let i = 0; i < 9; i++) {
    const gong = JIU_GONG_LIST[i];

    // 根据局数和宫位确定天干
    const tianGanIndex = (juShu + i) % 10;
    const tianGan = TIAN_GAN_LIST[tianGanIndex];

    // 根据时辰确定地支
    const diZhiIndex = (hour / 2 + i) % 12;
    const diZhi = DI_ZHI_LIST[Math.floor(diZhiIndex)];

    // 根据局数确定八门
    const baMenIndex = (juShu + i) % 8;
    const baMen = BA_MEN_LIST[baMenIndex];

    // 根据局数确定九星
    const jiuXingIndex = (juShu + i) % 9;
    const jiuXing = JIU_XING_LIST[jiuXingIndex];

    // 根据局数确定八神
    const baShenIndex = (juShu + i) % 8;
    const baShen = BA_SHEN_LIST[baShenIndex];

    // 暗干（简化处理）
    const anGan: TianGan[] = [
      TIAN_GAN_LIST[(tianGanIndex + 1) % 10],
      TIAN_GAN_LIST[(tianGanIndex + 2) % 10]
    ];

    gongList.push({
      gong,
      tianGan,
      diZhi,
      baMen,
      jiuXing,
      baShen,
      anGan
    });
  }

  return gongList;
}
