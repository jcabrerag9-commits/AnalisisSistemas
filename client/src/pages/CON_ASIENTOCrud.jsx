
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CON_ASIENTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '', USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_PERIODOData, setCON_PERIODOData] = useState([]);
    const [CON_TIPO_ASIENTOData, setCON_TIPO_ASIENTOData] = useState([]);
    const [CON_ESTADO_ASIENTOData, setCON_ESTADO_ASIENTOData] = useState([]);
    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-asiento';

    useEffect(() => {
        fetchData();
        fetchCON_PERIODOData();
        fetchCON_TIPO_ASIENTOData();
        fetchCON_ESTADO_ASIENTOData();
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

    
    const fetchCON_PERIODOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-periodo');
            setCON_PERIODOData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCON_TIPO_ASIENTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-tipo-asiento');
            setCON_TIPO_ASIENTOData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCON_ESTADO_ASIENTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-estado-asiento');
            setCON_ESTADO_ASIENTOData(res.data);
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
            setFormData({ PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '', USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ PER_PERIODO: item.PER_PERIODO, TPA_TIPO_ASIENTO: item.TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO: item.ESA_ESTADO_ASIENTO, USU_USUARIO: item.USU_USUARIO, ASI_FECHA: item.ASI_FECHA, ASI_GLOSA: item.ASI_GLOSA });
        setEditingId(item.ASI_ASIENTO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Asiento</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Periodo (FK)</label>
                        <select name="PER_PERIODO" value={formData.PER_PERIODO || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_PERIODOData.map(opt => (
                                <option key={opt.PER_PERIODO} value={opt.PER_PERIODO}>
                                    {opt.PER_PERIODO} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Tipo de Asiento (FK)</label>
                        <select name="TPA_TIPO_ASIENTO" value={formData.TPA_TIPO_ASIENTO || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_TIPO_ASIENTOData.map(opt => (
                                <option key={opt.TPA_TIPO_ASIENTO} value={opt.TPA_TIPO_ASIENTO}>
                                    {opt.TPA_TIPO_ASIENTO} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Estado (FK)</label>
                        <select name="ESA_ESTADO_ASIENTO" value={formData.ESA_ESTADO_ASIENTO || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_ESTADO_ASIENTOData.map(opt => (
                                <option key={opt.ESA_ESTADO_ASIENTO} value={opt.ESA_ESTADO_ASIENTO}>
                                    {opt.ESA_ESTADO_ASIENTO} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Usuario (FK)</label>
                        <select name="USU_USUARIO" value={formData.USU_USUARIO || ''} onChange={handleChange} style={{ width: '95', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_USUARIOData.map(opt => (
                                <option key={opt.USU_USUARIO} value={opt.USU_USUARIO}>
                                    {opt.USU_USUARIO} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Fecha</label>
                        <input name="ASI_FECHA" value={formData.ASI_FECHA || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Glosa</label>
                        <input name="ASI_GLOSA" value={formData.ASI_GLOSA || ''} onChange={handleChange} style={{ width: '95%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '', USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Asiento</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Periodo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tipo de Asiento</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Estado</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Fecha</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Glosa</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.ASI_ASIENTO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_ASIENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.PER_PERIODO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.TPA_TIPO_ASIENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ESA_ESTADO_ASIENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.USU_USUARIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_FECHA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_GLOSA}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.ASI_ASIENTO)} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
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

export default CON_ASIENTOCrud;
