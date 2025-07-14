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
  
  try {
    const { apiKey, model, systemPrompt, userPrompt } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }
    
    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }
    
    // 使用阿里云通义的 OpenAI 兼容接口
    console.log('Using Aliyun OpenAI compatible API');
    console.log('Model:', model);
    
    try {
      // 调用阿里云 API - 使用正确的模型名称格式
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
      return res.status(500).json({ error: `Fetch error: ${fetchError.message || 'Unknown fetch error'}` });
    }
  } catch (error) {
    console.error('Error proxying to Aliyun API:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
} 