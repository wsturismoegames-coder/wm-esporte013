const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wm-esporte013-secret-key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DADOS EM MEMÓRIA ====================
const users = [];
const transactions = [];
let siteConfig = { siteName: 'W.M esporte013', pixKey: 'sua_chave_pix_aqui', minDeposit: 10, maxWithdraw: 1000 };

const adminUser = { id: uuidv4(), phone: 'admin', password: bcrypt.hashSync('admin123', 8), isAdmin: true, balance: 1000000 };
users.push(adminUser);

// ==================== EVENTOS ESPORTIVOS AMPLIADOS ====================
const sportsEvents = [
  // FUTEBOL - BRASILEIRÃO
  { id: 'br-1', sport: 'Futebol', league: 'Brasileirão', team1: 'Flamengo', team2: 'Palmeiras', odds: { team1Win: 2.10, draw: 3.20, team2Win: 3.00 }, date: new Date(Date.now() + 3600000).toISOString(), status: 'upcoming' },
  { id: 'br-2', sport: 'Futebol', league: 'Brasileirão', team1: 'Corinthians', team2: 'São Paulo', odds: { team1Win: 2.50, draw: 3.10, team2Win: 2.80 }, date: new Date(Date.now() + 7200000).toISOString(), status: 'upcoming' },
  { id: 'br-3', sport: 'Futebol', league: 'Brasileirão', team1: 'Gremio', team2: 'Internacional', odds: { team1Win: 2.40, draw: 3.00, team2Win: 2.90 }, date: new Date(Date.now() - 1800000).toISOString(), status: 'live' },
  { id: 'br-4', sport: 'Futebol', league: 'Brasileirão', team1: 'Atletico-MG', team2: 'Cruzeiro', odds: { team1Win: 2.00, draw: 3.30, team2Win: 3.50 }, date: new Date(Date.now() - 3600000).toISOString(), status: 'live' },
  
  // CHAMPIONS LEAGUE
  { id: 'cl-1', sport: 'Futebol', league: 'Champions League', team1: 'Real Madrid', team2: 'Manchester City', odds: { team1Win: 2.80, draw: 3.50, team2Win: 2.40 }, date: new Date(Date.now() + 86400000).toISOString(), status: 'upcoming' },
  { id: 'cl-2', sport: 'Futebol', league: 'Champions League', team1: 'Bayern Munich', team2: 'Arsenal', odds: { team1Win: 2.20, draw: 3.40, team2Win: 3.10 }, date: new Date(Date.now() + 90000000).toISOString(), status: 'upcoming' },
  
  // PREMIER LEAGUE
  { id: 'pl-1', sport: 'Futebol', league: 'Premier League', team1: 'Liverpool', team2: 'Chelsea', odds: { team1Win: 1.75, draw: 3.80, team2Win: 4.50 }, date: new Date(Date.now() + 43200000).toISOString(), status: 'upcoming' },
  
  // NBA
  { id: 'nba-1', sport: 'Basquete', league: 'NBA', team1: 'Lakers', team2: 'Celtics', odds: { team1Win: 1.90, team2Win: 1.90 }, date: new Date(Date.now() + 14400000).toISOString(), status: 'upcoming' },
  { id: 'nba-2', sport: 'Basquete', league: 'NBA', team1: 'Warriors', team2: 'Suns', odds: { team1Win: 2.10, team2Win: 1.75 }, date: new Date(Date.now() - 900000).toISOString(), status: 'live' },
  
  // TÊNIS
  { id: 'atp-1', sport: 'Tênis', league: 'ATP Masters', team1: 'Alcaraz', team2: 'Sinner', odds: { team1Win: 1.85, team2Win: 1.95 }, date: new Date(Date.now() + 21600000).toISOString(), status: 'upcoming' },
  
  // MMA
  { id: 'ufc-1', sport: 'MMA', league: 'UFC', team1: 'Alex Pereira', team2: 'Jamahal Hill', odds: { team1Win: 1.65, team2Win: 2.30 }, date: new Date(Date.now() + 172800000).toISOString(), status: 'upcoming' },
];

// ==================== JOGOS CASSINO PG ESTILO ====================
const casinoGames = [
  { id: 'fortune-tiger', name: 'Fortune Tiger', category: 'PG Style', icon: '🐯', description: 'O Jogo do Tigre que multiplica sua sorte!', multiplier: 10, theme: 'tiger' },
  { id: 'fortune-ox', name: 'Fortune Ox', category: 'PG Style', icon: '🐂', description: 'O Boi da Fortuna traz prosperidade!', multiplier: 12, theme: 'ox' },
  { id: 'fortune-mouse', name: 'Fortune Mouse', category: 'PG Style', icon: '🐭', description: 'Rato da Sorte com ganhos rápidos!', multiplier: 8, theme: 'mouse' },
  { id: 'dragon-hatch', name: 'Dragon Hatch', category: 'PG Style', icon: '🐲', description: 'Desperte o dragão e ganhe tesouros!', multiplier: 15, theme: 'dragon' },
  { id: 'ganesha-gold', name: 'Ganesha Gold', category: 'PG Style', icon: '🐘', description: 'A sabedoria de Ganesha em ouro!', multiplier: 20, theme: 'ganesha' },
  { id: 'double-fortune', name: 'Double Fortune', category: 'PG Style', icon: '🏮', description: 'Sorte em dobro neste slot clássico!', multiplier: 10, theme: 'double' },
  { id: 'jungle-delight', name: 'Jungle Delight', category: 'PG Style', icon: '🐒', description: 'Aventura na selva com muitas frutas!', multiplier: 7, theme: 'jungle' },
  { id: 'candy-bonanza', name: 'Candy Bonanza', category: 'PG Style', icon: '🍬', description: 'Doces explosivos e prêmios açucarados!', multiplier: 10, theme: 'candy' },
  { id: 'lucky-neko', name: 'Lucky Neko', category: 'PG Style', icon: '🐱', description: 'O gato da sorte japonês!', multiplier: 14, theme: 'neko' },
  { id: 'slots', name: 'Slots Clássico', category: 'Original', icon: '🎰', description: 'Gire os rolos tradicionais!', multiplier: 5, theme: 'classic' },
  { id: 'roulette', name: 'Roleta VIP', category: 'Table', icon: '🎡', description: 'Aposte na cor ou número.', multiplier: 36, theme: 'classic' },
  { id: 'crash', name: 'Crash Rocket', category: 'Crash', icon: '🚀', description: 'Saque antes do crash!', multiplier: 100, theme: 'classic' },
  { id: 'mines', name: 'Mines', category: 'Original', icon: '💣', description: 'Evite as minas, pegue as estrelas!', multiplier: 50, theme: 'classic' },
];

// ==================== MIDDLEWARE ====================
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) next();
  else res.sendStatus(403);
};

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Telefone e senha obrigatórios.' });
  if (users.find(u => u.phone === phone)) return res.status(400).json({ message: 'Telefone já registrado.' });
  const hashed = await bcrypt.hash(password, 8);
  const newUser = { id: uuidv4(), phone, password: hashed, balance: 100, isAdmin: false }; // Bonus inicial para teste
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, phone, isAdmin: false }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ message: 'Conta criada!', token });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone);
  if (!user) return res.status(400).json({ message: 'Telefone ou senha inválidos.' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Telefone ou senha inválidos.' });
  const token = jwt.sign({ id: user.id, phone, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Login realizado!', token, isAdmin: user.isAdmin });
});

app.get('/api/wallet', authenticateJWT, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  res.json({ balance: user.balance });
});

// ==================== ESPORTES API ====================
app.get('/api/sports/events', (req, res) => {
  res.json(sportsEvents);
});

app.post('/api/sports/bet', authenticateJWT, (req, res) => {
  const { bets, totalBet, type } = req.body; // type: 'single' ou 'multiple'
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
  if (user.balance < totalBet) return res.status(400).json({ message: 'Saldo insuficiente.' });

  user.balance -= totalBet;
  
  // Simular resultado imediato para demonstração
  let winAmount = 0;
  let won = true;
  let results = [];

  for (let bet of bets) {
    const event = sportsEvents.find(e => e.id === bet.eventId);
    const outcomes = Object.keys(event.odds);
    const winner = outcomes[Math.floor(Math.random() * outcomes.length)];
    const betWon = bet.selection === winner;
    
    results.push({ eventId: bet.eventId, selection: bet.selection, winner, won: betWon });
    if (!betWon) won = false;
  }

  if (type === 'multiple') {
    if (won) {
      const totalOdd = bets.reduce((acc, b) => {
        const event = sportsEvents.find(e => e.id === b.eventId);
        return acc * event.odds[b.selection];
      }, 1);
      winAmount = parseFloat((totalBet * totalOdd).toFixed(2));
    }
  } else {
    // Single bets - cada uma processada individualmente
    for (let i = 0; i < bets.length; i++) {
      if (results[i].won) {
        const event = sportsEvents.find(e => e.id === bets[i].eventId);
        winAmount += parseFloat(( (totalBet/bets.length) * event.odds[bets[i].selection]).toFixed(2));
      }
    }
    won = winAmount > 0;
  }

  if (winAmount > 0) {
    user.balance += winAmount;
    transactions.push({ id: uuidv4(), userId: user.id, type: 'sports_win', amount: winAmount, date: new Date(), status: 'completed' });
  }

  res.json({ 
    message: won ? `🎉 Você ganhou R$ ${winAmount.toFixed(2)}!` : 'Que pena! Tente novamente.', 
    newBalance: user.balance, 
    winAmount, 
    results 
  });
});

// ==================== CASSINO API ====================
app.get('/api/casino/games', (req, res) => res.json(casinoGames));

app.post('/api/casino/play', authenticateJWT, (req, res) => {
  const { gameId, betAmount, selection } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const game = casinoGames.find(g => g.id === gameId);
  
  if (!user || !game) return res.status(400).json({ message: 'Dados inválidos.' });
  if (user.balance < betAmount) return res.status(400).json({ message: 'Saldo insuficiente!' });

  user.balance -= betAmount;
  let winAmount = 0;
  let message = '';
  let result = {};

  // Lógica estilo PG (Simulada)
  const luck = Math.random();
  const winChance = 0.3; // 30% de chance de ganhar algo

  if (luck < winChance) {
    const multiplier = (Math.random() * game.multiplier).toFixed(1);
    winAmount = parseFloat((betAmount * multiplier).toFixed(2));
    message = `✨ GANHOU! Multiplicador: ${multiplier}x`;
    user.balance += winAmount;
  } else {
    message = 'Não foi dessa vez! Tente de novo.';
  }

  res.json({ message, newBalance: user.balance, winAmount });
});

// ==================== IA ANALISE ====================
app.post('/api/ai/analyze', (req, res) => {
  const { eventId } = req.body;
  const event = sportsEvents.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Evento não encontrado.' });

  const t1 = Math.random() * 0.6 + 0.2;
  const dr = event.odds.draw ? Math.random() * 0.2 + 0.1 : 0;
  const t2 = 1 - t1 - dr;

  const factors = [
    'Forma recente nos últimos 5 jogos',
    'Histórico de confrontos diretos (H2H)',
    'Desfalques por lesão ou suspensão',
    'Motivação e posição na tabela',
    'Condições climáticas e mando de campo'
  ];

  const tips = [
    `Forte tendência de vitória para ${event.team1}.`,
    `Jogo equilibrado com alta probabilidade de empate.`,
    `${event.team2} apresenta valor nas odds atuais.`,
    `Sugestão: Ambas marcam (BTTS).`
  ];

  res.json({
    probabilities: { team1Win: t1.toFixed(2), draw: dr > 0 ? dr.toFixed(2) : undefined, team2Win: t2.toFixed(2) },
    tip: tips[Math.floor(Math.random() * tips.length)],
    confidence: Math.random() > 0.7 ? 'Alta' : Math.random() > 0.4 ? 'Média' : 'Baixa',
    factors: factors.sort(() => 0.5 - Math.random()).slice(0, 3)
  });
});

// ==================== CATCH-ALL ====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  W.M esporte013 rodando em http://localhost:${PORT}\n`);
});
