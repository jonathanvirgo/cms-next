'use client'

import { DynamicForm } from '@/components/forms'
import { tagFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditTagPage() {
    const router = useRouter()
    const params = useParams()
    const tagId = params.id as string

    const { data: tag, isLoading } = trpc.tag.getById.useQuery({ id: tagId })
    const updateTag = trpc.tag.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updateTag.mutateAsync({ id: tagId, ...data } as { id: string; name?: string; slug?: string })
            toast.success('Tag updated successfully!')
            router.push('/tags')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to update tag')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!tag) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Tag not found</p>
                <Link href="/tags">
                    <Button>Back to Tags</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/tags">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Tag</h1>
                    <p className="text-muted-foreground">Update: {tag.name}</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{tagFormConfig.title}</CardTitle>
                    <CardDescription>{tagFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={tagFormConfig}
                        onSubmit={handleSubmit}
                        defaultValues={{
                            name: tag.name,
                            slug: tag.slug,
                        }}
                        submitLabel="Update Tag"
                        isLoading={updateTag.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
