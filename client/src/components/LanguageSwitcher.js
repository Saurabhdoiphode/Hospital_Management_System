import React from 'react';
import { useI18n } from '../context/I18nContext';

const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e)=>setLang(e.target.value)}
      style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
};

export default LanguageSwitcher;
