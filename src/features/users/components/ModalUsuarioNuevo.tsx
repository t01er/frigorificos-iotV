import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useRegistrarUsuarioNestleMutation,
    useRegistrarUsuarioEntelMutation,
    useActualizarUsuarioNestleMutation,
    useActualizarUsuarioEntelMutation,
    useGetPerfilesQuery,
    useGetDistribuidoresMovilQuery,
    type UserItem
} from '../services/userApi';
import DynamicModal, { type FieldConfig } from '../../../components/ux/DynamicModal';
import { Checkbox, Chip, addToast } from '@heroui/react';

interface ModalUsuarioNuevoProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChange: (isOpen: boolean) => void;
    setReloadData?: React.Dispatch<React.SetStateAction<boolean>>;
    editingUser?: UserItem | null;
    isEditing?: boolean;
    empresaId?: number;
}

export default function ModalUsuarioNuevo({
    isOpen,
    onClose,
    onOpenChange,
    setReloadData,
    editingUser = null,
    isEditing = false,
    empresaId: empresaIdProp
}: ModalUsuarioNuevoProps) {
    const [distribuidoresSeleccionados, setDistribuidoresSeleccionados] = useState<number[]>([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState<string>("");
    const user = useSelector((state: any) => state.auth.user);
    const userRole = user?.roles?.[0] || "";
    const empresaId = empresaIdProp ?? user?.id ?? 9;

    const { data: perfiles = [], isLoading: isLoadingPerfiles } = useGetPerfilesQuery(userRole);
    const { data: distribuidoresData = [], isLoading: isLoadingDistribuidores } = useGetDistribuidoresMovilQuery();

    const distribuidoresDisponibles = useMemo(() => {
        const permitidos: number[] = user?.distribuidoresPermitidos || [];
        if (permitidos.length === 0) return distribuidoresData;
        return distribuidoresData.filter((d: any) =>
            permitidos.includes(d.cod_distribuidor ?? d.id)
        );
    }, [distribuidoresData, user?.distribuidoresPermitidos]);

    const [registrarNestle, { isLoading: isSubmittingNestle }] = useRegistrarUsuarioNestleMutation();
    const [registrarEntel, { isLoading: isSubmittingEntel }] = useRegistrarUsuarioEntelMutation();
    const [actualizarNestle, { isLoading: isUpdatingNestle }] = useActualizarUsuarioNestleMutation();
    const [actualizarEntel, { isLoading: isUpdatingEntel }] = useActualizarUsuarioEntelMutation();

    const isLoading = isSubmittingNestle || isSubmittingEntel || isUpdatingNestle || isUpdatingEntel;

    const perfilesCartavio = [
        { id: "admincartavio", nombre: "ADMIN", tipo: "" },
        { id: "usuariocartavio", nombre: "USUARIO", tipo: "" },
        { id: "lectorcartavio", nombre: "LECTURA", tipo: "" },
    ];

    const perfilesSelect = empresaId === 10 ? perfilesCartavio : perfiles;

    const initialValues = useMemo(() => {
        if (isEditing && editingUser) {
            return {
                nombre: editingUser.usu_nombre || "",
                correo: editingUser.usu_correo || "",
                telefono: editingUser.usu_telefono || "",
                cargo: editingUser.usu_cargo || "",
                usuario: editingUser.usu_usuario || "",
                contrasena: "",
                perfil: editingUser.usu_tipo || "",
                estado: editingUser.usu_estado || "activo",
            };
        }
        return {
            nombre: "",
            correo: "",
            telefono: "",
            cargo: "",
            usuario: "",
            contrasena: "",
            perfil: "",
            estado: "activo",
        };
    }, [isEditing, editingUser]);

    const fields: FieldConfig[] = useMemo(() => {
        const baseFields: FieldConfig[] = [
            {
                name: "nombre",
                label: "Nombre *",
                type: "text",
                placeholder: "Ingrese el nombre completo",
                colSpan: 1,
                required: true,
            },
            {
                name: "correo",
                label: "Correo *",
                type: "email",
                placeholder: "correo@ejemplo.com",
                colSpan: 1,
                required: true,
            },
            {
                name: "telefono",
                label: "Teléfono *",
                type: "text",
                placeholder: "Ingrese el número de teléfono",
                colSpan: 1,
                required: true,
            },
            {
                name: "cargo",
                label: "Cargo *",
                type: "text",
                placeholder: "Ingrese el cargo",
                colSpan: 1,
                required: true,
            },
            {
                name: "usuario",
                label: "Usuario *",
                type: "text",
                placeholder: "Ingrese el nombre de usuario",
                colSpan: 1,
                required: true,
            },
            {
                name: "contrasena",
                label: isEditing ? "Nueva Contraseña (opcional)" : "Contraseña *",
                type: "password",
                placeholder: isEditing ? "Dejar vacío para mantener" : "Ingrese la contraseña",
                colSpan: 1,
                required: !isEditing,
            },
            {
                name: "perfil",
                label: "Perfil *",
                type: "select",
                colSpan: 1,
                required: true,
                options: perfilesSelect.map((p) => ({
                    value: p.tipo,
                    label: p.nombre,
                })),
                placeholder: "Seleccione un perfil",
                onChange: (value) => {
                    const perfilTipo = value as string;
                    setPerfilSeleccionado(perfilTipo);

                    if (perfilTipo !== "distribuidornestle") {
                        setDistribuidoresSeleccionados([]);
                    }
                }
            },
            {
                name: "estado",
                label: "Estado *",
                type: "select",
                colSpan: 1,
                required: true,
                options: [
                    { value: "activo", label: "Activo" },
                    { value: "inactivo", label: "Inactivo" },
                ],
                placeholder: "Seleccione el estado",
            },
        ];

        return baseFields;
    }, [isEditing, perfilesSelect]);

    useEffect(() => {
        if (!isOpen) return;

        if (isEditing && editingUser) {
            const perfilUsuario = editingUser.usu_tipo || "";
            setPerfilSeleccionado(perfilUsuario);
            setDistribuidoresSeleccionados(editingUser.usu_lista_distribuidores || []);
        } else {
            setPerfilSeleccionado("");
            setDistribuidoresSeleccionados([]);
        }
    }, [isOpen, isEditing, editingUser]);

    const handleSubmit = async (formData: Record<string, any>) => {
        if (!formData.nombre?.trim()) throw new Error("El nombre es obligatorio");
        if (!formData.correo?.trim()) throw new Error("El correo es obligatorio");
        if (!formData.telefono?.trim()) throw new Error("El teléfono es obligatorio");
        if (!formData.cargo?.trim()) throw new Error("El cargo es obligatorio");
        if (!formData.usuario?.trim()) throw new Error("El usuario es obligatorio");
        if (!isEditing && !formData.contrasena?.trim()) throw new Error("La contraseña es obligatoria");
        if (!formData.perfil) throw new Error("Seleccione un perfil");
        if (!formData.estado) throw new Error("Seleccione un estado");

        if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            throw new Error("Ingrese un correo válido");
        }

        const perfil = formData.perfil;
        if (perfil === "distribuidornestle" && distribuidoresSeleccionados.length === 0) {
            throw new Error("Debe seleccionar al menos un distribuidor");
        }

        try {
            if (isEditing && editingUser) {
                const payloadBase = {
                    usu_id: editingUser.usu_id,
                    usu_empresa: empresaId,
                    usu_nombre: formData.nombre,
                    usu_correo: formData.correo,
                    usu_telefono: formData.telefono,
                    usu_cargo: formData.cargo,
                    usu_usuario: formData.usuario,
                    usu_contrasena: formData.contrasena?.trim()
                        ? formData.contrasena
                        : editingUser.usu_contrasena,
                    usu_tipo: perfil,
                    usu_estado: formData.estado,
                    usu_lista_distribuidores: perfil === "distribuidornestle" ? distribuidoresSeleccionados : [],
                };

                const payloadNestle = payloadBase;

                const payloadEntel = {
                    ...payloadBase,
                    usu_usuario_original: editingUser.usu_usuario,
                };

                await Promise.all([
                    actualizarNestle(payloadNestle).unwrap(),
                    actualizarEntel(payloadEntel).unwrap(),
                ]);
            } else {
                const payload = {
                    usu_empresa: empresaId,
                    usu_nombre: formData.nombre,
                    usu_correo: formData.correo,
                    usu_telefono: formData.telefono,
                    usu_cargo: formData.cargo,
                    usu_usuario: formData.usuario,
                    usu_contrasena: formData.contrasena,
                    usu_tipo: perfil,
                    usu_estado: formData.estado,
                    usu_lista_distribuidores: perfil === "distribuidornestle" ? distribuidoresSeleccionados : [],
                };


                await Promise.all([
                    registrarNestle(payload).unwrap(),
                    registrarEntel(payload).unwrap(),
                ]);
            }

            if (setReloadData) {
                setReloadData(true);
            }

            addToast({
                title: "Éxito",
                description: `Usuario ${isEditing ? 'actualizado' : 'creado'} exitosamente ✅`,
                color: "success",
            });

            onClose();
        } catch (error: any) {
            console.error("Error en submit:", error);
            const mensajeBackend =
                error?.data?.message ||
                error?.data?.error ||
                error?.message ||
                `Error al ${isEditing ? 'actualizar' : 'crear'} el usuario.`;
            throw new Error(mensajeBackend);
        }
    };

    const handleDistribuidorToggle = (codDistribuidor: number) => {
        setDistribuidoresSeleccionados(prev => {
            if (prev.includes(codDistribuidor)) {
                return prev.filter(id => id !== codDistribuidor);
            } else {
                return [...prev, codDistribuidor];
            }
        });
    };


    return (
        <DynamicModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
            size="2xl"
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isLoading ? "Guardando..." : "Guardar"}
            cancelLabel="Cancelar"
        >
            {perfilSeleccionado === "distribuidornestle" && (
                <div className="col-span-2 mt-2">
                    <div className="border rounded-lg p-3 bg-gray-50">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Distribuidores *
                        </label>

                        <div className="max-h-60 overflow-y-auto">
                            {isLoadingDistribuidores ? (
                                <div className="text-sm text-gray-500 p-2">
                                    Cargando distribuidores...
                                </div>
                            ) : distribuidoresDisponibles.length > 0 ? (
                                distribuidoresDisponibles.map((d: any) => {
                                    const id = d.cod_distribuidor ?? d.id;
                                    const name = d.name_distribuidor || d.nombre || 'Sin nombre';
                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer"
                                            onClick={() => handleDistribuidorToggle(id)}
                                        >
                                            <Checkbox
                                                isSelected={distribuidoresSeleccionados.includes(id)}
                                                onValueChange={() => handleDistribuidorToggle(id)}
                                                size="sm"
                                            />
                                            <span className="text-sm">{name}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-gray-500 p-2">
                                    No hay distribuidores disponibles
                                </div>
                            )}
                        </div>

                        {distribuidoresSeleccionados.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">
                                    {distribuidoresSeleccionados.length} distribuidor(es) seleccionado(s):
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {distribuidoresSeleccionados.map((id) => {
                                        const dist = distribuidoresDisponibles.find(
                                            (d: any) => (d.cod_distribuidor ?? d.id) === id
                                        );
                                        const name = dist?.name_distribuidor || dist?.nombre || 'Sin nombre';
                                        return dist ? (
                                            <Chip
                                                key={id}
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onClose={() => {
                                                    setDistribuidoresSeleccionados(
                                                        distribuidoresSeleccionados.filter(
                                                            (item) => item !== id
                                                        )
                                                    );
                                                }}
                                            >
                                                {name}
                                            </Chip>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DynamicModal>
    );
}