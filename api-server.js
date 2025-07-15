// 简单的 Express 服务器，用于本地开发环境中处理 API 请求
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// 启用 CORS，允许所有源
app.use(cors({
  origin: '*', // 允许所有源
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析 JSON 请求体
app.use(bodyParser.json());

// 处理阿里通义 API 请求
app.post('/api/aliyun-proxy', async (req, res) => {
  try {
    const { apiKey, model, systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }
    
    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }
    
    // 使用阿里云通义的 OpenAI 兼容模式
    console.log('Proxying request to Aliyun API (OpenAI compatible mode)...');
    console.log('Input model:', model);
    console.log('API Key 前4位:', apiKey.substring(0, 4) + '***');
    
    try {
      // 调用阿里云 API 的 OpenAI 兼容接口
      const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      console.log('Calling API URL:', apiUrl);
      
      // 根据模型名称进行映射
      let actualModel = model;
      if (model === 'qwen-turbo') {
        actualModel = 'qwen-turbo';
      } else if (model === 'qwen-plus') {
        actualModel = 'qwen-plus';
      } else if (model === 'qwen-max') {
        actualModel = 'qwen-max';
      }
      
      const requestBody = {
        model: actualModel,
        messages: [
          { role: 'system', content: systemPrompt || '你是一个高质量的多语种翻译助手。' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      };
      
      console.log('Request body:', JSON.stringify({
        model: actualModel,
        messages: [
          { role: 'system', content: systemPrompt ? '(自定义提示词)' : '(默认提示词)' },
          { role: 'user', content: userPrompt.substring(0, 30) + '...' }
        ],
        temperature: 0.2
      }, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      // 获取响应数据
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        return res.status(200).json({ 
          success: false,
          error: 'Invalid JSON response from Aliyun API',
          details: responseText.substring(0, 500) // 限制长度以防止过大的响应
        });
      }
      
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // 检查错误 - 即使是 401 或其他错误，我们也返回 200 状态码，但在响应中包含错误信息
      // 这样前端可以正确处理错误，而不是收到 500 错误
      if (!response.ok) {
        console.error('Aliyun API error:', data);
        
        // 返回 200 状态码，但在响应中包含错误信息
        return res.status(200).json({
          success: false,
          error: data.error || { message: 'Unknown error from Aliyun API' }
        });
      }
      
      // 返回成功响应
      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(200).json({ 
        success: false,
        error: `Fetch error: ${fetchError.message || 'Unknown fetch error'}` 
      });
    }
  } catch (error) {
    console.error('Error proxying to Aliyun API:', error);
    return res.status(200).json({ 
      success: false,
      error: `Internal server error: ${error.message || 'Unknown error'}` 
    });
  }
});

// 处理Google Translate API请求
app.post('/api/google-translate', async (req, res) => {
  try {
    const { text, to, from } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (!to) {
      return res.status(400).json({ error: 'Target language is required' });
    }
    
    // 这里应该实现Google Translate API的调用
    // 由于没有具体实现，返回一个模拟响应
    // 在实际部署前，需要替换为真正的Google Translate API调用
    
    console.log('收到Google Translate请求:', { text: text.substring(0, 30) + '...', to, from });
    
    // 模拟翻译结果
    // 在实际部署时，这里应该调用真正的Google Translate API
    const translatedText = `[Translated: ${text}]`;
    
    return res.status(200).json({ text: translatedText });
  } catch (error) {
    console.error('Google Translate API错误:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 