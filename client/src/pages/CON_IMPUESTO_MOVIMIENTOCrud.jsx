import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Card from '../components/Card';

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
        <Card title="Gestión de Movimientos de Impuestos" onSubmit={handleSubmit} editingId={editingId} onCancel={() => { setEditingId(null); setFormData({ ASD_ASIENTO_DETALLE: '', IMP_IMPUESTO: '', IMM_BASE_IMPONIBLE: '', IMM_MONTO_IMPUESTO: '', IMM_TIPO_AFECTACION: '' }); }}
            columns={[
                { header: 'Movimiento', accessor: 'IMM_IMPUESTO_MOVIMIENTO' },
                { header: 'Asiento Detalle', accessor: 'ASD_ASIENTO_DETALLE' },
                { header: 'Impuesto', accessor: 'IMP_IMPUESTO' },
                { header: 'Base Imponible', accessor: 'IMM_BASE_IMPONIBLE' },
                { header: 'Monto Impuesto', accessor: 'IMM_MONTO_IMPUESTO' },
                { header: 'Tipo Afectación', accessor: 'IMM_TIPO_AFECTACION' },
            ]}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
        >
            <Select label="Asiento Detalle" helpText="Línea del asiento contable a la que se le aplica este impuesto." name="ASD_ASIENTO_DETALLE" value={formData.ASD_ASIENTO_DETALLE || ''} onChange={handleChange}
                options={CON_ASIENTO_DETALLEData.map(opt => ({ value: opt.ASD_ASIENTO_DETALLE, label: `Detalle #${opt.ASD_ASIENTO_DETALLE} — Asiento #${opt.ASI_ASIENTO}` }))}
                required />
            <Select label="Impuesto" helpText="Tipo de impuesto que se generó o soportó en este movimiento. Ej: IVA, ISR." name="IMP_IMPUESTO" value={formData.IMP_IMPUESTO || ''} onChange={handleChange}
                options={CON_IMPUESTOData.map(opt => ({ value: opt.IMP_IMPUESTO, label: opt.IMP_NOMBRE }))}
                required />
            <Input label="Base Imponible" helpText="Monto sobre el que se calcula el impuesto, antes de aplicar la tasa. Ej: si la factura es Q1,120 con IVA 12%, la base es Q1,000." name="IMM_BASE_IMPONIBLE" value={formData.IMM_BASE_IMPONIBLE || ''} onChange={handleChange} required />
            <Input label="Monto Impuesto" helpText="Resultado de aplicar la tasa al monto base. Ej: Q1,000 × 12% = Q120." name="IMM_MONTO_IMPUESTO" value={formData.IMM_MONTO_IMPUESTO || ''} onChange={handleChange} required />
            <Input label="Tipo Afectación" helpText="GENERADO: impuesto que cobras a tus clientes (IVA Débito Fiscal). SOPORTADO: impuesto que pagas a proveedores (IVA Crédito Fiscal)." name="IMM_TIPO_AFECTACION" value={formData.IMM_TIPO_AFECTACION || ''} onChange={handleChange} required />
        </Card>
    );
};

export default CON_IMPUESTO_MOVIMIENTOCrud;