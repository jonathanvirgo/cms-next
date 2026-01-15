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

export default function UsersPage() {
    const { data: users, isLoading, refetch } = trpc.user.list.useQuery()
    const deleteUser = trpc.user.delete.useMutation({
        onSuccess: () => {
            toast.success('User deleted successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete user')
        },
    })

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser.mutateAsync({ id })
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
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage user accounts</p>
                </div>
                <Link href="/users/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Posts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No users found. Create your first user!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{user.role.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user._count.posts}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/users/${user.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deleteUser.isPending}
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
