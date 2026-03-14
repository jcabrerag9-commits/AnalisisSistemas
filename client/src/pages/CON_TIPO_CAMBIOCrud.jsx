
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        } catch (err) {
            console.error(err);
        }
    };

    
    const fetchCON_MONEDAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-moneda');
            setCON_MONEDAData(res.data);
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
            setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
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
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de tipo de cambios</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>MON_MONEDA (FK)</label>
                        <select name="MON_MONEDA" value={formData.MON_MONEDA || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_MONEDAData.map(opt => (
                                <option key={opt.MON_MONEDA} value={opt.MON_MONEDA}>
                                    {opt.MON_MONEDA} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>TASA FECHA</label>
                        <input name="TPC_FECHA_TASA" value={formData.TPC_FECHA_TASA || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>TASA COMPRA</label>
                        <input name="TPC_TASA_COMPRA" value={formData.TPC_TASA_COMPRA || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>TASA DE VENTA</label>
                        <input name="TPC_TASA_VENTA" value={formData.TPC_TASA_VENTA || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CAMBIO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>MONEDA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>FECHA DE TASA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>TASA DE COMPRA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>TASA DE VENTA</th>
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
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.TPC_TIPO_CAMBIO)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
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
