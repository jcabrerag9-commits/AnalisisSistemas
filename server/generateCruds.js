const fs = require('fs');
const path = require('path');

const ddl = `
CREATE TABLE CON_USUARIO (
    USU_USUARIO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USU_USER VARCHAR2(50) UNIQUE NOT NULL,
    USU_CONTRASEÑA VARCHAR2(255) NOT NULL -- Debe guardar el hash, nunca en texto plano
);

CREATE TABLE CON_ROL (
    ROL_ROL NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ROL_NOMBRE VARCHAR2(50) UNIQUE NOT NULL,
    ROL_DESCRIPCION VARCHAR2(255)
);

CREATE TABLE CON_USUARIO_ROL (
    USR_USUARIO_ROL NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USU_USUARIO NUMBER NOT NULL,
    ROL_ROL NUMBER NOT NULL,
    CONSTRAINT FK_USR_USUARIO FOREIGN KEY (USU_USUARIO) REFERENCES CON_USUARIO(USU_USUARIO),
    CONSTRAINT FK_USR_ROL FOREIGN KEY (ROL_ROL) REFERENCES CON_ROL(ROL_ROL),
    CONSTRAINT UQ_USUARIO_ROL UNIQUE (USU_USUARIO, ROL_ROL)
);

CREATE TABLE CON_MONEDA (
    MON_MONEDA NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MON_CODIGO_ISO VARCHAR2(3) UNIQUE NOT NULL, -- Ej: USD, GTQ
    MON_NOMBRE VARCHAR2(50) NOT NULL,
    MON_SIMBOLO VARCHAR2(5) NOT NULL
);

CREATE TABLE CON_ESTADO_PERIODO (
    ESP_ESTADO_PERIODO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ESP_NOMBRE VARCHAR2(50) UNIQUE NOT NULL, -- Ej: ABIERTO, CERRADO
    ESP_DESCRIPCION VARCHAR2(255)
);

CREATE TABLE CON_ESTADO_ASIENTO (
    ESA_ESTADO_ASIENTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ESA_NOMBRE VARCHAR2(50) UNIQUE NOT NULL, -- Ej: BORRADOR, VALIDADO, ANULADO
    ESA_DESCRIPCION VARCHAR2(255)
);

CREATE TABLE CON_TIPO_ASIENTO (
    TPA_TIPO_ASIENTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TPA_CODIGO VARCHAR2(20) UNIQUE NOT NULL,
    TPA_DESCRIPCION VARCHAR2(100) NOT NULL
);

CREATE TABLE CON_TIPO_CUENTA (
    TCU_TIPO_CUENTA NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TCU_NOMBRE VARCHAR2(50) UNIQUE NOT NULL, -- ACTIVO, PASIVO, PATRIMONIO, ETC.
    TCU_DESCRIPCION VARCHAR2(255)
);

CREATE TABLE CON_CENTRO_COSTO (
    CTC_CENTRO_COSTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CTC_CENTRO_COSTO_PADRE NUMBER,
    CTC_CODIGO_DEPARTAMENTO VARCHAR2(50) UNIQUE NOT NULL,
    CTC_NOMBRE VARCHAR2(100) NOT NULL,
    CONSTRAINT FK_CTC_PADRE FOREIGN KEY (CTC_CENTRO_COSTO_PADRE) REFERENCES CON_CENTRO_COSTO(CTC_CENTRO_COSTO)
);

CREATE TABLE CON_CUENTA (
    CUE_CUENTA NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CUE_CUENTA_PADRE NUMBER,
    TCU_TIPO_CUENTA NUMBER NOT NULL,
    CUE_CODIGO VARCHAR2(50) UNIQUE NOT NULL,
    CUE_NOMBRE VARCHAR2(150) NOT NULL,
    CUE_DESCRIPCION VARCHAR2(255),
    CONSTRAINT FK_CUE_PADRE FOREIGN KEY (CUE_CUENTA_PADRE) REFERENCES CON_CUENTA(CUE_CUENTA),
    CONSTRAINT FK_CUE_TIPO FOREIGN KEY (TCU_TIPO_CUENTA) REFERENCES CON_TIPO_CUENTA(TCU_TIPO_CUENTA)
);

CREATE TABLE CON_TIPO_CAMBIO (
    TPC_TIPO_CAMBIO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    MON_MONEDA NUMBER NOT NULL,
    TPC_FECHA_TASA DATE NOT NULL,
    TPC_TASA_COMPRA NUMBER(18,4) NOT NULL,
    TPC_TASA_VENTA NUMBER(18,4) NOT NULL,
    CONSTRAINT FK_TPC_MONEDA FOREIGN KEY (MON_MONEDA) REFERENCES CON_MONEDA(MON_MONEDA),
    CONSTRAINT UQ_TIPO_CAMBIO_FECHA UNIQUE (MON_MONEDA, TPC_FECHA_TASA)
);

CREATE TABLE CON_PERIODO (
    PER_PERIODO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ESP_ESTADO_PERIODO NUMBER NOT NULL,
    PER_AÑO NUMBER(4) NOT NULL,
    PER_MES NUMBER(2) NOT NULL CHECK (PER_MES BETWEEN 1 AND 12),
    CONSTRAINT FK_PER_ESTADO FOREIGN KEY (ESP_ESTADO_PERIODO) REFERENCES CON_ESTADO_PERIODO(ESP_ESTADO_PERIODO),
    CONSTRAINT UQ_PERIODO_MES UNIQUE (PER_AÑO, PER_MES)
);

CREATE TABLE CON_IMPUESTO (
    IMP_IMPUESTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CUE_CUENTA NUMBER NOT NULL, -- Cuenta de pasivo/activo donde recae
    IMP_CODIGO VARCHAR2(20) UNIQUE NOT NULL,
    IMP_NOMBRE VARCHAR2(100) NOT NULL,
    IMP_PORCENTAJE NUMBER(5,4) NOT NULL, -- Ej: 0.1200 para 12%
    IMP_FECHA_VIGENCIA_INICIO DATE NOT NULL,
    IMP_FECHA_VIGENCIA_FIN DATE,
    IMP_ESTADO NUMBER(1) DEFAULT 1 NOT NULL CHECK (IMP_ESTADO IN (0, 1)),
    CONSTRAINT FK_IMP_CUENTA FOREIGN KEY (CUE_CUENTA) REFERENCES CON_CUENTA(CUE_CUENTA)
);

CREATE TABLE CON_ASIENTO (
    ASI_ASIENTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PER_PERIODO NUMBER NOT NULL,
    TPA_TIPO_ASIENTO NUMBER NOT NULL,
    ESA_ESTADO_ASIENTO NUMBER NOT NULL,
    USU_USUARIO NUMBER NOT NULL,
    ASI_FECHA DATE NOT NULL,
    ASI_GLOSA VARCHAR2(500) NOT NULL,
    CONSTRAINT FK_ASI_PERIODO FOREIGN KEY (PER_PERIODO) REFERENCES CON_PERIODO(PER_PERIODO),
    CONSTRAINT FK_ASI_TIPO FOREIGN KEY (TPA_TIPO_ASIENTO) REFERENCES CON_TIPO_ASIENTO(TPA_TIPO_ASIENTO),
    CONSTRAINT FK_ASI_ESTADO FOREIGN KEY (ESA_ESTADO_ASIENTO) REFERENCES CON_ESTADO_ASIENTO(ESA_ESTADO_ASIENTO),
    CONSTRAINT FK_ASI_USUARIO FOREIGN KEY (USU_USUARIO) REFERENCES CON_USUARIO(USU_USUARIO)
);

CREATE TABLE CON_ASIENTO_DETALLE (
    ASD_ASIENTO_DETALLE NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ASI_ASIENTO NUMBER NOT NULL,
    CUE_CUENTA NUMBER NOT NULL,
    CTC_CENTRO_COSTO NUMBER, -- Puede ser NULL si es cuenta de balance (bancos)
    MON_MONEDA NUMBER NOT NULL,
    CTC_TASA_CAMBIO NUMBER(18,4) NOT NULL,
    ASD_DEBE_ORIGEN NUMBER(18,2) DEFAULT 0 NOT NULL,
    ASD_HABER_ORIGEN NUMBER(18,2) DEFAULT 0 NOT NULL,
    ASD_DEBE_LOCAL NUMBER(18,2) DEFAULT 0 NOT NULL,
    ASD_HABER_LOCAL NUMBER(18,2) DEFAULT 0 NOT NULL,
    CONSTRAINT FK_ASD_ASIENTO FOREIGN KEY (ASI_ASIENTO) REFERENCES CON_ASIENTO(ASI_ASIENTO),
    CONSTRAINT FK_ASD_CUENTA FOREIGN KEY (CUE_CUENTA) REFERENCES CON_CUENTA(CUE_CUENTA),
    CONSTRAINT FK_ASD_CENTRO FOREIGN KEY (CTC_CENTRO_COSTO) REFERENCES CON_CENTRO_COSTO(CTC_CENTRO_COSTO),
    CONSTRAINT FK_ASD_MONEDA FOREIGN KEY (MON_MONEDA) REFERENCES CON_MONEDA(MON_MONEDA)
);

CREATE TABLE CON_IMPUESTO_MOVIMIENTO (
    IMM_IMPUESTO_MOVIMIENTO NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ASD_ASIENTO_DETALLE NUMBER NOT NULL,
    IMP_IMPUESTO NUMBER NOT NULL,
    IMM_BASE_IMPONIBLE NUMBER(18,2) NOT NULL,
    IMM_MONTO_IMPUESTO NUMBER(18,2) NOT NULL,
    IMM_TIPO_AFECTACION VARCHAR2(20) NOT NULL, -- Ej: GENERADO, SOPORTADO
    CONSTRAINT FK_IMM_DETALLE FOREIGN KEY (ASD_ASIENTO_DETALLE) REFERENCES CON_ASIENTO_DETALLE(ASD_ASIENTO_DETALLE),
    CONSTRAINT FK_IMM_IMPUESTO FOREIGN KEY (IMP_IMPUESTO) REFERENCES CON_IMPUESTO(IMP_IMPUESTO)
);

CREATE TABLE CON_BITACORA (
    BIT_BITACORA NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USU_USUARIO NUMBER NOT NULL,
    BIT_TABLA_AFECTADA VARCHAR2(100) NOT NULL,
    BIT_ACCION VARCHAR2(20) NOT NULL, -- INSERT, UPDATE, DELETE
    BIT_FECHA_HORA TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    BIT_DATOS_PREVIOS CLOB, -- Para guardar JSON del registro antes del cambio
    CONSTRAINT FK_BIT_USUARIO FOREIGN KEY (USU_USUARIO) REFERENCES CON_USUARIO(USU_USUARIO)
);
`;

const getTables = (ddl) => {
    const tableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
    let match;
    const tables = [];
    while ((match = tableRegex.exec(ddl)) !== null) {
        const tableName = match[1];
        const body = match[2];
        const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--') && !l.startsWith('CONSTRAINT'));
        const columns = lines.map(l => {
            const parts = l.split(' ');
            const colName = parts[0];
            const isPk = l.includes('PRIMARY KEY');
            return { colName, isPk };
        }).filter(c => c.colName);
        
        const foreignKeys = [];
        const fkRegex = /CONSTRAINT \w+ FOREIGN KEY \(([\w, ]+)\) REFERENCES (\w+)\(([\w, ]+)\)/g;
        let fkMatch;
        while ((fkMatch = fkRegex.exec(body)) !== null) {
            foreignKeys.push({
                column: fkMatch[1].trim(),
                refTable: fkMatch[2].trim(),
                refColumn: fkMatch[3].trim()
            });
        }
        
        tables.push({ tableName, columns, foreignKeys });
    }
    return tables;
};

const tables = getTables(ddl);

const serverRoutesDir = path.join(__dirname, 'routes');
if (!fs.existsSync(serverRoutesDir)) {
    fs.mkdirSync(serverRoutesDir);
}
const serverControllersDir = path.join(__dirname, 'controllers');
if (!fs.existsSync(serverControllersDir)) {
    fs.mkdirSync(serverControllersDir);
}

const reactPagesDir = path.join(__dirname, '../client/src/pages');
if (!fs.existsSync(reactPagesDir)) {
    fs.mkdirSync(reactPagesDir);
}


tables.forEach(table => {
    const { tableName, columns, foreignKeys } = table;
    const pk = columns.find(c => c.isPk)?.colName || columns[0].colName;
    const cols = columns.filter(c => !c.isPk).map(c => c.colName);
    const kebabName = tableName.toLowerCase().replace(/_/g, '-');

    // Extract unique references
    const refs = [];
    foreignKeys.forEach(fk => {
        if (!refs.find(r => r.refTable === fk.refTable)) {
            refs.push({ refTable: fk.refTable, refKebab: fk.refTable.toLowerCase().replace(/_/g, '-') });
        }
    });

    const componentContent = `
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ${tableName}Crud = () => {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ ${cols.map(c => `${c}: ''`).join(', ')} });
    const [editingId, setEditingId] = useState(null);

    ${refs.map(r => `const [${r.refTable}Data, set${r.refTable}Data] = useState([]);`).join('\n    ')}

    const API_URL = 'http://localhost:5000/api/${kebabName}';

    useEffect(() => {
        fetchData();
        ${refs.map(r => `fetch${r.refTable}Data();`).join('\n        ')}
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    ${refs.map(r => `
    const fetch${r.refTable}Data = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/${r.refKebab}');
            set${r.refTable}Data(res.data);
        } catch (err) {
            console.error(err);
        }
    };`).join('\n')}

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(\`\${API_URL}/\${editingId}\`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            setFormData({ ${cols.map(c => `${c}: ''`).join(', ')} });
            setEditingId(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ${cols.map(c => `${c}: item.${c}`).join(', ')} });
        setEditingId(item.${pk});
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar registro?')) {
            try {
                await axios.delete(\`\${API_URL}/\${id}\`);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de ${tableName}</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    ${cols.map(c => {
                        const isFk = foreignKeys.find(fk => fk.column === c);
                        if (isFk) {
                            return `
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>${c} (FK)</label>
                        <select name="${c}" value={formData.${c} || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', color: '#0f172a' }} required>
                            <option value="">Seleccione...</option>
                            {${isFk.refTable}Data.map(opt => (
                                <option key={opt.${isFk.refColumn}} value={opt.${isFk.refColumn}}>
                                    {opt.${isFk.refColumn}} - {opt[Object.keys(opt)[1]]} 
                                </option>
                            ))}
                        </select>
                    </div>`;
                        } else {
                            return `
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>${c}</label>
                        <input name="${c}" value={formData.${c} || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }} required />
                    </div>`;
                        }
                    }).join('')}
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ ${cols.map(c => `${c}: ''`).join(', ')} }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#334155' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>${pk}</th>
                            ${cols.map(c => `<th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>${c}</th>`).join('\n                            ')}
                            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.${pk}} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{item.${pk}}</td>
                                ${cols.map(c => `<td style={{ padding: '12px', color: '#64748b' }}>{item.${c}}</td>`).join('\n                                ')}
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                                    <button onClick={() => handleDelete(item.${pk})} style={{ padding: '6px 12px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No hay registros disponibles.</p>}
            </div>
        </div>
    );
};

export default ${tableName}Crud;
`;
    fs.writeFileSync(path.join(reactPagesDir, `${tableName}Crud.jsx`), componentContent);
});

console.log('React components for CRUD updated successfully to include Select dropdowns with FK.');
