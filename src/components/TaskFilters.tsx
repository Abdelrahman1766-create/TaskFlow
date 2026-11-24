import { motion, useReducedMotion } from 'framer-motion'
import type { Locale, TaskFilter } from '../types/task'
import { translate, type TranslationKey } from '../i18n'

interface TaskFiltersProps {
  selected: TaskFilter
  counts: Record<TaskFilter, number>
  onChange: (filter: TaskFilter) => void
  locale: Locale
}

const filters: { id: TaskFilter; key: TranslationKey }[] = [
  { id: 'all', key: 'all' },
  { id: 'active', key: 'active' },
  { id: 'completed', key: 'completed' },
]

export function TaskFilters({ selected, counts, onChange, locale }: TaskFiltersProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="filter-bar" role="group" aria-label={translate(locale, 'allTasks')}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`filter-button${selected === filter.id ? ' is-selected' : ''}`}
          type="button"
          aria-pressed={selected === filter.id}
          onClick={() => onChange(filter.id)}
        >
          {translate(locale, filter.key)}
          <span className="filter-count">{counts[filter.id].toString().padStart(2, '0')}</span>
          {selected === filter.id && (
            <motion.i
              className="filter-indicator"
              layoutId="filter-indicator"
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
