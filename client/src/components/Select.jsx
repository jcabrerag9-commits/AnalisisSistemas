const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error = '',
  disabled = false,
  required = false,
  placeholder = '-- Seleccione --',
  className = '',
  ...props
}) => {
  const selectClass = [
    'w-full border rounded px-3 py-2 text-sm text-zinc-900 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
    'transition-colors appearance-none',
    error ? 'border-red-400 focus:ring-red-500' : 'border-zinc-300',
    className,
  ].join(' ');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={selectClass}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
