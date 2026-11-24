export interface Task {
  id: string
  title: string
  description: string
  createdAt: number
  completed: boolean
  completedAt: number | null
  priority: TaskPriority
  category: string
  dueDate: string
}

export type TaskFilter = 'all' | 'active' | 'completed'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskSort = 'created' | 'due' | 'priority'
export type Locale = 'en' | 'ru'
export type Theme = 'light' | 'dark'

export interface NewTask {
  title: string
  description: string
  priority: TaskPriority
  category: string
  dueDate: string
}

export interface WeeklyPoint {
  date: Date
  count: number
}
