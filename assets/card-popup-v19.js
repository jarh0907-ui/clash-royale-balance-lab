/* v1.9 game-card dossier: a single modal with three in-panel pages and optional analytics. */
(function(){
'use strict';
const defers=(f)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f,{once:true}):f();
function init(){
  const backdrop=document.getElementById('detailBackdrop');
  const panel=document.getElementById('detailDrawer');
  if(!backdrop||!panel||typeof window.openDetail!=='function'||!Array.isArray(CARDS))return;
  const openBefore=window.openDetail;
  const closeBefore=window.closeDetail;
  let page='stats', analysis=false, opener=null;
  backdrop.className='cr-v19-backdrop';
  panel.className='cr-v19-panel';
  panel.setAttribute('aria-label','카드 상세 정보');
  function canon(s){return String(s||'').replace(/^Hero\s+/i,'').replace(/^Evo\s+/i,'').replace(/\s+Evolution$/i,'').replace(/\s+Hero$/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase()}
  function getIcon(label){
    let k='star';
    if(label.includes('체력'))k='heart';
    else if(label.includes('초당')||label.includes('광역')||label.includes('피해량')||label.includes('피해'))k='damage';
    else if(label.includes('공격 속도')||label.includes('타격')||label.includes('기절'))k='sword';
    else if(label.includes('사거리')||label.includes('범위'))k='bow';
    else if(label.includes('공격 대상')||label.includes('대상'))k='target';
    else if(label.includes('이동')||label.includes('속도'))k='boot';
    else if(label.includes('개체')||label.includes('배치 수'))k='team';
    else if(label.includes('시간')||label.includes('간격')||label.includes('지속')||label.includes('주기'))k='clock';
    else if(label.includes('방패')||label.includes('보호막'))k='shield';
    else if(label.includes('타워'))k='tower';
    const base='<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    const end='</svg>';
    const art={
      heart:'<path d="M16 27C7 21.3 3 16.1 3 10.8 3 5.4 10 3 16 9c6-6 13-3.6 13 1.8C29 16.1 25 21.3 16 27Z" fill="#ec4264" stroke="#7c173c" stroke-width="2"/><path d="M6 9c1-4 5-5 8-2" fill="none" stroke="#ffb1bb" stroke-width="2.7" stroke-linecap="round"/>',
      damage:'<path d="M16 2 20 10l8-2-4 8 6 5-9 1-5 8-4-8-9-1 6-5-4-8 8 2Z" fill="#f15c53" stroke="#852c38" stroke-width="1.3"/><path d="m16 8 2 7 7 3-7 2-2 6-2-6-7-2 7-3Z" fill="#ffd86e"/>',
      sword:'<path d="M24 3 13 15l-1 5 5-2L29 6Z" fill="#d9e7fb" stroke="#55739e" stroke-width="1.5"/><path d="m9 18 7 7" stroke="#e0b14d" stroke-width="4" stroke-linecap="round"/><path d="m6 26 4-4 2 2-4 4Z" fill="#9b5d25"/><path d="m7 16 10 10" stroke="#f5d66e" stroke-width="2"/>',
      bow:'<path d="M11 2C29 8 28 24 12 30" fill="none" stroke="#d88835" stroke-width="3"/><path d="M11 2 11 30" fill="none" stroke="#f5ddad" stroke-width="1"/><path d="M2 24 28 7" stroke="#f5e7c1" stroke-width="2"/><path d="m24 7 6-3-2 7Z" fill="#bfd6e9" stroke="#778b9f"/><path d="m2 24 6-1-4 5Z" fill="#d7a15f"/>',
      target:'<circle cx="16" cy="16" r="12" fill="#e0e8f1" stroke="#596c86" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="#38465d"/><circle cx="16" cy="16" r="3" fill="#fdfefe"/><path d="M16 1v7M16 24v7M1 16h7M24 16h7" stroke="#e0e5ef" stroke-width="2.3"/>',
      boot:'<path d="M9 4h11v10l7 7v6H5v-7l5-6Z" fill="#ae793e" stroke="#543d27" stroke-width="2"/><path d="M6 22h21v4H6Z" fill="#e1d2a2"/><path d="m12 9 8 0" stroke="#e7bd74" stroke-width="2"/>',
      team:'<circle cx="10" cy="10" r="4" fill="#f8f8ff" stroke="#879bb1"/><circle cx="23" cy="10" r="4" fill="#f8f8ff" stroke="#879bb1"/><path d="M2 23c0-11 16-11 16 0v4H2ZM17 24c0-10 13-10 13 0v3H17Z" fill="#e1e7f0" stroke="#66788d" stroke-width="1.5"/>',
      clock:'<circle cx="16" cy="16" r="13" fill="#ffd766" stroke="#9c7229" stroke-width="2"/><circle cx="16" cy="16" r="9" fill="#f1e8b1"/><path d="M16 8v9l7 4" fill="none" stroke="#785b30" stroke-width="2.8" stroke-linecap="round"/>',
      shield:'<path d="M16 2 28 7v9c0 7-7 11-12 14C11 27 4 23 4 16V7Z" fill="#b8cce5" stroke="#647b9a" stroke-width="2"/><path d="M16 6v20c-6-4-8-7-8-11V10Z" fill="#e3f2ff"/>',
      tower:'<path d="M7 11V4h5v4h4V4h5v4h4V4h3v7l-4 3v14H8V14Z" fill="#d8d9cd" stroke="#586478" stroke-width="2"/><path d="M13 28v-9a3 3 0 0 1 6 0v9" fill="#46536e"/>',
      star:'<path d="m16 2 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" fill="#f6d65c" stroke="#a97d27" stroke-width="2"/>'
    };
    return base+art[k]+end;
  }
  function decorateStats(root){
    if(!root)return;
    root.querySelectorAll('.cr-game-stat').forEach(cell=>{
      if(cell.querySelector('.cr-v19-iconbox'))return;
      const label=cell.querySelector('span');const value=cell.querySelector('strong');
      if(!label||!value)return;
      const icon=document.createElement('span');icon.className='cr-v19-iconbox';icon.innerHTML=getIcon(label.textContent.trim());
      const text=document.createElement('span');text.className='cr-v19-stattext';
      text.append(label,value);cell.append(icon,text);
    });
  }
  function setPage(next){
    page=['summary','stats','description'].includes(next)?next:'stats';
    analysis=false;
    panel.querySelectorAll('[data-cr-v19-page]').forEach(el=>{el.hidden=el.dataset.crV19Page!==page});
    panel.querySelectorAll('[data-cr-v19-pip]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.crV19Pip===page)));
    const report=panel.querySelector('.cr-v19-analysis');if(report)report.hidden=true;
    const paper=panel.querySelector('.cr-v19-paper');if(paper)paper.hidden=false;
    const toggle=panel.querySelector('[data-cr-v19-toggle]');if(toggle)toggle.textContent='📊 실전 분석';
    panel.scrollTop=0;
  }
  function toggleAnalytics(){
    analysis=!analysis;
    const report=panel.querySelector('.cr-v19-analysis');
    const paper=panel.querySelector('.cr-v19-paper');
    if(report)report.hidden=!analysis;
    if(paper)paper.hidden=analysis;
    const toggle=panel.querySelector('[data-cr-v19-toggle]');
    if(toggle)toggle.textContent=analysis?'↩ 카드 정보':'📊 실전 분석';
    panel.scrollTop=0;
  }
  function draw(name){
    const c=CARDS.find(x=>x.en===name);if(!c)return;
    const hero=panel.querySelector('.cr-game-hero');const info=hero?.querySelector('.cr-game-info');
    const art=hero?.querySelector('.cr-game-picture');const top=panel.querySelector('.drawer-top');
    const statShell=panel.querySelector('.cr-stat-shell');
    if(!hero||!info||!top)return;
    top.querySelector('[data-action="close-detail"]')?.setAttribute('aria-label','정보창 닫기');
    const nameText=info.querySelector('h2')?.textContent||c.ko||c.en;
    const oldMeta=[...info.querySelectorAll('.cr-meta span')].map(s=>s.textContent.trim());
    const kind=c.type||oldMeta[0]||'카드';
    const rarity=oldMeta[2]||'미확인';
    const rarityKey={'일반':'common','희귀':'rare','영웅':'epic','전설':'legendary','챔피언':'champion'}[rarity]||'rare';
    if(art){const ribbon=document.createElement('span');ribbon.className='cr-v19-portrait-level';ribbon.textContent=c.form==='진화'?'진화 카드':c.form==='영웅'?'영웅 카드':'LEVEL 11';art.append(ribbon);}
    const badge=document.createElement('div');badge.className='cr-v19-badges';badge.dataset.rarity=rarityKey;
    [['희귀도',rarity],['유형',kind]].forEach(pair=>{const item=document.createElement('div');item.className='cr-v19-badge';
      const k=document.createElement('span');k.className='cr-v19-badge-label';k.textContent=pair[0];
      const v=document.createElement('span');v.className='cr-v19-badge-value';v.textContent=pair[1];item.append(k,v);badge.append(item)});
    info.append(badge);
    let variants=CARDS.filter(other=>canon(other.en)===canon(c.en));
    const tabs=document.createElement('nav');tabs.className='cr-v19-tabs';tabs.setAttribute('aria-label','카드 형태 변경');
    if(variants.length>1){variants.sort((a,b)=>({기본:0,진화:1,영웅:2}[a.form]??9)-({기본:0,진화:1,영웅:2}[b.form]??9));
      variants.slice(0,3).forEach(v=>{const b=document.createElement('button');b.type='button';b.className='cr-v19-tab';
        b.textContent=v.form==='기본'?'정보':v.form;b.dataset.crV19Switch=v.en;b.setAttribute('aria-current',String(v.en===c.en));tabs.append(b)});
    }
    panel.insertBefore(tabs,top);
    const paper=document.createElement('section');paper.className='cr-v19-paper';paper.setAttribute('aria-label','카드 정보');
    const summary=document.createElement('section');summary.className='cr-v19-page';summary.dataset.crV19Page='summary';
    const desc=document.createElement('section');desc.className='cr-v19-page';desc.dataset.crV19Page='description';
    const stats=document.createElement('section');stats.className='cr-v19-page';stats.dataset.crV19Page='stats';
    const summaryBox=document.createElement('div');summaryBox.className='cr-v19-story';
    const summaryCenter=document.createElement('div');
    const title=document.createElement('strong');title.textContent=nameText;
    const p=document.createElement('p');p.textContent='엘릭서 '+(c.cost==null?'미확인':c.cost)+' · '+kind+' · '+(c.form==='기본'?'기본 카드':c.form);
    const p2=document.createElement('p');p2.textContent='이 카드의 상세 능력치는 가운데 페이지에서 확인할 수 있어요.';
    const p3=document.createElement('small');p3.textContent='게임 내 영상 페이지 대신 카드 개요를 제공합니다.';
    summaryCenter.append(title,p,p2,p3);summaryBox.append(summaryCenter);summary.append(summaryBox);
    if(statShell){stats.append(statShell);decorateStats(statShell);}
    else{const empty=document.createElement('div');empty.className='cr-v19-story';empty.textContent='이 카드의 능력치 자료가 아직 없습니다.';stats.append(empty);}
    const body=document.createElement('div');body.className='cr-v19-story';
    const t=document.createElement('div');const dt=document.createElement('strong');dt.textContent='카드 설명';
    const gp=info.querySelector('.cr-game-desc')?.textContent?.trim()||'등록된 카드 설명이 없습니다.';
    const paragraph=document.createElement('p');paragraph.textContent=gp;
    const foot=document.createElement('small');foot.textContent='설명은 카드 분류로 생성한 요약이며 공식 게임 내 원문은 아닙니다.';
    t.append(dt,paragraph,foot);body.append(t);desc.append(body);
    paper.append(summary,stats,desc);
    const pips=document.createElement('div');pips.className='cr-v19-pips';pips.setAttribute('role','tablist');pips.setAttribute('aria-label','카드 정보 페이지');
    [['summary','개요'],['stats','전투 능력치'],['description','카드 설명']].forEach(pair=>{
      const btn=document.createElement('button');btn.type='button';btn.className='cr-v19-pip';btn.dataset.crV19Pip=pair[0];btn.setAttribute('role','tab');btn.setAttribute('aria-label',pair[1]);btn.title=pair[1];pips.append(btn);
    });paper.append(pips);
    hero.insertAdjacentElement('afterend',paper);
    const analysisPanel=document.createElement('section');analysisPanel.className='cr-v19-analysis';analysisPanel.hidden=true;
    const leftover=[...panel.children].filter(el=>el.matches('.score-result,.drawer-section'));
    leftover.forEach(el=>analysisPanel.append(el));
    paper.insertAdjacentElement('afterend',analysisPanel);
    const controls=document.createElement('div');controls.className='cr-v19-controls';
    const deck=document.createElement('button');deck.type='button';deck.className='cr-v19-action';deck.dataset.action='deck-from-card';deck.dataset.card=c.en;deck.textContent='♜ 포함된 덱';
    const toggle=document.createElement('button');toggle.type='button';toggle.className='cr-v19-action gold';toggle.dataset.crV19Toggle='1';toggle.textContent='📊 실전 분석';
    controls.append(deck,toggle);analysisPanel.insertAdjacentElement('afterend',controls);
    const note=document.createElement('p');note.className='cr-v19-data-note';note.textContent='전투 수치: 레벨 11 · 2026-08-26 커뮤니티 자료 기준 (현재 패치와 차이 가능)';controls.insertAdjacentElement('afterend',note);
    setPage('stats');panel.scrollTop=0;
    top.querySelector('[data-action="close-detail"]')?.focus({preventScroll:true});
  }
  window.openDetail=function(name){
    openBefore(name);
    draw(name);
  };
  if(typeof closeBefore==='function')window.closeDetail=function(){closeBefore();if(opener&&document.contains(opener))opener.focus({preventScroll:true});opener=null};
  document.addEventListener('click',e=>{
    const clicked=e.target.closest('[data-action="open"]');if(clicked&&!clicked.closest('#detailDrawer'))opener=clicked;
  },true);
  panel.addEventListener('click',e=>{
    const sw=e.target.closest('[data-cr-v19-switch]');if(sw){e.preventDefault();e.stopPropagation();window.openDetail(sw.dataset.crV19Switch);return;}
    const pip=e.target.closest('[data-cr-v19-pip]');if(pip){e.preventDefault();e.stopPropagation();setPage(pip.dataset.crV19Pip);return;}
    const toggle=e.target.closest('[data-cr-v19-toggle]');if(toggle){e.preventDefault();e.stopPropagation();toggleAnalytics();return;}
  });
  panel.addEventListener('keydown',e=>{
    if(!e.target.closest('[data-cr-v19-pip]')||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();const pages=['summary','stats','description'];const index=pages.indexOf(page);const next=pages[(index+(e.key==='ArrowRight'?1:2))%3];setPage(next);
    panel.querySelector('[data-cr-v19-pip="'+next+'"]')?.focus({preventScroll:true});
  });
  const observer=new MutationObserver(records=>{
    if(backdrop.hidden)return;
    const paper=panel.querySelector('.cr-v19-paper');
    if(!paper)return;
    const current=panel.querySelector('.cr-v19-page[data-cr-v19-page="stats"]');
    if(current)decorateStats(current);
  });
  observer.observe(panel,{childList:true,subtree:true});
}
defers(init);
})();