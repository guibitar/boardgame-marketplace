import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { api } from '../services/api';

interface Game {
  bgg_id: number;
  name: string;
  type?: string;
}

interface SearchGameModalProps {
  show: boolean;
  onHide: () => void;
  onSelect: (game: Game) => void;
}

export default function SearchGameModal({ show, onHide, onSelect }: SearchGameModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    setGames([]);

    try {
      const response = await api.get('/api/collection/search/bgg', {
        params: { query: searchQuery, limit: 20 }
      });
      setGames(response.data.games);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao buscar jogos');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectGame = (game: Game) => {
    onSelect(game);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setGames([]);
    setError(null);
    onHide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Buscar Jogo no BoardGameGeek</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Busca */}
        <div className="mb-4">
          <Form.Group>
            <Form.Label>Buscar jogos</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Digite o nome do jogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </Form.Group>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Resultados */}
        {games.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-3">
              {games.length} jogo(s) encontrado(s)
            </h6>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {games.map((game) => (
                <Card
                  key={game.bgg_id}
                  className="mb-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectGame(game)}
                >
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium">{game.name}</div>
                        <small className="text-muted">
                          ID: {game.bgg_id}
                        </small>
                      </div>
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        {!searching && games.length === 0 && searchQuery && (
          <div className="text-center py-4">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <p className="text-muted mt-2">Nenhum jogo encontrado</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

