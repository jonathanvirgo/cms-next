'use client'

import { DynamicForm } from '@/components/forms'
import { categoryFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditCategoryPage() {
    const router = useRouter()
    const params = useParams()
    const categoryId = params.id as string

    const { data: category, isLoading } = trpc.category.getById.useQuery({ id: categoryId })
    const updateCategory = trpc.category.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updateCategory.mutateAsync({ id: categoryId, ...data } as { id: string; name?: string; slug?: string; description?: string })
            toast.success('Category updated successfully!')
            router.push('/categories')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to update category')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Category not found</p>
                <Link href="/categories">
                    <Button>Back to Categories</Button>
                </Link>
            </div>
        )
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
                    <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                    <p className="text-muted-foreground">Update: {category.name}</p>
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
                        defaultValues={{
                            name: category.name,
                            slug: category.slug,
                            description: category.description || '',
                        }}
                        submitLabel="Update Category"
                        isLoading={updateCategory.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
