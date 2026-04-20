import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const Sports = ({ ticket, setTicket }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sport = query.get('sport');

  useEffect(() => {
    loadEvents();
  }, [sport]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const url = sport ? `/api/sports/events?sport=${sport}` : '/api/sports/events';
      const res = await api.get(url);
      setEvents(res.data);
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
    title: {
      fontSize: '24px',
      fontWeight: 800,
      marginBottom: '30px',
      color: 'var(--gold)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    eventGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      backgroundColor: 'var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
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
      <h1 style={styles.title}>
        {sport ? `Apostas: ${sport.toUpperCase()}` : 'Todos os Esportes'}
      </h1>

      <div style={styles.eventGrid}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum evento disponível para esta categoria.</div>
        ) : (
          events.map(event => (
            <div key={event.id} style={styles.eventRow}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <div>{event.league}</div>
                <div style={{ marginTop: '4px' }}>
                  {event.status === 'live' ? (
                    <span className="badge-live">LIVE {event.minute}'</span>
                  ) : (
                    new Date(event.date).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  )}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{event.team1}</span>
                  {event.status === 'live' && <span style={{ color: 'var(--gold)' }}>{event.score.t1}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{event.team2}</span>
                  {event.status === 'live' && <span style={{ color: 'var(--gold)' }}>{event.score.t2}</span>}
                </div>
              </div>
              <div style={styles.oddGroup}>
                {['team1Win', 'draw', 'team2Win'].map((sel, idx) => {
                  const labels = ['1', 'X', '2'];
                  const isSelected = ticket.find(b => b.eventId === event.id && b.selection === sel);
                  return (
                    <button 
                      key={sel} 
                      style={styles.oddBtn(isSelected)}
                      onClick={() => addToTicket(event, sel, labels[idx], event.odds[sel])}
                    >
                      <span style={styles.oddLabel}>{labels[idx]}</span>
                      {event.odds[sel].toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sports;
