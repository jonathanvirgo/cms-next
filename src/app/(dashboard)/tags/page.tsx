'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
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

export default function TagsPage() {
    const { data: tags, isLoading, refetch } = trpc.tag.list.useQuery()
    const deleteTag = trpc.tag.delete.useMutation({
        onSuccess: () => {
            toast.success('Tag deleted successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete tag')
        },
    })

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            await deleteTag.mutateAsync({ id })
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
                    <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
                    <p className="text-muted-foreground">Manage post tags</p>
                </div>
                <Link href="/tags/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tag
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Posts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No tags found. Create your first tag!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tags?.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="font-medium">{tag.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{tag._count.posts}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/tags/${tag.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(tag.id)}
                                                disabled={deleteTag.isPending || tag._count.posts > 0}
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
