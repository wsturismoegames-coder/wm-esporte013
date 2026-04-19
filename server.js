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
// Servir arquivos estáticos da pasta 'public' no mesmo diretório
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DADOS EM MEMÓRIA ====================
const users = [];
const transactions = [];
let siteConfig = { siteName: 'W.M esporte013', pixKey: 'sua_chave_pix_aqui', minDeposit: 10, maxWithdraw: 1000 };

const adminUser = { id: uuidv4(), phone: 'admin', password: bcrypt.hashSync('admin123', 8), isAdmin: true, balance: 0 };
users.push(adminUser);

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
  const newUser = { id: uuidv4(), phone, password: hashed, balance: 0, isAdmin: false };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, phone, isAdmin: false }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ message: 'Conta criada!', token });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone && !u.isAdmin);
  if (!user) return res.status(400).json({ message: 'Telefone ou senha inválidos.' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Telefone ou senha inválidos.' });
  const token = jwt.sign({ id: user.id, phone, isAdmin: false }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Login realizado!', token });
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

// ==================== CARTEIRA ====================
app.get('/api/wallet', authenticateJWT, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  res.json({ balance: user.balance });
});

app.post('/api/wallet/deposit', authenticateJWT, async (req, res) => {
  const { amount } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  if (!amount || amount < siteConfig.minDeposit) return res.status(400).json({ message: `Mínimo: R$ ${siteConfig.minDeposit}` });
  const pixData = `PIX:${siteConfig.pixKey}|R$${amount.toFixed(2)}|REF:${user.id.substring(0,8)}-${Date.now()}`;
  const qrCodeImage = await qrcode.toDataURL(pixData);
  user.balance += amount;
  transactions.push({ id: uuidv4(), userId: user.id, type: 'deposit', amount, date: new Date(), status: 'completed' });
  res.json({ message: 'Depósito realizado!', qrCode: qrCodeImage, newBalance: user.balance });
});

app.post('/api/wallet/withdraw', authenticateJWT, (req, res) => {
  const { amount } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  if (amount > user.balance) return res.status(400).json({ message: 'Saldo insuficiente.' });
  if (amount > siteConfig.maxWithdraw) return res.status(400).json({ message: `Máximo: R$ ${siteConfig.maxWithdraw}` });
  user.balance -= amount;
  transactions.push({ id: uuidv4(), userId: user.id, type: 'withdraw', amount, date: new Date(), status: 'pending' });
  res.json({ message: 'Saque solicitado!', newBalance: user.balance });
});

app.get('/api/wallet/history', authenticateJWT, (req, res) => {
  res.json(transactions.filter(t => t.userId === req.user.id).sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// ==================== CASSINO ====================
const casinoGames = [
  { id: 'slots', name: 'Slots Fortune', description: 'Gire os rolos e combine símbolos!' },
  { id: 'roulette', name: 'Roleta VIP', description: 'Aposte no número ou cor da sorte.' },
  { id: 'crash', name: 'Crash Rocket', description: 'Saque antes que o multiplicador caia!' },
  { id: 'mines', name: 'Campo Minado', description: 'Encontre estrelas, evite minas.' },
  { id: 'dice', name: 'Lucky Dice', description: 'Acima ou abaixo? Aposte no dado.' },
  { id: 'aviator', name: 'Aviator', description: 'Saque antes que o avião voe!' },
];

app.get('/api/casino/games', authenticateJWT, (req, res) => res.json(casinoGames));

app.post('/api/casino/play', authenticateJWT, (req, res) => {
  const { gameId, betAmount, selection } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
  if (!betAmount || betAmount <= 0) return res.status(400).json({ message: 'Aposta inválida.' });
  if (user.balance < betAmount) return res.status(400).json({ message: 'Saldo insuficiente!' });

  let result = {}, winAmount = 0, message = '';

  switch (gameId) {
    case 'slots': {
      const sym = ['🍒','🍋','🍊','🍇','🔔','⭐','💎','7️⃣'];
      const spin = [sym[Math.floor(Math.random()*sym.length)], sym[Math.floor(Math.random()*sym.length)], sym[Math.floor(Math.random()*sym.length)]];
      result = { spin };
      if (spin[0]===spin[1]&&spin[1]===spin[2]) { winAmount = betAmount*(spin[0]==='💎'?10:spin[0]==='7️⃣'?7:5); message = '🎉 JACKPOT!'; }
      else if (spin[0]===spin[1]||spin[1]===spin[2]||spin[0]===spin[2]) { winAmount = betAmount*2; message = '✨ Par! Ganhou!'; }
      else message = 'Tente novamente!';
      break;
    }
    case 'roulette': {
      const n = Math.floor(Math.random()*37);
      const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const isRed = reds.includes(n);
      result = { winningNumber: n, color: n===0?'green':isRed?'red':'black' };
      if (selection==='red'&&isRed) { winAmount=betAmount*2; message='🔴 Vermelho!'; }
      else if (selection==='black'&&!isRed&&n!==0) { winAmount=betAmount*2; message='⚫ Preto!'; }
      else if (selection==='even'&&n!==0&&n%2===0) { winAmount=betAmount*2; message='Par!'; }
      else if (selection==='odd'&&n%2!==0) { winAmount=betAmount*2; message='Ímpar!'; }
      else if (parseInt(selection)===n) { winAmount=betAmount*36; message=`🎯 Número ${n}!`; }
      else message=`Saiu ${n}. Tente novamente!`;
      break;
    }
    case 'crash': {
      const cp = parseFloat((Math.random()*10+1).toFixed(2));
      result = { crashPoint: cp };
      if (selection&&parseFloat(selection)<=cp) { winAmount=betAmount*parseFloat(selection); message=`🚀 Sacou em ${selection}x!`; }
      else message=`💥 Crash em ${cp}x!`;
      break;
    }
    case 'mines': {
      const grid = Array(25).fill('star');
      const mines = new Set();
      while(mines.size<5) mines.add(Math.floor(Math.random()*25));
      mines.forEach(p => grid[p]='mine');
      const cell = parseInt(selection);
      result = { grid, selectedCell: cell };
      if (grid[cell]==='mine') message='💣 Mina! Fim de jogo.';
      else { winAmount=betAmount*1.5; message='⭐ Estrela encontrada!'; }
      break;
    }
    case 'dice': {
      const d = Math.floor(Math.random()*6)+1;
      result = { diceResult: d };
      if ((selection==='above3'&&d>3)||(selection==='below4'&&d<4)) { winAmount=betAmount*2; message=`🎲 Dado: ${d}! Ganhou!`; }
      else message=`🎲 Dado: ${d}. Tente novamente!`;
      break;
    }
    case 'aviator': {
      const fp = parseFloat((Math.random()*10+1).toFixed(2));
      result = { flyPoint: fp };
      if (selection&&parseFloat(selection)<=fp) { winAmount=betAmount*parseFloat(selection); message=`✈️ Sacou em ${selection}x!`; }
      else message=`✈️ Voou em ${fp}x!`;
      break;
    }
    default: return res.status(400).json({ message: 'Jogo não encontrado.' });
  }

  user.balance -= betAmount;
  user.balance += winAmount;
  if (winAmount > 0) transactions.push({ id: uuidv4(), userId: user.id, type: 'casino_win', amount: winAmount, date: new Date(), status: 'completed' });

  res.json({ ...result, message, newBalance: user.balance, winAmount });
});

// ==================== ESPORTES ====================
const sportsEvents = [
  { id: 'fut-1', sport: 'Futebol', team1: 'Flamengo', team2: 'Palmeiras', odds: { team1Win: 2.10, draw: 3.20, team2Win: 3.00 }, date: '2026-04-20T19:00:00Z' },
  { id: 'fut-2', sport: 'Futebol', team1: 'Corinthians', team2: 'São Paulo', odds: { team1Win: 2.50, draw: 3.10, team2Win: 2.80 }, date: '2026-04-20T21:00:00Z' },
  { id: 'fut-3', sport: 'Futebol', team1: 'Real Madrid', team2: 'Barcelona', odds: { team1Win: 1.95, draw: 3.40, team2Win: 3.60 }, date: '2026-04-21T16:00:00Z' },
  { id: 'bask-1', sport: 'Basquete', team1: 'Lakers', team2: 'Celtics', odds: { team1Win: 1.80, team2Win: 2.50 }, date: '2026-04-20T22:00:00Z' },
  { id: 'ten-1', sport: 'Tênis', team1: 'Nadal', team2: 'Djokovic', odds: { team1Win: 1.90, team2Win: 2.00 }, date: '2026-04-21T14:00:00Z' },
];

app.get('/api/sports/events', authenticateJWT, (req, res) => res.json(sportsEvents));

app.post('/api/sports/bet', authenticateJWT, (req, res) => {
  const { eventId, betAmount, selection } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const event = sportsEvents.find(e => e.id === eventId);
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
  if (!event) return res.status(404).json({ message: 'Evento não encontrado.' });
  if (user.balance < betAmount) return res.status(400).json({ message: 'Saldo insuficiente.' });

  const outcomes = Object.keys(event.odds);
  const winner = outcomes[Math.floor(Math.random()*outcomes.length)];
  user.balance -= betAmount;
  let winAmount = 0, message = '';

  if (selection === winner) {
    winAmount = parseFloat((betAmount * event.odds[selection]).toFixed(2));
    user.balance += winAmount;
    message = `🎉 Ganhou R$ ${winAmount.toFixed(2)}!`;
    transactions.push({ id: uuidv4(), userId: user.id, type: 'sports_win', amount: winAmount, date: new Date(), status: 'completed' });
  } else {
    message = 'Que pena! Tente na próxima.';
  }

  res.json({ message, newBalance: user.balance, winAmount, winningOutcome: winner });
});

// ==================== IA ====================
app.post('/api/ai/analyze', authenticateJWT, (req, res) => {
  const { eventId } = req.body;
  const event = sportsEvents.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Evento não encontrado.' });

  const t1 = Math.random()*0.4+0.3;
  const dr = event.odds.draw ? Math.random()*0.2+0.1 : 0;
  const t2 = 1-t1-dr;

  const tips = [
    `Análise indica vantagem para ${event.team1}. Odd de ${event.odds.team1Win} oferece bom valor. Gestão de banca: máximo 5% do saldo.`,
    `Equilíbrio entre as equipes. Considere apostar no empate ou mercados alternativos.`,
    `${event.team2} em boa fase recente. Odd de ${event.odds.team2Win} com valor interessante.`,
    `Dados históricos favorecem ${event.team1}. Recomendamos cautela.`,
  ];

  res.json({
    probabilities: { team1Win: t1.toFixed(2), draw: dr > 0 ? dr.toFixed(2) : undefined, team2Win: t2.toFixed(2) },
    tip: tips[Math.floor(Math.random()*tips.length)],
    confidence: (Math.random()*30+60).toFixed(0)+'%',
    factors: ['Confrontos diretos', 'Forma recente', 'Mandante/Visitante', 'Lesões', 'Contexto do campeonato'],
  });
});

// ==================== ADMIN ====================
app.get('/api/admin/dashboard', authenticateJWT, authorizeAdmin, (req, res) => {
  const totalUsers = users.filter(u => !u.isAdmin).length;
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
  res.json({ totalUsers, totalDeposits, totalWithdrawals, totalProfit: totalDeposits - totalWithdrawals });
});

app.get('/api/admin/users', authenticateJWT, authorizeAdmin, (req, res) => {
  res.json(users.filter(u => !u.isAdmin).map(({ password, ...u }) => u));
});

app.get('/api/admin/config', authenticateJWT, authorizeAdmin, (req, res) => res.json(siteConfig));

app.put('/api/admin/config', authenticateJWT, authorizeAdmin, (req, res) => {
  const { siteName, pixKey, minDeposit, maxWithdraw } = req.body;
  if (siteName) siteConfig.siteName = siteName;
  if (pixKey) siteConfig.pixKey = pixKey;
  if (minDeposit) siteConfig.minDeposit = parseFloat(minDeposit);
  if (maxWithdraw) siteConfig.maxWithdraw = parseFloat(maxWithdraw);
  res.json({ message: 'Configurações salvas!', siteConfig });
});

// ==================== CATCH-ALL ====================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  W.M esporte013 rodando em http://localhost:${PORT}\n  Admin: admin / admin123\n`);
});
