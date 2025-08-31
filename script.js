// --- State ---
let board = Array(9).fill(null); // null | 'X' | 'O'
let current = 'X';
let active = true;
let mode = 'HUMAN'; // 'HUMAN' | 'AI'
const scores = { X: 0, O: 0, T: 0 };

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const modeHumanBtn = document.getElementById('modeHuman');
const modeAIBtn = document.getElementById('modeAI');
const newRoundBtn = document.getElementById('newRound');
const resetAllBtn = document.getElementById('resetAll');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTEl = document.getElementById('scoreT');
const cells = [...document.querySelectorAll('.cell')];

const wins = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

// --- Helpers ---
function setStatus(text, pill = null){
  if(pill === 'X') statusEl.innerHTML = `Player <span class="pill x">X</span> to move`;
  else if(pill === 'O') statusEl.innerHTML = `Player <span class="pill o">O</span> to move`;
  else statusEl.textContent = text;
}

function render(){
  board.forEach((v,i)=>{
    const c = cells[i];
    c.textContent = v ? v : '';
    c.classList.toggle('x', v === 'X');
    c.classList.toggle('o', v === 'O');
    c.disabled = !!v || !active || (mode==='AI' && current==='O'); // lock while AI plays
    c.classList.remove('win');
  });
  if(active) setStatus('', current);
}

function winner(b = board){
  for(const line of wins){
    const [a,bI,c] = line;
    if(b[a] && b[a]===b[bI] && b[a]===b[c]) return {player: b[a], line};
  }
  if(b.every(Boolean)) return {player: 'T', line: null}; // tie
  return null;
}

function updateScores(result){
  if(!result) return;
  if(result.player === 'X') scores.X++;
  else if(result.player === 'O') scores.O++;
  else scores.T++;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreTEl.textContent = scores.T;
}

function highlight(line){
  if(!line) return;
  line.forEach(i => cells[i].classList.add('win'));
}

// --- Interactions ---
boardEl.addEventListener('click', (e)=>{
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const i = +cell.dataset.i;
  if(!active || board[i]) return;

  move(i, current);

  const res = winner();
  if(res){
    endRound(res);
  } else {
    switchTurn();
    if(mode==='AI' && current==='O') aiTurn();
  }
});

modeHumanBtn.addEventListener('click', ()=>{
  mode='HUMAN';
  modeHumanBtn.classList.add('active');
  modeAIBtn.classList.remove('active');
  newRound(true);
});
modeAIBtn.addEventListener('click', ()=>{
  mode='AI';
  modeAIBtn.classList.add('active');
  modeHumanBtn.classList.remove('active');
  newRound(true);
});

newRoundBtn.addEventListener('click', ()=> newRound());
resetAllBtn.addEventListener('click', ()=> { scores.X=scores.O=scores.T=0; scoreXEl.textContent=0; scoreOEl.textContent=0; scoreTEl.textContent=0; newRound(true); });

// --- Core ---
function move(i, p){
  board[i] = p;
  render();
}

function switchTurn(){
  current = current === 'X' ? 'O' : 'X';
  setStatus('', current);
}

function endRound(res){
  active = false;
  render();
  if(res.player === 'T'){
    setStatus('Tie game. Nice try!');
  } else {
    setStatus(`${res.player} wins!`);
    highlight(res.line);
  }
  updateScores(res);
}

function newRound(resetStarting=false){
  board = Array(9).fill(null);
  active = true;
  current = resetStarting ? 'X' : (current || 'X');
  render();
  if(mode==='AI' && current==='O'){ // if somehow O starts (rare), let AI move
    aiTurn();
  }
}

// --- AI (Minimax, perfect play as 'O') ---
function aiTurn(){
  // slight delay for UX
  setTimeout(()=>{
    const best = bestMove(board, 'O');
    move(best.index, 'O');
    const res = winner();
    if(res){ endRound(res); }
    else { switchTurn(); }
  }, 350);
}

function bestMove(b, ai){
  let bestScore = -Infinity, moveIndex = null;
  for(let i=0;i<9;i++){
    if(!b[i]){
      b[i] = ai;
      const score = minimax(b, 0, false);
      b[i] = null;
      if(score > bestScore){
        bestScore = score; moveIndex = i;
      }
    }
  }
  return { index: moveIndex, score: bestScore };
}

const scoreMap = { 'O': 10, 'X': -10, 'T': 0 };
function minimax(b, depth, isMax){
  const res = winner(b);
  if(res) return scoreMap[res.player] - depth * Math.sign(scoreMap[res.player]||1);
  if(isMax){
    let best = -Infinity;
    for(let i=0;i<9;i++){
      if(!b[i]){
        b[i]='O';
        best = Math.max(best, minimax(b, depth+1, false));
        b[i]=null;
      }
    }
    return best;
  }else{
    let best = Infinity;
    for(let i=0;i<9;i++){
      if(!b[i]){
        b[i]='X';
        best = Math.min(best, minimax(b, depth+1, true));
        b[i]=null;
      }
    }
    return best;
  }
}

// Init
render();
