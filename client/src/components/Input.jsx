import HelpIcon from './HelpIcon';

const Input = ({ label, name, value, onChange, type = 'text', error, hint, helpText, required, ...rest }) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                    {helpText && <HelpIcon text={helpText} position="right" size={15} />}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className={`
                    w-full px-3 h-10 py-2 rounded-lg border
                    text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2
                    transition-all duration-200
                    ${error
                        ? 'border-red-500 focus:ring-red-300 bg-red-50'
                        : 'border-gray-300 focus:ring-sky-400 focus:border-sky-400 hover:border-gray-400'
                    }
                `}
                {...rest}
            />
            {hint && !error && (
                <p className="mt-1 text-xs text-slate-400">{hint}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
};

export default Input;