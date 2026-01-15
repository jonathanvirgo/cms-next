import { z } from 'zod'
import { FormConfig } from './types'

export const categoryFormConfig: FormConfig = {
    modelName: 'Category',
    title: 'Category Management',
    description: 'Manage post categories',
    fields: [
        {
            name: 'name',
            label: 'Category Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Technology, Business',
        },
        {
            name: 'slug',
            label: 'URL Slug',
            type: 'text',
            required: true,
            placeholder: 'technology',
            description: 'URL-friendly version of the name (lowercase, no spaces)',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: false,
            placeholder: 'Describe the category...',
            rows: 3,
        },
    ],
    validation: z.object({
        name: z.string().min(1, 'Category name is required'),
        slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
        description: z.string().optional(),
    }),
}
