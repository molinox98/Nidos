import { formatoFechaHora, textoTipoEvento, textoEstado } from '../utils/date'

// LISTA CRONOLÓGICA DE EVENTOS DEL NIDO
export default function NestEventsHistory({ eventos, onVerDetalle, onEditar }) {
  if (!eventos || eventos.length === 0) {
    return <p className="panel-vacio">No hay eventos registrados.</p>
  }

  return (
    <div className="panel-historico">
      {eventos.map((ev) => (
        <div key={ev.id} className="panel-historico-item">
          <div className="panel-historico-cabecera">
            <span className="panel-historico-fecha">{formatoFechaHora(ev.fecha_evento)}</span>
            <span className="panel-historico-tipo">{textoTipoEvento(ev.tipo_evento)}</span>
          </div>
          {(ev.estado_anterior || ev.estado_nuevo) && (
            <div className="panel-historico-datos">
              {ev.estado_anterior && <span>De: {textoEstado(ev.estado_anterior)}</span>}
              {ev.estado_nuevo && <span>A: {textoEstado(ev.estado_nuevo)}</span>}
            </div>
          )}
          {ev.descripcion && (
            <p className="panel-historico-notas">{ev.descripcion}</p>
          )}
          <span className="panel-historico-usuario">
            {ev.usuario_nombre || 'Usuario no disponible'}
          </span>
          <div className="panel-historico-acciones-fila">
            {onVerDetalle && (
              <button className="panel-historico-boton-detalle" onClick={() => onVerDetalle(ev)}>
                Ver detalle
              </button>
            )}
            {onEditar && (
              <button className="panel-historico-boton-editar" onClick={() => onEditar(ev)}>
                Editar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
