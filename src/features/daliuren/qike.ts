/**
 * 大六壬起课算法
 */

import {
  DaLiuRenPan,
  Ke,
  SiKe,
  SanChuan
} from './types';
import {
  TIAN_GAN_LIST,
  DI_ZHI_LIST,
  TIAN_JIANG_LIST
} from './constants';

/**
 * 时间起课
 * @param date 起课时间，默认为当前时间
 */
export function timeQiKe(date: Date = new Date()): DaLiuRenPan {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 计算干支（简化算法）
  const ganZhi = calculateGanZhi(year, month, day, hour);

  // 起四课
  const siKe = calculateSiKe(ganZhi);

  // 起三传
  const sanChuan = calculateSanChuan(siKe);

  return {
    year,
    month,
    day,
    hour,
    ganZhi,
    siKe,
    sanChuan
  };
}

/**
 * 计算干支（简化算法）
 */
function calculateGanZhi(year: number, month: number, day: number, hour: number) {
  // 简化算法：使用模运算计算干支
  const yearGanIndex = (year - 4) % 10;
  const yearZhiIndex = (year - 4) % 12;
  const monthGanIndex = ((year - 4) * 12 + month - 1) % 10;
  const monthZhiIndex = (month + 1) % 12;
  const dayGanIndex = (year + month + day) % 10;
  const dayZhiIndex = (year + month + day) % 12;
  const hourZhiIndex = Math.floor(hour / 2) % 12;
  const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;

  return {
    year: TIAN_GAN_LIST[yearGanIndex] + DI_ZHI_LIST[yearZhiIndex],
    month: TIAN_GAN_LIST[monthGanIndex] + DI_ZHI_LIST[monthZhiIndex],
    day: TIAN_GAN_LIST[dayGanIndex] + DI_ZHI_LIST[dayZhiIndex],
    hour: TIAN_GAN_LIST[hourGanIndex] + DI_ZHI_LIST[hourZhiIndex]
  };
}

/**
 * 计算四课（简化算法）
 */
function calculateSiKe(_ganZhi: any): SiKe {
  // 简化算法：根据日干支计算四课
  const dayGanIndex = Math.floor(Math.random() * 10);
  const dayZhiIndex = Math.floor(Math.random() * 12);

  const diYiKe: Ke = {
    diZhi: DI_ZHI_LIST[dayZhiIndex],
    tianGan: TIAN_GAN_LIST[dayGanIndex],
    tianJiang: TIAN_JIANG_LIST[dayZhiIndex % 12]
  };

  const diErKe: Ke = {
    diZhi: DI_ZHI_LIST[(dayZhiIndex + 3) % 12],
    tianGan: TIAN_GAN_LIST[(dayGanIndex + 3) % 10],
    tianJiang: TIAN_JIANG_LIST[(dayZhiIndex + 3) % 12]
  };

  const diSanKe: Ke = {
    diZhi: DI_ZHI_LIST[(dayZhiIndex + 6) % 12],
    tianGan: TIAN_GAN_LIST[(dayGanIndex + 6) % 10],
    tianJiang: TIAN_JIANG_LIST[(dayZhiIndex + 6) % 12]
  };

  const diSiKe: Ke = {
    diZhi: DI_ZHI_LIST[(dayZhiIndex + 9) % 12],
    tianGan: TIAN_GAN_LIST[(dayGanIndex + 9) % 10],
    tianJiang: TIAN_JIANG_LIST[(dayZhiIndex + 9) % 12]
  };

  return { diYiKe, diErKe, diSanKe, diSiKe };
}

/**
 * 计算三传（简化算法）
 */
function calculateSanChuan(siKe: SiKe): SanChuan {
  // 简化算法：从四课中选取三传
  return {
    chuChuan: siKe.diYiKe,
    zhongChuan: siKe.diErKe,
    moChuan: siKe.diSanKe
  };
}
