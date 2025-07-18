import React, { useState, useEffect } from 'react';
import './App.css';
import ApiKeyConfig from './components/ApiKeyConfig';
import TranslateBox from './components/TranslateBox';
import HistoryList from './components/HistoryList';
import ModelSelect from './components/ModelSelect';
import 'antd/dist/reset.css';
import { useStore } from './store/useStore';
import { Modal, Button, Switch } from 'antd';

const FontSizeControl: React.FC = () => {
  const { fontSize, setFontSize } = useStore();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#222', borderRadius: 6, padding: '2px 8px' }}>
      <span style={{ color: '#bbb', fontSize: 'var(--app-font-size)' }}>文字大小</span>
      <Button size="small" onClick={() => setFontSize(fontSize - 2)} disabled={fontSize <= 14} style={{ padding: '0 8px', fontSize: 'var(--app-font-size)' }}>-</Button>
      <span style={{ minWidth: 44, textAlign: 'center', color: '#fff', fontWeight: 500, display: 'inline-block', fontSize: 'var(--app-font-size)' }}>{fontSize}px</span>
      <Button size="small" onClick={() => setFontSize(fontSize + 2)} disabled={fontSize >= 36} style={{ padding: '0 8px', fontSize: 'var(--app-font-size)' }}>+</Button>
    </div>
  );
};

const Header: React.FC<{ onOpenConfig: () => void }> = ({ onOpenConfig }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      width: '100%',
      zIndex: 10,
      background: '#18181c',
      padding: '16px 32px', // 用 padding 替代 height
      borderBottom: '1px solid #222',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/logo-256.png" alt="logo" style={{ height: 36, borderRadius: 8, background: '#fff' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>极简 AI 翻译</span>
          <span style={{ fontSize: 13, color: '#4096ff', fontWeight: 500, letterSpacing: 1 }}>Minimalist AI Translate</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <FontSizeControl />
        <ModelSelect />
        <Button type="primary" onClick={onOpenConfig} style={{ marginLeft: 16, fontSize: 'var(--app-font-size)' }}>API Key 配置</Button>
      </div>
    </header>
  );
};

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const { fontSize, model, setModel, showHistory, toggleShowHistory } = useStore();
  
  // 在应用启动时检查模型设置
  useEffect(() => {
    // 检查是否有阿里通义模型设置
    const storedAliModel = localStorage.getItem('ali-model-type');
    if (storedAliModel && storedAliModel.startsWith('ali-') && model !== 'ali') {
      console.log('应用启动: 检测到阿里通义模型设置，修正为 ali');
      setModel('ali');
    }
    
    console.log('应用启动: 当前模型设置:', model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div style={{ minHeight: '100vh', background: '#18181c', color: '#fff', fontSize: fontSize, ['--app-font-size']: fontSize + 'px' } as React.CSSProperties}>
      <Header onOpenConfig={() => setShowConfig(true)} />
      <main style={{ padding: 32 }}>
        <TranslateBox />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--app-font-size)' }}>历史记录</span>
            <Switch 
              checked={showHistory} 
              onChange={toggleShowHistory} 
              size="small" 
              style={{ backgroundColor: showHistory ? '#1677ff' : 'rgba(0, 0, 0, 0.45)' }}
            />
          </div>
        </div>
        
        {showHistory && <HistoryList />}
      </main>
      <Modal
        open={showConfig}
        onCancel={() => setShowConfig(false)}
        footer={null}
        title={<span style={{ color: '#fff', fontSize: 'var(--app-font-size)' }}>API Key 配置</span>}
        centered
        styles={{ body: { background: '#222', borderRadius: 8, fontSize: 'var(--app-font-size)' } }}
        width={520}
        destroyOnClose
      >
        <ApiKeyConfig />
      </Modal>
    </div>
  );
}

export default App;
