import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'

export const Ventas = () => {
  const { productos, ventas, addVenta, deleteVenta } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ productoid: '', cantidad: 1, precioventa: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const producto = productos.find(p => p.id === form.productoid)
    if (!producto) return
    
    const cantidad = parseInt(form.cantidad)
    const precioVenta = parseFloat(form.precioventa)
    const total = cantidad * precioVenta
    const costoTotal = cantidad * parseFloat(producto.costo)
    const ganancia = total - costoTotal

    addVenta({
      productoid: form.productoid,
      productonombre: producto.nombre,
      cantidad,
      preciounitario: precioVenta,
      total,
      costounitario: parseFloat(producto.costo),
      ganancia,
      fecha: new Date().toISOString()
    })
    setIsOpen(false)
    setForm({ productoid: '', cantidad: 1, precioventa: '' })
  }

  const handleProductChange = (id) => {
    const p = productos.find(prod => prod.id === id)
    setForm({ ...form, productoid: id, precioventa: p?.precioventa || '' })
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar venta?')) deleteVenta(id)
  }

  const totalVentas = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)
  const totalGanancias = ventas.reduce((sum, v) => sum + (parseFloat(v.ganancia) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ventas</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="inline mr-2" />Nueva Venta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-2xl font-bold">Gs {totalVentas.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Ganancias</p>
          <p className="text-2xl font-bold text-success">Gs +{totalGanancias.toLocaleString()}</p>
        </Card>
      </div>

      <Card>
        <Table headers={['Producto', 'Cantidad', 'Precio', 'Total', 'Costo', 'Ganancia', 'Fecha', '']}>
          {ventas.map(v => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{v.productonombre}</td>
              <td className="px-4 py-3">{v.cantidad}</td>
              <td className="px-4 py-3">Gs {parseFloat(v.preciounitario).toFixed(0)}</td>
              <td className="px-4 py-3">Gs {parseFloat(v.total).toFixed(0)}</td>
              <td className="px-4 py-3">Gs {(parseFloat(v.costounitario) * v.cantidad).toFixed(0)}</td>
              <td className="px-4 py-3 text-success">Gs +{parseFloat(v.ganancia).toFixed(0)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(v.fecha).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {ventas.length === 0 && <p className="text-center text-gray-500 py-4">No hay ventas registradas</p>}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nueva Venta">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select 
              value={form.productoid} 
              onChange={e => handleProductChange(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              required
            >
              <option value="">Seleccionar...</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - Gs {p.precioventa} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <Input label="Cantidad" type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required />
          <Input label="Precio de Venta" type="number" step="0.01" value={form.precioventa} onChange={e => setForm({ ...form, precioventa: e.target.value })} required />
          
          {form.productoid && form.cantidad && form.precioventa && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                Costo unitario: <span className="font-medium">Gs {productos.find(p => p.id === form.productoid)?.costo || 0}</span>
              </p>
              <p className="text-sm text-gray-600">
                Costo total: <span className="font-medium">Gs {((productos.find(p => p.id === form.productoid)?.costo || 0) * form.cantidad).toFixed(0)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ganancia potencial: <span className="font-medium text-success">
                  Gs {((form.precioventa - (productos.find(p => p.id === form.productoid)?.costo || 0)) * form.cantidad).toFixed(0)}
                </span>
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit" disabled={productos.length === 0}>Registrar Venta</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}