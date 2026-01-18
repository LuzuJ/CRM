const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-slate-200 border-t-primary rounded-full animate-spin`}></div>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
