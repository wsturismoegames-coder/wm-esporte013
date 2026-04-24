import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const styles = {
    header: {
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
    },
    logoW: {
      color: 'var(--primary)',
      fontSize: '24px',
      fontWeight: 900,
      fontFamily: "'Orbitron', sans-serif",
    },
    logoM: {
      color: 'var(--gold)',
      fontSize: '24px',
      fontWeight: 900,
      fontFamily: "'Orbitron', sans-serif",
    },
    logoText: {
      color: '#fff',
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '1px',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    userArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      background: '#1a1e24',
      padding: '4px 12px',
      borderRadius: '20px',
      border: '1px solid var(--border)',
    },
    balance: {
      fontSize: '14px',
      fontWeight: 800,
      color: 'var(--gold)',
    },
    profileBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
    }
  };

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoW}>W</span>
        <span style={styles.logoM}>M</span>
        <span style={styles.logoText}>esporte013</span>
      </Link>

      <div style={styles.actions}>
        {!user ? (
          <>
            <Link to="/login" className="btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>ENTRAR</Link>
            <Link to="/register" className="btn-gold" style={{ padding: '8px 20px', fontSize: '13px' }}>REGISTRAR</Link>
          </>
        ) : (
          <div style={styles.userArea}>
            <div style={styles.balance}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginRight: '5px' }}>SALDO:</span>
              R$ {user.balance?.toFixed(2)}
            </div>
            <Link to="/wallet" className="btn-gold" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}>
              DEPOSITAR
            </Link>
            <Link to="/profile" style={styles.profileBtn}>
              {user.phone?.substring(0, 1).toUpperCase()}
            </Link>
            <button onClick={logout} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>SAIR</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
