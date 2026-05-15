/**
 * Tooltip reutilizable.
 * Uso: <Tooltip text="Explica algo aquí"><Button>Hover me</Button></Tooltip>
 */
import { useState } from 'react';

const Tooltip = ({ text, children, position = 'top' }) => {
    const [visible, setVisible] = useState(false);

    const posClasses = {
        top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left:   'right-full top-1/2 -translate-y-1/2 mr-2',
        right:  'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top:    'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
        left:   'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
        right:  'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && text && (
                <div className={`absolute z-50 ${posClasses[position]} pointer-events-none`}>
                    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs whitespace-normal leading-relaxed">
                        {text}
                    </div>
                    <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;