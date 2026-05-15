import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
const CON_MONEDACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' });
    const [editingId, setEditingId] = useState(null);



    const API_URL = 'http://localhost:5000/api/con-moneda';

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
            setFormData({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ MON_CODIGO_ISO: item.MON_CODIGO_ISO, MON_NOMBRE: item.MON_NOMBRE, MON_SIMBOLO: item.MON_SIMBOLO });
        setEditingId(item.MON_MONEDA);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Monedas</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Input label="Código ISO" helpText="Código internacional de 3 letras de la moneda según la norma ISO 4217. Ej: GTQ (Quetzal), USD (Dólar), EUR (Euro)." name="MON_CODIGO_ISO" value={formData.MON_CODIGO_ISO || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Nombre" name="MON_NOMBRE" value={formData.MON_NOMBRE || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Símbolo" helpText="Carácter o caracteres que representan la moneda visualmente. Ej: Q para Quetzal, $ para Dólar, € para Euro." name="MON_SIMBOLO" value={formData.MON_SIMBOLO || ''} onChange={handleChange} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='md'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' }); }}>
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
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Código ISO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Nombre</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Símbolo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.MON_MONEDA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_MONEDA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_CODIGO_ISO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_NOMBRE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_SIMBOLO}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.MON_MONEDA)}>
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

export default CON_MONEDACrud;