import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';

// Mapeo de claves técnicas a nombres legibles
const LABELS = {
    PER_PERIODO: 'ID Período',
    PER_AÑO: 'Año',
    PER_MES: 'Mes',
    ESTADO_ANTERIOR: 'Estado anterior',
    MOTIVO_REPROCESO: 'Motivo',
    ASI_ASIENTO: 'ID Asiento',
    CUE_CUENTA: 'Cuenta',
    USU_USUARIO: 'Usuario',
};

const TABLAS = {
    CON_PERIODO: 'Período',
    CON_ASIENTO: 'Asiento',
    CON_ASIENTO_DETALLE: 'Detalle de Asiento',
    CON_CUENTA: 'Cuenta',
    CON_USUARIO: 'Usuario',
    CON_ROL: 'Rol',
    CON_USUARIO_ROL: 'Rol Usuario',
    CON_MONEDA: 'Moneda',
    CON_IMPUESTO: 'Impuesto',
    CON_TIPO_CAMBIO: 'Tipo de Cambio',
    CON_CENTRO_COSTO: 'Centro de Costo',
    CON_BITACORA: 'Bitácora',
};

const NOMBRES_MESES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

// Convierte el JSON crudo a tarjetitas legibles
const DatosPreviosDisplay = ({ raw }) => {
    if (!raw) return <span className="text-slate-400 italic text-sm">Sin datos</span>;

    let parsed;
    try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        // Si no es JSON válido, mostrar como texto plano
        return <span className="text-slate-600 text-sm whitespace-pre-wrap">{raw}</span>;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return <span className="text-slate-600 text-sm">{String(parsed)}</span>;
    }

    return (
        <div className="flex flex-col gap-1">
            {Object.entries(parsed).map(([key, value]) => {
                const label = LABELS[key] || key;
                const displayValue = key === 'PER_MES'
                    ? `${NOMBRES_MESES[value] || value} (${value})`
                    : String(value);

                return (
                    <div key={key} className="flex gap-2 items-baseline">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {label}:
                        </span>
                        <span className="text-xs text-slate-700">
                            {displayValue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Badge de color según la acción
const AccionBadge = ({ accion }) => {
    const colores = {
        INSERT: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
        UPDATE: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        DELETE: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
        REPROCESO: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
        ANULACION: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };
    const color = colores[accion] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    return (
        <span className={`${color.bg} ${color.text} ${color.border} border px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm inline-block`}>
            {accion}
        </span>
    );
};

const CON_BITACORACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        USU_USUARIO: '', BIT_TABLA_AFECTADA: '',
        BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);
    const [filtroUsuario, setFiltroUsuario] = useState('');

    const API_URL = 'http://localhost:5000/api/con-bitacora';

    useEffect(() => {
        fetchData();
        fetchCON_USUARIOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_USUARIOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-usuario');
            setCON_USUARIOData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            setFormData({ USU_USUARIO: '', BIT_TABLA_AFECTADA: '', BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toISOString().split('T')[0];
    };

    const handleEdit = (item) => {
        setFormData({
            USU_USUARIO: item.USU_USUARIO,
            BIT_TABLA_AFECTADA: item.BIT_TABLA_AFECTADA,
            BIT_ACCION: item.BIT_ACCION,
            BIT_FECHA_HORA: formatDateForInput(item.BIT_FECHA_HORA),
            BIT_DATOS_PREVIOS: item.BIT_DATOS_PREVIOS
        });
        setEditingId(item.BIT_BITACORA);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro permamentemente de la bitácora?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    const datosFiltrados = filtroUsuario
        ? data.filter(item => item.USU_USUARIO && item.USU_USUARIO.toString() === filtroUsuario.toString())
        : data;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-7xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bitácora de Eventos</h2>
                <p className="text-slate-500 mt-1">Auditoría y control de cambios en el sistema.</p>
            </header>

            {/* Formulario (Opcional en Bitácora, pero mantenido por requerimiento) */}
            <form onSubmit={handleSubmit} className="mb-10 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Select
                        label="Usuario"
                        name="USU_USUARIO"
                        value={formData.USU_USUARIO || ''}
                        onChange={handleChange}
                        options={CON_USUARIOData.map(opt => ({
                            value: opt.USU_USUARIO,
                            label: `${opt.USU_USUARIO} - ${opt.USU_USER || 'ID: ' + opt.USU_USUARIO}`
                        }))}
                        required
                    />
                    <Input label="Tabla Afectada" name="BIT_TABLA_AFECTADA" value={formData.BIT_TABLA_AFECTADA || ''} onChange={handleChange} type="text" required placeholder="Ej: CON_PERIODO" />
                    <Input label="Acción" name="BIT_ACCION" value={formData.BIT_ACCION || ''} onChange={handleChange} type="text" required placeholder="INSERT, UPDATE, DELETE..." />
                    <Input label="Fecha" name="BIT_FECHA_HORA" value={formData.BIT_FECHA_HORA || ''} onChange={handleChange} type="date" required />
                    <div className="md:col-span-2">
                        <Input label="Datos Previos (JSON)" name="BIT_DATOS_PREVIOS" value={formData.BIT_DATOS_PREVIOS || ''} onChange={handleChange} type="text" placeholder='{"ID": 1, "NOMBRE": "..."}' />
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <Button type='submit' size='lg' className="shadow-lg shadow-sky-200">
                        {editingId ? 'Actualizar Registro' : 'Crear Manualmente'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary'
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ USU_USUARIO: '', BIT_TABLA_AFECTADA: '', BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: '' });
                            }}>
                            Cancelar Edición
                        </Button>
                    )}
                </div>
            </form>

            {/* Filtros */}
            <div className="mb-6 flex flex-wrap items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1 min-w-[300px]">
                    <Select
                        label="Filtrar por Usuario Responsable:"
                        name="filtroUsuario"
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        options={CON_USUARIOData.map(opt => ({ 
                            value: opt.USU_USUARIO, 
                            label: `${opt.USU_USUARIO} - ${opt.USU_USER || 'ID: ' + opt.USU_USUARIO}` 
                        }))}
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Mostrando <span className="text-sky-600 font-bold">{datosFiltrados.length}</span> registros
                </div>
            </div>

            {/* Tabla con Estilo Premium */}
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50 border-bottom border-slate-200">
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider w-16">ID</th>
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider">Usuario</th>
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider">Tabla / Acción</th>
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider">Datos / Contexto</th>
                                <th className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {datosFiltrados.map((item) => (
                                <tr key={item.BIT_BITACORA} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-5 py-4 text-slate-400 font-mono">#{item.BIT_BITACORA}</td>
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-700">{item.USU_USUARIO}</div>
                                        <div className="text-[11px] text-slate-400 uppercase tracking-tighter">Responsable</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="mb-2">
                                            <span className="text-slate-700 font-medium block">
                                                {TABLAS[item.BIT_TABLA_AFECTADA] || item.BIT_TABLA_AFECTADA}
                                            </span>
                                        </div>
                                        <AccionBadge accion={item.BIT_ACCION} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-slate-600 whitespace-nowrap">
                                            {item.BIT_FECHA_HORA
                                                ? new Date(item.BIT_FECHA_HORA).toLocaleString('es-GT', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })
                                                : '---'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 max-w-xs xl:max-w-md">
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-y-auto max-h-40 shadow-inner">
                                            <DatosPreviosDisplay raw={item.BIT_DATOS_PREVIOS} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex flex-col gap-2 items-end justify-center">
                                            <Button variant='warning' size='sm' className="w-24" onClick={() => handleEdit(item)}>Editar</Button>
                                            <Button variant='danger' size='sm' className="w-24" onClick={() => handleDelete(item.BIT_BITACORA)}>Eliminar</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {datosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50">
                        <div className="text-slate-300 mb-2">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-slate-400 font-medium text-lg">No se encontraron registros en la bitácora</p>
                        <p className="text-slate-400 text-sm">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                )}
            </div>

            <footer className="mt-8 text-center text-slate-400 text-xs border-t border-slate-100 pt-6">
                &copy; {new Date().getFullYear()} Sistema Contable - Módulo de Auditoría
            </footer>
        </div>
    );
};

export default CON_BITACORACrud;