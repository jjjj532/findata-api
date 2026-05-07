interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm'
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
  };
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
