// 简单的 Express 服务器，用于本地开发环境中处理 API 请求
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// 启用 CORS
app.use(cors());

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
    console.log('Request model:', model);
    
    try {
      // 调用阿里云 API 的 OpenAI 兼容接口
      const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      console.log('Calling API URL:', apiUrl);
      
      const requestBody = {
        model: model, // 使用传入的模型名称，不需要添加前缀
        messages: [
          { role: 'system', content: systemPrompt || '你是一个高质量的多语种翻译助手。' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
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
        return res.status(500).json({ 
          error: 'Invalid JSON response from Aliyun API',
          details: responseText.substring(0, 500) // 限制长度以防止过大的响应
        });
      }
      
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // 检查错误
      if (!response.ok) {
        console.error('Aliyun API error:', data);
        return res.status(response.status).json({
          error: data.error || { message: 'Unknown error from Aliyun API' }
        });
      }
      
      // 返回响应
      return res.status(200).json(data);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ error: `Fetch error: ${fetchError.message}` });
    }
  } catch (error) {
    console.error('Error proxying to Aliyun API:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 