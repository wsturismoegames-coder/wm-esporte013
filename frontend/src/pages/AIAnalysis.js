import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AIAnalysis = () => {
  const [events, setEvents] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveProbabilities, setLiveProbabilities] = useState({});

  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => {
      updateLiveProbabilities();
    }, 3000);
    return () => clearInterval(interval);
  }, [liveEvents]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/api/sports/events');
      const allEvents = res.data;
      setEvents(allEvents.filter(e => e.status !== 'live'));
      const live = allEvents.filter(e => e.status === 'live');
      setLiveEvents(live);
      
      // Inicializar probabilidades ao vivo
      const initialProbs = {};
      live.forEach(e => {
        initialProbs[e.id] = {
          t1: (Math.random() * 0.4 + 0.3).toFixed(2),
          dr: (Math.random() * 0.2 + 0.1).toFixed(2),
          t2: (Math.random() * 0.3 + 0.2).toFixed(2)
        };
      });
      setLiveProbabilities(initialProbs);
    } catch (err) {
      console.error('Erro ao carregar eventos');
    }
  };

  const updateLiveProbabilities = () => {
    setLiveProbabilities(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = {
          t1: Math.max(0.1, Math.min(0.8, parseFloat(next[id].t1) + (Math.random() * 0.04 - 0.02))).toFixed(2),
          dr: Math.max(0.05, Math.min(0.4, parseFloat(next[id].dr) + (Math.random() * 0.02 - 0.01))).toFixed(2),
          t2: Math.max(0.1, Math.min(0.8, parseFloat(next[id].t2) + (Math.random() * 0.04 - 0.02))).toFixed(2)
        };
      });
      return next;
    });
  };

  const analyzeEvent = async (event) => {
    setSelectedEvent(event);
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await api.post('/api/ai/analyze', { eventId: event.id });
      setTimeout(() => {
        setAnalysis(res.data);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
    }
  };

  const sportIcons = { Futebol: '⚽', Basquete: '🏀', Tênis: '🎾', MMA: '🥊' };

  const getConfidenceColor = (conf) => {
    if (conf === 'Alta') return '#00c853';
    if (conf === 'Média') return '#FFD700';
    return '#ff1744';
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' },
    subtitle: { textAlign: 'center', color: '#b0b0b0', marginBottom: '32px', fontSize: '15px' },
    sectionTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '20px', color: '#FFD700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
    liveBadge: { background: '#ff1744', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, animation: 'pulse 1.5s infinite' },
    eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '40px' },
    eventCard: (isSelected, isLive) => ({
      background: isSelected ? 'linear-gradient(135deg, rgba(255,215,0,0.1), #1a1a1a)' : '#1a1a1a',
      border: isSelected ? '2px solid #FFD700' : isLive ? '1px solid #ff1744' : '1px solid #2a2a2a',
      borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease',
      position: 'relative', overflow: 'hidden'
    }),
    liveOverlay: { position: 'absolute', top: '10px', right: '10px' },
    eventSport: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    eventTeams: { fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#fff' },
    analyzeBtn: {
      background: 'linear-gradient(135deg, #FFD700, #b8860b)', color: '#000',
      border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
      fontWeight: 800, fontSize: '12px', width: '100%', marginTop: '10px'
    },
    analysisBox: {
      background: '#1a1a1a', border: '1px solid #FFD700', borderRadius: '16px',
      padding: '24px', animation: 'slideUp 0.5s ease', marginTop: '20px'
    },
    analysisTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: 600, color: '#FFD700', marginBottom: '20px' },
    confidenceBadge: (conf) => ({
      display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 700, background: `${getConfidenceColor(conf)}22`,
      color: getConfidenceColor(conf), border: `1px solid ${getConfidenceColor(conf)}`,
      marginBottom: '20px'
    }),
    probRow: { marginBottom: '12px' },
    probLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' },
    probBar: { height: '8px', borderRadius: '4px', background: '#2a2a2a', overflow: 'hidden' },
    probFill: (prob) => ({
      height: '100%', width: `${parseFloat(prob) * 100}%`,
      background: 'linear-gradient(90deg, #FFD700, #b8860b)',
      transition: 'width 0.5s ease',
    }),
    factorList: { marginTop: '20px', padding: '15px', background: '#0a0a0a', borderRadius: '8px' },
    factorItem: { fontSize: '13px', color: '#b0b0b0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
    tipBox: {
      background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0))',
      borderLeft: '4px solid #FFD700', borderRadius: '4px',
      padding: '15px', marginTop: '20px',
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 <span className="gold-text">W.M IA ANALYTICS</span></h1>
      <p style={styles.subtitle}>Análises preditivas de alta precisão em tempo real</p>

      {/* SEÇÃO AO VIVO */}
      <h2 style={styles.sectionTitle}>📡 Análises ao Vivo <span style={styles.liveBadge}>AO VIVO</span></h2>
      <div style={styles.eventsGrid}>
        {liveEvents.map(event => (
          <div key={event.id} style={styles.eventCard(selectedEvent?.id === event.id, true)} onClick={() => analyzeEvent(event)}>
            <div style={styles.liveOverlay}><span style={styles.liveBadge}>LIVE</span></div>
            <div style={styles.eventSport}>
              <span>{sportIcons[event.sport]}</span>
              <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 600 }}>{event.league}</span>
            </div>
            <div style={styles.eventTeams}>{event.team1} vs {event.team2}</div>
            
            {/* Probabilidades em Tempo Real */}
            {liveProbabilities[event.id] && (
              <div style={{ marginTop: '10px' }}>
                <div style={styles.probLabel}>
                  <span style={{ color: '#888', fontSize: '11px' }}>Prob. Vitória {event.team1}</span>
                  <span style={{ color: '#FFD700', fontSize: '11px' }}>{(liveProbabilities[event.id].t1 * 100).toFixed(0)}%</span>
                </div>
                <div style={styles.probBar}>
                  <div style={{ ...styles.probFill(liveProbabilities[event.id].t1), background: '#ff1744' }}></div>
                </div>
              </div>
            )}
            <button style={styles.analyzeBtn}>VER ANÁLISE COMPLETA</button>
          </div>
        ))}
      </div>

      {/* SEÇÃO PRÓXIMOS JOGOS */}
      <h2 style={styles.sectionTitle}>📅 Próximos Eventos</h2>
      <div style={styles.eventsGrid}>
        {events.map(event => (
          <div key={event.id} style={styles.eventCard(selectedEvent?.id === event.id, false)} onClick={() => analyzeEvent(event)}>
            <div style={styles.eventSport}>
              <span>{sportIcons[event.sport]}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{event.league}</span>
            </div>
            <div style={styles.eventTeams}>{event.team1} vs {event.team2}</div>
            <div style={{ color: '#666', fontSize: '11px' }}>{new Date(event.date).toLocaleString()}</div>
            <button style={{ ...styles.analyzeBtn, background: '#2a2a2a', color: '#FFD700', border: '1px solid #FFD700' }}>ANÁLISE PRÉ-JOGO</button>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p style={{ color: '#FFD700', marginTop: '15px', fontFamily: "'Orbitron', sans-serif" }}>IA PROCESSANDO DADOS...</p>
        </div>
      )}

      {analysis && !loading && selectedEvent && (
        <div style={styles.analysisBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={styles.analysisTitle}>📊 Relatório de IA: {selectedEvent.team1} vs {selectedEvent.team2}</h3>
            <div style={styles.confidenceBadge(analysis.confidence)}>Confiança {analysis.confidence}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div>
              <div style={styles.probRow}>
                <div style={styles.probLabel}><span>Vitória {selectedEvent.team1}</span><span>{(analysis.probabilities.team1Win * 100).toFixed(0)}%</span></div>
                <div style={styles.probBar}><div style={styles.probFill(analysis.probabilities.team1Win)}></div></div>
              </div>
              {analysis.probabilities.draw && (
                <div style={styles.probRow}>
                  <div style={styles.probLabel}><span>Empate</span><span>{(analysis.probabilities.draw * 100).toFixed(0)}%</span></div>
                  <div style={styles.probBar}><div style={styles.probFill(analysis.probabilities.draw)}></div></div>
                </div>
              )}
              <div style={styles.probRow}>
                <div style={styles.probLabel}><span>Vitória {selectedEvent.team2}</span><span>{(analysis.probabilities.team2Win * 100).toFixed(0)}%</span></div>
                <div style={styles.probBar}><div style={styles.probFill(analysis.probabilities.team2Win)}></div></div>
              </div>
            </div>

            <div>
              <div style={styles.factorList}>
                <p style={{ color: '#FFD700', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>FATORES ANALISADOS</p>
                {analysis.factors.map((f, i) => (
                  <div key={i} style={styles.factorItem}>✅ {f}</div>
                ))}
              </div>
              <div style={styles.tipBox}>
                <p style={{ color: '#FFD700', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>SUGESTÃO DE APOSTA</p>
                <p style={{ color: '#fff', fontSize: '14px' }}>{analysis.tip}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spinner { width: 40px; height: 40px; border: 4px solid #1a1a1a; border-top: 4px solid #FFD700; borderRadius: 50%; margin: 0 auto; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .gold-text { color: #FFD700; text-shadow: 0 0 10px rgba(255,215,0,0.3); }
      `}</style>
    </div>
  );
};

export default AIAnalysis;
