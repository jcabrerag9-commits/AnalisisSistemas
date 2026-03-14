# Proyecto React + Node.js + Oracle (Thin Mode)

Este proyecto es una estructura base moderna diseñada para aplicaciones empresariales. Conecta un frontend reactivo en React con un backend robusto en Node.js, utilizando el modo **Thin** de Oracle para simplificar la infraestructura.

## 📂 Estructura del Proyecto
- **/client**: Frontend (React + Vite, Lucide Icons, Framer Motion, Axios).
- **/server**: API Backend (Node.js, Express, node-oracledb).

## 📋 Requisitos Previos
- [Node.js](https://nodejs.org/) (v18.x o superior recomendado).
- [Oracle Database](https://www.oracle.com/database/technologies/xe-downloads.html) (Local o Instancia remota).

---

## 🛠️ Guía de Instalación (Para Colaboradores)

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

### 1. Clonar el repositorio
Si aún no tienes el código localmente:
```bash
git clone <url-del-repositorio>
cd AnalisisSistemas
```

### 2. Instalación de Dependencias del Servidor
```bash
cd server
npm install
```

### 3. Instalación de Dependencias del Cliente
En una nueva terminal:
```bash
cd client
npm install
```

### 4. Configuración de Variables de Entorno
En la carpeta `/server`, encontrarás un archivo llamado `.env` (o puedes crearlo si no existe). Asegúrate de que contenga tus credenciales de base de datos:

```env
PORT=5000
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_password
ORACLE_CONNECTION_STRING=localhost:1521/orcl
```

> [!TIP]
> **Modo Thin de Oracle:** Este proyecto NO requiere la instalación del Oracle Instant Client. Se conecta directamente vía red.

---

## 🚀 Cómo Ejecutar el Proyecto

Debes tener ambas terminales corriendo simultáneamente:

### Iniciar Backend
```bash
cd server
npm run dev
```
*El servidor estará disponible en `http://localhost:5000`*

### Iniciar Frontend
```bash
cd client
npm run dev
```
*La aplicación estará disponible en `http://localhost:5173`*

---

## ✨ Características Principales
- **Aesthetics Premium**: Interfaz moderna con efectos de Glassmorphism y degradados dinámicos.
- **Oracle Thin Mode**: Conexión nativa de alto rendimiento sin dependencias binarias externas.
- **Micro-animaciones**: Implementadas con Framer Motion para una experiencia de usuario fluida.
- **Preparado para Escalar**: Separación clara entre lógica de negocio (server) e interfaz (client).

## 🤝 Contribución
1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
2. Realiza tus cambios y haz commit (`git commit -m 'Añade funcionalidad X'`).
3. Empuja tu rama (`git push origin feature/nueva-funcionalidad`).
4. Abre un Pull Request.
