// StarkFlow — Interactive UI Demo
// This file is the live preview artifact.
// The actual Starkzap-integrated source lives in src/

import { useState, useEffect, useRef } from "react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
`;

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #08080A; color: #E8E8EC; font-family: 'Sora', sans-serif; }
  :root {
    --bg:       #08080A;
    --surface:  #111116;
    --border:   #1E1E26;
    --border2:  #2A2A35;
    --green:    #00E87A;
    --green-dim:#00E87A28;
    --gold:     #F5C842;
    --gold-dim: #F5C84220;
    --red:      #FF4D6A;
    --red-dim:  #FF4D6A20;
    --blue:     #4D8EFF;
    --blue-dim: #4D8EFF20;
    --purple:   #A855F7;
    --muted:    #5A5A72;
    --text2:    #9898B0;
    --mono:     'Space Mono', monospace;
  }
  .app { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar {
    width: 220px; min-width: 220px; background: var(--surface);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    padding: 0; overflow: hidden; position: relative;
  }
  .sidebar::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
  }
  .logo-wrap {
    padding: 24px 20px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .logo-icon {
    width: 32px; height: 32px; background: var(--green); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #000; font-family: var(--mono);
  }
  .logo-text { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
  .logo-text span { color: var(--green); }
  .logo-sub { font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 1px; }

  .nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 8px; cursor: pointer; transition: all 0.15s;
    font-size: 13.5px; font-weight: 500; color: var(--text2);
    border: 1px solid transparent;
  }
  .nav-item:hover { background: #1A1A22; color: #E8E8EC; }
  .nav-item.active {
    background: var(--green-dim); color: var(--green);
    border-color: #00E87A30;
  }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; }
  .nav-badge {
    margin-left: auto; background: var(--green); color: #000;
    font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 99px;
    font-family: var(--mono);
  }

  .wallet-card {
    margin: 12px; padding: 14px; background: #0D0D12;
    border: 1px solid var(--border); border-radius: 10px;
  }
  .wallet-label { font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .wallet-addr {
    font-family: var(--mono); font-size: 11px; color: var(--text2);
    background: var(--border); padding: 6px 8px; border-radius: 6px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .wallet-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); margin-right: 6px; box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  .network-tag {
    font-size: 9px; color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase; margin-top: 8px; text-align: right;
  }

  /* Main */
  .main { flex: 1; overflow-y: auto; background: var(--bg); }
  .main::-webkit-scrollbar { width: 4px; }
  .main::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .topbar {
    padding: 20px 32px 0; display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 28px;
  }
  .page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .page-sub { font-size: 13px; color: var(--text2); margin-top: 2px; }
  .gasless-chip {
    display: flex; align-items: center; gap: 6px;
    background: var(--green-dim); border: 1px solid #00E87A30;
    color: var(--green); font-size: 11px; font-weight: 600;
    padding: 6px 12px; border-radius: 99px; letter-spacing: 0.3px;
  }

  .content { padding: 0 32px 32px; }

  .portfolio-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 18px 20px; position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  }
  .stat-card.green::after { background: linear-gradient(90deg, transparent, var(--green), transparent); }
  .stat-card.gold::after  { background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .stat-card.blue::after  { background: linear-gradient(90deg, transparent, var(--blue), transparent); }
  .stat-card.purple::after { background: linear-gradient(90deg, transparent, var(--purple), transparent); }
  .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 10px; }
  .stat-value { font-family: var(--mono); font-size: 22px; font-weight: 700; letter-spacing: -1px; }
  .stat-value.green  { color: var(--green); }
  .stat-value.gold   { color: var(--gold); }
  .stat-value.blue   { color: var(--blue); }
  .stat-value.purple { color: var(--purple); }
  .stat-change { font-size: 11px; margin-top: 6px; color: var(--text2); display: flex; align-items: center; gap: 4px; }
  .stat-change.up { color: var(--green); }

  .panels { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }
  .panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
  }
  .panel-head {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title { font-size: 13px; font-weight: 600; letter-spacing: 0.2px; display: flex; align-items: center; gap: 8px; }
  .panel-tag {
    font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .tag-green { background: var(--green-dim); color: var(--green); border: 1px solid #00E87A30; }
  .tag-gold  { background: var(--gold-dim);  color: var(--gold);  border: 1px solid #F5C84230; }
  .tag-blue  { background: var(--blue-dim);  color: var(--blue);  border: 1px solid #4D8EFF30; }
  .tag-purple{ background: #A855F720; color: var(--purple); border: 1px solid #A855F730; }

  .pos-list { padding: 8px 0; }
  .pos-row {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 22px; border-bottom: 1px solid #14141A;
    transition: background 0.1s; cursor: pointer;
  }
  .pos-row:last-child { border-bottom: none; }
  .pos-row:hover { background: #13131A; }
  .pos-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .pos-info { flex: 1; }
  .pos-name { font-size: 13.5px; font-weight: 600; }
  .pos-sub  { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .pos-right { text-align: right; }
  .pos-val  { font-family: var(--mono); font-size: 14px; font-weight: 700; }
  .pos-apy  { font-size: 11px; margin-top: 2px; }
  .pos-apy.green { color: var(--green); }
  .pos-apy.gold  { color: var(--gold);  }

  .prog-wrap { margin: 6px 0 2px; }
  .prog-bar  { height: 3px; background: var(--border2); border-radius: 99px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 8px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; border: none; transition: all 0.15s;
    font-family: 'Sora', sans-serif; letter-spacing: 0.2px;
  }
  .btn-primary { background: var(--green); color: #000; }
  .btn-primary:hover { background: #00FF87; transform: translateY(-1px); box-shadow: 0 4px 20px var(--green-dim); }
  .btn-primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { border-color: var(--border2); color: #E8E8EC; background: #1A1A22; }
  .btn-sm { padding: 6px 12px; font-size: 11.5px; }

  .right-col { display: flex; flex-direction: column; gap: 20px; }

  .activity-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 22px; border-bottom: 1px solid #14141A;
  }
  .activity-item:last-child { border-bottom: none; }
  .act-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .act-text { flex: 1; font-size: 12px; line-height: 1.5; }
  .act-time { font-family: var(--mono); font-size: 10px; color: var(--muted); }

  .dca-item { padding: 14px 22px; border-bottom: 1px solid #14141A; }
  .dca-item:last-child { border-bottom: none; }
  .dca-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .dca-token { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .dca-amount { font-family: var(--mono); font-size: 12px; color: var(--text2); }
  .dca-next { font-size: 11px; color: var(--muted); }

  .action-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); }
  .action-tab {
    flex: 1; padding: 13px 16px; text-align: center; cursor: pointer;
    font-size: 12.5px; font-weight: 500; color: var(--muted); transition: all 0.15s;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
  }
  .action-tab.active { color: var(--green); border-bottom-color: var(--green); }
  .action-tab:hover:not(.active) { color: #E8E8EC; }

  .input-wrap { padding: 18px 22px; }
  .input-label { font-size: 11px; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px; }
  .input-field {
    width: 100%; background: #0D0D12; border: 1px solid var(--border2);
    border-radius: 8px; padding: 12px 14px; color: #E8E8EC;
    font-family: var(--mono); font-size: 15px; font-weight: 700;
    outline: none; transition: border-color 0.15s;
    display: flex; align-items: center; justify-content: space-between;
  }
  .input-inner { background: none; border: none; outline: none; color: inherit; font: inherit; width: 100%; }
  .input-token { font-size: 12px; color: var(--text2); font-weight: 600; white-space: nowrap; }
  .input-sub { font-size: 11px; color: var(--muted); margin-top: 6px; display: flex; justify-content: space-between; }
  .input-max { color: var(--green); cursor: pointer; font-weight: 600; }

  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 22px; font-size: 12.5px; }
  .info-key { color: var(--text2); }
  .info-val { font-family: var(--mono); font-weight: 600; }
  .info-val.green { color: var(--green); }
  .info-val.gold  { color: var(--gold);  }

  .toast-container { position: fixed; bottom: 28px; right: 28px; display: flex; flex-direction: column; gap: 10px; z-index: 999; }
  .toast {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 10px; padding: 14px 18px; min-width: 300px;
    display: flex; align-items: flex-start; gap: 12px;
    box-shadow: 0 8px 32px #00000080;
    animation: slideIn 0.3s ease; font-size: 13px;
  }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:none;opacity:1} }
  .toast-icon { font-size: 20px; flex-shrink: 0; }
  .toast-title { font-weight: 600; margin-bottom: 3px; }
  .toast-msg { color: var(--text2); font-size: 12px; }
  .toast-hash { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 4px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.7s linear infinite; display: inline-block; }

  .private-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: #A855F720; border: 1px solid #A855F730;
    color: var(--purple); font-size: 10px; font-weight: 600;
    padding: 3px 8px; border-radius: 99px; letter-spacing: 0.5px;
  }
  .orb {
    position: fixed; border-radius: 50%; filter: blur(100px);
    pointer-events: none; z-index: 0; opacity: 0.035;
  }
  .orb1 { width: 500px; height: 500px; background: var(--green); top: -150px; right: 50px; }
  .orb2 { width: 350px; height: 350px; background: var(--purple); bottom: -100px; right: 350px; }
`;

const positions = [
  { icon: "₿", bg: "#F7931A1A", color: "#F7931A", name: "Bitcoin (wBTC)", type: "Native Stake · wallet.stake(StakingPool.BTC)", value: "$4,280.00", apy: "+5.2% APY", apyColor: "green", prog: 68 },
  { icon: "⚡", bg: "#00E87A1A", color: "#00E87A", name: "STRK", type: "Native Stake · wallet.stake(StakingPool.STRK)", value: "$1,940.00", apy: "+8.7% APY", apyColor: "green", prog: 45 },
  { icon: "💵", bg: "#4D8EFF1A", color: "#4D8EFF", name: "USDC", type: "Vesu Lending · wallet.vesu.supply()", value: "$2,500.00", apy: "+6.1% APY", apyColor: "gold", prog: 82 },
  { icon: "🔒", bg: "#A855F71A", color: "#A855F7", name: "Private STRK", type: "Tongo Shield · wallet.confidential.send()", value: "● ● ●", apy: "Confidential", apyColor: "gold", prog: 0, private: true },
];

const activity = [
  { color: "#00E87A", text: "Staked 0.05 BTC → 5.2% APY pool", time: "2m ago" },
  { color: "#F5C842", text: "Vesu: Supplied 2,500 USDC, earning 6.1%", time: "1h ago" },
  { color: "#4D8EFF", text: "DCA executed: Bought 12 STRK @ $1.62", time: "6h ago" },
  { color: "#A855F7", text: "Private transfer sent via Tongo ZK shield", time: "1d ago" },
  { color: "#00E87A", text: "Staking rewards claimed: +4.2 STRK", time: "2d ago" },
];

const dcaSchedules = [
  { icon: "⚡", token: "STRK", amount: "$20 weekly", next: "Next: Friday", prog: 60 },
  { icon: "₿", token: "wBTC", amount: "$50 monthly", next: "Next: Apr 15", prog: 20 },
];

const NAV = [
  { icon: "◈", label: "Dashboard", id: "dashboard" },
  { icon: "◆", label: "Stake", id: "stake" },
  { icon: "◉", label: "Lend", id: "lend" },
  { icon: "↻", label: "DCA", id: "dca", badge: "2" },
  { icon: "⊛", label: "Private Send", id: "transfer" },
];

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t, i) => (
        <div key={i} className="toast">
          <div className="toast-icon">{t.icon}</div>
          <div>
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.msg}</div>
            {t.hash && <div className="toast-hash">tx: {t.hash}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardView({ onAction }) {
  return (
    <>
      <div className="portfolio-strip">
        {[
          { label: "Total Value", value: "$8,760", color: "green", change: "+$142 today", up: true },
          { label: "Est. Annual Yield", value: "$682", color: "gold", change: "6.8% blended APY", up: true },
          { label: "STRK Staked", value: "1,200", color: "blue", change: "Active rewards", up: true },
          { label: "Private Balance", value: "●●●", color: "purple", change: "Tongo shielded" },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
            <div className={`stat-change ${s.up ? "up" : ""}`}>{s.up ? "↑" : "→"} {s.change}</div>
          </div>
        ))}
      </div>

      <div className="panels">
        <div>
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-head">
              <div className="panel-title">◈ Active Positions <span className="panel-tag tag-green">4 earning</span></div>
              <button className="btn btn-ghost btn-sm" onClick={() => onAction("stake")}>+ New Position</button>
            </div>
            <div className="pos-list">
              {positions.map((p, i) => (
                <div key={i} className="pos-row">
                  <div className="pos-icon" style={{ background: p.bg }}>{p.icon}</div>
                  <div className="pos-info">
                    <div className="pos-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.name}
                      {p.private && <span className="private-badge">🔒 ZK</span>}
                    </div>
                    <div className="pos-sub">{p.type}</div>
                    {p.prog > 0 && (
                      <div className="prog-wrap"><div className="prog-bar" style={{ width: 100 }}>
                        <div className="prog-fill" style={{ width: `${p.prog}%`, background: p.color }} />
                      </div></div>
                    )}
                  </div>
                  <div className="pos-right">
                    <div className="pos-val" style={{ color: p.private ? "var(--purple)" : "inherit" }}>{p.value}</div>
                    <div className={`pos-apy ${p.apyColor}`}>{p.apy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">↻ DCA Schedules <span className="panel-tag tag-blue">wallet.dca.create()</span></div>
              <button className="btn btn-ghost btn-sm" onClick={() => onAction("dca")}>Edit</button>
            </div>
            {dcaSchedules.map((d, i) => (
              <div key={i} className="dca-item">
                <div className="dca-row">
                  <div className="dca-token">{d.icon} {d.token}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--green)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 4px var(--green)" }} />
                    Active
                  </div>
                </div>
                <div className="dca-row" style={{ marginBottom: 6 }}>
                  <div className="dca-amount">{d.amount}</div>
                  <div className="dca-next">{d.next}</div>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width: `${d.prog}%`, background: "var(--blue)" }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-col">
          <div className="panel">
            <div className="panel-head"><div className="panel-title">⬡ Recent Activity</div></div>
            {activity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="act-dot" style={{ background: a.color, boxShadow: `0 0 5px ${a.color}` }} />
                <div className="act-text">{a.text}</div>
                <div className="act-time">{a.time}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head"><div className="panel-title">⚡ Quick Actions</div></div>
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Stake BTC / STRK",  color: "green",  action: "stake",    icon: "◆" },
                { label: "Lend on Vesu",       color: "gold",   action: "lend",     icon: "◉" },
                { label: "New DCA Schedule",   color: "blue",   action: "dca",      icon: "↻" },
                { label: "Private Transfer",   color: "purple", action: "transfer", icon: "⊛" },
              ].map((q, i) => (
                <button key={i} className="btn btn-ghost"
                  style={{ justifyContent: "flex-start", gap: 10, color: `var(--${q.color})`, borderColor: `var(--${q.color}20)` }}
                  onClick={() => onAction(q.action)}>
                  {q.icon} {q.label} <span style={{ marginLeft: "auto", opacity: 0.3 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StakeView({ addToast }) {
  const [tab, setTab] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const apys = { BTC: "5.2%", STRK: "8.7%" };
  const maxes = { BTC: "0.12", STRK: "3200" };

  const handleStake = async () => {
    if (!amount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    addToast({ icon: "◆", title: `Staked ${amount} ${tab}`, msg: `Earning ${apys[tab]} APY — gasless via AVNU Paymaster`, hash: "0x04f2b9...a9e1" });
    setAmount("");
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">◆ Native Staking <span className="panel-tag tag-green">wallet.stake()</span></div>
        </div>
        <div className="action-tabs">
          {["STRK", "BTC"].map(t => (
            <div key={t} className={`action-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setAmount(""); }}>
              {t === "BTC" ? "₿" : "⚡"} {t}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 22px 8px" }}>
          <div style={{ background: "var(--green-dim)", border: "1px solid #00E87A30", borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Current Pool APY</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: "var(--green)" }}>{apys[tab]}</span>
          </div>
        </div>
        <div className="input-wrap">
          <div className="input-label">Amount to Stake</div>
          <div className="input-field">
            <input className="input-inner" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="input-token">{tab === "BTC" ? "wBTC" : "STRK"}</div>
          </div>
          <div className="input-sub">
            <span>Available: {maxes[tab]} {tab}</span>
            <span className="input-max" onClick={() => setAmount(maxes[tab])}>MAX</span>
          </div>
        </div>
        <div className="info-row"><span className="info-key">Protocol</span><span className="info-val">Native Starknet Pool</span></div>
        <div className="info-row"><span className="info-key">Compound</span><span className="info-val">Daily auto-compound</span></div>
        <div className="info-row"><span className="info-key">Gas Fee</span><span className="info-val green">FREE — AVNU Paymaster</span></div>
        <div className="info-row"><span className="info-key">Unlock</span><span className="info-val">Flexible (no lockup)</span></div>
        <div style={{ padding: "16px 22px 22px" }}>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={handleStake} disabled={loading || !amount}>
            {loading ? <><span className="spinner">◌</span> Broadcasting...</> : `◆ Stake ${amount || "—"} ${tab}`}
          </button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
            ⚡ Gasless · Account Abstraction · Non-custodial
          </div>
        </div>
      </div>
    </div>
  );
}

function LendView({ addToast }) {
  const [tab, setTab] = useState("supply");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!amount) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    addToast({ icon: "◉", title: `${tab === "supply" ? "Supplied" : "Borrowed"} ${amount} USDC`, msg: `Vesu position active · ${tab === "supply" ? "Earning 6.1% APY" : "Borrowed at 4.2% APR"}`, hash: "0x07b3ff...f441" });
    setAmount("");
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">◉ Vesu Money Market <span className="panel-tag tag-gold">wallet.vesu.*</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px 22px" }}>
          {[
            { label: "Supply APY", value: "6.1%", color: "var(--green)" },
            { label: "Borrow APR", value: "4.2%", color: "var(--gold)" },
            { label: "Total Supplied", value: "$14.2M", color: "inherit" },
            { label: "Utilization", value: "68%", color: "inherit" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0D0D12", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="action-tabs">
          {[["supply", "Supply"], ["borrow", "Borrow"], ["repay", "Repay"], ["withdraw", "Withdraw"]].map(([id, label]) => (
            <div key={id} className={`action-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</div>
          ))}
        </div>
        <div className="input-wrap">
          <div className="input-label">USDC Amount</div>
          <div className="input-field">
            <input className="input-inner" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="input-token">USDC</div>
          </div>
          <div className="input-sub"><span>Wallet: 5,000 USDC</span><span className="input-max" onClick={() => setAmount("5000")}>MAX</span></div>
        </div>
        <div className="info-row"><span className="info-key">Gas Fee</span><span className="info-val green">FREE — AVNU Paymaster</span></div>
        <div className="info-row"><span className="info-key">Note</span><span className="info-val" style={{ fontSize: 11, color: "var(--text2)" }}>Approve + supply in ONE tx</span></div>
        <div style={{ padding: "0 22px 22px" }}>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={handleAction} disabled={loading || !amount}>
            {loading ? <><span className="spinner">◌</span> Processing...</> : `◉ ${["supply","borrow","repay","withdraw"].find(x=>x===tab)?.[0].toUpperCase()+tab.slice(1)} ${amount||"—"} USDC`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DCAView({ addToast }) {
  const [token, setToken] = useState("STRK");
  const [freq, setFreq] = useState("weekly");
  const [amnt, setAmnt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!amnt) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    addToast({ icon: "↻", title: `DCA Created: $${amnt} → ${token} ${freq}`, msg: "On-chain contract deployed · gasless execution guaranteed", hash: "0x09c1a2...7f23" });
    setAmnt("");
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">↻ Auto-DCA <span className="panel-tag tag-blue">wallet.dca.create()</span></div>
        </div>
        <div style={{ padding: "14px 22px 0", fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
          Starkzap deploys a Starknet contract that executes recurring AVNU swaps on your behalf. Each purchase is gasless.
        </div>
        <div className="input-wrap">
          <div className="input-label">Buy Token</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["STRK", "wBTC", "ETH"].map(tk => (
              <button key={tk} className="btn btn-ghost btn-sm"
                style={token === tk ? { borderColor: "var(--green)", color: "var(--green)", background: "var(--green-dim)" } : {}}
                onClick={() => setToken(tk)}>{tk}</button>
            ))}
          </div>
        </div>
        <div className="input-wrap" style={{ paddingTop: 0 }}>
          <div className="input-label">Spend per Interval (USDC)</div>
          <div className="input-field">
            <input className="input-inner" type="number" placeholder="0.00" value={amnt} onChange={e => setAmnt(e.target.value)} />
            <div className="input-token">USDC</div>
          </div>
        </div>
        <div className="input-wrap" style={{ paddingTop: 0 }}>
          <div className="input-label">Frequency</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["daily", "weekly", "monthly"].map(f => (
              <button key={f} className="btn btn-ghost btn-sm"
                style={freq === f ? { borderColor: "var(--blue)", color: "var(--blue)", background: "var(--blue-dim)" } : {}}
                onClick={() => setFreq(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="info-row"><span className="info-key">Route</span><span className="info-val">AVNU Multi-DEX Aggregator</span></div>
        <div className="info-row"><span className="info-key">Gas (per execution)</span><span className="info-val green">FREE — Sponsored</span></div>
        <div className="info-row"><span className="info-key">Slippage</span><span className="info-val">0.5% max</span></div>
        <div style={{ padding: "0 22px 22px" }}>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={handleCreate} disabled={loading || !amnt}>
            {loading ? <><span className="spinner">◌</span> Deploying DCA contract...</> : `↻ DCA $${amnt||"—"} → ${token} ${freq}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferView({ addToast }) {
  const [mode, setMode] = useState("private");
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!amount || !to) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, mode === "private" ? 2400 : 1200));
    setLoading(false);
    addToast({
      icon: mode === "private" ? "🔒" : "→",
      title: mode === "private" ? "Private transfer committed" : `Sent ${amount} STRK`,
      msg: mode === "private" ? "ZK proof submitted via Tongo Cash · sender, recipient & amount private" : `Standard ERC-20 transfer confirmed`,
      hash: mode === "private" ? "0x[zk-commitment]" : "0x03a5c9...c921",
    });
    setAmount(""); setTo("");
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">⊛ Transfer <span className="panel-tag tag-purple">wallet.confidential.*</span></div>
        </div>
        <div className="action-tabs">
          <div className={`action-tab ${mode === "private" ? "active" : ""}`} onClick={() => setMode("private")}>⊛ Private (Tongo ZK)</div>
          <div className={`action-tab ${mode === "standard" ? "active" : ""}`} onClick={() => setMode("standard")}>→ Standard</div>
        </div>
        {mode === "private" && (
          <div style={{ margin: "16px 22px 0", background: "#A855F710", border: "1px solid #A855F730", borderRadius: 8, padding: "12px 14px", display: "flex", gap: 10, fontSize: 12, color: "var(--purple)", lineHeight: 1.6 }}>
            <span style={{ flexShrink: 0 }}>🔒</span>
            <span><strong>Tongo Cash</strong> shields sender, recipient, and amount via ZK proofs on Starknet. On-chain, only a proof commitment is visible — nothing is readable.</span>
          </div>
        )}
        <div className="input-wrap">
          <div className="input-label">Recipient Address</div>
          <div className="input-field">
            <input className="input-inner" placeholder="0x..." value={to} onChange={e => setTo(e.target.value)} style={{ fontSize: 12 }} />
          </div>
        </div>
        <div className="input-wrap" style={{ paddingTop: 0 }}>
          <div className="input-label">Amount (STRK)</div>
          <div className="input-field">
            <input className="input-inner" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="input-token">STRK</div>
          </div>
          <div className="input-sub"><span>Balance: 1,200 STRK</span><span className="input-max" onClick={() => setAmount("1200")}>MAX</span></div>
        </div>
        <div className="info-row"><span className="info-key">Privacy</span><span className="info-val" style={{ color: mode === "private" ? "var(--purple)" : "var(--text2)" }}>{mode === "private" ? "🔒 ZK Shielded (Tongo)" : "Public on-chain"}</span></div>
        <div className="info-row"><span className="info-key">Gas Fee</span><span className="info-val green">FREE — AVNU Paymaster</span></div>
        <div className="info-row"><span className="info-key">Speed</span><span className="info-val">~5 seconds finality</span></div>
        <div style={{ padding: "0 22px 22px" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "13px", background: mode === "private" ? "var(--purple)" : "var(--green)", color: mode === "private" ? "#fff" : "#000" }}
            onClick={handleSend}
            disabled={loading || !to || !amount}
          >
            {loading
              ? <><span className="spinner">◌</span> {mode === "private" ? "Generating ZK proof..." : "Broadcasting..."}</>
              : `${mode === "private" ? "⊛ Private Send" : "→ Send"} ${amount || "—"} STRK`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  const addToast = (t) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  };

  const titles = {
    dashboard: ["Portfolio Overview", "Your money, always working."],
    stake:     ["Native Staking", "Earn BTC & STRK yield. Gasless. Flexible."],
    lend:      ["Vesu Lending", "Supply assets and earn algorithmic yield."],
    dca:       ["Auto-DCA", "Recurring buys via AVNU aggregator."],
    transfer:  ["Transfer", "Standard or ZK-private via Tongo Cash."],
  };

  const views = {
    dashboard: <DashboardView onAction={setPage} />,
    stake:     <StakeView addToast={addToast} />,
    lend:      <LendView addToast={addToast} />,
    dca:       <DCAView addToast={addToast} />,
    transfer:  <TransferView addToast={addToast} />,
  };

  return (
    <>
      <style>{FONTS + CSS}</style>
      <div className="orb orb1" /><div className="orb orb2" />
      <div className="app" style={{ position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-wrap">
            <div className="logo-icon">SF</div>
            <div>
              <div className="logo-text">Stark<span>Flow</span></div>
              <div className="logo-sub">Built on Starknet</div>
            </div>
          </div>
          <div className="nav">
            {NAV.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>
          <div style={{ padding: "0 12px 12px" }}>
            <div style={{ background: "#0D0D12", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Connected Wallet</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", background: "var(--border)", padding: "6px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}>
                <div className="wallet-dot" style={{ marginRight: 6 }} />
                0x04f2...e9b1
              </div>
              <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase", marginTop: 8, textAlign: "right" }}>Starknet Mainnet · Privy</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">{titles[page][0]}</div>
              <div className="page-sub">{titles[page][1]}</div>
            </div>
            <div className="gasless-chip">⚡ Gasless · AVNU Paymaster</div>
          </div>
          <div className="content">{views[page]}</div>
        </div>
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
