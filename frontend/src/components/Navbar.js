import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, balance, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const styles = {
    nav: {
      background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
      borderBottom: '1px solid #2a2a2a',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
    },
    logo: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '22px',
      fontWeight: 800,
      textDecoration: 'none',
      background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
      backgroundSize: '200% 200%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'goldShimmer 3s ease infinite',
      letterSpacing: '2px',
    },
    logoAccent: {
      color: '#DC0000',
      WebkitTextFillColor: '#DC0000',
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      listStyle: 'none',
    },
    link: (active) => ({
      color: active ? '#FFD700' : '#b0b0b0',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.3s ease',
      background: active ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
      borderBottom: active ? '2px solid #FFD700' : '2px solid transparent',
    }),
    balance: {
      background: 'linear-gradient(135deg, #1a1a1a, #222)',
      border: '1px solid #FFD700',
      borderRadius: '25px',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 600,
      color: '#FFD700',
    },
    balanceIcon: {
      fontSize: '16px',
    },
    authButtons: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    hamburger: {
      display: 'none',
      flexDirection: 'column',
      gap: '5px',
      cursor: 'pointer',
      padding: '5px',
      background: 'none',
      border: 'none',
    },
    hamburgerLine: {
      width: '25px',
      height: '2px',
      background: '#FFD700',
      borderRadius: '2px',
      transition: 'all 0.3s ease',
    },
    mobileMenu: {
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      background: '#111111',
      borderBottom: '1px solid #2a2a2a',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      animation: 'slideUp 0.3s ease',
      zIndex: 999,
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoAccent}>W.M</span> esporte013
        </Link>

        {/* Desktop Menu */}
        <div style={{ ...styles.links, '@media (max-width: 768px)': { display: 'none' } }} className="desktop-nav">
          {user && !isAdmin && (
            <>
              <Link to="/" style={styles.link(isActive('/'))}>Início</Link>
              <Link to="/casino" style={styles.link(isActive('/casino'))}>Cassino</Link>
              <Link to="/sports" style={styles.link(isActive('/sports'))}>Esportes</Link>
              <Link to="/ai-analysis" style={styles.link(isActive('/ai-analysis'))}>IA Análise</Link>
              <Link to="/wallet" style={styles.link(isActive('/wallet'))}>Carteira</Link>
            </>
          )}
          {user && isAdmin && (
            <>
              <Link to="/admin" style={styles.link(isActive('/admin'))}>Dashboard</Link>
              <Link to="/admin/users" style={styles.link(isActive('/admin/users'))}>Usuários</Link>
              <Link to="/admin/config" style={styles.link(isActive('/admin/config'))}>Configurações</Link>
            </>
          )}
        </div>

        <div style={styles.authButtons}>
          {user && !isAdmin && (
            <div style={styles.balance}>
              <span style={styles.balanceIcon}>💰</span>
              R$ {balance.toFixed(2)}
            </div>
          )}
          {user ? (
            <button className="btn-primary" onClick={handleLogout} style={{ padding: '8px 20px', fontSize: '13px' }}>
              Sair
            </button>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>Entrar</button>
              </Link>
              <Link to="/register">
                <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '13px' }}>Cadastrar</button>
              </Link>
            </>
          )}

          <button
            style={styles.hamburger}
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={styles.hamburgerLine}></span>
            <span style={styles.hamburgerLine}></span>
            <span style={styles.hamburgerLine}></span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {user && !isAdmin && (
            <>
              <Link to="/" style={styles.link(isActive('/'))} onClick={() => setMenuOpen(false)}>🏠 Início</Link>
              <Link to="/casino" style={styles.link(isActive('/casino'))} onClick={() => setMenuOpen(false)}>🎰 Cassino</Link>
              <Link to="/sports" style={styles.link(isActive('/sports'))} onClick={() => setMenuOpen(false)}>⚽ Esportes</Link>
              <Link to="/ai-analysis" style={styles.link(isActive('/ai-analysis'))} onClick={() => setMenuOpen(false)}>🤖 IA Análise</Link>
              <Link to="/wallet" style={styles.link(isActive('/wallet'))} onClick={() => setMenuOpen(false)}>💰 Carteira</Link>
            </>
          )}
          {user && isAdmin && (
            <>
              <Link to="/admin" style={styles.link(isActive('/admin'))} onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
              <Link to="/admin/users" style={styles.link(isActive('/admin/users'))} onClick={() => setMenuOpen(false)}>👥 Usuários</Link>
              <Link to="/admin/config" style={styles.link(isActive('/admin/config'))} onClick={() => setMenuOpen(false)}>⚙️ Configurações</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
