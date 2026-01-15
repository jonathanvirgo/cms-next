'use client'

import { DynamicForm } from '@/components/forms'
import { postFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const postId = params.id as string

    const { data: post, isLoading } = trpc.post.getById.useQuery({ id: postId })
    const { data: formData, isLoading: isFormDataLoading } = trpc.post.getFormData.useQuery()
    const updatePost = trpc.post.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updatePost.mutateAsync({ id: postId, ...data } as {
                id: string;
                title?: string;
                slug?: string;
                content?: string;
                excerpt?: string;
                thumbnail?: string;
                status?: 'draft' | 'published';
                authorId?: string;
                categoryId?: string;
                tagIds?: string[];
            })
            toast.success('Post updated successfully!')
            router.push('/posts')
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err.message || 'Failed to update post')
        }
    }

    if (isLoading || isFormDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Post not found</p>
                <Link href="/posts">
                    <Button>Back to Posts</Button>
                </Link>
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
                    <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                    <p className="text-muted-foreground">Update: {post.title}</p>
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
                        defaultValues={{
                            title: post.title,
                            slug: post.slug,
                            content: post.content,
                            excerpt: post.excerpt || '',
                            thumbnail: post.thumbnail || '',
                            status: post.status,
                            authorId: post.authorId,
                            categoryId: post.categoryId,
                            tagIds: post.tagIds || [],
                        }}
                        formData={formData}
                        submitLabel="Update Post"
                        isLoading={updatePost.isPending}
                        isFormDataLoading={isFormDataLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
