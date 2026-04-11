import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';

// Mapeo de claves técnicas a nombres legibles
const LABELS = {
    PER_PERIODO:      'ID Período',
    PER_AÑO:          'Año',
    PER_MES:          'Mes',
    ESTADO_ANTERIOR:  'Estado anterior',
    MOTIVO_REPROCESO: 'Motivo',
    ASI_ASIENTO:      'ID Asiento',
    CUE_CUENTA:       'Cuenta',
    USU_USUARIO:      'Usuario',
};

const TABLAS = {
    CON_PERIODO:           'Período',
    CON_ASIENTO:           'Asiento',
    CON_ASIENTO_DETALLE:   'Detalle de Asiento',
    CON_CUENTA:            'Cuenta',
    CON_USUARIO:           'Usuario',
    CON_ROL:               'Rol',
    CON_USUARIO_ROL:       'Rol Usuario',
    CON_MONEDA:            'Moneda',
    CON_IMPUESTO:          'Impuesto',
    CON_TIPO_CAMBIO:       'Tipo de Cambio',
    CON_CENTRO_COSTO:      'Centro de Costo',
    CON_BITACORA:          'Bitácora',
};

const NOMBRES_MESES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

// Convierte el JSON crudo a tarjetitas legibles
const DatosPreviosDisplay = ({ raw }) => {
    if (!raw) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin datos</span>;

    let parsed;
    try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        // Si no es JSON válido, mostrar como texto plano
        return <span style={{ color: '#64748b', fontSize: '13px' }}>{raw}</span>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(parsed).map(([key, value]) => {
                const label = LABELS[key] || key;
                // Si la clave es PER_MES, mostrar nombre del mes
                const displayValue = key === 'PER_MES'
                    ? `${NOMBRES_MESES[value] || value} (${value})`
                    : String(value);

                return (
                    <div key={key} style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: '600', color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            whiteSpace: 'nowrap'
                        }}>
                            {label}:
                        </span>
                        <span style={{ fontSize: '13px', color: '#334155' }}>
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
        INSERT:    { bg: '#dcfce7', text: '#166534' },
        UPDATE:    { bg: '#dbeafe', text: '#1e40af' },
        DELETE:    { bg: '#fee2e2', text: '#991b1b' },
        REPROCESO: { bg: '#fef3c7', text: '#92400e' },
    };
    const color = colores[accion] || { bg: '#f1f5f9', text: '#475569' };
    return (
        <span style={{
            background: color.bg, color: color.text,
            padding: '2px 10px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '600'
        }}>
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
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Bitácora</h2>

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <Select
                        label="Usuario"
                        name="USU_USUARIO"
                        value={formData.USU_USUARIO || ''}
                        onChange={handleChange}
                        options={CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))}
                        required
                    />
                    <Input label="Tabla Afectada" name="BIT_TABLA_AFECTADA" value={formData.BIT_TABLA_AFECTADA || ''} onChange={handleChange} type="text" required />
                    <Input label="Acción" name="BIT_ACCION" value={formData.BIT_ACCION || ''} onChange={handleChange} type="text" required />
                    <Input label="Fecha" name="BIT_FECHA_HORA" value={formData.BIT_FECHA_HORA || ''} onChange={handleChange} type="date"
                        onClick={(e) => e.target.showPicker && e.target.showPicker()} required />
                    <Input label="Datos Previos" name="BIT_DATOS_PREVIOS" value={formData.BIT_DATOS_PREVIOS || ''} onChange={handleChange} type="text" />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2'
                            onClick={() => { setEditingId(null); setFormData({ USU_USUARIO: '', BIT_TABLA_AFECTADA: '', BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
    // Filtrar localmente la data de bitácora mediante usuario exacto (si existe)
    const datosFiltrados = filtroUsuario 
        ? data.filter(item => item.USU_USUARIO && item.USU_USUARIO.toString() === filtroUsuario.toString())
        : data;

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Bitácora de Eventos (Auditoría)</h2>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, maxWidth: '350px' }}>
                    <Select
                        label="Filtrar por Usuario Responsable:"
                        name="filtroUsuario"
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        options={[
                            { value: '', label: '-- Mostrar todos --' },
                            ...CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))
                        ]}
                    />
                </div>
            </div>

            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID Bitacora</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tabla Afectada</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acción</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Fecha y Hora</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Datos Previos</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.BIT_BITACORA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_BITACORA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USUARIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>
                                    {TABLAS[item.BIT_TABLA_AFECTADA] || item.BIT_TABLA_AFECTADA}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <AccionBadge accion={item.BIT_ACCION} />
                                </td>
                                <td style={{ padding: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                    {item.BIT_FECHA_HORA
                                        ? new Date(item.BIT_FECHA_HORA).toLocaleString('es-GT')
                                        : ''}
                                </td>
                                <td style={{ padding: '12px', maxWidth: '280px' }}>
                                    <DatosPreviosDisplay raw={item.BIT_DATOS_PREVIOS} />
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>Editar</Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.BIT_BITACORA)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No hay registros disponibles.</p>
                )}
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Datos / Contexto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosFiltrados.map(item => {
                            // Intentar embellecer el JSON si la data viene en ese formato
                            let datos = item.BIT_DATOS_PREVIOS;
                            try {
                                if (datos && datos.trim().startsWith('{')) {
                                    datos = JSON.stringify(JSON.parse(datos), null, 2);
                                }
                            } catch (e) {
                                // No es JSON válido, dejarlo como está
                            }

                            return (
                                <tr key={item.BIT_BITACORA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_BITACORA}</td>
                                    <td style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>{item.USU_USUARIO}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_TABLA_AFECTADA}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            padding: '4px 8px', 
                                            borderRadius: '6px',
                                            background: item.BIT_ACCION === 'ANULACION' ? '#fee2e2' : item.BIT_ACCION === 'UPDATE' ? '#fef3c7' : '#e0f2fe',
                                            color: item.BIT_ACCION === 'ANULACION' ? '#dc2626' : item.BIT_ACCION === 'UPDATE' ? '#d97706' : '#0284c7' 
                                        }}>
                                            {item.BIT_ACCION}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_FECHA_HORA ? new Date(item.BIT_FECHA_HORA).toLocaleString() : ''}</td>
                                    <td style={{ padding: '12px', color: '#64748b', maxWidth: '300px' }}>
                                        {datos ? (
                                            <pre style={{ fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                                {datos}
                                            </pre>
                                        ) : <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Sin datos</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {datosFiltrados.length === 0 && <p style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay registros en bitácora para los filtros seleccionados.</p>}
            </div>
        </div>
    );
};

export default CON_BITACORACrud;