import { useMemo, useRef, useState } from 'react'
import type { NewTask, Task } from '../types/task'
import { readTasks, writeTasks } from '../utils/storage'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useTasks() {
  const [initial] = useState(readTasks)
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [storageError, setStorageError] = useState<'invalid' | 'read' | 'write' | null>(initial.error)
  const tasksRef = useRef(initial.tasks)
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null)

  function updateTasks(next: Task[]) {
    tasksRef.current = next
    setTasks(next)
    setStorageError(writeTasks(next))
  }

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length
    const total = tasks.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdue = tasks.filter(
      (task) => !task.completed && task.dueDate && new Date(`${task.dueDate}T00:00:00`).getTime() < today.getTime(),
    ).length
    const weekly = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      const next = new Date(date)
      next.setDate(next.getDate() + 1)
      return {
        date,
        count: tasks.filter((task) => task.completedAt !== null && task.completedAt >= date.getTime() && task.completedAt < next.getTime()).length,
      }
    })
    return {
      total,
      completed,
      remaining: total - completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      overdue,
      weekly,
    }
  }, [tasks])

  function addTask(data: NewTask): boolean {
    const trimmed = data.title.trim()
    if (!trimmed) return false
    const now = Date.now()
    updateTasks([
      {
        id: createId(),
        title: trimmed,
        description: data.description.trim(),
        createdAt: now,
        completed: false,
        completedAt: null,
        priority: data.priority,
        category: data.category.trim(),
        dueDate: data.dueDate,
      },
      ...tasksRef.current,
    ])
    return true
  }

  function editTask(id: string, data: NewTask) {
    const title = data.title.trim()
    if (!title) return false
    if (!tasksRef.current.some((task) => task.id === id)) return false
    updateTasks(tasksRef.current.map((task) => task.id === id ? {
      ...task,
      title,
      description: data.description.trim(),
      priority: data.priority,
      category: data.category.trim(),
      dueDate: data.dueDate,
    } : task))
    return true
  }

  function toggleTask(id: string) {
    updateTasks(
      tasksRef.current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, completedAt: task.completed ? null : Date.now() }
          : task,
      ),
    )
  }

  function deleteTask(id: string) {
    const deleted = tasksRef.current.find((task) => task.id === id)
    if (deleted) setLastDeleted(deleted)
    updateTasks(tasksRef.current.filter((item) => item.id !== id))
  }

  function undoDelete() {
    if (!lastDeleted) return
    if (!tasksRef.current.some((task) => task.id === lastDeleted.id)) {
      updateTasks([lastDeleted, ...tasksRef.current])
    }
    setLastDeleted(null)
  }

  function clearCompleted() {
    updateTasks(tasksRef.current.filter((task) => !task.completed))
    setLastDeleted(null)
  }

  return {
    tasks,
    stats,
    storageError,
    lastDeleted,
    addTask,
    editTask,
    toggleTask,
    deleteTask,
    undoDelete,
    clearCompleted,
  }
}
