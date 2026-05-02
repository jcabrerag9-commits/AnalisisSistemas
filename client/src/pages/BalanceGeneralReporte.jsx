import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

// Orden de secciones y su naturaleza contable
const SECCIONES = [
    { tipo: 'ACTIVO',  naturaleza: 'deudora',   color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
    { tipo: 'PASIVO',  naturaleza: 'acreedora', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
    { tipo: 'CAPITAL', naturaleza: 'acreedora', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
];

const BalanceGeneralReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [data, setData]           = useState(null);   // null = sin consulta
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [anios, setAnios]         = useState([]);

    const MESES = [
        { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
    ];

    const contentRef = useRef(null);
    const handlePrint = () => window.print();

    useEffect(() => {
        const fetchAnios = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reportes/libro-diario/anios');
                setAnios(res.data);
            } catch (err) {
                console.error('Error al obtener los años:', err);
            }
        };
        fetchAnios();
    }, []);

    const handleGenerar = async () => {
        if (!anio) {
            setError('Debe seleccionar un año.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const params = { anio };
            if (mes) params.mes = mes;
            const res = await axios.get('http://localhost:5000/api/reportes/balance-general', { params });
            setData(res.data);
        } catch (err) {
            const textoError = err.response?.data?.error || err.message;
            setError(`Error al consultar el reporte: ${textoError}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Agrupar filas por TIPO_CUENTA ──
    const secciones = data
        ? SECCIONES.map(sec => {
            const cuentasRaw = data.filter(row => row.TIPO_CUENTA?.toUpperCase() === sec.tipo);
            // Agrupar por cuenta
            const cuentasMap = cuentasRaw.reduce((acc, row) => {
                const key = row.CODIGO_CUENTA;
                if (!acc[key]) {
                    acc[key] = {
                        codigo: row.CODIGO_CUENTA,
                        nombre: row.NOMBRE_CUENTA,
                        saldo: 0,
                    };
                }
                // Saldo según naturaleza
                const debe  = parseFloat(row.TOTAL_DEBE)  || 0;
                const haber = parseFloat(row.TOTAL_HABER) || 0;
                acc[key].saldo += sec.naturaleza === 'deudora'
                    ? debe - haber
                    : haber - debe;
                return acc;
            }, {});

            const cuentas = Object.values(cuentasMap)
                .filter(c => c.saldo !== 0)
                .sort((a, b) => a.codigo.localeCompare(b.codigo));

            const total = cuentas.reduce((s, c) => s + c.saldo, 0);

            return { ...sec, cuentas, total };
        })
        : [];

    const totalActivo     = secciones.find(s => s.tipo === 'ACTIVO')?.total    || 0;
    const totalPasivo     = secciones.find(s => s.tipo === 'PASIVO')?.total    || 0;
    const totalPatrimonio = secciones.find(s => s.tipo === 'PATRIMONIO')?.total || 0;
    const totalPasivoPatrimonio = totalPasivo + totalPatrimonio;
    const cuadra = Math.abs(totalActivo - totalPasivoPatrimonio) < 0.01;

    const fmt = (n) =>
        n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const labelPeriodo = mes
        ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}`
        : `Año ${anio}`;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 print:shadow-none print:rounded-none print:bg-white">

            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                    Reporte de Balance General
                </h2>
            </div>

            {/* ── Filtros ── */}
            <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200 mb-3 print:hidden">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Filtros de consulta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <Select
                        label="Año *"
                        name="anio"
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        options={anios}
                    />
                    <Select
                        label="Mes (opcional — acumulado hasta ese mes)"
                        name="mes"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        options={MESES}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar Balance General'}
                    </Button>
                    {data && data.length > 0 && (
                        <Button variant="secondary" onClick={handlePrint}>
                            Exportar a PDF / Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="mx-8 mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 print:hidden">
                    {error}
                </div>
            )}

            {/* ── Loading ── */}
            {isLoading && (
                <div className="flex justify-center py-12 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* ── Sin resultados ── */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-8 mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-2 print:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 2.99-1.742 2.99H3.481c-1.53 0-2.493-1.656-1.742-2.99l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span>No existen registros contables validados para el período seleccionado.</span>
                </div>
            )}

            {/* ── Contenido del reporte ── */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="px-8 pb-8 print:px-4 print:pb-4">

                    {/* Encabezado de impresión */}
                    <div className="hidden print:block text-center mb-8 pt-4">
                        <h2 className="text-xl font-bold text-slate-900">Balance General</h2>
                        <p className="text-sm text-slate-600">Período: {labelPeriodo}</p>
                        <p className="text-xs italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                    </div>


                    {/* Indicador de cuadre */}
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 print:hidden ${
                        cuadra
                            ? 'bg-green-50 text-green-800 border border-green-300'
                            : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                        {cuadra
                            ? '✅ El Balance cuadra correctamente — Activo = Pasivo + Patrimonio'
                            : `⚠️ El Balance NO cuadra — Diferencia: Q ${fmt(Math.abs(totalActivo - totalPasivoPatrimonio))}`
                        }
                    </div>

                    {/* Layout dos columnas: izquierda ACTIVO | derecha PASIVO + PATRIMONIO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">

                        {/* ── Columna izquierda: ACTIVO ── */}
                        <div>
                            {secciones.filter(s => s.tipo === 'ACTIVO').map(sec => (
                                <SeccionBalance key={sec.tipo} sec={sec} fmt={fmt} />
                            ))}
                        </div>

                        {/* ── Columna derecha: PASIVO + PATRIMONIO ── */}
                        <div className="flex flex-col gap-6">
                            {secciones.filter(s => s.tipo !== 'ACTIVO').map(sec => (
                                <SeccionBalance key={sec.tipo} sec={sec} fmt={fmt} />
                            ))}

                            {/* Total Pasivo + Patrimonio */}
                            <div className="border-2 border-slate-800 rounded-lg p-4 bg-slate-50">
                                <div className="flex justify-between items-center font-bold text-slate-900 text-base">
                                    <span>TOTAL PASIVO + PATRIMONIO</span>
                                    <span className="font-mono text-slate-900">Q {fmt(totalPasivoPatrimonio)}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Fila de gran total al fondo */}
                    <div className="mt-6 grid grid-cols-2 gap-6 print:gap-4">
                        <div className="border-2 border-blue-800 rounded-lg p-4 bg-blue-50">
                            <div className="flex justify-between items-center font-bold text-blue-900 text-base">
                                <span>TOTAL ACTIVO</span>
                                <span className="font-mono text-blue-900">Q {fmt(totalActivo)}</span>
                            </div>
                        </div>

                        <div className={`rounded-lg p-4 text-center font-bold text-sm ${
                            cuadra ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {cuadra ? '✓ Cuadre verificado' : '✗ Revisar asientos'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Componente de sección (ACTIVO / PASIVO / PATRIMONIO) ──
const SeccionBalance = ({ sec, fmt }) => (
    <div
        className="border rounded-lg overflow-hidden"
        style={{ borderColor: sec.border }}
    >
        {/* Cabecera de sección */}
        <div
            className="px-4 py-3 font-bold text-base"
            style={{ background: sec.bg, color: sec.color, borderBottom: `2px solid ${sec.border}` }}
        >
            {sec.tipo}
        </div>

        {/* Tabla de cuentas */}
        <table className="w-full border-collapse text-sm">
            <thead>
                <tr style={{ background: sec.bg }}>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">Código</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">Cuenta</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600 border-b border-slate-200">Saldo</th>
                </tr>
            </thead>
            <tbody>
                {sec.cuentas.map((cuenta) => (
                    <tr
                        key={cuenta.codigo}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                    >
                        <td className="px-3 py-2 font-mono text-xs text-slate-500">{cuenta.codigo}</td>
                        <td className="px-3 py-2 text-slate-700">{cuenta.nombre}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {fmt(cuenta.saldo)}
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr style={{ background: sec.bg, borderTop: `2px solid ${sec.border}` }}>
                    <td colSpan={2} className="px-3 py-3 font-bold text-right" style={{ color: sec.color }}>
                        TOTAL {sec.tipo}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold" style={{ color: sec.color }}>
                        Q {fmt(sec.total)}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
);

export default BalanceGeneralReporte;
