import React from 'react';
import { useStore } from '../store/useStore';
import { message as antdMessage } from 'antd';
import { LANGS } from './LanguageSelect';

// 支持所有语种的 label
const langLabel = (lang: string) => {
  const found = LANGS.find(l => l.value === lang);
  return found ? found.label : lang;
};

const HistoryList: React.FC = () => {
  const { history, removeHistory, clearHistory } = useStore();
  const [message, contextHolder] = antdMessage.useMessage();
  if (!history.length) return null;
  return (
    <div style={{ marginTop: 32, background: '#222', borderRadius: 8, boxShadow: '0 2px 8px #0002' }}>
      {contextHolder}
      <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#222', padding: '16px 16px 0 16px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <strong style={{ fontSize: 'var(--app-font-size)' }}>历史记录</strong>
        <span style={{ fontSize: 'var(--app-font-size)', color: '#888' }}>（双击内容即可复制）</span>
        <button onClick={clearHistory} style={{ fontSize: 'var(--app-font-size)' }}>清空</button>
      </div>
      <ul style={{ padding: '0 16px 16px 16px', margin: 0, listStyle: 'none' }}>
        {history.map(item => (
          <li key={item.id} style={{ marginBottom: 12, borderBottom: '1px solid #333', paddingBottom: 8, position: 'relative' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4, fontSize: 'var(--app-font-size)', paddingRight: 48 }}>
              {langLabel(item.from)} → {langLabel(item.to)} | {new Date(item.time).toLocaleString()}
              <button
                onClick={() => removeHistory(item.id)}
                aria-label="删除"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#333')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                🗑️
              </button>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div
                style={{ flex: 1, minWidth: 0, color: '#aaa', background: '#18181c', padding: 8, borderRadius: 4, border: '1px solid #333', cursor: 'pointer', userSelect: 'text', fontSize: 'var(--app-font-size)', maxHeight: '10em', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'start' }}
                title="双击复制原文"
                onDoubleClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(item.fromText || '');
                  message.success('已复制原文内容');
                }}
              >
                {item.fromText}
              </div>
              <div
                style={{ flex: 1, minWidth: 0, color: '#fff', background: '#18181c', padding: 8, borderRadius: 4, border: '1px solid #333', cursor: 'pointer', userSelect: 'text', fontSize: 'var(--app-font-size)', maxHeight: '10em', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'start' }}
                title="双击复制译文"
                onDoubleClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(item.toText || '');
                  message.success('已复制译文内容');
                }}
              >
                {item.toText}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryList; 