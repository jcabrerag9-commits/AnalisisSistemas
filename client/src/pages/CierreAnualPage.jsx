import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';

const CierreAnualPage = () => {
    const [anio, setAnio]         = useState('');
    const [preview, setPreview]   = useState(null);
    const [resultado, setResultado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEjec, setIsEjec]     = useState(false);
    const [error, setError]       = useState(null);
    const [anios, setAnios]       = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/reportes/libro-diario/anios')
            .then(res => setAnios(res.data.map(a => a.value)))
            .catch(err => console.error(err));
    }, []);

    const handlePreview = async () => {
        if (!anio) { setError('Seleccione un año.'); return; }
        setIsLoading(true);
        setError(null);
        setPreview(null);
        setResultado(null);
        try {
            const res = await axios.get(
                'http://localhost:5000/api/operaciones/cierre-anual/preview',
                { params: { anio } }
            );
            setPreview(res.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEjecutar = async () => {
        if (!window.confirm(`¿Confirma generar el asiento de cierre contable para el año ${anio}?\n\nEsta acción es irreversible.`)) return;
        setIsEjec(true);
        setError(null);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
            const res = await axios.post(
                'http://localhost:5000/api/operaciones/cierre-anual',
                { anio },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResultado(res.data);
            setPreview(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setIsEjec(false);
        }
    };

    const fmt = (n) =>
        'Q ' + (parseFloat(n) || 0).toLocaleString('en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cierre Contable Anual</h2>
            <p className="text-sm text-slate-500 mb-6">
                Genera el asiento de cierre que lleva los saldos de ingresos y gastos a la cuenta de Utilidades Retenidas (3102).
            </p>

            {/* Selector de año */}
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Año a cerrar *</label>
                        <select
                            value={anio}
                            onChange={e => { setAnio(e.target.value); setPreview(null); setResultado(null); }}
                            className="px-3 h-10 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                            <option value="">-- Seleccione --</option>
                            {anios.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <Button onClick={handlePreview} disabled={isLoading || !anio}>
                        {isLoading ? 'Calculando…' : 'Vista Previa'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                    ⚠️ {error}
                </div>
            )}

            {/* Vista previa */}
            {preview && (
                <div className="border border-slate-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">
                        Vista Previa — Asiento de Cierre {preview.anio}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                        Fecha del asiento: 31 de Diciembre de {preview.anio} · Tipo: AJUSTE
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Ingresos */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 border-b pb-1">
                                INGRESOS — se cierran con DEBE
                            </p>
                            {preview.ingresos.map(r => (
                                <div key={r.ID_CUENTA} className="flex justify-between text-sm py-1 border-b border-dashed border-slate-100">
                                    <span className="text-slate-600">{r.CODIGO} · {r.NOMBRE}</span>
                                    <span className="font-mono text-slate-800">
                                        {fmt(parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE))}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-emerald-700 mt-2 text-sm">
                                <span>Total Ingresos</span>
                                <span className="font-mono">{fmt(preview.totalIngresos)}</span>
                            </div>
                        </div>

                        {/* Gastos */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 border-b pb-1">
                                GASTOS — se cierran con HABER
                            </p>
                            {preview.gastos.map(r => (
                                <div key={r.ID_CUENTA} className="flex justify-between text-sm py-1 border-b border-dashed border-slate-100">
                                    <span className="text-slate-600">{r.CODIGO} · {r.NOMBRE}</span>
                                    <span className="font-mono text-slate-800">
                                        {fmt(parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER))}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-red-700 mt-2 text-sm">
                                <span>Total Gastos</span>
                                <span className="font-mono">{fmt(preview.totalGastos)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resultado al cierre */}
                    <div className={`p-4 rounded-lg border-2 flex justify-between items-center mb-6 ${
                        preview.utilidadNeta >= 0
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                            : 'bg-red-50 border-red-400 text-red-900'
                    }`}>
                        <div>
                            <p className="font-bold">
                                {preview.utilidadNeta >= 0 ? 'Utilidad del Ejercicio' : 'Pérdida del Ejercicio'}
                            </p>
                            <p className="text-xs opacity-70">
                                Se registrará en cuenta {preview.cuentaUtilidades?.CUE_CODIGO} —
                                {preview.cuentaUtilidades?.CUE_NOMBRE}
                            </p>
                        </div>
                        <span className="text-xl font-bold font-mono">{fmt(preview.utilidadNeta)}</span>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="success" onClick={handleEjecutar} disabled={isEjec}>
                            {isEjec ? 'Generando asiento…' : `✅ Ejecutar Cierre ${anio}`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Resultado exitoso */}
            {resultado && (
                <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-lg text-emerald-900">
                    <p className="text-lg font-bold mb-1">✅ {resultado.message}</p>
                    <p className="text-sm">Asiento generado con ID: <span className="font-mono font-bold">#{resultado.asientoId}</span></p>
                    <p className="text-sm mt-1">
                        Resultado del ejercicio: <span className="font-mono font-bold">{fmt(resultado.utilidadNeta)}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default CierreAnualPage;