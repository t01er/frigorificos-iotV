import React, { useState, useMemo, useEffect } from 'react';
import {
    useGetDistribuidoresQuery,
    useGetClientesQuery,
    useGetTodosClientesQuery,
    useRegistrarDispositivoMutation,
    useActualizarDispositivoMutation,
    type Distribuidor,
    type DeviceItem
} from '../services/deviceApi';
import DynamicModal, { type FieldConfig } from '../../../components/ux/DynamicModal';
import { Autocomplete, AutocompleteItem, Select, SelectItem, addToast } from '@heroui/react';

interface ModalDispositivoNuevoProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChange: (isOpen: boolean) => void;
    setReloadData?: React.Dispatch<React.SetStateAction<boolean>>;
    editingDevice?: DeviceItem | null;
    isEditing?: boolean;
}

interface ClienteOption {
    id: string;
    cliente: string;
    label: string;
}

export default function ModalDispositivoNuevo({
    isOpen,
    onClose,
    onOpenChange,
    setReloadData,
    editingDevice = null,
    isEditing = false
}: ModalDispositivoNuevoProps) {

    console.log(editingDevice)
    const [inputValue, setInputValue] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
    const [debouncedValue, setDebouncedValue] = useState("");
    const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState<string>("");

    const [registrarDispositivo, { isLoading: isSubmitting }] = useRegistrarDispositivoMutation();
    const [actualizarDispositivo, { isLoading: isUpdating }] = useActualizarDispositivoMutation();

    useEffect(() => {
        if (isOpen && isEditing && editingDevice) {
            setDistribuidorSeleccionado(editingDevice.dis_distribuidor || "");
            setClienteSeleccionado(editingDevice.dis_cliente || null);
            setInputValue(editingDevice.dis_cliente || "");
        } else if (isOpen && !isEditing) {
            setDistribuidorSeleccionado("");
            setClienteSeleccionado(null);
            setInputValue("");
        }
    }, [isOpen, isEditing, editingDevice]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue]);

    const {
        data: distribuidoresRaw,
        isLoading: isLoadingDistribuidores,
        error: distribuidoresError
    } = useGetDistribuidoresQuery();

    const {
        data: todosClientes = [],
        isLoading: isLoadingTodosClientes
    } = useGetTodosClientesQuery();

    const {
        data: clientesFiltrados = [],
        isFetching: isFetchingClientes,
        error: clientesError
    } = useGetClientesQuery(debouncedValue, {
        skip: !debouncedValue || debouncedValue.length < 2,
    });

    const clientesOptions = useMemo<ClienteOption[]>(() => {
        const filtrados = Array.isArray(clientesFiltrados)
            ? clientesFiltrados
            : (clientesFiltrados as any)?.data || [];

        const todos = Array.isArray(todosClientes)
            ? todosClientes
            : (todosClientes as any)?.data || [];

        const options = debouncedValue.length >= 2
            ? filtrados
            : todos;

        const seen = new Set<string>();

        return options
            .map((item: any, index: number): ClienteOption => ({
                id: `${item.cliente}_${index}`,
                cliente: item.cliente,
                label: item.cliente,
            }))
            .filter((item: ClienteOption) => {
                if (seen.has(item.cliente)) {
                    return false;
                }

                seen.add(item.cliente);
                return true;
            });
    }, [debouncedValue, clientesFiltrados, todosClientes]);

    const distribuidoresOptions = useMemo(() => {
        const items = Array.isArray(distribuidoresRaw)
            ? distribuidoresRaw
            : (distribuidoresRaw as any)?.data || [];

        return items.map((item: Distribuidor) => ({
            id: item.nombre,
            nombre: item.nombre,
            label: item.nombre
        }));
    }, [distribuidoresRaw]);
    useEffect(() => {
        if (clientesError) {
            addToast({
                title: "Error",
                description: "Error al cargar los clientes",
                color: "danger",
            });
        }
        if (distribuidoresError) {
            addToast({
                title: "Error",
                description: "Error al cargar los distribuidores",
                color: "danger",
            });
        }
    }, [clientesError, distribuidoresError]);

    const selectedCliente = useMemo(() => {
        return clientesOptions.find((c: { cliente: string | null; }) => c.cliente === clienteSeleccionado) || null;
    }, [clientesOptions, clienteSeleccionado]);

    const fields: FieldConfig[] = useMemo(() => [
        {
            name: "chip",
            label: "Chip",
            type: "text",
            placeholder: "Chip",
            colSpan: 1,
        },
        {
            name: "codigo",
            label: "Cód. Nevera",
            type: "text",
            placeholder: "Código de nevera",
            colSpan: 1,
            required: true,
        },
        {
            name: "imei",
            label: "IMEI",
            type: "text",
            placeholder: "IMEI",
            colSpan: 1,
        },
        {
            name: "ubigeo",
            label: "Ubigeo",
            type: "text",
            placeholder: "Ubigeo",
            colSpan: 1,
        },
        {
            name: "longitud",
            label: "Longitud",
            type: "text",
            placeholder: "Longitud",
            colSpan: 1,
        },
        {
            name: "latitud",
            label: "Latitud",
            type: "text",
            placeholder: "Latitud",
            colSpan: 1,
        },
        {
            name: "radio",
            label: "Geozona (Radio en metros)",
            type: "text",
            placeholder: "Radio en metros",
            colSpan: 1,
        },
        {
            name: "estado",
            label: "Estado",
            type: "select",
            colSpan: 1,
            options: [
                { value: 1, label: "Activo" },
                { value: 2, label: "Inactivo" }
            ],
        },
    ], []);

    const initialValues = useMemo(() => {
        if (isEditing && editingDevice) {
            return {
                chip: editingDevice.dis_imei_chip || "0",
                codigo: editingDevice.dis_cod_nevera || "",
                imei: editingDevice.dis_imei || "sin imei",
                ubigeo: editingDevice.dis_ubigeo || "",
                longitud: editingDevice.dis_longitud || "0",
                latitud: editingDevice.dis_latitud || "0",
                radio: editingDevice.dis_geozona?.toString() || "200",
                estado: editingDevice.dis_estado?.toLowerCase() === "activo" ? 1 : 2,
            };
        }
        return {
            chip: "0",
            codigo: "",
            imei: "sin imei",
            ubigeo: "",
            longitud: "0",
            latitud: "0",
            radio: "200",
            estado: 1,
        };
    }, [isEditing, editingDevice]);

    const handleSubmit = async (formData: Record<string, any>) => {
        if (!formData.codigo?.trim()) {
            throw new Error("Por favor, complete el campo Código de Nevera.");
        }
        if (!distribuidorSeleccionado) {
            throw new Error("Por favor, seleccione un Distribuidor.");
        }

        const clienteValue = selectedCliente?.cliente || "0";

        if (isEditing && editingDevice) {
            const updateData = {
                _id: editingDevice.dis_id,
                _cliente: clienteValue,
                _cod_nevera: formData.codigo.trim(),
                _distribuidor: distribuidorSeleccionado,
                _estado: parseInt(formData.estado) || 1,
                _imei: formData.imei || "sin imei",
                _imei_chip: formData.chip || "0",
                _latitud: formData.latitud || "0",
                _locacion: formData.ubigeo || "",
                _longitud: formData.longitud || "0",
                _radio: parseFloat(formData.radio || "200"),
            };

            try {
                await actualizarDispositivo(updateData).unwrap();

                if (setReloadData) {
                    setReloadData(true);
                }
                onClose();
            } catch (error: any) {
                const errorMessage = error?.data?.message ||
                    error?.data?.error ||
                    error?.message ||
                    "Error al actualizar el dispositivo.";
                throw new Error(errorMessage);
            }
        } else {
            const newDispositivo = {
                _empresa: "9",
                _locacion: formData.ubigeo || "0",
                _imei: formData.imei || "sin imei",
                _latitud: formData.latitud || "0",
                _longitud: formData.longitud || "0",
                _estado: parseInt(formData.estado) || 1,
                _cod_nevera: formData.codigo.trim(),
                _imei_chip: formData.chip || "0",
                _distribuidor: distribuidorSeleccionado,
                _cliente: clienteValue,
                _radio: parseFloat(formData.radio || "200"),
            };

            try {
                await registrarDispositivo(newDispositivo).unwrap();

                if (setReloadData) {
                    setReloadData(true);
                }
                onClose();
            } catch (error: any) {
                const errorMessage = error?.data?.message ||
                    error?.data?.error ||
                    error?.message ||
                    "Error al crear el dispositivo.";
                throw new Error(errorMessage);
            }
        }
    };

    const isLoading = isFetchingClientes || isLoadingTodosClientes || isLoadingDistribuidores;
    const isSubmittingOrUpdating = isSubmitting || isUpdating;

    const getInputValue = useMemo(() => {
        if (clienteSeleccionado && selectedCliente) {
            return selectedCliente.label;
        }
        if (isEditing && editingDevice) {
            return editingDevice.dis_cliente || "";
        }
        return inputValue;
    }, [clienteSeleccionado, selectedCliente, inputValue, isEditing, editingDevice]);

    return (
        <DynamicModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={isEditing ? "Editar Dispositivo" : "Nuevo Dispositivo"}
            size="2xl"
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isLoading={isSubmittingOrUpdating}
            submitLabel={isSubmittingOrUpdating ? "Guardando..." : "Guardar"}
            cancelLabel="Cancelar"
        >
            <div className="col-span-2 mt-2">
                <Select
                    size="sm"
                    label="Distribuidor *"
                    placeholder="Seleccione un distribuidor"
                    selectedKeys={distribuidorSeleccionado ? new Set([distribuidorSeleccionado]) : new Set()}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setDistribuidorSeleccionado(selected || "");
                    }}
                    isLoading={isLoadingDistribuidores}
                    isRequired
                >
                    {distribuidoresOptions.map((item: any) => (
                        <SelectItem key={item.id} textValue={item.label}>
                            {item.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="col-span-2 mt-2">
                <Autocomplete
                    size="sm"
                    label="Buscar Cliente"
                    placeholder="Escribe al menos 2 caracteres para buscar"
                    inputValue={getInputValue}
                    onInputChange={(value) => {
                        setInputValue(value);
                        if (value === '') {
                            setClienteSeleccionado(null);
                        }
                    }}
                    selectedKey={clienteSeleccionado}
                    onSelectionChange={(key) => {
                        setClienteSeleccionado(key as string);
                    }}
                    isLoading={isLoading}
                    defaultItems={clientesOptions}
                    allowsCustomValue={false}
                >
                    {(item) => (
                        <AutocompleteItem key={item.id} textValue={item.label}>
                            {item.label}
                        </AutocompleteItem>
                    )}
                </Autocomplete>
                {clientesOptions.length === 0 && !isLoading && inputValue.length >= 2 && (
                    <div className="text-xs text-gray-500 mt-1">
                        No se encontraron clientes con "{inputValue}"
                    </div>
                )}
                {clientesOptions.length > 0 && !isLoading && (
                    <div className="text-xs text-gray-500 mt-1">
                        {clientesOptions.length} cliente{clientesOptions.length !== 1 ? 's' : ''} encontrado{clientesOptions.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </DynamicModal>
    );
}