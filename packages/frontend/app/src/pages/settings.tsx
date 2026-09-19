import { Link } from 'react-router-dom';
import { t, useLanguage } from '@/lib/i18n';

export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  return (
    <select
      aria-label={t('Language')}
      value={language}
      onChange={event => setLanguage(event.target.value as 'ar' | 'en')}
      className="language-select"
    >
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}

export function SettingsPage() {
  return (
    <main className="settings-page">
      <div className="settings-card">
        <Link to="/chats">← {t('Back to chats')}</Link>
        <h1>{t('Settings')}</h1>
        <p>{t('Your workspace, your language.')}</p>
        <section>
          <h2>{t('Language')}</h2>
          <p>
            {t(
              'Choose your interface language. Changes are saved on this browser.'
            )}
          </p>
          <LanguageSelect />
        </section>
      </div>
    </main>
  );
}
