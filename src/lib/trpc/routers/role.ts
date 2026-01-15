import { router, publicProcedure } from '../server'
import { z } from 'zod'

export const roleRouter = router({
    list: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.role.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        })
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.role.findUnique({
                where: { id: input.id },
            })
        }),

    create: publicProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            permissions: z.string().default('[]'),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.role.create({
                data: {
                    name: input.name,
                    description: input.description,
                    permissions: input.permissions,
                },
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            permissions: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return await ctx.db.role.update({
                where: { id },
                data,
            })
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.role.delete({
                where: { id: input.id },
            })
        }),
})
