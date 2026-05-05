import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'

const metodos = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta']

export const Cobros = () => {
  const { servicios, cobros, addCobro, deleteCobro } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ servicioid: '', cliente: '', monto: '', método: 'Efectivo', observaciones: '' })

  const serviciosPendientes = servicios

  const handleSubmit = (e) => {
    e.preventDefault()
    addCobro({
      servicioid: form.servicioid,
      cliente: form.cliente,
      monto: parseFloat(form.monto),
      método: form.método,
      observaciones: form.observaciones,
      fecha: new Date().toISOString()
    })
    setIsOpen(false)
    setForm({ servicioid: '', cliente: '', monto: '', método: 'Efectivo', observaciones: '' })
  }

  const handleServicioChange = (id) => {
    const s = servicios.find(serv => serv.id === id)
    setForm({ ...form, servicioid: id, cliente: s?.cliente || '', monto: s?.total || '' })
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar cobro?')) deleteCobro(id)
  }

  const totalCobros = cobros.reduce((sum, c) => sum + (parseFloat(c.monto) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cobros</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="inline mr-2" />Registrar Cobro
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-600">Total cobros registrados:</span>
          <span className="text-xl font-bold text-success">+Gs {totalCobros.toLocaleString()}</span>
        </div>
        <Table headers={['Cliente', 'Servicio', 'Monto', 'Método', 'Fecha', 'Observaciones', '']}>
          {cobros.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{c.cliente}</td>
              <td className="px-4 py-3 text-sm">{c.servicioid}</td>
              <td className="px-4 py-3 text-success font-medium">+Gs {parseFloat(c.monto).toFixed(2)}</td>
              <td className="px-4 py-3">{c.método}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.fecha).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{c.observaciones}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {cobros.length === 0 && <p className="text-center text-gray-500 py-4">No hay cobros registrados</p>}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Cobro">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
            <select 
              value={form.servicioid} 
              onChange={e => handleServicioChange(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              required
            >
              <option value="">Seleccionar...</option>
              {serviciosPendientes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.cliente} - {s.tipo} - Gs {parseFloat(s.total || 0).toLocaleString()} ({s.estado})
                </option>
              ))}
            </select>
          </div>
          <Input label="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required />
          <Input label="Monto" type="number" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select 
              value={form.método} 
              onChange={e => setForm({ ...form, método: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {metodos.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea 
              value={form.observaciones} 
              onChange={e => setForm({ ...form, observaciones: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              rows="2" 
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={serviciosPendientes.length === 0}>Registrar</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}