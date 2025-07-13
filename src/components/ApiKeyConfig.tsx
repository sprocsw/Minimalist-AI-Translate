import React, { useState } from 'react';
import { Input, Button, message as antdMessage, Select } from 'antd';
import { useStore } from '../store/useStore';
import LanguageSelect, { LANGS } from './LanguageSelect';

const MODEL_CONFIGS = [
  {
    key: 'apiKey',
    label: 'OpenAI (GPT-4o/4o Mini)',
    placeholder: '请输入 OpenAI API Key',
    save: 'setApiKey',
    test: async (key: string) => {
      if (!key) return false;
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    key: 'googleApiKey',
    label: 'Google API',
    placeholder: '请输入 Google API Key',
    save: 'setGoogleApiKey',
    test: async (key: string) => {
      if (!key) return false;
      // 这里只做简单格式校验，实际可调用 Google API 检查
      return key.startsWith('AIza');
    },
  },
  {
    key: 'deepseekApiKey',
    label: 'DeepSeek',
    placeholder: '请输入 DeepSeek API Key',
    save: 'setDeepseekApiKey',
    test: async (key: string) => {
      if (!key) return false;
      // 这里只做简单长度校验，实际可调用 DeepSeek API 检查
      return key.length > 10;
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
  const [inputs, setInputs] = useState({
    apiKey: store.apiKey || '',
    googleApiKey: store.googleApiKey || '',
    deepseekApiKey: store.deepseekApiKey || '',
  });
  const [loading, setLoading] = useState({
    apiKey: false,
    googleApiKey: false,
    deepseekApiKey: false,
  });
  const [testResult, setTestResult] = useState({
    apiKey: '',
    googleApiKey: '',
    deepseekApiKey: '',
  });
  const [message, contextHolder] = antdMessage.useMessage();

  // 语种选择
  const { myLang, setMyLang, toLang, setToLang } = store;

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

  const handleTest = async (key: string, testFn: (k: string) => Promise<boolean>) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setTestResult((prev) => ({ ...prev, [key]: '' }));
    const ok = await testFn(inputs[key]);
    setTestResult((prev) => ({ ...prev, [key]: ok ? '可用' : '无效/不可用' }));
    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24, background: '#222', borderRadius: 8, boxShadow: '0 2px 8px #111', color: '#fff' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'center', justifyContent: 'center' }}>
        <LanguageSelect value={myLang} onChange={setMyLang} label="我的语种" exclude={[]} style={{ fontSize: 'var(--app-font-size)' }} styles={{ popup: { root: { fontSize: 'var(--app-font-size)' } } }} />
        <LanguageSelect value={toLang} onChange={setToLang} label="目标语种" exclude={[myLang]} style={{ fontSize: 'var(--app-font-size)' }} styles={{ popup: { root: { fontSize: 'var(--app-font-size)' } } }} />
      </div>
      <h2 style={{ color: '#fff', marginBottom: 32, textAlign: 'center', letterSpacing: 2, fontSize: 'var(--app-font-size)' }}>API Key 配置</h2>
      {contextHolder}
      {MODEL_CONFIGS.map(({ key, label, placeholder, save, test }) => (
        <div key={key} style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 8, color: '#bbb', fontWeight: 500, fontSize: 'var(--app-font-size)' }}>{label}</div>
          <Input.Password
            placeholder={placeholder}
            value={inputs[key]}
            onChange={e => handleInput(key, e.target.value)}
            style={{ ...inputStyle, fontSize: 'var(--app-font-size)' }}
            autoComplete="off"
            bordered={false}
          />
          <Button
            type="primary"
            onClick={() => handleSave(key, store[save])}
            style={{ marginRight: 8, background: '#4096ff', border: 'none', fontSize: 'var(--app-font-size)' }}
          >保存</Button>
          <Button
            onClick={() => handleTest(key, test)}
            loading={loading[key]}
            style={{ background: '#333', color: '#fff', border: 'none', fontSize: 'var(--app-font-size)' }}
          >测试</Button>
          <span style={{ marginLeft: 12, color: testResult[key] === '可用' ? '#52c41a' : '#ff7875', fontWeight: 500, fontSize: 'var(--app-font-size)' }}>
            {testResult[key]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ApiKeyConfig;
