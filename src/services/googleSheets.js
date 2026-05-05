import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export const createSpreadsheet = async (authClient) => {
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'BIG INFORMATICA - Datos' },
      sheets: [
        { properties: { title: 'Productos' } },
        { properties: { title: 'Ventas' } },
        { properties: { title: 'Servicios' } },
        { properties: { title: 'Cobros' } },
        { properties: { title: 'Gastos' } },
      ]
    }
  })

  const headers = {
    Productos: [['ID', 'Nombre', 'Categoría', 'Costo', 'PrecioVenta', 'Stock', 'Fecha']],
    Ventas: [['ID', 'ProductoID', 'ProductoNombre', 'Cantidad', 'PrecioUnitario', 'Total', 'CostoUnitario', 'Ganancia', 'Fecha']],
    Servicios: [['ID', 'Cliente', 'Descripción', 'Tipo', 'CostoMaterial', 'CostoManoObra', 'Total', 'Estado', 'FechaInicio', 'FechaFin']],
    Cobros: [['ID', 'ServicioID', 'Cliente', 'Monto', 'Método', 'Fecha', 'Observaciones']],
    Gastos: [['ID', 'Descripción', 'Categoría', 'Monto', 'Fecha', 'Proveedor', 'Tipo']],
  }

  for (const [sheetName, headerData] of Object.entries(headers)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheet.data.spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: headerData }
    })
  }

  return spreadsheet.data.spreadsheetId
}

export const readSheet = async (authClient, spreadsheetId, sheetName) => {
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`
  })

  const rows = response.data.values || []
  if (rows.length <= 1) return []

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ''))
  return rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] || ''
    })
    return obj
  })
}

export const appendRow = async (authClient, spreadsheetId, sheetName, values) => {
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] }
  })
}

export const updateSheet = async (authClient, spreadsheetId, sheetName, rowIndex, values) => {
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] }
  })
}

export const deleteRow = async (authClient, spreadsheetId, sheetName, rowIndex) => {
  const sheets = google.sheets({ version: 'v4', auth: authClient })
  
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName)
  const sheetId = sheet.properties.sheetId

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex
          }
        }
      }]
    }
  })
}