import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

// Password hashing helper
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

// Prisma v7 requires driver adapter for PostgreSQL
// Use DIRECT_URL for seeding (bypasses connection pooler)
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...')

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Full system access with all permissions',
            permissions: '["all"]',
        },
    })

    const editorRole = await prisma.role.upsert({
        where: { name: 'Editor' },
        update: {},
        create: {
            name: 'Editor',
            description: 'Can create and edit content',
            permissions: '["read", "write", "publish"]',
        },
    })

    const viewerRole = await prisma.role.upsert({
        where: { name: 'Viewer' },
        update: {},
        create: {
            name: 'Viewer',
            description: 'Read-only access',
            permissions: '["read"]',
        },
    })

    console.log('✅ Roles created:', [adminRole.name, editorRole.name, viewerRole.name])

    // Create Categories
    const techCategory = await prisma.category.upsert({
        where: { slug: 'technology' },
        update: {},
        create: {
            name: 'Technology',
            slug: 'technology',
            description: 'Tech news, tutorials, and insights',
        },
    })

    const businessCategory = await prisma.category.upsert({
        where: { slug: 'business' },
        update: {},
        create: {
            name: 'Business',
            slug: 'business',
            description: 'Business strategies and market analysis',
        },
    })

    const lifestyleCategory = await prisma.category.upsert({
        where: { slug: 'lifestyle' },
        update: {},
        create: {
            name: 'Lifestyle',
            slug: 'lifestyle',
            description: 'Lifestyle tips and stories',
        },
    })

    console.log('✅ Categories created:', [techCategory.name, businessCategory.name, lifestyleCategory.name])

    // Create Tags
    const reactTag = await prisma.tag.upsert({
        where: { slug: 'react' },
        update: {},
        create: {
            name: 'React',
            slug: 'react',
        },
    })

    const nextjsTag = await prisma.tag.upsert({
        where: { slug: 'nextjs' },
        update: {},
        create: {
            name: 'Next.js',
            slug: 'nextjs',
        },
    })

    const typescriptTag = await prisma.tag.upsert({
        where: { slug: 'typescript' },
        update: {},
        create: {
            name: 'TypeScript',
            slug: 'typescript',
        },
    })

    const prismaTag = await prisma.tag.upsert({
        where: { slug: 'prisma' },
        update: {},
        create: {
            name: 'Prisma',
            slug: 'prisma',
        },
    })

    const tailwindTag = await prisma.tag.upsert({
        where: { slug: 'tailwindcss' },
        update: {},
        create: {
            name: 'Tailwind CSS',
            slug: 'tailwindcss',
        },
    })

    console.log('✅ Tags created:', [reactTag.name, nextjsTag.name, typescriptTag.name, prismaTag.name, tailwindTag.name])

    // Hash passwords for users
    const adminPassword = await hashPassword('admin123')
    const editorPassword = await hashPassword('editor123')

    // Create Admin User (with hashed password)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { password: adminPassword }, // Update existing user with hashed password
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            roleId: adminRole.id,
            isActive: true,
        },
    })

    // Create Editor User (with hashed password)
    const editorUser = await prisma.user.upsert({
        where: { email: 'editor@example.com' },
        update: { password: editorPassword }, // Update existing user with hashed password
        create: {
            name: 'Editor User',
            email: 'editor@example.com',
            password: editorPassword,
            roleId: editorRole.id,
            isActive: true,
        },
    })

    console.log('✅ Users created/updated with hashed passwords:', [adminUser.email, editorUser.email])

    // Create Sample Posts
    const post1 = await prisma.post.upsert({
        where: { slug: 'getting-started-with-nextjs' },
        update: {},
        create: {
            title: 'Getting Started with Next.js 16',
            slug: 'getting-started-with-nextjs',
            excerpt: 'Learn how to build modern web applications with Next.js 16 and App Router.',
            content: `# Getting Started with Next.js 16

Next.js 16 introduces many exciting features including improved performance and better developer experience.

## Key Features

- **App Router**: A new routing system based on the file system
- **Server Components**: React Server Components for better performance
- **Turbopack**: Faster development builds

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

This will set up a new Next.js project with all the latest features.`,
            status: 'published',
            authorId: adminUser.id,
            categoryId: techCategory.id,
            publishedAt: new Date(),
        },
    })

    // Connect tags to post
    await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post1.id, tagId: nextjsTag.id } },
        update: {},
        create: { postId: post1.id, tagId: nextjsTag.id },
    })
    await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post1.id, tagId: reactTag.id } },
        update: {},
        create: { postId: post1.id, tagId: reactTag.id },
    })
    await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post1.id, tagId: typescriptTag.id } },
        update: {},
        create: { postId: post1.id, tagId: typescriptTag.id },
    })

    const post2 = await prisma.post.upsert({
        where: { slug: 'building-forms-with-react-hook-form' },
        update: {},
        create: {
            title: 'Building Dynamic Forms with React Hook Form',
            slug: 'building-forms-with-react-hook-form',
            excerpt: 'A comprehensive guide to building type-safe forms in React.',
            content: `# Building Dynamic Forms

React Hook Form is a powerful library for building performant and type-safe forms.

## Why React Hook Form?

- Minimal re-renders
- Easy validation with Zod
- Great TypeScript support

## Example

\`\`\`tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    email: '',
  },
})
\`\`\``,
            status: 'draft',
            authorId: editorUser.id,
            categoryId: techCategory.id,
        },
    })

    await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post2.id, tagId: reactTag.id } },
        update: {},
        create: { postId: post2.id, tagId: reactTag.id },
    })
    await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post2.id, tagId: typescriptTag.id } },
        update: {},
        create: { postId: post2.id, tagId: typescriptTag.id },
    })

    console.log('✅ Posts created:', [post1.title, post2.title])

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await pool.end()
        await prisma.$disconnect()
    })
