import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Card from '../components/Card';

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
        <Card title="Gestión de Centro Costo" onSubmit={handleSubmit} editingId={editingId} onCancel={() => { setEditingId(null); setFormData({ CTC_CENTRO_COSTO_PADRE: '', CTC_CODIGO_DEPARTAMENTO: '', CTC_NOMBRE: '' }); }}
            columns={[
                { header: 'Centro Costo', accessor: 'CTC_CENTRO_COSTO' },
                { header: 'Centro Costo Padre', accessor: 'CTC_CENTRO_COSTO_PADRE' },
                { header: 'Código Departamento', accessor: 'CTC_CODIGO_DEPARTAMENTO' },
                { header: 'Nombre', accessor: 'CTC_NOMBRE' },
            ]}
            data={data}
            rowKey="CTC_CENTRO_COSTO"
            onEdit={handleEdit}
            onDelete={handleDelete}>
            <Select label="Centro Costo Padre" helpText="Centro de costo del que depende este. Déjalo vacío si es un centro raíz o de nivel superior." name="CTC_CENTRO_COSTO_PADRE" value={formData.CTC_CENTRO_COSTO_PADRE || ''} onChange={handleChange}
                options={CON_CENTRO_COSTOData.map(opt => ({ value: opt.CTC_CENTRO_COSTO, label: `${opt.CTC_CENTRO_COSTO} - ${opt[Object.keys(opt)[1]]}` }))}
                required />

            <Input label="Código Departamento" helpText="Código único que identifica al departamento. Ej: ADM-001, VENTAS-01. No se puede repetir." name="CTC_CODIGO_DEPARTAMENTO" value={formData.CTC_CODIGO_DEPARTAMENTO || ''} onChange={handleChange} required />
            <Input label="Nombre" helpText="Nombre descriptivo del departamento o área. Ej: Administración, Ventas, Producción." name="CTC_NOMBRE" value={formData.CTC_NOMBRE || ''} onChange={handleChange} required />
        </Card>

    );
};

export default CON_CENTRO_COSTOCrud;