import ar from './ar.json';
import en from './en.json';

export const translations = {
  ar,
  en,
};

export type Language = 'ar' | 'en';
export type TranslationKey = keyof typeof ar;

export function translate(lang: Language, key: string): string {
  const keys = key.split('.');
  let result: any = translations[lang];
  
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      return key;
    }
  }
  
  return typeof result === 'string' ? result : key;
}
