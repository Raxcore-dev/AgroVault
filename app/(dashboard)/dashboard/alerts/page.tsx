'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRoleGuard } from '@/hooks/use-role-guard'
import { AlertTriangle, CheckCircle, Thermometer, Droplets, Package, CloudRain } from 'lucide-react'

interface Alert {
  id: string
  alertType: string
  severity: string
  message: string
  isRead: boolean
  timestamp: string
  storageUnit: {
    name: string
  }
}

export default function AlertsPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')
  const { token } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  if (roleLoading || !allowed) return null

  useEffect(() => {
    if (!token) return
    fetch('/api/alerts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setAlerts(data.alerts ?? data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const markAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.isRead).map((a) => a.id)
    if (unreadIds.length === 0) return

    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alertIds: unreadIds }),
      })
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const markSingleRead = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alertIds: [alertId] }),
      })
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'high_temperature':
      case 'HIGH_TEMPERATURE':
      case 'CRITICAL_TEMPERATURE':
        return <Thermometer className="h-5 w-5" />
      case 'low_humidity':
      case 'high_humidity':
      case 'LOW_HUMIDITY':
      case 'HIGH_HUMIDITY':
        return <Droplets className="h-5 w-5" />
      case 'capacity_exceeded':
      case 'CAPACITY_EXCEEDED':
        return <Package className="h-5 w-5" />
      case 'weather_risk':
      case 'WEATHER_RISK':
        return <CloudRain className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-danger bg-danger/10 border-danger/20'
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20'
      default:
        return 'text-accent bg-accent/10 border-accent/20'
    }
  }

  const unreadCount = alerts.filter((a) => !a.isRead).length

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storage Alerts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <CheckCircle className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="card-elevated rounded-lg p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-primary/50 mb-3" />
            <h3 className="font-semibold text-foreground">No alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All your storage conditions are within normal range.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`card-elevated rounded-lg p-4 flex items-start gap-4 transition-all ${!alert.isRead ? 'border-l-4 border-l-primary' : 'opacity-75'}`}
              >
                <div className={`rounded-lg p-2 ${getSeverityColor(alert.severity)}`}>
                  {getAlertIcon(alert.alertType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.storageUnit.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {!alert.isRead && (
                      <button
                        onClick={() => markSingleRead(alert.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
