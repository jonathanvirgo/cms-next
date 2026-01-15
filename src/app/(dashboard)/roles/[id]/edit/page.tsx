'use client'

import { DynamicForm } from '@/components/forms'
import { roleFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditRolePage() {
    const router = useRouter()
    const params = useParams()
    const roleId = params.id as string

    const { data: role, isLoading } = trpc.role.getById.useQuery({ id: roleId })
    const updateRole = trpc.role.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updateRole.mutateAsync({ id: roleId, ...data } as { id: string; name?: string; description?: string })
            toast.success('Role updated successfully!')
            router.push('/roles')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to update role')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!role) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Role not found</p>
                <Link href="/roles">
                    <Button>Back to Roles</Button>
                </Link>
            </div>
        )
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
                    <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
                    <p className="text-muted-foreground">Update role: {role.name}</p>
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
                        defaultValues={{
                            name: role.name,
                            description: role.description || '',
                        }}
                        submitLabel="Update Role"
                        isLoading={updateRole.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
