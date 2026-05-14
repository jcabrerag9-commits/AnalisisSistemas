
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';
import Button from '../components/Button';
const CON_USUARIO_ROLCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ USU_USUARIO: '', ROL_ROL: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);
    const [CON_ROLData, setCON_ROLData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-usuario-rol';

    useEffect(() => {
        fetchData();
        fetchCON_USUARIOData();
        fetchCON_ROLData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
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

    const fetchCON_ROLData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-rol');
            setCON_ROLData(res.data);
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
            setFormData({ USU_USUARIO: '', ROL_ROL: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error('Error al crear/actualizar:', err);
            const msg = err.response?.data?.error || err.message;
            alert(`Error: ${msg}`);
        }
    };

    const handleEdit = (item) => {
        setFormData({ USU_USUARIO: item.USU_USUARIO, ROL_ROL: item.ROL_ROL });
        setEditingId(item.USR_USUARIO_ROL);
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
        <div className="min-h-screen bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Gestión de Roles Usuario</h2>
            <div className="bg-white border border-zinc-200 rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 border-b border-zinc-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

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
                            <Select
                                label="Rol"
                                name="ROL_ROL"
                                value={formData.ROL_ROL || ''}
                                onChange={handleChange}
                                options={CON_ROLData.map(opt => ({ value: opt.ROL_ROL, label: `${opt.ROL_ROL} - ${opt[Object.keys(opt)[1]]}` }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type='submit' size='md'>
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                        {editingId && (
                            <Button type='button' size='md' variant='secondary' className='ml-2' onClick={() => { setEditingId(null); setFormData({ USU_USUARIO: '', ROL_ROL: '' }); }}>
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Usuario</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Rol</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.USR_USUARIO_ROL} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.USR_USUARIO_ROL}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.USU_USER || item.USU_USUARIO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.ROL_NOMBRE || item.ROL_ROL}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>
                                                Editar
                                            </button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.USR_USUARIO_ROL)}>
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

export default CON_USUARIO_ROLCrud;
