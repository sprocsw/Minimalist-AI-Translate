import React, { useState } from 'react';
import { Input, Button, message as antdMessage, Switch, Tooltip, Alert } from 'antd';
import { useStore } from '../store/useStore';
import LanguageSelect from './LanguageSelect';
import { QuestionCircleOutlined } from '@ant-design/icons';

// 定义测试结果类型
interface TestResult {
  success: boolean;
  message?: string;
}

const MODEL_CONFIGS = [
  {
    key: 'apiKey',
    label: 'OpenAI (GPT-4o/4o Mini)',
    placeholder: '请输入 OpenAI API Key',
    save: 'setApiKey',
    statusKey: 'openai',
    test: async (key: string): Promise<TestResult> => {
      if (!key) return { success: false, message: 'API Key 不能为空' };
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        
        if (res.ok) {
          return { success: true };
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            return { success: false, message: '无效的 API Key' };
          } else if (res.status === 429) {
            return { success: false, message: '请求频率限制' };
          } else {
            return { success: false, message: data.error?.message || `错误 (${res.status})` };
          }
        }
      } catch (error) {
        return { success: false, message: '网络错误，请检查网络连接' };
      }
    },
  },
  {
    key: 'googleApiKey',
    label: 'Google API',
    placeholder: '请输入 Google API Key',
    save: 'setGoogleApiKey',
    statusKey: 'google',
    test: async (key: string): Promise<TestResult> => {
      if (!key) return { success: false, message: 'API Key 不能为空' };
      try {
        // 真实检测 Google API Key
        const res = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: 'Hello world' }),
        });
        
        if (res.ok) {
          return { success: true };
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 400 && data.error?.message?.includes('API key')) {
            return { success: false, message: '无效的 API Key' };
          } else if (res.status === 403) {
            return { success: false, message: '无权限或未启用翻译 API' };
          } else {
            return { success: false, message: data.error?.message || `错误 (${res.status})` };
          }
        }
      } catch (error) {
        return { success: false, message: '网络错误，请检查网络连接' };
      }
    },
  },
  {
    key: 'deepseekApiKey',
    label: 'DeepSeek',
    placeholder: '请输入 DeepSeek API Key',
    save: 'setDeepseekApiKey',
    statusKey: 'deepseek',
    test: async (key: string): Promise<TestResult> => {
      if (!key) return { success: false, message: 'API Key 不能为空' };
      try {
        // 真实检测 DeepSeek API Key
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一个翻译助手' },
              { role: 'user', content: '测试API密钥' },
            ],
            max_tokens: 5,
          }),
        });
        
        if (res.ok) {
          return { success: true };
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            return { success: false, message: '无效的 API Key' };
          } else if (res.status === 429) {
            return { success: false, message: '请求频率限制' };
          } else {
            return { success: false, message: data.error?.message || `错误 (${res.status})` };
          }
        }
      } catch (error) {
        return { success: false, message: '网络错误，请检查网络连接' };
      }
    },
  },
  {
    key: 'aliApiKey',
    label: '阿里通义',
    placeholder: '请输入阿里通义 API Key',
    save: 'setAliApiKey',
    statusKey: 'ali',
    test: async (key: string): Promise<TestResult> => {
      if (!key) return { success: false, message: 'API Key 不能为空' };
      try {
        // 真实检测阿里通义 API Key
        const apiUrl = '/api/aliyun-proxy';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: key,
            model: 'qwen-turbo',
            systemPrompt: '你是一个翻译助手',
            userPrompt: '测试API密钥'
          })
        });
        
        if (res.ok) {
          return { success: true };
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            return { success: false, message: '无效的 API Key' };
          } else if (res.status === 403) {
            return { success: false, message: '无权限访问该模型' };
          } else if (data.error?.code === 'quota_exceeded') {
            return { success: false, message: 'API 额度已用完' };
          } else {
            return { success: false, message: data.error?.message || `错误 (${res.status})` };
          }
        }
      } catch (error) {
        return { success: false, message: '网络错误，请检查网络连接' };
      }
    },
  },
];

const inputStyle = {
  width: '70%',
  marginRight: 8,
  background: '#18181c',
  color: '#fff',
  border: '1px solid #333',
};

const ApiKeyConfig: React.FC = () => {
  const store = useStore();
  const [inputs, setInputs] = useState<{ [key: string]: string }>({
    apiKey: store.apiKey || '',
    googleApiKey: store.googleApiKey || '',
    deepseekApiKey: store.deepseekApiKey || '',
    aliApiKey: store.aliApiKey || '',
  });
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    apiKey: false,
    googleApiKey: false,
    deepseekApiKey: false,
    aliApiKey: false,
  });
  const [testResult, setTestResult] = useState<{ [key: string]: string }>({
    apiKey: '',
    googleApiKey: '',
    deepseekApiKey: '',
    aliApiKey: '',
  });
  const [message, contextHolder] = antdMessage.useMessage();

  // 语种选择
  const { myLang, setMyLang, toLang, setToLang, apiStatus, setApiStatus } = store;

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string, saveFn: (k: string) => void) => {
    if (!inputs[key].trim()) {
      message.error('API Key 不能为空');
      return;
    }
    saveFn(inputs[key].trim());
    message.success('已保存');
  };

  const handleTest = async (key: string, testFn: (k: string) => Promise<TestResult>) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setTestResult((prev) => ({ ...prev, [key]: '' }));
    
    try {
      const result = await testFn(inputs[key]);
      if (result.success) {
        setTestResult((prev) => ({ ...prev, [key]: '可用' }));
      } else {
        setTestResult((prev) => ({ ...prev, [key]: result.message || '无效/不可用' }));
      }
    } catch (error) {
      setTestResult((prev) => ({ ...prev, [key]: '测试失败' }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // 处理 API 启用/禁用状态变更
  const handleApiStatusChange = (statusKey: string, checked: boolean) => {
    setApiStatus(statusKey as keyof typeof apiStatus, checked);
    message.success(`${checked ? '启用' : '禁用'}成功`);
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24, background: '#222', borderRadius: 8, boxShadow: '0 2px 8px #111', color: '#fff' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center', justifyContent: 'center' }}>
        <LanguageSelect value={myLang} onChange={setMyLang} label="我的语种" exclude={[]} style={{ fontSize: 'var(--app-font-size)' }} />
        <LanguageSelect value={toLang} onChange={setToLang} label="目标语种" exclude={[myLang]} style={{ fontSize: 'var(--app-font-size)' }} />
      </div>
      <h2 style={{ color: '#fff', marginBottom: 16, textAlign: 'center', letterSpacing: 2, fontSize: 'var(--app-font-size)' }}>API Key 配置</h2>
      
      <Alert
        message="提示：即使 API 处于禁用状态，您也可以编辑、测试和保存 API Key"
        type="info"
        showIcon
        style={{ marginBottom: 24, background: '#111', border: '1px solid #333', fontSize: 'var(--app-font-size)' }}
      />
      
      {contextHolder}
      {MODEL_CONFIGS.map(({ key, label, placeholder, save, test, statusKey }) => (
        <div key={key} style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#bbb', fontWeight: 500, fontSize: 'var(--app-font-size)' }}>{label}</div>
            <div style={{ color: '#bbb', fontSize: 'var(--app-font-size)' }}>
              {apiStatus[statusKey] ? '已启用' : '已禁用'}
            </div>
          </div>
          <Input.Password
            placeholder={placeholder}
            value={inputs[key]}
            onChange={e => handleInput(key, e.target.value)}
            style={{ ...inputStyle, fontSize: 'var(--app-font-size)', opacity: apiStatus[statusKey] ? 1 : 0.5 }}
            autoComplete="off"
            bordered={false}
          />
          <Button
            type="primary"
            onClick={() => handleSave(key, (store as any)[save])}
            style={{ marginRight: 8, background: '#4096ff', border: 'none', fontSize: 'var(--app-font-size)' }}
          >保存</Button>
          <Button
            onClick={() => handleTest(key, test)}
            loading={loading[key]}
            style={{ background: '#333', color: '#fff', border: 'none', fontSize: 'var(--app-font-size)', marginRight: 8 }}
          >测试</Button>
          <Tooltip title={apiStatus[statusKey] ? '点击禁用此 API' : '点击启用此 API'}>
            <Switch 
              checked={apiStatus[statusKey]} 
              onChange={(checked) => handleApiStatusChange(statusKey, checked)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="禁用后，相关模型将在模型选择中隐藏，且不会被使用">
            <QuestionCircleOutlined style={{ color: '#888', marginLeft: 8 }} />
          </Tooltip>
          <span style={{ marginLeft: 12, color: testResult[key] === '可用' ? '#52c41a' : '#ff7875', fontWeight: 500, fontSize: 'var(--app-font-size)' }}>
            {testResult[key]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ApiKeyConfig;
