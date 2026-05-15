import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const MESES = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

// ISR Guatemala: 25% sobre utilidad imponible (Decreto 10-2012)
const ISR_TASA = 0.25;

const EstadoResultadosReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [data, setData]           = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [anios, setAnios]         = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/reportes/libro-diario/anios')
            .then(res => setAnios(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleGenerar = async () => {
        if (!anio || !mes) { setError('Debe seleccionar un año y un mes.'); return; }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await axios.get(
                'http://localhost:5000/api/reportes/estado-resultados',
                { params: { anio, mes } }
            );
            setData(res.data);
        } catch (err) {
            setError(`Error al consultar el reporte: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fmt = (n) =>
        'Q ' + (parseFloat(n) || 0).toLocaleString('en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Procesar datos ──
    const cuentas   = data?.cuentas   || [];
    const impMovtos = data?.impuestos  || [];

    const ingresos        = cuentas.filter(r => r.TIPO === '4');
    const gastosNormales  = cuentas.filter(r => r.TIPO === '5' && r.ES_DEPRECIACION === 'N');
    const depreciaciones  = cuentas.filter(r => r.TIPO === '5' && r.ES_DEPRECIACION === 'S');

    const totalIngresos      = ingresos.reduce((s, r) => s + (parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)), 0);
    const totalGastos        = gastosNormales.reduce((s, r) => s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);
    const totalDepreciacion  = depreciaciones.reduce((s, r) => s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);

    // IVA generado (cobrado a clientes) vs soportado (pagado a proveedores)
    const ivaGenerado   = impMovtos.filter(r => r.TIPO_AFECTACION === 'GENERADO')
                                   .reduce((s, r) => s + (parseFloat(r.TOTAL_IMPUESTO) || 0), 0);
    const ivaSoportado  = impMovtos.filter(r => r.TIPO_AFECTACION === 'SOPORTADO')
                                   .reduce((s, r) => s + (parseFloat(r.TOTAL_IMPUESTO) || 0), 0);
    const ivaLiquido    = ivaGenerado - ivaSoportado; // positivo = IVA a pagar

    const utilidadAntesISR = totalIngresos - totalGastos - totalDepreciacion;
    // ISR Guatemala: 25% sobre la utilidad antes de impuesto (si es positiva)
    const isr              = utilidadAntesISR > 0 ? utilidadAntesISR * ISR_TASA : 0;
    const utilidadNeta     = utilidadAntesISR - isr;

    const labelMes = MESES.find(m => m.value === mes)?.label || mes;
    const diasMes  = mes && anio ? new Date(parseInt(anio), parseInt(mes), 0).getDate() : 30;

    return (
        <div className="bg-white rounded-xl shadow-md p-8 print:shadow-none print:p-0">

            {/* Filtros */}
            <div className="print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Estado de Resultados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <Select label="Año" value={anio} onChange={e => setAnio(e.target.value)} options={anios} />
                    <Select label="Mes" value={mes}  onChange={e => setMes(e.target.value)}  options={MESES} />
                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                        <Button onClick={handleGenerar} disabled={isLoading}>
                            {isLoading ? 'Generando...' : 'Generar Reporte'}
                        </Button>
                        {data && (
                            <Button variant="secondary" onClick={() => window.print()}>
                                Imprimir / PDF
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg print:hidden">
                    {error}
                </div>
            )}

            {!data && !isLoading && (
                <div className="text-center py-20 text-slate-400 print:hidden">
                    Seleccione los filtros y haga clic en "Generar Reporte".
                </div>
            )}

            {/* Reporte */}
            {data && (
                <div className="max-w-3xl mx-auto border border-slate-200 p-10 print:border-none print:p-0">

                    {/* Encabezado */}
                    <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-xl font-bold uppercase tracking-wide">Sistema de Contabilidad</h1>
                        <h2 className="text-2xl font-bold uppercase mt-1">Estado de Resultados</h2>
                        <p className="text-slate-600 mt-1">
                            Del 01 al {diasMes} de {labelMes} de {anio}
                        </p>
                        <p className="text-xs italic text-slate-400 mt-1">
                            (Cifras expresadas en Quetzales — ISR calculado al 25% según Decreto 10-2012 Guatemala)
                        </p>
                    </div>

                    {/* ── INGRESOS ── */}
                    <Seccion titulo="INGRESOS OPERATIVOS">
                        {ingresos.map(r => (
                            <FilaCuenta key={r.CODIGO_CUENTA}
                                codigo={r.CODIGO_CUENTA}
                                nombre={r.NOMBRE_CUENTA}
                                monto={parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)}
                                fmt={fmt}
                            />
                        ))}
                        <FilaTotal label="TOTAL INGRESOS" monto={totalIngresos} fmt={fmt} color="text-emerald-800" />
                    </Seccion>

                    {/* ── GASTOS OPERATIVOS ── */}
                    <Seccion titulo="GASTOS Y COSTOS OPERATIVOS">
                        {gastosNormales.map(r => (
                            <FilaCuenta key={r.CODIGO_CUENTA}
                                codigo={r.CODIGO_CUENTA}
                                nombre={r.NOMBRE_CUENTA}
                                monto={parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)}
                                fmt={fmt}
                            />
                        ))}
                        <FilaTotal label="TOTAL GASTOS OPERATIVOS" monto={totalGastos} fmt={fmt} color="text-red-800" />
                    </Seccion>

                    {/* ── DEPRECIACIONES ── */}
                    {depreciaciones.length > 0 && (
                        <Seccion titulo="DEPRECIACIONES Y AMORTIZACIONES">
                            {depreciaciones.map(r => (
                                <FilaCuenta key={r.CODIGO_CUENTA}
                                    codigo={r.CODIGO_CUENTA}
                                    nombre={r.NOMBRE_CUENTA}
                                    monto={parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)}
                                    fmt={fmt}
                                />
                            ))}
                            <FilaTotal label="TOTAL DEPRECIACIONES" monto={totalDepreciacion} fmt={fmt} color="text-amber-800" />
                        </Seccion>
                    )}

                    {/* ── UTILIDAD ANTES DE IMPUESTOS ── */}
                    <div className="flex justify-between items-center py-3 px-2 border-t-2 border-b border-slate-400 my-2 font-semibold text-slate-800">
                        <span>UTILIDAD ANTES DE IMPUESTOS</span>
                        <span className="font-mono">{fmt(utilidadAntesISR)}</span>
                    </div>

                    {/* ── IMPUESTOS ── */}
                    <Seccion titulo="IMPUESTOS">
                        {/* IVA */}
                        {impMovtos.length > 0 && (
                            <>
                                <div className="flex justify-between items-center px-2 py-1 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-slate-400">IVA</span>
                                        IVA Generado (Débito Fiscal)
                                    </span>
                                    <span className="font-mono">{fmt(ivaGenerado)}</span>
                                </div>
                                <div className="flex justify-between items-center px-2 py-1 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-slate-400">IVA</span>
                                        IVA Soportado (Crédito Fiscal)
                                    </span>
                                    <span className="font-mono text-red-600">({fmt(ivaSoportado)})</span>
                                </div>
                                <div className="flex justify-between items-center px-2 py-1 text-sm font-medium text-slate-700 border-t border-dashed border-slate-300 mt-1">
                                    <span>IVA Líquido a Pagar</span>
                                    <span className={`font-mono ${ivaLiquido >= 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {ivaLiquido >= 0 ? fmt(ivaLiquido) : `(${fmt(Math.abs(ivaLiquido))})`}
                                    </span>
                                </div>
                                <div className="my-2 border-t border-slate-200" />
                            </>
                        )}

                        {/* ISR Guatemala — 25% Decreto 10-2012 */}
                        <div className="flex justify-between items-center px-2 py-1 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-400">ISR</span>
                                Impuesto Sobre la Renta (25% — Decreto 10-2012)
                            </span>
                            <span className="font-mono text-red-600">{fmt(isr)}</span>
                        </div>

                        <FilaTotal label="TOTAL IMPUESTOS" monto={ivaLiquido + isr} fmt={fmt} color="text-red-800" />
                    </Seccion>

                    {/* ── RESULTADO FINAL ── */}
                    <div className={`mt-6 p-5 rounded-lg flex justify-between items-center ${
                        utilidadNeta >= 0
                            ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-900'
                            : 'bg-red-50 border-2 border-red-400 text-red-900'
                    }`}>
                        <div>
                            <p className="text-xl font-bold uppercase">
                                {utilidadNeta >= 0 ? 'Utilidad Neta del Ejercicio' : 'Pérdida Neta del Ejercicio'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-70">
                                {utilidadNeta >= 0 ? 'Después de ISR e IVA' : 'Resultado negativo del período'}
                            </p>
                        </div>
                        <span className="text-2xl font-bold font-mono underline decoration-double">
                            {fmt(Math.abs(utilidadNeta))}
                        </span>
                    </div>

                    {/* Firmas */}
                    <div className="mt-20 grid grid-cols-2 gap-20 text-center text-slate-900">
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold">Contador General</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold">Representante Legal</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Componentes auxiliares ──
const Seccion = ({ titulo, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold border-b border-slate-300 mb-3 uppercase tracking-wide text-slate-700 pb-1">
            {titulo}
        </h3>
        <div className="space-y-1">{children}</div>
    </div>
);

const FilaCuenta = ({ codigo, nombre, monto, fmt }) => (
    <div className="flex justify-between items-center px-2 py-0.5 text-sm text-slate-700">
        <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400 w-16 shrink-0">{codigo}</span>
            {nombre}
        </span>
        <span className="font-mono shrink-0 ml-4">{fmt(monto)}</span>
    </div>
);

const FilaTotal = ({ label, monto, fmt, color = 'text-slate-900' }) => (
    <div className={`flex justify-between items-center border-t border-slate-900 pt-2 font-bold mt-3 px-2 ${color}`}>
        <span>{label}</span>
        <span className="font-mono border-b-2 border-current">{fmt(monto)}</span>
    </div>
);

export default EstadoResultadosReporte;