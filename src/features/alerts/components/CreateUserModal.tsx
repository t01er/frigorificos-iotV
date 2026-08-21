import DynamicModal, { type FieldConfig } from "../../../components/ux/DynamicModal"; 
import { useCreateCorreoNestleMutation } from "../services/alertsApi"; 

interface CreateUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

export default function CreateUserModal({
    isOpen,
    onOpenChange,
    onSuccess,
}: CreateUserModalProps) {
    const [createCorreo, { isLoading }] = useCreateCorreoNestleMutation();

    const fields: FieldConfig[] = [
        {
            name: "correo_nombre",
            label: "Nombre",
            type: "text",
            required: true,
            placeholder: "Ingresa el nombre del usuario",
            colSpan: 2,
        },
        {
            name: "correo_email",
            label: "Correo Electrónico",
            type: "email",
            required: true,
            placeholder: "usuario@ejemplo.com",
            colSpan: 1,
        },
        {
            name: "correo_telefono",
            label: "Teléfono",
            type: "text",
            required: true,
            placeholder: "Ingresa el número de teléfono",
            colSpan: 1,
        },       
    ];

    const initialValues = {
        correo_nombre: "",
        correo_email: "",
        correo_telefono: "",
        correo_empresa: "9", 
    };

    const handleSubmit = async (data: Record<string, any>) => {
        try {
            await createCorreo({
                correo_email: data.correo_email,
                correo_empresa: data.correo_empresa,
                correo_nombre: data.correo_nombre,
                correo_telefono: data.correo_telefono,
            }).unwrap();

            onSuccess?.();
            
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    };

    return (
        <DynamicModal
            isOpen={isOpen}            
            onOpenChange={onOpenChange}
            title="Crear Nuevo Usuario"
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Crear Usuario"
            cancelLabel="Cancelar"
            isLoading={isLoading}
            size="xl"
        />
    );
}