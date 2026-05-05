import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useStore } from '../store/useStore'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const categorias = ['Hardware', 'Periférico', 'Software', 'Accesorio', 'Otro']

export const Productos = () => {
  const { productos, addProducto, updateProducto, deleteProducto } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', categoría: 'Hardware', costo: '', precioventa: '', stock: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editando) {
      updateProducto(editando.id, { 
        ...form, 
        costo: parseFloat(form.costo), 
        precioventa: parseFloat(form.precioventa), 
        stock: parseInt(form.stock) 
      })
    } else {
      addProducto({ 
        ...form, 
        costo: parseFloat(form.costo), 
        precioventa: parseFloat(form.precioventa), 
        stock: parseInt(form.stock), 
        fecha: new Date().toISOString() 
      })
    }
    setIsOpen(false)
    setForm({ nombre: '', categoría: 'Hardware', costo: '', precioventa: '', stock: '' })
    setEditando(null)
  }

  const handleEdit = (p) => {
    setEditando(p)
    setForm(p)
    setIsOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar producto?')) deleteProducto(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="inline mr-2" />Nuevo
        </Button>
      </div>

      <Card>
        <Table headers={['Nombre', 'Categoría', 'Costo', 'Precio Venta', 'Ganancia', 'Stock', 'Acciones']}>
          {productos.map(p => {
            const ganancia = (parseFloat(p.precioventa) || 0) - (parseFloat(p.costo) || 0)
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3">{p.categoría}</td>
                <td className="px-4 py-3">Gs {parseFloat(p.costo).toFixed(0)}</td>
                <td className="px-4 py-3">Gs {parseFloat(p.precioventa).toFixed(0)}</td>
                <td className="px-4 py-3 text-success">Gs +{ganancia.toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${parseInt(p.stock) < 5 ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 mr-2">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )
          })}
        </Table>
        {productos.length === 0 && <p className="text-center text-gray-500 py-4">No hay productos cargados</p>}
      </Card>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditando(null) }} title={editando ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit}>
          <Input label="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
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
          <Input label="Costo (compra)" type="number" step="0.01" value={form.costo} onChange={e => setForm({ ...form, costo: e.target.value })} required />
          <Input label="Precio Venta" type="number" step="0.01" value={form.precioventa} onChange={e => setForm({ ...form, precioventa: e.target.value })} required />
          <Input label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
          
          {form.costo && form.precioventa && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                Ganancia potencial por unidad: <span className="font-medium text-success">
                  Gs {((parseFloat(form.precioventa) || 0) - (parseFloat(form.costo) || 0)).toFixed(0)}
                </span>
              </p>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button type="submit">{editando ? 'Actualizar' : 'Crear'}</Button>
            <Button variant="outline" onClick={() => { setIsOpen(false); setEditando(null) }}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}