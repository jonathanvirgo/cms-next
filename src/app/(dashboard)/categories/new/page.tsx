'use client'

import { DynamicForm } from '@/components/forms'
import { categoryFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCategoryPage() {
    const router = useRouter()
    const createCategory = trpc.category.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createCategory.mutateAsync(data as { name: string; slug: string; description?: string })
            toast.success('Category created successfully!')
            router.push('/categories')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to create category')
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/categories">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
                    <p className="text-muted-foreground">Add a new category</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{categoryFormConfig.title}</CardTitle>
                    <CardDescription>{categoryFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={categoryFormConfig}
                        onSubmit={handleSubmit}
                        submitLabel="Create Category"
                        isLoading={createCategory.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
