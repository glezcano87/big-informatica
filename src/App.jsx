import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Productos } from './pages/Productos'
import { Ventas } from './pages/Ventas'
import { Servicios } from './pages/Servicios'
import { Cobros } from './pages/Cobros'
import { Gastos } from './pages/Gastos'
import { Config } from './pages/Config'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="cobros" element={<Cobros />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App