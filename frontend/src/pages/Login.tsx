import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const result = await login(formData);
    if (result.type === 'auth/login/fulfilled') {
      navigate('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            {/* Logo */}
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none">
                <h1 className="display-5 fw-bold text-primary">🎲 Ludo Venda</h1>
              </Link>
              <p className="text-muted">Plataforma de vendas de boardgames</p>
            </div>

            {/* Form Card */}
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h3 className="mb-3">Bem-vindo de volta</h3>
                <p className="text-muted mb-4">Faça login para continuar</p>

                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Usuário</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Digite seu usuário"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>

                  <div className="text-center mb-3">
                    <span className="text-muted">ou</span>
                  </div>

                  <Button
                    variant="outline-secondary"
                    size="lg"
                    className="w-100 mb-3"
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8000/api/auth/google/login');
                        const data = await response.json();
                        if (data.authorization_url) {
                          window.location.href = data.authorization_url;
                        }
                      } catch (error) {
                        console.error('Erro ao iniciar login com Google:', error);
                      }
                    }}
                  >
                    <svg width="20" height="20" className="me-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar com Google
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Não tem uma conta?{' '}
                      <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                        Registre-se
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="text-muted small">© 2025 Ludo Venda. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
