import React, { useState, useEffect } from 'react';
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

const EstadoResultadosReporte = () => {
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [anios, setAnios] = useState([]);

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
        if (!anio || !mes) {
            setError('Debe seleccionar un año y un mes.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await axios.get('http://localhost:5000/api/reportes/estado-resultados', { params: { anio, mes } });
            setData(res.data);
        } catch (err) {
            const textoError = err.response?.data?.error || err.message;
            setError(`Error al consultar el reporte: ${textoError}`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (valor) => {
        const number = parseFloat(valor);
        if (isNaN(number)) return '0.00';
        return 'Q ' + number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePrint = () => {
        window.print();
    };

    // ── Segmentación por CATEGORIA (viene del backend, sin name-matching) ──
    const ingresos = data ? data.filter(item => item.CATEGORIA === 'INGRESO') : [];
    const gastosOperativos = data ? data.filter(item => item.CATEGORIA === 'GASTO_OPERATIVO') : [];
    const cuentasDepreciaciones = data ? data.filter(item => item.CATEGORIA === 'DEPRECIACION') : [];
    const cuentasImpuestos = data ? data.filter(item => item.CATEGORIA === 'IMPUESTO') : [];

    // Ingresos: naturaleza acreedora → Haber − Debe
    const totalIngresos = ingresos.reduce((acc, curr) =>
        acc + (parseFloat(curr.TOTAL_HABER) - parseFloat(curr.TOTAL_DEBE)), 0);

    // Gastos: naturaleza deudora → Debe − Haber
    const totalGastosOperativos = gastosOperativos.reduce((acc, curr) =>
        acc + (parseFloat(curr.TOTAL_DEBE) - parseFloat(curr.TOTAL_HABER)), 0);

    const totalDepreciaciones = cuentasDepreciaciones.reduce((acc, curr) =>
        acc + (parseFloat(curr.TOTAL_DEBE) - parseFloat(curr.TOTAL_HABER)), 0);

    const utilidadAntesImpuestos = totalIngresos - totalGastosOperativos - totalDepreciaciones;

    // Impuestos reales desde MONTO_IMPUESTO; fallback 25% solo si todos son 0
    const totalImpuestosReales = (data || []).reduce(
        (acc, curr) => acc + (parseFloat(curr.MONTO_IMPUESTO) || 0), 0
    );
    const totalImpuestosContables = cuentasImpuestos.reduce((acc, curr) =>
        acc + (parseFloat(curr.TOTAL_DEBE) - parseFloat(curr.TOTAL_HABER)), 0);

    const isImpuestoCalculado = totalImpuestosReales === 0 && totalImpuestosContables === 0 && utilidadAntesImpuestos > 0;
    const totalImpuestos = isImpuestoCalculado
        ? utilidadAntesImpuestos * 0.25
        : totalImpuestosReales > 0 ? totalImpuestosReales : totalImpuestosContables;

    const utilidadNeta = utilidadAntesImpuestos - totalImpuestos;

    return (
        <div className="bg-white border border-zinc-200 rounded-lg print:shadow-none print:rounded-none print:border-none">
            {/* Header y Filtros */}
            <div className="px-6 py-5 border-b border-zinc-200 print:hidden">
                <h2 className="text-xl font-semibold text-zinc-900 mb-4 print:hidden">Estado de Resultados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <Select
                        label="Año"
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        options={anios}
                    />
                    <Select
                        label="Mes"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        options={MESES}
                    />
                </div>
                <div className="flex items-center justify-end gap-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Generando...' : 'Generar Reporte'}
                    </Button>
                    {data && (
                        <Button variant="secondary" onClick={handlePrint}>
                            Imprimir / PDF
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mx-6 my-3 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm print:hidden">
                    {error}
                </div>
            )}

            {/* Reporte Formateado */}
            {data && (
                <div className="px-6 pb-8 print:px-4 print:pb-4">
                    <div className="max-w-4xl mx-auto border border-slate-200 p-10 print:border-none print:p-0">
                        {/* Encabezado del Reporte */}
                        <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                            <h1 className="text-2xl font-bold uppercase">Contabilidad</h1>
                            <h2 className="text-xl font-semibold uppercase text-slate-900">Estado de Resultados</h2>
                            <p className="text-slate-600">
                                Del 01 al {new Date(anio, mes, 0).getDate()} de {MESES.find(m => m.value === mes)?.label} de {anio}
                            </p>
                            <p className="text-sm italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                        </div>

                        {/* Sección de Ingresos */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 uppercase tracking-wide">Ingresos</h3>

                            <div className="space-y-2">
                                {ingresos.map((item) => (
                                    <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700">{item.NOMBRE_CUENTA}</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(item.TOTAL_HABER - item.TOTAL_DEBE)}</span>
                                    </div>
                                ))}
                                {ingresos.length === 0 && <div className="text-zinc-400 italic px-2">No hay ingresos registrados</div>}
                                <div className="flex justify-between items-center px-2 py-2 border-t border-zinc-200 font-semibold text-sm mt-3">
                                    <span>TOTAL INGRESOS</span>
                                    <span className="font-mono text-zinc-900 border-b-2 border-slate-900 whitespace-nowrap">{formatCurrency(totalIngresos)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Gastos Operativos */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 uppercase tracking-wide">Gastos Operativos</h3>

                            <div className="space-y-2">
                                {gastosOperativos.map((item) => (
                                    <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700">{item.NOMBRE_CUENTA}</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(item.TOTAL_DEBE - item.TOTAL_HABER)}</span>
                                    </div>
                                ))}
                                {gastosOperativos.length === 0 && <div className="text-zinc-400 italic px-2">No hay gastos operativos registrados</div>}
                            </div>
                        </div>

                        {/* Sección de Depreciaciones */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 uppercase tracking-wide">Depreciaciones y Amortizaciones</h3>

                            <div className="space-y-2">
                                {cuentasDepreciaciones.map((item) => (
                                    <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700">{item.NOMBRE_CUENTA}</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(item.TOTAL_DEBE - item.TOTAL_HABER)}</span>
                                    </div>
                                ))}
                                {cuentasDepreciaciones.length === 0 && <div className="text-zinc-400 italic px-2">Sin registros de depreciación</div>}

                                <div className="flex justify-between items-center px-2 py-2 border-t border-zinc-200 font-semibold text-sm mt-3">
                                    <span>TOTAL GASTOS Y DEPRECIACIONES</span>
                                    <span className="font-mono text-zinc-900 border-b-2 border-slate-900 whitespace-nowrap">{formatCurrency(totalGastosOperativos + totalDepreciaciones)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Utilidad Antes de Impuestos */}
                        <div className="mb-6 p-4 rounded border border-zinc-200 bg-zinc-50 flex justify-between items-center text-zinc-800">
                            <span className="text-lg font-bold uppercase">Utilidad Antes de Impuestos</span>
                            <span className="text-xl font-bold font-mono whitespace-nowrap">
                                {formatCurrency(utilidadAntesImpuestos)}
                            </span>
                        </div>

                        {/* Sección de Impuestos */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-200 pb-2 mb-4 uppercase tracking-wide">Impuestos (ISR)</h3>

                            <div className="space-y-2">
                                {cuentasImpuestos.map((item) => (
                                    <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700">{item.NOMBRE_CUENTA}</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(item.TOTAL_DEBE - item.TOTAL_HABER)}</span>
                                    </div>
                                ))}
                                {totalImpuestosReales > 0 && cuentasImpuestos.length === 0 && (
                                    <div className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700">Impuestos registrados (movimientos)</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(totalImpuestosReales)}</span>
                                    </div>
                                )}
                                {isImpuestoCalculado && (
                                    <div className="flex justify-between items-center px-2 py-1.5 text-sm">
                                        <span className="text-zinc-700 italic">Provisión ISR (25% Estimado)</span>
                                        <span className="font-mono text-zinc-900 whitespace-nowrap">{formatCurrency(totalImpuestos)}</span>
                                    </div>
                                )}
                                {cuentasImpuestos.length === 0 && !isImpuestoCalculado && totalImpuestosReales === 0 && (
                                    <div className="text-zinc-400 italic px-2">No se calcularon impuestos (Pérdida)</div>
                                )}
                            </div>
                        </div>

                        {/* Resultado Final */}
                        <div className={`p-4 rounded-lg flex justify-between items-center ${utilidadNeta >= 0 ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                            <span className="text-xl font-bold uppercase">
                                {utilidadNeta >= 0 ? 'Utilidad Neta del Ejercicio' : 'Pérdida Neta del Ejercicio'}
                            </span>
                            <span className="text-2xl font-bold font-mono underline decoration-double whitespace-nowrap">
                                {formatCurrency(utilidadNeta)}
                            </span>
                        </div>

                        {/* Firmas */}
                        <div className="mt-16 grid grid-cols-2 gap-20 text-center text-zinc-900 text-sm">
                            <div className="border-t border-zinc-900 pt-2">
                                <p className="font-semibold">Contador General</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Firma y Sello</p>
                            </div>
                            <div className="border-t border-zinc-900 pt-2">
                                <p className="font-semibold">Representante Legal</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Firma y Sello</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {!data && !isLoading && (
                <div className="text-center py-20 text-zinc-400 print:hidden">
                    <p>Seleccione los filtros y haga clic en "Generar Reporte" para visualizar los resultados.</p>
                </div>
            )}
        </div>
    );
};

export default EstadoResultadosReporte;
