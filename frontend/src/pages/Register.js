import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
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
      background: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.05) 0%, transparent 70%)',
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
    field: { marginBottom: '20px' },
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
    bonus: {
      background: 'linear-gradient(135deg, rgba(220,0,0,0.2), rgba(255,215,0,0.1))',
      border: '1px solid rgba(255,215,0,0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      textAlign: 'center',
    },
    bonusText: {
      color: '#FFD700',
      fontWeight: 600,
      fontSize: '14px',
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
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Criar Conta</h2>
        <p style={styles.subtitle}>Junte-se à W.M esporte013</p>

        <div style={styles.bonus}>
          <span style={styles.bonusText}>🎁 Ganhe bônus de 100% no primeiro depósito!</span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Telefone</label>
          <input className="input-field" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Senha</label>
          <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Confirmar Senha</label>
          <input className="input-field" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

        <button className="btn-gold" type="submit" style={{ width: '100%', padding: '14px' }} disabled={loading}>
          {loading ? 'CRIANDO...' : 'CRIAR MINHA CONTA'}
        </button>

        <div style={styles.footer}>
          Já tem conta? <Link to="/login" style={styles.link}>Entrar</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
