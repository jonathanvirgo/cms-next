import { prisma as db } from '@/lib/prisma'
import type { DeviceInfo } from './jwt.service'

interface CreateSessionParams {
    userId: string
    tokenId: string
    deviceInfo: DeviceInfo
    ipAddress?: string
}

/**
 * Tạo session mới cho user
 * Xử lý logic multi-device: xóa session cũ nếu vượt quá max_sessions
 */
export async function createSession({
    userId,
    tokenId,
    deviceInfo,
    ipAddress,
}: CreateSessionParams) {
    // Lấy settings của user hoặc tạo mới với default
    let settings = await db.userSessionSettings.findUnique({
        where: { userId },
    })

    if (!settings) {
        settings = await db.userSessionSettings.create({
            data: { userId },
        })
    }

    // Reset isCurrentSession cho các session khác
    await db.userSession.updateMany({
        where: { userId, isActive: true },
        data: { isCurrentSession: false },
    })

    // Nếu không cho phép multi-device, deactivate tất cả session cũ
    if (!settings.allowMultipleDevices) {
        await db.userSession.updateMany({
            where: { userId, isActive: true },
            data: {
                isActive: false,
                logoutAt: new Date(),
            },
        })
    } else {
        // Kiểm tra số lượng session active
        const activeSessionCount = await db.userSession.count({
            where: { userId, isActive: true },
        })

        // Nếu vượt quá max, xóa session cũ nhất
        if (activeSessionCount >= settings.maxSessions) {
            const oldestSessions = await db.userSession.findMany({
                where: { userId, isActive: true },
                orderBy: { lastActivity: 'asc' },
                take: activeSessionCount - settings.maxSessions + 1,
            })

            await db.userSession.updateMany({
                where: {
                    id: { in: oldestSessions.map(s => s.id) },
                },
                data: {
                    isActive: false,
                    logoutAt: new Date(),
                },
            })
        }
    }

    // Tạo session mới
    return db.userSession.create({
        data: {
            userId,
            jwtTokenId: tokenId,
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            userAgent: deviceInfo.userAgent,
            ipAddress,
            isActive: true,
            isCurrentSession: true,
        },
    })
}

/**
 * Validate session còn active không
 */
export async function validateSession(userId: string, tokenId: string) {
    const session = await db.userSession.findFirst({
        where: {
            userId,
            jwtTokenId: tokenId,
            isActive: true,
        },
        include: {
            user: {
                include: { role: true }
            }
        }
    })

    if (!session) {
        return { valid: false, user: null }
    }

    // Cập nhật last_activity
    await db.userSession.update({
        where: { id: session.id },
        data: { lastActivity: new Date() },
    })

    return {
        valid: true,
        user: session.user,
        sessionId: session.id,
    }
}

/**
 * Deactivate một session cụ thể
 */
export async function deactivateSession(tokenId: string) {
    return db.userSession.updateMany({
        where: { jwtTokenId: tokenId },
        data: {
            isActive: false,
            logoutAt: new Date(),
        },
    })
}

/**
 * Deactivate một session bằng session id
 */
export async function deactivateSessionById(sessionId: string, userId: string) {
    return db.userSession.updateMany({
        where: {
            id: sessionId,
            userId, // Đảm bảo user chỉ logout session của mình
        },
        data: {
            isActive: false,
            logoutAt: new Date(),
        },
    })
}

/**
 * Logout tất cả session trừ session hiện tại
 */
export async function deactivateAllOtherSessions(userId: string, currentTokenId: string) {
    return db.userSession.updateMany({
        where: {
            userId,
            isActive: true,
            jwtTokenId: { not: currentTokenId },
        },
        data: {
            isActive: false,
            logoutAt: new Date(),
        },
    })
}

/**
 * Lấy danh sách sessions đang active của user
 */
export async function getActiveSessions(userId: string) {
    return db.userSession.findMany({
        where: {
            userId,
            isActive: true,
        },
        orderBy: { lastActivity: 'desc' },
        select: {
            id: true,
            deviceName: true,
            deviceType: true,
            browser: true,
            os: true,
            ipAddress: true,
            loginAt: true,
            lastActivity: true,
            isCurrentSession: true,
        },
    })
}

/**
 * Lấy session settings của user
 */
export async function getSessionSettings(userId: string) {
    let settings = await db.userSessionSettings.findUnique({
        where: { userId },
    })

    if (!settings) {
        settings = await db.userSessionSettings.create({
            data: { userId },
        })
    }

    return settings
}

/**
 * Cập nhật session settings
 */
export async function updateSessionSettings(
    userId: string,
    data: {
        maxSessions?: number
        sessionTimeoutHours?: number
        allowMultipleDevices?: boolean
        notifyNewLogin?: boolean
        autoLogoutInactive?: boolean
    }
) {
    return db.userSessionSettings.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
    })
}
