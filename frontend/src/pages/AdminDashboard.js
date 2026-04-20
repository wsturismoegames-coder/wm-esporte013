import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard');
    }
    setLoading(false);
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 700, marginBottom: '8px' },
    subtitle: { color: '#b0b0b0', marginBottom: '32px', fontSize: '15px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: (color) => ({
      background: `linear-gradient(135deg, ${color}15, #1a1a1a)`,
      border: `1px solid ${color}40`,
      borderRadius: '16px', padding: '28px',
    }),
    statIcon: { fontSize: '32px', marginBottom: '12px' },
    statValue: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 800, marginBottom: '4px' },
    statLabel: { color: '#b0b0b0', fontSize: '14px' },
    infoCard: {
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
      padding: '32px', marginBottom: '24px',
    },
    infoTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#FFD700' },
    infoRow: {
      display: 'flex', justifyContent: 'space-between', padding: '12px 0',
      borderBottom: '1px solid #2a2a2a', fontSize: '14px',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: '#FFD700', fontSize: '18px' }}>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 <span className="gold-text">Painel Admin</span></h1>
      <p style={styles.subtitle}>Visão geral da plataforma W.M esporte013</p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#4169E1')}>
          <div style={styles.statIcon}>👥</div>
          <div style={{ ...styles.statValue, color: '#4169E1' }}>{stats?.totalUsers || 0}</div>
          <div style={styles.statLabel}>Usuários Cadastrados</div>
        </div>
        <div style={styles.statCard('#00c853')}>
          <div style={styles.statIcon}>💰</div>
          <div style={{ ...styles.statValue, color: '#00c853' }}>R$ {(stats?.totalDeposits || 0).toFixed(2)}</div>
          <div style={styles.statLabel}>Total Depósitos</div>
        </div>
        <div style={styles.statCard('#ff1744')}>
          <div style={styles.statIcon}>🏦</div>
          <div style={{ ...styles.statValue, color: '#ff1744' }}>R$ {(stats?.totalWithdrawals || 0).toFixed(2)}</div>
          <div style={styles.statLabel}>Total Saques</div>
        </div>
        <div style={styles.statCard('#FFD700')}>
          <div style={styles.statIcon}>📈</div>
          <div style={{ ...styles.statValue, color: '#FFD700' }}>R$ {(stats?.totalProfit || 0).toFixed(2)}</div>
          <div style={styles.statLabel}>Lucro Líquido</div>
        </div>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>📋 Resumo Rápido</h3>
        <div style={styles.infoRow}>
          <span style={{ color: '#b0b0b0' }}>Plataforma</span>
          <span style={{ color: '#FFD700', fontWeight: 600 }}>W.M esporte013</span>
        </div>
        <div style={styles.infoRow}>
          <span style={{ color: '#b0b0b0' }}>Status</span>
          <span style={{ color: '#00c853', fontWeight: 600 }}>🟢 Online</span>
        </div>
        <div style={styles.infoRow}>
          <span style={{ color: '#b0b0b0' }}>Jogos Ativos</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>6 jogos de cassino</span>
        </div>
        <div style={styles.infoRow}>
          <span style={{ color: '#b0b0b0' }}>Eventos Esportivos</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>3 eventos ao vivo</span>
        </div>
        <div style={styles.infoRow}>
          <span style={{ color: '#b0b0b0' }}>Método de Pagamento</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>PIX</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
