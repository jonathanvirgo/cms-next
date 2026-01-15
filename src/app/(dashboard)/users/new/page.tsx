'use client'

import { DynamicForm } from '@/components/forms'
import { userFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewUserPage() {
    const router = useRouter()
    const { data: formData, isLoading: isFormDataLoading } = trpc.user.getFormData.useQuery()
    const createUser = trpc.user.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createUser.mutateAsync(data as {
                email: string;
                name: string;
                password: string;
                roleId: string;
                isActive?: boolean
            })
            toast.success('User created successfully!')
            router.push('/users')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to create user')
        }
    }

    if (isFormDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
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
                    <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
                    <p className="text-muted-foreground">Add a new user to the system</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{userFormConfig.title}</CardTitle>
                    <CardDescription>{userFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={userFormConfig}
                        onSubmit={handleSubmit}
                        formData={formData}
                        submitLabel="Create User"
                        isLoading={createUser.isPending}
                        isFormDataLoading={isFormDataLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
