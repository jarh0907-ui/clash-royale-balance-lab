
/* v1.10, clearer performance indicator, no changes to the underlying statistics */
(function(){
'use strict';
function init(){
  if(typeof window.openDetail!=='function')return;
  const original=window.openDetail;
  function fmtNum(v,decimals){
    if(v===null||v===undefined||v==='')return '—';
    const n=Number(v);
    return Number.isFinite(n)?n.toLocaleString('ko-KR',{maximumFractionDigits:decimals}):'—';
  }
  function metricHtml(value,kind){
    const n=fmtNum(value,1);
    const label=kind==='win'?'승률':'픽률';
    return '<div class="cr-v110-mode-metric"><span>'+label+'</span><strong class="'+(kind==='use'?'usage':'')+'">'+(n==='—'?'—':n+'%')+'</strong></div>';
  }
  function modeHtml(title,win,use,rating){
    return '<section class="cr-v110-mode"><h4>'+title+'</h4><div class="cr-v110-mode-body">'+metricHtml(win,'win')+metricHtml(use,'use')+
      '</div><div class="cr-v110-mode-rate">모드 평점 <b>'+fmtNum(rating,1)+'점</b></div></section>';
  }
  function decorate(c){
    const modal=document.getElementById('detailDrawer');
    const panel=modal?.querySelector('.cr-v19-analysis');
    if(!panel||!c)return;
    const oldScore=panel.querySelector('.score-result');
    const oldRates=[...panel.querySelectorAll('.drawer-section')].find(el=>el.querySelector('h3')?.textContent.includes('실전 데이터'));
    const score=fmtNum(c.practical,1),rank=fmtNum(c.rankRating,1),gc=fmtNum(c.gcRating,1);
    const newPanel=document.createElement('section');
    newPanel.className='cr-v110-performance';
    newPanel.setAttribute('aria-label','실전 통계와 성과 점수');
    newPanel.innerHTML='<div class="cr-v110-performance-head">'+
      '<div><div class="cr-v110-score-title">실전 성과 점수</div><div class="cr-v110-score-sub">랭크·GC 평점을 결합한 <b>자체 계산 점수</b><br>실제 승률이나 공식 카드 등급이 아닙니다.</div></div>'+
      '<div class="cr-v110-scorebig"><b>'+score+'</b><span>점</span></div></div>'+
      '<div class="cr-v110-modes">'+
      modeHtml('🏆 랭크전',c.rankWin,c.rankUse,c.rankRating)+
      modeHtml('🏅 그랜드 도전 (GC)',c.gcWin,c.gcUse,c.gcRating)+
      '</div>'+
      '<div class="cr-v110-formula"><span aria-hidden="true">ⓘ</span><div><strong>점수는 이렇게 계산돼요</strong><code>'+rank+' × 35% + '+gc+' × 65% = '+score+'점</code><div>승률·픽률은 참고 통계이며, 이 점수는 두 모드의 평점으로 계산해요.</div></div></div>'+
      '<div class="cr-v110-scope">2026년 11월 14일에 확인한 최근 7일 통계의 스냅샷 · 실시간 자동 갱신 아님 · 표본과 카드별 역할을 함께 확인하세요.</div>';
    if(oldScore)oldScore.replaceWith(newPanel);
    else panel.prepend(newPanel);
    oldRates?.remove();
  }
  window.openDetail=function(name){
    original(name);
    if(typeof CARDS==='undefined')return;
    decorate(CARDS.find(c=>c.en===name));
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();