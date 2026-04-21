import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, fetchBalance } = useAuth();
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' ou 'history'
  const [depositAmount, setDepositAmount] = useState(50);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/api/user/history');
      setHistory(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Erro ao carregar histórico');
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/wallet/deposit', { amount: depositAmount });
      setQrCode(res.data.qrCode);
    } catch (err) {
      console.error('Erro ao gerar depósito');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '40px',
      padding: '30px',
      background: 'linear-gradient(135deg, var(--bg-card) 0%, #000 100%)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 800,
      color: '#fff',
    },
    tabs: {
      display: 'flex',
      gap: '30px',
      marginBottom: '30px',
      borderBottom: '1px solid var(--border)',
    },
    tab: (active) => ({
      padding: '10px 0',
      fontSize: '14px',
      fontWeight: 700,
      color: active ? 'var(--gold)' : 'var(--text-muted)',
      borderBottom: active ? '3px solid var(--gold)' : '3px solid transparent',
      cursor: 'pointer',
      background: 'none',
    }),
    walletCard: {
      background: 'var(--bg-card)',
      padding: '30px',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      textAlign: 'center',
    },
    historyItem: {
      background: 'var(--bg-card)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '15px',
      border: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: (status) => ({
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      background: status === 'won' ? 'rgba(0,200,83,0.1)' : status === 'lost' ? 'rgba(255,23,68,0.1)' : 'rgba(255,215,0,0.1)',
      color: status === 'won' ? 'var(--success)' : status === 'lost' ? 'var(--danger)' : 'var(--gold)',
      border: `1px solid ${status === 'won' ? 'var(--success)' : status === 'lost' ? 'var(--danger)' : 'var(--gold)'}`,
    })
  };

  return (
    <div style={styles.container}>
      {/* HEADER PERFIL */}
      <div style={styles.header}>
        <div style={styles.avatar}>{user?.phone?.substring(0, 1).toUpperCase()}</div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{user?.phone}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Saldo Disponível:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)' }}>R$ {user?.balance?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'wallet')} onClick={() => setActiveTab('wallet')}>CARTEIRA</button>
        <button style={styles.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>HISTÓRICO DE APOSTAS</button>
      </div>

      {/* CONTEÚDO CARTEIRA */}
      {activeTab === 'wallet' && (
        <div style={styles.walletCard}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>DEPÓSITO VIA PIX</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px' }}>O crédito cai na hora na sua conta!</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            {[20, 50, 100, 200, 500].map(v => (
              <button key={v} onClick={() => setDepositAmount(v)} style={{ padding: '10px 20px', borderRadius: '8px', background: depositAmount === v ? 'var(--gold)' : '#2a2e35', color: depositAmount === v ? '#000' : '#fff', fontWeight: 700 }}>R$ {v}</button>
            ))}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="input-field" style={{ width: '200px', textAlign: 'center', fontSize: '24px', fontWeight: 800 }} />
          </div>

          <button className="btn-gold" style={{ padding: '15px 60px', width: '100%', maxWidth: '400px' }} onClick={handleDeposit} disabled={loading}>
            {loading ? 'GERANDO...' : 'GERAR QR CODE PIX'}
          </button>

          {qrCode && (
            <div style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '12px', display: 'inline-block' }}>
              <div style={{ color: '#000', fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>ESCANEIE O QR CODE</div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="PIX QR Code" />
              <div style={{ color: '#000', fontSize: '10px', marginTop: '10px', wordBreak: 'break-all', maxWidth: '200px' }}>{qrCode}</div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO HISTÓRICO */}
      {activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Você ainda não realizou nenhuma aposta.</div>
          ) : (
            history.map(bet => (
              <div key={bet.id} style={styles.historyItem}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>{new Date(bet.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>
                    {bet.type === 'multiple' ? `${bet.selections.length} Seleções (Múltipla)` : bet.selections[0].eventName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gold)', marginTop: '4px' }}>R$ {bet.amount.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.statusBadge(bet.status)}>{bet.status}</div>
                  {bet.status === 'won' && (
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', marginTop: '8px' }}>+ R$ {bet.winAmount.toFixed(2)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
