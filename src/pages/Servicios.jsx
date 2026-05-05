import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useStore } from '../store/useStore'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const estados = ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado']
const tipos = ['Reparación', 'Instalación', 'Mantenimiento', 'Configuración', 'Otro']

export const Servicios = () => {
  const { servicios, addServicio, updateServicio, deleteServicio } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ 
    cliente: '', 
    descripción: '', 
    tipo: 'Reparación', 
    costomaterial: '', 
    costomanoobra: '', 
    estado: 'Pendiente' 
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const costoMaterial = parseFloat(form.costomaterial || 0)
    const costoManoObra = parseFloat(form.costomanoobra || 0)
    const total = costoMaterial + costoManoObra
    
    if (editando) {
      updateServicio(editando.id, {
        ...form,
        costomaterial: costoMaterial,
        costomanoobra: costoManoObra,
        total
      })
    } else {
      addServicio({
        ...form,
        costomaterial: costoMaterial,
        costomanoobra: costoManoObra,
        total,
        fechainicio: new Date().toISOString()
      })
    }
    setIsOpen(false)
    setForm({ cliente: '', descripción: '', tipo: 'Reparación', costomaterial: '', costomanoobra: '', estado: 'Pendiente' })
    setEditando(null)
  }

  const cambiarEstado = (id, nuevoEstado) => {
    updateServicio(id, { estado: nuevoEstado })
  }

  const handleEdit = (s) => {
    setEditando(s)
    setForm(s)
    setIsOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar servicio?')) deleteServicio(id)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-100 text-green-700'
      case 'En Proceso': return 'bg-blue-100 text-blue-700'
      case 'Finalizado': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="inline mr-2" />Nuevo Servicio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold">{servicios.filter(s => s.estado === 'Pendiente').length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">En Proceso</p>
          <p className="text-2xl font-bold text-primary">{servicios.filter(s => s.estado === 'En Proceso').length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Finalizados</p>
          <p className="text-2xl font-bold text-warning">{servicios.filter(s => s.estado === 'Finalizado').length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-500">Entregados</p>
          <p className="text-2xl font-bold text-success">{servicios.filter(s => s.estado === 'Entregado').length}</p>
        </Card>
      </div>

      <Card>
        <Table headers={['Cliente', 'Tipo', 'Descripción', 'Material', 'Mano Obra', 'Total', 'Estado', 'Fecha', 'Acciones']}>
          {servicios.map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{s.cliente}</td>
              <td className="px-4 py-3">{s.tipo}</td>
              <td className="px-4 py-3 text-sm max-w-xs truncate">{s.descripción}</td>
              <td className="px-4 py-3">Gs {parseFloat(s.costomaterial || 0).toFixed(0)}</td>
              <td className="px-4 py-3">Gs {parseFloat(s.costomanoobra || 0).toFixed(0)}</td>
              <td className="px-4 py-3 font-medium">Gs {parseFloat(s.total || 0).toFixed(0)}</td>
              <td className="px-4 py-3">
                <select 
                  value={s.estado} 
                  onChange={e => cambiarEstado(s.id, e.target.value)} 
                  className={`text-xs px-2 py-1 rounded border ${getEstadoColor(s.estado)}`}
                >
                  {estados.map(e => <option key={e}>{e}</option>)}
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.fechainicio).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700 mr-2">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {servicios.length === 0 && <p className="text-center text-gray-500 py-4">No hay servicios registrados</p>}
      </Card>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setEditando(null) }} title={editando ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <form onSubmit={handleSubmit}>
          <Input label="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
            <select 
              value={form.tipo} 
              onChange={e => setForm({ ...form, tipo: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {tipos.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea 
              value={form.descripción} 
              onChange={e => setForm({ ...form, descripción: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              rows="3" 
            />
          </div>
          
          <Input label="Costo Material" type="number" step="0.01" value={form.costomaterial} onChange={e => setForm({ ...form, costomaterial: e.target.value })} />
          <Input label="Costo Mano de Obra" type="number" step="0.01" value={form.costomanoobra} onChange={e => setForm({ ...form, costomanoobra: e.target.value })} />
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              Total: <span className="font-medium">Gs {((parseFloat(form.costomaterial) || 0) + (parseFloat(form.costomanoobra) || 0)).toFixed(0)}</span>
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit">{editando ? 'Actualizar' : 'Crear Servicio'}</Button>
            <Button variant="outline" onClick={() => { setIsOpen(false); setEditando(null) }}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}