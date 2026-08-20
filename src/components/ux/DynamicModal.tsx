import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Form
} from "@heroui/react";
import { useState, useEffect, type ReactNode } from "react";


export interface FieldOption {
    value: string | number;
    label: string;
}

export interface FieldConfig {
    name: string;
    label: string;
    type?: "text" | "number" | "password" | "email" | "select" | "textarea" | "date";
    options?: FieldOption[];
    multiple?: boolean;
    colSpan?: 1 | 2;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: any) => void;
}

export interface DynamicModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
    fields: FieldConfig[];
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "xs" | "3xl" | "4xl" | "5xl";
    initialValues?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    children?: ReactNode;
    submitLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}


const renderField = (
    field: FieldConfig,
    form: Record<string, any>,
    handleChange: (field: FieldConfig, value: any) => void,
    errors: Record<string, string>
) => {
    switch (field.type) {
        case "select":
            return (
                <Select
                    key={field.name}
                    label={field.label}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    selectionMode={field.multiple ? "multiple" : "single"}
                    selectedKeys={
                        field.multiple
                            ? new Set(form[field.name] || [])
                            : form[field.name]
                                ? new Set([String(form[field.name])])
                                : new Set()
                    }
                    onSelectionChange={(keys) => {
                        const values = Array.from(keys);
                        handleChange(field, field.multiple ? values : values[0]);
                    }}
                    placeholder={field.placeholder}
                    isDisabled={field.disabled}
                    isRequired={field.required}
                >
                    {(field.options || []).map((opt) => (
                        <SelectItem key={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </Select>
            );

        case "textarea":
            return (
                <Textarea
                    key={field.name}
                    label={field.label}
                    value={form[field.name] || ""}
                    onValueChange={(val) => handleChange(field, val)}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    placeholder={field.placeholder}
                    isDisabled={field.disabled}
                    isRequired={field.required}
                />
            );

        default:
            return (
                <Input
                    key={field.name}
                    label={field.label}
                    value={form[field.name] || ""}
                    onValueChange={(val) => handleChange(field, val)}
                    type={field.type || "text"}
                    isInvalid={!!errors[field.name]}
                    errorMessage={errors[field.name]}
                    autoComplete={field.type === "password" ? "new-password" : "on"}
                    placeholder={field.placeholder}
                    isDisabled={field.disabled}
                    isRequired={field.required}
                />
            );
    }
};


export default function DynamicModal({
    isOpen,
    onOpenChange,
    title = "Formulario",
    fields = [],
    size = "md",
    initialValues = {},
    onSubmit,
    children,
    submitLabel = "Guardar",
    cancelLabel = "Cancelar",
    isLoading = false
}: DynamicModalProps) {
    const [form, setForm] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setForm(initialValues);
    }, [initialValues]);

    const handleChange = (field: FieldConfig, value: any) => {
        setForm((prev) => ({ ...prev, [field.name]: value }));

        setErrors((prev) => {
            const { [field.name]: _, ...rest } = prev;
            return rest;
        });

        field.onChange?.(value);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await onSubmit(form);
            onOpenChange(false);
            setErrors({});
        } catch (err: any) {
            const validacionesDeCampos =
                err?.errors ||
                err?.fields ||
                err?.response?.data?.errors ||
                err?.data?.errors ||
                {};

            if (err?.message && typeof err.message === 'string') {
                setErrors({
                    ...validacionesDeCampos,
                    _general: err.message
                });
            } else {
                setErrors(validacionesDeCampos);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormLoading = isLoading || isSubmitting;

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            size={size}
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>

                <ModalBody>
                    <div className="grid grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}
                            >
                                {renderField(field, form, handleChange, errors)}
                            </div>
                        ))}
                    </div>

                    {errors._general && (
                        <div className="text-danger text-sm mt-2">
                            {errors._general}
                        </div>
                    )}

                    {children}
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="light"
                        onPress={() => onOpenChange(false)}
                        isDisabled={isFormLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={isFormLoading}
                        isDisabled={isFormLoading}
                    >
                        {submitLabel}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}