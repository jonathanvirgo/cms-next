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

export default function CategoriesPage() {
    const { data: categories, isLoading, refetch } = trpc.category.list.useQuery()
    const deleteCategory = trpc.category.delete.useMutation({
        onSuccess: () => {
            toast.success('Category deleted successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete category')
        },
    })

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            await deleteCategory.mutateAsync({ id })
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
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage post categories</p>
                </div>
                <Link href="/categories/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Posts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No categories found. Create your first category!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories?.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{category._count.posts}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/categories/${category.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                                disabled={deleteCategory.isPending || category._count.posts > 0}
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
