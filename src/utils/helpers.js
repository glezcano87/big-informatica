export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Gs 0'
  const num = parseFloat(value)
  if (isNaN(num)) return 'Gs 0'
  return `Gs ${num.toLocaleString('es-PY')}`
}

export const parseCurrency = (value) => {
  if (!value) return 0
  const cleaned = value.toString().replace(/[Gs$\s.]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}