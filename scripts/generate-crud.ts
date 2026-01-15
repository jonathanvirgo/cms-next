#!/usr/bin/env node

/**
 * Smart CRUD Generator - Đọc từ Prisma Schema
 * 
 * Flow đúng:
 * 1. Tạo model trong prisma/schema.prisma
 * 2. Chạy: pnpm db:push
 * 3. Chạy: pnpm generate:crud ModelName
 * 4. Chỉ cần register router + thêm sidebar link là xong!
 * 
 * Usage: pnpm generate:crud <ModelName>
 */

import * as fs from 'fs'
import * as path from 'path'

// Types
interface PrismaField {
    name: string
    type: string
    isRequired: boolean
    isId: boolean
    isRelation: boolean
    relationModel?: string
    hasDefault: boolean
    isUnique: boolean
    defaultValue?: string
}

interface PrismaModel {
    name: string
    fields: PrismaField[]
}

// Config
const config = {
    srcDir: path.join(process.cwd(), 'src'),
    schemaPath: path.join(process.cwd(), 'prisma', 'schema.prisma'),
    routersDir: 'lib/trpc/routers',
    formConfigsDir: 'lib/form-configs',
    pagesDir: 'app/(dashboard)',
}

// Utilities
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const lowercase = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const pluralize = (s: string) => {
    if (s.endsWith('y')) return s.slice(0, -1) + 'ies'
    if (s.endsWith('s')) return s + 'es'
    return s + 's'
}
const kebabCase = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

// Parse Prisma Schema
function parsePrismaSchema(schemaContent: string, modelName: string): PrismaModel | null {
    const modelRegex = new RegExp(`model\\s+${modelName}\\s*\\{([^}]+)\\}`, 's')
    const match = schemaContent.match(modelRegex)

    if (!match) return null

    const modelBody = match[1]
    const lines = modelBody.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'))

    const fields: PrismaField[] = []

    for (const line of lines) {
        // Parse: fieldName Type? @attributes
        const fieldMatch = line.match(/^(\w+)\s+(\w+)(\?)?(\[\])?\s*(.*)$/)
        if (!fieldMatch) continue

        const [, name, type, optional, isArray, attributes = ''] = fieldMatch

        const isId = attributes.includes('@id')
        const isRelation = /^[A-Z]/.test(type) && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Decimal', 'BigInt'].includes(type)
        const hasDefault = attributes.includes('@default')
        const isUnique = attributes.includes('@unique')

        // Extract relation model
        let relationModel: string | undefined
        if (isRelation) {
            relationModel = type
        }

        // Extract default value
        let defaultValue: string | undefined
        const defaultMatch = attributes.match(/@default\(([^)]+)\)/)
        if (defaultMatch) {
            defaultValue = defaultMatch[1]
        }

        fields.push({
            name,
            type: isArray ? `${type}[]` : type,
            isRequired: !optional && !hasDefault && !isId,
            isId,
            isRelation,
            relationModel,
            hasDefault,
            isUnique,
            defaultValue,
        })
    }

    return { name: modelName, fields }
}

// Map Prisma type to form field type
function getFormFieldType(field: PrismaField): string {
    if (field.isRelation) return 'relation'

    switch (field.type) {
        case 'String':
            if (field.name.toLowerCase().includes('email')) return 'email'
            if (field.name.toLowerCase().includes('password')) return 'password'
            if (field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('content') || field.name.toLowerCase().includes('body')) return 'textarea'
            return 'text'
        case 'Int':
        case 'Float':
        case 'Decimal':
            return 'number'
        case 'Boolean':
            return 'checkbox'
        case 'DateTime':
            return 'datetime'
        default:
            return 'text'
    }
}

// Get Zod type
function getZodType(field: PrismaField): string {
    if (field.isRelation) return 'z.string()'

    switch (field.type) {
        case 'String':
            return field.isRequired ? 'z.string().min(1)' : 'z.string().optional()'
        case 'Int':
            return field.isRequired ? 'z.number().int()' : 'z.number().int().optional()'
        case 'Float':
        case 'Decimal':
            return field.isRequired ? 'z.number()' : 'z.number().optional()'
        case 'Boolean':
            return 'z.boolean().optional()'
        case 'DateTime':
            return 'z.string().optional()' // ISO string
        default:
            return 'z.string().optional()'
    }
}

// Generate Router
function generateRouter(model: PrismaModel): string {
    const modelLower = lowercase(model.name)
    const editableFields = model.fields.filter(f =>
        !f.isId &&
        !['createdAt', 'updatedAt'].includes(f.name) &&
        !f.type.endsWith('[]') // Skip array relations
    )

    const createFields = editableFields.map(f => {
        let zodType = getZodType(f)
        return `            ${f.name}: ${zodType},`
    }).join('\n')

    const updateFields = editableFields.map(f => {
        let zodType = getZodType(f).replace('.min(1)', '') // Make optional for update
        if (!zodType.includes('.optional()')) zodType += '.optional()'
        return `            ${f.name}: ${zodType},`
    }).join('\n')

    // Find relations for include
    const relations = model.fields.filter(f => f.isRelation && !f.type.endsWith('[]'))
    const includeClause = relations.length > 0
        ? `\n            include: { ${relations.map(r => `${r.name}: { select: { id: true, name: true } }`).join(', ')} },`
        : ''

    // Form data for relations
    const formDataQueries = relations.map(r => {
        const relModel = r.relationModel!
        return `        const ${pluralize(lowercase(relModel))} = await prisma.${lowercase(relModel)}.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        })`
    }).join('\n')

    const formDataReturn = relations.length > 0
        ? `{ ${relations.map(r => pluralize(lowercase(r.relationModel!))).join(', ')} }`
        : '{}'

    return `import { z } from 'zod'
import { publicProcedure, router } from '../server'
import { prisma } from '@/lib/prisma'

export const ${modelLower}Router = router({
    list: publicProcedure.query(async () => {
        return prisma.${modelLower}.findMany({${includeClause}
            orderBy: { createdAt: 'desc' },
        })
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return prisma.${modelLower}.findUnique({
                where: { id: input.id },${includeClause}
            })
        }),

    create: publicProcedure
        .input(z.object({
${createFields}
        }))
        .mutation(async ({ input }) => {
            return prisma.${modelLower}.create({ data: input })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
${updateFields}
        }))
        .mutation(async ({ input }) => {
            const { id, ...data } = input
            return prisma.${modelLower}.update({ where: { id }, data })
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return prisma.${modelLower}.delete({ where: { id: input.id } })
        }),
${relations.length > 0 ? `
    getFormData: publicProcedure.query(async () => {
${formDataQueries}
        return ${formDataReturn}
    }),` : ''}
})
`
}

// Generate Form Config
function generateFormConfig(model: PrismaModel): string {
    const modelLower = lowercase(model.name)
    const editableFields = model.fields.filter(f =>
        !f.isId &&
        !['createdAt', 'updatedAt'].includes(f.name) &&
        !f.type.endsWith('[]')
    )

    const fieldsConfig = editableFields.map(f => {
        const fieldType = getFormFieldType(f)
        let config = `        {
            name: '${f.name}',
            label: '${capitalize(f.name.replace(/([A-Z])/g, ' $1').trim())}',
            type: '${fieldType}',`

        if (f.isRequired) {
            config += `\n            required: true,`
        }

        if (fieldType === 'textarea') {
            config += `\n            rows: 4,`
        }

        if (fieldType === 'checkbox' && f.defaultValue) {
            config += `\n            defaultValue: ${f.defaultValue},`
        }

        if (f.isRelation && f.relationModel) {
            const relLower = lowercase(f.relationModel)
            config += `
            relation: {
                model: '${f.relationModel}',
                displayField: 'name',
                valueField: 'id',
                dataKey: '${pluralize(relLower)}',
            },`
        }

        config += `\n        },`
        return config
    }).join('\n')

    const validationFields = editableFields.map(f => {
        return `        ${f.name}: ${getZodType(f)},`
    }).join('\n')

    return `import { z } from 'zod'
import { FormConfig } from './types'

export const ${modelLower}FormConfig: FormConfig = {
    modelName: '${model.name}',
    title: '${model.name} Management',
    description: 'Create and manage ${pluralize(lowercase(model.name))}',
    fields: [
${fieldsConfig}
    ],
    validation: z.object({
${validationFields}
    }),
}
`
}

// Generate List Page
function generateListPage(model: PrismaModel): string {
    const modelLower = lowercase(model.name)
    const entities = pluralize(modelLower)
    const entitiesPath = kebabCase(entities)

    const displayFields = model.fields.filter(f =>
        !f.isId &&
        !['createdAt', 'updatedAt', 'password'].includes(f.name) &&
        !f.type.endsWith('[]')
    ).slice(0, 4) // Max 4 columns

    const tableHeaders = displayFields.map(f => {
        if (f.isRelation) {
            return `                                <TableHead>${capitalize(f.name.replace('Id', ''))}</TableHead>`
        }
        return `                                <TableHead>${capitalize(f.name.replace(/([A-Z])/g, ' $1').trim())}</TableHead>`
    }).join('\n')

    const tableCells = displayFields.map(f => {
        if (f.isRelation) {
            const relName = f.name.replace('Id', '')
            return `                                    <TableCell><Badge variant="secondary">{item.${relName}?.name || '-'}</Badge></TableCell>`
        }
        if (f.type === 'Boolean') {
            return `                                    <TableCell><Badge variant={item.${f.name} ? 'default' : 'outline'}>{item.${f.name} ? 'Yes' : 'No'}</Badge></TableCell>`
        }
        if (f.type === 'Float' || f.type === 'Decimal') {
            return `                                    <TableCell>{item.${f.name}?.toFixed(2)}</TableCell>`
        }
        return `                                    <TableCell className="font-medium">{item.${f.name}}</TableCell>`
    }).join('\n')

    return `'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ${model.name}sPage() {
    const { data, isLoading, refetch } = trpc.${modelLower}.list.useQuery()
    const deleteItem = trpc.${modelLower}.delete.useMutation({
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
                    <h1 className="text-3xl font-bold tracking-tight">${model.name}s</h1>
                    <p className="text-muted-foreground">Manage ${entities}</p>
                </div>
                <Link href="/${entitiesPath}/new">
                    <Button><Plus className="mr-2 h-4 w-4" />Add ${model.name}</Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader><CardTitle>All ${model.name}s</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
${tableHeaders}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={${displayFields.length + 1}} className="text-center py-8 text-muted-foreground">
                                        No ${entities} found. Create your first ${modelLower}!
                                    </TableCell>
                                </TableRow>
                            ) : data?.map((item: any) => (
                                <TableRow key={item.id}>
${tableCells}
                                    <TableCell className="text-right space-x-2">
                                        <Link href={\`/${entitiesPath}/\${item.id}/edit\`}>
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
`
}

// Generate Create Page
function generateCreatePage(model: PrismaModel): string {
    const modelLower = lowercase(model.name)
    const entities = pluralize(modelLower)
    const entitiesPath = kebabCase(entities)
    const hasRelations = model.fields.some(f => f.isRelation && !f.type.endsWith('[]'))

    return `'use client'

import { DynamicForm } from '@/components/forms'
import { ${modelLower}FormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft${hasRelations ? ', Loader2' : ''} } from 'lucide-react'
import Link from 'next/link'

export default function New${model.name}Page() {
    const router = useRouter()
${hasRelations ? `    const { data: formData, isLoading: isFormDataLoading } = trpc.${modelLower}.getFormData.useQuery()` : ''}
    const createMutation = trpc.${modelLower}.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await createMutation.mutateAsync(data as any)
            toast.success('Created successfully!')
            router.push('/${entitiesPath}')
        } catch (e: any) {
            toast.error(e.message || 'Failed to create')
        }
    }
${hasRelations ? `
    if (isFormDataLoading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
` : ''}
    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/${entitiesPath}">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create ${model.name}</h1>
                    <p className="text-muted-foreground">Add a new ${modelLower}</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{${modelLower}FormConfig.title}</CardTitle>
                    <CardDescription>{${modelLower}FormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={${modelLower}FormConfig}
                        onSubmit={handleSubmit}
${hasRelations ? `                        formData={formData}` : ''}
                        submitLabel="Create ${model.name}"
                        isLoading={createMutation.isPending}
${hasRelations ? `                        isFormDataLoading={isFormDataLoading}` : ''}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
`
}

// Generate Edit Page
function generateEditPage(model: PrismaModel): string {
    const modelLower = lowercase(model.name)
    const entities = pluralize(modelLower)
    const entitiesPath = kebabCase(entities)
    const hasRelations = model.fields.some(f => f.isRelation && !f.type.endsWith('[]'))

    const editableFields = model.fields.filter(f =>
        !f.isId &&
        !['createdAt', 'updatedAt'].includes(f.name) &&
        !f.type.endsWith('[]')
    )

    const defaultValues = editableFields.map(f => {
        if (f.type === 'String' && !f.isRequired) {
            return `                            ${f.name}: item.${f.name} || '',`
        }
        return `                            ${f.name}: item.${f.name},`
    }).join('\n')

    return `'use client'

import { DynamicForm } from '@/components/forms'
import { ${modelLower}FormConfig } from '@/lib/form-configs'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function Edit${model.name}Page() {
    const router = useRouter()
    const params = useParams()
    const itemId = params.id as string

    const { data: item, isLoading } = trpc.${modelLower}.getById.useQuery({ id: itemId })
${hasRelations ? `    const { data: formData, isLoading: isFormDataLoading } = trpc.${modelLower}.getFormData.useQuery()` : ''}
    const updateMutation = trpc.${modelLower}.update.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        try {
            await updateMutation.mutateAsync({ id: itemId, ...data } as any)
            toast.success('Updated successfully!')
            router.push('/${entitiesPath}')
        } catch (e: any) {
            toast.error(e.message || 'Failed to update')
        }
    }

    if (isLoading${hasRelations ? ' || isFormDataLoading' : ''}) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-muted-foreground">${model.name} not found</p>
                <Link href="/${entitiesPath}"><Button>Back to ${model.name}s</Button></Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/${entitiesPath}">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit ${model.name}</h1>
                    <p className="text-muted-foreground">Update: {item.name || item.id}</p>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>{${modelLower}FormConfig.title}</CardTitle>
                    <CardDescription>{${modelLower}FormConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DynamicForm
                        config={${modelLower}FormConfig}
                        onSubmit={handleSubmit}
                        defaultValues={{
${defaultValues}
                        }}
${hasRelations ? `                        formData={formData}` : ''}
                        submitLabel="Update ${model.name}"
                        isLoading={updateMutation.isPending}
${hasRelations ? `                        isFormDataLoading={isFormDataLoading}` : ''}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
`
}

// Main Generator
function generateCrud(modelName: string) {
    console.log(`\n🔍 Reading Prisma schema...`)

    if (!fs.existsSync(config.schemaPath)) {
        console.error(`❌ Schema not found: ${config.schemaPath}`)
        process.exit(1)
    }

    const schemaContent = fs.readFileSync(config.schemaPath, 'utf-8')
    const model = parsePrismaSchema(schemaContent, modelName)

    if (!model) {
        console.error(`❌ Model "${modelName}" not found in schema!`)
        console.log(`\n💡 Available models:`)
        const modelMatches = schemaContent.matchAll(/model\s+(\w+)\s*\{/g)
        for (const m of modelMatches) {
            console.log(`   - ${m[1]}`)
        }
        process.exit(1)
    }

    console.log(`✅ Found model: ${model.name} (${model.fields.length} fields)`)
    console.log(`\n🚀 Generating CRUD files...\n`)

    const modelLower = lowercase(model.name)
    const entities = pluralize(modelLower)
    const entitiesPath = kebabCase(entities)

    const files: { path: string; content: string }[] = [
        {
            path: path.join(config.srcDir, config.routersDir, `${modelLower}.ts`),
            content: generateRouter(model)
        },
        {
            path: path.join(config.srcDir, config.formConfigsDir, `${modelLower}.config.ts`),
            content: generateFormConfig(model)
        },
        {
            path: path.join(config.srcDir, config.pagesDir, entitiesPath, 'page.tsx'),
            content: generateListPage(model)
        },
        {
            path: path.join(config.srcDir, config.pagesDir, entitiesPath, 'new', 'page.tsx'),
            content: generateCreatePage(model)
        },
        {
            path: path.join(config.srcDir, config.pagesDir, entitiesPath, '[id]', 'edit', 'page.tsx'),
            content: generateEditPage(model)
        },
    ]

    // Create files
    files.forEach(({ path: filePath, content }) => {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        if (fs.existsSync(filePath)) {
            console.log(`⚠️  Skip (exists): ${path.relative(process.cwd(), filePath)}`)
        } else {
            fs.writeFileSync(filePath, content)
            console.log(`✅ Created: ${path.relative(process.cwd(), filePath)}`)
        }
    })

    // Instructions
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Chỉ cần 2 bước nữa là xong:

1️⃣  Register router trong src/lib/trpc/routers/_app.ts:

    import { ${modelLower}Router } from './${modelLower}'
    
    export const appRouter = router({
        // ... existing routers
        ${modelLower}: ${modelLower}Router,
    })

2️⃣  Thêm sidebar link trong src/components/dashboard/sidebar.tsx:

    { icon: Package, label: "${model.name}s", href: "/${entitiesPath}" },

3️⃣  Export form config trong src/lib/form-configs/index.ts:

    export { ${modelLower}FormConfig } from './${modelLower}.config'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Done! Truy cập http://localhost:3000/${entitiesPath}
`)
}

// CLI
const args = process.argv.slice(2)
if (args.length === 0) {
    console.log(`
📦 Smart CRUD Generator

Usage: pnpm generate:crud <ModelName>

Flow:
  1. Tạo model trong prisma/schema.prisma
  2. Chạy: pnpm db:push
  3. Chạy: pnpm generate:crud ModelName
  4. Register router + thêm sidebar link
  5. Done! 🎉

Examples:
  pnpm generate:crud Product
  pnpm generate:crud BlogPost
  pnpm generate:crud Order
`)
    process.exit(1)
}

generateCrud(args[0])
