import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Locale } from '../types/task'
import { translate } from '../i18n'

interface ConfirmDialogProps {
  open: boolean
  locale: Locale
  count: number
  onCancel: () => void
  onConfirm: () => void
  onExitComplete: () => void
}

export function ConfirmDialog({ open, locale, count, onCancel, onConfirm, onExitComplete }: ConfirmDialogProps) {
  const reducedMotion = useReducedMotion()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const message = locale === 'ru'
    ? translate(locale, 'clearConfirm', { count })
    : translate(locale, 'clearConfirm', { count, tasks: count === 1 ? 'task' : 'tasks' })

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
  }, [open])

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          className="dialog-scrim"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}
        >
          <motion.section
            className="task-dialog confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])')
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
            <span className="section-index">TASKFLOW / {translate(locale, 'clearFinished')}</span>
            <h2 id="confirm-dialog-title">{translate(locale, 'clearTitle')}</h2>
            <p id="confirm-dialog-message">{message}</p>
            <div className="confirmation-actions">
              <button ref={cancelRef} type="button" className="confirm-cancel" onClick={onCancel}>{translate(locale, 'cancel')}</button>
              <button type="button" className="confirm-action" onClick={onConfirm}>{translate(locale, 'confirmAction')}</button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
