
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_PERIODOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_ESTADO_PERIODOData, setCON_ESTADO_PERIODOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-periodo';

    useEffect(() => {
        fetchData();
        fetchCON_ESTADO_PERIODOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_ESTADO_PERIODOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-estado-periodo');
            setCON_ESTADO_PERIODOData(res.data);
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
            setFormData({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (item) => {
        setFormData({ ESP_ESTADO_PERIODO: item.ESP_ESTADO_PERIODO, PER_AÑO: item.PER_AÑO, PER_MES: item.PER_MES });
        setEditingId(item.PER_PERIODO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Periodos</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <Select label="Estado del Periodo" name="ESP_ESTADO_PERIODO" value={formData.ESP_ESTADO_PERIODO || ''} onChange={handleChange}
                        options={CON_ESTADO_PERIODOData.map(opt => ({ value: opt.ESP_ESTADO_PERIODO, label: `${opt.ESP_ESTADO_PERIODO} - ${opt[Object.keys(opt)[1]]}` }))}
                        required />
                    <Input label="Año" name="PER_AÑO" value={formData.PER_AÑO || ''} onChange={handleChange} type="number" required />
                    <Input label="Mes" name="PER_MES" value={formData.PER_MES || ''} onChange={handleChange} type="number" required />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2'
                            onClick={() => { setEditingId(null); setFormData({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID Periodo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Estado del Periodo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Año</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Mes</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.PER_PERIODO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.PER_PERIODO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ESP_ESTADO_PERIODO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.PER_AÑO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.PER_MES}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>Editar</Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.PER_PERIODO)}>Eliminar</Button>
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

export default CON_PERIODOCrud;