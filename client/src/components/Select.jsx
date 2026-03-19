/**
 * Componente Select reutilizable.
 *
 * Props:
 *  - label     (string)   – Texto del label asociado al select.
 *  - name      (string)   – Atributo name/id del select.
 *  - value     (string)   – Valor controlado del select.
 *  - onChange   (func)    – Callback para el evento onChange.
 *  - options   (array)    – Array de objetos { value, label } para renderizar las opciones.
 *  - error     (string)   – Mensaje de error. Si existe, el borde cambia a rojo y se muestra el mensaje.
 *  - ...rest              – Cualquier otra prop nativa de <select> (disabled, required, etc.).
 */
const Select = ({ label, name, value, onChange, options = [], error, ...rest }) => {
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

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3 h-10 py-2 rounded-lg border
          text-sm text-gray-900 bg-gray placeholder-gray-400
          focus:outline-none focus:ring-2
          transition-colors duration-200
          ${error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-400 focus:border-blue-400"
          }
        `}
        {...rest}
      >
        <option value="">-- Seleccione --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
