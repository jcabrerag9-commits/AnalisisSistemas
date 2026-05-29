import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { useGlobalFilter } from '../hooks/useGlobalFilter';
import GlobalSearchBar from '../components/GlobalSearchBar';

const CON_PERIODOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_ESTADO_PERIODOData, setCON_ESTADO_PERIODOData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-periodo';

    useEffect(() => {
        fetchData();
        fetchCON_ESTADO_PERIODOData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_ESTADO_PERIODOData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-estado-periodo');
            setCON_ESTADO_PERIODOData(res.data);
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
            setFormData({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (item) => {
        setFormData({ ESP_ESTADO_PERIODO: item.ESP_ESTADO_PERIODO, PER_AÑO: item.PER_AÑO, PER_MES: item.PER_MES });
        setEditingId(item.PER_PERIODO);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    const { filterText, setFilterText, filteredData } = useGlobalFilter(data, ['PER_PERIODO', 'ESP_ESTADO_PERIODO', 'PER_AÑO', 'PER_MES']);

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Periodos</h2>
            <form onSubmit={handleSubmit} className="mb-10 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Select 
                        label="Estado del Periodo" 
                        helpText="ABIERTO: permite registrar asientos. CERRADO: no acepta modificaciones. BLOQUEADO: bloqueado por auditoría." 
                        name="ESP_ESTADO_PERIODO" 
                        value={formData.ESP_ESTADO_PERIODO || ''} 
                        onChange={handleChange}
                        options={CON_ESTADO_PERIODOData.map(opt => ({ value: opt.ESP_ESTADO_PERIODO, label: opt.ESP_NOMBRE }))}
                        required 
                    />
                    <Input 
                        label="Año" 
                        helpText="Año fiscal del período contable. Ej: 2026." 
                        name="PER_AÑO" 
                        value={formData.PER_AÑO || ''} 
                        onChange={handleChange} 
                        type="number" 
                        required 
                    />
                    <Input 
                        label="Mes" 
                        helpText="Número del mes: 1 = Enero, ... 12 = Diciembre." 
                        name="PER_MES" 
                        value={formData.PER_MES || ''} 
                        onChange={handleChange} 
                        type="number" 
                        required 
                    />
                </div>
                <div className="mt-6 flex gap-3">
                    <Button type='submit' size='md'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='md' variant='secondary'
                            onClick={() => { setEditingId(null); setFormData({ ESP_ESTADO_PERIODO: '', PER_AÑO: '', PER_MES: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            {/* Tabla */}
            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <span className="text-sm font-semibold text-zinc-700">Listado de Períodos</span>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <GlobalSearchBar filterText={filterText} setFilterText={setFilterText} filteredCount={filteredData.length} totalCount={data.length} />
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID Periodo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estado del Periodo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Año</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Mes</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredData.map(item => (
                                    <tr key={item.PER_PERIODO} className="bg-white hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-zinc-700">{item.PER_PERIODO}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">{item.ESP_ESTADO_PERIODO}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">{item.PER_AÑO}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">{item.PER_MES}</td>
                                        <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>Editar</button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.PER_PERIODO)}>Eliminar</button>
                                        </div>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length === 0 && (
                        <div className="px-4 py-10 text-center text-zinc-400 text-sm">No hay registros disponibles.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CON_PERIODOCrud;
