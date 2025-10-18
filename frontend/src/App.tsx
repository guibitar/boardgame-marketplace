import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<div>Home - Em desenvolvimento</div>} />
        <Route path="/collections" element={<div>Coleções - Em desenvolvimento</div>} />
        <Route path="/sale-lists" element={<div>Listas de Vendas - Em desenvolvimento</div>} />
      </Routes>
    </div>
  )
}

export default App

