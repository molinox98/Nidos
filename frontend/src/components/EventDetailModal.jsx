import { formatoFechaHora, textoTipoEvento, textoEstado } from '../utils/date'

// DETALLE COMPLETO DE UN EVENTO EN MODAL
export default function EventDetailModal({ evento, onCerrar, onEditar }) {
  return (
    <div className="detalle-modal-overlay" onClick={onCerrar}>
      <div className="detalle-modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="detalle-modal-cabecera">
          <h3 className="detalle-modal-titulo">Detalle de evento</h3>
          <button className="detalle-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className="detalle-modal-cuerpo">
          <table className="panel-tabla">
            <tbody>
              <tr>
                <td className="panel-tabla-label">Fecha</td>
                <td>{formatoFechaHora(evento.fecha_evento)}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Tipo</td>
                <td>{textoTipoEvento(evento.tipo_evento)}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Usuario</td>
                <td>{evento.usuario_nombre || 'Usuario no disponible'}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Estado anterior</td>
                <td>{evento.estado_anterior ? textoEstado(evento.estado_anterior) : 'Sin registrar'}</td>
              </tr>
              <tr>
                <td className="panel-tabla-label">Estado nuevo</td>
                <td>{evento.estado_nuevo ? textoEstado(evento.estado_nuevo) : 'Sin registrar'}</td>
              </tr>
              {evento.descripcion && (
                <tr>
                  <td className="panel-tabla-label">Descripción</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{evento.descripcion}</td>
                </tr>
              )}
              <tr>
                <td className="panel-tabla-label">Nido</td>
                <td>Nido #{evento.nido}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="detalle-modal-acciones">
          {onEditar && (
            <button className="detalle-modal-boton-editar" onClick={() => onEditar(evento)}>Editar evento</button>
          )}
          <button className="form-boton-cancelar" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
