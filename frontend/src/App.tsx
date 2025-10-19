import { Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import GoogleCallback from './pages/GoogleCallback'

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/collections" element={<div>Coleções - Em desenvolvimento</div>} />
        <Route path="/sale-lists" element={<div>Listas de Vendas - Em desenvolvimento</div>} />
      </Routes>
    </Provider>
  )
}

export default App

