
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Card from '../components/Card';

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
        <Card title="Gestión de Asiento Detalle" onSubmit={handleSubmit} editingId={editingId} onCancel={() => { setEditingId(null); setFormData({ ASI_ASIENTO: '', CUE_CUENTA: '', CTC_CENTRO_COSTO: '', MON_MONEDA: '', CTC_TASA_CAMBIO: '', ASD_DEBE_ORIGEN: '', ASD_HABER_ORIGEN: '', ASD_DEBE_LOCAL: '', ASD_HABER_LOCAL: '' }); }}
            columns={[
                { header: 'Asiento Detalle', accessor: 'ASD_ASIENTO_DETALLE' },
                { header: 'Asiento', accessor: 'ASI_ASIENTO' },
                { header: 'Cuenta', accessor: 'CUE_CUENTA' },
                { header: 'Centro de Costo', accessor: 'CTC_CENTRO_COSTO' },
                { header: 'Moneda', accessor: 'MON_MONEDA' },
                { header: 'Tasa de Cambio', accessor: 'CTC_TASA_CAMBIO' },
                { header: 'Debe Origen', accessor: 'ASD_DEBE_ORIGEN' },
                { header: 'Haber Origen', accessor: 'ASD_HABER_ORIGEN' },
                { header: 'Debe Local', accessor: 'ASD_DEBE_LOCAL' },
                { header: 'Haber Local', accessor: 'ASD_HABER_LOCAL' },
            ]}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
        >
            <Select label="Asiento" name="ASI_ASIENTO" value={formData.ASI_ASIENTO || ''} onChange={handleChange}
                options={CON_ASIENTOData.map(opt => ({ value: opt.ASI_ASIENTO, label: `${opt.ASI_ASIENTO} - ${opt[Object.keys(opt)[1]]}` }))}
                required />
            <Select label="Cuenta" name="CUE_CUENTA" value={formData.CUE_CUENTA || ''} onChange={handleChange}
                options={CON_CUENTAData.map(opt => ({ value: opt.CUE_CUENTA, label: `${opt.CUE_CUENTA} - ${opt[Object.keys(opt)[1]]}` }))}
                required />
            <Select label="Centro de Costo" name="CTC_CENTRO_COSTO" value={formData.CTC_CENTRO_COSTO || ''} onChange={handleChange}
                options={CON_CENTRO_COSTOData.map(opt => ({ value: opt.CTC_CENTRO_COSTO, label: `${opt.CTC_CENTRO_COSTO} - ${opt[Object.keys(opt)[1]]}` }))}
                required />
            <Select label="Moneda" name="MON_MONEDA" value={formData.MON_MONEDA || ''} onChange={handleChange}
                options={CON_MONEDAData.map(opt => ({ value: opt.MON_MONEDA, label: `${opt.MON_MONEDA} - ${opt[Object.keys(opt)[1]]}` }))}
                required />
            <Input label="Tasa de Cambio" name="CTC_TASA_CAMBIO" value={formData.CTC_TASA_CAMBIO || ''} onChange={handleChange}
                type="number" required />
            <Input label="Debe Origen" name="ASD_DEBE_ORIGEN" value={formData.ASD_DEBE_ORIGEN || ''} onChange={handleChange}
                type="number" required />
            <Input label="Haber Origen" name="ASD_HABER_ORIGEN" value={formData.ASD_HABER_ORIGEN || ''} onChange={handleChange}
                type="number" required />
            <Input label="Debe Local" name="ASD_DEBE_LOCAL" value={formData.ASD_DEBE_LOCAL || ''} onChange={handleChange}
                type="number" required />
            <Input label="Haber Local" name="ASD_HABER_LOCAL" value={formData.ASD_HABER_LOCAL || ''} onChange={handleChange}
                type="number" required />
        </Card>
    );
};

export default CON_ASIENTO_DETALLECrud;
