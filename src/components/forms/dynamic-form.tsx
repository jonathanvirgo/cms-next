'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    FormConfig,
    FieldConfig,
    RelationFieldConfig,
    MultiRelationFieldConfig,
    SelectFieldConfig,
    TextareaFieldConfig,
    DateFieldConfig,
    FileFieldConfig,
    RichTextFieldConfig,
} from '@/lib/form-configs'
import { Loader2, CalendarIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useRef, useState } from 'react'

interface DynamicFormProps {
    config: FormConfig
    onSubmit: (data: Record<string, unknown>) => void | Promise<void>
    defaultValues?: Record<string, unknown>
    formData?: Record<string, Array<{ id: string; name: string }>>
    submitLabel?: string
    isLoading?: boolean
    isFormDataLoading?: boolean
}

export function DynamicForm({
    config,
    onSubmit,
    defaultValues,
    formData,
    submitLabel = 'Save',
    isLoading = false,
    isFormDataLoading = false,
}: DynamicFormProps) {
    const form = useForm({
        resolver: config.validation ? zodResolver(config.validation) : undefined,
        defaultValues: defaultValues || getDefaultValues(config),
    })

    const renderField = (field: FieldConfig) => {
        if (field.hidden) return null

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled || isLoading}
                                        {...formField}
                                        value={formField.value as string || ''}
                                    />
                                </FormControl>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'number':
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder={field.placeholder}
                                        disabled={field.disabled || isLoading}
                                        {...formField}
                                        onChange={(e) => formField.onChange(Number(e.target.value))}
                                        value={formField.value as number || ''}
                                    />
                                </FormControl>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'textarea':
                const textareaField = field as TextareaFieldConfig
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={field.placeholder}
                                        rows={textareaField.rows || 5}
                                        disabled={field.disabled || isLoading}
                                        {...formField}
                                        value={formField.value as string || ''}
                                    />
                                </FormControl>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'checkbox':
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", field.className)}>
                                <FormControl>
                                    <Checkbox
                                        checked={formField.value as boolean}
                                        onCheckedChange={formField.onChange}
                                        disabled={field.disabled || isLoading}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>{field.label}</FormLabel>
                                    {field.description && (
                                        <FormDescription>{field.description}</FormDescription>
                                    )}
                                </div>
                            </FormItem>
                        )}
                    />
                )

            case 'select':
                const selectField = field as SelectFieldConfig
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <Select
                                    onValueChange={formField.onChange}
                                    defaultValue={formField.value as string}
                                    disabled={field.disabled || isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={field.placeholder || 'Select an option'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectField.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'relation':
                return <RelationField key={field.name} field={field as RelationFieldConfig} form={form} formData={formData} isLoading={isFormDataLoading || isLoading} />

            case 'multi-relation':
                return <MultiRelationField key={field.name} field={field as MultiRelationFieldConfig} form={form} formData={formData} isLoading={isFormDataLoading || isLoading} />

            case 'date':
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={cn("flex flex-col", field.className)}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !formField.value && "text-muted-foreground"
                                                )}
                                                disabled={field.disabled || isLoading}
                                            >
                                                {formField.value ? (
                                                    format(new Date(formField.value as string), "PPP")
                                                ) : (
                                                    <span>{field.placeholder || "Pick a date"}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formField.value ? new Date(formField.value as string) : undefined}
                                            onSelect={(date) => formField.onChange(date?.toISOString())}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'datetime':
                const dateField = field as DateFieldConfig
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={cn("flex flex-col", field.className)}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "flex-1 pl-3 text-left font-normal",
                                                        !formField.value && "text-muted-foreground"
                                                    )}
                                                    disabled={dateField.disabled || isLoading}
                                                >
                                                    {formField.value ? (
                                                        format(new Date(formField.value as string), "PPP HH:mm")
                                                    ) : (
                                                        <span>{dateField.placeholder || "Pick date and time"}</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formField.value ? new Date(formField.value as string) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const current = formField.value ? new Date(formField.value as string) : new Date()
                                                        date.setHours(current.getHours(), current.getMinutes())
                                                        formField.onChange(date.toISOString())
                                                    }
                                                }}
                                                initialFocus
                                            />
                                            <div className="p-3 border-t">
                                                <Input
                                                    type="time"
                                                    value={formField.value ? format(new Date(formField.value as string), "HH:mm") : ""}
                                                    onChange={(e) => {
                                                        const [hours, minutes] = e.target.value.split(':').map(Number)
                                                        const date = formField.value ? new Date(formField.value as string) : new Date()
                                                        date.setHours(hours, minutes)
                                                        formField.onChange(date.toISOString())
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {dateField.description && (
                                    <FormDescription>{dateField.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'file':
                const fileField = field as FileFieldConfig
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label
                                                htmlFor={`file-${field.name}`}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer",
                                                    "hover:bg-muted transition-colors",
                                                    "text-sm font-medium"
                                                )}
                                            >
                                                <Upload className="h-4 w-4" />
                                                {fileField.multiple ? 'Choose files' : 'Choose file'}
                                            </label>
                                            <input
                                                id={`file-${field.name}`}
                                                type="file"
                                                accept={fileField.accept}
                                                multiple={fileField.multiple}
                                                className="hidden"
                                                disabled={field.disabled || isLoading}
                                                onChange={(e) => {
                                                    const files = e.target.files
                                                    if (files) {
                                                        if (fileField.multiple) {
                                                            formField.onChange(Array.from(files))
                                                        } else {
                                                            formField.onChange(files[0] || null)
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        {formField.value && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>
                                                    {Array.isArray(formField.value)
                                                        ? `${(formField.value as File[]).length} file(s) selected`
                                                        : (formField.value as File).name
                                                    }
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => formField.onChange(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                {field.description && (
                                    <FormDescription>{field.description}</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'rich-text':
                const richTextField = field as RichTextFieldConfig
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className={field.className}>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={field.placeholder || 'Enter rich text content...'}
                                        disabled={field.disabled || isLoading}
                                        {...formField}
                                        value={formField.value as string || ''}
                                        style={{ minHeight: richTextField.minHeight || 200 }}
                                        className="font-mono"
                                    />
                                </FormControl>
                                {field.description && (
                                    <FormDescription>
                                        {field.description}
                                        <span className="text-xs text-muted-foreground ml-1">
                                            (Markdown supported)
                                        </span>
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            default:
                return null
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {config.fields.map((field) => renderField(field))}

                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

// Helper function to get default values from config
function getDefaultValues(config: FormConfig): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}
    config.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue
        } else if (field.type === 'checkbox') {
            defaults[field.name] = false
        } else if (field.type === 'multi-relation') {
            defaults[field.name] = []
        }
    })
    return defaults
}

// Relation field component
interface RelationFieldProps {
    field: RelationFieldConfig
    form: ReturnType<typeof useForm>
    formData?: Record<string, Array<{ id: string; name: string }>>
    isLoading?: boolean
}

function RelationField({ field, form, formData, isLoading }: RelationFieldProps) {
    const options = formData?.[field.relation.dataKey] || []

    return (
        <FormField
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
                <FormItem className={field.className}>
                    <FormLabel>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <Select
                        onValueChange={formField.onChange}
                        defaultValue={formField.value as string}
                        disabled={isLoading || field.disabled}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        isLoading
                                            ? 'Loading...'
                                            : field.placeholder || `Select ${field.relation.model}`
                                    }
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem
                                    key={option[field.relation.valueField as keyof typeof option]}
                                    value={option[field.relation.valueField as keyof typeof option] as string}
                                >
                                    {option[field.relation.displayField as keyof typeof option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

// Multi-relation field component (for many-to-many)
interface MultiRelationFieldProps {
    field: MultiRelationFieldConfig
    form: ReturnType<typeof useForm>
    formData?: Record<string, Array<{ id: string; name: string }>>
    isLoading?: boolean
}

function MultiRelationField({ field, form, formData, isLoading }: MultiRelationFieldProps) {
    const options = formData?.[field.relation.dataKey] || []

    return (
        <FormField
            control={form.control}
            name={field.name}
            render={() => (
                <FormItem className={field.className}>
                    <div className="mb-4">
                        <FormLabel>
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                        {field.description && (
                            <FormDescription>{field.description}</FormDescription>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground col-span-full">Loading options...</p>
                        ) : options.length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-full">No options available</p>
                        ) : (
                            options.map((option) => (
                                <FormField
                                    key={option[field.relation.valueField as keyof typeof option]}
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: formField }) => {
                                        const values = (formField.value as string[]) || []
                                        const optionValue = option[field.relation.valueField as keyof typeof option] as string
                                        return (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={values.includes(optionValue)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? formField.onChange([...values, optionValue])
                                                                : formField.onChange(
                                                                    values.filter(
                                                                        (value: string) => value !== optionValue
                                                                    )
                                                                )
                                                        }}
                                                        disabled={isLoading || field.disabled}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {option[field.relation.displayField as keyof typeof option]}
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
