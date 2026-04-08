import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '../components/Select';

const CON_BITACORACrud = () => {
    const [data, setData] = useState([]);
    const [CON_USUARIOData, setCON_USUARIOData] = useState([]);
    const [filtroUsuario, setFiltroUsuario] = useState('');

    const API_URL = 'http://localhost:5000/api/con-bitacora';

    useEffect(() => {
        fetchData();
        fetchCON_USUARIOData();
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

    // Filtrar localmente la data de bitácora mediante usuario exacto (si existe)
    const datosFiltrados = filtroUsuario 
        ? data.filter(item => item.USU_USUARIO && item.USU_USUARIO.toString() === filtroUsuario.toString())
        : data;

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Bitácora de Eventos (Auditoría)</h2>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, maxWidth: '350px' }}>
                    <Select
                        label="Filtrar por Usuario Responsable:"
                        name="filtroUsuario"
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        options={[
                            { value: '', label: '-- Mostrar todos --' },
                            ...CON_USUARIOData.map(opt => ({ value: opt.USU_USUARIO, label: `${opt.USU_USUARIO} - ${opt[Object.keys(opt)[1]]}` }))
                        ]}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>ID Bitacora</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Usuario</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tabla Afectada</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acción</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Fecha y Hora</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Datos / Contexto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosFiltrados.map(item => {
                            // Intentar embellecer el JSON si la data viene en ese formato
                            let datos = item.BIT_DATOS_PREVIOS;
                            try {
                                if (datos && datos.trim().startsWith('{')) {
                                    datos = JSON.stringify(JSON.parse(datos), null, 2);
                                }
                            } catch (e) {
                                // No es JSON válido, dejarlo como está
                            }

                            return (
                                <tr key={item.BIT_BITACORA} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_BITACORA}</td>
                                    <td style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>{item.USU_USUARIO}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_TABLA_AFECTADA}</td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            padding: '4px 8px', 
                                            borderRadius: '6px',
                                            background: item.BIT_ACCION === 'ANULACION' ? '#fee2e2' : item.BIT_ACCION === 'UPDATE' ? '#fef3c7' : '#e0f2fe',
                                            color: item.BIT_ACCION === 'ANULACION' ? '#dc2626' : item.BIT_ACCION === 'UPDATE' ? '#d97706' : '#0284c7' 
                                        }}>
                                            {item.BIT_ACCION}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#64748b' }}>{item.BIT_FECHA_HORA ? new Date(item.BIT_FECHA_HORA).toLocaleString() : ''}</td>
                                    <td style={{ padding: '12px', color: '#64748b', maxWidth: '300px' }}>
                                        {datos ? (
                                            <pre style={{ fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                                {datos}
                                            </pre>
                                        ) : <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Sin datos</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {datosFiltrados.length === 0 && <p style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay registros en bitácora para los filtros seleccionados.</p>}
            </div>
        </div>
    );
};

export default CON_BITACORACrud;
