import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';

const MESES = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

const nombreMes = (numMes) => {
    const m = MESES.find(m => m.value === parseInt(numMes));
    return m ? m.label : numMes;
};

const CON_REPROCESO_PERIODO = () => {
    const [anio, setAnio]   = useState('');
    const [mes, setMes]     = useState('');
    const [resultados, setResultados]               = useState([]);
    const [buscando, setBuscando]                   = useState(false);
    const [buscado, setBuscado]                     = useState(false);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
    const [motivo, setMotivo]       = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [usuarios, setUsuarios]   = useState([]);
    const [procesando, setProcesando]               = useState(false);
    const [mensaje, setMensaje]                     = useState(null);
    const [historial, setHistorial]                 = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const API_BASE = 'http://localhost:5000/api';

    useEffect(() => {
        fetchUsuarios();
        fetchHistorial();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get(`${API_BASE}/con-usuario`);
            setUsuarios(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchHistorial = async () => {
        setCargandoHistorial(true);
        try {
            const res = await axios.get(`${API_BASE}/con-reproceso-periodo/historial`);
            setHistorial(res.data);
        } catch (err) { console.error(err); }
        finally { setCargandoHistorial(false); }
    };

    const limpiarBusqueda = () => {
        setResultados([]);
        setPeriodoSeleccionado(null);
        setBuscado(false);
        setMotivo('');
        setUsuarioId('');
    };

    const handleBuscar = async () => {
        if (!anio && !mes) {
            setMensaje({ tipo: 'warning', texto: 'Debe ingresar al menos el año o el mes para buscar.' });
            return;
        }
        setBuscando(true);
        limpiarBusqueda();
        setMensaje(null);
        try {
            const params = {};
            if (anio) params.anio = anio;
            if (mes)  params.mes  = mes;

            const res = await axios.get(`${API_BASE}/con-reproceso-periodo/buscar`, { params });
            const lista = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setBuscado(true);

            if (lista.length === 0) {
                setMensaje({ tipo: 'warning', texto: 'No se encontraron períodos CERRADOS con los filtros ingresados.' });
            } else {
                setResultados(lista);
                setMensaje({
                    tipo: 'info',
                    texto: `Se encontró${lista.length > 1 ? 'ron' : ''} ${lista.length} período${lista.length > 1 ? 's' : ''} cerrado${lista.length > 1 ? 's' : ''}. Seleccione uno para reprocesar.`
                });
            }
        } catch (err) {
            setMensaje({ tipo: 'error', texto: 'Error al buscar períodos. Verifique la conexión con el servidor.' });
        } finally {
            setBuscando(false);
        }
    };

    const handleSeleccionar = (periodo) => {
        setPeriodoSeleccionado(periodo);
        setMotivo('');
        setUsuarioId('');
        setMensaje(null);
    };

    const handleSolicitarReproceso = () => {
        if (motivo.trim().length < 20) {
            setMensaje({ tipo: 'warning', texto: 'El motivo debe tener al menos 20 caracteres.' });
            return;
        }
        if (!usuarioId) {
            setMensaje({ tipo: 'warning', texto: 'Debe seleccionar el usuario que autoriza el reproceso.' });
            return;
        }
        setMostrarConfirmacion(true);
    };

    const handleConfirmarReproceso = async () => {
        setMostrarConfirmacion(false);
        setProcesando(true);
        setMensaje(null);
        try {
            await axios.post(`${API_BASE}/con-reproceso-periodo/ejecutar`, {
                PER_PERIODO: periodoSeleccionado.PER_PERIODO,
                USU_USUARIO: usuarioId,
                MOTIVO: motivo,
            });
            setMensaje({
                tipo: 'success',
                texto: `✅ Reproceso exitoso. El período ${nombreMes(periodoSeleccionado.PER_MES)} ${periodoSeleccionado.PER_AÑO} ha sido reabierto. Se registró en Bitácora.`
            });
            setAnio('');
            setMes('');
            limpiarBusqueda();
            fetchHistorial();
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Error desconocido al ejecutar el reproceso.';
            setMensaje({ tipo: 'error', texto: `❌ Error: ${errMsg}` });
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Reproceso de Períodos Cerrados</h2>
            <p className="text-sm text-zinc-500 mb-6">
                Permite reabrir un período contable cerrado para realizar correcciones.
                Esta operación queda registrada en Bitácora.
            </p>

            {/* Advertencia */}
            <div className="px-4 py-3 rounded border border-amber-200 bg-amber-50 text-amber-700 text-sm mb-6">
                ⚠️ <strong>Advertencia:</strong> El reproceso de un período cerrado es una operación sensible.
                Asegúrese de contar con la autorización correspondiente antes de proceder.
            </div>

            {/* Mensaje de feedback */}
            {mensaje && (
                <div className={
                    mensaje.tipo === 'success' ? 'px-4 py-3 rounded border border-green-200 bg-green-50 text-green-800 text-sm mb-6'
                    : mensaje.tipo === 'error'   ? 'px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm mb-6'
                    : mensaje.tipo === 'info'    ? 'px-4 py-3 rounded border border-blue-200 bg-blue-50 text-blue-800 text-sm mb-6'
                    : 'px-4 py-3 rounded border border-amber-200 bg-amber-50 text-amber-700 text-sm mb-6'
                }>
                    {mensaje.texto}
                </div>
            )}

            {/* Paso 1: Búsqueda */}
            <div className="bg-white border border-zinc-200 rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <span className="text-sm font-semibold text-zinc-700">📅 Paso 1 — Buscar períodos cerrados</span>
                </div>
                <div className="p-6">
                    <p className="text-sm text-zinc-500 mb-4">
                        Puede buscar usando solo el año, solo el mes, o ambos a la vez.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input
                            label="Año (opcional)"
                            name="PER_AÑO"
                            type="number"
                            value={anio}
                            onChange={e => { setAnio(e.target.value); limpiarBusqueda(); }}
                            placeholder="Ej: 2025"
                            min="2000" max="2099"
                        />
                        <Select
                            label="Mes (opcional)"
                            name="PER_MES"
                            value={mes}
                            onChange={e => { setMes(e.target.value); limpiarBusqueda(); }}
                            options={MESES.map(m => ({ value: m.value, label: m.label }))}
                        />
                        <div className="mb-4">
                            <Button onClick={handleBuscar} disabled={buscando} variant="primary" size="md">
                                {buscando ? 'Buscando...' : '🔍 Buscar'}
                            </Button>
                        </div>
                    </div>

                    {/* Tabla de resultados */}
                    {buscado && resultados.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-zinc-700 mb-3">
                                Seleccione el período que desea reprocesar:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Año</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Mes</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estado</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {resultados.map(p => {
                                            const seleccionado = periodoSeleccionado?.PER_PERIODO === p.PER_PERIODO;
                                            return (
                                                <tr key={p.PER_PERIODO} className={`transition-colors ${seleccionado ? 'bg-blue-50' : 'bg-white hover:bg-zinc-50'}`}>
                                                    <td className="px-4 py-3 text-sm text-zinc-700">{p.PER_PERIODO}</td>
                                                    <td className="px-4 py-3 text-sm text-zinc-700 font-medium">{p.PER_AÑO}</td>
                                                    <td className="px-4 py-3 text-sm text-zinc-700 font-medium">{nombreMes(p.PER_MES)}</td>
                                                    <td className="px-4 py-3 text-sm text-zinc-700">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                                                            {p.ESP_NOMBRE}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-3">
                                                        <Button
                                                            variant={seleccionado ? 'secondary' : 'primary'}
                                                            size="sm"
                                                            onClick={() => seleccionado ? setPeriodoSeleccionado(null) : handleSeleccionar(p)}
                                                        >
                                                            {seleccionado ? 'Deseleccionar' : 'Seleccionar'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Paso 2 (solo si hay período seleccionado) */}
            {periodoSeleccionado && (
                <div className="bg-white border border-zinc-200 rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-zinc-200">
                        <span className="text-sm font-semibold text-zinc-700">📝 Paso 2 — Datos del reproceso</span>
                    </div>
                    <div className="p-6">
                        <div className="px-4 py-3 rounded border border-blue-200 bg-blue-50 text-blue-800 text-sm mb-4">
                            Período seleccionado: <strong>{nombreMes(periodoSeleccionado.PER_MES)} {periodoSeleccionado.PER_AÑO}</strong> (ID: {periodoSeleccionado.PER_PERIODO})
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Usuario que autoriza"
                                name="USU_USUARIO"
                                value={usuarioId}
                                onChange={e => setUsuarioId(e.target.value)}
                                options={usuarios.map(u => ({ value: u.USU_USUARIO, label: `${u.USU_USUARIO} - ${u.USU_USER}` }))}
                                required
                            />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                    Motivo del reproceso <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={motivo}
                                    onChange={e => setMotivo(e.target.value)}
                                    rows={3}
                                    placeholder="Describa la razón por la que se necesita reabrir este período (mínimo 20 caracteres)..."
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                                        border: '1px solid #d1d5db', fontSize: '14px', color: '#111827',
                                        resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                                    }}
                                />
                                <p className="text-xs text-zinc-400 mt-1">
                                    {motivo.length} caracteres ingresados
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <Button
                                onClick={handleSolicitarReproceso}
                                disabled={procesando || motivo.trim().length < 20}
                                variant="warning" size="lg"
                            >
                                {procesando ? '⏳ Procesando...' : '🔓 Ejecutar Reproceso'}
                            </Button>
                            {motivo.trim().length > 0 && motivo.trim().length < 20 && (
                                <span className="text-xs text-red-500">
                                    El motivo debe tener al menos 20 caracteres
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {mostrarConfirmacion && periodoSeleccionado && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="bg-white border border-zinc-200 rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-3">⚠️ Confirmar Reproceso</h3>
                        <p className="text-sm text-zinc-700 leading-relaxed mb-3">
                            Está a punto de <strong>reabrir el período {nombreMes(periodoSeleccionado.PER_MES)} {periodoSeleccionado.PER_AÑO}</strong>.
                            Esta acción cambiará su estado de <strong>CERRADO</strong> a <strong>ABIERTO</strong>
                            y quedará registrada en la bitácora del sistema.
                        </p>
                        <div className="px-4 py-3 rounded border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm mb-4">
                            <strong>Motivo:</strong> {motivo}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)}>Cancelar</Button>
                            <Button variant="warning" onClick={handleConfirmarReproceso}>Sí, reabrir período</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial */}
            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <span className="text-sm font-semibold text-zinc-700">📋 Historial de reprocesos</span>
                </div>
                <div className="p-6">
                    {cargandoHistorial ? (
                        <div className="px-4 py-10 text-center text-zinc-400 text-sm">Cargando historial...</div>
                    ) : historial.length === 0 ? (
                        <div className="px-4 py-10 text-center text-zinc-400 text-sm">
                            No se han realizado reprocesos aún.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Fecha y Hora</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Período</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Usuario</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {historial.map((h, i) => (
                                        <tr key={i} className="bg-white hover:bg-zinc-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-zinc-700">
                                                {new Date(h.BIT_FECHA_HORA).toLocaleString('es-GT')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-700 font-medium">{h.PERIODO}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-700">{h.USU_USER}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-700 max-w-xs">
                                                <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={h.MOTIVO}>
                                                    {h.MOTIVO}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CON_REPROCESO_PERIODO;
