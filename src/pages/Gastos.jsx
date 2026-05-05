import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'

const categorias = ['Insumos', 'Servicios', 'Alquiler', 'Transporte', 'Impuestos', 'Otro']
const tipos = ['Fijo', 'Variable']

export const Gastos = () => {
  const { gastos, addGasto, deleteGasto } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ descripción: '', categoría: 'Insumos', monto: '', proveedor: '', tipo: 'Variable' })

  const handleSubmit = (e) => {
    e.preventDefault()
    addGasto({
      ...form,
      monto: parseFloat(form.monto),
      fecha: new Date().toISOString()
    })
    setIsOpen(false)
    setForm({ descripción: '', categoría: 'Insumos', monto: '', proveedor: '', tipo: 'Variable' })
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar gasto?')) deleteGasto(id)
  }

  const totalGastos = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)

  const gastoPorCategoria = categorias.map(cat => ({
    categoría: cat,
    total: gastos.filter(g => g.categoría === cat).reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)
  })).filter(g => g.total > 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="inline mr-2" />Nuevo Gasto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total gastos registrados</p>
          <p className="text-2xl font-bold text-danger">-Gs {totalGastos.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Cantidad de gastos</p>
          <p className="text-2xl font-bold">{gastos.length}</p>
        </Card>
      </div>

      {gastoPorCategoria.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gastoPorCategoria.map(g => (
              <div key={g.categoría} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">{g.categoría}</p>
                <p className="text-lg font-bold text-danger">-Gs {g.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <Table headers={['Descripción', 'Categoría', 'Monto', 'Proveedor', 'Tipo', 'Fecha', '']}>
          {gastos.map(g => (
            <tr key={g.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{g.descripción}</td>
              <td className="px-4 py-3">{g.categoría}</td>
              <td className="px-4 py-3 text-danger font-medium">-Gs {parseFloat(g.monto).toFixed(2)}</td>
              <td className="px-4 py-3">{g.proveedor || '-'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded Gs {g.tipo === 'Fijo' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {g.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(g.fecha).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {gastos.length === 0 && <p className="text-center text-gray-500 py-4">No hay gastos registrados</p>}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Gasto">
        <form onSubmit={handleSubmit}>
          <Input label="Descripción" value={form.descripción} onChange={e => setForm({ ...form, descripción: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              value={form.categoría} 
              onChange={e => setForm({ ...form, categoría: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          
          <Input label="Monto" type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} required />
          <Input label="Proveedor" value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select 
              value={form.tipo} 
              onChange={e => setForm({ ...form, tipo: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {tipos.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button type="submit">Registrar</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}