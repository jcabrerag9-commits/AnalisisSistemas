/**
 * Componente Button reutilizable.
 *
 * Props:
 *  - children  (node)     – Contenido del botón (texto, íconos, etc.).
 *  - variant   (string)   – Variante visual: "primary" | "secondary" | "danger" | "warning". Por defecto "primary".
 *  - size      (string)   – Tamaño: "sm" | "md" | "lg". Por defecto "md".
 *  - type      (string)   – Tipo del botón (button, submit, reset). Por defecto "button".
 *  - onClick   (func)     – Callback para el evento onClick.
 *  - disabled  (bool)     – Deshabilita el botón. Por defecto false.
 *  - className (string)   – Clases adicionales de Tailwind para personalización extra.
 *  - ...rest              – Cualquier otra prop nativa de <button>.
 */

const variantClasses = {
  primary:
    "bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white focus:ring-sky-300",
  secondary:
    "bg-slate-400 hover:bg-slate-500 active:bg-slate-600 text-white focus:ring-slate-300",
  danger:
    "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-300",
  warning:
    "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-300",
  success:
    "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white focus:ring-green-300",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        inline-flex items-center justify-center
        font-medium rounded-lg border-none
        cursor-pointer
        focus:outline-none focus:ring-2
        transition-all duration-300 ease-in
        hover:scale-105 active:scale-95 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
