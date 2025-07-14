import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Select, message as antdMessage, Dropdown, Menu, Space, Switch, Modal, Form } from 'antd';
import { useStore } from '../store/useStore';
import { LANGS } from './LanguageSelect';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { DownOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

// 提示词模板数据
const PROMPT_TEMPLATES = {
  professional: [
    {
      label: '法律文书',
      value: '你是一位资深法律翻译专家。请将文本翻译成准确、规范的法律语言，保持原文的法律效力。使用对应语言的法律术语和表达方式，确保翻译结果符合法律文书的严谨性和专业性。对于法律特有概念，请保留原文术语并在括号中注明翻译。'
    },
    {
      label: '医学文献',
      value: '你是一位专业医学翻译。请将文本翻译成准确的医学语言，使用标准医学术语和表达。保持医学文献的严谨性，确保解剖学名词、疾病名称、药物名称等专业术语的准确翻译。对于医学缩写，请保留原文并在首次出现时提供全称翻译。'
    },
    {
      label: '技术文档',
      value: '你是一位技术文档翻译专家。请将文本翻译成清晰、准确的技术语言，保持原文的技术精确性。使用行业标准术语，保持一致性，确保代码、参数和技术规格的准确性。翻译应当易于理解但不失专业性，适合技术人员阅读。'
    },
    {
      label: '学术论文',
      value: '你是一位学术翻译专家。请将文本翻译成符合学术规范的语言，保持原文的学术严谨性。使用该学科领域的专业术语，保持引用和参考文献的格式，确保逻辑结构清晰。翻译应当准确传达原文的学术观点和研究方法。'
    },
    {
      label: '金融报告',
      value: '你是一位金融翻译专家。请将文本翻译成专业的金融语言，使用准确的金融术语和表达方式。保持数据的准确性，正确处理货币符号、百分比和财务指标。确保翻译结果符合金融报告的专业性和精确性，适合金融专业人士阅读。'
    }
  ],
  style: [
    {
      label: '商务正式',
      value: '你是一位商务文件翻译专家。请将文本翻译成正式、专业的商务语言，使用恰当的敬语和商业术语。保持语言的简洁明了，避免口语化表达。翻译应当符合商务沟通的礼仪和规范，适合正式商务场合使用。'
    },
    {
      label: '日常口语',
      value: '你是一位擅长口语翻译的专家。请将文本翻译成自然、地道的日常口语，就像本地人日常交流那样。可以使用常见习语、俚语和口头禅，让翻译更加生动自然。避免过于书面或正式的表达，使翻译结果听起来更亲切随意。'
    },
    {
      label: '文学艺术',
      value: '你是一位富有文学素养的翻译家。请在翻译时注重语言的优美和流畅，保留原文的文学性、韵律和艺术性。可以适当调整句式结构，但要保持原文的意境、情感和修辞特点。翻译应当具有文学价值，让读者能感受到原文的艺术魅力。'
    },
    {
      label: '营销推广',
      value: '你是一位创意营销翻译专家。请将文本翻译成富有吸引力和说服力的营销语言，保持原文的促销意图。使用生动、积极的词汇，强调产品/服务的价值和优势。翻译应当具有感染力，能够引起目标受众的兴趣和行动欲望。'
    },
    {
      label: '简明扼要',
      value: '你是一位擅长简化内容的翻译专家。请将原文翻译成简洁、清晰的语言，去除冗余内容，突出核心信息。可以适当压缩长句，但不丢失关键信息。翻译结果应当简明扼要，便于快速阅读和理解，适合繁忙人士浏览。'
    }
  ],
  audience: [
    {
      label: '儿童友好',
      value: '你是一位儿童内容翻译专家。请将文本翻译成简单、生动、易懂的语言，适合儿童阅读。使用具体而非抽象的词汇，避免复杂句式和专业术语。可以适当增加趣味性和互动性，确保翻译结果符合儿童的认知水平和阅读兴趣。'
    },
    {
      label: '教育教学',
      value: '你是一位教育内容翻译专家。请将文本翻译成清晰、系统的教学语言，便于学习和理解。保持逻辑结构清晰，强调关键概念和学习点。可以适当增加解释性内容，确保翻译结果具有教育价值，适合学习者使用。'
    },
    {
      label: '老年友好',
      value: '你是一位关注老年人需求的翻译专家。请将文本翻译成清晰、直接、易于理解的语言，适合老年人阅读。避免使用新兴网络词汇和复杂术语，保持表达的传统性和礼貌性。可以适当增加解释，确保翻译结果尊重老年读者的阅读习惯和生活经验。'
    }
  ],
  special: [
    {
      label: '本地化适配',
      value: '你是一位文化本地化翻译专家。请将文本翻译成符合目标语言文化背景的内容，不仅翻译语言，还要适应当地文化习惯、价值观和表达方式。对于文化特定的概念、习语和参考，请使用目标文化中的等效表达或提供适当解释。'
    },
    {
      label: '字幕翻译',
      value: '你是一位专业字幕翻译。请将文本翻译成简洁、准确的字幕，每行不超过42个字符，适合快速阅读。保留原文的核心信息和情感，可以适当压缩内容但不改变原意。注意口语化表达和语气词的处理，确保翻译符合视听内容的节奏。'
    },
    {
      label: 'SEO优化',
      value: '你是一位SEO翻译专家。请将文本翻译成既准确又对搜索引擎友好的内容。保留和适当增强原文中的关键词，注意关键词密度和分布。使用目标语言中的相关搜索术语，确保翻译结果既自然流畅又有利于搜索引擎收录和排名。'
    }
  ],
  default: [
    {
      label: '默认',
      value: '你是一个高质量的多语种翻译助手。'
    }
  ]
};

const TranslateBox: React.FC = () => {
  const { 
    apiKey, 
    addHistory, 
    model, 
    myLang, 
    toLang, 
    resultLangMode, 
    setResultLangMode, 
    googleApiKey, 
    deepseekApiKey,
    savedPrompts,
    addSavedPrompt,
    removeSavedPrompt
  } = useStore();
  
  const [fromText, setFromText] = useState('');
  const [fromLang, setFromLang] = useState<'auto' | 'zh' | 'en'>('auto');
  const [toText, setToText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextAreaRef>(null);
  const [message, contextHolder] = antdMessage.useMessage();
  const [maxHeight, setMaxHeight] = useState(window.innerHeight * 0.5);
  const [systemPrompt, setSystemPrompt] = useState('你是一个高质量的多语种翻译助手。');
  const [systemPromptEnabled, setSystemPromptEnabled] = useState(false);
  const [savePromptModalVisible, setSavePromptModalVisible] = useState(false);
  const [promptName, setPromptName] = useState('');

  // 处理选择提示词模板
  const handleSelectTemplate = (value: string) => {
    setSystemPrompt(value);
    message.success('已应用提示词模板');
  };

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
              { role: 'system', content: systemPromptEnabled ? systemPrompt : '你是一个高质量的多语种翻译助手。' },
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
            { role: 'system', content: systemPromptEnabled ? systemPrompt : '你是一个高质量的多语种翻译助手。' },
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

  // 保存提示词
  const handleSavePrompt = () => {
    if (!systemPrompt.trim()) {
      message.warning('提示词内容不能为空');
      return;
    }
    
    if (!promptName.trim()) {
      message.warning('请输入提示词名称');
      return;
    }
    
    addSavedPrompt(promptName.trim(), systemPrompt.trim());
    setSavePromptModalVisible(false);
    setPromptName('');
    message.success('提示词保存成功');
  };

  // 使用已保存的提示词
  const handleUsePrompt = (content: string) => {
    setSystemPrompt(content);
    setSystemPromptEnabled(true);
    message.success('已应用保存的提示词');
  };

  // 删除已保存的提示词
  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个保存的提示词吗？',
      onOk: () => {
        removeSavedPrompt(id);
        message.success('提示词已删除');
      }
    });
  };

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              checked={systemPromptEnabled}
              onChange={setSystemPromptEnabled}
              size="small"
            />
            <label style={{ color: '#fff', fontSize: 'var(--app-font-size)', fontWeight: 500 }}>
              系统提示词
            </label>
            {!systemPromptEnabled && (
              <span style={{ color: '#888', fontSize: 'var(--app-font-size)' }}>
                （已停用）
              </span>
            )}
          </div>
          {systemPromptEnabled && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'default',
                      label: '默认模板',
                      type: 'group',
                      children: PROMPT_TEMPLATES.default.map(item => ({
                        key: `default-${item.label}`,
                        label: item.label,
                        onClick: () => handleSelectTemplate(item.value)
                      }))
                    },
                    {
                      key: 'professional',
                      label: '专业领域',
                      type: 'group',
                      children: PROMPT_TEMPLATES.professional.map(item => ({
                        key: `professional-${item.label}`,
                        label: item.label,
                        onClick: () => handleSelectTemplate(item.value)
                      }))
                    },
                    {
                      key: 'style',
                      label: '风格类型',
                      type: 'group',
                      children: PROMPT_TEMPLATES.style.map(item => ({
                        key: `style-${item.label}`,
                        label: item.label,
                        onClick: () => handleSelectTemplate(item.value)
                      }))
                    },
                    {
                      key: 'audience',
                      label: '受众类型',
                      type: 'group',
                      children: PROMPT_TEMPLATES.audience.map(item => ({
                        key: `audience-${item.label}`,
                        label: item.label,
                        onClick: () => handleSelectTemplate(item.value)
                      }))
                    },
                    {
                      key: 'special',
                      label: '特殊需求',
                      type: 'group',
                      children: PROMPT_TEMPLATES.special.map(item => ({
                        key: `special-${item.label}`,
                        label: item.label,
                        onClick: () => handleSelectTemplate(item.value)
                      }))
                    }
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <Button size="small" style={{ fontSize: 'var(--app-font-size)' }}>
                  选择模板 <DownOutlined />
                </Button>
              </Dropdown>
              
              <Dropdown
                menu={{
                  items: savedPrompts.length > 0 ? [
                    {
                      key: 'my-prompts',
                      label: '我的提示词',
                      type: 'group',
                      children: savedPrompts.map(item => ({
                        key: `saved-${item.id}`,
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>{item.name}</span>
                            <DeleteOutlined 
                              onClick={(e) => handleDeletePrompt(item.id, e)}
                              style={{ color: '#ff4d4f' }}
                            />
                          </div>
                        ),
                        onClick: () => handleUsePrompt(item.content)
                      }))
                    }
                  ] : [
                    {
                      key: 'no-prompts',
                      label: '暂无保存的提示词',
                      disabled: true
                    }
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <Button size="small" style={{ fontSize: 'var(--app-font-size)' }}>
                  我的提示词 <DownOutlined />
                </Button>
              </Dropdown>
              
              <Button 
                size="small" 
                icon={<SaveOutlined />}
                style={{ fontSize: 'var(--app-font-size)' }}
                onClick={() => setSavePromptModalVisible(true)}
                disabled={!systemPrompt.trim()}
              >
                保存
              </Button>
            </div>
          )}
        </div>
        
        {systemPromptEnabled && (
          <TextArea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="你是一个高质量的多语种翻译助手。"
            style={{ fontSize: 'var(--app-font-size)' }}
            autoSize={{ minRows: 1, maxRows: 6 }}
            disabled={loading}
          />
        )}
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

      {/* 保存提示词对话框 */}
      <Modal
        title="保存自定义提示词"
        open={savePromptModalVisible}
        onCancel={() => setSavePromptModalVisible(false)}
        onOk={handleSavePrompt}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="提示词名称" required>
            <Input 
              value={promptName}
              onChange={e => setPromptName(e.target.value)}
              placeholder="请输入一个便于识别的名称"
              maxLength={20}
            />
          </Form.Item>
          <Form.Item label="提示词内容">
            <TextArea 
              value={systemPrompt}
              readOnly
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default TranslateBox;