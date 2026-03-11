
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CON_CUENTACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ CUE_CUENTA_PADRE: '', TCU_TIPO_CUENTA: '', CUE_CODIGO: '', CUE_NOMBRE: '', CUE_DESCRIPCION: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_CUENTAData, setCON_CUENTAData] = useState([]);
    const [CON_TIPO_CUENTAData, setCON_TIPO_CUENTAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-cuenta';

    useEffect(() => {
        fetchData();
        fetchCON_CUENTAData();
        fetchCON_TIPO_CUENTAData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    
    const fetchCON_CUENTAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-cuenta');
            setCON_CUENTAData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCON_TIPO_CUENTAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-tipo-cuenta');
            setCON_TIPO_CUENTAData(res.data);
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
            setFormData({ CUE_CUENTA_PADRE: '', TCU_TIPO_CUENTA: '', CUE_CODIGO: '', CUE_NOMBRE: '', CUE_DESCRIPCION: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ CUE_CUENTA_PADRE: item.CUE_CUENTA_PADRE, TCU_TIPO_CUENTA: item.TCU_TIPO_CUENTA, CUE_CODIGO: item.CUE_CODIGO, CUE_NOMBRE: item.CUE_NOMBRE, CUE_DESCRIPCION: item.CUE_DESCRIPCION });
        setEditingId(item.CUE_CUENTA);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de CON_CUENTA</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>CUE_CUENTA_PADRE (FK)</label>
                        <select name="CUE_CUENTA_PADRE" value={formData.CUE_CUENTA_PADRE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_CUENTAData.map(opt => (
                                <option key={opt.CUE_CUENTA} value={opt.CUE_CUENTA}>
                                    {opt.CUE_CUENTA} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>TCU_TIPO_CUENTA (FK)</label>
                        <select name="TCU_TIPO_CUENTA" value={formData.TCU_TIPO_CUENTA || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_TIPO_CUENTAData.map(opt => (
                                <option key={opt.TCU_TIPO_CUENTA} value={opt.TCU_TIPO_CUENTA}>
                                    {opt.TCU_TIPO_CUENTA} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>CUE_CODIGO</label>
                        <input name="CUE_CODIGO" value={formData.CUE_CODIGO || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>CUE_NOMBRE</label>
                        <input name="CUE_NOMBRE" value={formData.CUE_NOMBRE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>CUE_DESCRIPCION</label>
                        <input name="CUE_DESCRIPCION" value={formData.CUE_DESCRIPCION || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ CUE_CUENTA_PADRE: '', TCU_TIPO_CUENTA: '', CUE_CODIGO: '', CUE_NOMBRE: '', CUE_DESCRIPCION: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_CUENTA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_CUENTA_PADRE</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>TCU_TIPO_CUENTA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_CODIGO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_NOMBRE</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_DESCRIPCION</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.CUE_CUENTA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_CUENTA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_CUENTA_PADRE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TCU_TIPO_CUENTA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_CODIGO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_NOMBRE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_DESCRIPCION}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.CUE_CUENTA)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
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

export default CON_CUENTACrud;
