import React, { useState, useEffect, useRef } from 'react';
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

const BalanzaComprobacionReporte = () => {
    const [anio, setAnio]           = useState('');
    const [mes, setMes]             = useState('');
    const [data, setData]           = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState(null);
    const [anios, setAnios]         = useState([]);

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
        if (!anio) { setError('Debe seleccionar un año.'); return; }
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const params = { anio };
            if (mes) params.mes = mes;
            const res = await axios.get(
                'http://localhost:5000/api/reportes/balanza-comprobacion',
                { params }
            );
            setData(res.data);
        } catch (err) {
            setError(`Error al consultar el reporte: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fmt = (n) =>
        (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Totales generales ──
    const totales = data ? data.reduce((acc, row) => ({
        debe:     acc.debe     + (parseFloat(row.TOTAL_DEBE)     || 0),
        haber:    acc.haber    + (parseFloat(row.TOTAL_HABER)    || 0),
        deudor:   acc.deudor   + (parseFloat(row.SALDO_DEUDOR)   || 0),
        acreedor: acc.acreedor + (parseFloat(row.SALDO_ACREEDOR) || 0),
    }), { debe: 0, haber: 0, deudor: 0, acreedor: 0 }) : null;

    const cuadra = totales
        ? Math.abs(totales.debe - totales.haber) < 0.01 &&
          Math.abs(totales.deudor - totales.acreedor) < 0.01
        : false;

    const labelPeriodo = mes
        ? `${MESES.find(m => m.value === mes)?.label || mes} ${anio}`
        : `Año ${anio}`;

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 print:shadow-none print:rounded-none">

            {/* Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                    Balanza de Comprobación
                </h2>
                <p className="text-center text-sm text-slate-500 mt-1">
                    Verifica que la suma del Debe sea igual a la suma del Haber en todos los asientos validados.
                </p>
            </div>

            {/* Filtros */}
            <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Filtros de consulta</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <Select label="Año *" name="anio" value={anio}
                        onChange={(e) => setAnio(e.target.value)} options={anios} />
                    <Select label="Mes (opcional — acumulado hasta ese mes)" name="mes" value={mes}
                        onChange={(e) => setMes(e.target.value)} options={MESES} />
                </div>
                <div className="flex justify-end gap-3">
                    <Button onClick={handleGenerar} disabled={isLoading}>
                        {isLoading ? 'Consultando…' : 'Generar Balanza'}
                    </Button>
                    {data && data.length > 0 && (
                        <Button variant="secondary" onClick={handlePrint}>
                            Exportar a PDF / Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-8 mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 print:hidden">
                    {error}
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-12 print:hidden">
                    <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                </div>
            )}

            {/* Sin resultados */}
            {!isLoading && data !== null && data.length === 0 && (
                <div className="mx-8 mb-6 px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-300 print:hidden">
                    No existen registros contables validados para el período seleccionado.
                </div>
            )}

            {/* Tabla */}
            {!isLoading && data !== null && data.length > 0 && (
                <div ref={contentRef} className="px-8 pb-8 print:px-4 print:pb-4 overflow-x-auto">

                    {/* Encabezado de impresión */}
                    <div className="hidden print:block text-center mb-6 pt-4">
                        <h2 className="text-xl font-bold">Balanza de Comprobación</h2>
                        <p className="text-sm text-slate-600">Período: {labelPeriodo}</p>
                        <p className="text-xs italic text-slate-500">(Cifras expresadas en Quetzales)</p>
                    </div>

                    {/* Indicador de cuadre */}
                    <div className={`mb-5 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 print:hidden ${
                        cuadra
                            ? 'bg-green-50 text-green-800 border border-green-300'
                            : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                        {cuadra
                            ? '✅ Balanza cuadra — La contabilidad está correcta'
                            : `⚠️ Balanza NO cuadra — Diferencia en Saldos: Q ${fmt(Math.abs(totales.deudor - totales.acreedor))}`
                        }
                    </div>

                    <table className="w-full border-collapse text-sm print:text-black">
                        <thead>
                            <tr className="bg-slate-800 text-white text-center text-xs">
                                {/* Grupo: Identificación */}
                                <th rowSpan={2} className="px-3 py-3 text-left border border-slate-600" style={{ width: '80px' }}>Código</th>
                                <th rowSpan={2} className="px-3 py-3 text-left border border-slate-600">Cuenta</th>
                                <th rowSpan={2} className="px-3 py-3 border border-slate-600" style={{ width: '90px' }}>Tipo</th>
                                {/* Grupo: Movimientos */}
                                <th colSpan={2} className="px-3 py-2 border border-slate-600 bg-blue-800">Movimientos del Período</th>
                                {/* Grupo: Saldos */}
                                <th colSpan={2} className="px-3 py-2 border border-slate-600 bg-indigo-800">Saldos</th>
                            </tr>
                            <tr className="text-xs text-center">
                                <th className="px-3 py-2 border border-slate-600 bg-blue-700" style={{ width: '110px' }}>Debe</th>
                                <th className="px-3 py-2 border border-slate-600 bg-blue-700" style={{ width: '110px' }}>Haber</th>
                                <th className="px-3 py-2 border border-slate-600 bg-indigo-700" style={{ width: '110px' }}>Deudor</th>
                                <th className="px-3 py-2 border border-slate-600 bg-indigo-700" style={{ width: '110px' }}>Acreedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr
                                    key={row.CODIGO_CUENTA}
                                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                    }`}
                                >
                                    <td className="px-3 py-2 font-mono text-xs text-slate-500 border-r border-slate-200">
                                        {row.CODIGO_CUENTA}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700 border-r border-slate-200">
                                        {row.NOMBRE_CUENTA}
                                    </td>
                                    <td className="px-3 py-2 text-center border-r border-slate-200">
                                        <span style={{
                                            fontSize: '10px', fontWeight: '600',
                                            padding: '2px 7px', borderRadius: '20px',
                                            background: getTipoBg(row.TIPO_CUENTA),
                                            color: getTipoColor(row.TIPO_CUENTA),
                                        }}>
                                            {row.TIPO_CUENTA}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-700 border-r border-slate-200">
                                        {parseFloat(row.TOTAL_DEBE) > 0 ? fmt(row.TOTAL_DEBE) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono text-slate-700 border-r border-slate-200">
                                        {parseFloat(row.TOTAL_HABER) > 0 ? fmt(row.TOTAL_HABER) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-medium text-blue-700 border-r border-slate-200">
                                        {parseFloat(row.SALDO_DEUDOR) > 0 ? fmt(row.SALDO_DEUDOR) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono font-medium text-indigo-700">
                                        {parseFloat(row.SALDO_ACREEDOR) > 0 ? fmt(row.SALDO_ACREEDOR) : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        {/* Totales */}
                        {totales && (
                            <tfoot>
                                <tr className="bg-slate-800 text-white font-bold">
                                    <td colSpan={3} className="px-3 py-3 text-right text-sm border-t-2 border-slate-600">
                                        TOTALES:
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.debe)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.haber)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.deudor)}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono border-t-2 border-l border-slate-600"
                                        style={{ borderTop: '3px double white' }}>
                                        {fmt(totales.acreedor)}
                                    </td>
                                </tr>
                                {/* Verificación visual de cuadre */}
                                <tr className={cuadra ? 'bg-green-700' : 'bg-red-700'}>
                                    <td colSpan={7} className="px-3 py-2 text-center text-white text-xs font-semibold print:hidden">
                                        {cuadra
                                            ? '✓ Debe = Haber   |   Saldo Deudor = Saldo Acreedor'
                                            : '✗ Los totales no cuadran — Revisar asientos'
                                        }
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    {/* Firmas al imprimir */}
                    <div className="hidden print:grid print:grid-cols-2 print:gap-20 print:mt-16 print:text-center print:text-slate-900">
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold text-sm">Contador General</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                        <div className="border-t border-slate-900 pt-2">
                            <p className="font-bold text-sm">Representante Legal</p>
                            <p className="text-xs text-slate-500">Firma y Sello</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Colores por tipo de cuenta
const getTipoBg = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'ACTIVO')   return '#dbeafe';
    if (t === 'PASIVO')   return '#fee2e2';
    if (t === 'CAPITAL' || t === 'PATRIMONIO') return '#dcfce7';
    if (t === 'INGRESO')  return '#fef9c3';
    if (t === 'GASTO')    return '#fce7f3';
    return '#f1f5f9';
};
const getTipoColor = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'ACTIVO')   return '#1e40af';
    if (t === 'PASIVO')   return '#991b1b';
    if (t === 'CAPITAL' || t === 'PATRIMONIO') return '#166534';
    if (t === 'INGRESO')  return '#854d0e';
    if (t === 'GASTO')    return '#9d174d';
    return '#475569';
};

export default BalanzaComprobacionReporte;
