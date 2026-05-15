import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

const CON_IMPUESTOCrud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' });
    const [editingId, setEditingId] = useState(null);

    const [CON_CUENTAData, setCON_CUENTAData] = useState([]);

    const API_URL = 'http://localhost:5000/api/con-impuesto';

    useEffect(() => {
        fetchData();
        fetchCON_CUENTAData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCON_CUENTAData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-cuenta');
            setCON_CUENTAData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Si el porcentaje es mayor a 1, asumimos que el usuario ingresó el valor entero (ej. 12 para 12%)
            // y lo dividimos por 100 para guardarlo como decimal (0.12)
            const processedData = {
                ...formData,
                IMP_PORCENTAJE: parseFloat(formData.IMP_PORCENTAJE) > 1 
                    ? parseFloat(formData.IMP_PORCENTAJE) / 100 
                    : formData.IMP_PORCENTAJE
            };

            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, processedData);
            } else {
                await axios.post(API_URL, processedData);
            }
            setFormData({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' });
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
            CUE_CUENTA: item.CUE_CUENTA, 
            IMP_CODIGO: item.IMP_CODIGO, 
            IMP_NOMBRE: item.IMP_NOMBRE, 
            IMP_PORCENTAJE: item.IMP_PORCENTAJE * 100, 
            IMP_FECHA_VIGENCIA_INICIO: item.IMP_FECHA_VIGENCIA_INICIO_ISO, 
            IMP_FECHA_VIGENCIA_FIN: item.IMP_FECHA_VIGENCIA_FIN_ISO, 
            IMP_ESTADO: item.IMP_ESTADO 
        });
        setEditingId(item.IMP_IMPUESTO);
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
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Impuestos</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <Select label="Cuenta Contable" helpText="Cuenta de Pasivo o Activo donde se registra el impuesto. Ej: IVA por Pagar, IVA Crédito Fiscal." name="CUE_CUENTA" value={formData.CUE_CUENTA || ''} onChange={handleChange}
                        options={CON_CUENTAData.map(opt => ({ value: opt.CUE_CUENTA, label: `${opt.CUE_CUENTA} - ${opt[Object.keys(opt)[1]]}` }))}
                        required />
                    <Input label="Código" helpText="Código corto e identificador único del impuesto. Ej: IVA, ISR, IUSI." name="IMP_CODIGO" value={formData.IMP_CODIGO || ''} onChange={handleChange} required />
                    <Input label="Nombre" name="IMP_NOMBRE" value={formData.IMP_NOMBRE || ''} onChange={handleChange} required />
                    <Input label="Porcentaje" helpText="Tasa del impuesto en formato decimal. Ej: para 12% escribe 0.1200, para 5% escribe 0.0500." name="IMP_PORCENTAJE" value={formData.IMP_PORCENTAJE || ''} onChange={handleChange} type="number" required />
                    <Input label="Fecha Inicial de Vigencia" helpText="Fecha desde la que aplica esta tasa de impuesto. Importante cuando hay cambios de ley." name="IMP_FECHA_VIGENCIA_INICIO" value={formData.IMP_FECHA_VIGENCIA_INICIO || ''} onChange={handleChange} required />
                    <Input label="Fecha Final de Vigencia" helpText="Fecha en que deja de aplicar esta tasa. Déjala vacía si el impuesto sigue vigente." name="IMP_FECHA_VIGENCIA_FIN" value={formData.IMP_FECHA_VIGENCIA_FIN || ''} onChange={handleChange} required />
                    <Input label="Estado" helpText="1 = Activo (se aplica en nuevos movimientos). 0 = Inactivo (ya no se aplica pero conserva el historial)." name="IMP_ESTADO" value={formData.IMP_ESTADO || ''} onChange={handleChange} required />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Button type='submit' size='lg'>{editingId ? 'Actualizar' : 'Crear'}</Button>
                    {editingId && (
                        <Button type='button' size='lg' variant='secondary' className='ml-2'
                            onClick={() => { setEditingId(null); setFormData({ CUE_CUENTA: '', IMP_CODIGO: '', IMP_NOMBRE: '', IMP_PORCENTAJE: '', IMP_FECHA_VIGENCIA_INICIO: '', IMP_FECHA_VIGENCIA_FIN: '', IMP_ESTADO: '' }); }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <span className="text-sm font-semibold text-zinc-700">Listado de Impuestos</span>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <tbody className="divide-y divide-zinc-100">
                            {data.map(item => (
                                <tr key={item.IMP_IMPUESTO} className="bg-white hover:bg-zinc-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.IMP_IMPUESTO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700 font-medium">
                                        <div className="text-zinc-900">{item.CUE_NOMBRE}</div>
                                        <div className="text-zinc-400 text-xs">{item.CUE_CODIGO}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.IMP_CODIGO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.IMP_NOMBRE}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700 font-semibold">{item.IMP_PORCENTAJE * 100}%</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.IMP_FECHA_VIGENCIA_INICIO_ISO}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-700">{item.IMP_FECHA_VIGENCIA_FIN_ISO || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${item.IMP_ESTADO === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.IMP_ESTADO === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => handleEdit(item)}>Editar</button>
                                            <button className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors" onClick={() => handleDelete(item.IMP_IMPUESTO)}>Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-zinc-400 text-sm">No hay registros disponibles.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CON_IMPUESTOCrud;
