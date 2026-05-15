import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
const CON_MONEDACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' });
    const [editingId, setEditingId] = useState(null);



    const API_URL = 'http://localhost:5000/api/con-moneda';

    useEffect(() => {
        fetchData();

    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
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
            setFormData({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Error al guardar:', err);
            const msg = err.response?.data?.error || err.message;
            alert(`Error: ${msg}`);
        }
    };

    const handleEdit = (item) => {
        setFormData({ MON_CODIGO_ISO: item.MON_CODIGO_ISO, MON_NOMBRE: item.MON_NOMBRE, MON_SIMBOLO: item.MON_SIMBOLO });
        setEditingId(item.MON_MONEDA);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Monedas</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Input label="Código ISO" helpText="Código internacional de 3 letras de la moneda según la norma ISO 4217. Ej: GTQ (Quetzal), USD (Dólar), EUR (Euro)." name="MON_CODIGO_ISO" value={formData.MON_CODIGO_ISO || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Nombre" name="MON_NOMBRE" value={formData.MON_NOMBRE || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Símbolo" helpText="Carácter o caracteres que representan la moneda visualmente. Ej: Q para Quetzal, $ para Dólar, € para Euro." name="MON_SIMBOLO" value={formData.MON_SIMBOLO || ''} onChange={handleChange} required />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type='submit' size='md'>
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                        {editingId && (
                            <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ MON_CODIGO_ISO: '', MON_NOMBRE: '', MON_SIMBOLO: '' }); }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Código ISO</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Símbolo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.MON_MONEDA} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.MON_MONEDA}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.MON_CODIGO_ISO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.MON_NOMBRE}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.MON_SIMBOLO}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>
                                                Editar
                                            </button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.MON_MONEDA)}>
                                                Eliminar
                                            </button>
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

export default CON_MONEDACrud;