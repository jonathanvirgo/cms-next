import { router, publicProcedure } from '../server'
import { z } from 'zod'

export const postRouter = router({
    getFormData: publicProcedure.query(async ({ ctx }) => {
        const [categories, authors, tags] = await Promise.all([
            ctx.db.category.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),
            ctx.db.user.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),
            ctx.db.tag.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            })
        ])

        return { categories, authors, tags }
    }),

    list: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.post.findMany({
            include: {
                author: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.db.post.findUnique({
                where: { id: input.id },
                include: {
                    author: true,
                    category: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            })

            if (!post) return null

            // Transform tags to array of tag ids for form
            return {
                ...post,
                tagIds: post.tags.map(pt => pt.tag.id)
            }
        }),

    create: publicProcedure
        .input(z.object({
            title: z.string().min(1),
            slug: z.string().min(1),
            content: z.string().min(1),
            excerpt: z.string().optional(),
            thumbnail: z.string().optional(),
            status: z.enum(['draft', 'published']).default('draft'),
            authorId: z.string(),
            categoryId: z.string(),
            tagIds: z.array(z.string()).default([]),
            publishedAt: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { tagIds, publishedAt, ...data } = input

            return await ctx.db.post.create({
                data: {
                    ...data,
                    publishedAt: publishedAt ? new Date(publishedAt) : null,
                    tags: {
                        create: tagIds.map(tagId => ({
                            tag: { connect: { id: tagId } }
                        }))
                    }
                },
                include: {
                    author: true,
                    category: true,
                    tags: { include: { tag: true } }
                }
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().min(1).optional(),
            slug: z.string().min(1).optional(),
            content: z.string().min(1).optional(),
            excerpt: z.string().optional(),
            thumbnail: z.string().optional(),
            status: z.enum(['draft', 'published']).optional(),
            authorId: z.string().optional(),
            categoryId: z.string().optional(),
            tagIds: z.array(z.string()).optional(),
            publishedAt: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, tagIds, publishedAt, ...data } = input

            // If tagIds are provided, update the tags
            if (tagIds !== undefined) {
                // Delete existing tags
                await ctx.db.postTag.deleteMany({
                    where: { postId: id }
                })

                // Create new tags
                await ctx.db.postTag.createMany({
                    data: tagIds.map(tagId => ({
                        postId: id,
                        tagId
                    }))
                })
            }

            return await ctx.db.post.update({
                where: { id },
                data: {
                    ...data,
                    ...(publishedAt && { publishedAt: new Date(publishedAt) })
                },
                include: {
                    author: true,
                    category: true,
                    tags: { include: { tag: true } }
                }
            })
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.post.delete({
                where: { id: input.id },
            })
        }),
})
