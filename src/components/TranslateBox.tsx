import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Select, message as antdMessage } from 'antd';
import { useStore } from '../store/useStore';
import { LANGS } from './LanguageSelect';
import type { TextAreaRef } from 'antd/es/input/TextArea';

const { TextArea } = Input;

const TranslateBox: React.FC = () => {
  const { apiKey, addHistory, model, myLang, toLang, resultLangMode, setResultLangMode, googleApiKey, deepseekApiKey } = useStore();
  const [fromText, setFromText] = useState('');
  const [fromLang, setFromLang] = useState<'auto' | 'zh' | 'en'>('auto');
  const [toText, setToText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextAreaRef>(null);
  const [message, contextHolder] = antdMessage.useMessage();
  const [maxHeight, setMaxHeight] = useState(window.innerHeight * 0.5);
  const [systemPrompt, setSystemPrompt] = useState('你是一个高质量的多语种翻译助手。');

  useEffect(() => {
    const handleResize = () => setMaxHeight(window.innerHeight * 0.5);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 粘贴即翻译
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setFromText(text);
    setTimeout(() => {
      handleTranslate(text);
    }, 0);
  };

  // 自动检测多语种
  const detectLang = (text: string): string => {
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
    if (/[\u3040-\u30ff]/.test(text)) return 'ja'; // 日文
    if (/[\uac00-\ud7af]/.test(text)) return 'ko'; // 韩文
    if (/[a-zA-Z]/.test(text)) return 'en';
    if (/[\u00C0-\u017F]/.test(text)) return 'fr'; // 法语、德语、西语等拉丁文
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // 俄语
    return 'en'; // 默认英文
  };

  // 翻译主逻辑
  const handleTranslate = async (text?: string) => {
    const input = typeof text === 'string' ? text : fromText;
    if (!input.trim()) {
      message.warning('请输入需要翻译的文本');
      return;
    }
    if (!apiKey && model !== 'google-translate') {
      message.error('请先配置 OpenAI API Key');
      return;
    }
    setLoading(true);

    const detected = detectLang(input);
    let realTarget = '';
    if (resultLangMode === 'auto') {
      if (detected === myLang) {
        realTarget = toLang;
      } else if (detected === toLang) {
        realTarget = myLang;
      } else {
        realTarget = toLang;
      }
      if (detected === realTarget) {
        setToText(input);
        setLoading(false);
        return;
      }
    } else {
      realTarget = resultLangMode;
    }

    // Google Translate 分流
    if (model === 'google-translate') {
      try {
        const res = await fetch('http://localhost:3001/api/google-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input, to: realTarget, from: detected }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setToText('API Key 无效或无权限');
            message.error('API Key 无效或无权限');
          } else if (res.status === 402) {
            setToText('余额不足');
            message.error('API Key 余额不足');
          } else if (res.status === 429) {
            setToText('请求过于频繁，请稍后再试');
            message.error('请求过于频繁，请稍后再试');
          } else {
            setToText('服务异常，请稍后重试');
            message.error('服务异常，请稍后重试');
          }
          setLoading(false);
          return;
        }
        if (data.text) {
          setToText(data.text);
          addHistory({
            from: fromLang === 'auto' ? detected : fromLang,
            to: realTarget,
            fromText: input,
            toText: data.text,
          });
        } else {
          setToText('翻译失败');
        }
      } catch {
        setToText('请求失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Google API 官方接口分流
    if (model === 'google-api') {
      if (!googleApiKey) {
        message.error('请先配置 Google API Key');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: input, target: realTarget, source: detected }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setToText('API Key 无效或无权限');
            message.error('API Key 无效或无权限');
          } else if (res.status === 402) {
            setToText('余额不足');
            message.error('API Key 余额不足');
          } else if (res.status === 429) {
            setToText('请求过于频繁，请稍后再试');
            message.error('请求过于频繁，请稍后再试');
          } else {
            setToText('服务异常，请稍后重试');
            message.error('服务异常，请稍后重试');
          }
          setLoading(false);
          return;
        }
        if (data.data && data.data.translations && data.data.translations[0]) {
          setToText(data.data.translations[0].translatedText);
          addHistory({
            from: fromLang === 'auto' ? detected : fromLang,
            to: realTarget,
            fromText: input,
            toText: data.data.translations[0].translatedText,
          });
        } else {
          setToText('翻译失败');
        }
      } catch {
        setToText('请求失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // DeepSeek 分流
    if (model === 'deepseek') {
      if (!deepseekApiKey) {
        message.error('请先配置 DeepSeek API Key');
        setLoading(false);
        return;
      }
      try {
        const prompt = `请将以下内容翻译成${LANGS.find((l: { value: string; label: string }) => l.value === realTarget)?.label || realTarget}，只输出译文，不要解释：${input}`;
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            stream: false,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setToText('API Key 无效或无权限');
            message.error('API Key 无效或无权限');
          } else if (res.status === 402) {
            setToText('余额不足');
            message.error('API Key 余额不足');
          } else if (res.status === 429) {
            setToText('请求过于频繁，请稍后再试');
            message.error('请求过于频繁，请稍后再试');
          } else {
            setToText('服务异常，请稍后重试');
            message.error('服务异常，请稍后重试');
          }
          setLoading(false);
          return;
        }
        if (data.choices && data.choices[0].message.content) {
          setToText(data.choices[0].message.content.trim());
          addHistory({
            from: fromLang === 'auto' ? detected : fromLang,
            to: realTarget,
            fromText: input,
            toText: data.choices[0].message.content.trim(),
          });
        } else {
          setToText('翻译失败');
        }
      } catch {
        setToText('请求失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // prompt 生成
    const prompt = `请将以下内容翻译成${LANGS.find((l: { value: string; label: string }) => l.value === realTarget)?.label || realTarget}，只输出译文，不要解释：${input}`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setToText('API Key 无效或无权限');
          message.error('API Key 无效或无权限');
        } else if (res.status === 402) {
          setToText('余额不足');
          message.error('API Key 余额不足');
        } else if (res.status === 429) {
          setToText('请求过于频繁，请稍后再试');
          message.error('请求过于频繁，请稍后再试');
        } else {
          setToText('服务异常，请稍后重试');
          message.error('服务异常，请稍后重试');
        }
        setLoading(false);
        return;
      }
      if (data.choices && data.choices[0].message.content) {
        setToText(data.choices[0].message.content.trim());
        addHistory({
          from: fromLang === 'auto' ? detected : fromLang,
          to: realTarget,
          fromText: input,
          toText: data.choices[0].message.content.trim(),
        });
      } else {
        setToText('翻译失败');
      }
    } catch {
      setToText('请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromText) {
      handleTranslate();
    }
    // eslint-disable-next-line
  }, [resultLangMode, toLang, myLang]);

  // 复制译文
  const handleCopy = () => {
    if (!toText) return;
    navigator.clipboard.writeText(toText);
    message.success('已复制译文');
  };

  // 结果语种 label
  let resultLangLabel = '';
  if (resultLangMode === 'auto') {
    const detected = detectLang(fromText);
    if (detected === myLang) {
      resultLangLabel = LANGS.find((l: { value: string; label: string }) => l.value === toLang)?.label || toLang;
    } else if (detected === toLang) {
      resultLangLabel = LANGS.find((l: { value: string; label: string }) => l.value === myLang)?.label || myLang;
    } else {
      resultLangLabel = LANGS.find((l: { value: string; label: string }) => l.value === toLang)?.label || toLang;
    }
  } else {
    resultLangLabel = LANGS.find((l: { value: string; label: string }) => l.value === resultLangMode)?.label || resultLangMode;
  }

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: '#fff', fontSize: 'var(--app-font-size)', fontWeight: 500, marginBottom: 4, display: 'block' }}>
          系统提示词（可自定义翻译风格）
        </label>
        <TextArea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder="你是一个高质量的多语种翻译助手。"
          style={{ fontSize: 'var(--app-font-size)' }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={loading}
        />
      </div>
      {/* 移除 ModelSelect 组件 */}
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Select
              value={fromLang}
              options={[{ label: '自动检测', value: 'auto' }, ...LANGS.filter((l: { value: string; label: string }) => l.value !== 'auto')]}
              style={{ width: 120, fontSize: 'var(--app-font-size)' }}
              onChange={v => setFromLang(v as 'auto' | 'zh' | 'en')}
              styles={{ popup: { root: { fontSize: 'var(--app-font-size)', zIndex: 9999 } } }}
              getPopupContainer={() => document.body}
            />
          </div>
          <TextArea
            ref={inputRef}
            value={fromText}
            onChange={e => setFromText(e.target.value)}
            onPaste={handlePaste}
            placeholder="请输入需要翻译的文本"
            style={{ resize: 'none', fontSize: 'var(--app-font-size)', maxHeight, overflow: 'auto' }}
            autoSize={{ minRows: 3 }}
            disabled={loading}
          />
          <Button
            type="primary"
            onClick={() => handleTranslate()}
            loading={loading}
            disabled={loading}
            style={{ fontSize: 'var(--app-font-size)', marginTop: 12 }}
          >
            翻译
          </Button>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Select
              value={resultLangMode}
              options={[{ label: '自动检测', value: 'auto' }, ...LANGS.filter((l: { value: string; label: string }) => l.value !== myLang)]}
              style={{ width: 120, fontSize: 'var(--app-font-size)' }}
              onChange={setResultLangMode}
              styles={{ popup: { root: { fontSize: 'var(--app-font-size)', zIndex: 9999 } } }}
              getPopupContainer={() => document.body}
            />
            <span style={{ color: '#888', fontSize: 'var(--app-font-size)' }}>
              当前被翻译语种为 {resultLangLabel}
            </span>
          </div>
          <TextArea
            value={toText}
            placeholder="翻译结果"
            style={{ resize: 'none', fontSize: 'var(--app-font-size)', background: '#222', color: '#fff', maxHeight, overflow: 'auto' }}
            autoSize={{ minRows: 3 }}
            disabled={loading}
            readOnly
          />
          <Button
            style={{ marginTop: 12, fontSize: 'var(--app-font-size)' }}
            onClick={handleCopy}
            disabled={!toText || loading}
          >
            复制译文
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TranslateBox;