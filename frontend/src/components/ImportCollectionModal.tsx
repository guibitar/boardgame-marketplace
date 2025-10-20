import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { api } from '../services/api';

interface ImportCollectionModalProps {
  show: boolean;
  onHide: () => void;
  onImport: (username: string, source: 'bgg' | 'ludopedia') => Promise<void>;
  onSuccess: () => void;
}

export default function ImportCollectionModal({ show, onHide, onImport, onSuccess }: ImportCollectionModalProps) {
  const [username, setUsername] = useState('');
  const [source, setSource] = useState<'bgg' | 'ludopedia'>('bgg');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportBGG = async () => {
    if (!username.trim()) {
      setError('Por favor, insira um nome de usuário.');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      await onImport(username, 'bgg');
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao importar coleção');
    } finally {
      setImporting(false);
    }
  };

  const handleConnectLudopedia = async () => {
    setImporting(true);
    setError(null);

    try {
      const response = await api.get('/api/ludopedia/authorize');
      const url = response.data.authorize_url;
      
      // Abrir a URL de autorização em uma nova janela
      const authWindow = window.open(
        url,
        'Ludopedia Auth',
        'width=600,height=700,top=100,left=100'
      );

      if (authWindow) {
        // Verificar se a janela foi fechada (usuário autorizou)
        const checkAuthWindow = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkAuthWindow);
            // Fechar o modal e recarregar a coleção
            handleClose();
            onSuccess();
          }
        }, 1000);
      } else {
        setError('Não foi possível abrir a janela de autorização. Verifique se os pop-ups estão bloqueados.');
        setImporting(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao conectar com a Ludopedia');
      setImporting(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setSource('bgg');
    setError(null);
    setImporting(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Importar Coleção</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Plataforma</Form.Label>
          <Form.Select
            value={source}
            onChange={(e) => setSource(e.target.value as 'bgg' | 'ludopedia')}
          >
            <option value="bgg">BoardGameGeek</option>
            <option value="ludopedia">Ludopedia</option>
          </Form.Select>
        </Form.Group>

        {source === 'bgg' && (
          <Form.Group className="mb-3">
            <Form.Label>Nome de Usuário no BoardGameGeek</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite seu username no BGG"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
        )}

        {source === 'ludopedia' && (
          <Alert variant="info" className="mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Clique em "Conectar" para autorizar o acesso à sua conta da Ludopedia.
            Uma nova janela será aberta para você autorizar.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={importing}>
          Cancelar
        </Button>
        {source === 'ludopedia' ? (
          <Button
            variant="primary"
            onClick={handleConnectLudopedia}
            disabled={importing}
          >
            {importing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Conectando...
              </>
            ) : (
              <>
                <i className="bi bi-link-45deg me-2"></i>
                Conectar com Ludopedia
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleImportBGG}
            disabled={!username.trim() || importing}
          >
            {importing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Importando...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Importar Coleção
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
