'use client'

import { DynamicForm } from '@/components/forms'
import { postFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
    const router = useRouter()
    const { data: formData, isLoading: isFormDataLoading } = trpc.post.getFormData.useQuery()
    const createPost = trpc.post.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createPost.mutateAsync(data as {
                title: string;
                slug: string;
                content: string;
                excerpt?: string;
                thumbnail?: string;
                status: 'draft' | 'published';
                authorId: string;
                categoryId: string;
                tagIds?: string[];
            })
            toast.success('Post created successfully!')
            router.push('/posts')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to create post')
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
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link href="/posts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
                    <p className="text-muted-foreground">Write a new blog post</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{postFormConfig.title}</CardTitle>
                    <CardDescription>{postFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={postFormConfig}
                        onSubmit={handleSubmit}
                        formData={formData}
                        submitLabel="Create Post"
                        isLoading={createPost.isPending}
                        isFormDataLoading={isFormDataLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
