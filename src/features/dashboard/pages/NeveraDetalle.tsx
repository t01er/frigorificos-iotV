import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@heroui/react";
import { AltArrowRight, Buildings, Export, Hashtag, History, Smartphone } from "@solar-icons/react";
import * as XLSX from "xlsx";

import PageContainer from "../../../layouts/PageContainer";
import { useGetNeveraDetalleQuery, useGetNeverasDashboardQuery } from "../services/mapApi";
import RecorridoMapModal from "../components/RecorridoMapModal";
import CamaraCard from "../components/detalle/CamaraCard";
import TemperaturaCard from "../components/detalle/TemperaturaCard";
import ProductosCard from "../components/detalle/ProductosCard";
import NoDeseadosCard from "../components/detalle/NoDeseadosCard";
import UbicacionCard from "../components/detalle/UbicacionCard";
import {
  NEVERA_MOCK,
  PRODUCTOS_MOCK,
  estadoProducto,
} from "../mocks/neveraDetalleMock";

const toNumber = (value: unknown): number | undefined => {
  const n = parseFloat(String(value ?? ""));
  return isNaN(n) ? undefined : n;
};

export default function NeveraDetalle() {
  const { codigo = "" } = useParams();
  const [historialOpen, setHistorialOpen] = useState(false);

  const { data } = useGetNeveraDetalleQuery(codigo, { skip: !codigo });
  const nevera = data?.data;

  const { data: dashData } = useGetNeverasDashboardQuery(
    { cod_nevera: codigo, size: 1, page: 1 },
    { skip: !codigo || !!nevera?.imei },
  );
  const imei: string | undefined = nevera?.imei ?? dashData?.data?.[0]?.dis_imei;

  const distribuidor = nevera?.distribuidor ?? NEVERA_MOCK.distribuidor;
  const cliente = nevera?.cod_cliente ?? NEVERA_MOCK.cliente;

  const exportarReporte = () => {
    const filas = PRODUCTOS_MOCK.map((p) => ({
      Producto: p.nombre,
      SKU: p.sku,
      Estante: p.estante,
      Cantidad: p.cantidad,
      Planograma: p.planograma,
      Estado: estadoProducto(p),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Productos");
    XLSX.writeFile(wb, `nevera_${codigo}.xlsx`);
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <nav className="flex items-center gap-1 text-xs text-nx-text-3">
              <Link
                to="/dashboard/neveras?tab=congeladoras"
                className="hover:text-nx-text transition-colors"
              >
                Congeladoras
              </Link>
              <AltArrowRight size={12} />
              <span className="text-nx-text-2">Detalle</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-nx-text">{codigo}</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-nx-ok-soft px-2.5 py-0.5 text-xs font-medium text-nx-ok-ink">
                <span className="size-1.5 rounded-full bg-nx-ok" />
                En línea
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-nx-text-3">
              <span className="flex items-center gap-1.5">
                <Buildings size={13} /> {distribuidor}
              </span>
              <span className="flex items-center gap-1.5">
                <Hashtag size={13} /> Cliente {cliente}
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone size={13} /> {NEVERA_MOCK.modelo}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              radius="full"
              variant="bordered"
              className="border-nx-line bg-nx-surface text-nx-text font-medium"
              startContent={<History size={16} />}
              isDisabled={!imei}
              onPress={() => setHistorialOpen(true)}
            >
              Historial
            </Button>
            <Button
              radius="full"
              className="bg-nx-gradient text-white font-medium shadow-md shadow-nx-purple/25"
              startContent={<Export size={16} />}
              onPress={exportarReporte}
            >
              Exportar reporte
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] gap-4">
          <CamaraCard />
          <TemperaturaCard />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          <ProductosCard />
          <div className="flex flex-col gap-4">
            <NoDeseadosCard />
            <UbicacionCard
              lat={toNumber(nevera?.latitud)}
              lng={toNumber(nevera?.longitud)}
            />
          </div>
        </div>
      </div>

      <RecorridoMapModal
        isOpen={historialOpen}
        onClose={() => setHistorialOpen(false)}
        imei={imei ?? null}
        codNevera={codigo}
      />
    </PageContainer>
  );
}
