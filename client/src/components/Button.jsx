const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px';

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/40 hover:shadow-lg hover:shadow-blue-500/55 active:shadow-sm active:shadow-blue-500/30',
    secondary: 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 shadow-sm shadow-zinc-400/30 hover:shadow-md hover:shadow-zinc-400/40 active:shadow-none',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-500/40 hover:shadow-lg hover:shadow-red-500/55 active:shadow-sm active:shadow-red-500/30',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-md shadow-amber-500/40 hover:shadow-lg hover:shadow-amber-500/55 active:shadow-sm active:shadow-amber-500/30',
    success:   'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md shadow-green-500/40 hover:shadow-lg hover:shadow-green-500/55 active:shadow-sm active:shadow-green-500/30',
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
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
