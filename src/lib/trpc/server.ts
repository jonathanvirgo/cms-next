import { initTRPC, TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'
import { verifyToken, validateSession, type TokenPayload } from '@/lib/auth'
import { cookies } from 'next/headers'

export interface TRPCContext {
    db: typeof prisma
    user: {
        id: string
        email: string
        name: string
        role: { id: string; name: string }
        tokenId: string
        sessionId: string
    } | null
    token: string | null
}

export const createTRPCContext = async (): Promise<TRPCContext> => {
    // Lấy token từ cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value || null

    if (!token) {
        return { db: prisma, user: null, token: null }
    }

    // Xác thực token
    const decoded = verifyToken(token)
    if (!decoded) {
        return { db: prisma, user: null, token: null }
    }

    // Kiểm tra session trong DB (hỗ trợ remote logout)
    const sessionCheck = await validateSession(decoded.userId, decoded.tokenId)
    if (!sessionCheck.valid || !sessionCheck.user) {
        return { db: prisma, user: null, token: null }
    }

    return {
        db: prisma,
        token,
        user: {
            id: sessionCheck.user.id,
            email: sessionCheck.user.email,
            name: sessionCheck.user.name,
            role: {
                id: sessionCheck.user.role.id,
                name: sessionCheck.user.role.name,
            },
            tokenId: decoded.tokenId,
            sessionId: sessionCheck.sessionId!,
        },
    }
}

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - require authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to perform this action',
        })
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user, // Now guaranteed to be non-null
        },
    })
})
