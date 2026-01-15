'use client'

import { DynamicForm } from '@/components/forms'
import { userEditFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditUserPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params.id as string

    const { data: user, isLoading } = trpc.user.getById.useQuery({ id: userId })
    const { data: formData, isLoading: isFormDataLoading } = trpc.user.getFormData.useQuery()
    const updateUser = trpc.user.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            // Filter out empty password
            const updateData = { ...data }
            if (!updateData.password) {
                delete updateData.password
            }

            await updateUser.mutateAsync({ id: userId, ...updateData } as {
                id: string;
                email?: string;
                name?: string;
                password?: string;
                roleId?: string;
                isActive?: boolean
            })
            toast.success('User updated successfully!')
            router.push('/users')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to update user')
        }
    }

    if (isLoading || isFormDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">User not found</p>
                <Link href="/users">
                    <Button>Back to Users</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Update user: {user.name}</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{userEditFormConfig.title}</CardTitle>
                    <CardDescription>{userEditFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={userEditFormConfig}
                        onSubmit={handleSubmit}
                        defaultValues={{
                            name: user.name,
                            email: user.email,
                            password: '',
                            roleId: user.roleId,
                            isActive: user.isActive,
                        }}
                        formData={formData}
                        submitLabel="Update User"
                        isLoading={updateUser.isPending}
                        isFormDataLoading={isFormDataLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
