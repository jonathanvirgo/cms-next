import { router, publicProcedure } from '../server'
import { z } from 'zod'

export const tagRouter = router({
    list: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        })
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.tag.findUnique({
                where: { id: input.id },
            })
        }),

    create: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            slug: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.tag.create({
                data: input,
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            slug: z.string().min(1).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return await ctx.db.tag.update({
                where: { id },
                data,
            })
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.tag.delete({
                where: { id: input.id },
            })
        }),
})
