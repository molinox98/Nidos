import './App.css'

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nidos</h1>
        <p className="app-subtitle">
          Aplicación web para el seguimiento de nidos de aves del Cos de Banders d'Andorra.
        </p>
        <p className="app-status">Frontend React funcionando correctamente.</p>
        {apiBaseUrl && (
          <p className="app-api-info">API configurada en: {apiBaseUrl}</p>
        )}
      </header>
    </div>
  )
}

export default App