interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-12 h-12 text-lg'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold">R</span>
      </div>
      <span className={`${textSizeClasses[size]} font-bold text-slate-700 dark:text-slate-200`}>
        refund<span className="text-blue-500">.ai</span>
      </span>
    </div>
  );
}
