
/* v1.7 — floating card detail over selected card, mobile-friendly stat/info tabs */
(function(){
  'use strict';
  let origin=null;
  let originRect=null;
  let activeTab='stats';
  let lastCard=null;
  const labels={
    '체력':'❤️','피해량':'💥','초당 피해량':'⚔️','공격 속도':'🗡️',
    '공격 사거리':'🏹','공격 대상':'🎯','이동 속도':'💨','배치 개체 수':'👥',
    '보호막 체력':'🛡️','지속 시간':'⏳','타워 피해량':'🏰',
    '광역 피해 범위':'💥','진화 주기':'💜','사망 피해':'💣'
  };
  const backdrop=document.getElementById('detailBackdrop');
  const panel=document.getElementById('detailDrawer');
  if(!backdrop||!panel||typeof window.openDetail!=='function')return;
  const initialOpen=window.openDetail;
  const initialClose=window.closeDetail;
  function centerFromOrigin(){
    const vw=window.innerWidth;
    const vh=window.innerHeight;
    if(vw<=680||!originRect)return [vw/2,vh/2];
    const w=panel.offsetWidth||740;
    const h=panel.offsetHeight||680;
    const margin=14;
    function clamp(n,min,max){return max>=min?Math.max(min,Math.min(max,n)):(min+max)/2}
    return [
      clamp(originRect.left+originRect.width/2,w/2+margin,vw-w/2-margin),
      clamp(originRect.top+originRect.height/2,h/2+margin,vh-h/2-margin)
    ];
  }
  function position(){
    if(backdrop.hidden)return;
    panel.style.setProperty('--cr-dialog-x','50vw');
    panel.style.setProperty('--cr-dialog-y','50dvh');
    const p=centerFromOrigin();
    panel.style.setProperty('--cr-dialog-x',p[0]+'px');
    panel.style.setProperty('--cr-dialog-y',p[1]+'px');
  }
  function tab(id,focus){
    activeTab=id==='performance'?'performance':'stats';
    panel.querySelectorAll('[data-cr-pane]').forEach(el=>{el.hidden=el.getAttribute('data-cr-pane')!==activeTab});
    panel.querySelectorAll('[data-cr-tab]').forEach(btn=>{
      const selected=btn.dataset.crTab===activeTab;
      btn.setAttribute('aria-selected',String(selected));
      btn.setAttribute('tabindex',selected?'0':'-1');
    });
    if(focus){panel.querySelector('[data-cr-tab="'+activeTab+'"]')?.focus();}
    panel.scrollTop=0;
    position();
  }
  function addIcons(){
    panel.querySelectorAll('.cr-game-stat span').forEach(span=>{
      if(span.querySelector('.cr-stat-icon'))return;
      const icon=labels[span.textContent.trim()];
      if(!icon)return;
      const el=document.createElement('span');
      el.className='cr-stat-icon';
      el.textContent=icon;
      el.setAttribute('aria-hidden','true');
      span.prepend(el);
    });
  }
  function setup(){
    const top=panel.querySelector('.drawer-top');
    const hero=panel.querySelector('.cr-game-hero');
    if(!top||!hero)return;
    top.querySelector('.eyebrow')?.replaceChildren(document.createTextNode('CARD INFORMATION · 카드 정보'));
    const close=top.querySelector('[data-action="close-detail"]');
    if(close)close.textContent='✕';
    const tabs=document.createElement('div');
    tabs.className='cr-modal-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','카드 정보 메뉴');
    tabs.innerHTML='<button type="button" role="tab" data-cr-tab="stats" aria-selected="true">⚔ 카드 능력치</button>'+
      '<button type="button" role="tab" data-cr-tab="performance" aria-selected="false">📊 실전·밸런스</button>';
    hero.insertAdjacentElement('afterend',tabs);
    Array.from(panel.children).forEach(el=>{
      if(el.classList.contains('cr-stat-shell'))el.dataset.crPane='stats';
      else if(el.classList.contains('score-result')||el.classList.contains('drawer-section'))el.dataset.crPane='performance';
    });
    const actions=panel.querySelector('.drawer-actions');
    if(actions)actions.removeAttribute('data-cr-pane');
    const stats=panel.querySelector('.cr-stat-shell');
    if(!stats){
      const div=document.createElement('div');
      div.className='cr-stat-shell';
      div.innerHTML='<div class="cr-no-data">이 카드의 상세 전투 능력치는 현재 등록되지 않았습니다.</div>';
      tabs.insertAdjacentElement('afterend',div);
      div.dataset.crPane='stats';
    }
    addIcons();
    panel.setAttribute('aria-label','카드 정보 팝업');
    tab('stats',false);
    position();
    const btn=top.querySelector('[data-action="close-detail"]');
    if(btn)btn.focus({preventScroll:true});
  }
  window.openDetail=function(name){
    if(lastCard!==name)activeTab='stats';
    lastCard=name;
    initialOpen(name);
    setup();
  };
  if(typeof initialClose==='function'){
    window.closeDetail=function(){
      initialClose();
      if(origin&&document.contains(origin))origin.focus({preventScroll:true});
      origin=null;originRect=null;
    };
  }
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-action="open"]');
    if(open&&!open.closest('#detailDrawer')){
      origin=open;
      const anchor=open.closest('.cr-card-tile')||open;
      originRect=anchor.getBoundingClientRect();
    }
    const tabbtn=e.target.closest('#detailDrawer [data-cr-tab]');
    if(tabbtn){
      e.preventDefault();e.stopPropagation();
      tab(tabbtn.dataset.crTab,true);
    }
  },true);
  panel.addEventListener('keydown',e=>{
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    if(!e.target.closest('[data-cr-tab]'))return;
    e.preventDefault();
    tab(activeTab==='stats'?'performance':'stats',true);
  });
  const observation=new MutationObserver(()=>{
    if(backdrop.hidden)return;
    addIcons();
    position();
  });
  observation.observe(panel,{childList:true,subtree:true});
  window.addEventListener('resize',position,{passive:true});
  window.addEventListener('orientationchange',position,{passive:true});
})();
