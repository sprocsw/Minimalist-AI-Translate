import React, { useEffect, useMemo } from 'react';
import { Select } from 'antd';
import { useStore } from '../store/useStore';

// 定义API状态键类型
type ApiStatusKey = 'openai' | 'google' | 'deepseek' | 'ali';

const ModelSelect: React.FC = () => {
  const { model, setModel, apiStatus, apiKey, googleApiKey, deepseekApiKey, aliApiKey } = useStore();
  
  // 根据 API 启用状态和 API Key 是否存在来过滤可用的模型选项
  const MODEL_OPTIONS = useMemo(() => {
    const options = [];
    
    // OpenAI 模型 - 需要 API 启用且 API Key 不为空
    if (apiStatus.openai && apiKey) {
      options.push({ label: 'GPT-4o Mini', value: 'gpt-4o-mini' });
      options.push({ label: 'GPT-4o', value: 'gpt-4o' });
    }
    
    // Google API - 需要 API 启用且 API Key 不为空
    if (apiStatus.google && googleApiKey) {
      options.push({ label: 'Google API', value: 'google-api' });
    }
    
    // DeepSeek - 需要 API 启用且 API Key 不为空
    if (apiStatus.deepseek && deepseekApiKey) {
      options.push({ label: 'DeepSeek', value: 'deepseek' });
    }
    
    // 阿里通义 - 需要 API 启用且 API Key 不为空
    if (apiStatus.ali && aliApiKey) {
      options.push({ 
        label: '阿里通义', 
        options: [
          { label: '通义千问 Turbo', value: 'ali-qwen-turbo' },
          { label: '通义千问 Plus', value: 'ali-qwen-plus' },
          { label: '通义千问 Max', value: 'ali-qwen-max' },
        ]
      });
    }
    
    return options;
  }, [apiStatus, apiKey, googleApiKey, deepseekApiKey, aliApiKey]);
  
  // 在组件加载时检查模型状态
  useEffect(() => {
    // 如果存储了阿里通义具体模型，但 model 不是 'ali'，则修正
    const storedAliModel = localStorage.getItem('ali-model-type');
    if (storedAliModel && storedAliModel.startsWith('ali-') && model !== 'ali') {
      console.log('检测到阿里通义模型设置不一致，修正为:', storedAliModel);
      setModel('ali');
    }
    
    // 检查当前选择的模型是否可用（对应的 API 是否启用且有 API Key）
    const checkModelAvailability = () => {
      // 检查当前模型是否可用
      const isModelAvailable = (modelName: string): boolean => {
        if (modelName.startsWith('gpt-')) {
          return apiStatus.openai && !!apiKey;
        } else if (modelName === 'google-api') {
          return apiStatus.google && !!googleApiKey;
        } else if (modelName === 'deepseek') {
          return apiStatus.deepseek && !!deepseekApiKey;
        } else if (modelName === 'ali') {
          return apiStatus.ali && !!aliApiKey;
        }
        return false;
      };
      
      // 如果当前模型不可用，尝试切换到其他可用模型
      if (!isModelAvailable(model)) {
        // 尝试查找可用的模型
        if (apiStatus.openai && apiKey) {
          setModel('gpt-4o-mini');
        } else if (apiStatus.google && googleApiKey) {
          setModel('google-api');
        } else if (apiStatus.deepseek && deepseekApiKey) {
          setModel('deepseek');
        } else if (apiStatus.ali && aliApiKey) {
          setModel('ali');
        }
      }
    };
    
    checkModelAvailability();
  }, [model, setModel, apiStatus, apiKey, googleApiKey, deepseekApiKey, aliApiKey]);
  
  // 将 ali 转换为具体的阿里通义模型
  const handleModelChange = (value: string) => {
    if (value.startsWith('ali-')) {
      // 存储具体的阿里通义模型值，但在 API 调用时使用 'ali'
      setModel('ali');
      // 存储实际的模型名称（包含前缀）
      localStorage.setItem('ali-model-type', value);
      console.log('选择阿里通义模型:', value, '存储为 model=ali');
    } else {
      setModel(value);
      console.log('选择模型:', value);
    }
  };
  
  // 获取显示值
  const displayValue = model === 'ali' 
    ? (localStorage.getItem('ali-model-type') || 'ali-qwen-turbo') 
    : model;
  
  // 如果没有可用的模型选项，显示提示信息
  if (MODEL_OPTIONS.length === 0) {
    return (
      <div style={{ 
        width: 180, 
        height: 32, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#333',
        borderRadius: 6,
        color: '#ff7875',
        fontSize: 'var(--app-font-size)'
      }}>
        请配置至少一个 API
      </div>
    );
  }
  
  return (
    <Select
      value={displayValue}
      options={MODEL_OPTIONS}
      style={{ width: 180, fontSize: 'var(--app-font-size)' }}
      styles={{ popup: { root: { fontSize: 'var(--app-font-size)' } } }}
      onChange={handleModelChange}
      placeholder="选择模型"
    />
  );
};

export default ModelSelect;
