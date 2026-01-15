'use client'

import { DynamicForm } from '@/components/forms'
import { roleFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewRolePage() {
    const router = useRouter()
    const createRole = trpc.role.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createRole.mutateAsync(data as { name: string; description?: string })
            toast.success('Role created successfully!')
            router.push('/roles')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to create role')
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/roles">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
                    <p className="text-muted-foreground">Add a new role to the system</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{roleFormConfig.title}</CardTitle>
                    <CardDescription>{roleFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={roleFormConfig}
                        onSubmit={handleSubmit}
                        submitLabel="Create Role"
                        isLoading={createRole.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
