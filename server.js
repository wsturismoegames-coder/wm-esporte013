const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wm-esporte013-secret-key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DADOS EM MEMÓRIA ====================
const users = [];
const transactions = [];
const bets_history = [];
let siteConfig = { siteName: 'W.M esporte013', pixKey: 'sua_chave_pix_aqui', minDeposit: 10, maxWithdraw: 1000 };

const adminUser = { id: uuidv4(), phone: 'admin', password: bcrypt.hashSync('admin123', 8), isAdmin: true, balance: 1000000 };
users.push(adminUser);

// ==================== ESTRUTURA DE ESPORTES (ESTILO BETANO) ====================
const sportsCategories = [
  { id: 'football', name: 'Futebol', icon: '⚽' },
  { id: 'basketball', name: 'Basquete', icon: '🏀' },
  { id: 'tennis', name: 'Tênis', icon: '🎾' },
  { id: 'mma', name: 'MMA', icon: '🥊' },
  { id: 'esports', name: 'eSports', icon: '🎮' },
  { id: 'volleyball', name: 'Vôlei', icon: '🏐' }
];

const sportsEvents = [
  // FUTEBOL - BRASILEIRÃO
  { id: 'br-1', sport: 'football', league: 'Brasileirão Série A', team1: 'Flamengo', team2: 'Palmeiras', odds: { team1Win: 2.10, draw: 3.20, team2Win: 3.00 }, date: new Date(Date.now() + 3600000).toISOString(), status: 'upcoming', popularity: 100 },
  { id: 'br-2', sport: 'football', league: 'Brasileirão Série A', team1: 'Corinthians', team2: 'São Paulo', odds: { team1Win: 2.50, draw: 3.10, team2Win: 2.80 }, date: new Date(Date.now() + 7200000).toISOString(), status: 'upcoming', popularity: 95 },
  { id: 'br-3', sport: 'football', league: 'Brasileirão Série A', team1: 'Grêmio', team2: 'Internacional', odds: { team1Win: 2.40, draw: 3.00, team2Win: 2.90 }, date: new Date(Date.now() - 1800000).toISOString(), status: 'live', score: { t1: 1, t2: 0 }, minute: 35, popularity: 90 },
  
  // CHAMPIONS LEAGUE
  { id: 'cl-1', sport: 'football', league: 'Champions League', team1: 'Real Madrid', team2: 'Manchester City', odds: { team1Win: 2.80, draw: 3.50, team2Win: 2.40 }, date: new Date(Date.now() + 86400000).toISOString(), status: 'upcoming', popularity: 100 },
  { id: 'cl-2', sport: 'football', league: 'Champions League', team1: 'Bayern Munich', team2: 'Arsenal', odds: { team1Win: 2.20, draw: 3.40, team2Win: 3.10 }, date: new Date(Date.now() + 90000000).toISOString(), status: 'upcoming', popularity: 85 },
  
  // NBA
  { id: 'nba-1', sport: 'basketball', league: 'NBA', team1: 'Lakers', team2: 'Celtics', odds: { team1Win: 1.90, team2Win: 1.90 }, date: new Date(Date.now() + 14400000).toISOString(), status: 'upcoming', popularity: 80 },
  { id: 'nba-2', sport: 'basketball', league: 'NBA', team1: 'Warriors', team2: 'Suns', odds: { team1Win: 2.10, team2Win: 1.75 }, date: new Date(Date.now() - 900000).toISOString(), status: 'live', score: { t1: 88, t2: 92 }, minute: '4Q', popularity: 75 },
  
  // MMA
  { id: 'ufc-1', sport: 'mma', league: 'UFC 300', team1: 'Alex Pereira', team2: 'Jamahal Hill', odds: { team1Win: 1.65, team2Win: 2.30 }, date: new Date(Date.now() + 172800000).toISOString(), status: 'upcoming', popularity: 70 },
];

// ==================== ESTRUTURA DE CASSINO (ESTILO BETANO) ====================
const casinoCategories = [
  { id: 'popular', name: 'Populares', icon: '🔥' },
  { id: 'slots', name: 'Slots', icon: '🎰' },
  { id: 'pgsoft', name: 'PG Soft', icon: '💎' },
  { id: 'live', name: 'Ao Vivo', icon: '🎥' },
  { id: 'crash', name: 'Crash Games', icon: '🚀' }
];

const casinoGames = [
  { id: 'fortune-tiger', name: 'Fortune Tiger', category: 'pgsoft', icon: '🐯', description: 'O Jogo do Tigre que multiplica sua sorte!', multiplier: 10, theme: 'tiger', popular: true },
  { id: 'fortune-ox', name: 'Fortune Ox', category: 'pgsoft', icon: '🐂', description: 'O Boi da Fortuna traz prosperidade!', multiplier: 12, theme: 'ox', popular: true },
  { id: 'fortune-mouse', name: 'Fortune Mouse', category: 'pgsoft', icon: '🐭', description: 'Rato da Sorte com ganhos rápidos!', multiplier: 8, theme: 'mouse', popular: false },
  { id: 'dragon-hatch', name: 'Dragon Hatch', category: 'pgsoft', icon: '🐲', description: 'Desperte o dragão e ganhe tesouros!', multiplier: 15, theme: 'dragon', popular: true },
  { id: 'ganesha-gold', name: 'Ganesha Gold', category: 'pgsoft', icon: '🐘', description: 'A sabedoria de Ganesha em ouro!', multiplier: 20, theme: 'ganesha', popular: false },
  { id: 'aviator', name: 'Aviator', category: 'crash', icon: '✈️', description: 'Decole e saque antes do avião voar longe!', multiplier: 100, theme: 'crash', popular: true },
  { id: 'mines', name: 'Mines', category: 'crash', icon: '💣', description: 'Evite as minas e multiplique seu saldo!', multiplier: 50, theme: 'mines', popular: true },
  { id: 'roulette-live', name: 'Roleta Brasileira', category: 'live', icon: '🎡', description: 'Roleta ao vivo com dealers em português.', multiplier: 36, theme: 'live', popular: true },
  { id: 'blackjack-live', name: 'Blackjack VIP', category: 'live', icon: '🃏', description: 'Mesa de Blackjack exclusiva.', multiplier: 2, theme: 'live', popular: false },
];

// ==================== MIDDLEWARES ====================
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

// ==================== AUTH API ====================
app.post('/api/auth/register', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Telefone e senha obrigatórios.' });
  if (users.find(u => u.phone === phone)) return res.status(400).json({ message: 'Telefone já registrado.' });
  const hashed = await bcrypt.hash(password, 8);
  const newUser = { id: uuidv4(), phone, password: hashed, balance: 50, isAdmin: false }; 
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, phone, isAdmin: false }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ message: 'Conta criada!', token });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone);
  if (!user) return res.status(400).json({ message: 'Credenciais inválidas.' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Credenciais inválidas.' });
  const token = jwt.sign({ id: user.id, phone, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Bem-vindo!', token, isAdmin: user.isAdmin });
});

app.post('/api/admin/login', async (req, res) => {
  const { phone, password } = req.body;
  const admin = users.find(u => u.phone === phone && u.isAdmin);
  if (!admin) return res.status(400).json({ message: 'Credenciais inválidas.' });
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(400).json({ message: 'Credenciais inválidas.' });
  const token = jwt.sign({ id: admin.id, phone, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Acesso admin liberado!', token });
});

app.get('/api/wallet', authenticateJWT, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  res.json({ balance: user.balance });
});

app.get('/api/user/me', authenticateJWT, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ==================== SPORTS API ====================
app.get('/api/sports/categories', (req, res) => res.json(sportsCategories));
app.get('/api/sports/events', (req, res) => {
  const { status, sport } = req.query;
  let filtered = [...sportsEvents];
  if (status) filtered = filtered.filter(e => e.status === status);
  if (sport) filtered = filtered.filter(e => e.sport === sport);
  res.json(filtered);
});

app.post('/api/sports/bet', authenticateJWT, (req, res) => {
  const { bets, totalBet, type } = req.body; 
  const user = users.find(u => u.id === req.user.id);
  if (!user || user.balance < totalBet) return res.status(400).json({ message: 'Saldo insuficiente.' });

  user.balance -= totalBet;
  const betId = uuidv4();
  const newBet = {
    id: betId,
    userId: user.id,
    type,
    amount: totalBet,
    selections: bets,
    status: 'pending',
    createdAt: new Date()
  };
  bets_history.push(newBet);
  
  // Simulação de resultado (50% chance)
  setTimeout(() => {
    const won = Math.random() > 0.5;
    const betIdx = bets_history.findIndex(b => b.id === betId);
    if (betIdx !== -1) {
      if (won) {
        const totalOdd = type === 'multiple' ? bets.reduce((acc, b) => acc * b.odd, 1) : bets[0].odd;
        const winAmount = totalBet * totalOdd;
        user.balance += winAmount;
        bets_history[betIdx].status = 'won';
        bets_history[betIdx].winAmount = winAmount;
      } else {
        bets_history[betIdx].status = 'lost';
      }
    }
  }, 5000);

  res.json({ message: 'Aposta realizada com sucesso!', newBalance: user.balance });
});

// ==================== CASINO API ====================
app.get('/api/casino/categories', (req, res) => res.json(casinoCategories));
app.get('/api/casino/games', (req, res) => {
  const { category, popular } = req.query;
  let filtered = [...casinoGames];
  if (category) filtered = filtered.filter(g => g.category === category);
  if (popular === 'true') filtered = filtered.filter(g => g.popular);
  res.json(filtered);
});

app.post('/api/casino/play', authenticateJWT, (req, res) => {
  const { gameId, betAmount } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const game = casinoGames.find(g => g.id === gameId);
  
  if (!user || user.balance < betAmount) return res.status(400).json({ message: 'Saldo insuficiente!' });

  user.balance -= betAmount;
  const winChance = 0.3;
  const luck = Math.random();
  let winAmount = 0;

  if (luck < winChance) {
    const mult = (Math.random() * 5 + 1).toFixed(2);
    winAmount = betAmount * mult;
    user.balance += winAmount;
  }

  res.json({ 
    winAmount, 
    newBalance: user.balance, 
    message: winAmount > 0 ? `Parabéns! Você ganhou R$ ${winAmount.toFixed(2)}` : 'Não foi dessa vez.' 
  });
});

// ==================== WALLET API ====================
app.post('/api/wallet/deposit', authenticateJWT, (req, res) => {
  const { amount } = req.body;
  const user = users.find(u => u.id === req.user.id);
  // Simulação de PIX
  const qrCode = "00020126360014BR.GOV.BCB.PIX0114wm-esporte013520400005303986540510.005802BR5913WM_ESPORTE0136009SAO_PAULO62070503***6304ABCD";
  res.json({ qrCode, amount });
});

app.get('/api/user/history', authenticateJWT, (req, res) => {
  const history = bets_history.filter(b => b.userId === req.user.id);
  res.json(history);
});

// ==================== IA API ====================
app.post('/api/ai/analyze', (req, res) => {
  const { eventId } = req.body;
  const event = sportsEvents.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Evento não encontrado.' });

  res.json({
    probabilities: { team1: 45, draw: 25, team2: 30 },
    confidence: 'Alta',
    tip: `Com base na forma recente do ${event.team1}, sugerimos aposta em Vitória ou Empate.`
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  W.M esporte013 (Betano Style) rodando em http://localhost:${PORT}\n`);
});
