import { useState, useEffect } from 'react'
import { Database, Server, Users, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import './index.css'

function App() {
  const [serverStatus, setServerStatus] = useState('checking')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health')
        if (response.data.status === 'OK') {
          setServerStatus('online')
        }
      } catch (error) {
        setServerStatus('offline')
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users')
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    fetchUsers()
  }, [])

  return (
    <div className="App">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="card"
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Database size={48} color="#60a5fa" />
          <Server size={48} color="#a855f7" />
        </div>

        <h1>Oracle + Node + React</h1>

        <div className={`status-badge ${serverStatus === 'online' ? 'status-online' : 'status-offline'}`}>
          <Activity size={16} style={{ marginRight: '8px' }} />
          Server Status: {serverStatus.toUpperCase()}
        </div>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Estructura base lista para producción. Conexión a Oracle Database configurada en modo Thin.
          Desarrollado con Express, Vite y Framer Motion.
        </p>

        <div className="grid">
          {loading ? (
            <p>Cargando datos...</p>
          ) : (
            users.map(user => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.02 }}
                className="user-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Users size={20} color="#60a5fa" />
                  <h3>{user.name}</h3>
                </div>
                <p>{user.email}</p>
              </motion.div>
            ))
          )}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => window.location.reload()}>
            Actualizar Dashboard
          </button>
        </div>
      </motion.div>

      <footer style={{ marginTop: '2rem', color: '#475569', fontSize: '0.875rem' }}>
        &copy; 2024 - Sistema de Análisis y Control
      </footer>
    </div>
  )
}

export default App
