'use client'

import { DynamicForm } from '@/components/forms'
import { productFormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
    const router = useRouter()
    // Uncomment if you need relation data
    // const { data: formData, isLoading: isFormDataLoading } = trpc.product.getFormData.useQuery()
    const createMutation = trpc.product.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createMutation.mutateAsync(data as any)
            toast.success('Created successfully!')
            router.push('/products')
        } catch (e: any) {
            toast.error(e.message || 'Failed to create')
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/products">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
                    <p className="text-muted-foreground">Add a new product</p>
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
                        // formData={formData}  // Uncomment if using relations
                        submitLabel="Create Product"
                        isLoading={createMutation.isPending}
                        // isFormDataLoading={isFormDataLoading}  // Uncomment if using relations
                    />
                </CardContent>
            </Card>
        </div>
    )
}
