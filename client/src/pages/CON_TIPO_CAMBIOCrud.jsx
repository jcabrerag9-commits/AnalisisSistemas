import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_TIPO_CAMBIOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_MONEDAData, setCON_MONEDAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-tipo-cambio';

    useEffect(() => {
        fetchData();
        fetchCON_MONEDAData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_MONEDAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-moneda');
            setCON_MONEDAData(res.data);
        } catch (err) { console.error(err); }
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
            setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Error al guardar:', err);
            const msg = err.response?.data?.error || err.message;
            alert(`Error: ${msg}`);
        }
    };

    const handleEdit = (item) => {
        setFormData({ 
            MON_MONEDA: item.MON_MONEDA, 
            TPC_FECHA_TASA: item.TPC_FECHA_TASA_ISO, 
            TPC_TASA_COMPRA: item.TPC_TASA_COMPRA, 
            TPC_TASA_VENTA: item.TPC_TASA_VENTA 
        });
        setEditingId(item.TPC_TIPO_CAMBIO);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Cambios</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <Select label="Moneda" helpText="Moneda extranjera para la que se registra el tipo de cambio. La moneda local (GTQ) no necesita registro." name="MON_MONEDA" value={formData.MON_MONEDA || ''} onChange={handleChange}
                        options={CON_MONEDAData.map(opt => ({ value: opt.MON_MONEDA, label: `${opt.MON_MONEDA} - ${opt[Object.keys(opt)[1]]}` }))}
                        required />
                    <Input label="Fecha de la Tasa" helpText="Fecha en que aplica este tipo de cambio. Solo puede existir una tasa por moneda por día." name="TPC_FECHA_TASA" value={formData.TPC_FECHA_TASA || ''} onChange={handleChange} required />
                    <Input label="Tasa de Compra" helpText="Precio al que el banco compra la moneda extranjera. Ej: si el banco compra USD a Q7.72, ingresa 7.72." name="TPC_TASA_COMPRA" value={formData.TPC_TASA_COMPRA || ''} onChange={handleChange} type="number" required />
                    <Input label="Tasa de Venta" helpText="Precio al que el banco vende la moneda extranjera. Generalmente mayor a la tasa de compra. Ej: 7.78." name="TPC_TASA_VENTA" value={formData.TPC_TASA_VENTA || ''} onChange={handleChange} type="number" required />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2'
                            onClick={() => { setEditingId(null); setFormData({ MON_MONEDA: '', TPC_FECHA_TASA: '', TPC_TASA_COMPRA: '', TPC_TASA_VENTA: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cambio</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Moneda</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tasa Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tasa de Compra</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tasa de Venta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.TPC_TIPO_CAMBIO} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPC_TIPO_CAMBIO}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                                        <span className="bg-zinc-100 px-2 py-1 rounded mr-2 text-xs">{item.MON_CODIGO_ISO}</span>
                                        {item.MON_SIMBOLO}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPC_FECHA_TASA_ISO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPC_TASA_COMPRA}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPC_TASA_VENTA}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>Editar</button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.TPC_TIPO_CAMBIO)}>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length === 0 && <p className="px-4 py-10 text-center text-zinc-400 text-sm">No hay registros disponibles.</p>}
                </div>
            </div>
        </div>
    );
};

export default CON_TIPO_CAMBIOCrud;
