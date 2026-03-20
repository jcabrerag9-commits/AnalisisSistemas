
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';
const CON_USUARIO_ROLCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ USU_USUARIO: '', ROL_ROL: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);
    const [CON_ROLData, setCON_ROLData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-usuario-rol';

    useEffect(() => {
        fetchData();
        fetchCON_USUARIOData();
        fetchCON_ROLData();
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

    const fetchCON_ROLData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-rol');
            setCON_ROLData(res.data);
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
            setFormData({ USU_USUARIO: '', ROL_ROL: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ USU_USUARIO: item.USU_USUARIO, ROL_ROL: item.ROL_ROL });
        setEditingId(item.USR_USUARIO_ROL);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Roles Usuario</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Select
                            label="Usuario"
                            name="USU_USUARIO"
                            value={formData.USU_USUARIO || ''}
                            onChange={handleChange}
                            options={CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                    <div>
                        <Select
                            label="Rol"
                            name="ROL_ROL"
                            value={formData.ROL_ROL || ''}
                            onChange={handleChange}
                            options={CON_ROLData.map(opt => ({ value: opt.ROL_ROL, label: `${opt.ROL_ROL} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='md'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ USU_USUARIO: '', ROL_ROL: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Rol</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.USR_USUARIO_ROL} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USR_USUARIO_ROL}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USUARIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ROL_ROL}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.USR_USUARIO_ROL)}>
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

export default CON_USUARIO_ROLCrud;
