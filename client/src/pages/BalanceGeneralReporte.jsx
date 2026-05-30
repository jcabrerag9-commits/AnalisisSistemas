import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const ISR_TASA = 0.25;

const SECCIONES = [
    { tipo: 'ACTIVO', naturaleza: 'deudora', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
    { tipo: 'PASIVO', naturaleza: 'acreedora', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
    { tipo: 'CAPITAL', naturaleza: 'acreedora', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
];

const BalanceGeneralReporte = () => {
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [filtroModo, setFiltroModo] = useState('periodo'); // 'periodo' o 'fecha'
    const [fechaFin, setFechaFin] = useState('');
    const [centroCostoId, setCentroCostoId] = useState('');
    const [monedaId, setMonedaId] = useState('');
    const [estadoAsientoId, setEstadoAsientoId] = useState('');

    // Catalogos
    const [anios, setAnios]         = useState([]);
    const [centrosCosto, setCentrosCosto] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [estadosAsiento, setEstadosAsiento] = useState([]);

    const [data, setData] = useState(null);   // null = sin consulta
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
    const [isrMonto, setIsrMonto] = useState(0);
    const [utilidadNeta, setUtilidadNeta] = useState(0);

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
        const fetchInitialData = async () => {
            try {
                const [resAnios, resCC, resMon, resEst] = await Promise.all([
                    axios.get('http://localhost:5000/api/reportes/libro-diario/anios'),
                    axios.get('http://localhost:5000/api/con-centro-costo'),
                    axios.get('http://localhost:5000/api/con-moneda'),
                    axios.get('http://localhost:5000/api/con-estado-asiento'),
                ]);
                setAnios(resAnios.data);
                setCentrosCosto(resCC.data);
                setMonedas(resMon.data);
                setEstadosAsiento(resEst.data);
            } catch (err) {
                console.error('Error al obtener catálogos:', err);
            }
        };
        fetchInitialData();
    }, []);

    const handleGenerar = async () => {
        if (filtroModo === 'periodo' && !anio) {
            setError('Debe seleccionar un año.');
            return;
        }
        if (filtroModo === 'fecha' && !fechaFin) {
            setError('Debe ingresar la fecha límite.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setData(null);
        setIsrMonto(0);
        setUtilidadNeta(0);
        try {
            const params = {};
            if (filtroModo === 'periodo') {
                params.anio = anio;
                if (mes) params.mes = mes;
            } else {
                params.fechaFin = fechaFin;
            }
            if (centroCostoId) params.centroCostoId = centroCostoId;
            if (monedaId) params.monedaId = monedaId;
            if (estadoAsientoId) params.estadoAsientoId = estadoAsientoId;

            // Params para Estado de Resultados: rango acumulado año-a-fecha
            // Esto calcula el ISR acumulado correcto para ambos casos: mes individual y acumulado
            const erParams = {};
            if (filtroModo === 'periodo') {
                if (mes) {
                    const lastDay = new Date(parseInt(anio), parseInt(mes), 0).getDate();
                    erParams.fechaInicio = `${anio}-01-01`;
                    erParams.fechaFin = `${anio}-${String(mes).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                } else {
                    erParams.fechaInicio = `${anio}-01-01`;
                    erParams.fechaFin = `${anio}-12-31`;
                }
            } else {
                const fFin = new Date(fechaFin);
                erParams.fechaInicio = `${fFin.getFullYear()}-01-01`;
                erParams.fechaFin = fechaFin;
            }
            if (centroCostoId) erParams.centroCostoId = centroCostoId;
            if (monedaId) erParams.monedaId = monedaId;
            if (estadoAsientoId) erParams.estadoAsientoId = estadoAsientoId;

            // Llamar ambas APIs en paralelo para evitar el problema de timing con setState
            const [balanceRes, erRes] = await Promise.all([
                axios.get('http://localhost:5000/api/reportes/balance-general', { params }),
                axios.get('http://localhost:5000/api/reportes/estado-resultados', { params: erParams })
                    .catch(() => ({ data: { cuentas: [] } })),
            ]);

            const erCuentas = erRes.data?.cuentas || [];
            const totalIngresos = erCuentas.filter(r => String(r.TIPO) === '4')
                .reduce((s, r) => s + (parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)), 0);
            const totalGastos = erCuentas.filter(r => String(r.TIPO) === '5')
                .reduce((s, r) => s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);
            const utilidadAntesISR = totalIngresos - totalGastos;
            const isrCalc = utilidadAntesISR > 0 ? utilidadAntesISR * ISR_TASA : 0;

            // Todos los setState en el mismo ciclo — React 18 los batchea en un solo render
            setData(balanceRes.data);
            setIsrMonto(isrCalc);
            setUtilidadNeta(utilidadAntesISR - isrCalc);
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
            const cuentasRaw = data.filter(row => {
                const tipoRow = (row.TIPO_CUENTA || '').toUpperCase();
                // Aceptar tanto CAPITAL como PATRIMONIO para la sección de CAPITAL
                if (sec.tipo === 'CAPITAL') return tipoRow === 'CAPITAL' || tipoRow === 'PATRIMONIO';
                return tipoRow === sec.tipo;
            });

            // Consolidar debe/haber por cuenta
            const cuentasMap = cuentasRaw.reduce((acc, row) => {
                const key = row.CODIGO_CUENTA;
                if (!acc[key]) {
                    acc[key] = {
                        codigo:    row.CODIGO_CUENTA,
                        nombre:    row.NOMBRE_CUENTA,
                        subtipo:   row.NOMBRE_GRUPO || sec.tipo,
                        debe:  0,
                        haber: 0,
                        saldo: 0,
                    };
                }
                // Saldo según naturaleza
                const debe = parseFloat(row.TOTAL_DEBE) || 0;
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

            const getSortWeight = (name) => {
                const n = name.toUpperCase();
                if (n.includes('CIRCULANTE') || n.includes('CORRIENTE')) return 1;
                if (n.includes('FIJO') || n.includes('NO CORRIENTE')) return 2;
                if (n.includes('DIFERIDO')) return 3;
                return 99;
            };

            const subgrupos = Object.values(subgruposMap).sort((a, b) =>
                getSortWeight(a.nombre) - getSortWeight(b.nombre) || a.nombre.localeCompare(b.nombre)
            );

            const total = cuentas.reduce((s, c) => s + c.saldo, 0);

            return { ...sec, subgrupos, total };
        })
        : [];

    // Detectar si el período ya fue cerrado (existe cuenta de Utilidades Retenidas en el Capital)
    const capitalSec = secciones.find(s => s.tipo === 'CAPITAL');
    const utilRetenidas = capitalSec
        ? capitalSec.subgrupos.flatMap(sg => sg.cuentas).find(c => {
            const nombre = (c.nombre || '').toUpperCase();
            const codigo = (c.codigo || '');
            return (nombre.includes('UTILID') && (nombre.includes('RETEN') || nombre.includes('ACUMUL')))
                || codigo.startsWith('3102');
        })
        : null;
    const periodoConCierre = !!utilRetenidas;

    // Siempre inyectar ISR por Pagar en PASIVO CORRIENTE
    if (data && isrMonto > 0) {
        const pasivoSec = secciones.find(s => s.tipo === 'PASIVO');
        if (pasivoSec) {
            let corriente = pasivoSec.subgrupos.find(sg =>
                sg.nombre.toUpperCase().includes('CORRIENTE') || sg.nombre.toUpperCase().includes('CIRCULANTE')
            );
            if (!corriente) {
                corriente = { nombre: 'PASIVO CORRIENTE', cuentas: [], totalDebe: 0, totalHaber: 0, totalSaldo: 0 };
                pasivoSec.subgrupos.unshift(corriente);
            }
            corriente.cuentas.push({ codigo: '', nombre: 'ISR POR PAGAR', subtipo: corriente.nombre, debe: 0, haber: 0, saldo: isrMonto });
            corriente.totalSaldo += isrMonto;
            pasivoSec.total += isrMonto;
        }
    }

    if (data && isrMonto > 0 && periodoConCierre) {
        // Período cerrado: Utilidades Retenidas ya está en el Capital (valor bruto).
        // Reducir su saldo por el ISR para mostrar el valor neto real.
        // Esto compensa el ISR agregado al Pasivo, manteniendo el total del balance intacto.
        const sgConUR = capitalSec.subgrupos.find(sg => sg.cuentas.includes(utilRetenidas));
        if (sgConUR) {
            utilRetenidas.saldo -= isrMonto;
            sgConUR.totalSaldo -= isrMonto;
            capitalSec.total -= isrMonto;
        }
    } else if (data && utilidadNeta !== 0 && !periodoConCierre) {
        // Período abierto: no hay asiento de cierre. Inyectar Utilidad Neta como fila virtual.
        if (capitalSec) {
            let capitalGroup = capitalSec.subgrupos[0];
            if (!capitalGroup) {
                capitalGroup = { nombre: 'CAPITAL', cuentas: [], totalDebe: 0, totalHaber: 0, totalSaldo: 0 };
                capitalSec.subgrupos.push(capitalGroup);
            }
            capitalGroup.cuentas.push({ codigo: '', nombre: 'UTILIDAD NETA DEL EJERCICIO', subtipo: capitalGroup.nombre, debe: 0, haber: 0, saldo: utilidadNeta });
            capitalGroup.totalSaldo += utilidadNeta;
            capitalSec.total += utilidadNeta;
        }
    }

    const totalActivo = secciones.find(s => s.tipo === 'ACTIVO')?.total || 0;
    const totalPasivo = secciones.find(s => s.tipo === 'PASIVO')?.total || 0;
    const totalCapital = capitalSec?.total || 0;
    const totalPasivoPatrimonio = totalPasivo + totalCapital;
    const cuadra = Math.abs(totalActivo - totalPasivoPatrimonio) < 0.01;

    const fmt = (n) =>
        n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const labelPeriodo = filtroModo === 'periodo'
        ? (mes ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}` : `Año ${anio}`)
        : `al ${fechaFin ? new Date(fechaFin).toLocaleDateString('es-HN') : ''}`;

    return (
        <div className="bg-white border border-zinc-200 rounded-lg print:shadow-none print:rounded-none print:border-none">

            {/* ── Header / Filtros ── */}
            <div className="px-6 py-5 border-b border-zinc-200 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        Reporte de Balance General
                    </h2>
                    {/* Botonera de Modo */}
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 self-start">
                        <button
                            type="button"
                            onClick={() => { setFiltroModo('periodo'); setFechaFin(''); }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filtroModo === 'periodo' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Por Período
                        </button>
                        <button
                            type="button"
                            onClick={() => { setFiltroModo('fecha'); setAnio(''); setMes(''); }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filtroModo === 'fecha' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Por Rango de Fechas
                        </button>
                    </div>
                </div>

                {/* Filtros Principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filtroModo === 'periodo' ? (
                        <>
                            <Select
                                label="Año *"
                                name="anio"
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                options={anios}
                            />
                            <Select
                                label="Mes (opcional — acumulado)"
                                name="mes"
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                options={MESES}
                            />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Fecha Límite (Al) *</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md outline-none focus:border-sky-500 bg-white"
                                />
                            </div>
                        </>
                    )}
                    <Select
                        label="Moneda"
                        value={monedaId}
                        onChange={(e) => setMonedaId(e.target.value)}
                        options={[
                            { value: '', label: 'Todas las monedas' },
                            ...monedas.map(m => ({ value: String(m.MON_MONEDA), label: `${m.MON_CODIGO_ISO} - ${m.MON_NOMBRE}` }))
                        ]}
                    />
                </div>

                {/* Filtros Avanzados (Colapsable) */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 outline-none"
                    >
                        {mostrarAvanzados ? '▲ Ocultar filtros avanzados' : '▼ Mostrar filtros avanzados'}
                    </button>

                    {mostrarAvanzados && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <Select
                                label="Centro de Costo"
                                value={centroCostoId}
                                onChange={(e) => setCentroCostoId(e.target.value)}
                                options={[
                                    { value: '', label: 'Todos los centros' },
                                    ...centrosCosto.map(cc => ({ value: String(cc.CTC_CENTRO_COSTO), label: cc.CTC_NOMBRE }))
                                ]}
                            />
                            <Select
                                label="Estado del Asiento"
                                value={estadoAsientoId}
                                onChange={(e) => setEstadoAsientoId(e.target.value)}
                                options={[
                                    { value: '', label: 'Solo Validados (Default)' },
                                    { value: 'TODOS', label: 'Todos (Borrador y Validado)' },
                                    ...estadosAsiento.map(e => ({ value: String(e.ESA_ESTADO_ASIENTO), label: e.ESA_NOMBRE }))
                                ]}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-150 pt-3">
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
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 print:hidden ${cuadra
                            ? 'bg-green-50 text-green-800 border border-green-300'
                            : 'bg-red-50 text-red-800 border border-red-300'
                        }`}>
                        {cuadra
                            ? '✅ EL BALANCE CUADRA CORRECTAMENTE'
                            : `⚠️ EL BALANCE NO CUADRA — Diferencia: Q ${fmt(Math.abs(totalActivo - totalPasivoPatrimonio))}`
                        }
                    </div>

                    {/* Layout de una sola columna para todas las secciones (ACTIVO, PASIVO, CAPITAL) */}
                    <div className="flex flex-col gap-2 print:gap-4">
                        {secciones.map(sec => (
                            <div key={sec.tipo} className="mb-4">
                                {/* Subgrupos de la sección */}
                                {sec.subgrupos.map((sub) => {
                                    const subName = sub.nombre.toUpperCase();
                                    const tipoCorto = subName.replace('ACTIVO ', '').replace('PASIVO ', '');
                                    
                                    return (
                                        <div key={sub.nombre} className="mb-4">
                                            <div className="bg-[#b4c6e7] text-[#1f4e79] font-bold text-center py-1 mb-2 text-sm print:text-xs uppercase">
                                                {subName}
                                            </div>
                                            <div className="px-4 mb-1">
                                                {sub.cuentas.map((cuenta) => (
                                                    <div key={cuenta.codigo} className="flex justify-between py-0.5 text-sm print:text-xs text-zinc-900">
                                                        <span className="uppercase">{cuenta.nombre}</span>
                                                        <span className="font-mono">{fmt(cuenta.saldo)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between py-1 px-4 bg-[#fff2cc] font-bold text-sm print:text-xs text-zinc-900 border-t border-zinc-300">
                                                <span>TOTAL {tipoCorto}</span>
                                                <span className="font-mono">{fmt(sub.totalSaldo)}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Barra de Total de Sección (Solo para ACTIVO y PASIVO) */}
                                {(sec.tipo === 'ACTIVO' || sec.tipo === 'PASIVO') && (
                                    <div className="flex justify-between py-2 px-4 bg-[#1f2937] text-[#38bdf8] font-bold text-sm print:text-xs print:bg-zinc-800 uppercase mt-2">
                                        <span>TOTAL DEL {sec.tipo}</span>
                                        <span className="font-mono">{fmt(sec.total)}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Fila Final: Pasivo + Capital */}
                        <div className="flex justify-between py-2 px-4 bg-[#1f2937] text-white font-bold text-sm print:text-xs print:bg-zinc-800 uppercase mt-4">
                            <span>TOTAL PASIVO + CAPITAL</span>
                            <span className="font-mono">{fmt(totalPasivoPatrimonio)}</span>
                        </div>
                    </div>

                    {/* Pie con totales */}
                    <div className="mt-6 grid grid-cols-2 gap-6 print:gap-4">
                        <div className="border-2 border-blue-800 rounded-lg p-4 bg-blue-50">
                            <div className="flex justify-between items-center font-bold text-blue-900 text-base">
                                <span>TOTAL ACTIVO</span>
                                <span className="font-mono">Q {fmt(totalActivo)}</span>
                            </div>
                        </div>

                        <div className={`print:hidden rounded-lg p-4 text-center font-bold text-sm ${cuadra ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {cuadra
                                ? '✓ Cuadre verificado'
                                : (
                                    <Link to="/con-asiento" className="underline underline-offset-2 text-red-800 hover:text-red-600">
                                        ✗ Revisar asientos →
                                    </Link>
                                )
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceGeneralReporte;
