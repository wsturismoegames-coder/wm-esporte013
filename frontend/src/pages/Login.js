import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 50%, rgba(220,0,0,0.08) 0%, transparent 70%)',
    },
    form: {
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '420px',
      animation: 'slideUp 0.5s ease',
    },
    title: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '28px',
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '8px',
      color: '#FFD700',
    },
    subtitle: {
      textAlign: 'center',
      color: '#b0b0b0',
      marginBottom: '32px',
      fontSize: '14px',
    },
    field: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#b0b0b0',
      fontSize: '13px',
      fontWeight: 500,
    },
    error: {
      background: 'rgba(255,23,68,0.1)',
      border: '1px solid rgba(255,23,68,0.3)',
      color: '#ff1744',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: '#b0b0b0',
    },
    link: {
      color: '#FFD700',
      textDecoration: 'none',
      fontWeight: 600,
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '24px 0',
      color: '#666',
      fontSize: '13px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#2a2a2a',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Entrar</h2>
        <p style={styles.subtitle}>Acesse sua conta W.M esporte013</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Telefone</label>
          <input
            className="input-field"
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Senha</label>
          <input
            className="input-field"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn-primary" type="submit" style={{ width: '100%', padding: '14px' }} disabled={loading}>
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span>ou</span>
          <span style={styles.dividerLine}></span>
        </div>

        <Link to="/admin-login" style={{ textDecoration: 'none' }}>
          <button className="btn-outline" type="button" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
            ACESSO ADMINISTRADOR
          </button>
        </Link>

        <div style={styles.footer}>
          Não tem conta? <Link to="/register" style={styles.link}>Cadastre-se</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
