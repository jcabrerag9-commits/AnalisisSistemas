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

    // Procesamiento de datos para el reporte
    const ingresos = data ? data.filter(item => item.TIPO === '4') : [];
    const gastos = data ? data.filter(item => item.TIPO === '5') : [];

    // En contabilidad, ingresos son de naturaleza acreedora (Haber - Debe)
    const totalIngresos = ingresos.reduce((acc, curr) => acc + (curr.TOTAL_HABER - curr.TOTAL_DEBE), 0);
    // Gastos son de naturaleza deudora (Debe - Haber)
    const totalGastos = gastos.reduce((acc, curr) => acc + (curr.TOTAL_DEBE - curr.TOTAL_HABER), 0);
    const utilidadNeta = totalIngresos - totalGastos;

    return (
        <div className="bg-white rounded-xl shadow-md p-8 print:shadow-none print:p-0">
            {/* Header y Filtros */}
            <div className="print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Estado de Resultados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
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
                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
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
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {error}
                </div>
            )}

            {/* Reporte Formateado */}
            {data && (
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
                        <h3 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase text-slate-800">Ingresos</h3>

                        <div className="space-y-2">
                            {ingresos.map((item) => (
                                <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2">
                                    <span className="text-slate-700">{item.NOMBRE_CUENTA}</span>
                                    <span className="font-mono text-slate-900">{formatCurrency(item.TOTAL_HABER - item.TOTAL_DEBE)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-bold mt-4 px-2 text-slate-900">
                                <span>TOTAL INGRESOS</span>
                                <span className="border-b-2 border-slate-900">{formatCurrency(totalIngresos)}</span>
                            </div>

                        </div>
                    </div>

                    {/* Sección de Gastos */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold border-b border-slate-300 mb-4 uppercase text-slate-800">Gastos y Costos</h3>

                        <div className="space-y-2">
                            {gastos.map((item) => (
                                <div key={item.CODIGO_CUENTA} className="flex justify-between items-center px-2">
                                    <span className="text-slate-700">{item.NOMBRE_CUENTA}</span>
                                    <span className="font-mono text-slate-900">{formatCurrency(item.TOTAL_DEBE - item.TOTAL_HABER)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-bold mt-4 px-2 text-slate-900">
                                <span>TOTAL GASTOS Y COSTOS</span>
                                <span className="border-b-2 border-slate-900">{formatCurrency(totalGastos)}</span>
                            </div>

                        </div>
                    </div>

                    {/* Resultado Final */}
                    <div className={`p-4 rounded-lg flex justify-between items-center ${utilidadNeta >= 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
                        <span className="text-xl font-bold uppercase">
                            {utilidadNeta >= 0 ? 'Utilidad del Ejercicio' : 'Pérdida del Ejercicio'}
                        </span>
                        <span className="text-2xl font-bold font-mono underline decoration-double">
                            {formatCurrency(utilidadNeta)}
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

            {!data && !isLoading && (
                <div className="text-center py-20 text-slate-400">
                    <p>Seleccione los filtros y haga clic en "Generar Reporte" para visualizar los resultados.</p>
                </div>
            )}
        </div>
    );
};

export default EstadoResultadosReporte;
