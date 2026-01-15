# CMS Dynamic Form - Hướng dẫn sử dụng

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt](#cài-đặt)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [DynamicForm Component](#dynamicform-component)
5. [Form Configuration](#form-configuration)
6. [Field Types](#field-types)
7. [tRPC Routers](#trpc-routers)
8. [CRUD Pages](#crud-pages)
9. [Database Schema](#database-schema)
10. [UI Components](#ui-components)

---

## Giới thiệu

**CMS Dynamic Form** là một hệ thống quản lý nội dung được xây dựng với kiến trúc metadata-driven. Điểm nổi bật của hệ thống là **DynamicForm component** - cho phép tự động render forms dựa trên cấu hình metadata, giảm thiểu code lặp và dễ dàng mở rộng.

### Công nghệ sử dụng

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| Next.js | 16+ | Framework với App Router |
| Tailwind CSS | v4 | Styling |
| tRPC | 11+ | Type-safe API |
| Prisma | 7+ | ORM |
| React Hook Form | 7+ | Form handling |
| Zod | 4+ | Schema validation |
| shadcn/ui | Latest | UI components |

---

## Cài đặt

### Yêu cầu

- Node.js 18+
- pnpm (khuyến nghị)

### Các bước cài đặt

```bash
# 1. Clone và vào thư mục
cd c:\project\cms-app\app

# 2. Cài dependencies
pnpm install

# 3. Copy file .env.example thành .env
cp .env.example .env

# 4. Push database schema
pnpm db:push

# 5. Chạy seed data (tùy chọn)
pnpm db:seed

# 6. Khởi động dev server
pnpm dev
```

Truy cập http://localhost:3000 để sử dụng CMS.

---

## Cấu trúc dự án

```
src/
├── app/                         # Next.js App Router
│   ├── (dashboard)/            # Dashboard route group
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Home page
│   │   ├── roles/              # Roles CRUD
│   │   ├── users/              # Users CRUD
│   │   ├── posts/              # Posts CRUD
│   │   ├── categories/         # Categories CRUD
│   │   └── tags/               # Tags CRUD
│   └── api/trpc/               # tRPC API endpoint
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard components
│   │   ├── sidebar.tsx         # Collapsible sidebar
│   │   ├── header.tsx          # Top header
│   │   ├── MetricCard.tsx      # Statistics card
│   │   ├── ActivityFeed.tsx    # Activity timeline
│   │   └── RevenueChart.tsx    # Chart component
│   └── forms/
│       └── dynamic-form.tsx    # ⭐ DynamicForm component
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── trpc/                   # tRPC setup
│   │   ├── client.ts           # React client
│   │   ├── server.ts           # Server setup
│   │   ├── provider.tsx        # Provider component
│   │   └── routers/            # API routers
│   └── form-configs/           # ⭐ Form configurations
│       ├── types.ts            # TypeScript types
│       ├── user.config.ts      # User form config
│       ├── role.config.ts      # Role form config
│       ├── post.config.ts      # Post form config
│       ├── category.config.ts  # Category form config
│       └── tag.config.ts       # Tag form config
```

---

## DynamicForm Component

### Tổng quan

`DynamicForm` là component trung tâm của hệ thống, tự động render forms dựa trên cấu hình metadata.

**File location:** `src/components/forms/dynamic-form.tsx`

### Props

```typescript
interface DynamicFormProps {
    config: FormConfig           // Cấu hình form từ form-configs
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>
    defaultValues?: Record<string, unknown>  // Giá trị mặc định (cho edit)
    formData?: Record<string, Array<{ id: string; name: string }>>  // Data cho relations
    submitLabel?: string         // Label cho nút submit
    isLoading?: boolean          // Loading state khi submit
    isFormDataLoading?: boolean  // Loading state khi fetch relation data
}
```

### Cách sử dụng

#### 1. Tạo mới (Create)

```tsx
import { DynamicForm } from '@/components/forms'
import { roleFormConfig } from '@/lib/form-configs'

export default function NewRolePage() {
    const createRole = trpc.role.create.useMutation()

    const handleSubmit = async (data: Record<string, unknown>) => {
        await createRole.mutateAsync(data as { name: string; description?: string })
        // redirect...
    }

    return (
        <DynamicForm
            config={roleFormConfig}
            onSubmit={handleSubmit}
            submitLabel="Create Role"
            isLoading={createRole.isPending}
        />
    )
}
```

#### 2. Chỉnh sửa (Edit) với giá trị mặc định

```tsx
import { DynamicForm } from '@/components/forms'
import { roleFormConfig } from '@/lib/form-configs'

export default function EditRolePage() {
    const { data: role } = trpc.role.getById.useQuery({ id: roleId })
    const updateRole = trpc.role.update.useMutation()

    return (
        <DynamicForm
            config={roleFormConfig}
            onSubmit={handleSubmit}
            defaultValues={{
                name: role.name,
                description: role.description || '',
            }}
            submitLabel="Update Role"
            isLoading={updateRole.isPending}
        />
    )
}
```

#### 3. Form với Relations (User chọn Role)

```tsx
import { DynamicForm } from '@/components/forms'
import { userFormConfig } from '@/lib/form-configs'

export default function NewUserPage() {
    // Fetch relation data từ tRPC
    const { data: formData, isLoading: isFormDataLoading } = trpc.user.getFormData.useQuery()
    const createUser = trpc.user.create.useMutation()

    return (
        <DynamicForm
            config={userFormConfig}
            onSubmit={handleSubmit}
            formData={formData}  // { roles: [{ id: '1', name: 'Admin' }, ...] }
            submitLabel="Create User"
            isLoading={createUser.isPending}
            isFormDataLoading={isFormDataLoading}
        />
    )
}
```

#### 4. Form với Multi-Relations (Post chọn nhiều Tags)

```tsx
import { DynamicForm } from '@/components/forms'
import { postFormConfig } from '@/lib/form-configs'

export default function NewPostPage() {
    const { data: formData } = trpc.post.getFormData.useQuery()
    // formData = {
    //   users: [{ id: '1', name: 'Admin' }],
    //   categories: [{ id: '1', name: 'Technology' }],
    //   tags: [{ id: '1', name: 'React' }, { id: '2', name: 'Next.js' }]
    // }

    return (
        <DynamicForm
            config={postFormConfig}
            onSubmit={handleSubmit}
            formData={formData}
            submitLabel="Create Post"
        />
    )
}
```

---

## Form Configuration

### Tạo Form Config mới

```typescript
// src/lib/form-configs/example.config.ts
import { z } from 'zod'
import { FormConfig } from './types'

export const exampleFormConfig: FormConfig = {
    modelName: 'Example',
    title: 'Example Form',
    description: 'Description of the form',
    fields: [
        // Định nghĩa các fields ở đây
    ],
    validation: z.object({
        // Zod schema cho validation
    }),
}
```

### Export trong index.ts

```typescript
// src/lib/form-configs/index.ts
export * from './types'
export { roleFormConfig } from './role.config'
export { userFormConfig, userEditFormConfig } from './user.config'
export { exampleFormConfig } from './example.config'  // Thêm dòng này
```

---

## Field Types

DynamicForm hỗ trợ các loại field sau:

### 1. Text Fields

```typescript
{
    name: 'title',
    label: 'Title',
    type: 'text',        // hoặc 'email', 'password'
    required: true,
    placeholder: 'Enter title',
    description: 'A brief title',
}
```

### 2. Number Field

```typescript
{
    name: 'price',
    label: 'Price',
    type: 'number',
    min: 0,
    max: 1000000,
    step: 0.01,
}
```

### 3. Textarea

```typescript
{
    name: 'content',
    label: 'Content',
    type: 'textarea',
    rows: 10,
    placeholder: 'Write your content...',
}
```

### 4. Checkbox

```typescript
{
    name: 'isActive',
    label: 'Active',
    type: 'checkbox',
    defaultValue: true,
    description: 'Enable this user',
}
```

### 5. Select (Static Options)

```typescript
{
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
    ],
    defaultValue: 'draft',
}
```

### 6. Relation (One-to-Many)

```typescript
{
    name: 'roleId',
    label: 'Role',
    type: 'relation',
    required: true,
    relation: {
        model: 'Role',
        displayField: 'name',   // Hiển thị field 'name' của Role
        valueField: 'id',       // Lưu field 'id'
        dataKey: 'roles',       // Key trong formData response
    },
}
```

**Lưu ý:** Cần cung cấp `formData` prop cho DynamicForm:
```tsx
<DynamicForm formData={{ roles: [{ id: '1', name: 'Admin' }] }} />
```

### 7. Multi-Relation (Many-to-Many)

```typescript
{
    name: 'tagIds',
    label: 'Tags',
    type: 'multi-relation',
    relation: {
        model: 'Tag',
        displayField: 'name',
        valueField: 'id',
        dataKey: 'tags',
    },
    description: 'Select one or more tags',
}
```

### 8. Date Picker

```typescript
{
    name: 'publishDate',
    label: 'Publish Date',
    type: 'date',
    placeholder: 'Select date',
}
```

### 9. DateTime Picker

```typescript
{
    name: 'scheduledAt',
    label: 'Schedule At',
    type: 'datetime',
    placeholder: 'Select date and time',
}
```

---

## tRPC Routers

### Cấu trúc Router

```typescript
// src/lib/trpc/routers/example.ts
import { z } from 'zod'
import { publicProcedure, router } from '../server'
import { prisma } from '@/lib/prisma'

export const exampleRouter = router({
    // List all items
    list: publicProcedure.query(async () => {
        return prisma.example.findMany()
    }),

    // Get by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return prisma.example.findUnique({ where: { id: input.id } })
        }),

    // Create
    create: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            return prisma.example.create({ data: input })
        }),

    // Update
    update: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            const { id, ...data } = input
            return prisma.example.update({ where: { id }, data })
        }),

    // Delete
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return prisma.example.delete({ where: { id: input.id } })
        }),

    // Get form data (for relations)
    getFormData: publicProcedure.query(async () => {
        const relatedItems = await prisma.relatedModel.findMany({
            select: { id: true, name: true },
        })
        return { relatedItems }
    }),
})
```

### Thêm vào App Router

```typescript
// src/lib/trpc/routers/_app.ts
import { router } from '../server'
import { exampleRouter } from './example'

export const appRouter = router({
    example: exampleRouter,
    // ... other routers
})
```

---

## CRUD Pages

### Cấu trúc chuẩn cho mỗi Entity

```
src/app/(dashboard)/examples/
├── page.tsx           # List page
├── new/
│   └── page.tsx       # Create page
└── [id]/
    └── edit/
        └── page.tsx   # Edit page
```

### Template List Page

```tsx
'use client'

import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function ExamplesPage() {
    const { data, isLoading, refetch } = trpc.example.list.useQuery()
    const deleteItem = trpc.example.delete.useMutation({
        onSuccess: () => {
            toast.success('Deleted successfully')
            refetch()
        },
    })

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Examples</h1>
                <Link href="/examples/new">
                    <Button><Plus className="mr-2 h-4 w-4" />Add Example</Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader><CardTitle>All Examples</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/examples/${item.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteItem.mutateAsync({ id: item.id })}
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
```

---

## Database Schema

### Models hiện có

```prisma
model User {
    id        String   @id @default(cuid())
    name      String
    email     String   @unique
    password  String
    roleId    String
    role      Role     @relation(fields: [roleId], references: [id])
    isActive  Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    posts     Post[]
}

model Role {
    id          String   @id @default(cuid())
    name        String   @unique
    description String?
    permissions String   @default("[]")
    users       User[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}

model Category {
    id          String   @id @default(cuid())
    name        String
    slug        String   @unique
    description String?
    posts       Post[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}

model Tag {
    id        String    @id @default(cuid())
    name      String
    slug      String    @unique
    posts     PostTag[]
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}

model Post {
    id          String    @id @default(cuid())
    title       String
    slug        String    @unique
    content     String
    excerpt     String?
    thumbnail   String?
    status      String    @default("draft")
    authorId    String
    author      User      @relation(fields: [authorId], references: [id])
    categoryId  String
    category    Category  @relation(fields: [categoryId], references: [id])
    tags        PostTag[]
    publishedAt DateTime?
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
}

model PostTag {
    postId String
    tagId  String
    post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
    tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
    @@id([postId, tagId])
}

model FormConfig {
    id        String   @id @default(cuid())
    modelName String   @unique
    title     String
    config    String   // JSON string of form configuration
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

---

## UI Components

### Dashboard Components

| Component | File | Mô tả |
|-----------|------|-------|
| Sidebar | `dashboard/sidebar.tsx` | Collapsible navigation sidebar |
| Header | `dashboard/header.tsx` | Top header với search, theme toggle |
| MetricCard | `dashboard/MetricCard.tsx` | Statistics card với trend indicator |
| ActivityFeed | `dashboard/ActivityFeed.tsx` | Timeline hiển thị hoạt động |
| RevenueChart | `dashboard/RevenueChart.tsx` | Chart component |

### shadcn/ui Components (27 components)

- `alert-dialog`, `avatar`, `badge`, `button`, `calendar`
- `card`, `checkbox`, `collapsible`, `command`, `dialog`
- `dropdown-menu`, `form`, `input`, `label`, `popover`
- `scroll-area`, `select`, `separator`, `sheet`, `sidebar`
- `skeleton`, `sonner`, `switch`, `table`, `tabs`
- `textarea`, `tooltip`

### Custom CSS Classes

```css
/* Glass morphism card */
.glass-card {
    @apply bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl;
    box-shadow: 0 4px 24px -4px hsl(222 47% 11% / 0.08);
}

/* Sidebar navigation item */
.sidebar-item {
    @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground transition-all duration-200;
}

.sidebar-item-active {
    @apply bg-primary/10 text-primary border-l-2 border-primary;
}

/* Metric card */
.metric-card {
    @apply bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-6 relative overflow-hidden;
}
```

---

## Troubleshooting

### Lỗi Prisma v7 Client Initialization

Prisma v7 yêu cầu driver adapter cho SQLite:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const client = new Database('./prisma/dev.db')
const adapter = new PrismaBetterSQLite3(client)
export const prisma = new PrismaClient({ adapter })
```

### tRPC Type Errors

Nếu gặp lỗi type với tRPC routers, restart TypeScript server:
- VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### CSS @apply Errors

Tailwind v4 không cho phép `@apply` với custom classes. Sử dụng trực tiếp utility classes thay vì:

```css
/* ❌ Không nên */
.my-class { @apply glass-card; }

/* ✅ Nên dùng */
.my-class {
    @apply bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl;
}
```

---

## Kết luận

CMS Dynamic Form cung cấp một hệ thống linh hoạt để xây dựng forms và CRUD operations thông qua metadata configuration. DynamicForm component là trung tâm của hệ thống, cho phép:

- ✅ Render forms tự động từ config
- ✅ Support nhiều field types (text, number, textarea, checkbox, select, date, datetime)
- ✅ Relations (one-to-many) và Multi-relations (many-to-many)
- ✅ Validation với Zod schema
- ✅ Loading states và error handling
- ✅ Default values cho edit forms

Để mở rộng, chỉ cần:
1. Tạo Prisma model mới
2. Tạo tRPC router
3. Tạo form configuration
4. Tạo CRUD pages sử dụng DynamicForm
