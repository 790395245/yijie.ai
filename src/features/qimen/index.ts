/**
 * 奇门遁甲模块入口
 */

// 导出类型
export * from './types';

// 导出常量
export * from './constants';

// 导出起局函数
export { calculate } from './qiju';
export type { QiMenResult, JuShuInfo, GongAnalysis, OverallAnalysis } from './qiju';

// 导出解析函数
export { parseQiMenPan } from './parser';
