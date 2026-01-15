import { z } from 'zod'
import { FormConfig } from './types'

export const roleFormConfig: FormConfig = {
    modelName: 'Role',
    title: 'Role Management',
    description: 'Manage user roles and permissions',
    fields: [
        {
            name: 'name',
            label: 'Role Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Admin, Editor, Viewer',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: false,
            placeholder: 'Describe the role responsibilities...',
            rows: 3,
        },
    ],
    validation: z.object({
        name: z.string().min(1, 'Role name is required'),
        description: z.string().optional(),
    }),
}
