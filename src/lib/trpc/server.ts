import { initTRPC } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'

export const createTRPCContext = async () => {
    return {
        db: prisma,
    }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
