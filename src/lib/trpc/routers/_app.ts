import { router } from '../server'
import { authRouter } from './auth'
import { userRouter } from './user'
import { roleRouter } from './role'
import { postRouter } from './post'
import { categoryRouter } from './category'
import { tagRouter } from './tag'

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    role: roleRouter,
    post: postRouter,
    category: categoryRouter,
    tag: tagRouter,
})

export type AppRouter = typeof appRouter
