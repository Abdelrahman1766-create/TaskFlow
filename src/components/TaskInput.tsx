import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import type { Locale, NewTask, Task, TaskPriority } from '../types/task'
import { translate } from '../i18n'

interface TaskInputProps {
  onAdd: (task: NewTask) => boolean
  inputRef: React.RefObject<HTMLInputElement>
  locale: Locale
}

interface TaskFormProps {
  initial?: Task
  locale: Locale
  submitLabel?: string
  onSubmit: (task: NewTask) => boolean
  inputRef?: React.RefObject<HTMLInputElement>
  onCancel?: () => void
}

export function TaskForm({ initial, locale, submitLabel, onSubmit, inputRef, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [detailsOpen, setDetailsOpen] = useState(Boolean(initial))
  const [validationError, setValidationError] = useState(false)
  const reducedMotion = useReducedMotion()
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setValidationError(true)
      return
    }
    const saved = onSubmit({ title, description, priority, category, dueDate })
    if (saved) {
      setValidationError(false)
      if (!initial) {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setCategory('')
        setDueDate('')
        setDetailsOpen(false)
      }
    }
  }

  return (
    <form className={`composer task-form${initial ? ' editor-form' : ''}`} onSubmit={handleSubmit}>
      {!initial && <span className="composer-marker" aria-hidden="true">+</span>}
      <label className="sr-only" htmlFor={initial ? 'edit-task-title' : 'new-task'}>{t('taskPlaceholder')}</label>
      <input
        ref={inputRef}
        id={initial ? 'edit-task-title' : 'new-task'}
        value={title}
        onChange={(event) => { setTitle(event.target.value); setValidationError(false) }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !initial) {
            setTitle('')
            setValidationError(false)
          }
        }}
        placeholder={t('taskPlaceholder')}
        autoComplete="off"
        maxLength={240}
        autoFocus={Boolean(initial)}
        aria-invalid={validationError}
        aria-describedby={validationError ? 'task-validation' : undefined}
      />
      {!initial && <span className="input-hint"><kbd>↵</kbd> {t('toAdd')}</span>}
      {initial && (
        <button className="form-cancel" type="button" onClick={onCancel}>{t('cancel')}</button>
      )}
      <motion.button
        className="add-button"
        type="submit"
        aria-label={submitLabel ?? t('add')}
        aria-disabled={!title.trim()}
        whileHover={reducedMotion ? undefined : { scale: 1.04 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      >
        {initial ? <Check size={18} /> : <ArrowUpRight size={20} strokeWidth={1.8} />}
      </motion.button>
      <div className="task-form-extras">
        <button type="button" className="details-toggle" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>
          {t('details')} <span>{detailsOpen ? '−' : '+'}</span>
        </button>
        <AnimatePresence initial={false}>
          {detailsOpen && (
            <motion.div
              className="task-fields"
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <label className="task-field description-field">
                <span>{t('description')}</span>
                <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t('descriptionPlaceholder')} maxLength={500} />
              </label>
              <label className="task-field">
                <span>{t('priority')}</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                  <option value="high">{t('high')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="low">{t('low')}</option>
                </select>
              </label>
              <label className="task-field">
                <span>{t('category')}</span>
                <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder={t('categoryPlaceholder')} maxLength={40} />
              </label>
              <label className="task-field">
                <span>{t('dueDate')}</span>
                <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        {validationError && <span className="validation-message" id="task-validation" role="alert">{t('titleRequired')}</span>}
      </div>
    </form>
  )
}

export function TaskInput({ onAdd, inputRef, locale }: TaskInputProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const feedbackTimer = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => () => {
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current)
  }, [])

  function handleAdd(data: NewTask): boolean {
    const added = onAdd(data)
    if (added) {
      setShowFeedback(true)
      if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current)
      feedbackTimer.current = window.setTimeout(() => setShowFeedback(false), 1800)
    }
    return added
  }

  return (
    <div className="composer-wrap" id="task-composer">
      <TaskForm onSubmit={handleAdd} inputRef={inputRef} locale={locale} />
      <div className="composer-bottom">
        <span>{translate(locale, 'makeConcrete')}</span>
        <AnimatePresence mode="wait">
          {showFeedback && (
            <motion.span
              className="add-feedback"
              initial={reducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
            >
              <Check size={12} /> {translate(locale, 'added')}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
