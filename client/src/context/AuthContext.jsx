import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = 'http://localhost:5000/api';

const ROLES_ADMIN = ['ADMINISTRADOR'];

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario]   = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get(`${API}/auth/me`)
                .then(res => setUsuario(res.data.usuario))
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => setCargando(false));
        } else {
            setCargando(false);
        }
    }, []);

    const login = async (usuarioInput, contrasena) => {
        const res = await axios.post(`${API}/auth/login`, { usuario: usuarioInput, contrasena });
        const { token, usuario: userData } = res.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUsuario(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUsuario(null);
    };

    const tieneRol = (rolesRequeridos = []) => {
        if (!usuario?.roles) return false;
        return rolesRequeridos.some(r => usuario.roles.includes(r));
    };

    const esAdmin = () => tieneRol(ROLES_ADMIN);

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando, tieneRol, esAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);