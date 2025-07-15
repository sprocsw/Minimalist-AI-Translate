// Vercel Serverless Function for Google Translate API
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
} 