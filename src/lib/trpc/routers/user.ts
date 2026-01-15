import { router, publicProcedure } from '../server'
import { z } from 'zod'

export const userRouter = router({
    // Lấy data cho form (roles để chọn)
    getFormData: publicProcedure.query(async ({ ctx }) => {
        const roles = await ctx.db.role.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        return { roles }
    }),

    list: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findMany({
            include: {
                role: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.user.findUnique({
                where: { id: input.id },
                include: { role: true }
            })
        }),

    create: publicProcedure
        .input(z.object({
            email: z.string().email(),
            name: z.string().min(1),
            password: z.string().min(6),
            roleId: z.string(),
            isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.user.create({
                data: input,
                include: { role: true }
            })
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            email: z.string().email().optional(),
            name: z.string().min(1).optional(),
            password: z.string().min(6).optional(),
            roleId: z.string().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            // Remove undefined values
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([, v]) => v !== undefined)
            )
            return await ctx.db.user.update({
                where: { id },
                data: cleanData,
                include: { role: true }
            })
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.user.delete({
                where: { id: input.id },
            })
        }),
})
