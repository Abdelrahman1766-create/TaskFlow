import type { Task } from '../types/task'

const STORAGE_KEY = 'taskflow.tasks.v1'
const INVALID_BACKUP_KEY = 'taskflow.tasks.invalid-backup'

export interface StoredTasks {
  tasks: Task[]
  error: 'invalid' | 'read' | null
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' && task.id.length > 0 &&
    (typeof task.title === 'string' || typeof task.text === 'string') &&
    String(task.title ?? task.text).trim().length > 0 &&
    typeof task.createdAt === 'number' &&
    Number.isFinite(task.createdAt) &&
    typeof task.completed === 'boolean' &&
    (task.completedAt === null || task.completedAt === undefined ||
      (typeof task.completedAt === 'number' && Number.isFinite(task.completedAt))) &&
    (task.priority === undefined || task.priority === 'high' || task.priority === 'medium' || task.priority === 'low') &&
    (task.description === undefined || typeof task.description === 'string') &&
    (task.category === undefined || typeof task.category === 'string') &&
    (task.dueDate === undefined || (typeof task.dueDate === 'string' && isValidDate(task.dueDate)))
  )
}

function isValidDate(value: string): boolean {
  if (value === '') return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function migrateTask(value: unknown): Task {
  const task = value as Record<string, unknown>
  return {
    id: task.id as string,
    title: String(task.title ?? task.text).trim(),
    description: typeof task.description === 'string' ? task.description : '',
    createdAt: task.createdAt as number,
    completed: task.completed as boolean,
    completedAt: typeof task.completedAt === 'number' ? task.completedAt : null,
    priority: task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium',
    category: typeof task.category === 'string' ? task.category : '',
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
  }
}

export function readTasks(): StoredTasks {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { tasks: [], error: null }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      backupInvalidData(raw)
      return { tasks: [], error: 'invalid' }
    }
    if (!Array.isArray(parsed)) {
      backupInvalidData(raw)
      return { tasks: [], error: 'invalid' }
    }
    const seen = new Set<string>()
    const valid = parsed.filter((value): value is Task => {
      if (!isTask(value) || seen.has(value.id)) return false
      seen.add(value.id)
      return true
    })
    if (valid.length !== parsed.length) backupInvalidData(raw)
    return { tasks: valid.map(migrateTask), error: valid.length === parsed.length ? null : 'invalid' }
  } catch {
    return { tasks: [], error: 'read' }
  }
}

function backupInvalidData(raw: string): void {
  try {
    if (window.localStorage.getItem(INVALID_BACKUP_KEY) === null) {
      window.localStorage.setItem(INVALID_BACKUP_KEY, raw)
    }
  } catch {
    // Keep the original key untouched until the user makes a change.
  }
}

export function writeTasks(tasks: Task[]): 'write' | null {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return null
  } catch {
    return 'write'
  }
}

export function readPreference<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  try {
    const stored = window.localStorage.getItem(key)
    return allowed.includes(stored as T) ? (stored as T) : fallback
  } catch {
    return fallback
  }
}

export function writePreference(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
