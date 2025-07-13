import React from 'react';
import { Select } from 'antd';

const LANGS = [
  { label: '简体中文', value: 'zh' },
  { label: '英文', value: 'en' },
  { label: '日文', value: 'ja' },
  { label: '韩文', value: 'ko' },
  { label: '法语', value: 'fr' },
  { label: '德语', value: 'de' },
  { label: '西班牙语', value: 'es' },
  { label: '俄语', value: 'ru' },
];

interface LanguageSelectProps {
  value: string;
  onChange: (lang: string) => void;
  label?: string;
  exclude?: string[];
  showAuto?: boolean;
  style?: React.CSSProperties;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ value, onChange, label, exclude, showAuto }) => {
  let options = exclude ? LANGS.filter(l => !exclude.includes(l.value)) : [...LANGS];
  if (showAuto) {
    options = [{ label: '自动检测', value: 'auto' }, ...options];
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {label && <span style={{ color: '#fff', fontSize: 'var(--app-font-size)' }}>{label}</span>}
      <Select
        value={value}
        options={options}
        style={{ width: 140, fontSize: 'var(--app-font-size)' }}
        onChange={onChange}
        placeholder={label}
        styles={{ popup: { root: { fontSize: 'var(--app-font-size)', zIndex: 9999 } } }}
        getPopupContainer={() => document.body}
      />
    </div>
  );
};

export { LANGS };
export default LanguageSelect; 