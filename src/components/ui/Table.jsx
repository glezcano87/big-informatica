export const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-left text-sm font-medium text-gray-600">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {children}
      </tbody>
    </table>
  </div>
)