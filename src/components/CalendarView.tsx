import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import type { Locale, Task } from '../types/task'
import { translate } from '../i18n'

interface CalendarViewProps {
  tasks: Task[]
  locale: Locale
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
}

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarView({ tasks, locale, onToggle, onEdit }: CalendarViewProps) {
  const todayKey = dateKey(new Date())
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const reducedMotion = useReducedMotion()
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)
  const localeName = locale === 'ru' ? 'ru-RU' : 'en-US'
  const monthLabel = new Intl.DateTimeFormat(localeName, { month: 'long', year: 'numeric' }).format(month)
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const mondayOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days = [...Array(mondayOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, index + 1)
    return new Intl.DateTimeFormat(localeName, { weekday: 'short' }).format(date).replace('.', '')
  })
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>()
    tasks.filter((task) => task.dueDate).forEach((task) => {
      grouped.set(task.dueDate, [...(grouped.get(task.dueDate) ?? []), task])
    })
    return grouped
  }, [tasks])
  const selectedTasks = tasksByDate.get(selectedDate) ?? []

  function changeMonth(amount: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + amount, 1)
    setMonth(next)
    setSelectedDate(dateKey(next))
  }

  return (
    <section className="calendar-view" aria-label={t('calendar')}>
      <div className="calendar-header">
        <div>
          <span className="section-index">04 / {t('calendar')}</span>
          <h2>{monthLabel}</h2>
        </div>
        <div className="calendar-navigation">
          <button type="button" className="calendar-today" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelectedDate(todayKey) }}>{t('today')}</button>
          <button type="button" aria-label={t('previousMonth')} onClick={() => changeMonth(-1)}><ChevronLeft size={17} /></button>
          <button type="button" aria-label={t('nextMonth')} onClick={() => changeMonth(1)}><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="calendar-layout">
        <div className="calendar-grid" role="grid" aria-label={monthLabel}>
          {weekDays.map((day, index) => <span className="calendar-weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>)}
          {days.map((day, index) => {
            if (day === null) return <span className="calendar-day empty-day" key={`empty-${index}`} aria-hidden="true" />
            const date = new Date(month.getFullYear(), month.getMonth(), day)
            const key = dateKey(date)
            const dueCount = (tasksByDate.get(key) ?? []).length
            return (
              <button
                type="button"
                role="gridcell"
                key={key}
                className={`calendar-day${key === selectedDate ? ' selected-day' : ''}${key === todayKey ? ' today-day' : ''}${dueCount ? ' has-tasks' : ''}`}
                aria-label={`${date.toLocaleDateString(localeName)}${dueCount ? `, ${dueCount}` : ''}`}
                aria-pressed={key === selectedDate}
                onClick={() => setSelectedDate(key)}
              >
                <span>{day}</span>
                {dueCount > 0 && <i>{dueCount}</i>}
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="calendar-day-detail"
            key={selectedDate}
            initial={reducedMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            <span className="micro-label">{new Intl.DateTimeFormat(localeName, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${selectedDate}T00:00:00`))}</span>
            {selectedTasks.length ? (
              <ul>
                {selectedTasks.map((task) => (
                  <li key={task.id} className={task.completed ? 'is-complete' : ''}>
                    <button className="calendar-task-check" type="button" onClick={() => onToggle(task.id)} aria-label={`${t(task.completed ? 'active' : 'complete')}: ${task.title}`} aria-pressed={task.completed}>
                      {task.completed ? '✓' : ''}
                    </button>
                    <span>{task.title}</span>
                    <b className={`priority-mark priority-${task.priority}`} aria-label={t(task.priority)} />
                    <button className="edit-task" type="button" onClick={() => onEdit(task)} aria-label={`${t('editTask')}: ${task.title}`}><Pencil size={13} /></button>
                  </li>
                ))}
              </ul>
            ) : <p>{t('noDueTasks')}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
