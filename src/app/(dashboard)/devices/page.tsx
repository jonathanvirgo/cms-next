'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Smartphone, Monitor, Tablet, LogOut, HelpCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
    unknown: HelpCircle,
}

export default function DevicesPage() {
    const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = trpc.auth.getSessions.useQuery()
    const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = trpc.auth.getSettings.useQuery()

    const logoutSession = trpc.auth.logoutSession.useMutation({
        onSuccess: () => {
            toast.success('Device logged out successfully')
            refetchSessions()
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const logoutAllOther = trpc.auth.logoutAllOther.useMutation({
        onSuccess: () => {
            toast.success('All other devices logged out')
            refetchSessions()
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const updateSettings = trpc.auth.updateSettings.useMutation({
        onSuccess: () => {
            toast.success('Settings updated')
            refetchSettings()
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const isLoading = isLoadingSessions || isLoadingSettings

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Devices & Sessions</h1>
                <p className="text-muted-foreground">Manage your active login sessions</p>
            </div>

            {/* Active Sessions */}
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                            {sessions?.length || 0} device(s) currently logged in
                        </CardDescription>
                    </div>
                    {(sessions?.length || 0) > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => logoutAllOther.mutate()}
                            disabled={logoutAllOther.isPending}
                        >
                            {logoutAllOther.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Logout All Other Devices
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sessions?.map((session: {
                            id: string
                            deviceName: string | null
                            deviceType: string
                            browser: string | null
                            os: string | null
                            ipAddress: string | null
                            lastActivity: Date
                            isCurrentSession: boolean
                        }) => {
                            const DeviceIcon = deviceIcons[session.deviceType as keyof typeof deviceIcons] || deviceIcons.unknown

                            return (
                                <div
                                    key={session.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${session.isCurrentSession ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${session.isCurrentSession ? 'bg-primary/10' : 'bg-muted'}`}>
                                            <DeviceIcon className={`h-6 w-6 ${session.isCurrentSession ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{session.deviceName}</span>
                                                {session.isCurrentSession && (
                                                    <Badge variant="default" className="text-xs">Current</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {session.browser} • {session.os}
                                                {session.ipAddress && ` • ${session.ipAddress}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Last active: {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true, locale: vi })}
                                            </div>
                                        </div>
                                    </div>

                                    {!session.isCurrentSession && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => logoutSession.mutate({ sessionId: session.id })}
                                            disabled={logoutSession.isPending}
                                        >
                                            <LogOut className="h-4 w-4 mr-1" />
                                            Logout
                                        </Button>
                                    )}
                                </div>
                            )
                        })}

                        {(!sessions || sessions.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">
                                No active sessions found
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Session Settings */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                    <CardDescription>Configure your login preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Multiple Devices</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable login from multiple devices simultaneously
                            </p>
                        </div>
                        <Switch
                            checked={settings?.allowMultipleDevices ?? true}
                            onCheckedChange={(checked) => updateSettings.mutate({ allowMultipleDevices: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Notify New Login</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notification when logged in from new device
                            </p>
                        </div>
                        <Switch
                            checked={settings?.notifyNewLogin ?? true}
                            onCheckedChange={(checked) => updateSettings.mutate({ notifyNewLogin: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="maxSessions">Max Sessions</Label>
                            <p className="text-sm text-muted-foreground">
                                Maximum number of concurrent sessions (1-10)
                            </p>
                        </div>
                        <Input
                            id="maxSessions"
                            type="number"
                            min={1}
                            max={10}
                            className="w-20"
                            value={settings?.maxSessions ?? 5}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10)
                                if (value >= 1 && value <= 10) {
                                    updateSettings.mutate({ maxSessions: value })
                                }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
