import { Card } from '../components/ui/Card'
import { useStore } from '../store/useStore'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, TrendingUp, Wrench, Download } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'
import * as XLSX from 'xlsx'

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899']

export const Dashboard = () => {
  const { getStats, ventas, cobros, servicios, gastos } = useStore()
  const stats = getStats()

  const gastoData = gastos.reduce((acc, g) => {
    const cat = g.categoría || 'Otro'
    acc[cat] = (acc[cat] || 0) + (parseFloat(g.monto) || 0)
    return acc
  }, {})

  const gastoPieData = Object.entries(gastoData).map(([name, value]) => ({ name, value }))

  const ultimosMovimientos = [
    ...ventas.slice(-3).map(v => ({ tipo: 'Venta', monto: v.total, fecha: v.fecha })),
    ...cobros.slice(-2).map(c => ({ tipo: 'Cobro', monto: c.monto, fecha: c.fecha })),
    ...gastos.slice(-2).map(g => ({ tipo: 'Gasto', monto: -g.monto, fecha: g.fecha })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

  const ventasTotal = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0)
  const ventasGanancia = ventas.reduce((sum, v) => sum + (parseFloat(v.ganancia) || 0), 0)
  const cobrosTotal = cobros.reduce((sum, c) => sum + (parseFloat(c.monto) || 0), 0)
  const serviciosTotal = servicios.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0)
  const gastosTotal = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)
  const ingresoBruto = ventasGanancia + cobrosTotal
  const totalIngresos = ventasTotal + cobrosTotal
  const balanceTotal = ingresoBruto - gastosTotal

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new()
    
    const datosResumen = [
      ['BIG INFORMÁTICA - Resumen Financiero'],
      [''],
      ['CONCEPTO', 'MONTO (Gs)'],
      ['Ventas (productos)', ventasTotal],
      ['  - Ganancia productos', ventasGanancia],
      ['Cobros (servicios)', cobrosTotal],
      [''],
      ['INGRESO NETO', ingresoBruto],
      ['Total Gastos', -gastosTotal],
      ['BALANCE TOTAL', balanceTotal],
    ]
    
    const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
    
    if (ventas.length > 0) {
      const datosVentas = [['Fecha', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Ganancia']]
      ventas.forEach(v => {
        datosVentas.push([
          v.fecha,
          v.producto || '',
          v.cantidad || '',
          v.precio || '',
          v.total || '',
          v.ganancia || ''
        ])
      })
      const wsVentas = XLSX.utils.aoa_to_sheet(datosVentas)
      XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas')
    }
    
    if (cobros.length > 0) {
      const datosCobros = [['Fecha', 'Cliente', 'Servicio', 'Monto']]
      cobros.forEach(c => {
        datosCobros.push([c.fecha, c.cliente || '', c.servicio || '', c.monto])
      })
      const wsCobros = XLSX.utils.aoa_to_sheet(datosCobros)
      XLSX.utils.book_append_sheet(wb, wsCobros, 'Cobros')
    }
    
    if (gastos.length > 0) {
      const datosGastos = [['Fecha', 'Descripción', 'Categoría', 'Monto']]
      gastos.forEach(g => {
        datosGastos.push([g.fecha, g.descripción || '', g.categoría || '', g.monto])
      })
      const wsGastos = XLSX.utils.aoa_to_sheet(datosGastos)
      XLSX.utils.book_append_sheet(wb, wsGastos, 'Gastos')
    }
    
    XLSX.writeFile(wb, `Big_Informatica_Resumen_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={exportarExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Exportar Excel
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="text-success" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Ingresos (Mes)</p>
            <p className="text-xl font-bold text-success">Gs {stats.ingresos.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><ArrowDownRight className="text-danger" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Egresos (Mes)</p>
            <p className="text-xl font-bold text-danger">Gs {stats.egresos.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><TrendingUp className="text-primary" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Ganancia Neta</p>
            <p className="text-xl font-bold text-primary">Gs {stats.gananciaNeta.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg"><Package className="text-purple-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Productos</p>
            <p className="text-xl font-bold">{stats.totalProductos}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-lg"><DollarSign className="text-teal-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Ingreso Neto</p>
            <p className="text-xl font-bold text-teal-600">Gs {ingresoBruto.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Ganancia productos + Cobros servicios</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Resumen General</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Ventas (productos)</span>
              <span className="font-medium text-gray-500">Gs {ventasTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b pl-4">
              <span className="text-xs text-gray-400">→ Ganancia productos</span>
              <span className="font-medium text-teal-600">Gs +{ventasGanancia.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cobros (servicios)</span>
              <span className="font-medium text-success">Gs {cobrosTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b bg-teal-50 px-2 -mx-2 rounded">
              <span className="font-medium text-teal-700">Ingreso Neto (Ganancia + Cobros)</span>
              <span className="font-bold text-teal-600">Gs {ingresoBruto.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Gastos</span>
              <span className="font-medium text-danger">Gs -{gastosTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 pt-4 border-t-2 border-gray-200">
              <span className="font-bold text-lg">Balance Total (con gastos)</span>
              <span className={`font-bold text-lg ${(ingresoBruto - gastosTotal) >= 0 ? 'text-success' : 'text-danger'}`}>
                Gs {(ingresoBruto - gastosTotal).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
          {gastoPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={gastoPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {gastoPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Gs ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay gastos registrados</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Últimos Movimientos</h3>
        {ultimosMovimientos.length > 0 ? (
          <div className="space-y-3">
            {ultimosMovimientos.map((m, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    m.tipo === 'Gasto' ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'
                  }`}>
                    {m.tipo}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(m.fecha).toLocaleDateString()}</span>
                </div>
                <span className={`font-medium ${m.monto < 0 ? 'text-danger' : 'text-success'}`}>
                  {m.monto < 0 ? 'Gs -' : 'Gs +'}{Math.abs(m.monto).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No hay movimientos registrados</p>
        )}
      </Card>
    </div>
  )
}