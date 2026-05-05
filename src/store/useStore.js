import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      spreadsheetId: null,
      
      setAuth: (user, spreadsheetId) => set({ 
        isAuthenticated: true, 
        user, 
        spreadsheetId 
      }),
      logout: () => set({ 
        isAuthenticated: false, 
        user: null, 
        spreadsheetId: null 
      }),

      productos: [],
      ventas: [],
      servicios: [],
      cobros: [],
      gastos: [],
      loading: false,
      
      setLoading: (loading) => set({ loading }),
      
      setProductos: (productos) => set({ productos }),
      setVentas: (ventas) => set({ ventas }),
      setServicios: (servicios) => set({ servicios }),
      setCobros: (cobros) => set({ cobros }),
      setGastos: (gastos) => set({ gastos }),

      addProducto: (producto) => set(state => ({ 
        productos: [...state.productos, { ...producto, id: Date.now().toString() }] 
      })),
      
      updateProducto: (id, data) => set(state => ({
        productos: state.productos.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      
      deleteProducto: (id) => set(state => ({
        productos: state.productos.filter(p => p.id !== id)
      })),

      addVenta: (venta) => set(state => ({ 
        ventas: [...state.ventas, { ...venta, id: Date.now().toString() }] 
      })),

      updateVenta: (id, data) => set(state => ({
        ventas: state.ventas.map(v => v.id === id ? { ...v, ...data } : v)
      })),

      deleteVenta: (id) => set(state => ({
        ventas: state.ventas.filter(v => v.id !== id)
      })),

      addServicio: (servicio) => set(state => ({ 
        servicios: [...state.servicios, { ...servicio, id: Date.now().toString() }] 
      })),
      
      updateServicio: (id, data) => set(state => ({
        servicios: state.servicios.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      
      deleteServicio: (id) => set(state => ({
        servicios: state.servicios.filter(s => s.id !== id)
      })),

      addCobro: (cobro) => set(state => ({ 
        cobros: [...state.cobros, { ...cobro, id: Date.now().toString() }] 
      })),
      
      deleteCobro: (id) => set(state => ({
        cobros: state.cobros.filter(c => c.id !== id)
      })),

      addGasto: (gasto) => set(state => ({ 
        gastos: [...state.gastos, { ...gasto, id: Date.now().toString() }] 
      })),
      
      updateGasto: (id, data) => set(state => ({
        gastos: state.gastos.map(g => g.id === id ? { ...g, ...data } : g)
      })),
      
      deleteGasto: (id) => set(state => ({
        gastos: state.gastos.filter(g => g.id !== id)
      })),

      getStats: () => {
        const { ventas, cobros, gastos, productos, servicios } = get()
        const now = new Date()
        const mesActual = now.getMonth()
        const añoActual = now.getFullYear()

        const ingresosVentas = ventas
          .filter(v => new Date(v.fecha).getMonth() === mesActual && new Date(v.fecha).getFullYear() === añoActual)
          .reduce((sum, v) => sum + (parseFloat(v.ganancia) || 0), 0)
        
        const ingresosCobros = cobros
          .filter(c => new Date(c.fecha).getMonth() === mesActual && new Date(c.fecha).getFullYear() === añoActual)
          .reduce((sum, c) => sum + (parseFloat(c.monto) || 0), 0)

        const egresos = gastos
          .filter(g => new Date(g.fecha).getMonth() === mesActual && new Date(g.fecha).getFullYear() === añoActual)
          .reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)

        const totalServicios = servicios.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0)
        const serviciosCobrados = cobros.reduce((sum, c) => sum + (parseFloat(c.monto) || 0), 0)
        const serviciosPendientes = totalServicios - serviciosCobrados

        return {
          ingresos: ingresosVentas + ingresosCobros,
          egresos,
          gananciaNeta: (ingresosVentas + ingresosCobros) - egresos,
          totalProductos: productos.length,
          productosStockBajo: productos.filter(p => (parseInt(p.stock) || 0) < 5).length,
          serviciosEnProceso: servicios.filter(s => s.estado === 'En Proceso').length,
          totalServicios,
          serviciosPendientes,
        }
      }
    }),
    {
      name: 'big-informatica-storage',
    }
  )
)