'use client'

import { DynamicForm } from '@/components/forms'
import { productFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const itemId = params.id as string

    const { data: item, isLoading } = trpc.product.getById.useQuery({ id: itemId })
    // Uncomment if you need relation data
    // const { data: formData, isLoading: isFormDataLoading } = trpc.product.getFormData.useQuery()
    const updateMutation = trpc.product.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updateMutation.mutateAsync({ id: itemId, ...data } as any)
            toast.success('Updated successfully!')
            router.push('/products')
        } catch (e: any) {
            toast.error(e.message || 'Failed to update')
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">Product not found</p>
                <Link href="/products"><Button>Back to Products</Button></Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/products">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">Update: {item.name}</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{productFormConfig.title}</CardTitle>
                    <CardDescription>{productFormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={productFormConfig}
                        onSubmit={handleSubmit}
                        defaultValues={{
                            name: item.name,
                            // TODO: Add more default values matching your model
                        }}
                        // formData={formData}  // Uncomment if using relations
                        submitLabel="Update Product"
                        isLoading={updateMutation.isPending}
                        // isFormDataLoading={isFormDataLoading}  // Uncomment if using relations
                    />
                </CardContent>
            </Card>
        </div>
    )
}
