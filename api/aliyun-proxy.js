// Vercel Serverless Function for proxying requests to Aliyun DashScope API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('收到阿里通义API代理请求');
  
  try {
    const { apiKey, model, systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
      console.log('错误: 缺少API Key');
      return res.status(400).json({ error: 'API Key is required' });
    }
    
    if (!model) {
      console.log('错误: 缺少模型名称');
      return res.status(400).json({ error: 'Model is required' });
    }
    
    // 使用阿里云通义的 OpenAI 兼容接口
    console.log('使用阿里通义 OpenAI 兼容 API');
    console.log('模型:', model);
    console.log('API Key 前4位:', apiKey.substring(0, 4) + '***');
    
    try {
      // 调用阿里云 API - 使用正确的模型名称格式
      const apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      console.log('调用 API URL:', apiUrl);
      
      const requestBody = {
        model: model, // 使用传入的模型名称，不需要添加前缀
        messages: [
          { role: 'system', content: systemPrompt || '你是一个高质量的多语种翻译助手。' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      };
      
      console.log('请求体:', JSON.stringify({
        model: model,
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
        console.error('无法解析响应为 JSON:', responseText);
        return res.status(500).json({ 
          error: 'Invalid JSON response from Aliyun API',
          details: responseText.substring(0, 500) // 限制长度以防止过大的响应
        });
      }
      
      console.log('响应状态码:', response.status);
      console.log('响应数据:', JSON.stringify(data, null, 2));
      
      // 检查错误
      if (!response.ok) {
        console.error('阿里通义 API 错误:', data);
        return res.status(response.status).json({
          error: data.error || { message: 'Unknown error from Aliyun API' }
        });
      }
      
      // 返回响应
      return res.status(200).json(data);
    } catch (fetchError) {
      console.error('Fetch 错误:', fetchError);
      return res.status(500).json({ error: `Fetch error: ${fetchError.message || 'Unknown fetch error'}` });
    }
  } catch (error) {
    console.error('代理到阿里通义 API 时出错:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
} 