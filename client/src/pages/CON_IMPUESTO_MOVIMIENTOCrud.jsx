
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_IMPUESTO_MOVIMIENTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ASD_ASIENTO_DETALLE: '', IMP_IMPUESTO: '', IMM_BASE_IMPONIBLE: '', IMM_MONTO_IMPUESTO: '', IMM_TIPO_AFECTACION: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_ASIENTO_DETALLEData, setCON_ASIENTO_DETALLEData] = useState([]);
    const [CON_IMPUESTOData, setCON_IMPUESTOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-impuesto-movimiento';

    useEffect(() => {
        fetchData();
        fetchCON_ASIENTO_DETALLEData();
        fetchCON_IMPUESTOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    const fetchCON_ASIENTO_DETALLEData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-asiento-detalle');
            setCON_ASIENTO_DETALLEData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCON_IMPUESTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-impuesto');
            setCON_IMPUESTOData(res.data);
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
            setFormData({ ASD_ASIENTO_DETALLE: '', IMP_IMPUESTO: '', IMM_BASE_IMPONIBLE: '', IMM_MONTO_IMPUESTO: '', IMM_TIPO_AFECTACION: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ASD_ASIENTO_DETALLE: item.ASD_ASIENTO_DETALLE, IMP_IMPUESTO: item.IMP_IMPUESTO, IMM_BASE_IMPONIBLE: item.IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO: item.IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION: item.IMM_TIPO_AFECTACION });
        setEditingId(item.IMM_IMPUESTO_MOVIMIENTO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Impuesto Movimiento</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Select label="Asiento Detalle" name="ASD_ASIENTO_DETALLE" value={formData.ASD_ASIENTO_DETALLE || ''} onChange={handleChange}
                            options={CON_ASIENTO_DETALLEData.map(opt => ({ value: opt.ASD_ASIENTO_DETALLE, label: `${opt.ASD_ASIENTO_DETALLE} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                        {/*<label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Asiento Detalle</label>
                        <select name="ASD_ASIENTO_DETALLE" value={formData.ASD_ASIENTO_DETALLE || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_ASIENTO_DETALLEData.map(opt => (
                                <option key={opt.ASD_ASIENTO_DETALLE} value={opt.ASD_ASIENTO_DETALLE}>
                                    {opt.ASD_ASIENTO_DETALLE} - {opt[Object.keys(opt)[1]]}
                                </option>
                            ))}
                        </select>*/}
                    </div>
                    <div>
                        <Select label="Impuesto" name="IMP_IMPUESTO" value={formData.IMP_IMPUESTO || ''} onChange={handleChange}
                            options={CON_IMPUESTOData.map(opt => ({ value: opt.IMP_IMPUESTO, label: `${opt.IMP_IMPUESTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                        {/*<label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>Impuesto</label>
                        <select name="IMP_IMPUESTO" value={formData.IMP_IMPUESTO || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {CON_IMPUESTOData.map(opt => (
                                <option key={opt.IMP_IMPUESTO} value={opt.IMP_IMPUESTO}>
                                    {opt.IMP_IMPUESTO} - {opt[Object.keys(opt)[1]]}
                                </option>
                            ))}
                        </select>*/}
                    </div>
                    <div>
                        <Input label="Base Imponible" name="IMM_BASE_IMPONIBLE" value={formData.IMM_BASE_IMPONIBLE || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Monto Impuesto" name="IMM_MONTO_IMPUESTO" value={formData.IMM_MONTO_IMPUESTO || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Tipo Afectación" name="IMM_TIPO_AFECTACION" value={formData.IMM_TIPO_AFECTACION || ''} onChange={handleChange} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type="submit" size='lg'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type="button" size='lg' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ ASD_ASIENTO_DETALLE: '', IMP_IMPUESTO: '', IMM_BASE_IMPONIBLE: '', IMM_MONTO_IMPUESTO: '', IMM_TIPO_AFECTACION: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Impuesto Movimiento</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Asiento Detalle</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Impuesto</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Base Imponible</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Monto Impuesto</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tipo Afectación</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.IMM_IMPUESTO_MOVIMIENTO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMM_IMPUESTO_MOVIMIENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_ASIENTO_DETALLE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMP_IMPUESTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMM_BASE_IMPONIBLE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMM_MONTO_IMPUESTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.IMM_TIPO_AFECTACION}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button type="button" size='sm' variant='warning' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button type="button" size='sm' variant='danger' onClick={() => handleDelete(item.IMM_IMPUESTO_MOVIMIENTO)}>
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

export default CON_IMPUESTO_MOVIMIENTOCrud;
