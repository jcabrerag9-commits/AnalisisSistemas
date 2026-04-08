
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

// Fila de detalle vacía por defecto
const DETALLE_VACIO = {
    CUE_CUENTA: '',
    ASD_DEBE_ORIGEN: 0,
    ASD_HABER_ORIGEN: 0,
    CTC_TASA_CAMBIO: 1,
    CTC_CENTRO_COSTO: '',
    MON_MONEDA: '',
};

const CON_ASIENTOCrud = () => {
    // ── Estado del encabezado (maestro) ──
    const [formData, setFormData] = useState({
        PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '',
        USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '',
    });

    // ── Estado del detalle ──
    const [detalles, setDetalles] = useState([{ ...DETALLE_VACIO }, { ...DETALLE_VACIO }]);

    // ── Estados para Anulación e Historial ──
    const [modalAnular, setModalAnular] = useState(false);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
    const [motivoAnulacion, setMotivoAnulacion] = useState('');
    const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [historial, setHistorial] = useState([]);

    // ── Estado de la tabla de asientos existentes ──
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // ── Modo Solo Lectura (periodo cerrado) ──
    const [isPeriodoCerrado, setIsPeriodoCerrado] = useState(false);

    // ── Catálogos para selects ──
    const [CON_PERIODOData, setCON_PERIODOData] = useState([]);
    const [CON_TIPO_ASIENTOData, setCON_TIPO_ASIENTOData] = useState([]);
    const [CON_ESTADO_ASIENTOData, setCON_ESTADO_ASIENTOData] = useState([]);
    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);
    const [CON_CUENTAData, setCON_CUENTAData] = useState([]);
    const [CON_CENTRO_COSTOData, setCON_CENTRO_COSTOData] = useState([]);
    const [CON_TIPO_CAMBIOData, setCON_TIPO_CAMBIOData] = useState([]);
    const [CON_MONEDAData, setCON_MONEDAData] = useState([]);

    // ── Feedback ──
    const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'error', texto }

    const API_URL = 'http://localhost:5000/api/con-asiento';

    // ── Fetch inicial ──
    useEffect(() => {
        fetchData();
        fetchPeriodo();
        fetchCatalogo('http://localhost:5000/api/con-periodo', setCON_PERIODOData);
        fetchCatalogo('http://localhost:5000/api/con-tipo-asiento', setCON_TIPO_ASIENTOData);
        fetchCatalogo('http://localhost:5000/api/con-estado-asiento', setCON_ESTADO_ASIENTOData);
        fetchCatalogo('http://localhost:5000/api/con-usuario', setCON_USUARIOData);
        fetchCatalogo('http://localhost:5000/api/con-cuenta', setCON_CUENTAData);
        fetchCatalogo('http://localhost:5000/api/con-centro-costo', setCON_CENTRO_COSTOData);
        fetchCatalogo('http://localhost:5000/api/con-tipo-cambio', setCON_TIPO_CAMBIOData);
        fetchCatalogo('http://localhost:5000/api/con-moneda', setCON_MONEDAData);
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            console.log(res.data);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPeriodo = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-periodo');
            console.log(res.data);
            setCON_PERIODOData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCatalogo = async (url, setter) => {
        try {
            const res = await axios.get(url);
            console.log(res.data)
            setter(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ══════════════════════════════════════════
    //  CÁLCULOS EN TIEMPO REAL
    // ══════════════════════════════════════════
    const { totalDebe, totalHaber, diferencia } = useMemo(() => {
        let totalDebe = 0;
        let totalHaber = 0;
        detalles.forEach(d => {
            const tasa = parseFloat(d.CTC_TASA_CAMBIO) || 0;
            totalDebe += (parseFloat(d.ASD_DEBE_ORIGEN) || 0) * tasa;
            totalHaber += (parseFloat(d.ASD_HABER_ORIGEN) || 0) * tasa;
        });
        return {
            totalDebe: Math.round(totalDebe * 100) / 100,
            totalHaber: Math.round(totalHaber * 100) / 100,
            diferencia: Math.round((totalDebe - totalHaber) * 100) / 100,
        };
    }, [detalles]);

    const cuadrado = Math.abs(diferencia) <= 0.01;
    const puedeGuardar = cuadrado && detalles.length >= 2;

    // ══════════════════════════════════════════
    //  HANDLERS — ENCABEZADO
    // ══════════════════════════════════════════
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ══════════════════════════════════════════
    //  HANDLERS — DETALLES
    // ══════════════════════════════════════════
    const handleDetalleChange = (index, e) => {
        const { name, value } = e.target;
        const nuevosDetalles = [...detalles];

        // Para campos numéricos, convertir a número; para selects, mantener el valor tal cual
        let valorFinal = value;
        if (['ASD_DEBE_ORIGEN', 'ASD_HABER_ORIGEN', 'CTC_TASA_CAMBIO'].includes(name)) {
            // Permitir campo vacío mientras el usuario escribe, pero tratar como 0 para la lógica
            valorFinal = value === '' ? '' : parseFloat(value);
            if (typeof valorFinal === 'number' && isNaN(valorFinal)) valorFinal = 0;
        }

        nuevosDetalles[index] = { ...nuevosDetalles[index], [name]: valorFinal };

        // Regla XOR contable: si pone valor en Debe, se limpia Haber y viceversa
        const numVal = typeof valorFinal === 'number' ? valorFinal : parseFloat(valorFinal) || 0;
        if (name === 'ASD_DEBE_ORIGEN' && numVal > 0) {
            nuevosDetalles[index].ASD_HABER_ORIGEN = 0;
        } else if (name === 'ASD_HABER_ORIGEN' && numVal > 0) {
            nuevosDetalles[index].ASD_DEBE_ORIGEN = 0;
        }

        setDetalles(nuevosDetalles);
    };

    const agregarDetalle = () => {
        setDetalles([...detalles, { ...DETALLE_VACIO }]);
    };

    const eliminarDetalle = (index) => {
        if (detalles.length <= 2) return; // Mínimo 2 filas
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    // ══════════════════════════════════════════
    //  SUBMIT
    // ══════════════════════════════════════════
    const resetFormulario = () => {
        setFormData({
            PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '',
            USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '',
        });
        setDetalles([{ ...DETALLE_VACIO }, { ...DETALLE_VACIO }]);
        setEditingId(null);
        setIsPeriodoCerrado(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!puedeGuardar) return;

        // Preparar detalles con valores numéricos (incluyendo campos que espera el SP)
        const detallesPayload = detalles.map(d => {
            const tasa = parseFloat(d.CTC_TASA_CAMBIO) || 1;
            const debeOrigen = parseFloat(d.ASD_DEBE_ORIGEN) || 0;
            const haberOrigen = parseFloat(d.ASD_HABER_ORIGEN) || 0;
            return {
                // Enviar el PK del detalle existente (null para filas nuevas)
                ...(editingId && { ASD_ASIENTO_DETALLE: d.ASD_ASIENTO_DETALLE || null }),
                CUE_CUENTA: Number(d.CUE_CUENTA),
                CTC_CENTRO_COSTO: d.CTC_CENTRO_COSTO ? Number(d.CTC_CENTRO_COSTO) : null,
                MON_MONEDA: Number(d.MON_MONEDA),
                CTC_TASA_CAMBIO: tasa,
                ASD_DEBE_ORIGEN: debeOrigen,
                ASD_HABER_ORIGEN: haberOrigen,
                ASD_DEBE_LOCAL: Math.round(debeOrigen * tasa * 100) / 100,
                ASD_HABER_LOCAL: Math.round(haberOrigen * tasa * 100) / 100,
            };
        });

        const payload = { ...formData, detalles: detallesPayload };

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, payload);
                setMensaje({ tipo: 'success', texto: '¡Asiento actualizado correctamente!' });
            } else {
                console.log(payload);
                await axios.post(API_URL, payload);
                setMensaje({ tipo: 'success', texto: '¡Asiento creado y cuadrado correctamente!' });
            }
            resetFormulario();
            fetchData();
        } catch (err) {
            const textoError = err.response?.data?.error || err.message;
            setMensaje({ tipo: 'error', texto: `Error: ${textoError}` });
        }

        // Ocultar mensaje tras 5 s
        setTimeout(() => setMensaje(null), 5000);
    };

    // ══════════════════════════════════════════
    //  HANDLERS — ANULACIÓN E HISTORIAL
    // ══════════════════════════════════════════
    const handleAbrirModalAnular = (item) => {
        setAsientoSeleccionado(item);
        setMotivoAnulacion('');
        setModalAnular(true);
    };

    const handleCerrarModal = () => {
        setModalAnular(false);
        setAsientoSeleccionado(null);
        setMotivoAnulacion('');
    };

    const handleAnularAsiento = async () => {
        if (!motivoAnulacion.trim()) return setMensaje({ tipo: 'error', texto: 'Ingrese un motivo.' });
        if (motivoAnulacion.trim().length < 10) return setMensaje({ tipo: 'error', texto: 'El motivo debe tener al menos 10 caracteres.' });
        if (!window.confirm(`¿Está seguro de anular el asiento #${asientoSeleccionado.ASI_ASIENTO}?`)) return;

        setProcesandoAnulacion(true);
        try {
            const response = await axios.post(`${API_URL}/anular`, {
                asi_asiento: asientoSeleccionado.ASI_ASIENTO,
                usuarioId: asientoSeleccionado.USU_USUARIO || 1,
                motivo: motivoAnulacion
            });
            const data = response.data;
            setMensaje({ tipo: 'success', texto: `${data.message}. Asiento anulado: #${data.data?.asientoAnulado}. Reversión: #${data.data?.asientoReversion}` });
            handleCerrarModal();
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setMensaje({ tipo: 'error', texto: `Error: ${msg}` });
        } finally {
            setProcesandoAnulacion(false);
            window.scrollTo(0, 0);
        }
    };

    const handleVerHistorial = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-bitacora');
            const dataFilter = res.data.filter(b => b.BIT_TABLA_AFECTADA === 'CON_ASIENTO' && b.BIT_ACCION === 'ANULACION');
            setHistorial(dataFilter.sort((a, b) => new Date(b.BIT_FECHA_HORA) - new Date(a.BIT_FECHA_HORA)));
            setMostrarHistorial(true);
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'error', texto: 'Error cargando historial. Asegúrate que la ruta exista.' });
        }
    };

    // ══════════════════════════════════════════
    //  HANDLERS — TABLA EXISTENTE
    // ══════════════════════════════════════════
    const handleEdit = async (item) => {
        setFormData({
            PER_PERIODO: item.PER_PERIODO, TPA_TIPO_ASIENTO: item.TPA_TIPO_ASIENTO,
            ESA_ESTADO_ASIENTO: item.ESA_ESTADO_ASIENTO, USU_USUARIO: item.USU_USUARIO,
            ASI_FECHA: new Date(item.ASI_FECHA).toISOString().split('T')[0], ASI_GLOSA: item.ASI_GLOSA,
        });
        setEditingId(item.ASI_ASIENTO);

        // Verificar si el periodo está cerrado (estado 2)
        const periodoDelAsiento = CON_PERIODOData.find(p => p.PER_PERIODO === item.PER_PERIODO);
        const cerrado = periodoDelAsiento?.ESP_ESTADO_PERIODO === 2
            || item.ESP_ESTADO_PERIODO === 2;
        setIsPeriodoCerrado(cerrado);

        // Cargar los detalles relacionados con este asiento
        try {
            const res = await axios.get(`http://localhost:5000/api/con-asiento-detalle/asiento/${item.ASI_ASIENTO}`);
            if (res.data && res.data.length > 0) {
                const detallesCargados = res.data.map(d => ({
                    ASD_ASIENTO_DETALLE: d.ASD_ASIENTO_DETALLE, // PK del detalle existente
                    CUE_CUENTA: d.CUE_CUENTA || '',
                    ASD_DEBE_ORIGEN: d.ASD_DEBE_ORIGEN != null ? Number(d.ASD_DEBE_ORIGEN) : 0,
                    ASD_HABER_ORIGEN: d.ASD_HABER_ORIGEN != null ? Number(d.ASD_HABER_ORIGEN) : 0,
                    CTC_TASA_CAMBIO: d.CTC_TASA_CAMBIO != null ? Number(d.CTC_TASA_CAMBIO) : 1,
                    CTC_CENTRO_COSTO: d.CTC_CENTRO_COSTO || '',
                    MON_MONEDA: d.MON_MONEDA || '',
                }));
                setDetalles(detallesCargados);
            } else {
                setDetalles([{ ...DETALLE_VACIO }, { ...DETALLE_VACIO }]);
            }
        } catch (err) {
            console.error('Error al cargar detalles:', err);
            setDetalles([{ ...DETALLE_VACIO }, { ...DETALLE_VACIO }]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este asiento?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // ══════════════════════════════════════════
    //  RENDER
    // ══════════════════════════════════════════
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* ── Header ── */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                    Gestión de Asientos Contables
                </h2>
            </div>

            {/* ── Banner Modo Solo Lectura ── */}
            {isPeriodoCerrado && (
                <div className="mx-8 mt-4 px-4 py-3 rounded-lg text-sm font-medium bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Modo Solo Lectura:</strong> El libro diario de este periodo ya ha sido cerrado.</span>
                </div>
            )}

            {/* ── Mensaje de feedback ── */}
            {mensaje && (
                <div className={`mx-8 mt-4 px-4 py-3 rounded-lg text-sm font-medium ${mensaje.tipo === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* ══════════════════════════════════════
                    SECCIÓN MAESTRO — Encabezado del Asiento
                   ══════════════════════════════════════ */}
                <div className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Encabezado del Asiento</h3>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        <Select label="Periodo" name="PER_PERIODO" value={formData.PER_PERIODO || ''} onChange={handleChange}
                            options={CON_PERIODOData.map(opt => ({ value: opt.PER_PERIODO, label: `${opt.PER_PERIODO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required disabled={isPeriodoCerrado} />
                        <Select label="Tipo de Asiento" name="TPA_TIPO_ASIENTO" value={formData.TPA_TIPO_ASIENTO || ''} onChange={handleChange}
                            options={CON_TIPO_ASIENTOData.map(opt => ({ value: opt.TPA_TIPO_ASIENTO, label: `${opt.TPA_TIPO_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required disabled={isPeriodoCerrado} />
                        <Select label="Estado" name="ESA_ESTADO_ASIENTO" value={formData.ESA_ESTADO_ASIENTO || ''} onChange={handleChange}
                            options={CON_ESTADO_ASIENTOData.map(opt => ({ value: opt.ESA_ESTADO_ASIENTO, label: `${opt.ESA_ESTADO_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required disabled={isPeriodoCerrado} />
                        <Select label="Usuario" name="USU_USUARIO" value={formData.USU_USUARIO || ''} onChange={handleChange}
                            options={CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required disabled={isPeriodoCerrado} />
                        <Input label="Fecha" name="ASI_FECHA" value={formData.ASI_FECHA || ''} onChange={handleChange} type="date" required disabled={isPeriodoCerrado} />
                        <Input label="Glosa (Descripción)" name="ASI_GLOSA" value={formData.ASI_GLOSA || ''} onChange={handleChange} required disabled={isPeriodoCerrado} />
                    </div>
                </div>

                {/* ══════════════════════════════════════
                    SECCIÓN DETALLE — Movimientos del Asiento
                   ══════════════════════════════════════ */}
                <div className="mx-8 mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-700">Movimientos (Detalle)</h3>
                        {!isPeriodoCerrado && (
                            <Button type="button" variant="success" size="sm" onClick={agregarDetalle}>
                                + Agregar Movimiento
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-200 text-left text-slate-700">
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">#</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap min-w-[180px]">Cuenta</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Debe Origen</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Haber Origen</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Tasa Cambio</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap min-w-[160px]">Centro de Costo</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap min-w-[150px]">Moneda</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap text-right">Debe Calculado</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap text-right">Haber Calculado</th>
                                    <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalles.map((det, idx) => {
                                    const tasa = parseFloat(det.CTC_TASA_CAMBIO) || 0;
                                    const debeCal = ((parseFloat(det.ASD_DEBE_ORIGEN) || 0) * tasa).toFixed(2);
                                    const haberCal = ((parseFloat(det.ASD_HABER_ORIGEN) || 0) * tasa).toFixed(2);

                                    return (
                                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100 transition-colors duration-150">
                                            <td className="px-3 py-2 text-slate-500 font-medium">{idx + 1}</td>
                                            <td className="px-2 py-2">
                                                <Select name="CUE_CUENTA" value={det.CUE_CUENTA || ''} onChange={(e) => handleDetalleChange(idx, e)}
                                                    options={CON_CUENTAData.map(opt => ({ value: opt.CUE_CUENTA, label: `${opt.CUE_CUENTA} - ${opt.CUE_NOMBRE || opt[Object.keys(opt)[1]]}` }))}
                                                    required disabled={isPeriodoCerrado} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input name="ASD_DEBE_ORIGEN" type="number" step="0.01" min="0" value={det.ASD_DEBE_ORIGEN}
                                                    onChange={(e) => handleDetalleChange(idx, e)} placeholder="0.00" disabled={isPeriodoCerrado} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input name="ASD_HABER_ORIGEN" type="number" step="0.01" min="0" value={det.ASD_HABER_ORIGEN}
                                                    onChange={(e) => handleDetalleChange(idx, e)} placeholder="0.00" disabled={isPeriodoCerrado} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Input name="CTC_TASA_CAMBIO" type="number" step="0.01" min="0" value={det.CTC_TASA_CAMBIO}
                                                    onChange={(e) => handleDetalleChange(idx, e)} placeholder="1.00" disabled={isPeriodoCerrado} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Select name="CTC_CENTRO_COSTO" value={det.CTC_CENTRO_COSTO || ''} onChange={(e) => handleDetalleChange(idx, e)}
                                                    options={CON_CENTRO_COSTOData.map(opt => ({ value: opt.CTC_CENTRO_COSTO, label: `${opt.CTC_CENTRO_COSTO} - ${opt[Object.keys(opt)[1]]}` }))}
                                                    disabled={isPeriodoCerrado}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <Select name="MON_MONEDA" value={det.MON_MONEDA || ''} onChange={(e) => handleDetalleChange(idx, e)}
                                                    options={CON_MONEDAData.map(opt => ({ value: opt.MON_MONEDA, label: `${opt.MON_MONEDA} - ${opt[Object.keys(opt)[1]]}` }))}
                                                    required disabled={isPeriodoCerrado} />
                                            </td>
                                            <td className="px-3 py-2 text-right font-mono text-slate-600">{debeCal}</td>
                                            <td className="px-3 py-2 text-right font-mono text-slate-600">{haberCal}</td>
                                            <td className="px-3 py-2">
                                                {!isPeriodoCerrado && (
                                                    <Button type="button" variant="danger" size="sm"
                                                        onClick={() => eliminarDetalle(idx)}
                                                        disabled={detalles.length <= 2}>
                                                        Eliminar
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* ── Fila de totales ── */}
                            <tfoot>
                                <tr className="bg-slate-100 font-semibold text-slate-800">
                                    <td colSpan={7} className="px-3 py-3 text-right text-base">Totales:</td>
                                    <td className="px-3 py-3 text-right font-mono text-base">{totalDebe.toFixed(2)}</td>
                                    <td className="px-3 py-3 text-right font-mono text-base">{totalHaber.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                                <tr className={`font-bold text-base ${cuadrado ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <td colSpan={7} className="px-3 py-3 text-right">
                                        Diferencia:
                                    </td>
                                    <td colSpan={2} className="px-3 py-3 text-right font-mono">
                                        {diferencia.toFixed(2)}
                                        {cuadrado
                                            ? ' Cuadrado'
                                            : ' Descuadrado'}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* ── Botones de acción ── */}
                <div className="mx-8 mb-8 flex items-center gap-3">
                    {!isPeriodoCerrado && (
                        <Button type="submit" size="lg" disabled={!puedeGuardar}>
                            {editingId ? 'Actualizar Asiento' : 'Guardar Asiento'}
                        </Button>
                    )}
                    {editingId && (
                        <Button type="button" size="lg" variant="secondary" onClick={resetFormulario}>
                            {isPeriodoCerrado ? 'Cerrar Vista' : 'Cancelar'}
                        </Button>
                    )}
                    {!isPeriodoCerrado && !cuadrado && (
                        <span className="text-sm text-red-500 font-medium ml-2">
                            El asiento no cuadra. La diferencia debe ser 0.00 para poder guardar.
                        </span>
                    )}
                    {!isPeriodoCerrado && detalles.length < 2 && (
                        <span className="text-sm text-red-500 font-medium ml-2">
                            Debe tener al menos 2 movimientos.
                        </span>
                    )}
                </div>
            </form>

            {/* ══════════════════════════════════════
                TABLA DE ASIENTOS EXISTENTES
               ══════════════════════════════════════ */}
            <div className="px-8 pb-8 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">Asientos Registrados</h3>
                    <Button type="button" variant="secondary" size="sm" onClick={handleVerHistorial}>
                        Ver Historial de Anulaciones
                    </Button>
                </div>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-100 text-left text-slate-700">
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Asiento</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Periodo</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Tipo</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Estado</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Usuario</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Fecha</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Glosa</th>
                            <th className="px-3 py-3 font-semibold border-b-2 border-slate-300 whitespace-nowrap">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.ASI_ASIENTO} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
                                <td className="px-3 py-3 text-slate-500">{item.ASI_ASIENTO}</td>
                                <td className="px-3 py-3 text-slate-500">{item.PER_PERIODO}</td>
                                <td className="px-3 py-3 text-slate-500">{item.TPA_TIPO_ASIENTO}</td>
                                <td className="px-3 py-3 text-slate-500">{item.ESA_ESTADO_ASIENTO}</td>
                                <td className="px-3 py-3 text-slate-500">{item.USU_USUARIO}</td>
                                <td className="px-3 py-3 text-slate-500">{item.ASI_FECHA}</td>
                                <td className="px-3 py-3 text-slate-500">{item.ASI_GLOSA}</td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const periodo = CON_PERIODOData.find(p => p.PER_PERIODO === item.PER_PERIODO);
                                            const cerrado = periodo?.ESP_ESTADO_PERIODO === 2;
                                            return cerrado ? (
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                                                    Ver
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button type="button" variant="warning" size="sm" onClick={() => handleEdit(item)}>
                                                        Editar
                                                    </Button>
                                                    <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(item.ASI_ASIENTO)}>
                                                        Eliminar
                                                    </Button>
                                                    <Button type="button" variant="secondary" size="sm" onClick={() => handleAbrirModalAnular(item)}>
                                                        Anular
                                                    </Button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <p className="text-center py-8 text-slate-400 text-sm">No hay asientos registrados.</p>
                )}
            </div>

            {/* ══════════════════════════════════════
                MODALES ANULACIÓN E HISTORIAL
               ══════════════════════════════════════ */}
            {modalAnular && asientoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCerrarModal}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-red-600">⚠️ Anular Asiento #{asientoSeleccionado.ASI_ASIENTO}</h2>
                            <button onClick={handleCerrarModal} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="bg-slate-50 p-3 rounded mb-4 text-sm whitespace-pre-wrap">
                                <strong>Glosa:</strong> {asientoSeleccionado.ASI_GLOSA}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="txtMotivo">Motivo (mínimo 10 caracteres) *</label>
                                <textarea id="txtMotivo" className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-200 text-slate-900" rows="3" required defaultValue={motivoAnulacion} onChange={e => setMotivoAnulacion(e.target.value)} placeholder="Ingrese el motivo detallado de la anulación..."></textarea>
                                <div className="text-xs text-slate-500 mt-1">{motivoAnulacion.length} / 10 caracteres mínimos</div>
                            </div>
                            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                                <strong>⚠️ ADVERTENCIA:</strong> Esta acción cambiará el estado a ANULADO, creará un asiento de REVERSIÓN, y quedará registrada. No se puede deshacer.
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50">
                            <Button type="button" variant="secondary" onClick={handleCerrarModal} disabled={procesandoAnulacion}>Cancelar</Button>
                            <Button type="button" variant="danger" disabled={procesandoAnulacion || motivoAnulacion.trim().length < 10} onClick={handleAnularAsiento}>
                                {procesandoAnulacion ? 'Procesando...' : 'Confirmar Anulación'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarHistorial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setMostrarHistorial(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">📋 Historial de Anulaciones</h2>
                            <button onClick={() => setMostrarHistorial(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {historial.length === 0 ? (
                                <p className="text-center text-slate-500">No hay anulaciones registradas.</p>
                            ) : (
                                <table className="w-full border-collapse text-sm text-left text-slate-800">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-700">
                                            <th className="p-2 border-b">Fecha Date</th>
                                            <th className="p-2 border-b">Usuario</th>
                                            <th className="p-2 border-b">Asientos</th>
                                            <th className="p-2 border-b">Glosa Anterior / Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map((h, i) => {
                                            let previos = {};
                                            try { previos = JSON.parse(h.BIT_DATOS_PREVIOS || '{}'); } catch (e) { }
                                            return (
                                                <tr key={i} className="border-b hover:bg-slate-50">
                                                    <td className="p-2">{new Date(h.BIT_FECHA_HORA).toLocaleString()}</td>
                                                    <td className="p-2">{h.USU_USUARIO}</td>
                                                    <td className="p-2">
                                                        Anulado: #{previos.asiento_anulado}<br />
                                                        Reversión: #{previos.asiento_reversion}
                                                    </td>
                                                    <td className="p-2">
                                                        <span className="text-xs text-slate-500 font-semibold">Motivo:</span> {previos.motivo}<br />
                                                        <span className="text-xs text-slate-500 font-semibold">Glosa:</span> {previos.glosa_original}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CON_ASIENTOCrud;
