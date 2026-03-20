/**
 * Componente Input reutilizable.
 *
 * Props:
 *  - label    (string)   – Texto del label asociado al input.
 *  - name     (string)   – Atributo name/id del input.
 *  - value    (string)   – Valor controlado del input.
 *  - onChange  (func)    – Callback para el evento onChange.
 *  - type     (string)   – Tipo del input (text, email, password, etc.). Por defecto "text".
 *  - error    (string)   – Mensaje de error. Si existe, el borde cambia a rojo y se muestra el mensaje.
 *  - ...rest             – Cualquier otra prop nativa de <input> (placeholder, disabled, etc.).
 */
const Input = ({ label, name, value, onChange, type = "text", error, ...rest }) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3 h-10 py-2 rounded-lg border
          text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2
          transition-colors duration-200
          ${error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
          }
        `}
        {...rest}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
