import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw, Trash2 } from 'lucide-react'
import type { Locale, WeeklyPoint } from '../types/task'
import { translate } from '../i18n'

interface ProductivityPanelProps {
  locale: Locale
  total: number
  remaining: number
  completed: number
  overdue: number
  percentage: number
  weekly: WeeklyPoint[]
  onRequestClear: () => void
}

export function ProductivityPanel({
  locale,
  total,
  remaining,
  completed,
  overdue,
  percentage,
  weekly,
  onRequestClear,
}: ProductivityPanelProps) {
  const reducedMotion = useReducedMotion()
  const circumference = 2 * Math.PI * 37
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => translate(locale, key, values)
  const maxCount = Math.max(1, ...weekly.map((point) => point.count))
  const formatDay = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })

  return (
    <aside className="productivity-panel" aria-label={t('momentum')}>
      <div className="panel-kicker"><span>02</span> / {t('momentum')}</div>
      <div className="completion-visual">
        <svg viewBox="0 0 100 100" role="img" aria-label={`${percentage}% ${t('complete').toLowerCase()}`}>
          <circle className="progress-ring-bg" cx="50" cy="50" r="37" />
          <motion.circle
            className="progress-ring-value"
            cx="50"
            cy="50"
            r="37"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="ring-value">
          <motion.strong key={percentage} initial={reducedMotion ? false : { opacity: 0.3 }} animate={{ opacity: 1 }}>
            {percentage}<small>%</small>
          </motion.strong>
          <span>{t('complete')}</span>
        </div>
      </div>
      <div className="panel-stats">
        <div className="stat-line"><span>{t('inMotion')}</span><strong>{String(remaining).padStart(2, '0')}</strong></div>
        <div className="stat-line"><span>{t('finished')}</span><strong>{String(completed).padStart(2, '0')}</strong></div>
        <div className="stat-line overdue-stat"><span>{t('overdue')}</span><strong>{String(overdue).padStart(2, '0')}</strong></div>
        <div className="stat-line"><span>{t('onTheList')}</span><strong>{String(total).padStart(2, '0')}</strong></div>
      </div>
      <div className="weekly-panel">
        <div className="weekly-heading"><span>{t('weekly')}</span><span>{t('weeklyDone')}</span></div>
        <div className="weekly-bars" role="img" aria-label={`${t('weekly')}: ${weekly.reduce((sum, item) => sum + item.count, 0)} ${t('weeklyDone').toLowerCase()}`}>
          {weekly.map((point) => (
            <div className="weekly-day" key={point.date.toISOString()} title={`${formatDay.format(point.date)}: ${point.count}`}>
              <span className="weekly-value">{point.count || ''}</span>
              <div className="weekly-track">
                <motion.i
                  initial={{ height: 0 }}
                  animate={{ height: `${point.count === 0 ? 2 : Math.max(12, (point.count / maxCount) * 100)}%` }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : 0.04 }}
                />
              </div>
              <span className="weekly-label">{formatDay.format(point.date).replace('.', '')}</span>
            </div>
          ))}
        </div>
        {weekly.every((point) => point.count === 0) && <p className="weekly-empty">{t('noWeeklyActivity')}</p>}
      </div>
      <div className="panel-note">
        <RotateCcw size={14} strokeWidth={1.5} />
        <p>{t('progressPractice').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</p>
      </div>
      <button type="button" className="clear-completed" onClick={onRequestClear} disabled={completed === 0}>
        <Trash2 size={13} /> {t('clearFinished')} <span>{String(completed).padStart(2, '0')}</span>
      </button>
    </aside>
  )
}
