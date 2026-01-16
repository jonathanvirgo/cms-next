import { router, publicProcedure, protectedProcedure } from '../server'
import { z } from 'zod'
import {
    createToken,
    getDeviceInfo,
    comparePassword,
    createSession,
    deactivateSession,
    deactivateSessionById,
    deactivateAllOtherSessions,
    getActiveSessions,
    getSessionSettings,
    updateSessionSettings,
} from '@/lib/auth'
import { TRPCError } from '@trpc/server'
import { cookies } from 'next/headers'

export const authRouter = router({
    /**
     * Đăng nhập
     */
    login: publicProcedure
        .input(z.object({
            email: z.string().email('Invalid email'),
            password: z.string().min(1, 'Password is required'),
            userAgent: z.string().optional(),
            ipAddress: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Tìm user
            const user = await ctx.db.user.findUnique({
                where: { email: input.email },
                include: { role: true },
            })

            if (!user) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password',
                })
            }

            if (!user.isActive) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Your account has been deactivated',
                })
            }

            // 2. So sánh password
            const isValidPassword = await comparePassword(input.password, user.password)
            if (!isValidPassword) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid email or password',
                })
            }

            // 3. Tạo token
            const { token, tokenId } = createToken(user)

            // 4. Lấy thông tin thiết bị và tạo session
            const deviceInfo = getDeviceInfo(input.userAgent || null)
            await createSession({
                userId: user.id,
                tokenId,
                deviceInfo,
                ipAddress: input.ipAddress,
            })

            // 5. Set cookie
            const cookieStore = await cookies()
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            })

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.name,
                },
            }
        }),

    /**
     * Đăng xuất
     */
    logout: publicProcedure.mutation(async ({ ctx }) => {
        if (ctx.user?.tokenId) {
            await deactivateSession(ctx.user.tokenId)
        }

        const cookieStore = await cookies()
        cookieStore.delete('auth_token')

        return { success: true }
    }),

    /**
     * Lấy thông tin user hiện tại
     */
    me: protectedProcedure.query(async ({ ctx }) => {
        return {
            id: ctx.user.id,
            email: ctx.user.email,
            name: ctx.user.name,
            role: ctx.user.role,
        }
    }),

    /**
     * Kiểm tra auth status (không throw error)
     */
    status: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.user) {
            return { authenticated: false, user: null }
        }

        return {
            authenticated: true,
            user: {
                id: ctx.user.id,
                email: ctx.user.email,
                name: ctx.user.name,
                role: ctx.user.role,
            },
        }
    }),

    /**
     * Lấy danh sách sessions đang active
     */
    getSessions: protectedProcedure.query(async ({ ctx }) => {
        return getActiveSessions(ctx.user.id)
    }),

    /**
     * Đăng xuất một session cụ thể
     */
    logoutSession: protectedProcedure
        .input(z.object({ sessionId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await deactivateSessionById(input.sessionId, ctx.user.id)
            return { success: true }
        }),

    /**
     * Đăng xuất tất cả session khác
     */
    logoutAllOther: protectedProcedure.mutation(async ({ ctx }) => {
        await deactivateAllOtherSessions(ctx.user.id, ctx.user.tokenId)
        return { success: true }
    }),

    /**
     * Lấy session settings
     */
    getSettings: protectedProcedure.query(async ({ ctx }) => {
        return getSessionSettings(ctx.user.id)
    }),

    /**
     * Cập nhật session settings
     */
    updateSettings: protectedProcedure
        .input(z.object({
            maxSessions: z.number().min(1).max(10).optional(),
            sessionTimeoutHours: z.number().min(1).max(168).optional(),
            allowMultipleDevices: z.boolean().optional(),
            notifyNewLogin: z.boolean().optional(),
            autoLogoutInactive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return updateSessionSettings(ctx.user.id, input)
        }),
})
