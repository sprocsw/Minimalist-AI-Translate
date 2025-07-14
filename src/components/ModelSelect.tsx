import React from 'react';
import { Select } from 'antd';
import { useStore } from '../store/useStore';

const MODEL_OPTIONS = [
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Google API', value: 'google-api' },
  { label: 'DeepSeek', value: 'deepseek' },
  { 
    label: '阿里通义', 
    options: [
      { label: '通义千问 Turbo', value: 'ali-qwen-turbo' },
      { label: '通义千问 Plus', value: 'ali-qwen-plus' },
      { label: '通义千问 Max', value: 'ali-qwen-max' },
    ]
  },
];

const ModelSelect: React.FC = () => {
  const { model, setModel } = useStore();
  
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
