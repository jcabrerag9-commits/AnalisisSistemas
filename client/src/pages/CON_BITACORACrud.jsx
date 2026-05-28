import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGlobalFilter } from '../hooks/useGlobalFilter';
import GlobalSearchBar from '../components/GlobalSearchBar';

// Mapeo de claves técnicas a nombres legibles
const LABELS = {
    PER_PERIODO: 'ID Período',
    PER_AÑO: 'Año',
    PER_MES: 'Mes',
    ESTADO_ANTERIOR: 'Estado anterior',
    MOTIVO_REPROCESO: 'Motivo',
    ASI_ASIENTO: 'ID Asiento',
    CUE_CUENTA: 'Cuenta',
    USU_USUARIO: 'Usuario',
    ASIENTO_ANULADO: 'Asiento Anulado',
    ASIENTO_REVERSION: 'Asiento Reversión',
    MOTIVO: 'Motivo',
    FECHA_ANULACION: 'Fecha de Anulación',
    GLOSA_ORIGINAL: 'Glosa Original'
};

const TABLAS = {
    CON_PERIODO: 'Período',
    CON_ASIENTO: 'Asiento',
    CON_ASIENTO_DETALLE: 'Detalle de Asiento',
    CON_CUENTA: 'Cuenta',
    CON_USUARIO: 'Usuario',
    CON_ROL: 'Rol',
    CON_USUARIO_ROL: 'Rol Usuario',
    CON_MONEDA: 'Moneda',
    CON_IMPUESTO: 'Impuesto',
    CON_TIPO_CAMBIO: 'Tipo de Cambio',
    CON_CENTRO_COSTO: 'Centro de Costo',
    CON_BITACORA: 'Bitácora',
};

const NOMBRES_MESES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

// Convierte el JSON crudo a tarjetitas legibles
const DatosPreviosDisplay = ({ raw, catalogos }) => {
    if (!raw) return <span className="text-zinc-400 italic text-sm">Sin datos</span>;

    let parsed;
    try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return <span className="text-zinc-600 text-sm whitespace-pre-wrap">{raw}</span>;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return <span className="text-zinc-600 text-sm">{String(parsed)}</span>;
    }

    const resolverNombreEstado = (key, value) => {
        const cleanValue = typeof value === 'string' ? value.trim() : value;

        if (key === 'ESTADO_ANTERIOR' || key === 'ESP_ESTADO_PERIODO') {
            const estado = catalogos.periodo.find(e => e.ESP_ESTADO_PERIODO == cleanValue);
            return estado ? estado.ESP_NOMBRE : value;
        }

        if (key === 'ESA_ESTADO_ASIENTO') {
            const estado = catalogos.asiento.find(e => e.ESA_ESTADO_ASIENTO == cleanValue);
            return estado ? estado.ESA_NOMBRE : value;
        }

        return value;
    };

    return (
        <div className="flex flex-col gap-1">
            {Object.entries(parsed).map(([key, value]) => {
                const label = LABELS[key] || key;
                let displayValue = key === 'PER_MES'
                    ? `${NOMBRES_MESES[value] || value} (${value})`
                    : String(value);

                // Intentar resolver nombres de estados
                if (['ESTADO_ANTERIOR', 'ESA_ESTADO_ASIENTO', 'ESP_ESTADO_PERIODO'].includes(key)) {
                    displayValue = resolverNombreEstado(key, value);
                }

                return (
                    <div key={key} className="flex gap-2 items-baseline">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                            {label}:
                        </span>
                        <span className="text-xs text-zinc-700">
                            {displayValue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Badge de color según la acción
const AccionBadge = ({ accion }) => {
    const colores = {
        INSERT: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        UPDATE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        DELETE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        REPROCESO: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        ANULACION: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    const color = colores[accion] || { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' };
    return (
        <span className={`${color.bg} ${color.text} ${color.border} border px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide inline-flex items-center`}>
            {accion}
        </span>
    );
};

const CON_BITACORACrud = () => {
    const [data, setData] = useState([]);
    // Catálogos para traducción de estados
    const [catalogos, setCatalogos] = useState({ asiento: [], periodo: [] });

    const API_URL = 'http://localhost:5000/api/con-bitacora';

    useEffect(() => {
        fetchData();
        fetchCatalogos();
    }, []);

    const fetchCatalogos = async () => {
        try {
            const [resAsiento, resPeriodo] = await Promise.all([
                axios.get('http://localhost:5000/api/con-estado-asiento'),
                axios.get('http://localhost:5000/api/con-estado-periodo')
            ]);
            setCatalogos({ asiento: resAsiento.data, periodo: resPeriodo.data });
        } catch (err) { console.error('Error cargando catálogos:', err); }
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const { filterText, setFilterText, filteredData } = useGlobalFilter(data, ['BIT_BITACORA', 'USU_USER', 'USU_USUARIO', 'BIT_TABLA_AFECTADA', 'BIT_ACCION', 'BIT_FECHA_HORA', 'BIT_DATOS_PREVIOS']);

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Bitácora de Eventos</h2>
            <p className="text-sm text-zinc-500 mb-6">Auditoría y control de cambios en el sistema.</p>

            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <GlobalSearchBar filterText={filterText} setFilterText={setFilterText} filteredCount={filteredData.length} totalCount={data.length} />
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide w-16">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Usuario</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tabla / Acción</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Fecha y Hora</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Datos / Contexto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredData.map((item) => (
                                    <tr key={item.BIT_BITACORA} className="bg-white hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 text-xs font-mono text-zinc-600">#{item.BIT_BITACORA}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">
                                            <div className="font-semibold text-zinc-900">{item.USU_USER || 'Sistema'}</div>
                                            <div className="text-[11px] text-zinc-400 uppercase tracking-tighter">ID: {item.USU_USUARIO}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">
                                            <div className="mb-2">
                                                <span className="font-medium block">
                                                    {TABLAS[item.BIT_TABLA_AFECTADA] || item.BIT_TABLA_AFECTADA}
                                                </span>
                                            </div>
                                            <AccionBadge accion={item.BIT_ACCION} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-700 whitespace-nowrap">
                                            {item.BIT_FECHA_HORA
                                                ? new Date(item.BIT_FECHA_HORA).toLocaleString('es-GT', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })
                                                : '---'}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-zinc-600 max-w-xs xl:max-w-md">
                                            <div className="bg-zinc-50 border border-zinc-100 rounded p-3 overflow-y-auto max-h-40">
                                                <DatosPreviosDisplay raw={item.BIT_DATOS_PREVIOS} catalogos={catalogos} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && (
                        <div className="px-4 py-10 text-center text-zinc-400 text-sm">
                            No se encontraron registros en la bitácora. Prueba ajustando los filtros de búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CON_BITACORACrud;
