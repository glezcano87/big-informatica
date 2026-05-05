import { useState, useRef } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import * as XLSX from 'xlsx'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useStore } from '../store/useStore'
import { CheckCircle, AlertCircle, LogOut, Database, Upload, Download, Trash2 } from 'lucide-react'

const CLIENT_ID = '280593210205-mjfrmu30n2u7k3jafjhskk5jnlo0av3i.apps.googleusercontent.com'

const LoginButton = ({ onSuccess, onError }) => {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })

  return <Button onClick={login}>Iniciar sesión con Google</Button>
}

const dataTypes = [
  { key: 'productos', label: 'Productos', fields: ['nombre', 'categoría', 'costo', 'precioventa', 'stock'] },
  { key: 'ventas', label: 'Ventas', fields: ['productonombre', 'cantidad', 'preciounitario', 'total', 'costounitario', 'ganancia'] },
  { key: 'servicios', label: 'Servicios', fields: ['cliente', 'descripción', 'tipo', 'costomaterial', 'costomanoobra', 'total', 'estado'] },
  { key: 'cobros', label: 'Cobros', fields: ['cliente', 'monto', 'método', 'observaciones'] },
  { key: 'gastos', label: 'Gastos', fields: ['descripción', 'categoría', 'monto', 'proveedor', 'tipo'] },
]

export const ConfigContent = () => {
  const { 
    isAuthenticated, user, spreadsheetId, setAuth, logout,
    productos, ventas, servicios, cobros, gastos,
    setProductos, setVentas, setServicios, setCobros, setGastos
  } = useStore()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importingType, setImportingType] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return
    
    setLoading(true)
    setMessage('Configurando conexión...')

    try {
      const mockSpreadsheetId = 'big-informatica-' + Date.now()
      setAuth({ name: 'Usuario', email: 'user@gmail.com' }, mockSpreadsheetId)
      setMessage('¡Configuración completada!')
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    setMessage('')
  }

  const handleExport = (dataType) => {
    let data, filename, headers
    switch (dataType) {
      case 'productos':
        data = productos.map(p => ({ 
          Nombre: p.nombre, Categoría: p.categoría, Costo: p.costo, 
          'Precio Venta': p.precioventa, Stock: p.stock 
        }))
        headers = ['Nombre', 'Categoría', 'Costo', 'Precio Venta', 'Stock']
        break
      case 'ventas':
        data = ventas.map(v => ({
          Producto: v.productonombre, Cantidad: v.cantidad,
          'Precio Unitario': v.preciounitario, Total: v.total,
          Costo: v.costounitario, Ganancia: v.ganancia, Fecha: v.fecha
        }))
        break
      case 'servicios':
        data = servicios.map(s => ({
          Cliente: s.cliente, Descripción: s.descripción, Tipo: s.tipo,
          'Costo Material': s.costomaterial, 'Costo Mano Obra': s.costomanoobra,
          Total: s.total, Estado: s.estado, 'Fecha Inicio': s.fechainicio
        }))
        break
      case 'cobros':
        data = cobros.map(c => ({
          Cliente: c.cliente, Monto: c.monto, Método: c.método,
          Observaciones: c.observaciones, Fecha: c.fecha
        }))
        break
      case 'gastos':
        data = gastos.map(g => ({
          Descripción: g.descripción, Categoría: g.categoría,
          Monto: g.monto, Proveedor: g.proveedor, Tipo: g.tipo, Fecha: g.fecha
        }))
        break
      default:
        return
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, dataType)
    XLSX.writeFile(wb, `big-informatica-${dataType}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const openImportModal = (type) => {
    setImportingType(type)
    setImportModalOpen(true)
    setImportFile(null)
    setImportPreview(null)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImportFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (data.length < 2) {
          alert('El archivo está vacío')
          return
        }

        const headers = data[0]
        setImportPreview({ headers, rows: data.slice(1, 6) })
      } catch (err) {
        alert('Error al leer archivo: ' + err.message)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = () => {
    if (!importFile || !importingType) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)

        const dataWithIds = data.map((item, index) => ({
          ...item,
          id: (Date.now() + index).toString(),
          fecha: new Date().toISOString()
        }))

        switch (importingType) {
          case 'productos':
            setProductos([...productos, ...dataWithIds])
            break
          case 'ventas':
            setVentas([...ventas, ...dataWithIds])
            break
          case 'servicios':
            setServicios([...servicios, ...dataWithIds])
            break
          case 'cobros':
            setCobros([...cobros, ...dataWithIds])
            break
          case 'gastos':
            setGastos([...gastos, ...dataWithIds])
            break
        }

        alert(`¡Se importaron ${data.length} registros exitosamente!`)
        setImportModalOpen(false)
        setImportFile(null)
        setImportPreview(null)
      } catch (err) {
        alert('Error al importar: ' + err.message)
      }
    }
    reader.readAsBinaryString(importFile)
  }

  const handleClearData = (type) => {
    if (!confirm(`¿Estás seguro de eliminar todos los ${type}? Esta acción no se puede deshacer.`)) return
    
    switch (type) {
      case 'productos': setProductos([]); break
      case 'ventas': setVentas([]); break
      case 'servicios': setServicios([]); break
      case 'cobros': setCobros([]); break
      case 'gastos': setGastos([]); break
    }
  }

  const getDataCount = (type) => {
    switch (type) {
      case 'productos': return productos.length
      case 'ventas': return ventas.length
      case 'servicios': return servicios.length
      case 'cobros': return cobros.length
      case 'gastos': return gastos.length
      default: return 0
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Conexión Google Sheets</h2>
            <p className="text-sm text-gray-500">Sincroniza tus datos en la nube</p>
          </div>
        </div>
        
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span>Conectado correctamente</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="text-sm text-gray-600"><span className="font-medium">Usuario:</span> {user?.name}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Spreadsheet ID:</span> {spreadsheetId}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={16} />
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Conectá tu cuenta de Google para sincronizar los datos con Google Sheets.</p>
            <LoginButton onSuccess={handleCredentialResponse} onError={(err) => setMessage('Error: ' + err.message)} />
            {loading && <p className="text-blue-600 animate-pulse">{message}</p>}
            {message && !loading && (
              <div className="flex items-center gap-2 text-sm">
                {message.includes('Error') ? (
                  <AlertCircle className="text-danger" size={16} />
                ) : (
                  <CheckCircle className="text-success" size={16} />
                )}
                <span className={message.includes('Error') ? 'text-danger' : 'text-success'}>{message}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Gestión de Datos</h2>
        <p className="text-sm text-gray-600 mb-4">
          Importa datos desde Excel o exporta tus datos existentes. Los datos se almacenan localmente en tu navegador.
        </p>
        
        <div className="space-y-3">
          {dataTypes.map(dt => (
            <div key={dt.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{dt.label}</span>
                <span className="text-sm text-gray-500 ml-2">({getDataCount(dt.key)} registros)</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openImportModal(dt.key)} className="text-sm py-1">
                  <Upload size={14} className="inline mr-1" />
                  Importar
                </Button>
                <Button variant="outline" onClick={() => handleExport(dt.key)} className="text-sm py-1" disabled={getDataCount(dt.key) === 0}>
                  <Download size={14} className="inline mr-1" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={() => handleClearData(dt.key)} className="text-sm py-1 text-danger" disabled={getDataCount(dt.key) === 0}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Acerca de BIG INFORMATICA</h2>
        <div className="space-y-2">
          <p className="text-gray-600">Sistema de gestión financiera para tu negocio de informática.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Versión 1.0.0</span>
            <span>•</span>
            <span>Datos guardados localmente</span>
          </div>
        </div>
      </Card>

      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title={`Importar ${dataTypes.find(d => d.key === importingType)?.label || ''}`}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600 mb-2">
              {importFile ? importFile.name : 'Seleccioná un archivo Excel'}
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Seleccionar Archivo
            </Button>
          </div>

          {importPreview && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Vista previa:</p>
              <div className="overflow-x-auto text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {importPreview.headers.map((h, i) => (
                        <th key={i} className="px-2 py-1 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.map((row, i) => (
                      <tr key={i} className="border-b">
                        {importPreview.headers.map((h, j) => (
                          <td key={j} className="px-2 py-1">{row[j] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={!importFile}>Importar</Button>
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export const Config = () => {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <ConfigContent />
    </GoogleOAuthProvider>
  )
}