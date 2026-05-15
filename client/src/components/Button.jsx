const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
    success:   'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    ghost:     'bg-transparent text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  const classes = [
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ].join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
