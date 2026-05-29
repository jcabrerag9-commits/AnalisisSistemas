import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import { useGlobalFilter } from '../hooks/useGlobalFilter';
import GlobalSearchBar from '../components/GlobalSearchBar';
import Button from '../components/Button';

const CON_TIPO_ASIENTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ TPA_CODIGO: '', TPA_DESCRIPCION: '' });
    const [editingId, setEditingId] = useState(null);

    const { filterText, setFilterText, filteredData } = useGlobalFilter(data, ['TPA_TIPO_ASIENTO', 'TPA_CODIGO', 'TPA_DESCRIPCION']);



    const API_URL = 'http://localhost:5000/api/con-tipo-asiento';

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
            setFormData({ TPA_CODIGO: '', TPA_DESCRIPCION: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ TPA_CODIGO: item.TPA_CODIGO, TPA_DESCRIPCION: item.TPA_DESCRIPCION });
        setEditingId(item.TPA_TIPO_ASIENTO);
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
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Gestión de Tipo Asiento</h2>

            <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input label="Código" helpText="Código corto e identificador único del tipo de asiento. Ej: DIARIO, APERTURA, AJUSTE, CIERRE." name="TPA_CODIGO" value={formData.TPA_CODIGO || ''} onChange={handleChange}
                            type="text" required />
                    </div>
                    <div>
                        <Input label="Descripción" helpText="Explicación del uso de este tipo de asiento. Ej: Asiento de apertura del ejercicio fiscal." name="TPA_DESCRIPCION" value={formData.TPA_DESCRIPCION || ''} onChange={handleChange}
                            type="text" required />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Button type='submit' size='md'>
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                        {editingId && (
                            <Button type='button' size='md' variant='secondary'
                                onClick={() => { setEditingId(null); setFormData({ TPA_CODIGO: '', TPA_DESCRIPCION: '' }); }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="overflow-x-auto">
                    <GlobalSearchBar filterText={filterText} setFilterText={setFilterText} filteredCount={filteredData.length} totalCount={data.length} />
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tipo Asiento</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredData.map(item => (
                                <tr key={item.TPA_TIPO_ASIENTO} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPA_TIPO_ASIENTO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPA_CODIGO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.TPA_DESCRIPCION}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>
                                                Editar
                                            </button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.TPA_TIPO_ASIENTO)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-400 text-sm">No hay registros disponibles.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CON_TIPO_ASIENTOCrud;