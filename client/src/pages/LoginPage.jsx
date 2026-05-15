import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [usuarioInput, setUsuarioInput] = useState('');
    const [contrasena, setContrasena]     = useState('');
    const [mostrarPass, setMostrarPass]   = useState(false);
    const [error, setError]               = useState('');
    const [cargando, setCargando]         = useState(false);

    const { login }  = useAuth();
    const navigate   = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!usuarioInput.trim() || !contrasena.trim()) {
            setError('Por favor ingrese usuario y contraseña.');
            return;
        }

        setCargando(true);
        try {
            await login(usuarioInput.trim(), contrasena);
            navigate('/', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al iniciar sesión.';
            setError(msg);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: 'Inter, sans-serif',
        }}>
            {/* Card */}
            <div style={{
                background: 'white', borderRadius: '20px',
                padding: '48px 40px', width: '100%', maxWidth: '420px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}>
                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(14,165,233,0.35)',
                        fontSize: '28px',
                    }}>
                        🏦
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                        Sistema de Contabilidad
                    </h1>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                        Ingrese sus credenciales para continuar
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    {/* Usuario */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block', fontSize: '13px',
                            fontWeight: '600', color: '#374151', marginBottom: '6px',
                        }}>
                            Usuario
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '12px', top: '50%',
                                transform: 'translateY(-50%)', fontSize: '16px',
                            }}>👤</span>
                            <input
                                type="text"
                                value={usuarioInput}
                                onChange={e => { setUsuarioInput(e.target.value); setError(''); }}
                                placeholder="Nombre de usuario"
                                autoComplete="username"
                                autoFocus
                                style={{
                                    width: '100%', padding: '11px 12px 11px 40px',
                                    borderRadius: '10px', border: '1.5px solid #e2e8f0',
                                    fontSize: '14px', color: '#0f172a',
                                    outline: 'none', boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '13px',
                            fontWeight: '600', color: '#374151', marginBottom: '6px',
                        }}>
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '12px', top: '50%',
                                transform: 'translateY(-50%)', fontSize: '16px',
                            }}>🔒</span>
                            <input
                                type={mostrarPass ? 'text' : 'password'}
                                value={contrasena}
                                onChange={e => { setContrasena(e.target.value); setError(''); }}
                                placeholder="Contraseña"
                                autoComplete="current-password"
                                style={{
                                    width: '100%', padding: '11px 44px 11px 40px',
                                    borderRadius: '10px', border: '1.5px solid #e2e8f0',
                                    fontSize: '14px', color: '#0f172a',
                                    outline: 'none', boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            {/* Mostrar/ocultar contraseña */}
                            <button
                                type="button"
                                onClick={() => setMostrarPass(!mostrarPass)}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', fontSize: '16px',
                                    color: '#94a3b8', padding: '4px',
                                }}
                                title={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {mostrarPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fca5a5',
                            borderRadius: '8px', padding: '10px 14px',
                            marginBottom: '20px', fontSize: '13px', color: '#991b1b',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            width: '100%', padding: '13px',
                            background: cargando
                                ? '#94a3b8'
                                : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                            color: 'white', border: 'none', borderRadius: '10px',
                            fontSize: '15px', fontWeight: '700', cursor: cargando ? 'not-allowed' : 'pointer',
                            boxShadow: cargando ? 'none' : '0 4px 16px rgba(14,165,233,0.4)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {cargando ? '⏳ Verificando...' : '🔐 Iniciar Sesión'}
                    </button>
                </form>

                {/* Pie */}
                <p style={{
                    textAlign: 'center', marginTop: '28px',
                    fontSize: '12px', color: '#cbd5e1',
                }}>
                    Sistema Contable v1.0 — Análisis de Sistemas I 2026
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
