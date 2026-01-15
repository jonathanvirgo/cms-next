import { z } from 'zod'
import { FormConfig } from './types'

export const userFormConfig: FormConfig = {
    modelName: 'User',
    title: 'User Management',
    description: 'Manage user accounts and their role assignments',
    fields: [
        {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter user full name',
            description: 'The full name of the user',
        },
        {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'user@example.com',
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
            placeholder: '••••••••',
            minLength: 6,
            description: 'Minimum 6 characters',
        },
        {
            name: 'roleId',
            label: 'Role',
            type: 'relation',
            required: true,
            description: 'Select user role',
            relation: {
                model: 'Role',
                displayField: 'name',
                valueField: 'id',
                dataKey: 'roles',
            },
        },
        {
            name: 'isActive',
            label: 'Active Status',
            type: 'checkbox',
            defaultValue: true,
            description: 'Enable or disable user account',
        },
    ],
    validation: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        roleId: z.string().min(1, 'Role is required'),
        isActive: z.boolean(),
    }),
}

// Config for edit form (password optional)
export const userEditFormConfig: FormConfig = {
    ...userFormConfig,
    fields: userFormConfig.fields.map(field =>
        field.name === 'password'
            ? { ...field, required: false, description: 'Leave blank to keep current password' }
            : field
    ),
    validation: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
        roleId: z.string().min(1, 'Role is required'),
        isActive: z.boolean(),
    }),
}
