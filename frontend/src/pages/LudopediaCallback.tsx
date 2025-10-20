import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { fetchCollection } from '../store/slices/collectionSlice';
import { AppDispatch } from '../store';

export default function LudopediaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autorização...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(`Erro na autorização: ${errorParam}`);
      setTimeout(() => {
        navigate('/collection');
      }, 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('Código de autorização não encontrado');
      setTimeout(() => {
        navigate('/collection');
      }, 3000);
      return;
    }

    // Processar o código
    handleCallback(code);
  }, [searchParams, navigate, dispatch]);

  const handleCallback = async (code: string) => {
    try {
      setMessage('Obtendo token de acesso...');
      
      // Trocar code por access_token
      const tokenResponse = await api.post('/api/ludopedia/callback', { code });
      const accessToken = tokenResponse.data.access_token;

      setMessage('Sincronizando sua coleção...');

      // Sincronizar coleção (o token será salvo no backend)
      const syncResponse = await api.post('/api/ludopedia/sync-collection', null, {
        params: { access_token: accessToken }
      });

      setStatus('success');
      setMessage(
        `Sincronização concluída! +${syncResponse.data.added} adicionados, ~${syncResponse.data.updated} atualizados, -${syncResponse.data.removed} removidos. Redirecionando...`
      );

      // Recarregar coleção
      await dispatch(fetchCollection());

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/collection');
      }, 2000);

    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.detail || 'Erro ao importar coleção');
      
      setTimeout(() => {
        navigate('/collection');
      }, 5000);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
            <h4 className="mt-3">{message}</h4>
          </>
        )}

        {status === 'success' && (
          <>
            <i className="bi bi-check-circle" style={{ fontSize: '4rem', color: '#28a745' }}></i>
            <h4 className="mt-3 text-success">{message}</h4>
          </>
        )}

        {status === 'error' && (
          <>
            <i className="bi bi-x-circle" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
            <h4 className="mt-3 text-danger">Erro ao importar coleção</h4>
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
            <p className="text-muted mt-3">Você será redirecionado automaticamente...</p>
          </>
        )}
      </div>
    </Container>
  );
}

