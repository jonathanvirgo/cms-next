import { z } from 'zod'
import { FormConfig } from './types'

export const tagFormConfig: FormConfig = {
    modelName: 'Tag',
    title: 'Tag Management',
    description: 'Manage tags for posts',
    fields: [
        {
            name: 'name',
            label: 'Tag Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., React, Next.js',
        },
        {
            name: 'slug',
            label: 'URL Slug',
            type: 'text',
            required: true,
            placeholder: 'react',
            description: 'URL-friendly version of the name',
        },
    ],
    validation: z.object({
        name: z.string().min(1, 'Tag name is required'),
        slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
    }),
}
