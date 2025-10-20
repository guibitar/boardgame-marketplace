import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import { api } from '../services/api';

interface Game {
  bgg_id: number;
  name: string;
  type?: string;
}

interface ImportGamesModalProps {
  show: boolean;
  onHide: () => void;
  onImport: (gameIds: number[]) => Promise<void>;
}

export default function ImportGamesModal({ show, onHide, onImport }: ImportGamesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    setGames([]);
    setSelectedGames(new Set());

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

  const handleToggleGame = (bggId: number) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(bggId)) {
      newSelected.delete(bggId);
    } else {
      newSelected.add(bggId);
    }
    setSelectedGames(newSelected);
  };

  const handleImport = async () => {
    if (selectedGames.size === 0) return;

    setImporting(true);
    setError(null);

    try {
      await onImport(Array.from(selectedGames));
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao importar jogos');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setGames([]);
    setSelectedGames(new Set());
    setError(null);
    onHide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Importar Jogos do BoardGameGeek</Modal.Title>
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                {games.length} jogo(s) encontrado(s)
              </h6>
              <div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedGames(new Set(games.map(g => g.bgg_id)))}
                  className="p-0 me-2"
                >
                  Selecionar Todos
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedGames(new Set())}
                  className="p-0"
                >
                  Desmarcar Todos
                </Button>
              </div>
            </div>

            <Row className="g-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {games.map((game) => (
                <Col md={6} key={game.bgg_id}>
                  <Card
                    className={selectedGames.has(game.bgg_id) ? 'border-primary' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleToggleGame(game.bgg_id)}
                  >
                    <Card.Body className="py-2">
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={selectedGames.has(game.bgg_id)}
                          onChange={() => handleToggleGame(game.bgg_id)}
                          className="me-2"
                        />
                        <div className="flex-grow-1">
                          <div className="fw-medium">{game.name}</div>
                          <small className="text-muted">
                            ID: {game.bgg_id}
                          </small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
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
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            {selectedGames.size > 0 && (
              <Badge bg="primary">
                {selectedGames.size} jogo(s) selecionado(s)
              </Badge>
            )}
          </div>
          <div>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={handleImport}
              disabled={selectedGames.size === 0 || importing}
              className="ms-2"
            >
              {importing ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Importando...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Importar {selectedGames.size > 0 && `(${selectedGames.size})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

