'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Shield, Palette, Database, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
    const handleSave = () => {
        toast.success('Settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your CMS settings and preferences</p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            <CardTitle>General Settings</CardTitle>
                        </div>
                        <CardDescription>Configure basic CMS settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input id="siteName" defaultValue="My CMS" placeholder="Enter site name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="siteUrl">Site URL</Label>
                            <Input id="siteUrl" defaultValue="http://localhost:3000" placeholder="https://example.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input id="adminEmail" type="email" defaultValue="admin@example.com" placeholder="admin@example.com" />
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive email notifications for new content</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Weekly Digest</Label>
                                <p className="text-sm text-muted-foreground">Receive weekly summary email</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Configure security settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Session Timeout</Label>
                                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize the look and feel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Use dark theme</p>
                            </div>
                            <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Compact Mode</Label>
                                <p className="text-sm text-muted-foreground">Reduce spacing in the UI</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Database Info */}
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle>Database</CardTitle>
                        </div>
                        <CardDescription>Database information and actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Database Type</p>
                                <p className="font-medium">SQLite / PostgreSQL</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium text-green-600">Connected</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Run Migrations</Button>
                            <Button variant="outline" size="sm">Seed Database</Button>
                            <Button variant="destructive" size="sm">Clear Cache</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                </Button>
            </div>
        </div>
    )
}
