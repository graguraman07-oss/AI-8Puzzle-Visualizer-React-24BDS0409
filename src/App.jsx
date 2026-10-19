import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Clock3, GitBranch, Play, Pause, RotateCcw, Shuffle, StepForward, StepBack, Target, Waypoints, Zap } from 'lucide-react'

const EXAMPLE_START = [2, 8, 3, 1, 6, 4, 7, 0, 5]
const EXAMPLE_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5]
const keyOf = s => s.join('')
const fmt = s => s.map(n => n === 0 ? '·' : n).join(' ')
const inversions = s => {
  const a = s.filter(n => n !== 0); let count = 0
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) count++
  return count
}
const validBoard = s => s.length === 9 && s.every(n => Number.isInteger(n) && n >= 0 && n <= 8) && new Set(s).size === 9
const solvable = (a, b) => inversions(a) % 2 === inversions(b) % 2

function neighbors(state) {
  const z = state.indexOf(0), r = Math.floor(z / 3), c = z % 3
  const positions = []
  if (r > 0) positions.push(z - 3)
  if (r < 2) positions.push(z + 3)
  if (c > 0) positions.push(z - 1)
  if (c < 2) positions.push(z + 1)
  return positions.map(i => {
    const next = state.slice()
    ;[next[z], next[i]] = [next[i], next[z]]
    return next
  })
}

// Min-heap priority queue ordered by accumulated path cost.
class MinHeap {
  constructor() { this.items = [] }
  get size() { return this.items.length }
  push(item) {
    this.items.push(item); let i = this.items.length - 1
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.items[p].cost <= item.cost) break
      this.items[i] = this.items[p]; i = p
    }
    this.items[i] = item
  }
  pop() {
    if (!this.items.length) return null
    const root = this.items[0], end = this.items.pop()
    if (this.items.length) {
      let i = 0
      while (true) {
        const l = 2 * i + 1, r = l + 1
        if (l >= this.items.length) break
        const c = r < this.items.length && this.items[r].cost < this.items[l].cost ? r : l
        if (this.items[c].cost >= end.cost) break
        this.items[i] = this.items[c]; i = c
      }
      this.items[i] = end
    }
    return root
  }
  snapshot() {
    return this.items.slice().sort((a, b) => a.cost - b.cost).slice(0, 16).map(n => `${fmt(n.state)} (g=${n.cost})`)
  }
}

function uniformCostSearch(start, goal) {
  const started = performance.now(), goalKey = keyOf(goal)
  const frontier = new MinHeap(), bestCost = new Map(), parent = new Map(), closed = new Set(), trace = []
  let generated = 1, expanded = 0, maxDepth = 0, seq = 0, found = false, peakStates = 1
  frontier.push({ state: start.slice(), cost: 0, seq: seq++ })
  bestCost.set(keyOf(start), 0); parent.set(keyOf(start), null)
  while (frontier.size) {
    const node = frontier.pop(), key = keyOf(node.state)
    if (node.cost !== bestCost.get(key) || closed.has(key)) continue
    // Include every valid node removed from the frontier, including the goal node.
    maxDepth = Math.max(maxDepth, node.cost)
    if (key === goalKey) {
      found = true
      trace.push({ state: node.state, parent: parent.get(key), cost: node.cost, generated, expanded, depth: node.cost, frontier: frontier.snapshot(), closed: [...closed].slice(-16) })
      break
    }
    closed.add(key); expanded++
    for (const next of neighbors(node.state)) {
      const nk = keyOf(next), cost = node.cost + 1
      if (!bestCost.has(nk) || cost < bestCost.get(nk)) {
        bestCost.set(nk, cost); parent.set(nk, key); frontier.push({ state: next, cost, seq: seq++ }); generated++
      }
    }
    peakStates = Math.max(peakStates, frontier.size + closed.size)
    trace.push({ state: node.state, parent: parent.get(key), cost: node.cost, generated, expanded, depth: node.cost, frontier: frontier.snapshot(), closed: [...closed].slice(-16) })
  }
  const path = []
  if (found) {
    let k = goalKey
    while (k !== null && k !== undefined) { path.push(k); k = parent.get(k) }
    path.reverse()
  }
  return { found, path, trace, generated, expanded, maxDepth, elapsed: performance.now() - started, memoryKB: Math.round(peakStates * 96 / 1024 * 10) / 10 }
}

function Board({ state, goal = false, small = false, previous = null }) {
  return <div className={`board ${small ? 'board-small' : ''} ${goal ? 'board-goal' : ''}`}>
    {state.map((n, i) => <div key={i} className={`tile ${n === 0 ? 'blank' : ''} ${previous && previous[i] !== n ? 'moved' : ''}`}>{n || ''}</div>)}
  </div>
}

function BoardEditor({ title, values, onChange }) {
  return <div className="editor-card">
    <div className="editor-heading"><h3>{title}</h3><span>0 = blank</span></div>
    <div className="edit-grid">{values.map((n, i) => <input aria-label={`${title} tile ${i + 1}`} key={i} type="number" min="0" max="8" value={n} onChange={e => onChange(values.map((v, j) => i === j ? (e.target.value === '' ? '' : Number(e.target.value)) : v))} />)}</div>
  </div>
}

export default function App() {
  const [start, setStart] = useState(EXAMPLE_START)
  const [goal, setGoal] = useState(EXAMPLE_GOAL)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)
  const [speed, setSpeed] = useState(3)
  const [message, setMessage] = useState('Set your puzzle, then run Uniform Cost Search.')
  const [messageType, setMessageType] = useState('info')
  const [playing, setPlaying] = useState(false)
  const [runId, setRunId] = useState(0)

  const frame = result?.trace[Math.min(step, result.trace.length - 1)]
  const current = frame?.state || start
  const pathStates = useMemo(() => result?.found ? result.path.map(k => k.split('').map(Number)) : [], [result])
  const notify = (text, type = 'info') => { setMessage(text); setMessageType(type) }

  function solve() {
    setPlaying(false)
    if (!validBoard(start) || !validBoard(goal)) { notify('Each board must contain the numbers 0–8 exactly once. Use 0 for the blank.', 'error'); return }
    if (!solvable(start, goal)) { notify('This initial board cannot reach the selected goal. The inversion parity must match.', 'error'); return }
    const r = uniformCostSearch(start, goal)
    setResult(r); setStep(0); setRunId(x => x + 1)
    notify(r.found ? `Solution found: ${r.path.length - 1} moves. Replay the search or step through it below.` : 'No solution found.', r.found ? 'success' : 'error')
  }

  function randomize() {
    let s
    do {
      s = [0,1,2,3,4,5,6,7,8]
      for (let i = 8; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]] }
    } while (!solvable(s, goal) || s.every((n, i) => n === goal[i]))
    setStart(s); setResult(null); setStep(0); setPlaying(false)
    notify('A random solvable puzzle was generated. Click Run UCS to solve it.')
  }

  function reset() { setPlaying(false); setStep(0); notify('Playback reset to the first recorded state.') }

  useEffect(() => {
    if (!playing || !result) return undefined
    if (step >= result.trace.length - 1) { setPlaying(false); return undefined }
    const delay = [1000, 650, 400, 220, 90][speed - 1]
    const id = window.setTimeout(() => setStep(s => s + 1), delay)
    return () => window.clearTimeout(id)
  }, [playing, step, speed, result, runId])

  const setStartSafe = s => { setStart(s); setResult(null); setStep(0) }
  const setGoalSafe = s => { setGoal(s); setResult(null); setStep(0) }

  return <div>
    <nav className="nav"><div className="nav-inner"><a href="#home" className="brand"><span className="brand-icon">◈</span> 8-Puzzle <span>AI LAB</span></a><div className="nav-links"><a href="#solver">Solver</a><a href="#process">Search process</a><a href="#about">About UCS</a></div></div></nav>
    <header id="home" className="hero"><div className="hero-glow" /><div className="hero-inner">
      <div className="kicker"><span className="kicker-dot" /> ARTIFICIAL INTELLIGENCE</div>
      <h1>Make every move<br /><em>count.</em></h1>
      <p className="hero-copy">The 8-Puzzle is a sliding-tile problem played on a 3×3 grid with eight numbered tiles and one blank space. The goal is to move tiles into the target arrangement, sliding one tile into the blank space at a time. Explore how Uniform Cost Search finds a minimum-cost solution.</p>
      <div className="student-info homepage-details"><div><span>COURSE NAME</span><strong>Artificial Intelligence</strong></div><div><span>ASSIGNMENT TITLE</span><strong>Interactive 8-Puzzle Problem Solver</strong></div><div><span>STUDENT NAME</span><strong>Raguraman Govindasamy</strong></div><div><span>REGISTRATION NUMBER</span><strong>24BDS0409</strong></div></div>
      <a href="#solver" className="hero-cta">Explore the solver <ArrowRight size={17}/></a>
    </div><div className="hero-art" aria-hidden="true"><div className="art-label">STATE SPACE / 01</div><div className="art-board">{[2,8,3,1,6,4,7,0,5].map((n,i)=><div key={i} className={n===0?'art-blank':''}>{n||''}</div>)}</div><div className="art-path"><span>START</span><i/><span>GOAL</span></div></div></header>

    <main className="main">
      <section id="solver" className="section-card solver-section">
        <div className="section-top"><div><h2>Puzzle workspace</h2><p>Set the initial and goal states, or generate a random solvable puzzle.</p></div></div>
        <div className="workspace">
          <div className="config-column">
            <div className="input-method-heading"><h3>Enter the puzzle</h3><p>Enter each number from 0 to 8 once. Use 0 for the blank tile.</p></div>
            <BoardEditor title="Initial State" values={start} onChange={setStartSafe}/>
            <BoardEditor title="Goal State" values={goal} onChange={setGoalSafe}/>
            <div className="example-states"><strong>Example</strong><div><span>Initial State</span><code>2 8 3<br/>1 6 4<br/>7 _ 5</code></div><div><span>Goal State</span><code>1 2 3<br/>8 _ 4<br/>7 6 5</code></div><button className="button ghost" onClick={() => {setStartSafe(EXAMPLE_START);setGoalSafe(EXAMPLE_GOAL);notify('Example puzzle loaded.')}}>Load example</button></div>
            <div className="random-method"><h3>Generate a random solvable puzzle</h3><p>Create a random initial state that can reach the selected goal state.</p><button className="button secondary" onClick={randomize}><Shuffle size={15}/> Generate Random Puzzle</button></div>
            <div className="speed-control"><label htmlFor="speed">Animation speed <b>{['Very slow','Slow','Medium','Fast','Very fast'][speed-1]}</b></label><input id="speed" type="range" min="1" max="5" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></div>
            <button className="button primary solve-button" onClick={solve}><Waypoints size={17}/> Run Uniform Cost Search <ArrowRight size={16}/></button>
            <div className={`notice ${messageType}`} role="status">{message}</div>
          </div>
          <div className="visual-column">
            <div className="current-heading"><div><span className="section-index">LIVE VISUALIZATION</span><h3>Current state <small>· Step {result ? step : 0}{result ? ` / ${Math.max(0,result.trace.length-1)}` : ''}</small></h3></div><span className={`state-tag ${playing?'active':''}`}>{playing?'Playing':result&&step===result.trace.length-1?'Complete':'Ready'}</span></div>
            <Board state={current} previous={step>0 && result ? result.trace[step-1].state : null}/>
            <div className="playback">
              <button className="button primary small" onClick={()=>{if(!result)solve();else if(step>=result.trace.length-1)setStep(0);setPlaying(true)}}><Play size={15}/> Run</button>
              <button className="icon-button" aria-label="Pause" onClick={()=>setPlaying(false)}><Pause size={16}/></button>
              <button className="icon-button" aria-label="Previous step" onClick={()=>{setPlaying(false);setStep(s=>Math.max(0,s-1))}}><StepBack size={16}/></button>
              <button className="icon-button" aria-label="Next step" onClick={()=>{setPlaying(false);setStep(s=>Math.min(result?result.trace.length-1:0,s+1))}}><StepForward size={16}/></button>
              <button className="icon-button" aria-label="Reset playback" onClick={reset}><RotateCcw size={16}/></button>
              <div className="progress-label">{result ? `${Math.round(step/Math.max(1,result.trace.length-1)*100)}%` : '0%'}</div>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{width:`${result ? step/Math.max(1,result.trace.length-1)*100 : 0}%`}}/></div>
            <div className="stats">
              <div className="stat-card"><span><Target size={14}/> MOVES / PATH COST</span><strong>{result?.found ? result.path.length-1 : '—'}</strong></div>
              <div className="stat-card"><span><GitBranch size={14}/> NODES GENERATED</span><strong>{frame?.generated ?? 0}</strong></div>
              <div className="stat-card"><span><Activity size={14}/> NODES EXPANDED</span><strong>{frame?.expanded ?? 0}</strong></div>
              <div className="stat-card"><span><Waypoints size={14}/> SEARCH DEPTH</span><strong>{frame?.depth ?? 0}</strong></div>
              <div className="stat-card"><span><GitBranch size={14}/> MAX SEARCH DEPTH</span><strong>{result ? result.maxDepth : '—'}</strong></div>
              <div className="stat-card"><span><Clock3 size={14}/> EXECUTION TIME</span><strong>{result ? `${result.elapsed.toFixed(2)} ms` : '—'}</strong></div>
              <div className="stat-card"><span><CircleHelp size={14}/> APPROX. MEMORY</span><strong>{result ? `~${result.memoryKB} KB` : '—'}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="section-card process-section">
        <div className="section-top"><div><h2>Inside the search</h2><p>Inspect the selected node, frontier and explored states.</p></div></div>
        <div className="process-grid">
          <div className="process-card"><div className="process-title"><span className="mini-icon"><Target size={15}/></span><h3>Node being expanded</h3></div><code>{frame ? fmt(frame.state) : 'Run the search to begin'}</code><p>Parent node: <code>{frame?.parent ? fmt(frame.parent.split('').map(Number)) : 'None'}</code></p><p>Path cost g(n): <b>{frame?.cost ?? 0}</b></p></div>
          <div className="process-card"><div className="process-title"><span className="mini-icon"><GitBranch size={15}/></span><h3>Frontier / Open list</h3></div><div className="state-list">{frame?.frontier?.length ? frame.frontier.map((s,i)=><div key={i}>{s}</div>) : 'The frontier is empty or not yet initialized.'}</div></div>
          <div className="process-card"><div className="process-title"><span className="mini-icon"><CheckCircle2 size={15}/></span><h3>Explored / Closed list</h3></div><div className="state-list">{frame?.closed?.length ? frame.closed.map((s,i)=><div key={i}>{fmt(s.split('').map(Number))}</div>) : 'No explored states yet.'}</div></div>
        </div>
      </section>

      {result && <section id="solution-summary" className="section-card summary-section">
        <div className="section-top">
          <div><span className="section-index">03 / RESULTS</span><h2>Solution Summary</h2><p>Final results from the Uniform Cost Search run.</p></div>
          <span className={`summary-status ${result.found ? 'found' : 'not-found'}`}>{result.found ? 'Solution Found' : 'Solution Not Found'}</span>
        </div>
        <div className="summary-grid">
          <div className="summary-item"><span>SOLUTION STATUS</span><strong>{result.found ? 'Found' : 'Not Found'}</strong></div>
          <div className="summary-item"><span>TOTAL NUMBER OF MOVES</span><strong>{result.found ? result.path.length - 1 : '—'}</strong></div>
          <div className="summary-item"><span>TOTAL NODES GENERATED</span><strong>{result.generated}</strong></div>
          <div className="summary-item"><span>TOTAL NODES EXPANDED</span><strong>{result.expanded}</strong></div>
          <div className="summary-item"><span>MAXIMUM SEARCH DEPTH</span><strong>{result.maxDepth}</strong></div>
          <div className="summary-item"><span>EXECUTION TIME</span><strong>{result.elapsed.toFixed(2)} ms</strong></div>
          <div className="summary-item"><span>PATH COST</span><strong>{result.found ? result.path.length - 1 : '—'}</strong></div>
          <div className="summary-item"><span>MEMORY USAGE (APPROX.)</span><strong>~{result.memoryKB} KB</strong></div>
        </div>
        <p className="summary-footnote">Memory usage is an estimate; actual browser memory consumption may differ.</p>
      </section>}

      <section id="about" className="about-section"><div className="about-heading"><h2>Uniform Cost Search</h2></div>
        <div className="about-grid">
          <article className="about-card"><span className="about-number">01</span><h3>How it works</h3><ol><li>Initialize a priority queue with the start state at cost 0.</li><li>Remove the state with the lowest accumulated path cost.</li><li>Check whether it matches the goal state.</li><li>Generate legal blank-tile moves and record cheaper paths.</li><li>Continue until the goal is removed from the frontier or no states remain.</li></ol></article>
          <article className="about-card"><span className="about-number">02</span><h3>Key properties</h3><dl><dt>Completeness</dt><dd>Complete when step costs are positive and bounded away from zero.</dd><dt>Optimality</dt><dd>Finds a minimum-cost solution for non-negative step costs.</dd><dt>Time complexity</dt><dd>Often expressed as O(b<sup>1+⌊C*/ε⌋</sup>), where C* is optimal solution cost and ε is the minimum step cost.</dd><dt>Space complexity</dt><dd>Can be exponential; stores frontier and explored states.</dd></dl></article>
          <article className="about-card"><span className="about-number">03</span><h3>In this project</h3><p>Each legal tile move costs 1. The priority queue orders states by g(n), the total cost from the start. Therefore, for this puzzle, path cost equals the number of moves.</p><div className="formula">f(n) = g(n)</div><p className="small-note">Memory is an estimate, not an exact browser heap measurement. Runtime varies by device and browser.</p></article>
        </div>
      </section>
    </main>
    <footer><div className="footer-inner"><div className="brand"><span className="brand-icon">◈</span> 8-Puzzle <span>AI LAB</span></div><p>Explore the state space, one move at a time.</p></div></footer>
  </div>
}