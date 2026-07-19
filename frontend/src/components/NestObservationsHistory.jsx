export default function NestObservationsHistory({ observaciones }) {
  if (!observaciones || observaciones.length === 0) {
    return <p className="panel-vacio">No hay observaciones registradas.</p>
  }

  return (
    <div className="panel-historico">
      {observaciones.map((obs) => (
        <div key={obs.id} className="panel-historico-item">
          <div className="panel-historico-cabecera">
            <span className="panel-historico-fecha">{obs.fecha_observacion}</span>
            {obs.especie_nombre && (
              <span className="panel-historico-especie">{obs.especie_nombre}</span>
            )}
          </div>
          <div className="panel-historico-datos">
            <span>Ocupado: {obs.ocupado ? 'Sí' : 'No'}</span>
            {obs.hay_huevos && <span>Huevos: {obs.cantidad_huevos}</span>}
            {obs.hay_polluelos && <span>Polluelos: {obs.cantidad_polluelos}</span>}
          </div>
          {obs.notas && (
            <p className="panel-historico-notas">{obs.notas}</p>
          )}
        </div>
      ))}
    </div>
  )
}
