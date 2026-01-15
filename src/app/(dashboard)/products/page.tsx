'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function ProductsPage() {
    const { data, isLoading, refetch } = trpc.product.list.useQuery()
    const deleteItem = trpc.product.delete.useMutation({
        onSuccess: () => { toast.success('Deleted successfully'); refetch() },
        onError: (e) => toast.error(e.message || 'Delete failed'),
    })

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage products</p>
                </div>
                <Link href="/products/new">
                    <Button><Plus className="mr-2 h-4 w-4" />Add Product</Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader><CardTitle>All Products</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                {/* TODO: Add more columns */}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                        No products found. Create your first product!
                                    </TableCell>
                                </TableRow>
                            ) : data?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    {/* TODO: Add more cells */}
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/products/${item.id}/edit`}>
                                            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => confirm('Are you sure?') && deleteItem.mutateAsync({ id: item.id })}
                                            disabled={deleteItem.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
