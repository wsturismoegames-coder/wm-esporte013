import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = ({ ticket, setTicket }) => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        api.get('/api/sports/events?status=live'),
        api.get('/api/sports/events?status=upcoming')
      ]);
      setLiveEvents(liveRes.data);
      setUpcomingEvents(upcomingRes.data.sort((a, b) => b.popularity - a.popularity).slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const addToTicket = (event, selection, label, odd) => {
    const exists = ticket.find(b => b.eventId === event.id);
    if (exists && exists.selection === selection) {
      setTicket(ticket.filter(b => b.eventId !== event.id));
    } else {
      const newSelection = {
        eventId: event.id,
        eventName: `${event.team1} vs ${event.team2}`,
        selection,
        selectionLabel: label,
        odd
      };
      if (exists) {
        setTicket(ticket.map(b => b.eventId === event.id ? newSelection : b));
      } else {
        setTicket([...ticket, newSelection]);
      }
    }
  };

  const styles = {
    banner: {
      background: 'linear-gradient(135deg, #DC0000 0%, #000 100%)',
      borderRadius: '12px',
      padding: '40px',
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      border: '1px solid rgba(255, 215, 0, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 800,
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#fff',
    },
    eventGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      backgroundColor: 'var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '40px',
    },
    eventRow: {
      backgroundColor: 'var(--bg-card)',
      padding: '15px 20px',
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      alignItems: 'center',
      gap: '20px',
    },
    oddGroup: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },
    oddBtn: (active) => ({
      width: '70px',
      height: '45px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? 'var(--gold)' : '#2a2e35',
      color: active ? '#000' : '#fff',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: 700,
    }),
    oddLabel: {
      fontSize: '10px',
      opacity: 0.7,
      marginBottom: '2px',
    }
  };

  return (
    <div>
      {/* BANNER PROMOCIONAL */}
      <div style={styles.banner}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '32px', color: 'var(--gold)', marginBottom: '10px' }}>
            BÔNUS DE BOAS-VINDAS
          </h2>
          <p style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', maxWidth: '500px' }}>
            Ganhe 100% de bônus até R$ 500 no seu primeiro depósito. Comece a ganhar agora!
          </p>
          <Link to="/register" className="btn-gold">CADASTRAR AGORA</Link>
        </div>
        <div style={{ position: 'absolute', right: '-50px', top: '-20px', fontSize: '200px', opacity: 0.1 }}>⚽</div>
      </div>

      {/* EVENTOS AO VIVO */}
      <h3 style={styles.sectionTitle}>
        <span className="badge-live">LIVE</span> AO VIVO AGORA
      </h3>
      <div style={styles.eventGrid}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando eventos...</div>
        ) : liveEvents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum evento ao vivo no momento.</div>
        ) : (
          liveEvents.map(event => (
            <div key={event.id} style={styles.eventRow}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <div>{event.league}</div>
                <div style={{ color: 'var(--danger)', fontWeight: 800, marginTop: '4px' }}>{event.minute}'</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>{event.team1}</div>
                <div style={{ background: '#000', padding: '4px 10px', borderRadius: '4px', color: 'var(--gold)', fontWeight: 800, fontSize: '16px' }}>
                  {event.score.t1} - {event.score.t2}
                </div>
                <div style={{ flex: 1, textAlign: 'left', fontWeight: 700 }}>{event.team2}</div>
              </div>
              <div style={styles.oddGroup}>
                {['team1Win', 'draw', 'team2Win'].filter(sel => event.odds[sel] !== undefined).map((sel, idx) => {
                  const labelMap = { team1Win: '1', draw: 'X', team2Win: '2' };
                  const isSelected = ticket.find(b => b.eventId === event.id && b.selection === sel);
                  return (
                    <button 
                      key={sel} 
                      style={styles.oddBtn(isSelected)}
                      onClick={() => addToTicket(event, sel, labelMap[sel], event.odds[sel])}
                    >
                      <span style={styles.oddLabel}>{labelMap[sel]}</span>
                      {event.odds[sel].toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESTAQUES / PRÓXIMOS JOGOS */}
      <h3 style={styles.sectionTitle}>⭐ DESTAQUES DO DIA</h3>
      <div style={styles.eventGrid}>
        {upcomingEvents.map(event => (
          <div key={event.id} style={styles.eventRow}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>{event.league}</div>
              <div style={{ marginTop: '4px' }}>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style={{ fontWeight: 700 }}>
              <div>{event.team1}</div>
              <div style={{ marginTop: '4px' }}>{event.team2}</div>
            </div>
            <div style={styles.oddGroup}>
              {['team1Win', 'draw', 'team2Win'].filter(sel => event.odds[sel] !== undefined).map((sel) => {
                const labelMap = { team1Win: '1', draw: 'X', team2Win: '2' };
                const isSelected = ticket.find(b => b.eventId === event.id && b.selection === sel);
                return (
                  <button 
                    key={sel} 
                    style={styles.oddBtn(isSelected)}
                    onClick={() => addToTicket(event, sel, labelMap[sel], event.odds[sel])}
                  >
                    <span style={styles.oddLabel}>{labelMap[sel]}</span>
                    {event.odds[sel].toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK LINKS CASSINO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <Link to="/casino" style={{ ...styles.banner, padding: '20px', marginBottom: 0, background: 'linear-gradient(135deg, #FFD700 0%, #000 100%)', border: 'none' }}>
          <h4 style={{ color: '#000', fontWeight: 900 }}>🎰 CASSINO AO VIVO</h4>
          <p style={{ color: '#333', fontSize: '12px' }}>As melhores mesas com dealers reais.</p>
        </Link>
        <Link to="/casino?category=pgsoft" style={{ ...styles.banner, padding: '20px', marginBottom: 0, background: 'linear-gradient(135deg, #ff9800 0%, #000 100%)', border: 'none' }}>
          <h4 style={{ color: '#fff', fontWeight: 900 }}>🐯 JOGOS DA FORTUNA</h4>
          <p style={{ color: '#ccc', fontSize: '12px' }}>Fortune Tiger, Ox e muito mais.</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
