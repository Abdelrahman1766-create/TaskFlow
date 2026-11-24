import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, List, Search } from 'lucide-react'
import { CalendarView } from './components/CalendarView'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { ProductivityPanel } from './components/ProductivityPanel'
import { TaskEditorDialog } from './components/TaskEditorDialog'
import { TaskFilters } from './components/TaskFilters'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { usePreferences } from './hooks/usePreferences'
import { useTasks } from './hooks/useTasks'
import { translate, type TranslationKey } from './i18n'
import type { Task, TaskFilter, TaskSort } from './types/task'
import './index.css'

function App() {
  const { tasks, stats, storageError, lastDeleted, addTask, editTask, toggleTask, deleteTask, undoDelete, clearCompleted } = useTasks()
  const { locale, setLocale, theme, toggleTheme, preferenceError } = usePreferences()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<TaskSort>('created')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [notice, setNotice] = useState<TranslationKey | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | null>(null)
  const editingTrigger = useRef<HTMLElement | null>(null)
  const clearTrigger = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const t = (key: TranslationKey, values?: Record<string, string | number>) => translate(locale, key, values)

  const categories = useMemo(
    () => [...new Set(tasks.map((task) => task.category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, locale)),
    [tasks, locale],
  )

  const activeCategory = category === 'all' || categories.includes(category) ? category : 'all'

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale)
    const filtered = tasks.filter((task) => {
      const matchesStatus = filter === 'all' || (filter === 'active' ? !task.completed : task.completed)
      const matchesCategory = activeCategory === 'all' || task.category === activeCategory
      const matchesQuery = !normalizedQuery || `${task.title} ${task.description} ${task.category}`.toLocaleLowerCase(locale).includes(normalizedQuery)
      return matchesStatus && matchesCategory && matchesQuery
    })
    const priorityRank = { high: 0, medium: 1, low: 2 }
    return filtered.sort((a, b) => {
      if (sort === 'due') {
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate) || b.createdAt - a.createdAt
      }
      if (sort === 'priority') return priorityRank[a.priority] - priorityRank[b.priority] || b.createdAt - a.createdAt
      return b.createdAt - a.createdAt
    })
  }, [tasks, filter, activeCategory, query, sort, locale])

  function showToast(key: TranslationKey, withUndo = false) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setNotice(key)
    setToastOpen(true)
    if (withUndo) toastTimer.current = window.setTimeout(() => setToastOpen(false), 5000)
    else toastTimer.current = window.setTimeout(() => setToastOpen(false), 2200)
  }

  function handleDelete(id: string) {
    deleteTask(id)
    showToast('taskDeleted', true)
  }

  function handleUndo() {
    undoDelete()
    setToastOpen(false)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }

  function handleSave(id: string, data: Parameters<typeof editTask>[1]) {
    const saved = editTask(id, data)
    if (saved) {
      setEditingTask(null)
      showToast('taskSaved')
    }
    return saved
  }

  function openEditor(task: Task) {
    editingTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setEditingTask(task)
  }

  function restoreEditorFocus() {
    if (editingTrigger.current?.isConnected) editingTrigger.current.focus()
    editingTrigger.current = null
  }

  function openClearDialog() {
    clearTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setClearDialogOpen(true)
  }

  function restoreClearFocus() {
    if (clearTrigger.current instanceof HTMLButtonElement && clearTrigger.current.disabled) inputRef.current?.focus()
    else if (clearTrigger.current?.isConnected) clearTrigger.current.focus()
    clearTrigger.current = null
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable
      if (event.key === 'Escape' && editingTask) {
        setEditingTask(null)
        return
      }
      if (event.key === 'Escape' && clearDialogOpen) {
        setClearDialogOpen(false)
        return
      }
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey && !editingTask && !clearDialogOpen) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [editingTask, clearDialogOpen])

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  return (
    <div className="app-shell" id="top">
      <div className="page-frame">
        <Header locale={locale} theme={theme} onLocaleChange={setLocale} onThemeToggle={toggleTheme} />
        <main>
          <HeroSection percentage={stats.percentage} total={stats.total} locale={locale} />
          <div className="workbench">
            <section className="task-workspace" aria-label={t('workspace')}>
              <div className="workspace-heading">
                <div>
                  <span className="section-index">03 / {t('workspace')}</span>
                  <h2>{t('nextRightThing')}</h2>
                </div>
                <span className="shortcut-hint"><kbd>/</kbd> {t('quickAdd')}</span>
              </div>
              <TaskInput onAdd={addTask} inputRef={inputRef} locale={locale} />
              <div className="task-controls">
                <TaskFilters
                  selected={filter}
                  counts={{ all: stats.total, active: stats.remaining, completed: stats.completed }}
                  onChange={setFilter}
                  locale={locale}
                />
              </div>
              <div className="task-toolbar">
                <div className="view-switch" role="group" aria-label={t('workspace')}>
                  <button className={view === 'list' ? 'is-active' : ''} type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                    <List size={14} /> {t('listView')}
                  </button>
                  <button className={view === 'calendar' ? 'is-active' : ''} type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
                    <CalendarDays size={14} /> {t('calendarView')}
                  </button>
                </div>
                {view === 'list' && (
                  <div className="list-tools">
                    <label className="search-control">
                      <Search size={14} />
                      <span className="sr-only">{t('search')}</span>
                      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')} />
                    </label>
                    <label className="compact-select">
                      <span className="sr-only">{t('categoryFilter')}</span>
                      <select value={activeCategory} onChange={(event) => setCategory(event.target.value)}>
                        <option value="all">{t('allCategories')}</option>
                        {categories.map((item) => <option value={item} key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="compact-select sort-control">
                      <span className="sr-only">{t('sortBy')}</span>
                      <select value={sort} onChange={(event) => setSort(event.target.value as TaskSort)}>
                        <option value="created">{t('sortCreated')}</option>
                        <option value="due">{t('sortDue')}</option>
                        <option value="priority">{t('sortPriority')}</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
              {view === 'list' ? (
                <TaskList
                  tasks={visibleTasks}
                  totalTasks={stats.total}
                  filterLabel={filter === 'all' ? 'allTasks' : filter}
                  locale={locale}
                  onToggle={toggleTask}
                  onDelete={handleDelete}
                  onEdit={openEditor}
                  onAddFirst={() => inputRef.current?.focus()}
                  hasSearch={Boolean(query || activeCategory !== 'all')}
                />
              ) : (
                <CalendarView tasks={tasks} locale={locale} onToggle={toggleTask} onEdit={openEditor} />
              )}
              {(storageError || preferenceError) && (
                <p className="storage-message" role="status">
                  {preferenceError
                    ? t('storageWrite')
                    : t(storageError === 'invalid' ? 'storageInvalid' : storageError === 'read' ? 'storageRead' : 'storageWrite')}
                </p>
              )}
            </section>
            <ProductivityPanel
              locale={locale}
              total={stats.total}
              remaining={stats.remaining}
              completed={stats.completed}
              overdue={stats.overdue}
              percentage={stats.percentage}
              weekly={stats.weekly}
              onRequestClear={openClearDialog}
            />
          </div>
        </main>
        <footer className="site-footer">
          <span>{t('footerOne')}</span>
          <span>TASKFLOW <i>®</i> — {t('footerTwo')}</span>
          <span>{t('footerThree')} <b>●</b></span>
        </footer>
      </div>
      <TaskEditorDialog task={editingTask} locale={locale} onClose={() => setEditingTask(null)} onSave={handleSave} onExitComplete={restoreEditorFocus} />
      <ConfirmDialog
        open={clearDialogOpen}
        locale={locale}
        count={stats.completed}
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={() => { clearCompleted(); setClearDialogOpen(false) }}
        onExitComplete={restoreClearFocus}
      />
      <AnimatePresence>
        {toastOpen && notice && (
          <motion.div
            className="toast-message"
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <span>{t(notice)}</span>
            {notice === 'taskDeleted' && lastDeleted && <button type="button" onClick={handleUndo}>{t('undo')}</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
