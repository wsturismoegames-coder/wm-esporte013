import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const [tab, setTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { balance, fetchBalance } = useAuth();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/api/wallet/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Erro ao carregar histórico');
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setMessage(null);
    setQrCode(null);
    try {
      const res = await api.post('/api/wallet/deposit', { amount: parseFloat(amount) });
      setQrCode(res.data.qrCode);
      setMessage({ type: 'success', text: res.data.message });
      fetchBalance();
      loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao depositar' });
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/api/wallet/withdraw', { amount: parseFloat(amount) });
      setMessage({ type: 'success', text: res.data.message });
      fetchBalance();
      loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao sacar' });
    }
    setLoading(false);
  };

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' },
    balanceCard: {
      background: 'linear-gradient(135deg, #DC0000, #8B0000)',
      borderRadius: '20px', padding: '32px', textAlign: 'center',
      marginBottom: '32px', position: 'relative', overflow: 'hidden',
    },
    balanceGlow: {
      position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px',
      background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent)',
      borderRadius: '50%', pointerEvents: 'none',
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px', position: 'relative', zIndex: 1 },
    balanceValue: {
      fontFamily: "'Orbitron', sans-serif", fontSize: '42px', fontWeight: 900,
      color: '#FFD700', position: 'relative', zIndex: 1,
      textShadow: '0 0 20px rgba(255,215,0,0.5)',
    },
    tabs: { display: 'flex', gap: '0', marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a' },
    tab: (active) => ({
      flex: 1, padding: '14px', textAlign: 'center', cursor: 'pointer',
      background: active ? '#DC0000' : '#1a1a1a',
      color: active ? '#fff' : '#b0b0b0',
      fontWeight: 600, fontSize: '14px', border: 'none',
      transition: 'all 0.3s ease',
    }),
    formCard: {
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
      padding: '32px', marginBottom: '24px',
    },
    formTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#FFD700' },
    quickAmounts: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
    quickBtn: (active) => ({
      padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: active ? '#FFD700' : '#2a2a2a', color: active ? '#000' : '#fff',
      fontWeight: 600, fontSize: '14px', transition: 'all 0.3s ease',
    }),
    qrCodeBox: {
      background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'center',
      marginTop: '20px', display: 'inline-block',
    },
    msgBox: (type) => ({
      padding: '14px', borderRadius: '10px', marginTop: '16px',
      background: type === 'success' ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)',
      border: `1px solid ${type === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,23,68,0.3)'}`,
      color: type === 'success' ? '#00c853' : '#ff1744',
      textAlign: 'center', fontSize: '14px',
    }),
    historyCard: {
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px',
    },
    historyTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#FFD700' },
    historyItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid #2a2a2a',
    },
    historyType: (type) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
      background: type === 'deposit' ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)',
      color: type === 'deposit' ? '#00c853' : '#ff1744',
    }),
    historyAmount: (type) => ({
      fontWeight: 700, fontSize: '16px',
      color: type === 'deposit' ? '#00c853' : '#ff1744',
    }),
    historyDate: { color: '#666', fontSize: '12px' },
    pixInfo: {
      background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)',
      borderRadius: '12px', padding: '16px', marginBottom: '20px',
    },
    pixInfoText: { color: '#b0b0b0', fontSize: '13px', lineHeight: 1.6 },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💰 <span className="gold-text">Carteira</span></h1>

      <div style={styles.balanceCard}>
        <div style={styles.balanceGlow}></div>
        <p style={styles.balanceLabel}>Seu Saldo</p>
        <p style={styles.balanceValue}>R$ {balance.toFixed(2)}</p>
      </div>

      <div style={styles.tabs}>
        <button style={styles.tab(tab === 'deposit')} onClick={() => { setTab('deposit'); setMessage(null); setQrCode(null); }}>
          💳 Depositar
        </button>
        <button style={styles.tab(tab === 'withdraw')} onClick={() => { setTab('withdraw'); setMessage(null); }}>
          🏦 Sacar
        </button>
        <button style={styles.tab(tab === 'history')} onClick={() => { setTab('history'); loadHistory(); }}>
          📋 Histórico
        </button>
      </div>

      {tab === 'deposit' && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Depositar via PIX</h3>
          <div style={styles.pixInfo}>
            <p style={styles.pixInfoText}>
              ✅ Depósito instantâneo via PIX<br />
              ✅ Sem taxas adicionais<br />
              ✅ Valor mínimo: R$ 10,00
            </p>
          </div>
          <div style={styles.quickAmounts}>
            {[20, 50, 100, 200, 500, 1000].map(v => (
              <button key={v} style={styles.quickBtn(parseFloat(amount) === v)}
                onClick={() => setAmount(String(v))}>R$ {v}</button>
            ))}
          </div>
          <input className="input-field" type="number" min="10" placeholder="Valor do depósito"
            value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginBottom: '16px' }} />
          <button className="btn-gold" onClick={handleDeposit} disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'GERANDO PIX...' : 'GERAR QR CODE PIX'}
          </button>
          {message && <div style={styles.msgBox(message.type)}>{message.text}</div>}
          {qrCode && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={styles.qrCodeBox}>
                <img src={qrCode} alt="QR Code PIX" style={{ width: '200px', height: '200px' }} />
              </div>
              <p style={{ color: '#b0b0b0', marginTop: '12px', fontSize: '13px' }}>
                Escaneie o QR Code com seu app bancário
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'withdraw' && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Sacar via PIX</h3>
          <div style={styles.pixInfo}>
            <p style={styles.pixInfoText}>
              ✅ Saque processado em até 24h<br />
              ✅ Valor máximo: R$ 1.000,00 por saque<br />
              ✅ Direto na sua conta PIX
            </p>
          </div>
          <div style={styles.quickAmounts}>
            {[20, 50, 100, 200, 500].map(v => (
              <button key={v} style={styles.quickBtn(parseFloat(amount) === v)}
                onClick={() => setAmount(String(v))}>R$ {v}</button>
            ))}
          </div>
          <input className="input-field" type="number" min="1" placeholder="Valor do saque"
            value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginBottom: '16px' }} />
          <button className="btn-primary" onClick={handleWithdraw} disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'PROCESSANDO...' : 'SOLICITAR SAQUE'}
          </button>
          {message && <div style={styles.msgBox(message.type)}>{message.text}</div>}
        </div>
      )}

      {tab === 'history' && (
        <div style={styles.historyCard}>
          <h3 style={styles.historyTitle}>Histórico de Transações</h3>
          {history.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Nenhuma transação encontrada</p>
          ) : (
            history.map(t => (
              <div key={t.id} style={styles.historyItem}>
                <div>
                  <span style={styles.historyType(t.type)}>
                    {t.type === 'deposit' ? '↓ Depósito' : '↑ Saque'}
                  </span>
                  <p style={styles.historyDate}>{new Date(t.date).toLocaleString('pt-BR')}</p>
                </div>
                <span style={styles.historyAmount(t.type)}>
                  {t.type === 'deposit' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;
