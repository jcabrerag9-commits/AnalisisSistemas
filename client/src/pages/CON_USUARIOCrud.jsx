
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
const CON_USUARIOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ USU_USER: '', USU_CONTRASEÑA: '' });
    const [editingId, setEditingId] = useState(null);



    const API_URL = 'http://localhost:5000/api/con-usuario';

    useEffect(() => {
        fetchData();

    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
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
            setFormData({ USU_USER: '', USU_CONTRASEÑA: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ USU_USER: item.USU_USER, USU_CONTRASEÑA: item.USU_CONTRASEÑA });
        setEditingId(item.USU_USUARIO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Usuarios</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Input label="Usuario" name="USU_USER" value={formData.USU_USER || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Contraseña" name="USU_CONTRASEÑA" value={formData.USU_CONTRASEÑA || ''} onChange={handleChange} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='md'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ USU_USER: '', USU_CONTRASEÑA: '' }); }}>
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
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Contraseña</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.USU_USUARIO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USUARIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USER}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_CONTRASEÑA}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.USU_USUARIO)}>
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

export default CON_USUARIOCrud;
