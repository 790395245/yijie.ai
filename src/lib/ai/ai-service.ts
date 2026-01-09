/**
 * AI解读服务模块
 */

/**
 * 调用Claude API进行卦象解读
 * @param prompt 解读prompt
 * @param apiKey Claude API密钥
 * @param baseURL 自定义API端点（可选）
 * @param onChunk 流式输出回调函数
 * @param model 模型名称（可选）
 */
export async function interpretWithClaude(
  prompt: string,
  apiKey: string,
  baseURL?: string,
  onChunk?: (text: string) => void,
  model?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('请提供Claude API密钥');
  }

  const finalModel = model || import.meta.env.VITE_DEFAULT_MODEL || 'claude-sonnet-4-5-20250929';

  // 如果提供了自定义baseURL，使用fetch直接调用（适用于第三方代理）
  if (baseURL) {
    return interpretWithClaudeProxy(prompt, apiKey, baseURL, onChunk, finalModel);
  }

  // 官方SDK需要在服务端使用，浏览器环境请提供baseURL
  throw new Error('浏览器环境下使用Claude API需要提供baseURL参数');
}

/**
 * 使用fetch直接调用第三方Claude API代理
 */
async function interpretWithClaudeProxy(
  prompt: string,
  apiKey: string,
  baseURL: string,
  onChunk?: (text: string) => void,
  model?: string
): Promise<string> {
  try {
    let fullResponse = '';
    const url = `${baseURL}/v1/messages`;
    const finalModel = model || 'claude-sonnet-4-5-20250929';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: finalModel,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
              const text = json.delta.text;
              fullResponse += text;
              if (onChunk) {
                onChunk(text);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('AI解读失败:', error);
    throw new Error('AI解读失败，请检查API密钥、URL或网络连接');
  }
}

/**
 * 调用OpenAI API进行卦象解读
 * @param prompt 解读prompt
 * @param apiKey OpenAI API密钥
 * @param baseURL 自定义API端点
 * @param onChunk 流式输出回调函数
 * @param model 模型名称（可选）
 */
export async function interpretWithOpenAI(
  prompt: string,
  apiKey: string,
  baseURL: string,
  onChunk?: (text: string) => void,
  model?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('请提供OpenAI API密钥');
  }
  if (!baseURL) {
    throw new Error('请提供OpenAI API端点URL');
  }

  const finalModel = model || import.meta.env.VITE_DEFAULT_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

  try {
    let fullResponse = '';
    const url = `${baseURL}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              if (onChunk) {
                onChunk(content);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('AI解读失败:', error);
    throw new Error('AI解读失败，请检查API密钥、URL或网络连接');
  }
}
