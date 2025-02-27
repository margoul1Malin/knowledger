'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Erreur lors de la récupération des notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      })

      if (!res.ok) throw new Error('Erreur lors de la mise à jour')

      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ))
    } catch (error) {
      console.error(error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ARTICLE':
      case 'NEW_VIDEO':
      case 'NEW_FORMATION':
        return '📚'
      case 'PURCHASE':
        return '💳'
      case 'PREMIUM_UPGRADE':
        return '⭐'
      default:
        return '🔔'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BellIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucune notification pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.isRead ? 'bg-background' : 'bg-primary/5 border-primary'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-muted-foreground">{notification.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), 'PPP', { locale: fr })}
                    </p>
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 