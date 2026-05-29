/**
 * HelpIcon — Circulito con "?" que muestra un tooltip al hacer hover.
 *
 * Uso:
 *   import HelpIcon from '../components/HelpIcon';
 *   <HelpIcon text="Descripción del campo" />
 *
 * Props:
 *   text     (string)  – Texto del tooltip.
 *   position (string)  – 'top' | 'bottom' | 'left' | 'right'. Default: 'top'.
 *   size     (number)  – Tamaño en px del círculo. Default: 16.
 */
import { useState } from 'react';

const HelpIcon = ({ text, position = 'top', size = 16 }) => {
    const [visible, setVisible] = useState(false);

    const posStyle = {
        top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
        bottom: { top: '100%',   left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
        left:   { right: '100%', top: '50%',  transform: 'translateY(-50%)', marginRight: '6px' },
        right:  { left: '100%',  top: '50%',  transform: 'translateY(-50%)', marginLeft: '6px' },
    };

    return (
        <span
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {/* Círculo con ? */}
            <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: size, height: size,
                borderRadius: '50%',
                background: '#94a3b8',
                color: 'white',
                fontSize: size * 0.6,
                fontWeight: '700',
                lineHeight: 1,
                userSelect: 'none',
                flexShrink: 0,
            }}>
                ?
            </span>

            {/* Tooltip */}
            {visible && text && (
                <span style={{
                    position: 'absolute',
                    ...posStyle[position],
                    zIndex: 9999,
                    background: '#1e293b',
                    color: '#f1f5f9',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    whiteSpace: 'normal',
                    width: '220px',
                    pointerEvents: 'none',
                }}>
                    {text}
                </span>
            )}
        </span>
    );
};

export default HelpIcon;