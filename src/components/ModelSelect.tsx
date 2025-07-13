import React from 'react';
import { Select } from 'antd';
import { useStore } from '../store/useStore';

const MODEL_OPTIONS = [
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Google API', value: 'google-api' },
  { label: 'DeepSeek', value: 'deepseek' },
];

const ModelSelect: React.FC = () => {
  const { model, setModel } = useStore();
  return (
    <Select
      value={model}
      options={MODEL_OPTIONS}
      style={{ width: 180, fontSize: 'var(--app-font-size)' }}
      styles={{ popup: { root: { fontSize: 'var(--app-font-size)' } } }}
      onChange={setModel}
      placeholder="选择模型"
    />
  );
};

export default ModelSelect;
