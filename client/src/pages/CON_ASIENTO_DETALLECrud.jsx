
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_ASIENTO_DETALLECrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ASI_ASIENTO: '', CUE_CUENTA: '', CTC_CENTRO_COSTO: '', MON_MONEDA: '', CTC_TASA_CAMBIO: '', ASD_DEBE_ORIGEN: '', ASD_HABER_ORIGEN: '', ASD_DEBE_LOCAL: '', ASD_HABER_LOCAL: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_ASIENTOData, setCON_ASIENTOData] = useState([]);
    const [CON_CUENTAData, setCON_CUENTAData] = useState([]);
    const [CON_CENTRO_COSTOData, setCON_CENTRO_COSTOData] = useState([]);
    const [CON_MONEDAData, setCON_MONEDAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-asiento-detalle';

    useEffect(() => {
        fetchData();
        fetchCON_ASIENTOData();
        fetchCON_CUENTAData();
        fetchCON_CENTRO_COSTOData();
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


    const fetchCON_ASIENTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-asiento');
            setCON_ASIENTOData(res.data);
            //setCON_ASIENTOData([{ "ASI_ASIENTO": 1, "ASI_DESCRIPCION": "Asiento 1" }, { "ASI_ASIENTO": 2, "ASI_DESCRIPCION": "Asiento 2" }, { "ASI_ASIENTO": 3, "ASI_DESCRIPCION": "Asiento 3" }]);
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

    const fetchCON_CENTRO_COSTOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-centro-costo');
            setCON_CENTRO_COSTOData(res.data);
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
            setFormData({ ASI_ASIENTO: '', CUE_CUENTA: '', CTC_CENTRO_COSTO: '', MON_MONEDA: '', CTC_TASA_CAMBIO: '', ASD_DEBE_ORIGEN: '', ASD_HABER_ORIGEN: '', ASD_DEBE_LOCAL: '', ASD_HABER_LOCAL: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ASI_ASIENTO: item.ASI_ASIENTO, CUE_CUENTA: item.CUE_CUENTA, CTC_CENTRO_COSTO: item.CTC_CENTRO_COSTO, MON_MONEDA: item.MON_MONEDA, CTC_TASA_CAMBIO: item.CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN: item.ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN: item.ASD_HABER_ORIGEN, ASD_DEBE_LOCAL: item.ASD_DEBE_LOCAL, ASD_HABER_LOCAL: item.ASD_HABER_LOCAL });
        setEditingId(item.ASD_ASIENTO_DETALLE);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Asiento Detalle</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Select label="Asiento" name="ASI_ASIENTO" value={formData.ASI_ASIENTO || ''} onChange={handleChange}
                            options={CON_ASIENTOData.map(opt => ({ value: opt.ASI_ASIENTO, label: `${opt.ASI_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                    </div>
                    <div>
                        <Select label="Cuenta" name="CUE_CUENTA" value={formData.CUE_CUENTA || ''} onChange={handleChange}
                            options={CON_CUENTAData.map(opt => ({ value: opt.CUE_CUENTA, label: `${opt.CUE_CUENTA} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                    </div>
                    <div>
                        <Select label="Centro de Costo" name="CTC_CENTRO_COSTO" value={formData.CTC_CENTRO_COSTO || ''} onChange={handleChange}
                            options={CON_CENTRO_COSTOData.map(opt => ({ value: opt.CTC_CENTRO_COSTO, label: `${opt.CTC_CENTRO_COSTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                    </div>
                    <div>
                        <Select label="Moneda" name="MON_MONEDA" value={formData.MON_MONEDA || ''} onChange={handleChange}
                            options={CON_MONEDAData.map(opt => ({ value: opt.MON_MONEDA, label: `${opt.MON_MONEDA} - ${opt[Object.keys(opt)[1]]}` }))}
                            required />
                    </div>
                    <div>
                        <Input label="Tasa de Cambio" name="CTC_TASA_CAMBIO" value={formData.CTC_TASA_CAMBIO || ''} onChange={handleChange}
                            type="number" required />
                    </div>
                    <div>
                        <Input label="Debe Origen" name="ASD_DEBE_ORIGEN" value={formData.ASD_DEBE_ORIGEN || ''} onChange={handleChange}
                            type="number" required />
                    </div>
                    <div>
                        <Input label="Haber Origen" name="ASD_HABER_ORIGEN" value={formData.ASD_HABER_ORIGEN || ''} onChange={handleChange}
                            type="number" required />
                    </div>
                    <div>
                        <Input label="Debe Local" name="ASD_DEBE_LOCAL" value={formData.ASD_DEBE_LOCAL || ''} onChange={handleChange}
                            type="number" required />
                    </div>
                    <div>
                        <Input label="Haber Local" name="ASD_HABER_LOCAL" value={formData.ASD_HABER_LOCAL || ''} onChange={handleChange}
                            type="number" required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ ASI_ASIENTO: '', CUE_CUENTA: '', CTC_CENTRO_COSTO: '', MON_MONEDA: '', CTC_TASA_CAMBIO: '', ASD_DEBE_ORIGEN: '', ASD_HABER_ORIGEN: '', ASD_DEBE_LOCAL: '', ASD_HABER_LOCAL: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Asiento Detalle</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Asiento</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Cuenta</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Centro de Costo</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Moneda</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tasa de Cambio</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Debe Origen</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Haber Origen</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Debe Local</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Haber Local</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.ASD_ASIENTO_DETALLE} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_ASIENTO_DETALLE}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_ASIENTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CUE_CUENTA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_CENTRO_COSTO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.MON_MONEDA}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.CTC_TASA_CAMBIO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_DEBE_ORIGEN}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_HABER_ORIGEN}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_DEBE_LOCAL}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASD_HABER_LOCAL}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button variant='danger' size='sm' onClick={() => handleDelete(item.ASD_ASIENTO_DETALLE)}>
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

export default CON_ASIENTO_DETALLECrud;
