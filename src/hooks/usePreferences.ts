import { useEffect, useState } from 'react'
import type { Locale, Theme } from '../types/task'
import { readPreference, writePreference } from '../utils/storage'

function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem('taskflow.theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function usePreferences() {
  const [locale, setLocale] = useState<Locale>(() => readPreference('taskflow.locale', ['en', 'ru'] as const, 'en'))
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [preferenceError, setPreferenceError] = useState(false)

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = locale === 'ru'
      ? 'TASKFLOW — Освободите место для важного'
      : 'TASKFLOW — Make space for what matters'
  }, [locale])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#24231f' : '#f4f1e9')
  }, [theme])

  function changeLocale(next: Locale) {
    setLocale(next)
    if (!writePreference('taskflow.locale', next)) setPreferenceError(true)
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (!writePreference('taskflow.theme', next)) setPreferenceError(true)
  }

  return { locale, setLocale: changeLocale, theme, toggleTheme, preferenceError }
}
