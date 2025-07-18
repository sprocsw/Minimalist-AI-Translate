import { create } from 'zustand';

interface HistoryItem {
  id: string;
  from: string;
  to: string;
  fromText: string;
  toText: string;
  time: number;
  model?: string; // 添加可选的 model 字段
}

interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  time: number;
}

interface ApiStatus {
  openai: boolean;
  google: boolean;
  deepseek: boolean;
  ali: boolean;
}

interface StoreState {
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  myLang: string;
  setMyLang: (lang: string) => void;
  toLang: string;
  setToLang: (lang: string) => void;
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'time'>) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  showHistory: boolean;
  toggleShowHistory: () => void;
  resultLangMode: string; // 'auto' 或具体语种
  setResultLangMode: (mode: string) => void;
  googleApiKey: string;
  setGoogleApiKey: (key: string) => void;
  deepseekApiKey: string;
  setDeepseekApiKey: (key: string) => void;
  aliApiKey: string;
  setAliApiKey: (key: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  savedPrompts: SavedPrompt[];
  addSavedPrompt: (name: string, content: string) => void;
  removeSavedPrompt: (id: string) => void;
  apiStatus: ApiStatus;
  setApiStatus: (key: keyof ApiStatus, value: boolean) => void;
}


const API_KEY_STORAGE = 'openai_api_key';
const MODEL_STORAGE = 'openai_model';
const HISTORY_STORAGE = 'translate_history';
const MYLANG_STORAGE = 'my_lang';
const TOLANG_STORAGE = 'to_lang';
const RESULT_LANG_MODE_STORAGE = 'result_lang_mode';
const GOOGLE_API_KEY_STORAGE = 'google_api_key';
const DEEPSEEK_API_KEY_STORAGE = 'deepseek_api_key';
const ALI_API_KEY_STORAGE = 'ali_api_key';
const FONT_SIZE_STORAGE = 'font_size';
const SAVED_PROMPTS_STORAGE = 'saved_prompts';
const API_STATUS_STORAGE = 'api_status';
const SHOW_HISTORY_STORAGE = 'show_history';

function loadApiKey() {
  const raw = localStorage.getItem(API_KEY_STORAGE) || '';
  try {
    return raw ? atob(raw) : '';
  } catch {
    return '';
  }
}
function saveApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, btoa(key));
}
function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]');
  } catch {
    return [];
  }
}
function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history));
}

function loadMyLang() {
  return localStorage.getItem(MYLANG_STORAGE) || 'zh';
}
function saveMyLang(lang: string) {
  localStorage.setItem(MYLANG_STORAGE, lang);
}

function loadToLang() {
  return localStorage.getItem(TOLANG_STORAGE) || 'en';
}
function saveToLang(lang: string) {
  localStorage.setItem(TOLANG_STORAGE, lang);
}

function loadResultLangMode() {
  return localStorage.getItem(RESULT_LANG_MODE_STORAGE) || 'auto';
}
function saveResultLangMode(mode: string) {
  localStorage.setItem(RESULT_LANG_MODE_STORAGE, mode);
}

function loadGoogleApiKey() {
  const raw = localStorage.getItem(GOOGLE_API_KEY_STORAGE) || '';
  try {
    return raw ? atob(raw) : '';
  } catch {
    return '';
  }
}
function saveGoogleApiKey(key: string) {
  localStorage.setItem(GOOGLE_API_KEY_STORAGE, btoa(key));
}

function loadDeepseekApiKey() {
  const raw = localStorage.getItem(DEEPSEEK_API_KEY_STORAGE) || '';
  try {
    return raw ? atob(raw) : '';
  } catch {
    return '';
  }
}
function saveDeepseekApiKey(key: string) {
  localStorage.setItem(DEEPSEEK_API_KEY_STORAGE, btoa(key));
}

function loadAliApiKey() {
  const raw = localStorage.getItem(ALI_API_KEY_STORAGE) || '';
  try {
    return raw ? atob(raw) : '';
  } catch {
    return '';
  }
}
function saveAliApiKey(key: string) {
  localStorage.setItem(ALI_API_KEY_STORAGE, btoa(key));
}

function loadFontSize() {
  const v = localStorage.getItem(FONT_SIZE_STORAGE);
  if (!v) return 18;
  const n = parseInt(v, 10);
  if (isNaN(n)) return 18;
  return Math.min(36, Math.max(14, n));
}
function saveFontSize(size: number) {
  localStorage.setItem(FONT_SIZE_STORAGE, String(size));
}

function loadSavedPrompts(): SavedPrompt[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PROMPTS_STORAGE) || '[]');
  } catch {
    return [];
  }
}

function saveSavedPrompts(prompts: SavedPrompt[]) {
  localStorage.setItem(SAVED_PROMPTS_STORAGE, JSON.stringify(prompts));
}

function loadApiStatus(): ApiStatus {
  try {
    const saved = localStorage.getItem(API_STATUS_STORAGE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  
  // 默认所有 API 都启用
  return {
    openai: true,
    google: true,
    deepseek: true,
    ali: true
  };
}

function saveApiStatus(status: ApiStatus) {
  localStorage.setItem(API_STATUS_STORAGE, JSON.stringify(status));
}

function loadShowHistory(): boolean {
  return localStorage.getItem(SHOW_HISTORY_STORAGE) === 'true';
}

function saveShowHistory(show: boolean) {
  localStorage.setItem(SHOW_HISTORY_STORAGE, show.toString());
}

export const useStore = create<StoreState>((set, get) => ({
  apiKey: loadApiKey(),
  setApiKey: (key: string) => {
    saveApiKey(key);
    set({ apiKey: key });
  },
  model: localStorage.getItem(MODEL_STORAGE) || 'gpt-4o-mini',
  setModel: (model: string) => {
    localStorage.setItem(MODEL_STORAGE, model);
    set({ model });
  },
  myLang: loadMyLang(),
  setMyLang: (lang: string) => {
    saveMyLang(lang);
    set({ myLang: lang });
  },
  toLang: loadToLang(),
  setToLang: (lang: string) => {
    saveToLang(lang);
    set({ toLang: lang });
  },
  history: loadHistory(),
  addHistory: (item) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).slice(2),
      time: Date.now(),
    };
    const newHistory = [newItem, ...get().history].slice(0, 100);
    saveHistory(newHistory);
    set({ history: newHistory });
  },
  removeHistory: (id) => {
    const newHistory = get().history.filter(h => h.id !== id);
    saveHistory(newHistory);
    set({ history: newHistory });
  },
  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
  showHistory: loadShowHistory(),
  toggleShowHistory: () => {
    const newValue = !get().showHistory;
    saveShowHistory(newValue);
    set({ showHistory: newValue });
  },
  resultLangMode: loadResultLangMode(),
  setResultLangMode: (mode: string) => {
    saveResultLangMode(mode);
    set({ resultLangMode: mode });
  },
  googleApiKey: loadGoogleApiKey(),
  setGoogleApiKey: (key: string) => {
    saveGoogleApiKey(key);
    set({ googleApiKey: key });
  },
  deepseekApiKey: loadDeepseekApiKey(),
  setDeepseekApiKey: (key: string) => {
    saveDeepseekApiKey(key);
    set({ deepseekApiKey: key });
  },
  aliApiKey: loadAliApiKey(),
  setAliApiKey: (key: string) => {
    saveAliApiKey(key);
    set({ aliApiKey: key });
  },
  fontSize: loadFontSize(),
  setFontSize: (size: number) => {
    const n = Math.min(36, Math.max(14, size));
    saveFontSize(n);
    set({ fontSize: n });
  },
  savedPrompts: loadSavedPrompts(),
  addSavedPrompt: (name: string, content: string) => {
    const newPrompt: SavedPrompt = {
      id: Math.random().toString(36).slice(2),
      name,
      content,
      time: Date.now(),
    };
    const newPrompts = [newPrompt, ...get().savedPrompts];
    saveSavedPrompts(newPrompts);
    set({ savedPrompts: newPrompts });
  },
  removeSavedPrompt: (id: string) => {
    const newPrompts = get().savedPrompts.filter(p => p.id !== id);
    saveSavedPrompts(newPrompts);
    set({ savedPrompts: newPrompts });
  },
  apiStatus: loadApiStatus(),
  setApiStatus: (key: keyof ApiStatus, value: boolean) => {
    const newStatus = { ...get().apiStatus, [key]: value };
    saveApiStatus(newStatus);
    set({ apiStatus: newStatus });
  },
}));
