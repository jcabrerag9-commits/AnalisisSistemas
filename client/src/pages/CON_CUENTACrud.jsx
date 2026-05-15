import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Card from '../components/Card';

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
        <Card title="Gestión de cuentas" onSubmit={handleSubmit} editingId={editingId} onCancel={() => { setEditingId(null); setFormData({ CUE_CUENTA_PADRE: '', TCU_TIPO_CUENTA: '', CUE_CODIGO: '', CUE_NOMBRE: '', CUE_DESCRIPCION: '' }); }}
            columns={[
                { header: 'Cuenta', accessor: 'CUE_CUENTA' },
                { header: 'Cuenta padre', accessor: 'CUE_NOMBRE_PADRE' },
                { header: 'Tipo Cuenta', accessor: 'TCU_NOMBRE' },
                { header: 'Código', accessor: 'CUE_CODIGO' },
                { header: 'Nombre', accessor: 'CUE_NOMBRE' },
                { header: 'Descripción', accessor: 'CUE_DESCRIPCION' },
            ]}
            data={data}
            rowKey="CUE_CUENTA"
            onEdit={handleEdit}
            onDelete={handleDelete}>
            <Select label="Cuenta padre" helpText="Cuenta de nivel superior en el plan de cuentas. Déjala vacía si esta es una cuenta principal. Las subcuentas heredan el tipo de la cuenta padre." name="CUE_CUENTA_PADRE" value={formData.CUE_CUENTA_PADRE || ''} onChange={handleChange}
                options={CON_CUENTAData.map(opt => ({ value: opt.CUE_CUENTA, label: `${opt.CUE_CUENTA} - ${opt[Object.keys(opt)[1]]}` }))}
                required />

            <Select label="Tipo Cuenta" helpText="Clasifica la cuenta: ACTIVO (bienes y derechos), PASIVO (deudas), CAPITAL/PATRIMONIO (recursos propios), INGRESO o GASTO." name="TCU_TIPO_CUENTA" value={formData.TCU_TIPO_CUENTA || ''} onChange={handleChange}
                options={CON_TIPO_CUENTAData.map(opt => ({ value: opt.TCU_TIPO_CUENTA, label: `${opt.TCU_TIPO_CUENTA} - ${opt[Object.keys(opt)[1]]}` }))}
                required />

            <Input label="Código" helpText="Código único del plan de cuentas. Ej: 1.1.01 para Caja, 2.1 para Cuentas por Pagar. Sigue la estructura numérica de tu catálogo." name="CUE_CODIGO" value={formData.CUE_CODIGO || ''} onChange={handleChange} required />
            <Input label="Nombre" name="CUE_NOMBRE" value={formData.CUE_NOMBRE || ''} onChange={handleChange} required />
            <Input label="Descripción" name="CUE_DESCRIPCION" value={formData.CUE_DESCRIPCION || ''} onChange={handleChange} required />
        </Card>

    );
};

export default CON_CUENTACrud;