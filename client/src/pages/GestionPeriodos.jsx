import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';

const NOMBRES_MESES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

const GestionPeriodos = () => {
    const [periodos, setPeriodos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    // ── Feedback ──
    const [mensaje, setMensaje] = useState(null);

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 8000);
    };

    // Formularios
    const [formAbrir, setFormAbrir] = useState({ p_anio: new Date().getFullYear(), p_mes: new Date().getMonth() + 1 });
    const [formCerrarMes, setFormCerrarMes] = useState({ p_periodo_id: '' });
    const [formCierreAnual, setFormCierreAnual] = useState({ p_anio: new Date().getFullYear(), p_cuenta_utilidad_id: '', p_usuario_id: '', p_moneda_id: '' });

    const API_URL_PERIODO = 'http://localhost:5000/api/con-periodo';

    useEffect(() => {
        fetchPeriodos();
        fetchEstados();
        fetchCuentas();
        fetchMonedas();
        fetchUsuarios();
    }, []);

    const fetchPeriodos = async () => {
        try {
            const res = await axios.get(API_URL_PERIODO);
            setPeriodos(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchEstados = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-estado-periodo');
            setEstados(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCuentas = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-cuenta');
            setCuentas(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchMonedas = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-moneda');
            setMonedas(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/con-usuario');
            setUsuarios(res.data);
        } catch (err) { console.error(err); }
    };

    const getEstadoNombre = (id) => {
        const estado = estados.find(e => e.ESP_ESTADO_PERIODO === id);
        return estado ? estado.ESP_NOMBRE : id;
    };

    const handleAbrirPeriodo = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL_PERIODO}/abrir`, formAbrir);
            await fetchPeriodos();
            mostrarMensaje('success', res.data.message);
        } catch (err) {
            mostrarMensaje('error', err.response?.data?.error || err.message);
        }
    };

    const handleCerrarPeriodoMensual = async (e) => {
        e.preventDefault();
        if(!formCerrarMes.p_periodo_id) { mostrarMensaje('error', 'Seleccione un periodo'); return; }
        try {
            const res = await axios.post(`${API_URL_PERIODO}/cerrar-mensual`, formCerrarMes);
            await fetchPeriodos();
            setFormCerrarMes({ p_periodo_id: '' });
            mostrarMensaje('success', res.data.message);
        } catch (err) {
            mostrarMensaje('error', err.response?.data?.error || err.message);
        }
    };

    const handleCierreEjercicioAnual = async (e) => {
        e.preventDefault();
        if(!formCierreAnual.p_cuenta_utilidad_id || !formCierreAnual.p_moneda_id) {
            mostrarMensaje('error', 'Seleccione la cuenta de utilidad y la moneda');
            return;
        }
        try {
            const res = await axios.post(`${API_URL_PERIODO}/cierre-anual`, formCierreAnual);
            await fetchPeriodos();
            mostrarMensaje('success', res.data.message);
        } catch (err) {
            mostrarMensaje('error', err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Gestión de Periodos Contables</h2>
            <p className="text-sm text-zinc-500 mb-6">Apertura, cierre mensual y cierre de ejercicio anual.</p>

            {/* ── Mensaje de feedback ── */}
            {mensaje && (
                <div className={
                    mensaje.tipo === 'success'
                        ? 'px-4 py-3 rounded border border-green-200 bg-green-50 text-green-800 text-sm mb-6'
                        : 'px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm mb-6'
                }>
                    {mensaje.texto}
                </div>
            )}

            {/* Formularios de operaciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* 1. Abrir Periodo */}
                <div className="bg-white border border-zinc-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-zinc-200">
                        <span className="text-sm font-semibold text-zinc-700">Abrir Periodo</span>
                    </div>
                    <form onSubmit={handleAbrirPeriodo} className="p-6">
                        <div className="flex flex-col gap-4">
                            <Input label="Año" type="number"
                                value={formAbrir.p_anio} onChange={(e) => setFormAbrir({...formAbrir, p_anio: e.target.value})} required />
                            <Input label="Mes" type="number" min="1" max="12"
                                value={formAbrir.p_mes} onChange={(e) => setFormAbrir({...formAbrir, p_mes: e.target.value})} required />
                            <Button type="submit" variant="success">Abrir Periodo</Button>
                        </div>
                    </form>
                </div>

                {/* 2. Cerrar Periodo Mensual */}
                <div className="bg-white border border-zinc-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-zinc-200">
                        <span className="text-sm font-semibold text-zinc-700">Cerrar Periodo Mensual</span>
                    </div>
                    <form onSubmit={handleCerrarPeriodoMensual} className="p-6">
                        <div className="flex flex-col gap-4">
                            <Select label="Periodo a Cerrar"
                                value={formCerrarMes.p_periodo_id} onChange={(e) => setFormCerrarMes({ p_periodo_id: e.target.value })} required
                                options={periodos.filter(p => p.ESP_ESTADO_PERIODO === estados.find(e=> e.ESP_NOMBRE?.toUpperCase() === 'ABIERTO')?.ESP_ESTADO_PERIODO).map(p => ({
                                    value: p.PER_PERIODO, label: `${NOMBRES_MESES[p.PER_MES]} ${p.PER_AÑO}`
                                }))}
                            />
                            <Button type="submit" variant="warning">Cerrar Periodo</Button>
                        </div>
                    </form>
                </div>

                {/* 3. Cierre Ejercicio Anual */}
                <div className="bg-white border border-zinc-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-zinc-200">
                        <span className="text-sm font-semibold text-zinc-700">Cierre de Ejercicio Anual</span>
                    </div>
                    <form onSubmit={handleCierreEjercicioAnual} className="p-6">
                        <div className="flex flex-col gap-4">
                            <Input label="Año a Cerrar" type="number"
                                value={formCierreAnual.p_anio} onChange={(e) => setFormCierreAnual({...formCierreAnual, p_anio: e.target.value})} required />

                            <Select label="Cuenta Utilidad/Pérdida"
                                value={formCierreAnual.p_cuenta_utilidad_id} onChange={(e) => setFormCierreAnual({ ...formCierreAnual, p_cuenta_utilidad_id: e.target.value })} required
                                options={cuentas.map(c => ({
                                    value: c.CUE_CUENTA, label: `${c.CUE_CODIGO} - ${c.CUE_NOMBRE}`
                                }))}
                            />

                            <Select label="Moneda"
                                value={formCierreAnual.p_moneda_id} onChange={(e) => setFormCierreAnual({ ...formCierreAnual, p_moneda_id: e.target.value })} required
                                options={monedas.map(m => ({
                                    value: m.MON_MONEDA, label: m.MON_NOMBRE
                                }))}
                            />

                            <Select label="Usuario"
                                value={formCierreAnual.p_usuario_id} onChange={(e) => setFormCierreAnual({ ...formCierreAnual, p_usuario_id: e.target.value })} required
                                options={usuarios.map(u => ({
                                    value: u.USU_USUARIO, label: u.USU_USER
                                }))}
                            />
                            <Button type="submit" variant="danger">Ejecutar Cierre Anual</Button>
                        </div>
                    </form>
                </div>

            </div>

            {/* Tabla de periodos */}
            <div className="bg-white border border-zinc-200 rounded-lg">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <span className="text-sm font-semibold text-zinc-700">Periodos Existentes</span>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Año</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Mes</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {[...periodos].sort((a,b) => b.PER_AÑO - a.PER_AÑO || b.PER_MES - a.PER_MES).map(p => (
                                    <tr key={p.PER_PERIODO} className="bg-white hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-zinc-700">{p.PER_PERIODO}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">{p.PER_AÑO}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">{NOMBRES_MESES[p.PER_MES] || p.PER_MES}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-700">
                                            {getEstadoNombre(p.ESP_ESTADO_PERIODO)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {periodos.length === 0 && (
                        <div className="px-4 py-10 text-center text-zinc-400 text-sm">No hay periodos registrados.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionPeriodos;
