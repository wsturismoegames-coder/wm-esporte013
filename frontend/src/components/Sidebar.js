import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/api/sports/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias');
    }
  };

  const styles = {
    container: {
      padding: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    sectionTitle: {
      padding: '0 20px',
      fontSize: '11px',
      fontWeight: 800,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      marginTop: '20px',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-main)',
      transition: 'all 0.2s ease',
      borderLeft: '4px solid transparent',
    },
    activeNavItem: {
      backgroundColor: 'rgba(220, 0, 0, 0.1)',
      color: 'var(--primary)',
      borderLeft: '4px solid var(--primary)',
    },
    icon: {
      fontSize: '18px',
      width: '24px',
      textAlign: 'center',
    }
  };

  return (
    <aside className="sidebar-fixed">
      <div style={styles.container}>
        <div style={styles.sectionTitle}>Navegação Principal</div>
        
        <NavLink to="/" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
          <span style={styles.icon}>🏠</span> Home
        </NavLink>
        
        <NavLink to="/sports" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
          <span style={styles.icon}>⚽</span> Esportes
        </NavLink>
        
        <NavLink to="/ai" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
          <span style={styles.icon}>🤖</span> Análise IA
        </NavLink>
        
        <NavLink to="/casino" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
          <span style={styles.icon}>🎰</span> Cassino
        </NavLink>

        <div style={styles.sectionTitle}>Esportes Populares</div>
        {categories.map(cat => (
          <NavLink key={cat.id} to={`/sports?sport=${cat.id}`} style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
            <span style={styles.icon}>{cat.icon}</span> {cat.name}
          </NavLink>
        ))}

        <div style={styles.sectionTitle}>Suporte & Info</div>
        <NavLink to="/profile" style={({ isActive }) => isActive ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}>
          <span style={styles.icon}>👤</span> Minha Conta
        </NavLink>
        <div style={{...styles.navItem, cursor: 'pointer'}} onClick={() => window.open('https://help.manus.im')}>
          <span style={styles.icon}>❓</span> Ajuda
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
