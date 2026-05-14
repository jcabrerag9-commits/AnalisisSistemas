import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const SECCIONES = [
    { tipo: 'ACTIVO',  naturaleza: 'deudora',   color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
    { tipo: 'PASIVO',  naturaleza: 'acreedora', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
    { tipo: 'CAPITAL', naturaleza: 'acreedora', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
];

const BalanceGeneralReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [data, setData]           = useState(null);
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

    // ── Agrupar filas por GRUPO_PRINCIPAL → SUBTIPO_CUENTA (ambos vienen del backend) ──
    const secciones = data
        ? SECCIONES.map(sec => {
            const cuentasRaw = data.filter(row =>
                (row.GRUPO_PRINCIPAL || '').toUpperCase() === sec.tipo
            );

            // Consolidar debe/haber por cuenta
            const cuentasMap = cuentasRaw.reduce((acc, row) => {
                const key = row.CODIGO_CUENTA;
                if (!acc[key]) {
                    acc[key] = {
                        codigo:    row.CODIGO_CUENTA,
                        nombre:    row.NOMBRE_CUENTA,
                        subtipo:   row.SUBTIPO_CUENTA || sec.tipo,
                        debe:  0,
                        haber: 0,
                        saldo: 0,
                    };
                }
                const debe  = parseFloat(row.TOTAL_DEBE)  || 0;
                const haber = parseFloat(row.TOTAL_HABER) || 0;
                acc[key].debe  += debe;
                acc[key].haber += haber;
                acc[key].saldo += sec.naturaleza === 'deudora'
                    ? debe - haber
                    : haber - debe;
                return acc;
            }, {});

            const cuentas = Object.values(cuentasMap)
                .filter(c => c.saldo !== 0 || c.debe !== 0 || c.haber !== 0)
                .sort((a, b) => a.codigo.localeCompare(b.codigo));

            // Sub-agrupar por SUBTIPO_CUENTA (viene directo del backend — no guessing)
            const subgruposMap = {};
            cuentas.forEach(c => {
                const sub = c.subtipo;
                if (!subgruposMap[sub]) {
                    subgruposMap[sub] = { nombre: sub, cuentas: [], totalDebe: 0, totalHaber: 0, totalSaldo: 0 };
                }
                subgruposMap[sub].cuentas.push(c);
                subgruposMap[sub].totalDebe  += c.debe;
                subgruposMap[sub].totalHaber += c.haber;
                subgruposMap[sub].totalSaldo += c.saldo;
            });

            // Orden canónico de sub-tipos
            const ORDEN_SUBTIPOS = {
                'Activo Circulante': 1, 'Activo Fijo': 2, 'Activo Diferido': 3,
                'Pasivo Circulante': 1, 'Pasivo Fijo': 2, 'Pasivo Diferido': 3,
                'Capital': 1, 'Patrimonio': 1,
                'Activo': 0, 'Pasivo': 0,
            };

            const subgrupos = Object.values(subgruposMap).sort((a, b) =>
                (ORDEN_SUBTIPOS[a.nombre] ?? 99) - (ORDEN_SUBTIPOS[b.nombre] ?? 99)
                || a.nombre.localeCompare(b.nombre)
            );

            const total = cuentas.reduce((s, c) => s + c.saldo, 0);

            return { ...sec, subgrupos, total };
        })
        : [];

    const totalActivo          = secciones.find(s => s.tipo === 'ACTIVO')?.total  || 0;
    const totalPasivo          = secciones.find(s => s.tipo === 'PASIVO')?.total  || 0;
    const totalPatrimonio      = secciones.find(s => s.tipo === 'CAPITAL')?.total || 0;
    const totalPasivoPatrimonio = totalPasivo + totalPatrimonio;
    const cuadra = Math.abs(totalActivo - totalPasivoPatrimonio) < 0.01;

    const fmt = (n) =>
        n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const labelPeriodo = mes
        ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}`
        : `Año ${anio}`;

    return (
        <div className="bg-white border border-zinc-200 rounded-lg print:shadow-none print:rounded-none print:border-none">

            {/* ── Header / Filtros ── */}
            <div className="px-6 py-5 border-b border-zinc-200 print:hidden">
                <h2 className="text-xl font-semibold text-zinc-900 mb-4 print:hidden">
                    Reporte de Balance General
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                <div className="flex items-center justify-end gap-3">
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
                <div className="mx-6 my-3 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm print:hidden">
                    {error}
                </div>
            )}

            {/* ── Loading ── */}
            {isLoading && (
                <div className="flex justify-center py-16 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* ── Sin resultados ── */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-6 my-3 px-4 py-3 rounded border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-center gap-2 print:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 2.99-1.742 2.99H3.481c-1.53 0-2.493-1.656-1.742-2.99l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span>No existen registros contables validados para el período seleccionado.</span>
                </div>
            )}

            {/* ── Contenido del reporte ── */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="max-w-3xl mx-auto px-6 pb-8 print:px-0 print:pb-4">

                    {/* Encabezado del reporte (estilo del ejemplo) */}
                    <div className="text-center mb-8 pt-4">
                        <h2 className="text-lg font-bold text-zinc-900 uppercase">LA COMERCIAL</h2>
                        <h3 className="text-md font-bold text-zinc-900 uppercase">BALANCE GENERAL</h3>
                        <p className="text-sm font-bold text-zinc-900 uppercase">AL {labelPeriodo.toUpperCase()}</p>
                    </div>

                    {/* Indicador de cuadre */}
                    <div className={`mb-6 px-4 py-3 rounded text-sm font-bold flex justify-center items-center gap-2 print:hidden ${
                        cuadra
                            ? 'border border-green-200 bg-green-50 text-green-800'
                            : 'border border-red-200 bg-red-50 text-red-800'
                    }`}>
                        {cuadra
                            ? '✅ EL BALANCE CUADRA CORRECTAMENTE'
                            : `⚠️ EL BALANCE NO CUADRA — Diferencia: Q ${fmt(Math.abs(totalActivo - totalPasivoPatrimonio))}`
                        }
                    </div>

                    {/* Layout de una sola columna para todas las secciones (ACTIVO, PASIVO, CAPITAL) */}
                    <div className="flex flex-col gap-6 print:gap-8">
                        {/* Secciones individuales en orden */}
                        {secciones.map(sec => (
                            <SeccionBalance key={sec.tipo} sec={sec} fmt={fmt} />
                        ))}

                        {/* Total Pasivo + Patrimonio (si cuadra o para mostrar la suma final) */}
                        <div className="flex justify-between py-2 px-4 bg-[#1f2937] text-white font-bold text-sm print:text-xs print:bg-zinc-800 uppercase mt-2">
                            <span>TOTAL PASIVO + PATRIMONIO (CAPITAL)</span>
                            <span>{fmt(totalPasivoPatrimonio)}</span>
                        </div>
                    </div>

                        <div className={`rounded-lg p-4 text-center font-bold text-sm print:hidden mt-6 ${
                            cuadra ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {cuadra ? '✓ Cuadre verificado' : '✗ Revisar asientos'}
                        </div>
                </div>
            )}
        </div>
    );
};

// ── Componente de sección (ACTIVO / PASIVO / CAPITAL) ──
const SeccionBalance = ({ sec, fmt }) => (
    <div className="mb-6">
        {sec.subgrupos.map((sub) => {
            const subName = sub.nombre.toUpperCase();
            // Para "Activo Circulante" -> "CIRCULANTE", etc.
            const tipoCorto = subName.replace('ACTIVO ', '').replace('PASIVO ', '');
            
            return (
                <div key={sub.nombre} className="mb-6">
                    {/* Cabecera del subgrupo (Ej: ACTIVO CIRCULANTE) */}
                    <div className="bg-[#b4c6e7] text-[#1f4e79] font-bold text-center py-1.5 mb-2 text-sm print:text-xs">
                        {subName}
                    </div>
                    
                    {/* Cuentas */}
                    <div className="px-4">
                        {sub.cuentas.map((cuenta) => (
                            <div key={cuenta.codigo} className="flex justify-between py-1 text-sm print:text-xs text-zinc-900 font-semibold">
                                <span className="uppercase">{cuenta.nombre}</span>
                                <span>{fmt(cuenta.saldo)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Subtotal del subgrupo */}
                    <div className="flex justify-between py-1.5 px-4 mt-2 bg-[#fff2cc] font-bold text-sm print:text-xs text-zinc-900 border-t border-zinc-200">
                        <span>TOTAL {tipoCorto}</span>
                        <span>{fmt(sub.totalSaldo)}</span>
                    </div>
                </div>
            );
        })}

        {/* Total de la sección (ACTIVO, PASIVO, CAPITAL) */}
        <div className="flex justify-between py-2 px-4 mt-4 bg-[#1f2937] text-[#38bdf8] font-bold text-sm print:text-xs print:bg-zinc-800">
            <span>TOTAL DEL {sec.tipo}</span>
            <span>{fmt(sec.total)}</span>
        </div>
    </div>
);

export default BalanceGeneralReporte;
