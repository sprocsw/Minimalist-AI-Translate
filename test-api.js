// 测试阿里通义 API
import fetch from 'node-fetch';

// 替换为你的 API Key
const apiKey = 'YOUR_API_KEY';

async function testAliAPI() {
  try {
    console.log('Testing Aliyun API...');
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个高质量的多语种翻译助手。' },
          { role: 'user', content: '请将以下内容翻译成英文：你好，世界！' }
        ],
        temperature: 0.2
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('API 调用成功！');
      console.log('翻译结果:', data.choices[0].message.content);
    } else {
      console.log('API 调用失败:', data.error || data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAliAPI(); 