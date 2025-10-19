import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Container, Navbar, Nav, Card, Row, Col, Button } from 'react-bootstrap';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4 text-decoration-none">
            🎲 Ludo Venda
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              {isAuthenticated ? (
                <>
                  <Nav.Link className="me-3">
                    <span className="text-muted">Olá,</span> <strong>{user?.full_name || user?.username}</strong>
                    <span className="badge bg-primary ms-2">
                      {user?.role === 'free' && 'Gratuito'}
                      {user?.role === 'premium' && 'Premium'}
                      {user?.role === 'pro' && 'Pro'}
                    </span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/collections">Coleções</Nav.Link>
                  <Nav.Link as={Link} to="/sale-lists">Listas</Nav.Link>
                  <Button variant="outline-secondary" size="sm" onClick={logout} className="ms-2">
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Entrar</Nav.Link>
                  <Link to="/register" className="btn btn-primary ms-2">
                    Criar Conta
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-4">
            Gerencie e Venda seus<br />
            <span className="text-primary">Jogos de Tabuleiro</span>
          </h1>
          <p className="lead text-muted mb-4">
            Crie listas de vendas personalizadas e exporte para WhatsApp, Instagram e outras redes sociais
          </p>
          {!isAuthenticated && (
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Comece Grátis
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Já tem conta? Entrar
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">📦</span>
                </div>
                <h5 className="text-center mb-3">Gerencie sua Coleção</h5>
                <p className="text-center text-muted">
                  Importe seus jogos da Ludopedia ou BoardGameGeek e mantenha tudo organizado
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">💰</span>
                </div>
                <h5 className="text-center mb-3">Crie Listas de Vendas</h5>
                <p className="text-center text-muted">
                  Monte listas personalizadas com preços, condições e descrições dos seus jogos
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">📱</span>
                </div>
                <h5 className="text-center mb-3">Exporte para WhatsApp</h5>
                <p className="text-center text-muted">
                  Compartilhe suas listas formatadas no WhatsApp, Instagram e outras redes sociais
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">🔍</span>
                </div>
                <h5 className="text-center mb-3">Busque Jogos</h5>
                <p className="text-center text-muted">
                  Encontre os jogos que você procura em listas de vendedores da comunidade
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">💬</span>
                </div>
                <h5 className="text-center mb-3">Chat com Vendedores</h5>
                <p className="text-center text-muted">
                  Entre em contato diretamente com vendedores para negociar e fazer perguntas
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <span className="display-4">🎁</span>
                </div>
                <h5 className="text-center mb-3">Plano Gratuito</h5>
                <p className="text-center text-muted">
                  Comece grátis! 3 listas ativas e 5 jogos por lista. Sem compromisso.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>

      {/* Footer */}
      <footer className="bg-white border-top py-4 mt-5">
        <Container>
          <div className="text-center">
            <h5 className="fw-bold text-primary mb-2">🎲 Ludo Venda</h5>
            <p className="text-muted small mb-0">
              © 2025 Ludo Venda. Todos os direitos reservados.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
