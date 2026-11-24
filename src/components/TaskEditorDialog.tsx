import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Locale, NewTask, Task } from '../types/task'
import { translate } from '../i18n'
import { TaskForm } from './TaskInput'

interface TaskEditorDialogProps {
  task: Task | null
  locale: Locale
  onClose: () => void
  onSave: (id: string, data: NewTask) => boolean
  onExitComplete: () => void
}

export function TaskEditorDialog({ task, locale, onClose, onSave, onExitComplete }: TaskEditorDialogProps) {
  const reducedMotion = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!task) return
    closeRef.current?.focus()
  }, [task])

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {task && (
        <motion.div
          className="dialog-scrim"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
        >
          <motion.section
            className="task-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
              const first = focusable[0]
              const last = focusable[focusable.length - 1]
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
              }
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="dialog-heading">
              <div>
                <span className="section-index">TASKFLOW / {translate(locale, 'openDialog')}</span>
                <h2 id="edit-dialog-title">{translate(locale, 'editTask')}</h2>
              </div>
              <button ref={closeRef} type="button" className="dialog-close" onClick={onClose} aria-label={translate(locale, 'cancel')}><X size={18} /></button>
            </div>
            <TaskForm
              key={task.id}
              initial={task}
              locale={locale}
              submitLabel={translate(locale, 'update')}
              onSubmit={(data) => onSave(task.id, data)}
              onCancel={onClose}
            />
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
