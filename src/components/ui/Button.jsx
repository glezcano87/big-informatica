export const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled, className = '' }) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    success: 'bg-success hover:opacity-90 text-white',
    danger: 'bg-danger hover:opacity-90 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}