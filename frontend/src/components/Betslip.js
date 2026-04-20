import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Betslip = ({ ticket = [], setTicket }) => {
  const [betType, setBetType] = useState('single'); // 'single' ou 'multiple'
  const [betAmount, setBetAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user, fetchBalance } = useAuth();

  const calculateTotalOdd = () => {
    return ticket.reduce((acc, b) => acc * b.odd, 1).toFixed(2);
  };

  const removeSelection = (id) => {
    setTicket(ticket.filter(b => b.eventId !== id));
  };

  const placeBet = async () => {
    if (ticket.length === 0 || betAmount <= 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/api/sports/bet', {
        bets: ticket,
        totalBet: parseFloat(betAmount),
        type: betType
      });
      setResult({ type: 'success', message: res.data.message });
      fetchBalance();
      setTimeout(() => {
        setTicket([]);
        setResult(null);
      }, 3000);
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Erro ao processar aposta' });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px',
      borderBottom: '1px solid var(--border)',
      paddingBottom: '15px',
    },
    title: {
      fontSize: '16px',
      fontWeight: 800,
      fontFamily: "'Orbitron', sans-serif",
      color: 'var(--gold)',
    },
    tabs: {
      display: 'flex',
      gap: '5px',
      marginBottom: '20px',
      background: '#1a1e24',
      padding: '4px',
      borderRadius: '6px',
    },
    tab: (active) => ({
      flex: 1,
      padding: '8px',
      fontSize: '11px',
      fontWeight: 700,
      textAlign: 'center',
      borderRadius: '4px',
      background: active ? 'var(--gold)' : 'transparent',
      color: active ? '#000' : 'var(--text-muted)',
      cursor: 'pointer',
    }),
    ticketItem: {
      background: '#1a1e24',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '10px',
      position: 'relative',
    },
    removeBtn: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      color: 'var(--danger)',
      background: 'none',
      fontSize: '14px',
    },
    eventName: {
      fontSize: '13px',
      fontWeight: 700,
      marginBottom: '4px',
      paddingRight: '20px',
    },
    selection: {
      fontSize: '12px',
      color: 'var(--text-muted)',
    },
    odd: {
      fontSize: '14px',
      fontWeight: 800,
      color: 'var(--gold)',
    },
    summary: {
      marginTop: 'auto',
      paddingTop: '20px',
      borderTop: '1px solid var(--border)',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      fontSize: '13px',
    },
    totalReturn: {
      fontSize: '16px',
      fontWeight: 800,
      color: 'var(--success)',
    },
    empty: {
      textAlign: 'center',
      color: 'var(--text-muted)',
      padding: '40px 0',
      fontSize: '14px',
    }
  };

  return (
    <aside className="betslip-fixed">
      <div style={styles.container}>
        <div style={styles.header}>
          <span>🎟️</span>
          <h3 style={styles.title}>BILHETE</h3>
        </div>

        {ticket.length === 0 ? (
          <div style={styles.empty}>
            <p>Seu bilhete está vazio.</p>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>Selecione uma odd para começar a apostar.</p>
          </div>
        ) : (
          <>
            <div style={styles.tabs}>
              <div style={styles.tab(betType === 'single')} onClick={() => setBetType('single')}>SIMPLES</div>
              <div style={styles.tab(betType === 'multiple')} onClick={() => setBetType('multiple')}>MÚLTIPLA</div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {ticket.map(bet => (
                <div key={bet.eventId} style={styles.ticketItem}>
                  <button style={styles.removeBtn} onClick={() => removeSelection(bet.eventId)}>✕</button>
                  <div style={styles.eventName}>{bet.eventName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={styles.selection}>{bet.selectionLabel}</span>
                    <span style={styles.odd}>{bet.odd.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              {betType === 'multiple' && ticket.length > 1 && (
                <div style={styles.summaryRow}>
                  <span>Odd Total:</span>
                  <span style={{ fontWeight: 800 }}>{calculateTotalOdd()}</span>
                </div>
              )}
              
              <div style={{...styles.summaryRow, alignItems: 'center'}}>
                <span>Valor R$:</span>
                <input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(e.target.value)}
                  style={{...styles.inputField, width: '80px', padding: '5px', textAlign: 'center'}}
                />
              </div>

              <div style={styles.summaryRow}>
                <span>Possível Retorno:</span>
                <span style={styles.totalReturn}>
                  R$ {betType === 'multiple' ? (betAmount * calculateTotalOdd()).toFixed(2) : (betAmount * (calculateTotalOdd() / ticket.length)).toFixed(2)}
                </span>
              </div>

              <button 
                className="btn-gold" 
                style={{ width: '100%', padding: '15px' }} 
                onClick={placeBet}
                disabled={loading || !user}
              >
                {loading ? 'PROCESSANDO...' : user ? 'FAZER APOSTA' : 'FAÇA LOGIN PARA APOSTAR'}
              </button>

              {result && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  textAlign: 'center',
                  background: result.type === 'success' ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)',
                  color: result.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${result.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
                }}>
                  {result.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Betslip;
