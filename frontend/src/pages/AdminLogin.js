import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [phone, setPhone] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(phone, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas');
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
      background: 'radial-gradient(circle at 50% 50%, rgba(220,0,0,0.1) 0%, transparent 70%)',
    },
    form: {
      background: '#1a1a1a',
      border: '1px solid #DC0000',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '420px',
      animation: 'slideUp 0.5s ease',
    },
    icon: {
      textAlign: 'center',
      fontSize: '48px',
      marginBottom: '16px',
    },
    title: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '24px',
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '8px',
      color: '#DC0000',
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
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.icon}>🔐</div>
        <h2 style={styles.title}>Painel Admin</h2>
        <p style={styles.subtitle}>Acesso restrito a administradores</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Usuário Admin</label>
          <input className="input-field" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Senha Admin</label>
          <input className="input-field" type="password" placeholder="Senha do administrador" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="btn-primary" type="submit" style={{ width: '100%', padding: '14px' }} disabled={loading}>
          {loading ? 'VERIFICANDO...' : 'ACESSAR PAINEL'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
