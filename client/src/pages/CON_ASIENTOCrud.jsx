
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';


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

    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleEdit = (item) => {
        setFormData({ PER_PERIODO: item.PER_PERIODO, TPA_TIPO_ASIENTO: item.TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO: item.ESA_ESTADO_ASIENTO, USU_USUARIO: item.USU_USUARIO, ASI_FECHA: formatDateForInput(item.ASI_FECHA), ASI_GLOSA: item.ASI_GLOSA });
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
                        <Select
                            label="Periodo"
                            name="PER_PERIODO"
                            value={formData.PER_PERIODO || ''}
                            onChange={handleChange}
                            options={CON_PERIODOData.map(opt => ({ value: opt.PER_PERIODO, label: `${opt.PER_PERIODO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                    <div>
                        <Select
                            label="Tipo de Asiento"
                            name="TPA_TIPO_ASIENTO"
                            value={formData.TPA_TIPO_ASIENTO || ''}
                            onChange={handleChange}
                            options={CON_TIPO_ASIENTOData.map(opt => ({ value: opt.TPA_TIPO_ASIENTO, label: `${opt.TPA_TIPO_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                    <div>
                        <Select
                            label="Estado"
                            name="ESA_ESTADO_ASIENTO"
                            value={formData.ESA_ESTADO_ASIENTO || ''}
                            onChange={handleChange}
                            options={CON_ESTADO_ASIENTOData.map(opt => ({ value: opt.ESA_ESTADO_ASIENTO, label: `${opt.ESA_ESTADO_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                    <div>
                        <Select
                            label="Usuario"
                            name="USU_USUARIO"
                            value={formData.USU_USUARIO || ''}
                            onChange={handleChange}
                            options={CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Fecha"
                            name="ASI_FECHA"
                            value={formData.ASI_FECHA || ''}
                            onChange={handleChange}
                            type="date"
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Glosa"
                            name="ASI_GLOSA"
                            value={formData.ASI_GLOSA || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ PER_PERIODO: '', TPA_TIPO_ASIENTO: '', ESA_ESTADO_ASIENTO: '', USU_USUARIO: '', ASI_FECHA: '', ASI_GLOSA: '' }); }}>
                            Cancelar
                        </Button>
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
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_FECHA ? new Date(item.ASI_FECHA).toLocaleDateString() : ''}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.ASI_GLOSA}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant='warning' size='sm' className='mr-2 mb-2' onClick={() => handleEdit(item)}>
                                        Editar
                                    </Button>
                                    <Button size='sm' variant='danger' onClick={() => handleDelete(item.ASI_ASIENTO)}>
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

export default CON_ASIENTOCrud;
