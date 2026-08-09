import { useState } from 'react'

// VALOR ESPECIAL PARA FILTRAR NIDOS SIN ESPECIE IDENTIFICADA
export const VALOR_SIN_ESPECIE = '__sin_identificar__'

// OPCIONES DE ESTADO PARA EL FILTRO DEL MAPA
const OPCIONES_ESTADO = [
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'inactivo', etiqueta: 'Inactivos' },
  { valor: 'destruido', etiqueta: 'Destruidos' },
  { valor: 'retirado', etiqueta: 'Retirados' },
]

// OPCIONES DE OCUPACIÓN PARA EL FILTRO DEL MAPA
const OPCIONES_OCUPACION = [
  { valor: 'ocupado', etiqueta: 'Ocupados' },
  { valor: 'desocupado', etiqueta: 'Desocupados' },
]

// OPCIONES DE PRESENCIA DE HUEVOS Y POLLUELOS
const OPCIONES_HUEVOS = [
  { valor: 'con', etiqueta: 'Con huevos' },
  { valor: 'sin', etiqueta: 'Sin huevos' },
]

const OPCIONES_POLLUELOS = [
  { valor: 'con', etiqueta: 'Con polluelos' },
  { valor: 'sin', etiqueta: 'Sin polluelos' },
]

// CUENTA LOS FILTROS ACTIVOS
function contarFiltros(filtros) {
  return Object.values(filtros).filter((v) => v).length
}

// CAMPO VERTICAL DEL PANEL DE FILTROS
function CampoFiltro({ etiqueta, valor, opciones, onChange }) {
  return (
    <div className="mapa-filtros-campo">
      <label>{etiqueta}</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
        ))}
      </select>
    </div>
  )
}

// FILTROS VISUALES DEL MAPA EN PANEL DESPLEGABLE
function MapFilters({ filtros, grupos, especies, onCambiar, onLimpiar, filtrosActivos }) {
  const [abierto, setAbierto] = useState(false)

  const cambiar = (campo, valor) => {
    onCambiar({ ...filtros, [campo]: valor })
  }

  return (
    <div className="mapa-filtros">
      <button
        className="mapa-filtros-boton"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        Filtros
        {filtrosActivos && (
          <span className="mapa-filtros-badge">{contarFiltros(filtros)}</span>
        )}
      </button>

      {abierto && (
        <div className="mapa-filtros-panel">
          <CampoFiltro
            etiqueta="Estado"
            valor={filtros.estado}
            opciones={OPCIONES_ESTADO}
            onChange={(v) => cambiar('estado', v)}
          />
          <CampoFiltro
            etiqueta="Grupo"
            valor={filtros.grupo}
            opciones={grupos.map((g) => ({ valor: g, etiqueta: g }))}
            onChange={(v) => cambiar('grupo', v)}
          />
          <CampoFiltro
            etiqueta="Especie"
            valor={filtros.especie}
            opciones={[
              { valor: VALOR_SIN_ESPECIE, etiqueta: 'Sin identificar' },
              ...especies.map((e) => ({ valor: e, etiqueta: e })),
            ]}
            onChange={(v) => cambiar('especie', v)}
          />
          <CampoFiltro
            etiqueta="Ocupación"
            valor={filtros.ocupacion}
            opciones={OPCIONES_OCUPACION}
            onChange={(v) => cambiar('ocupacion', v)}
          />
          <CampoFiltro
            etiqueta="Huevos"
            valor={filtros.huevos}
            opciones={OPCIONES_HUEVOS}
            onChange={(v) => cambiar('huevos', v)}
          />
          <CampoFiltro
            etiqueta="Polluelos"
            valor={filtros.polluelos}
            opciones={OPCIONES_POLLUELOS}
            onChange={(v) => cambiar('polluelos', v)}
          />
          <div className="mapa-filtros-acciones">
            <button className="mapa-filtros-limpiar" onClick={onLimpiar}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapFilters
