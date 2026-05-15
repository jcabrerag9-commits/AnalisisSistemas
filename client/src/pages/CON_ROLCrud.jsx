import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
const CON_ROLCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ROL_NOMBRE: '', ROL_DESCRIPCION: '' });
    const [editingId, setEditingId] = useState(null);



    const API_URL = 'http://localhost:5000/api/con-rol';

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
            setFormData({ ROL_NOMBRE: '', ROL_DESCRIPCION: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ROL_NOMBRE: item.ROL_NOMBRE, ROL_DESCRIPCION: item.ROL_DESCRIPCION });
        setEditingId(item.ROL_ROL);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Roles</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    <div>
                        <Input label="Nombre del Rol" helpText="Nombre único del rol de acceso. Ej: ADMINISTRADOR, CONTADOR, AUDITOR, SOLO_LECTURA." name="ROL_NOMBRE" value={formData.ROL_NOMBRE || ''} onChange={handleChange} required />
                    </div>
                    <div>
                        <Input label="Descripción" helpText="Explica qué permisos tiene este rol y qué áreas del sistema puede usar." name="ROL_DESCRIPCION" value={formData.ROL_DESCRIPCION || ''} onChange={handleChange} required />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type='submit' size='md'>
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                        {editingId && (
                            <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ ROL_NOMBRE: '', ROL_DESCRIPCION: '' }); }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </div>
            </form>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.ROL_ROL} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.ROL_ROL}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.ROL_NOMBRE}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.ROL_DESCRIPCION}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>
                                                Editar
                                            </button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.ROL_ROL)}>
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
    );
};

export default CON_ROLCrud;