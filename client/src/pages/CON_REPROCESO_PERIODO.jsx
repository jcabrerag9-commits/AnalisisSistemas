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

const colorMensaje = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
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
        <div style={{ maxWidth: '900px' }}>
            {/* Encabezado */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '700', margin: 0 }}>
                    Reproceso de Períodos Cerrados
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
                    Permite reabrir un período contable cerrado para realizar correcciones.
                    Esta operación queda registrada en Bitácora.
                </p>
            </div>

            {/* Advertencia */}
            <div style={{
                background: '#fffbeb', border: '1px solid #f59e0b',
                borderLeft: '4px solid #f59e0b', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '24px', fontSize: '13px', color: '#92400e'
            }}>
                ⚠️ <strong>Advertencia:</strong> El reproceso de un período cerrado es una operación sensible.
                Asegúrese de contar con la autorización correspondiente antes de proceder.
            </div>

            {/* Paso 1: Búsqueda */}
            <div style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', marginBottom: '20px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ color: '#334155', fontSize: '15px', fontWeight: '600', marginBottom: '4px', marginTop: 0 }}>
                    📅 Paso 1 — Buscar períodos cerrados
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>
                    Puede buscar usando solo el año, solo el mes, o ambos a la vez.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
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
                    <div style={{ marginBottom: '16px' }}>
                        <Button onClick={handleBuscar} disabled={buscando} variant="primary" size="md">
                            {buscando ? 'Buscando...' : '🔍 Buscar'}
                        </Button>
                    </div>
                </div>

                {/* Tabla de resultados */}
                {buscado && resultados.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                            Seleccione el período que desea reprocesar:
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Año</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Mes</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Estado</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map(p => {
                                    const seleccionado = periodoSeleccionado?.PER_PERIODO === p.PER_PERIODO;
                                    return (
                                        <tr key={p.PER_PERIODO} style={{
                                            borderBottom: '1px solid #e2e8f0',
                                            background: seleccionado ? '#eff6ff' : 'white',
                                            transition: 'background 0.2s'
                                        }}>
                                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.PER_PERIODO}</td>
                                            <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '500' }}>{p.PER_AÑO}</td>
                                            <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '500' }}>{nombreMes(p.PER_MES)}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span style={{
                                                    background: '#fee2e2', color: '#991b1b',
                                                    padding: '2px 10px', borderRadius: '20px',
                                                    fontSize: '11px', fontWeight: '600'
                                                }}>
                                                    {p.ESP_NOMBRE}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
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
                )}
            </div>

            {/* Paso 2 (solo si hay período seleccionado) */}
            {periodoSeleccionado && (
                <div style={{
                    background: 'white', padding: '24px', borderRadius: '12px',
                    boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ color: '#334155', fontSize: '15px', fontWeight: '600', marginBottom: '8px', marginTop: 0 }}>
                        📝 Paso 2 — Datos del reproceso
                    </h3>
                    <div style={{
                        background: '#eff6ff', border: '1px solid #93c5fd',
                        borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
                        fontSize: '13px', color: '#1e40af'
                    }}>
                        Período seleccionado: <strong>{nombreMes(periodoSeleccionado.PER_MES)} {periodoSeleccionado.PER_AÑO}</strong> (ID: {periodoSeleccionado.PER_PERIODO})
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Select
                            label="Usuario que autoriza"
                            name="USU_USUARIO"
                            value={usuarioId}
                            onChange={e => setUsuarioId(e.target.value)}
                            options={usuarios.map(u => ({ value: u.USU_USUARIO, label: `${u.USU_USUARIO} - ${u.USU_USER}` }))}
                            required
                        />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                Motivo del reproceso <span style={{ color: '#ef4444' }}>*</span>
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
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                {motivo.length} caracteres ingresados
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                        <Button
                            onClick={handleSolicitarReproceso}
                            disabled={procesando || motivo.trim().length < 20}
                            variant="warning" size="lg"
                        >
                            {procesando ? '⏳ Procesando...' : '🔓 Ejecutar Reproceso'}
                        </Button>
                        {motivo.trim().length > 0 && motivo.trim().length < 20 && (
                            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#ef4444' }}>
                                El motivo debe tener al menos 20 caracteres
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Mensaje */}
            {mensaje && (
                <div style={{
                    background: colorMensaje[mensaje.tipo].bg,
                    border: `1px solid ${colorMensaje[mensaje.tipo].border}`,
                    borderRadius: '8px', padding: '12px 16px',
                    color: colorMensaje[mensaje.tipo].text,
                    fontSize: '14px', marginBottom: '20px'
                }}>
                    {mensaje.texto}
                </div>
            )}

            {/* Modal de confirmación */}
            {mostrarConfirmacion && periodoSeleccionado && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px',
                        maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{ color: '#0f172a', marginTop: 0, fontSize: '18px' }}>⚠️ Confirmar Reproceso</h3>
                        <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                            Está a punto de <strong>reabrir el período {nombreMes(periodoSeleccionado.PER_MES)} {periodoSeleccionado.PER_AÑO}</strong>.
                            Esta acción cambiará su estado de <strong>CERRADO</strong> a <strong>ABIERTO</strong>
                            y quedará registrada en la bitácora del sistema.
                        </p>
                        <p style={{ color: '#475569', fontSize: '13px', background: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                            <strong>Motivo:</strong> {motivo}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)}>Cancelar</Button>
                            <Button variant="warning" onClick={handleConfirmarReproceso}>Sí, reabrir período</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial */}
            <div style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ color: '#334155', fontSize: '15px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>
                    📋 Historial de reprocesos
                </h3>
                {cargandoHistorial ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Cargando historial...</p>
                ) : historial.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                        No se han realizado reprocesos aún.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Fecha y Hora</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Período</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                                    <th style={{ padding: '10px 12px', borderBottom: '2px solid #cbd5e1' }}>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((h, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                            {new Date(h.BIT_FECHA_HORA).toLocaleString('es-GT')}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#334155', fontWeight: '500' }}>{h.PERIODO}</td>
                                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{h.USU_USER}</td>
                                        <td style={{ padding: '10px 12px', color: '#64748b', maxWidth: '260px' }}>
                                            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={h.MOTIVO}>
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
    );
};

export default CON_REPROCESO_PERIODO;