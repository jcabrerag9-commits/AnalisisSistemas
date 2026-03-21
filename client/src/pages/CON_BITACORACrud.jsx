
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_BITACORACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ USU_USUARIO: '', BIT_TABLA_AFECTADA: '', BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-bitacora';

    useEffect(() => {
        fetchData();
        fetchCON_USUARIOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    const fetchCON_USUARIOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-usuario');
            setCON_USUARIOData(res.data);
        } catch (err) {
            console.error(err);
        }
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
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ USU_USUARIO: item.USU_USUARIO, BIT_TABLA_AFECTADA: item.BIT_TABLA_AFECTADA, BIT_ACCION: item.BIT_ACCION, BIT_FECHA_HORA: item.BIT_FECHA_HORA, BIT_DATOS_PREVIOS: item.BIT_DATOS_PREVIOS });
        setEditingId(item.BIT_BITACORA);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Bitacora</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Select
                            label="Usuario"
                            name="USU_USUARIO"
                            value={formData.USU_USUARIO || ''}
                            onChange={handleChange}
                            options={CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                    </div>
                    <div>
                        <Input label="Tabla Afectada" name="BIT_TABLA_AFECTADA" value={formData.BIT_TABLA_AFECTADA || ''} onChange={handleChange}
                            type="text" required />
                    </div>
                    <div>
                        <Input label="Acción" name="BIT_ACCION" value={formData.BIT_ACCION || ''} onChange={handleChange}
                            type="text" required />
                    </div>
                    <div>
                        <Input label="Fecha" name="BIT_FECHA_HORA" value={formData.BIT_FECHA_HORA || ''} onChange={handleChange}
                            type="datetime-local" required />
                    </div>
                    <div>
                        <Input label="Datos Previos" name="BIT_DATOS_PREVIOS" value={formData.BIT_DATOS_PREVIOS || ''} onChange={handleChange}
                            type="text" required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ USU_USUARIO: '', BIT_TABLA_AFECTADA: '', BIT_ACCION: '', BIT_FECHA_HORA: '', BIT_DATOS_PREVIOS: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Bitacora</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tabla Afectada</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acción</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Fecha</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Datos Previos</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.BIT_BITACORA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_BITACORA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USUARIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_TABLA_AFECTADA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_ACCION}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_FECHA_HORA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_DATOS_PREVIOS}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button type='button' size='sm' variant='warning' className='mr-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button type='button' size='sm' variant='danger' onClick={() => handleDelete(item.BIT_BITACORA)}>
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No hay registros disponibles.</p>}
            </div>
        </div>
    );
};

export default CON_BITACORACrud;
