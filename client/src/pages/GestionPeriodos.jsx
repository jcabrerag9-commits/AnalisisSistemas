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
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Periodos Contables</h2>
            
            {/* ── Mensaje de feedback ── */}
            {mensaje && (
                <div style={{
                    padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
                    backgroundColor: mensaje.tipo === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: mensaje.tipo === 'success' ? '#15803d' : '#b91c1c',
                    border: `1px solid ${mensaje.tipo === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {mensaje.texto}
                </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* 1. Abrir Periodo */}
                <form onSubmit={handleAbrirPeriodo} style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ marginBottom: '15px', color: '#166534' }}>Abrir Periodo</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Input label="Año" type="number" 
                            value={formAbrir.p_anio} onChange={(e) => setFormAbrir({...formAbrir, p_anio: e.target.value})} required />
                        <Input label="Mes" type="number" min="1" max="12"
                            value={formAbrir.p_mes} onChange={(e) => setFormAbrir({...formAbrir, p_mes: e.target.value})} required />
                        <Button type="submit" variant="success">Abrir Periodo</Button>
                    </div>
                </form>

                {/* 2. Cerrar Periodo Mensual */}
                <form onSubmit={handleCerrarPeriodoMensual} style={{ padding: '20px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <h3 style={{ marginBottom: '15px', color: '#92400e' }}>Cerrar Periodo Mensual</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Select label="Periodo a Cerrar" 
                            value={formCerrarMes.p_periodo_id} onChange={(e) => setFormCerrarMes({ p_periodo_id: e.target.value })} required
                            options={periodos.filter(p => p.ESP_ESTADO_PERIODO === estados.find(e=> e.ESP_NOMBRE?.toUpperCase() === 'ABIERTO')?.ESP_ESTADO_PERIODO).map(p => ({
                                value: p.PER_PERIODO, label: `${NOMBRES_MESES[p.PER_MES]} ${p.PER_AÑO}`
                            }))}
                        />
                        <Button type="submit" variant="warning">Cerrar Periodo</Button>
                    </div>
                </form>

                {/* 3. Cierre Ejercicio Anual */}
                <form onSubmit={handleCierreEjercicioAnual} style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <h3 style={{ marginBottom: '15px', color: '#991b1b' }}>Cierre de Ejercicio Anual</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

            <h3 style={{ color: '#0f172a', marginBottom: '15px', marginTop: '20px' }}>Periodos Existentes</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>ID</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Año</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Mes</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...periodos].sort((a,b) => b.PER_AÑO - a.PER_AÑO || b.PER_MES - a.PER_MES).map(p => (
                            <tr key={p.PER_PERIODO} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{p.PER_PERIODO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{p.PER_AÑO}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{NOMBRES_MESES[p.PER_MES] || p.PER_MES}</td>
                                <td style={{ padding: '12px', color: '#64748b', fontWeight: 'bold' }}>
                                    {getEstadoNombre(p.ESP_ESTADO_PERIODO)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionPeriodos;
