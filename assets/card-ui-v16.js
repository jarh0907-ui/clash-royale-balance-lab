
/* v1.6 Card Browser - no external JS dependencies, same-origin stats JSON */
(function(){
  'use strict';
  var activeView='gallery';
  var referenceStats=null;
  var statStatus='불러오는 중';
  var sourceDate='2026-08-26';
  var baseRenderCards=window.renderCards;
  var baseRenderRows=window.renderRows;
  var baseOpenDetail=window.openDetail;
  if(typeof baseRenderRows!=='function'||typeof baseOpenDetail!=='function'||typeof baseRenderCards!=='function'||typeof CARDS==='undefined')return;
  function safe(v){return esc(v===null||v===undefined?'':v)}
  function canon(v){return String(v||'').replace(/^Hero\s+/i,'').replace(/^Evo\s+/i,'').replace(/\s+Evolution$/i,'').replace(/\s+Hero$/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase()}
  function statFor(c){
    if(!referenceStats)return null;
    var slug=canon(c.en);
    var form=c.form==='진화'?'evolution':c.form==='영웅'?'hero':'base';
    var cards=referenceStats.cards||{};
    for(var key in cards){
      var d=cards[key];
      if(canon(d.display)!==slug)continue;
      if(form==='evolution'&&!d.evolution)continue;
      if(form==='hero'&&!d.hero)continue;
      if(form==='base'&&(d.evolution||d.hero))continue;
      return d;
    }
    return null;
  }
  function chipName(c){return c.form==='진화'?'진화':c.form==='영웅'?'영웅':c.form==='챔피언'?'챔피언':''}
  function cardArt(c,priority){
    var path=c.imageUrl;
    var symbol=c.type==='마법'?'✦':c.type==='건물'?'▥':'⚔';
    return path?'<img src="'+safe(path)+'" alt="'+safe(label(c))+' 카드 이미지" loading="'+(priority?'eager':'lazy')+'" decoding="async" referrerpolicy="no-referrer">':'<span class="cr-art-fallback">'+symbol+'</span>';
  }
  function cardTile(c,i){
    var variant=chipName(c);
    var score=overall(c);
    return '<article class="cr-card-tile" data-form="'+safe(c.form)+'">'+
      '<button type="button" class="cr-card-art" data-action="open" data-card="'+safe(c.en)+'" aria-label="'+safe(label(c))+' 능력치와 설명 열기">'+
        '<span class="cr-art-frame">'+cardArt(c,i<9)+
          (c.cost!==null?'<span class="cr-art-cost">'+fmt(c.cost)+'</span>':'')+
          (variant?'<span class="cr-art-variant">'+safe(variant)+'</span>':'')+
        '</span>'+
        '<span class="cr-art-name">'+safe(label(c))+'</span>'+
        '<span class="cr-card-caption">'+safe(c.type)+(c.form!=='기본'?' · '+safe(c.form):'')+'</span>'+
      '</button>'+
      '<div class="cr-card-quick"><div><small>랭크 승률</small><strong>'+fmt(c.rankWin)+'%</strong></div><div><small>실전 지수</small><strong>'+fmt(c.practical,1)+'</strong></div></div>'+
      '<div class="cr-card-actions"><button type="button" data-action="compare" data-card="'+safe(c.en)+'">'+(state.compares.includes(c.en)?'✓ 비교중':'+ 비교')+'</button>'+
      '<button type="button" data-action="deck-from-card" data-card="'+safe(c.en)+'">덱 찾기</button></div>'+
    '</article>';
  }
  function toggles(){return '<div class="cr-view-toggle"><small>카드 그림을 눌러 게임형 능력치 창을 확인하세요.</small><div class="cr-view-buttons" aria-label="카드 표시 방식"><button type="button" data-cr-view="gallery" aria-pressed="'+(activeView==='gallery')+'">▦ 큰 카드</button><button type="button" data-cr-view="table" aria-pressed="'+(activeView==='table')+'">▤ 표로 보기</button></div></div>'}
  window.renderCards=function(){
    var html=baseRenderCards();
    return html.replace('<div id="resultArea"></div>',toggles()+'<div id="resultArea"></div>');
  };
  window.renderRows=function(){
    if(activeView==='table'){baseRenderRows();return;}
    var list=filters();
    var count=$('filterCount');
    if(count)count.innerHTML='<strong style="color:#e9f3ff">'+list.length+'</strong> / '+CARDS.length+' 카드 · '+safe((SORTS.find(function(x){return x[0]===state.sort})||['',''])[1])+' 정렬';
    var area=$('resultArea');
    if(area)area.innerHTML=list.length?'<div class="cr-gallery">'+list.map(cardTile).join('')+'</div>':'<div class="panel empty"><strong>조건에 맞는 카드가 없습니다.</strong><p>검색어 또는 필터를 변경해 주세요.</p><button class="btn sm" data-action="reset-filters">필터 초기화</button></div>';
  };
  var statLabels={
    hitpoints:'체력',damage:'피해량',dps:'초당 피해량',hit_speed:'공격 속도',
    range_tiles:'공격 사거리',attacks:'공격 대상',speed_tiles:'이동 속도',
    movement:'이동 유형',count:'배치 개체 수',shield_hp:'보호막 체력',
    lifetime_s:'지속 시간',deploy_time:'배치 시간',crown_tower_damage:'타워 피해량',
    radius_tiles:'효과 범위',splash_radius:'광역 피해 범위',death_damage:'사망 피해',
    death_radius_tiles:'사망 효과 범위',charge_damage:'돌진 피해',charge_range:'돌진 시작 거리',
    charge_speed_tiles:'돌진 속도',dash_damage:'대시 피해',dash_time_s:'대시 시간',
    jump_damage:'점프 피해',jump_time_s:'점프 시간',evo_cycles:'진화 주기',
    freeze_duration_s:'빙결 지속',stun_duration_s:'기절 지속',slow_duration_s:'둔화 지속',
    slow_pct:'둔화율',spawn_damage:'등장 피해',spawn_crown_damage:'등장 타워 피해',
    spawn_interval_s:'소환 간격',spawn_delay_s:'첫 소환 대기',spawn_range_tiles:'소환 범위',
    projectile_range:'발사체 사거리',projectile_width_tiles:'발사체 폭',
    projectile_radius:'발사체 범위',projectile_speed:'발사체 속도',
    hits_per_attack:'연속 타격 수',damage_stages:'단계별 피해',
    kamikaze:'자폭 유닛',river_jump:'강 건너뛰기',components:'구성 요소',spawn_unit_stats:'소환 유닛 능력치'
  };
  var keyOrder=['hitpoints','shield_hp','damage','dps','hit_speed','range_tiles','attacks','speed_tiles','movement','count','crown_tower_damage','death_damage','radius_tiles','splash_radius','lifetime_s','deploy_time','evo_cycles'];
  var korean={ground:'지상',air:'공중',buildings:'건물',true:'있음',false:'없음'};
  function valueFor(key,val){
    if(key==='attacks'){if(!Array.isArray(val))return '—';return val.map(function(x){return korean[x]||x}).join(' · ');}
    if(key==='movement'){return korean[val]||String(val);}
    if(key==='evo_cycles')return fmt(val)+'회 순환';
    if(key==='slow_pct')return fmt(val)+'%';
    if(['hit_speed','lifetime_s','deploy_time','freeze_duration_s','stun_duration_s','slow_duration_s','dash_time_s','jump_time_s','spawn_interval_s','spawn_delay_s'].includes(key))return fmt(val,2)+'초';
    if(['range_tiles','radius_tiles','splash_radius','death_radius_tiles','charge_range','charge_speed_tiles','speed_tiles','projectile_width_tiles','projectile_radius','spawn_range_tiles','projectile_range'].includes(key))return fmt(val,2)+' 타일';
    if(typeof val==='number')return fmt(val,1);
    if(typeof val==='boolean')return val?'있음':'없음';
    if(Array.isArray(val))return val.map(function(x){return typeof x==='object'?JSON.stringify(x):String(x)}).join(', ');
    if(val&&typeof val==='object')return '상세 구성 정보';
    return String(val);
  }
  function intro(c,d){
    if(!d)return '이 카드의 개별 능력치 자료를 아직 확보하지 못했습니다. 실제 게임과 최신 카드 자료에서 확인해 주세요.';
    var p=[];
    p.push(c.type==='마법'?'전장에 사용하는 마법 카드입니다.':c.type==='건물'?'전장에 설치하는 건물 카드입니다.':c.type==='타워 유닛'?'타워를 수비하는 카드입니다.':'전장에 배치하는 유닛 카드입니다.');
    if(Array.isArray(d.attacks)&&d.attacks.length)p.push('공격 대상은 '+d.attacks.map(function(a){return korean[a]||a}).join('·')+'입니다.');
    if(typeof d.count==='number'&&d.count>1)p.push('한 번에 '+d.count+'개체가 배치됩니다.');
    if(c.form==='진화')p.push('진화 효과는 기본 카드와 별도로 확인하세요.');
    if(c.form==='영웅')p.push('영웅 능력의 별도 작동 조건과 비용은 게임 내에서 확인하세요.');
    return p.join(' ');
  }
  function renderStatPanel(c){
    var d=statFor(c);
    var arr=[];
    if(d){
      var ignore=new Set(['display','elixir','rarity','kind','base','hero','evolution','champion']);
      var keys=[...keyOrder,...Object.keys(d).filter(function(k){return !keyOrder.includes(k)&&!ignore.has(k)&&k!=='_src'})];
      var used=new Set();
      keys.forEach(function(k){
        if(used.has(k)||ignore.has(k)||k==='_src'||d[k]==null)return;
        used.add(k);var display=valueFor(k,d[k]);
        if(k==='components'||k==='spawn_unit_stats')return;
        if(display==='')return;
        arr.push('<div class="cr-game-stat"><span>'+safe(statLabels[k]||k.replace(/_/g,' '))+'</span><strong>'+safe(display)+'</strong></div>');
      });
    }
    if(!arr.length && (c.hp!=null||c.hit!=null)){
      if(c.hp!=null)arr.push('<div class="cr-game-stat"><span>체력 (기존 내장 자료)</span><strong>'+fmt(c.hp)+'</strong></div>');
      if(c.hit!=null)arr.push('<div class="cr-game-stat"><span>피해량 (기존 내장 자료)</span><strong>'+fmt(c.hit)+'</strong></div>');
    }
    var date=d?sourceDate:'';
    return '<section class="cr-stat-shell" id="cr-combat-stats"><div class="cr-data-head"><h3>⚔ 전투 능력치</h3><div class="cr-data-stamp">'+(d?'레벨 11 · '+safe(date)+' 기준':safe(statStatus))+'</div></div>'+
       (arr.length?'<div class="cr-game-stats">'+arr.join('')+'</div>':'<div class="cr-no-data">이 카드 형태의 확인된 전투 수치가 없습니다. 현재 게임의 카드 정보 또는 외부 데이터베이스를 참고해 주세요.</div>')+
       '<div class="cr-stat-citation">※ 세부 수치는 과거 커뮤니티 데이터(2026-08-26) 기준이며 현재 밸런스 패치와 다를 수 있습니다. <a href="https://crtool.app/ko/units/" target="_blank" rel="noopener noreferrer">최신 카드 능력치 확인 ↗</a></div></section>';
  }
  function gameHero(c){
    var d=statFor(c);
    var rarity=d?({common:'일반',rare:'희귀',epic:'영웅',legendary:'전설',champion:'챔피언'}[d.rarity]||d.rarity):'';
    return '<section class="cr-game-hero">'+
      '<div class="cr-game-picture" data-form="'+safe(c.form)+'">'+cardArt(c,true)+(c.cost!=null?'<span class="cr-art-cost">'+fmt(c.cost)+'</span>':'')+'</div>'+
      '<div class="cr-game-info"><div class="cr-level">기준 레벨 11</div><h2>'+safe(label(c))+'</h2><div class="cr-meta"><span>'+safe(c.type)+'</span><span>'+safe(c.form)+'</span>'+(rarity?'<span>'+safe(rarity)+'</span>':'')+'</div>'+
      '<div class="cr-game-desc" id="cr-card-description">'+safe(intro(c,d))+'</div>'+
      '<div class="cr-game-note">게임의 카드 창을 참고해 구성한 비공식 정보 화면</div></div></section>';
  }
  function refreshStatsOnOpen(c){
    var el=document.getElementById('cr-combat-stats');
    if(el)el.outerHTML=renderStatPanel(c);
    var description=document.getElementById('cr-card-description');
    if(description)description.textContent=intro(c,statFor(c));
  }
  window.openDetail=function(name){
    baseOpenDetail(name);
    var c=CARDS.find(function(x){return x.en===name});
    if(!c)return;
    var drawer=$('detailDrawer');
    var lead=drawer.querySelector('.lead');
    if(lead)lead.outerHTML=gameHero(c);
    var score=drawer.querySelector('.score-result');
    if(score)score.insertAdjacentHTML('beforebegin',renderStatPanel(c));
    var heading=[...drawer.querySelectorAll('.drawer-section h3')].find(function(x){return x.textContent.indexOf('레벨 11 기본 능력치')>=0});
    if(heading)heading.closest('.drawer-section').remove();
    var top=drawer.querySelector('.drawer-top .eyebrow');
    if(top)top.textContent='CARD INFORMATION · 카드 도감';
    drawer.scrollTop=0;
  };
  document.addEventListener('click',function(e){
    var choice=e.target.closest('[data-cr-view]');
    if(!choice)return;
    e.preventDefault();
    activeView=choice.dataset.crView==='table'?'table':'gallery';
    document.querySelectorAll('[data-cr-view]').forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.crView===activeView))});
    window.renderRows();
  },true);
  fetch('./data/card-stats-level11.json',{cache:'force-cache'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(function(json){
    referenceStats=json;sourceDate=json.meta&&json.meta.generated||sourceDate;statStatus='자료 확인 완료';
    if(typeof detailCard!=='undefined'&&detailCard){var c=CARDS.find(function(x){return x.en===detailCard});if(c)refreshStatsOnOpen(c);}
  }).catch(function(){statStatus='추가 데이터 로딩 실패';if(typeof detailCard!=='undefined'&&detailCard){var c=CARDS.find(function(x){return x.en===detailCard});if(c)refreshStatsOnOpen(c);}});
  if(state.page==='cards')render();
})();