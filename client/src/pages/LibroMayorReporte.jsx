import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';

const MESES = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

const LibroMayorReporte = () => {
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [data, setData] = useState(null);      // null = sin consulta, [] = sin resultados
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [anios, setAnios] = useState([]);

    const contentRef = useRef(null);
    const handlePrint = () => {
        window.print();
    };

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

    const API_URL = 'http://localhost:5000/api/reportes/libro-diario';

    const handleGenerar = async () => {
        if (!anio || !mes) {
            setError('Debe seleccionar un año y un mes.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await axios.get(API_URL, { params: { anio, mes } });
            setData(res.data);
        } catch (err) {
            const textoError = err.response?.data?.error || err.message;
            setError(`Error al consultar el reporte: ${textoError}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Formatear fecha legible ──
    const formatFecha = (valor) => {
        if (!valor) return '';
        const d = new Date(valor);
        return d.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // ── Formatear número a moneda ──
    const formatCurrency = (valor) => {
        const number = parseFloat(valor);
        if (isNaN(number) || number === 0) return '';
        return 'Q ' + number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatSaldo = (saldo) => {
        if (saldo === 0) return 'Q 0.00';
        if (saldo < 0) {
            return `Q (${Math.abs(saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
        }
        return 'Q ' + saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


    // ── Agrupación por Cuenta (CODIGO_CUENTA) ──
    const cuentas = data
        ? Object.values(
            data.reduce((acc, row) => {
                // Filtrar asientos anulados explícitamente excluyendo la palabra "ANULADO"
                if (row.DESCRIPCION && row.DESCRIPCION.toUpperCase().includes('ANULADO')) {
                    return acc;
                }
                const key = row.CODIGO_CUENTA;
                if (!acc[key]) {
                    acc[key] = {
                        codigo: key,
                        nombre: row.NOMBRE_CUENTA,
                        detalles: [],
                        totalDebe: 0,
                        totalHaber: 0,
                    };
                }
                acc[key].detalles.push(row);
                acc[key].totalDebe += parseFloat(row.DEBE) || 0;
                acc[key].totalHaber += parseFloat(row.HABER) || 0;
                return acc;
            }, {})
        )
        : [];

    // Ordenar cuentas por código
    cuentas.sort((a, b) => a.codigo.localeCompare(b.codigo));

    // Calcular saldos acumulados por detalle
    cuentas.forEach((cta) => {
        // Ordenar detalles por fecha
        cta.detalles.sort((a, b) => new Date(a.FECHA_POLIZA) - new Date(b.FECHA_POLIZA));

        let saldoAcumulado = 0;
        const inicial = parseInt(cta.codigo.charAt(0), 10);
        // Naturaleza deudora: Activos (1) y Gastos (5)
        // Naturaleza acreedora: Pasivos (2), Capital (3), Ingresos (4)
        const esDeudora = inicial === 1 || inicial === 5;

        cta.detalles.forEach(det => {
            const debe = parseFloat(det.DEBE) || 0;
            const haber = parseFloat(det.HABER) || 0;

            if (esDeudora) {
                saldoAcumulado = saldoAcumulado + debe - haber;
            } else {
                saldoAcumulado = saldoAcumulado + haber - debe;
            }

            det.SALDO_CALCULADO = saldoAcumulado;
        });
    });

    return (
        <div className="bg-white border border-zinc-200 rounded-lg print:shadow-none print:rounded-none print:border-none">
            {/* ── Header / Filtros ── */}
            <div className="px-6 py-5 border-b border-zinc-200 print:hidden">
                <h2 className="text-xl font-semibold text-zinc-900 mb-4 print:hidden">Reporte de Libro Mayor</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <Select
                        label="Año"
                        name="anio"
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        options={anios}
                    />
                    <Select
                        label="Mes"
                        name="mes"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        options={MESES}
                    />
                </div>
                <div className="flex items-center justify-end gap-3">
                    <Button className="" onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar Libro Mayor'}
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

            {/* ── Loading spinner ── */}
            {isLoading && (
                <div className="flex justify-center py-16 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* ── Mensaje vacío ── */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-6 my-3 px-4 py-3 rounded border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-center gap-2 print:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 2.99-1.742 2.99H3.481c-1.53 0-2.493-1.656-1.742-2.99l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span>No existen registros contables validados para el periodo seleccionado.</span>
                </div>
            )}

            {/* ── Tabla de resultados agrupada por Cuenta ── */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="px-6 pb-8 print:px-4 print:pb-4 flex flex-col gap-6">
                    {/* ── Encabezado visible solo al imprimir ── */}
                    <div className="hidden print:block text-center mb-6 pt-4">
                        <h2 className="text-xl font-bold text-slate-900">Reporte de Libro Mayor</h2>
                        <p className="text-sm text-slate-600">
                            Periodo: {MESES.find(m => m.value === mes)?.label || mes} - {anio}
                        </p>
                        <p className="text-xs italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                    </div>
                    {cuentas.map((cuenta) => (
                        <div key={cuenta.codigo} className="border border-zinc-200 rounded-lg overflow-hidden print:border-none print:mb-8">
                            {/* ── Cabecera de Cuenta ── */}
                            <div className="px-4 py-3 border-b border-zinc-200 break-inside-avoid print:border-b-2 print:border-slate-800">
                                <h3 className="text-lg font-bold text-zinc-900">
                                    Cuenta: {cuenta.codigo} - {cuenta.nombre}
                                </h3>
                            </div>
                            <div className="overflow-x-auto border-zinc-200">
                                <table className="w-full border-collapse text-sm table-fixed">
                                    <colgroup>
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '40%' }} />
                                        <col style={{ width: '17%' }} />
                                        <col style={{ width: '17%' }} />
                                        <col style={{ width: '16%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-200">
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descripción (Glosa)</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Debe</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Haber</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">Saldo Acumulado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {cuenta.detalles.map((det, idx) => (
                                            <tr
                                                key={`${cuenta.codigo}-${idx}`}
                                                className="bg-white hover:bg-zinc-50 transition-colors break-inside-avoid print:break-inside-avoid"
                                            >
                                                <td className="px-3 py-2 text-sm text-zinc-700 whitespace-nowrap">
                                                    {formatFecha(det.FECHA_POLIZA)}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-zinc-700 truncate">
                                                    {det.DESCRIPCION}
                                                </td>
                                                <td className="px-3 py-2 text-sm font-mono text-zinc-700 text-right whitespace-nowrap">
                                                    {formatCurrency(det.DEBE)}
                                                </td>
                                                <td className="px-3 py-2 text-sm font-mono text-zinc-700 text-right whitespace-nowrap">
                                                    {formatCurrency(det.HABER)}
                                                </td>
                                                <td className={`px-3 py-2 text-sm font-mono font-medium text-right whitespace-nowrap ${det.SALDO_CALCULADO < 0 ? 'text-red-600' : 'text-zinc-700'}`}>
                                                    {formatSaldo(det.SALDO_CALCULADO)}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* ── Fila de Cierre: Sumas de la Cuenta ── */}
                                        <tr className="bg-zinc-50 border-t border-zinc-200 font-semibold break-inside-avoid print:break-inside-avoid">
                                            <td colSpan={2} className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold">
                                                Totales de la cuenta:
                                            </td>
                                            <td className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap">
                                                Q {(cuenta.totalDebe || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-zinc-900 text-right font-mono font-semibold whitespace-nowrap">
                                                Q {(cuenta.totalHaber || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-right">
                                                {/* Saldo Final */}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibroMayorReporte;
