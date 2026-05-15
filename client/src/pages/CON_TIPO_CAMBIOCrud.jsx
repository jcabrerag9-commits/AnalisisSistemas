import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_TIPO_CAMBIOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_MONEDAData, setCON_MONEDAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-tipo-cambio';

    useEffect(() => {
        fetchData();
        fetchCON_MONEDAData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_MONEDAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-moneda');
            setCON_MONEDAData(res.data);
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
            setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (item) => {
        setFormData({ MON_MONEDA: item.MON_MONEDA, TPC_FECHA_TASA: item.TPC_FECHA_TASA, TPC_TASA_COMPRA: item.TPC_TASA_COMPRA, TPC_TASA_VENTA: item.TPC_TASA_VENTA });
        setEditingId(item.TPC_TIPO_CAMBIO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Cambios</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <Select label="Moneda" helpText="Moneda extranjera para la que se registra el tipo de cambio. La moneda local (GTQ) no necesita registro." name="MON_MONEDA" value={formData.MON_MONEDA || ''} onChange={handleChange}
                        options={CON_MONEDAData.map(opt => ({ value: opt.MON_MONEDA, label: `${opt.MON_MONEDA} - ${opt[Object.keys(opt)[1]]}` }))}
                        required />
                    <Input label="Fecha de la Tasa" helpText="Fecha en que aplica este tipo de cambio. Solo puede existir una tasa por moneda por día." name="TPC_FECHA_TASA" value={formData.TPC_FECHA_TASA || ''} onChange={handleChange} required />
                    <Input label="Tasa de Compra" helpText="Precio al que el banco compra la moneda extranjera. Ej: si el banco compra USD a Q7.72, ingresa 7.72." name="TPC_TASA_COMPRA" value={formData.TPC_TASA_COMPRA || ''} onChange={handleChange} type="number" required />
                    <Input label="Tasa de Venta" helpText="Precio al que el banco vende la moneda extranjera. Generalmente mayor a la tasa de compra. Ej: 7.78." name="TPC_TASA_VENTA" value={formData.TPC_TASA_VENTA || ''} onChange={handleChange} type="number" required />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2'
                            onClick={() => { setEditingId(null); setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Cambio</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Moneda</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tasa Fecha</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tasa de Compra</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tasa de Venta</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.TPC_TIPO_CAMBIO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TPC_TIPO_CAMBIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_MONEDA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TPC_FECHA_TASA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TPC_TASA_COMPRA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TPC_TASA_VENTA}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>Editar</Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.TPC_TIPO_CAMBIO)}>Eliminar</Button>
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

export default CON_TIPO_CAMBIOCrud;