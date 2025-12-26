import logo from '@/assets/svg/logo-reembolso-ia.svg';
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="Logo" className="w-8 h-8" />
      <span className={`${textSizeClasses[size]} font-bold text-slate-700 dark:text-slate-200`}>
        Reembolso<span className="text-green-800">.ia</span>
      </span>
    </div>
  );
}
