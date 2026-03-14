
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CON_CENTRO_COSTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ CTC_CENTRO_COSTO_PADRE: '', CTC_CODIGO_DEPARTAMENTO: '', CTC_NOMBRE: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_CENTRO_COSTOData, setCON_CENTRO_COSTOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-centro-costo';

    useEffect(() => {
        fetchData();
        fetchCON_CENTRO_COSTOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    const fetchCON_CENTRO_COSTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-centro-costo');
            setCON_CENTRO_COSTOData(res.data);
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
            setFormData({ CTC_CENTRO_COSTO_PADRE: '', CTC_CODIGO_DEPARTAMENTO: '', CTC_NOMBRE: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ CTC_CENTRO_COSTO_PADRE: item.CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO: item.CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE: item.CTC_NOMBRE });
        setEditingId(item.CTC_CENTRO_COSTO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de CON_CENTRO_COSTO</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Centro Costo Padre</label>
                        <select name="CTC_CENTRO_COSTO_PADRE" value={formData.CTC_CENTRO_COSTO_PADRE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_CENTRO_COSTOData.map(opt => (
                                <option key={opt.CTC_CENTRO_COSTO} value={opt.CTC_CENTRO_COSTO}>
                                    {opt.CTC_CENTRO_COSTO} - {opt[Object.keys(opt)[1]]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Código Departamento</label>
                        <input name="CTC_CODIGO_DEPARTAMENTO" value={formData.CTC_CODIGO_DEPARTAMENTO || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Nombre</label>
                        <input name="CTC_NOMBRE" value={formData.CTC_NOMBRE || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ CTC_CENTRO_COSTO_PADRE: '', CTC_CODIGO_DEPARTAMENTO: '', CTC_NOMBRE: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Centro Costo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Centro Costo Padre</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Código Departamento</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Nombre</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.CTC_CENTRO_COSTO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_CENTRO_COSTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_CENTRO_COSTO_PADRE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_CODIGO_DEPARTAMENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_NOMBRE}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.CTC_CENTRO_COSTO)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
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

export default CON_CENTRO_COSTOCrud;
