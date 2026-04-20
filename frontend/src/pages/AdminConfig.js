import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminConfig = () => {
  const [config, setConfig] = useState({
    siteName: '',
    pixKey: '',
    minDeposit: 10,
    maxWithdraw: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/api/admin/config');
      setConfig(res.data);
    } catch (err) {
      console.error('Erro ao carregar configurações');
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/api/admin/config', config);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    }
    setSaving(false);
  };

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    title: { fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 700, marginBottom: '8px' },
    subtitle: { color: '#b0b0b0', marginBottom: '32px', fontSize: '15px' },
    section: {
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
      padding: '32px', marginBottom: '24px',
    },
    sectionTitle: {
      fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: 600,
      marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
    },
    field: { marginBottom: '20px' },
    label: {
      display: 'block', marginBottom: '8px', color: '#b0b0b0',
      fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    msgBox: (type) => ({
      padding: '14px', borderRadius: '10px', marginBottom: '20px',
      background: type === 'success' ? 'rgba(0,200,83,0.1)' : 'rgba(255,23,68,0.1)',
      border: `1px solid ${type === 'success' ? 'rgba(0,200,83,0.3)' : 'rgba(255,23,68,0.3)'}`,
      color: type === 'success' ? '#00c853' : '#ff1744',
      textAlign: 'center', fontSize: '14px',
    }),
    pixPreview: {
      background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)',
      borderRadius: '12px', padding: '20px', marginTop: '16px',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: '#FFD700' }}>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ <span className="gold-text">Configurações</span></h1>
      <p style={styles.subtitle}>Configure sua plataforma W.M esporte013</p>

      {message && <div style={styles.msgBox(message.type)}>{message.text}</div>}

      {/* Configurações Gerais */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={{ color: '#FFD700' }}>🌐</span>
          <span style={{ color: '#FFD700' }}>Configurações Gerais</span>
        </h3>
        <div style={styles.field}>
          <label style={styles.label}>Nome do Site</label>
          <input className="input-field" type="text" value={config.siteName}
            onChange={(e) => setConfig({ ...config, siteName: e.target.value })} />
        </div>
      </div>

      {/* Configurações PIX */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={{ color: '#00c853' }}>💳</span>
          <span style={{ color: '#00c853' }}>Configurações PIX</span>
        </h3>
        <div style={styles.field}>
          <label style={styles.label}>Chave PIX</label>
          <input className="input-field" type="text" placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
            value={config.pixKey}
            onChange={(e) => setConfig({ ...config, pixKey: e.target.value })} />
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Depósito Mínimo (R$)</label>
            <input className="input-field" type="number" min="1" value={config.minDeposit}
              onChange={(e) => setConfig({ ...config, minDeposit: parseFloat(e.target.value) })} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Saque Máximo (R$)</label>
            <input className="input-field" type="number" min="1" value={config.maxWithdraw}
              onChange={(e) => setConfig({ ...config, maxWithdraw: parseFloat(e.target.value) })} />
          </div>
        </div>

        <div style={styles.pixPreview}>
          <p style={{ color: '#FFD700', fontWeight: 600, marginBottom: '8px' }}>📋 Resumo PIX</p>
          <p style={{ color: '#b0b0b0', fontSize: '13px' }}>Chave: <strong style={{ color: '#fff' }}>{config.pixKey || 'Não configurada'}</strong></p>
          <p style={{ color: '#b0b0b0', fontSize: '13px' }}>Depósito mín: <strong style={{ color: '#00c853' }}>R$ {config.minDeposit}</strong></p>
          <p style={{ color: '#b0b0b0', fontSize: '13px' }}>Saque máx: <strong style={{ color: '#ff1744' }}>R$ {config.maxWithdraw}</strong></p>
        </div>
      </div>

      <button className="btn-gold" onClick={saveConfig} disabled={saving}
        style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
        {saving ? 'SALVANDO...' : '💾 SALVAR CONFIGURAÇÕES'}
      </button>
    </div>
  );
};

export default AdminConfig;
