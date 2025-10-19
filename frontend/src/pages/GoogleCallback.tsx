import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAppDispatch } from '../hooks/useAuth';
import { fetchCurrentUser } from '../store/slices/authSlice';
import api from '../services/api';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Pega o token da URL (vem do backend)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          throw new Error('Token não encontrado');
        }

        // Salva o token
        localStorage.setItem('token', token);
        
        // Atualiza o header do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Busca os dados do usuário e atualiza o Redux
        await dispatch(fetchCurrentUser());
        
        // Redireciona para a home
        navigate('/');
      } catch (error) {
        console.error('Erro ao processar callback do Google:', error);
        navigate('/login', { state: { error: 'Erro ao fazer login com Google' } });
      }
    };

    handleCallback();
  }, [navigate, dispatch]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <h4>Processando login com Google...</h4>
        <p className="text-muted">Aguarde um momento</p>
      </Container>
    </div>
  );
}

