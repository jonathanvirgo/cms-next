import { z } from 'zod'

export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'checkbox'
    | 'select'
    | 'relation'
    | 'multi-relation'
    | 'date'
    | 'datetime'
    | 'file'
    | 'rich-text'

export interface BaseFieldConfig {
    name: string
    label: string
    type: FieldType
    required?: boolean
    placeholder?: string
    description?: string
    defaultValue?: unknown
    validation?: z.ZodType<unknown>
    hidden?: boolean
    disabled?: boolean
    className?: string
}

export interface TextFieldConfig extends BaseFieldConfig {
    type: 'text' | 'email' | 'password'
    minLength?: number
    maxLength?: number
}

export interface NumberFieldConfig extends BaseFieldConfig {
    type: 'number'
    min?: number
    max?: number
    step?: number
}

export interface TextareaFieldConfig extends BaseFieldConfig {
    type: 'textarea'
    rows?: number
}

export interface SelectFieldConfig extends BaseFieldConfig {
    type: 'select'
    options: Array<{ value: string; label: string }>
}

export interface RelationFieldConfig extends BaseFieldConfig {
    type: 'relation'
    relation: {
        model: string          // Tên model liên kết (Role, Category...)
        displayField: string   // Field để hiển thị (name, title...)
        valueField: string     // Field để lưu (id)
        dataKey: string        // Key trong formData response (roles, categories...)
    }
}

export interface MultiRelationFieldConfig extends BaseFieldConfig {
    type: 'multi-relation'
    relation: {
        model: string
        displayField: string
        valueField: string
        dataKey: string
    }
}

export interface DateFieldConfig extends BaseFieldConfig {
    type: 'date' | 'datetime'
}

export interface FileFieldConfig extends BaseFieldConfig {
    type: 'file'
    accept?: string
    maxSize?: number
}

export type FieldConfig =
    | TextFieldConfig
    | NumberFieldConfig
    | TextareaFieldConfig
    | SelectFieldConfig
    | RelationFieldConfig
    | MultiRelationFieldConfig
    | DateFieldConfig
    | FileFieldConfig
    | BaseFieldConfig

export interface FormConfig {
    modelName: string
    title: string
    description?: string
    fields: FieldConfig[]
    validation?: z.ZodObject<Record<string, z.ZodType<unknown>>>
}
