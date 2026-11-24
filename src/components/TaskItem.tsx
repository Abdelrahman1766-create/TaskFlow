import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, Check, Pencil, X } from 'lucide-react'
import type { Locale, Task } from '../types/task'
import { translate } from '../i18n'

interface TaskItemProps {
  task: Task
  index: number
  locale: Locale
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export function TaskItem({ task, index, locale, onToggle, onDelete, onEdit }: TaskItemProps) {
  const reducedMotion = useReducedMotion()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const createdLabel = new Intl.DateTimeFormat(dateLocale, { hour: '2-digit', minute: '2-digit' }).format(task.createdAt)
  const dueLabel = task.dueDate ? new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short' }).format(new Date(`${task.dueDate}T00:00:00`)) : ''
  const isOverdue = Boolean(task.dueDate && !task.completed && new Date(`${task.dueDate}T00:00:00`).getTime() < new Date().setHours(0, 0, 0, 0))

  return (
    <motion.li
      className={`task-row${task.completed ? ' is-complete' : ''}${isOverdue ? ' is-overdue' : ''}`}
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -18, height: 0, marginTop: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.24, delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.2) }}
    >
      <span className="task-number">{String(index + 1).padStart(2, '0')}</span>
      <motion.button
        className="task-check"
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? `${translate(locale, 'active')}: ${task.title}` : `${translate(locale, 'complete')}: ${task.title}`}
        aria-pressed={task.completed}
        whileTap={reducedMotion ? undefined : { scale: 0.88 }}
      >
        <motion.span
          className="task-check-inner"
          style={{ backgroundColor: task.completed ? 'var(--accent)' : 'transparent' }}
          animate={{ scale: task.completed ? [0.82, 1.08, 1] : [1, 0.92, 1] }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {task.completed && <Check size={13} strokeWidth={2.2} />}
        </motion.span>
      </motion.button>
      <div className="task-copy">
        <div className="task-title-line">
          <span className="task-text">{task.title}</span>
          <span className={`priority-mark priority-${task.priority}`} title={`${translate(locale, 'priority')}: ${translate(locale, task.priority)}`} aria-label={`${translate(locale, 'priority')}: ${translate(locale, task.priority)}`} />
        </div>
        {task.description && <span className="task-description">{task.description}</span>}
        <span className="task-meta">
          <span>{translate(locale, 'loggedAt', { date: createdLabel })}</span>
          {task.category && <span className="category-chip">{task.category}</span>}
          {dueLabel && (
            <span className={`due-chip${isOverdue ? ' overdue-chip' : ''}`}>
              <CalendarClock size={11} /> {isOverdue ? translate(locale, 'overdueLabel') : translate(locale, 'due', { date: dueLabel })}
            </span>
          )}
        </span>
      </div>
      <div className="task-actions">
        <button className="edit-task" type="button" onClick={() => onEdit(task)} aria-label={`${translate(locale, 'editTask')}: ${task.title}`}>
          <Pencil size={14} />
        </button>
        <button className="delete-task" type="button" onClick={() => onDelete(task.id)} aria-label={`${translate(locale, 'deleteTask')}: ${task.title}`}>
          <X size={17} strokeWidth={1.5} />
        </button>
      </div>
    </motion.li>
  )
}
