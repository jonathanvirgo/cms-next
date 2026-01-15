'use client'

import { DynamicForm } from '@/components/forms'
import { tagFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewTagPage() {
    const router = useRouter()
    const createTag = trpc.tag.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createTag.mutateAsync(data as { name: string; slug: string })
            toast.success('Tag created successfully!')
            router.push('/tags')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to create tag')
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">Create Tag</h1>
                    <p className="text-muted-foreground">Add a new tag</p>
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
                        submitLabel="Create Tag"
                        isLoading={createTag.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
