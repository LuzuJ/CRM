const Toast = ({ message, type = 'error', onClose, icon }) => {
  const typeStyles = {
    error: 'border-red-500 bg-white',
    success: 'border-green-500 bg-white',
    warning: 'border-yellow-500 bg-white',
    info: 'border-blue-500 bg-white',
  };

  const iconMap = {
    error: 'error',
    success: 'check_circle',
    warning: 'warning',
    info: 'info',
  };

  const iconColorMap = {
    error: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className="fixed top-6 right-1/2 translate-x-1/2 z-50 animate-bounce-in opacity-100 transition-all duration-300">
      <div className={`flex items-start gap-4 p-4 border-l-4 rounded-r-lg shadow-toast max-w-md ${typeStyles[type]}`}>
        <span className={`material-symbols-outlined ${iconColorMap[type]} mt-0.5`}>
          {icon || iconMap[type]}
        </span>
        <div className="flex flex-col flex-1">
          <p className="text-sm text-slate-900">{message}</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
