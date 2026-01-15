'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PostsPage() {
    const { data: posts, isLoading, refetch } = trpc.post.list.useQuery()
    const deletePost = trpc.post.delete.useMutation({
        onSuccess: () => {
            toast.success('Post deleted successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete post')
        },
    })

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost.mutateAsync({ id })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
                    <p className="text-muted-foreground">Manage blog posts</p>
                </div>
                <Link href="/posts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Post
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No posts found. Create your first post!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts?.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                                        <TableCell>{post.author.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{post.category.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {post.tags.slice(0, 3).map((pt) => (
                                                    <Badge key={pt.tag.id} variant="outline" className="text-xs">
                                                        {pt.tag.name}
                                                    </Badge>
                                                ))}
                                                {post.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{post.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/posts/${post.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(post.id)}
                                                disabled={deletePost.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
