
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CON_IMPUESTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_CUENTAData, setCON_CUENTAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-impuesto';

    useEffect(() => {
        fetchData();
        fetchCON_CUENTAData();
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
            setFormData({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ CUE_CUENTA: item.CUE_CUENTA, IMP_CODIGO: item.IMP_CODIGO, IMP_NOMBRE: item.IMP_NOMBRE, IMP_PORCENTAJE: item.IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO: item.IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN: item.IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO: item.IMP_ESTADO });
        setEditingId(item.IMP_IMPUESTO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de CON_IMPUESTO</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>CUE_CUENTA (FK)</label>
                        <select name="CUE_CUENTA" value={formData.CUE_CUENTA || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_CUENTAData.map(opt => (
                                <option key={opt.CUE_CUENTA} value={opt.CUE_CUENTA}>
                                    {opt.CUE_CUENTA} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_CODIGO</label>
                        <input name="IMP_CODIGO" value={formData.IMP_CODIGO || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_NOMBRE</label>
                        <input name="IMP_NOMBRE" value={formData.IMP_NOMBRE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_PORCENTAJE</label>
                        <input name="IMP_PORCENTAJE" value={formData.IMP_PORCENTAJE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_FECHA_VIGENCIA_INICIO</label>
                        <input name="IMP_FECHA_VIGENCIA_INICIO" value={formData.IMP_FECHA_VIGENCIA_INICIO || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_FECHA_VIGENCIA_FIN</label>
                        <input name="IMP_FECHA_VIGENCIA_FIN" value={formData.IMP_FECHA_VIGENCIA_FIN || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>IMP_ESTADO</label>
                        <input name="IMP_ESTADO" value={formData.IMP_ESTADO || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_IMPUESTO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>CUE_CUENTA</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_CODIGO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_NOMBRE</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_PORCENTAJE</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_FECHA_VIGENCIA_INICIO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_FECHA_VIGENCIA_FIN</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>IMP_ESTADO</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.IMP_IMPUESTO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_IMPUESTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_CUENTA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_CODIGO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_NOMBRE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_PORCENTAJE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_FECHA_VIGENCIA_INICIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_FECHA_VIGENCIA_FIN}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_ESTADO}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.IMP_IMPUESTO)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
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

export default CON_IMPUESTOCrud;
