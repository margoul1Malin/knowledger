'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
type Status = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'

interface TodoItem {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  createdAt: Date
}

const priorityColors = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500'
}

const statusColors = {
  PLANNED: 'bg-blue-500',
  IN_PROGRESS: 'bg-purple-500',
  COMPLETED: 'bg-emerald-500'
}

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTodo, setNewTodo] = useState<Partial<TodoItem>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PLANNED'
  })

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) throw new Error('Erreur lors du chargement des todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      toast.error("Impossible de charger les todos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (!newTodo.title || !newTodo.description) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })

      if (!response.ok) throw new Error('Erreur lors de l\'ajout')
      
      const todo = await response.json()
      setTodos([todo, ...todos])
      setNewTodo({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PLANNED'
      })
      setShowAddForm(false)
      toast.success('Idée ajoutée avec succès')
    } catch (error) {
      toast.error("Impossible d'ajouter l'idée")
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')
      
      setTodos(todos.filter(todo => todo.id !== id))
      toast.success('Idée supprimée avec succès')
    } catch (error) {
      toast.error("Impossible de supprimer l'idée")
    }
  }

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, status } : todo
      ))
      toast.success('Statut mis à jour avec succès')
    } catch (error) {
      toast.error("Impossible de mettre à jour le statut")
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pense-Bête</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <PlusIcon className="w-5 h-5" />
          Nouvelle idée
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card p-6 rounded-xl border border-border"
          >
            <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle idée</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full p-2 rounded-lg bg-background border border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-background border border-border h-24"
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priorité</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Priority })}
                    className="p-2 rounded-lg bg-background border border-border"
                  >
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTodo}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{todo.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${priorityColors[todo.priority]}`}>
                    {todo.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[todo.status]}`}>
                    {todo.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{todo.description}</p>
            <div className="flex gap-2">
              {(['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as Status[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(todo.id, status)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    todo.status === status
                      ? `${statusColors[status]} text-white`
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
