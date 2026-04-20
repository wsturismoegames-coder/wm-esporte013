import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Casino = () => {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedGame, setSelectedGame] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const { user, fetchBalance } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGames();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      const res = await api.get('/api/casino/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias');
    }
  };

  const loadGames = async () => {
    try {
      const url = selectedCategory === 'popular' ? '/api/casino/games?popular=true' : `/api/casino/games?category=${selectedCategory}`;
      const res = await api.get(url);
      setGames(res.data);
    } catch (err) {
      console.error('Erro ao carregar jogos');
    }
  };

  const playGame = async () => {
    if (!selectedGame || betAmount <= 0) return;
    setPlaying(true);
    setResult(null);
    try {
      const res = await api.post('/api/casino/play', {
        gameId: selectedGame.id,
        betAmount: parseFloat(betAmount)
      });
      setTimeout(() => {
        setResult(res.data);
        fetchBalance();
        setPlaying(false);
      }, 2000);
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Erro ao jogar' });
      setPlaying(false);
    }
  };

  const styles = {
    categoryBar: {
      display: 'flex',
      gap: '10px',
      overflowX: 'auto',
      paddingBottom: '20px',
      marginBottom: '30px',
      borderBottom: '1px solid var(--border)',
    },
    categoryBtn: (active) => ({
      padding: '10px 20px',
      borderRadius: '20px',
      background: active ? 'var(--gold)' : '#1a1e24',
      color: active ? '#000' : 'var(--text-muted)',
      fontSize: '13px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }),
    gameGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '20px',
    },
    gameCard: {
      background: '#1a1e24',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    gameThumb: {
      height: '160px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '60px',
      background: 'linear-gradient(45deg, #1a1e24, #2a2e35)',
    },
    gameInfo: {
      padding: '12px',
      textAlign: 'center',
    },
    gameName: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#fff',
    },
    playModal: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    modalContent: {
      background: 'var(--bg-card)',
      width: '100%',
      maxWidth: '800px',
      borderRadius: '20px',
      padding: '40px',
      textAlign: 'center',
      border: '1px solid var(--gold)',
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '25px', fontFamily: "'Orbitron', sans-serif" }}>
        🎰 <span className="gold-text">W.M CASINO</span>
      </h1>

      {/* CATEGORIAS */}
      <div style={styles.categoryBar}>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            style={styles.categoryBtn(selectedCategory === cat.id)}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* GRID DE JOGOS */}
      <div style={styles.gameGrid}>
        {games.map(game => (
          <div key={game.id} style={styles.gameCard} onClick={() => setSelectedGame(game)}>
            <div style={styles.gameThumb}>{game.icon}</div>
            <div style={styles.gameInfo}>
              <div style={styles.gameName}>{game.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 800, marginTop: '4px' }}>PG SOFT</div>
            </div>
            {game.popular && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--gold)', color: '#000', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>POPULAR</div>}
          </div>
        ))}
      </div>

      {/* MODAL DE JOGO */}
      {selectedGame && (
        <div style={styles.playModal}>
          <div style={styles.modalContent}>
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', color: '#fff', fontSize: '24px' }} onClick={() => setSelectedGame(null)}>✕</button>
            
            <div style={{ fontSize: '100px', marginBottom: '20px' }}>{selectedGame.icon}</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--gold)', marginBottom: '10px' }}>{selectedGame.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{selectedGame.description}</p>

            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>VALOR DA APOSTA</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                {[5, 10, 20, 50, 100].map(v => (
                  <button key={v} onClick={() => setBetAmount(v)} style={{ padding: '10px 15px', borderRadius: '8px', background: betAmount === v ? 'var(--gold)' : '#2a2e35', color: betAmount === v ? '#000' : '#fff', fontWeight: 700 }}>R$ {v}</button>
                ))}
              </div>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} style={{ ...styles.inputField, width: '150px', textAlign: 'center', fontSize: '20px', fontWeight: 800 }} />
            </div>

            <button className="btn-gold" style={{ padding: '20px 80px', fontSize: '20px', borderRadius: '50px' }} onClick={playGame} disabled={playing}>
              {playing ? 'JOGANDO...' : 'JOGAR AGORA 🚀'}
            </button>

            {result && !playing && (
              <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s' }}>
                <h3 style={{ color: result.winAmount > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '24px', fontWeight: 900 }}>{result.message}</h3>
                {result.winAmount > 0 && <div style={{ fontSize: '48px', color: 'var(--gold)', fontWeight: 900 }}>+ R$ {result.winAmount.toFixed(2)}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Casino;
