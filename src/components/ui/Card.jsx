export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
)