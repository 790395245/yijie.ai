/**
 * 测试reasoning_content的API调用
 * 使用方法：node test-reasoning.js
 */

// 配置信息 - 请填写你的实际配置
const config = {
  apiUrl: 'https://ai.zzhdsgsss.xyz/v1',  // 你的API端点
  apiKey: 'sk-9GiDVHBHQaehDua9wK0Ic3luSikZWGeS2UQaP0QOYva9Fdm9',  // 你的API密钥
  model: 'deepseek-v3.2-thinking'  // 使用的模型
};

async function testReasoningAPI() {
  console.log('开始测试API调用...\n');
  console.log('配置信息:');
  console.log('- API URL:', config.apiUrl);
  console.log('- Model:', config.model);
  console.log('- API Key:', config.apiKey.substring(0, 10) + '...\n');

  try {
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: '请简单解释一下什么是奇门遁甲'
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    console.log('API响应成功，开始读取流式数据...\n');
    console.log('='.repeat(80));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let reasoningContent = '';
    let normalContent = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('\n' + '='.repeat(80));
            console.log('流式响应结束');
            continue;
          }

          try {
            const json = JSON.parse(data);
            chunkCount++;

            // 显示原始数据结构（前3个chunk）
            if (chunkCount <= 3) {
              console.log(`\nChunk ${chunkCount}:`);
              console.log(JSON.stringify(json, null, 2));
            }

            const delta = json.choices?.[0]?.delta;

            // 收集reasoning_content
            if (delta?.reasoning_content) {
              reasoningContent += delta.reasoning_content;
            }

            // 收集content
            if (delta?.content) {
              normalContent += delta.content;
            }
          } catch (e) {
            console.error('解析JSON失败:', e.message);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('测试结果汇总:');
    console.log('='.repeat(80));
    console.log(`总共收到 ${chunkCount} 个数据块\n`);

    if (reasoningContent) {
      console.log('✅ 检测到 reasoning_content:');
      console.log('-'.repeat(80));
      console.log(reasoningContent);
      console.log('-'.repeat(80));
      console.log(`长度: ${reasoningContent.length} 字符\n`);
    } else {
      console.log('❌ 未检测到 reasoning_content\n');
    }

    if (normalContent) {
      console.log('✅ 检测到 content:');
      console.log('-'.repeat(80));
      console.log(normalContent);
      console.log('-'.repeat(80));
      console.log(`长度: ${normalContent.length} 字符\n`);
    } else {
      console.log('❌ 未检测到 content\n');
    }

    // 显示最终组合结果
    if (reasoningContent) {
      console.log('最终组合结果（包含thinking标签）:');
      console.log('='.repeat(80));
      const finalResult = `<thinking>\n${reasoningContent}\n</thinking>\n\n${normalContent}`;
      console.log(finalResult);
      console.log('='.repeat(80));
    }

  } catch (error) {
    console.error('测试失败:', error.message);
    console.error(error);
  }
}

// 运行测试
testReasoningAPI();
