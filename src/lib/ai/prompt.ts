/**
 * AI解读Prompt生成模块
 */

import { LiuYaoResult } from '@/features/liuyao';

/**
 * 生成六爻解读的prompt
 */
export function generateLiuYaoPrompt(result: LiuYaoResult): string {
  const { benGua, bianGua, hasChangingYao } = result;

  // 构建卦象信息
  const guaInfo = `
本卦：${benGua.name}
上卦：${benGua.upperGua}
下卦：${benGua.lowerGua}
${hasChangingYao ? `\n变卦：${bianGua?.name}` : ''}
`;

  // 构建爻的信息
  const yaoInfo = benGua.yaoList
    .map((yao, index) => {
      const position = index + 1;
      const yinYang = yao.yinYang === '阳' ? '阳爻' : '阴爻';
      const changing = yao.isChanging ? '（动爻）' : '';
      return `${position}爻：${yinYang}${changing}`;
    })
    .join('\n');

  const prompt = `你是一位精通周易六爻占卜的大师。请根据以下卦象信息，为用户提供详细的解读。

${guaInfo}

爻象详情：
${yaoInfo}

请从以下几个方面进行解读：
1. 卦象总体含义
2. 当前形势分析
3. 发展趋势预测
${hasChangingYao ? '4. 变卦的影响和建议' : ''}

请用通俗易懂的语言解读，既要保持传统周易的智慧，又要贴近现代生活。解读应该积极正面，给予用户启发和指导。`;

  return prompt;
}
