import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import type { Locale } from '../types/task'
import { translate, type TranslationKey } from '../i18n'

interface HeroSectionProps {
  percentage: number
  total: number
  locale: Locale
}

export function HeroSection({ percentage, total, locale }: HeroSectionProps) {
  const reducedMotion = useReducedMotion()
  const t = (key: TranslationKey) => translate(locale, key)

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-index"><span>01</span> / {t('heroIndex')}</div>
      <div className="hero-main">
        <h1 id="hero-title">{t('headlineOne')}<br />{t('headlineTwo')} <em>{t('headlineEmphasis')}</em></h1>
        <div className="hero-aside">
          <p>{t('heroAside').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</p>
          <a href="#task-composer" className="scroll-cue">
            {t('startWithOne')} <ArrowDown size={14} />
          </a>
        </div>
      </div>
      <div className="hero-foot">
        <span className="hero-description">{t('quietWay')}</span>
        <div className="hero-progress">
          <span className="micro-label">{t('dayInFocus')}</span>
          <div
            className="hero-progress-track"
            role="progressbar"
            aria-label={t('complete')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <motion.span
              className="hero-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
            />
          </div>
          <motion.strong key={percentage} initial={reducedMotion ? false : { opacity: 0.3 }} animate={{ opacity: 1 }}>
            {percentage}<small>%</small>
          </motion.strong>
          <span className="hero-total">{total.toString().padStart(2, '0')} {t('items')}</span>
        </div>
      </div>
    </section>
  )
}
