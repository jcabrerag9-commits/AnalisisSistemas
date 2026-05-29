import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import HelpIcon from './HelpIcon';

const norm = (s) =>
    String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    hint,
    helpText,
    required,
    disabled,
    placeholder = '-- Seleccione --',
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlighted, setHighlighted] = useState(-1);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    const triggerRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);

    const selected = options.find((o) => String(o.value) === String(value));
    const filtered = options.filter((o) => norm(o.label).includes(norm(search)));

    const openDropdown = () => {
        if (disabled) return;
        const r = triggerRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220) });
        setOpen(true);
        setSearch('');
        setHighlighted(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
    };

    const close = () => {
        setOpen(false);
        setSearch('');
    };

    const pick = (opt) => {
        onChange({ target: { name, value: String(opt.value) } });
        close();
    };

    const clear = () => {
        onChange({ target: { name, value: '' } });
        close();
    };

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (!triggerRef.current?.contains(e.target)) close();
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('scroll', close, true);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('scroll', close, true);
        };
    }, [open]);

    const onKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter' && highlighted >= 0) {
            e.preventDefault();
            pick(filtered[highlighted]);
        } else if (e.key === 'Escape') {
            close();
        }
    };

    useEffect(() => {
        if (highlighted >= 0 && listRef.current) {
            listRef.current.children[highlighted]?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlighted]);

    const dropdown =
        open &&
        createPortal(
            <div
                style={{
                    position: 'fixed',
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    zIndex: 9999,
                }}
                className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <div className="p-2 border-b border-gray-100">
                    <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setHighlighted(-1);
                        }}
                        onKeyDown={onKey}
                        placeholder="Buscar..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>
                <ul ref={listRef} className="max-h-52 overflow-y-auto">
                    {!required && (
                        <li
                            className="px-3 py-2 text-sm cursor-pointer text-gray-400 hover:bg-gray-50"
                            onMouseDown={(e) => { e.preventDefault(); clear(); }}
                        >
                            {placeholder}
                        </li>
                    )}
                    {filtered.length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400">Sin resultados</li>
                    )}
                    {filtered.map((opt, i) => (
                        <li
                            key={opt.value}
                            className={`px-3 py-2 text-sm cursor-pointer ${
                                String(opt.value) === String(value)
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : highlighted === i
                                    ? 'bg-sky-50'
                                    : 'hover:bg-gray-50'
                            }`}
                            onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            </div>,
            document.body
        );

    return (
        <div className="mb-4">
            {label && (
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                    {helpText && <HelpIcon text={helpText} position="right" size={15} />}
                </label>
            )}
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={openDropdown}
                className={`
                    w-full px-3 h-10 rounded-lg border text-sm text-left
                    flex items-center justify-between gap-2
                    focus:outline-none transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed bg-white
                    ${
                        error
                            ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                            : open
                            ? 'border-sky-400 ring-2 ring-sky-200'
                            : 'border-gray-300 hover:border-gray-400'
                    }
                `}
            >
                <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {dropdown}
            {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
};

export default Select;
