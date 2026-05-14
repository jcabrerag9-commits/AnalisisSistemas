const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error = '',
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputClass = [
    'w-full border rounded px-3 py-2 text-sm text-zinc-900 bg-white placeholder-zinc-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
    'transition-colors',
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
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClass}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
