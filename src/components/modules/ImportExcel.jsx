import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'

export const ImportExcel = ({ onImport, title = 'Importar desde Excel', dataType }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')
    setSuccess('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (data.length < 2) {
          setError('El archivo está vacío o no tiene datos')
          return
        }

        const headers = data[0]
        const rows = data.slice(1).filter(row => row.some(cell => cell !== '' && cell !== null))
        
        setPreview({ headers, rows: rows.slice(0, 5) })
      } catch (err) {
        setError('Error al leer el archivo: ' + err.message)
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleImport = () => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)

        if (data.length === 0) {
          setError('No se encontraron datos para importar')
          return
        }

        onImport(data)
        setSuccess(`¡Se importaron ${data.length} registros correctamente!`)
        setFile(null)
        setPreview([])
        
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      } catch (err) {
        setError('Error al importar: ' + err.message)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleCancel = () => {
    setFile(null)
    setPreview([])
    setError('')
    setSuccess('')
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <FileSpreadsheet className="mx-auto text-gray-400 mb-2" size={40} />
        <p className="text-sm text-gray-600 mb-2">
          {file ? file.name : 'Hacé clic para seleccionar un archivo Excel'}
        </p>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} className="inline mr-2" />
          Seleccionar Archivo
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-danger bg-red-50 p-3 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-success bg-green-50 p-3 rounded-lg">
          <CheckCircle size={18} />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {preview.headers && preview.headers.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Vista previa (primeras 5 filas):</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-2 py-1 text-left text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b">
                    {preview.headers.map((h, j) => (
                      <td key={j} className="px-2 py-1">{row[j] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleImport}>Importar datos</Button>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}