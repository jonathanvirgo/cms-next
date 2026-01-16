import { router, publicProcedure, protectedProcedure } from '../server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'

export const userRouter = router({
    // Lấy data cho form (roles để chọn)
    getFormData: publicProcedure.query(async ({ ctx }) => {
        const roles = await ctx.db.role.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        return { roles }
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
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

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.user.findUnique({
                where: { id: input.id },
                include: { role: true }
            })
        }),

    create: protectedProcedure
        .input(z.object({
            email: z.string().email(),
            name: z.string().min(1),
            password: z.string().min(6),
            roleId: z.string(),
            isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            // Hash password trước khi lưu
            const hashedPassword = await hashPassword(input.password)

            return await ctx.db.user.create({
                data: {
                    ...input,
                    password: hashedPassword,
                },
                include: { role: true }
            })
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            email: z.string().email().optional(),
            name: z.string().min(1).optional(),
            password: z.string().min(6).optional(),
            roleId: z.string().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, password, ...rest } = input

            // Remove undefined values
            const cleanData: Record<string, unknown> = Object.fromEntries(
                Object.entries(rest).filter(([, v]) => v !== undefined)
            )

            // Hash password nếu được cung cấp
            if (password) {
                cleanData.password = await hashPassword(password)
            }

            return await ctx.db.user.update({
                where: { id },
                data: cleanData,
                include: { role: true }
            })
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.user.delete({
                where: { id: input.id },
            })
        }),
})
