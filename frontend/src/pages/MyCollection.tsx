import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner, Badge, ButtonGroup } from 'react-bootstrap';
import { AppDispatch, RootState } from '../store';
import { 
  fetchCollection, 
  addGame, 
  updateGame, 
  removeGame,
  clearCollection,
  clearError 
} from '../store/slices/collectionSlice';
import { GameCreate } from '../types/game';
import Header from '../components/Header';
import ImportGamesModal from '../components/ImportGamesModal';
import ImportCollectionModal from '../components/ImportCollectionModal';
import SearchGameModal from '../components/SearchGameModal';
import { api } from '../services/api';

const MyCollection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { collection, loading, error } = useSelector((state: RootState) => state.collection);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportCollectionModal, setShowImportCollectionModal] = useState(false);
  const [showSearchGameModal, setShowSearchGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<number | null>(null);
  const [formData, setFormData] = useState<GameCreate>({ 
    name: '', 
    description: '',
    is_for_trade: false,
    is_for_sale: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [gameTypeFilter, setGameTypeFilter] = useState<'all' | 'BASE' | 'EXPANSION'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [syncing, setSyncing] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'year_published' | 'purchase_price' | 'rating' | 'weight' | 'ranking_position'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  useEffect(() => {
    console.log('Fetching collection with params:', { sortBy, sortOrder });
    dispatch(fetchCollection({ sortBy, sortOrder }));
  }, [dispatch, sortBy, sortOrder]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenModal = (gameId?: number) => {
    if (gameId) {
      const game = collection?.games.find(g => g.id === gameId);
      if (game) {
        setEditingGame(gameId);
        setFormData({
          name: game.name,
          description: game.description || '',
          year_published: game.year_published,
          game_type: game.game_type,
          base_game_id: game.base_game_id,
          min_players: game.min_players,
          max_players: game.max_players,
          min_playtime: game.min_playtime,
          max_playtime: game.max_playtime,
          min_age: game.min_age,
          rating: game.rating,
          weight: game.weight,
          is_for_trade: game.is_for_trade,
          is_for_sale: game.is_for_sale,
          condition: game.condition,
          price: game.price,
          purchase_price: game.purchase_price,
          notes: game.notes,
          image_url: game.image_url,
        });
      }
    } else {
      setEditingGame(null);
      setFormData({ 
        name: '', 
        description: '',
        game_type: 'BASE',
        is_for_trade: false,
        is_for_sale: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGame(null);
    setFormData({ 
      name: '', 
      description: '',
      game_type: 'BASE',
      is_for_trade: false,
      is_for_sale: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGame) {
      await dispatch(updateGame({ id: editingGame, data: formData }));
    } else {
      await dispatch(addGame(formData));
    }
    
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    await dispatch(removeGame(id));
    setDeleteConfirm(null);
  };

  const handleImportGames = async (gameIds: number[]) => {
    const response = await api.post('/api/collection/import/bgg', { game_ids: gameIds });
    // Recarregar a coleção após importar
    await dispatch(fetchCollection());
    return response.data;
  };

  const handleImportCollection = async (username: string, source: 'bgg' | 'ludopedia') => {
    const endpoint = source === 'bgg' ? '/api/collection/import-collection/bgg' : '/api/collection/import-collection/ludopedia';
    const response = await api.post(endpoint, null, { params: { username } });
    // Recarregar a coleção após importar
    await dispatch(fetchCollection());
    return response.data;
  };

  const handleSearchGame = async (game: { bgg_id: number; name: string }) => {
    // Buscar detalhes do jogo no BGG
    const response = await api.get(`/api/collection/game-details/bgg/${game.bgg_id}`);
    const gameDetails = response.data;
    
    // Preencher o formulário com os dados do BGG
    setFormData({
      name: gameDetails.name,
      description: gameDetails.description || '',
      year_published: gameDetails.year_published,
      game_type: 'BASE' as const,
      bgg_id: gameDetails.bgg_id,
      min_players: gameDetails.min_players,
      max_players: gameDetails.max_players,
      min_playtime: gameDetails.min_playtime,
      max_playtime: gameDetails.max_playtime,
      min_age: gameDetails.min_age,
      rating: gameDetails.rating,
      weight: gameDetails.weight,
      image_url: gameDetails.image_url,
      is_for_trade: false,
      is_for_sale: false,
    });
    
    // Abrir o modal de adicionar jogo
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredGames = collection?.games?.filter(game => {
    if (gameTypeFilter === 'all') return true;
    return game.game_type === gameTypeFilter;
  }) || [];

  console.log('MyCollection: filteredGames count:', filteredGames.length);
  console.log('MyCollection: collection.games count:', collection?.games?.length);

  const handleSyncCollection = async () => {
    setSyncing(true);
    setSyncProgress({ current: 0, total: 393, message: 'Iniciando sincronização...' });
    
    try {
      // Tentar sincronizar sem autorização (usando token salvo)
      try {
        setSyncProgress({ current: 0, total: 393, message: 'Buscando dados da Ludopedia...' });
        
        // Simular progresso enquanto sincroniza
        const progressInterval = setInterval(() => {
          setSyncProgress(prev => {
            if (!prev) return null;
            const newCurrent = Math.min(prev.current + 5, prev.total - 10);
            return { ...prev, current: newCurrent, message: `Sincronizando jogos... ${newCurrent} de ${prev.total}` };
          });
        }, 2000); // Atualizar a cada 2 segundos
        
        const response = await api.post('/api/ludopedia/sync-collection');
        
        clearInterval(progressInterval);
        setSyncProgress({ current: 393, total: 393, message: 'Sincronização concluída!' });
        
        // Aguardar 1 segundo antes de fechar o modal
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSyncing(false);
        setSyncProgress(null);
        
        // Mostrar mensagem de sucesso
        alert(`Sincronização concluída!\n+${response.data.added} adicionados\n~${response.data.updated} atualizados\n-${response.data.removed} removidos`);
        
        dispatch(fetchCollection({ sortBy, sortOrder }));
      } catch (err: any) {
        setSyncProgress(null);
        
        // Se falhar (token expirado ou não autorizado), pedir autorização
        if (err.response?.status === 401) {
          // Abre a janela de autorização da Ludopedia
          const response = await api.get('/api/ludopedia/authorize');
          const url = response.data.authorize_url;
          
          const authWindow = window.open(
            url,
            'Ludopedia Auth',
            'width=600,height=700,top=100,left=100'
          );

          if (authWindow) {
            const checkAuthWindow = setInterval(() => {
              if (authWindow.closed) {
                clearInterval(checkAuthWindow);
                setSyncing(false);
                // Recarregar a coleção após o fechamento da janela
                dispatch(fetchCollection({ sortBy, sortOrder }));
              }
            }, 1000);
          } else {
            setSyncing(false);
          }
        } else {
          setSyncing(false);
          alert(`Erro ao sincronizar: ${err.response?.data?.detail || err.message}`);
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Erro ao sincronizar coleção:', err);
      setSyncing(false);
      setSyncProgress(null);
      alert(`Erro ao sincronizar: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleClearCollection = async () => {
    await dispatch(clearCollection());
    setShowClearConfirm(false);
  };

  if (loading && !collection) {
    return (
      <>
        <Header />
        <Container className="mt-5">
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <h1 className="mb-1">Minha Coleção</h1>
                <p className="text-muted mb-0">
                  {filteredGames.length} de {collection?.total_games || 0} jogos
                </p>
              </div>
              
              {/* Filtros e Ordenação */}
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ minWidth: '140px' }}
                  size="sm"
                >
                  <option value="order">Ordem Original</option>
                  <option value="name">Nome</option>
                  <option value="year_published">Ano</option>
                  <option value="purchase_price">Preço</option>
                  <option value="rating">Avaliação</option>
                  <option value="weight">Complexidade</option>
                  <option value="ranking_position">Ranking</option>
                </Form.Select>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Crescente (clique para decrescente)' : 'Decrescente (clique para crescente)'}
                >
                  <i className={sortOrder === 'asc' ? 'bi bi-sort-alpha-down' : 'bi bi-sort-alpha-down-alt'}></i>
                </Button>
                <Form.Select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value as 'all' | 'BASE' | 'EXPANSION')}
                  style={{ minWidth: '140px' }}
                  size="sm"
                >
                  <option value="all">Todos</option>
                  <option value="BASE">Apenas Base</option>
                  <option value="EXPANSION">Apenas Expansões</option>
                </Form.Select>
                <ButtonGroup size="sm">
                  <Button
                    variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('cards')}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="bi bi-list-ul"></i>
                  </Button>
                </ButtonGroup>
              </div>
              
              {/* Botões de Ação */}
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="warning" 
                  onClick={handleSyncCollection}
                  disabled={syncing}
                  size="sm"
                >
                  <i className={syncing ? "bi bi-arrow-clockwise spin" : "bi bi-arrow-clockwise"}></i>
                  {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
                <Button 
                  variant="info" 
                  onClick={() => setShowImportCollectionModal(true)}
                  size="sm"
                >
                  <i className="bi bi-download"></i>
                  Importar
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => {
                    setShowSearchGameModal(true);
                  }}
                  size="sm"
                >
                  <i className="bi bi-plus-circle"></i>
                  Adicionar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => setShowClearConfirm(true)}
                  size="sm"
                >
                  <i className="bi bi-trash"></i>
                  Limpar Coleção
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Games Grid */}
        {!collection || collection.total_games === 0 ? (
          <Row>
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  <h4 className="mt-3">Sua coleção está vazia</h4>
                  <p className="text-muted">
                    Comece adicionando seus primeiros jogos de tabuleiro
                  </p>
                  <Button variant="success" onClick={() => handleOpenModal()}>
                    Adicionar Primeiro Jogo
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : viewMode === 'list' ? (
          // Visualização em Lista
          <div className="list-view">
            {filteredGames.map((game) => (
              <Card key={game.id} className="mb-3">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="auto" className="pe-0">
                      {game.image_url ? (
                        <img 
                          src={game.image_url} 
                          alt={game.name}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', backgroundColor: '#f8f9fa', padding: '5px' }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80?text=Sem+Imagem';
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          backgroundColor: '#f8f9fa', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <i className="bi bi-image" style={{ fontSize: '2rem', color: '#dee2e6' }}></i>
                        </div>
                      )}
                    </Col>
                    <Col>
                      <div 
                        style={{ 
                          borderBottom: game.game_type === 'EXPANSION' ? '2px solid #6c757d' : '2px solid #0d6efd',
                          paddingBottom: '4px',
                          marginBottom: '8px'
                        }}
                      >
                        <h5 className="mb-1" style={{ fontSize: '1rem' }}>
                          {game.name}{game.year_published && game.year_published > 0 && ` (${game.year_published})`}
                        </h5>
                        {game.game_type === 'EXPANSION' && game.base_game_name && (
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Expansão de: {game.base_game_name}
                          </small>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {game.min_players && game.max_players && (
                          <Badge bg="info" style={{ fontSize: '0.7rem' }}>
                            👥 {game.min_players}-{game.max_players}
                          </Badge>
                        )}
                        {game.min_playtime && game.max_playtime && (
                          <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                            ⏱️ {game.min_playtime}-{game.max_playtime}min
                          </Badge>
                        )}
                        {game.rating && (
                          <Badge bg="warning" style={{ fontSize: '0.7rem' }}>
                            ⭐ {game.rating.toFixed(1)}
                          </Badge>
                        )}
                        {game.weight && (
                          <Badge bg="dark" style={{ fontSize: '0.7rem' }}>
                            ⚖️ {game.weight.toFixed(1)}
                          </Badge>
                        )}
                        {game.purchase_price && (
                          <Badge bg="success" style={{ fontSize: '0.7rem' }}>
                            💰 R$ {game.purchase_price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenModal(game.id)}
                          title="Editar jogo"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(game.id)}
                          title="Remover da coleção"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          // Visualização em Cards
          <Row>
            {filteredGames.map((game) => (
              <Col key={game.id} md={6} lg={3} xl={2} className="mb-3">
                <Card className="h-100 shadow-sm" style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative' }}>
                    {game.image_url ? (
                      <Card.Img 
                        variant="top" 
                        src={game.image_url} 
                        style={{ height: '140px', objectFit: 'contain', width: '100%', backgroundColor: '#f8f9fa', padding: '8px' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
                        }}
                      />
                    ) : (
                      <div style={{ 
                        height: '140px', 
                        backgroundColor: '#f8f9fa', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <i className="bi bi-image" style={{ fontSize: '2rem', color: '#dee2e6' }}></i>
                      </div>
                    )}
                  </div>
                  
                  <Card.Body className="d-flex flex-column p-2">
                    <div className="mb-1">
                      <Card.Title 
                        className="mb-0" 
                        style={{ 
                          fontSize: '0.9rem',
                          borderBottom: game.game_type === 'EXPANSION' ? '2px solid #6c757d' : '2px solid #0d6efd',
                          paddingBottom: '2px',
                          lineHeight: '1.2'
                        }}
                      >
                        {game.name}{game.year_published && game.year_published > 0 && ` (${game.year_published})`}
                      </Card.Title>
                      {game.game_type === 'EXPANSION' && game.base_game_name && (
                        <small className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                          Expansão de: {game.base_game_name}
                        </small>
                      )}
                    </div>

                    <div className="mb-2">
                      {game.min_players && game.max_players && (
                        <Badge bg="info" className="me-1 mb-1" style={{ fontSize: '0.65rem' }}>
                          👥 {game.min_players}-{game.max_players}
                        </Badge>
                      )}
                      {game.min_playtime && game.max_playtime && (
                        <Badge bg="secondary" className="me-1 mb-1" style={{ fontSize: '0.65rem' }}>
                          ⏱️ {game.min_playtime}-{game.max_playtime}min
                        </Badge>
                      )}
                      {game.rating && (
                        <Badge bg="warning" className="me-1 mb-1" style={{ fontSize: '0.65rem' }}>
                          ⭐ {game.rating.toFixed(1)}
                        </Badge>
                      )}
                      {game.weight && (
                        <Badge bg="dark" className="me-1 mb-1" style={{ fontSize: '0.65rem' }}>
                          ⚖️ {game.weight.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    {game.purchase_price && (
                      <div className="mb-2 text-center">
                        <Badge bg="success" style={{ fontSize: '0.7rem' }}>
                          💰 R$ {game.purchase_price.toFixed(2)}
                        </Badge>
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleOpenModal(game.id)}
                          title="Editar jogo"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(game.id)}
                          title="Remover da coleção"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Add/Edit Game Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingGame ? 'Editar Jogo' : 'Adicionar Jogo à Coleção'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="game-name">Nome do Jogo *</Form.Label>
                    <Form.Control
                      id="game-name"
                      name="name"
                      type="text"
                      placeholder="Ex: Catan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ano</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ex: 2018"
                      min="1900"
                      max="2100"
                      value={formData.year_published || ''}
                      onChange={(e) => setFormData({ ...formData, year_published: parseInt(e.target.value) || undefined })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Imagem (URL)</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Descrição do jogo (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Jogo</Form.Label>
                    <Form.Select
                      value={formData.game_type || 'BASE'}
                      onChange={(e) => setFormData({ ...formData, game_type: e.target.value as 'BASE' | 'EXPANSION' })}
                    >
                      <option value="BASE">Jogo Base</option>
                      <option value="EXPANSION">Expansão</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {formData.game_type === 'EXPANSION' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Jogo Base</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Digite o nome do jogo base"
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Funcionalidade em desenvolvimento
                      </Form.Text>
                    </Form.Group>
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Jogadores</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        placeholder="Mín"
                        min="1"
                        value={formData.min_players || ''}
                        onChange={(e) => setFormData({ ...formData, min_players: parseInt(e.target.value) || undefined })}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Máx"
                        min="1"
                        value={formData.max_players || ''}
                        onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || undefined })}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tempo de Jogo (min)</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        placeholder="Mín"
                        min="1"
                        value={formData.min_playtime || ''}
                        onChange={(e) => setFormData({ ...formData, min_playtime: parseInt(e.target.value) || undefined })}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Máx"
                        min="1"
                        value={formData.max_playtime || ''}
                        onChange={(e) => setFormData({ ...formData, max_playtime: parseInt(e.target.value) || undefined })}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Idade Mínima</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ex: 10"
                      min="0"
                      value={formData.min_age || ''}
                      onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) || undefined })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Avaliação</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      placeholder="0-10"
                      min="0"
                      max="10"
                      value={formData.rating || ''}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || undefined })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Complexidade</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      placeholder="0-5"
                      min="0"
                      max="5"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Disponível para troca"
                    checked={formData.is_for_trade}
                    onChange={(e) => setFormData({ ...formData, is_for_trade: e.target.checked })}
                    className="mb-3"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Disponível para venda"
                    checked={formData.is_for_sale}
                    onChange={(e) => setFormData({ ...formData, is_for_sale: e.target.checked })}
                    className="mb-3"
                  />
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Valor Pago (R$)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      value={formData.purchase_price || ''}
                      onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || undefined })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {formData.is_for_sale && (
                    <Form.Group className="mb-3">
                      <Form.Label>Preço de Venda (R$)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                      />
                    </Form.Group>
                  )}
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Estado de Conservação</Form.Label>
                <Form.Select
                  value={formData.condition || ''}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value || undefined })}
                >
                  <option value="">Selecione...</option>
                  <option value="new">Novo</option>
                  <option value="like_new">Como novo</option>
                  <option value="good">Bom</option>
                  <option value="fair">Regular</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Notas adicionais sobre o jogo (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  editingGame ? 'Salvar Alterações' : 'Adicionar Jogo'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Remoção</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem certeza que deseja remover este jogo da sua coleção?</p>
            <p className="text-muted small">
              Esta ação não pode ser desfeita.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Sync Progress Modal */}
        <Modal show={syncProgress !== null} centered backdrop="static" keyboard={false}>
          <Modal.Body className="text-center py-4">
            <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Sincronizando...</span>
            </Spinner>
            <h5 className="mt-3 mb-2">{syncProgress?.message || 'Sincronizando...'}</h5>
            {syncProgress && (
              <>
                <p className="text-muted mb-2">
                  {syncProgress.current} de {syncProgress.total} jogos
                </p>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                    aria-valuenow={syncProgress.current}
                    aria-valuemin={0}
                    aria-valuemax={syncProgress.total}
                  >
                    {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>

        {/* Clear Collection Confirmation Modal */}
        <Modal show={showClearConfirm} onHide={() => setShowClearConfirm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
              Confirmar Limpeza da Coleção
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">
              <strong>Atenção!</strong> Esta ação irá remover <strong>TODOS</strong> os {collection?.total_games || 0} jogos da sua coleção.
            </Alert>
            <p>Esta ação é <strong>irreversível</strong> e não pode ser desfeita.</p>
            <p className="text-muted small">
              Se você sincronizar com a Ludopedia novamente, os jogos serão importados de volta.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleClearCollection}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Limpando...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Sim, Limpar Tudo
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

      {/* Import Collection Modal */}
      <ImportCollectionModal
        show={showImportCollectionModal}
        onHide={() => setShowImportCollectionModal(false)}
        onImport={handleImportCollection}
        onSuccess={() => dispatch(fetchCollection())}
      />

      {/* Search Game Modal */}
      <SearchGameModal
        show={showSearchGameModal}
        onHide={() => setShowSearchGameModal(false)}
        onSelect={handleSearchGame}
      />
      </Container>
    </>
  );
};

export default MyCollection;

