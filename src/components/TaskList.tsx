import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { Locale, Task } from '../types/task'
import { translate, type TranslationKey } from '../i18n'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  totalTasks: number
  filterLabel: TranslationKey
  locale: Locale
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onAddFirst: () => void
  hasSearch: boolean
}

export function TaskList({ tasks, totalTasks, filterLabel, locale, onToggle, onDelete, onEdit, onAddFirst, hasSearch }: TaskListProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="list-shell">
      <div className="list-heading">
        <span>{translate(locale, filterLabel)}</span>
        <span className="list-heading-rule" />
        <span>{String(tasks.length).padStart(2, '0')} {translate(locale, 'shown')}</span>
      </div>
      {tasks.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={false}
          key={filterLabel}
        >
          <div className="empty-mark" aria-hidden="true"><Sparkles size={24} strokeWidth={1.2} /></div>
          {totalTasks === 0 && !hasSearch ? (
            <>
              <span className="micro-label">{translate(locale, 'cleanSlate')}</span>
              <h2>{translate(locale, 'roomToBegin')}</h2>
              <p>{translate(locale, 'cleanSlateText').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</p>
              <button className="text-link" type="button" onClick={onAddFirst}>
                {translate(locale, 'firstTask')} <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="micro-label">{translate(locale, 'nothingToShow')}</span>
              <h2>{translate(locale, hasSearch ? 'noSearchTitle' : 'allClear')}</h2>
              <p>{translate(locale, hasSearch ? 'noSearchResults' : 'noFilteredTasks')}</p>
            </>
          )}
        </motion.div>
      ) : (
        <motion.ul className="task-list" layout={!reducedMotion}>
          <AnimatePresence mode="sync" initial={false}>
            {tasks.map((task, index) => (
              <TaskItem key={task.id} task={task} index={index} locale={locale} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
