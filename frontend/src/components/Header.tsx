import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
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
                <Nav.Link as={Link} to="/collection">Minha Coleção</Nav.Link>
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
  );
}

