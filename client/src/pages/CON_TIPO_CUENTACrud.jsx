
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';


const CON_TIPO_CUENTACrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ TCU_NOMBRE: '', TCU_DESCRIPCION: '' });
    const [editingId, setEditingId] = useState(null);

    const API_URL = 'http://localhost:5000/api/con-tipo-cuenta';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
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
            setFormData({ TCU_NOMBRE: '', TCU_DESCRIPCION: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (item) => {
        setFormData({ TCU_NOMBRE: item.TCU_NOMBRE, TCU_DESCRIPCION: item.TCU_DESCRIPCION });
        setEditingId(item.TCU_TIPO_CUENTA);
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
        <div className="min-h-screen bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Gestión de Cuentas</h2>
            <div className="bg-white border border-zinc-200 rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 border-b border-zinc-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <Input label="Nombre" name="TCU_NOMBRE" value={formData.TCU_NOMBRE || ''} onChange={handleChange} required />
                        <Input label="Descripción" name="TCU_DESCRIPCION" value={formData.TCU_DESCRIPCION || ''} onChange={handleChange} required />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                        {editingId && (
                            <Button type='button' size='lg' variant='secondary' className='ml-2'
                                onClick={() => { setEditingId(null); setFormData({ TCU_NOMBRE: '', TCU_DESCRIPCION: '' }); }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cuenta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descripción de Cuenta</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.TCU_TIPO_CUENTA} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TCU_TIPO_CUENTA}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TCU_NOMBRE}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TCU_DESCRIPCION}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>Editar</button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.TCU_TIPO_CUENTA)}>Eliminar</button>
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

export default CON_TIPO_CUENTACrud;
