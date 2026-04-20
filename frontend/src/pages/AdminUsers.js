import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Erro ao carregar usuários');
    }
    setLoading(false);
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 700, marginBottom: '8px' },
    subtitle: { color: '#b0b0b0', marginBottom: '32px', fontSize: '15px' },
    card: {
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
      padding: '24px', overflow: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
    th: {
      textAlign: 'left', padding: '14px 16px', borderBottom: '2px solid #2a2a2a',
      color: '#FFD700', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    td: {
      padding: '14px 16px', borderBottom: '1px solid #1f1f1f',
      color: '#b0b0b0', fontSize: '14px',
    },
    badge: (balance) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
      background: balance > 0 ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)',
      color: balance > 0 ? '#00c853' : '#ff1744',
    }),
    empty: { textAlign: 'center', padding: '40px', color: '#666' },
    count: {
      background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)',
      borderRadius: '12px', padding: '12px 20px', marginBottom: '20px',
      display: 'inline-block', color: '#FFD700', fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👥 <span className="gold-text">Usuários</span></h1>
      <p style={styles.subtitle}>Gerenciamento de usuários da plataforma</p>

      <div style={styles.count}>Total: {users.length} usuários</div>

      <div style={styles.card}>
        {loading ? (
          <p style={styles.empty}>Carregando...</p>
        ) : users.length === 0 ? (
          <p style={styles.empty}>Nenhum usuário cadastrado ainda</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Telefone</th>
                <th style={styles.th}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={styles.td}>{user.id.substring(0, 8)}...</td>
                  <td style={{ ...styles.td, color: '#fff', fontWeight: 500 }}>{user.phone}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(user.balance)}>R$ {user.balance.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
