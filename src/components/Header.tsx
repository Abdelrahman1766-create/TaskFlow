import { ArrowUpRight, Moon, Sun } from 'lucide-react'
import type { Locale, Theme } from '../types/task'
import { translate, type TranslationKey } from '../i18n'

interface HeaderProps {
  locale: Locale
  theme: Theme
  onLocaleChange: (locale: Locale) => void
  onThemeToggle: () => void
}

export function Header({ locale, theme, onLocaleChange, onThemeToggle }: HeaderProps) {
  const date = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
  const t = (key: TranslationKey) => translate(locale, key)

  return (
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="TASKFLOW">
        TASK<span>FLOW</span><i aria-hidden="true">®</i>
      </a>
      <div className="topbar-meta">
        <span className="system-live"><span className="live-dot" /> {t('live')}</span>
        <span className="topbar-date">{date}</span>
      </div>
      <div className="header-tools">
        <label className="language-control">
          <span className="sr-only">{t('language')}</span>
          <select value={locale} onChange={(event) => onLocaleChange(event.target.value as Locale)} aria-label={t('language')}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
        <button
          className="theme-toggle"
          type="button"
          onClick={onThemeToggle}
          aria-label={t(theme === 'light' ? 'themeDark' : 'themeLight')}
          title={t(theme === 'light' ? 'themeDark' : 'themeLight')}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={1.8} /> : <Sun size={20} strokeWidth={1.8} />}
        </button>
        <span className="topbar-note">
          {t('personalWorkspace')} <ArrowUpRight size={13} strokeWidth={1.7} />
        </span>
      </div>
    </header>
  )
}
