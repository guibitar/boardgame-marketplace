import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { UserRole } from '../types/user';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError, fetchCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    cep: '',
    role: UserRole.FREE,
  });

  const [validationError, setValidationError] = useState('');
  const [googleData, setGoogleData] = useState<any>(null);

  // Função para formatar erros de validação do backend
  const formatError = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (Array.isArray(error)) {
      return error.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join('\n');
    }
    
    if (error?.detail) {
      if (Array.isArray(error.detail)) {
        return error.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join('\n');
      }
      return error.detail;
    }
    
    return 'Erro ao processar requisição';
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Verifica se há dados do Google na URL
    const urlParams = new URLSearchParams(window.location.search);
    const googleParam = urlParams.get('google');
    
    if (googleParam) {
      try {
        const decoded = decodeURIComponent(googleParam);
        const params = new URLSearchParams(decoded);
        const googleInfo = {
          email: params.get('email') || '',
          full_name: params.get('full_name') || '',
          picture_url: params.get('picture_url') || '',
          google_id: params.get('google_id') || '',
        };
        
        setGoogleData(googleInfo);
        setFormData(prev => ({
          ...prev,
          email: googleInfo.email,
          full_name: googleInfo.full_name,
          username: googleInfo.email.split('@')[0], // Usa parte do email como username
        }));
      } catch (error) {
        console.error('Erro ao processar dados do Google:', error);
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validação de senha (apenas se não vier do Google)
    if (!googleData) {
      if (formData.password !== formData.confirmPassword) {
        setValidationError('As senhas não coincidem');
        return;
      }

      if (formData.password.length < 6) {
        setValidationError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    const { confirmPassword, ...userData } = formData;
    
    // Se vier do Google, não precisa de senha
    if (googleData) {
      userData.password = 'google_oauth_user';
    }
    
    const result = await register(userData);
    if (result.type === 'auth/register/fulfilled') {
      // Se veio do Google, faz login direto
      if (googleData) {
        // Faz login automático após registro
        const loginResult = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: userData.username,
            password: userData.password,
          }),
        });
        
        if (loginResult.ok) {
          const loginData = await loginResult.json();
          localStorage.setItem('token', loginData.access_token);
          
          // Busca os dados do usuário para atualizar o Redux
          await fetchCurrentUser();
          
          navigate('/');
        } else {
          navigate('/login', { 
            state: { message: 'Conta criada com sucesso! Faça login para continuar.' } 
          });
        }
      } else {
        navigate('/login', { 
          state: { message: 'Conta criada com sucesso! Faça login para continuar.' } 
        });
      }
    }
  };

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (##) #####-####
    if (numbers.length <= 10) {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    
    // Se tiver 11 dígitos (celular com DDD)
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    
    return value;
  };

  // Função para aplicar máscara de CEP
  const applyCepMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara #####-###
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplica máscaras específicas
    if (name === 'phone') {
      setFormData({
        ...formData,
        [name]: applyPhoneMask(value),
      });
    } else if (name === 'cep') {
      setFormData({
        ...formData,
        [name]: applyCepMask(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container className="py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
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
                {googleData ? (
                  <>
                    <div className="alert alert-info d-flex align-items-center mb-3">
                      <svg width="20" height="20" className="me-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Complete seu cadastro com sua conta Google</span>
                    </div>
                    <h3 className="mb-3">Complete seu cadastro</h3>
                    <p className="text-muted mb-4">Escolha um plano e complete seus dados</p>
                  </>
                ) : (
                  <>
                    <h3 className="mb-3">Criar conta</h3>
                    <p className="text-muted mb-4">Preencha os dados abaixo para começar</p>
                  </>
                )}

                <Form onSubmit={handleSubmit}>
                  {(error || validationError) && (
                    <Alert variant="danger" className="mb-3">
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {formatError(error) || validationError}
                      </pre>
                    </Alert>
                  )}

                  {/* Planos */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Escolha seu plano <span className="text-danger">*</span></label>
                    <Row className="g-3">
                      <Col md={4}>
                        <Card 
                          className={`h-100 cursor-pointer ${formData.role === UserRole.FREE ? 'border-primary border-2' : ''}`}
                          onClick={() => handleRoleChange(UserRole.FREE)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Card.Body className="text-center">
                            <div className="mb-2">🎁</div>
                            <h5 className="mb-2">Gratuito</h5>
                            <h3 className="text-primary mb-3">R$ 0</h3>
                            <ul className="list-unstyled text-start small">
                              <li>✓ 3 listas ativas</li>
                              <li>✓ 5 jogos por lista</li>
                              <li>✓ Exportação ilimitada</li>
                              <li>✓ Busca de jogos</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={4}>
                        <Card 
                          className={`h-100 cursor-pointer ${formData.role === UserRole.PREMIUM ? 'border-primary border-2' : ''}`}
                          onClick={() => handleRoleChange(UserRole.PREMIUM)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Card.Body className="text-center">
                            <span className="badge bg-primary mb-2">Popular</span>
                            <div className="mb-2">⭐</div>
                            <h5 className="mb-2">Premium</h5>
                            <h3 className="text-primary mb-3">R$ 19,90/mês</h3>
                            <ul className="list-unstyled text-start small">
                              <li>✓ Listas ilimitadas</li>
                              <li>✓ 20 jogos por lista</li>
                              <li>✓ Sem anúncios</li>
                              <li>✓ Estatísticas</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={4}>
                        <Card 
                          className={`h-100 cursor-pointer ${formData.role === UserRole.PRO ? 'border-primary border-2' : ''}`}
                          onClick={() => handleRoleChange(UserRole.PRO)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Card.Body className="text-center">
                            <div className="mb-2">👑</div>
                            <h5 className="mb-2">Pro</h5>
                            <h3 className="text-primary mb-3">R$ 49,90/mês</h3>
                            <ul className="list-unstyled text-start small">
                              <li>✓ Tudo do Premium</li>
                              <li>✓ Jogos ilimitados</li>
                              <li>✓ Analytics completo</li>
                              <li>✓ API própria</li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Usuário <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          placeholder="Digite seu usuário"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Nome Completo</Form.Label>
                        <Form.Control
                          type="text"
                          name="full_name"
                          placeholder="Seu nome completo"
                          value={formData.full_name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={handleChange}
                          maxLength={15}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>CEP</Form.Label>
                        <Form.Control
                          type="text"
                          name="cep"
                          placeholder="00000-000"
                          value={formData.cep}
                          onChange={handleChange}
                          maxLength={9}
                        />
                      </Form.Group>
                    </Col>

                    {!googleData && (
                      <>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Senha <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              placeholder="Mínimo 6 caracteres"
                              value={formData.password}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Confirmar Senha <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              placeholder="Confirme sua senha"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Já tem uma conta?{' '}
                      <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                        Faça login
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
