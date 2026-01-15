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

export default function RolesPage() {
    const { data: roles, isLoading, refetch } = trpc.role.list.useQuery()
    const deleteRole = trpc.role.delete.useMutation({
        onSuccess: () => {
            toast.success('Role deleted successfully')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete role')
        },
    })

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this role?')) {
            await deleteRole.mutateAsync({ id })
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
                    <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions</p>
                </div>
                <Link href="/roles/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No roles found. Create your first role!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles?.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">{role.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {role.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{role._count.users} users</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/roles/${role.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(role.id)}
                                                disabled={deleteRole.isPending || role._count.users > 0}
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
