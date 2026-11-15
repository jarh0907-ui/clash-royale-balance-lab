
/* v1.20 — recent-source deck coach + explainable matchup display.
   All matchup ratings are card-interaction heuristics, NOT measured head-to-head wins. */
(function(){
'use strict';
const SOURCES={
  hogEq:{date:'2026-10-22',title:'호그 + 지진 운영·상성 가이드',url:'https://trophycoach.com/guides/how-to-play-hog-earthquake-deck'},
  bait:{date:'2026-10-22',title:'고블린 통 미끼 운영·주문 추적',url:'https://trophycoach.com/guides/how-to-play-log-bait-deck'},
  mortar:{date:'2026-10-22',title:'박격포 공성·수비 위치 가이드',url:'https://trophycoach.com/guides/how-to-play-mortar-cycle-deck'},
  pekka:{date:'2026-10-22',title:'페카 브리지 스팸 운영 가이드',url:'https://trophycoach.com/guides/how-to-play-pekka-bridge-spam-deck'},
  hogs:{date:'2026-10-22',title:'로얄 호그 순환·분할 공격',url:'https://trophycoach.com/guides/how-to-play-royal-hogs-deck'},
  meta:{date:'2026-11-12',title:'11월 4~11일 메타 변화 분석',url:'https://trophycoach.com/guides/clash-royale-meta-movers'},
  season:{date:'2026-11-04',title:'11월 시즌 89 덱 유형 분석',url:'https://trophycoach.com/guides/clash-royale-meta-decks-2026'},
  report:{date:'2026-11-08',title:'11월 1~8일 주요 덱 변화',url:'https://www.clashdeckster.com/meta-report/2026-11-08'},
  november:{date:'2026-11-01',title:'11월 대표 덱 및 밸런스 해설',url:'https://timesaver.gg/blog/best-clash-royale-decks-october-2026'},
  weekly:{date:'2026-11-01',title:'10월 26일~11월 1일 덱 기록',url:'https://royaledeck.app/meta/archive/2026-w44'}
};
const has=(d,id)=>!!d&&Array.isArray(d.cards)&&d.cards.some(c=>deckFamilyName(c)===id);
const hasAny=(d,ids)=>ids.some(id=>has(d,id));
const every=(d,ids)=>ids.every(id=>has(d,id));
const pretty=(d,id)=>{const found=d.cards.find(c=>deckFamilyName(c)===id);return found&&DECK_INDEX[found]?label(DECK_INDEX[found]):id;};
const typ=(d)=>(d.kind||'컨트롤');
function deckProfile(d){
  let g={
    overview:'각 카드의 역할을 나눠 수비 후 남은 유닛을 공격에 연결하는 덱입니다.',
    opening:'첫 패에서 저비용 유닛을 안전하게 사용해 상대 수비 카드와 마법을 파악합니다.',
    double:'주력 공격 카드를 다시 손에 넣는 속도와 수비에 남길 엘릭서를 함께 계산합니다.',
    defense:'주력 수비 카드로 상대 공격을 막은 다음 살아남은 유닛에 역공을 실어 보냅니다.',
    combo:'이 덱의 핵심 공격 카드와 지원 주문을 한꺼번에 소모하지 않도록 조절하세요.',
    reserve:'상대의 다음 공격을 막을 수 있는 카드 한 장과 엘릭서 여유를 남기세요.',
    mistake:'상대의 수비 수단과 주문 순서를 확인하기 전에 엘릭서를 한 번에 투자하지 마세요.',
    sources:['season'],exact:false
  };
  const set=(x)=>Object.assign(g,x);
  if(has(d,'Hog Rider')&&has(d,'Earthquake'))set({
    overview:'호그로 상대 방어 건물을 먼저 확인하고, 다음 압박에서 지진으로 건물과 타워를 동시에 때리는 순환덱입니다.',
    opening:'호그 라이더를 단독으로 보내 상대가 대포·뇌전탑·인페르노 타워를 쓰는지, 유닛으로 막는지 먼저 살피세요. 지진을 첫 공격부터 무조건 붙이지 않습니다.',
    double:'상대 방어 건물이 나온 시점에 호그 + 지진(7 엘릭서)을 맞춰 사용하세요. 건물 없이 유닛으로 막으면 지진보다 로켓병·정령·통나무 지원이 효율적입니다.',
    defense:(has(d,'Tesla')?'진화 뇌전탑':'진화 대포')+'과 '+(has(d,'Mighty Miner')?'광부 마이티 마이너':'저비용 수비 유닛')+'로 중심 수비를 만든 뒤, 호그를 다시 순환시키세요.',
    combo:'호그 라이더 → 상대 방어 건물 확인 → 다음 호그에 지진을 건물 타이밍에 맞춰 사용. 해골·정령은 건물과 유닛을 끌어 시간을 벌어 줍니다.',
    reserve:'상대가 고비용 탱커를 내면 방어 건물과 '+(has(d,'Mighty Miner')?'마이티 마이너':'핵심 수비 유닛')+'를 보존하세요.',
    mistake:'상대가 유닛으로만 호그를 막는데 지진을 계속 쓰거나, 지진을 너무 일찍 던져 지속시간을 낭비하지 마세요.',
    sources:['hogEq','meta'],exact:true
  });
  else if(has(d,'Hog Rider'))set({
    overview:'저비용 4장 순환으로 호그를 반복 투입하는 클래식 순환덱. 방어 건물의 위치와 손패 순서가 핵심입니다.',
    opening:'해골·아이스 스피릿·아이스 골렘으로 패를 돌리며 상대가 호그를 어떤 카드로 막는지 확인하세요. 호그를 보냈다면 방어용 대포를 낼 비용을 남기세요.',
    double:'상대 대포나 건물이 손에서 빠진 틈에 호그를 다시 보내세요. 파이어볼은 수비 유닛과 타워를 동시에 맞힐 때 가치가 커집니다.',
    defense:'대포 중앙 유도와 아이스 골렘 끌기, 머스킷병 생존이 핵심입니다. 머스킷병을 수비부터 써서 역공에 연결하세요.',
    combo:'대포·해골 수비 → 머스킷병 생존 → 호그로 이어붙이기. 아이스 스피릿은 호그 타격 기회를 만드는 보조 카드입니다.',
    reserve:'대공 유닛이 머스킷병 한 장에 집중되므로 벌룬·라바 상대에게 함부로 버리지 마세요.',
    mistake:'수비용 대포를 공격 주기마다 낭비하거나, 상대 건물이 있는데 계속 단독 호그를 던지지 마세요.',
    sources:['meta','november'],exact:false
  });
  else if(has(d,'Royal Hogs'))set({
    overview:has(d,'Royal Recruits')?'로얄 훈련병을 양쪽으로 분할한 뒤 상대 수비가 얇은 라인에 로얄 호그를 투입하는 분할 압박형입니다.':'아처 퀸·대포 수비 후 로얄 호그를 보내고 지진으로 건물을 부수는 순환형입니다.',
    opening:has(d,'Royal Recruits')?'훈련병 분할 배치와 저비용 카드로 상대 광역 주문을 확인합니다. 호그를 첫 손패에 무리해서 모두 한쪽으로 몰지 마세요.':'해골·정령 등 저비용 카드로 사이클을 돌리며 상대 건물과 광역 유닛을 확인합니다. 아처 퀸은 수비용으로 보존합니다.',
    double:has(d,'Royal Recruits')?'훈련병이 수비를 양쪽으로 분산시키면 더 약한 라인으로 호그를 몰아 넣고, 광역 주문이 빠진 쪽의 추가 유닛을 지원합니다.':'건물이 있는 덱에는 호그 + 지진, 광역 지상 방어가 강한 덱에는 2:2 분할로 압박하세요.',
    defense:has(d,'Royal Recruits')?'훈련병·고블린 우리·재피로 상대 돌진을 끊고 비행 머신으로 대공을 담당합니다.':'대포 중앙 유도와 아처 퀸 원거리 공격으로 막고, 생존한 퀸 앞에 로얄 호그를 붙입니다.',
    combo:'상대 광역 유닛 위치 파악 → 로얄 호그의 한쪽 집중/양쪽 분할 선택. 지진이 있다면 방어 건물과 겹치게 사용하세요.',
    reserve:'상대가 발키리·볼러·메가 나이트를 갖고 있다면 네 마리 호그를 한 라인에 묶어 보내지 마세요.',
    mistake:'상대 광역 유닛과 건물이 모두 준비된 상태에서 로얄 호그를 무조건 한 라인에만 사용하지 마세요.',
    sources:['hogs','report','meta'],exact:!has(d,'Royal Recruits')
  });
  else if(has(d,'Goblin Barrel'))set({
    overview:'상대의 통나무·화살·감전 사용을 추적해 작은 주문이 빠진 직후 고블린 통으로 피해를 누적하는 미끼형입니다.',
    opening:'프린세스·고블린 갱·다트 고블린 등으로 상대 소형 주문을 확인합니다. 첫 고블린 통은 상대 대응 카드를 파악하는 용도로 쓰세요.',
    double:'상대 소형 주문이 소모되면 즉시 고블린 통을 사용하고, '+(has(d,'Wall Breakers')?'해골 돌격병으로 반대 라인 압박을 더합니다.':has(d,'Rocket')?'로켓은 유리한 엘릭서 교환이나 타워 마무리에 보존합니다.':'다트 고블린과 프린세스로 지속 견제합니다.'),
    defense:has(d,'Inferno Tower')?'인페르노 타워는 상대 대형 탱커용으로 남기고 기사·군중 유닛으로 가벼운 공격을 막습니다.':'기사·대포 등 저비용 방어 카드로 상대 공격을 받아내면서 통으로 역공합니다.',
    combo:'프린세스/고블린 갱으로 통나무 유도 → 해당 주문이 손에서 빠진 순간 고블린 통 → 다른 라인 분산 압박.',
    reserve:'고블린 통이 막혀도 상대가 주문을 소비했다면 다음 주기에 유리합니다. 작은 주문의 순서를 기록하세요.',
    mistake:'고블린 통과 고블린 갱을 같은 광역 주문에 한꺼번에 잃거나, 상대가 주문 2개를 가진데도 무리하게 통을 반복하지 마세요.',
    sources:['bait','meta'],exact:true
  });
  else if(has(d,'Mortar'))set({
    overview:'박격포를 상대 타워를 겨냥하는 공성용과 적 탱커를 끌어오는 수비용으로 전환하는 덱입니다.',
    opening:'초반에는 수비 박격포와 소형 유닛으로 상대 지상 탱커·지진 보유 여부를 확인하세요. 공격 박격포는 상대 탱커가 손에서 빠진 순간이 좋습니다.',
    double:'상대가 고비용 탱커를 뒤에 낼 때 반대 라인으로 박격포를 배치하거나 '+(has(d,'Miner')?'광부 + 독으로 짤짤이 피해를 누적합니다.':'해골 통·고블린 갱으로 주문을 유도해 추가 타격을 노립니다.'),
    defense:'박격포의 중앙 유도와 '+(has(d,'Cannon Cart')?'대포 카트':'기사/궁수')+'로 수비를 버틴 뒤 살아남은 지원 유닛을 앞세워 역공합니다.',
    combo:'상대 탱커가 회전에서 빠짐 → 강 근처 박격포 → 고블린·건물 수비로 박격포 유지. 지진 상대에게는 무리한 건물 중첩을 줄이세요.',
    reserve:'진화 박격포도 상대가 대형 탱커를 세울 수 있으면 공격보다 수비 용도로 전환하세요.',
    mistake:'박격포를 매번 공격으로만 써서 호그·자이언트의 유도를 잃지 마세요. 지진·광역 수비에 투자를 몰지 마세요.',
    sources:['mortar','meta'],exact:true
  });
  else if(has(d,'X-Bow'))set({
    overview:'석궁을 상대 타워에 고정(lock)시키고 뇌전탑·저비용 수비 카드로 시간을 벌어 지키는 공성형입니다.',
    opening:'뇌전탑과 값싼 카드를 이용해 상대 고비용 탱커와 지진을 먼저 확인하세요. 첫 석궁은 상대 탱커가 손에 있을 때 무리하게 내지 마세요.',
    double:'상대가 반대 라인에 무거운 카드를 투자했거나 공격용 건물을 잃었을 때 석궁을 설치하고 수비에 엘릭서를 집중합니다.',
    defense:'석궁이 타워에 잠기면 저비용 유닛으로 적 탱커 어그로를 빼고 뇌전탑·궁수로 지원 유닛을 정리합니다.',
    combo:'상대 탱커/지진이 손에서 빠짐 → 석궁 → 뇌전탑·기사·궁수로 방어. 필요하면 파이어볼로 원거리 수비 유닛을 정리합니다.',
    reserve:'상대가 지진을 갖고 있다면 석궁/뇌전탑을 같은 주문에 맞지 않도록 조절하세요.',
    mistake:'공격 석궁 하나를 지키려다 전부 소모하고 반대 라인 타워를 내주지 마세요.',
    sources:['weekly','season'],exact:false
  });
  else if(has(d,'P.E.K.K.A'))set({
    overview:'페카로 대형 지상 공격을 받아낸 뒤 배틀 램·도둑·로얄 고스트로 다리 앞을 즉시 압박하는 브리지 스팸입니다.',
    opening:'상대 탱커와 건물 카드를 확인하면서 도둑·고스트·배틀 램을 번갈아 사용해 수비 순서를 꼬이게 하세요. 페카는 반드시 필요할 때 수비에 사용합니다.',
    double:'상대가 7~8 엘릭서 탱커를 뒤에서 놓는다면 반대 라인으로 배틀 램 + 도둑을 보내 엘릭서를 강제로 분산시키세요.',
    defense:'페카로 대형 지상 유닛을 제거하고 일렉트로 마법사로 인페르노류를 리셋하며, 남은 유닛 뒤에 배틀 램을 붙입니다.',
    combo:'페카 수비 성공 → 생존한 페카 앞에서 상대가 비용을 쓰게 만들고 반대 라인 배틀 램·도둑 압박. 마법 궁수는 정렬 타격 각도를 노리세요.',
    reserve:'대공 수단이 제한된 덱이므로 일렉트로 마법사·마법 궁수를 공중 상대에 남기세요.',
    mistake:'페카를 별 이유 없이 상대 강 앞에 낸 후 상대가 반대 라인으로 압박하도록 허용하지 마세요.',
    sources:['pekka','meta'],exact:true
  });
  else if(has(d,'Golem'))set({
    overview:'골렘을 방패로 마녀·공중 지원군을 쌓는 후반 대형 공격형입니다.',
    opening:'1배 엘릭서에는 수비 우선. 상대가 초반부터 브리지 압박이 강하면 골렘을 먼저 뒤에 놓지 않습니다.',
    double:'상대가 공격을 막느라 엘릭서를 소모한 뒤 골렘을 뒤에서 내고 나이트 위치와 '+(has(d,'Phoenix')?'피닉스':'베이비 드래곤')+'를 지원해 한 번에 밀어붙입니다.',
    defense:'골렘을 배치하기 전에 상대의 빠른 반대 라인 공격을 방어할 수 있는 유닛과 소형 주문을 확보하세요.',
    combo:'골렘 후방 → 나이트 위치/공중 지원 → 상대의 단일 대미지 방어 카드에 '+(has(d,'Lightning')?'번개':'소형 마법')+' 사용.',
    reserve:'인페르노·페카·건물 대응 카드를 확인하고 골렘을 무리하게 먼저 내지 않습니다.',
    mistake:'골렘 뒤에 모든 유닛을 붙여 광역 주문 하나에 지원군을 잃는 배치를 피하세요.',
    sources:['november','meta'],exact:false
  });
  else if(has(d,'Graveyard'))set({
    overview:has(d,'Giant')?'자이언트가 타워의 공격을 흡수하는 동안 무덤을 사용해 해골 피해를 누적하는 탱커-무덤형입니다.':'수비 후 살아남은 탱커 앞에서 무덤 + 독을 사용해 타워를 압박하는 스플래시 컨트롤입니다.',
    opening:'핵심 탱커와 독을 무작정 먼저 쓰지 말고, 상대의 발키리·독·광역 마법을 확인하세요.',
    double:'수비 유닛이 살아남았을 때 상대 타워가 그 유닛을 때리도록 한 뒤 무덤을 사용하고, 광역 대응이 확인되면 독으로 처리합니다.',
    defense:'볼러·베이비 드래곤·아이스 마법사 등 가진 수비 유닛으로 적 뭉친 병력을 막고 타워 앞에서 역공 기회를 만드세요.',
    combo:'탱커가 타워의 공격을 받는 타이밍에 무덤 → 상대 무덤 방어 유닛이 나오는 위치에 독. 독이 필요 없는 상대에게는 아껴도 됩니다.',
    reserve:'상대가 독을 쓴 뒤 다시 돌려오는 속도를 확인하고 무덤 투입 타이밍을 조절하세요.',
    mistake:'탱커 없이 무덤만 계속 보내거나 상대가 독·광역 카드를 들고 있을 때 모든 공격을 한곳에 겹치지 마세요.',
    sources:['report','november'],exact:false
  });
  else if(has(d,'Lava Hound'))set({
    overview:'라바 하운드가 상대 대공 공격을 대신 받는 동안 벌룬 또는 광부·비행 유닛을 지원하는 공중 압박 덱입니다.',
    opening:'상대 대공 유닛·건물·번개 보유 여부를 살펴보세요. 상대가 빠르게 반대 라인으로 압박한다면 라바 선출은 위험합니다.',
    double:'라바가 강을 건널 때 '+(has(d,'Balloon')?'벌룬':'인페르노 드래곤/공중 공격 유닛')+'을 붙이고, 화살·파이어볼로 수비 중인 대공 유닛을 제거하세요.',
    defense:'지상 유닛이 적으니 묘비와 지원 유닛으로 지상 돌진을 막은 뒤 역공 엘릭서를 확보하세요.',
    combo:'라바 후방 배치 → 상대 대공이 나온 뒤 벌룬/비행 유닛 연결 → 지원 마법으로 대공 제거.',
    reserve:'강한 대공 유닛을 상대가 아직 쓰지 않았으면 벌룬을 너무 일찍 함께 내지 마세요.',
    mistake:'라바를 낸 순간 반대 라인을 무방비로 만들거나 대공 유닛에 대응할 주문을 미리 소모하지 마세요.',
    sources:['november','season'],exact:false
  });
  else if(has(d,'Balloon'))set({
    overview:'수비 후 벌룬을 타워에 접근시키고, '+(has(d,'Freeze')?'프리즈로 마지막 방어 타이밍을 끊는':'타워 앞에 탱커를 세우는')+' 공중 공격형입니다.',
    opening:'상대 대공 유닛·토네이도를 먼저 확인하고, 벌룬을 단독으로 무턱대고 보내지 마세요.',
    double:'상대의 핵심 대공 카드가 손에서 빠진 순간 벌룬과 '+(has(d,'Freeze')?'프리즈':'지원 유닛')+'를 함께 사용합니다.',
    defense:'볼러·베이비 드래곤·토네이도로 지상 대형 공격을 처리하고 살아남은 유닛 뒤에 벌룬을 실으세요.',
    combo:'벌룬 접근 → 상대 대공 및 건물 배치 확인 → 프리즈가 있다면 타워와 방어 유닛을 함께 얼려 타격 기회를 얻습니다.',
    reserve:'프리즈는 대공이 빠지기도 전에 미리 쓰면 엘릭서 낭비가 크니 확실한 타격 구간을 노리세요.',
    mistake:'상대가 토네이도와 대공 두 장을 가진 상태에서 벌룬 + 프리즈를 무리하게 투자하지 마세요.',
    sources:['november','season'],exact:false
  });
  else if(has(d,'Electro Giant'))set({
    overview:'일렉트로 자이언트의 반사 피해로 근접 수비를 압박하고 토네이도로 적을 몸 주변으로 모으는 빅덱입니다.',
    opening:'상대 건물과 고화력 유닛을 확인하세요. 일렉트로 자이언트를 1배 엘릭서에 무리하게 후방 배치하면 반대 라인에 취약합니다.',
    double:'상대가 공격 유닛을 소진했을 때 일렉트로 자이언트를 앞세우고 토네이도로 수비 병력을 반사 피해 범위로 모으세요.',
    defense:'대포·폭탄병·피닉스를 이용해 가볍게 방어하고, 번개는 상대 핵심 원거리/건물 수비를 제거할 때 씁니다.',
    combo:'일렉트로 자이언트 진입 → 방어 유닛이 모이면 토네이도 → 건물/고화력 수비에는 번개로 대응.',
    reserve:'상대 페카·인페르노 계열의 위치를 확인하고 지상 탱커를 일방적으로 밀어 넣지 마세요.',
    mistake:'상대가 반대 라인으로 빠르게 밀어붙일 수 있는데 7 엘릭서 이상을 선투자하지 마세요.',
    sources:['meta','season'],exact:false
  });
  else if(has(d,'Sparky'))set({
    overview:'스파키를 자이언트 계열 탱커 뒤에 두어 일제타격을 쌓는 대형 압박 덱입니다.',
    opening:'상대 감전·일렉트로 마법사·번개 같은 초기화 수단을 확인합니다. 스파키가 혼자 강을 건너지 않게 하세요.',
    double:'자이언트 고블린이 어그로를 받는 동안 스파키가 지원 병력을 타격하게 하고, 돌격 유닛은 반대 라인 압박에 활용하세요.',
    defense:'미니 페카·다크 프린스로 빠른 지상 공격을 막고 스파키를 수비에도 이용하세요.',
    combo:'스파키 방어 → 앞에 자이언트 고블린 → 상대의 초기화 카드를 예측해 감전·분노 마법 타이밍 조절.',
    reserve:'상대 감전이나 일렉트로 마법사가 나온 뒤 스파키가 재차 공격할 수 있도록 방어 유닛을 남겨 주세요.',
    mistake:'스파키와 지원 유닛을 한 번에 초기화 주문 범위에 몰아 넣지 마세요.',
    sources:['november','season'],exact:false
  });
  else if(has(d,'Miner')&&hasAny(d,['Wall Breakers','Poison']))set({
    overview:'광부로 상대 타워·원거리 수비 유닛을 견제하고 '+(has(d,'Wall Breakers')?'해골 돌격병':'독')+'으로 낮은 비용의 지속 피해를 쌓는 컨트롤형입니다.',
    opening:'광부의 첫 배치 위치를 섞으면서 상대의 건물과 소형 주문을 파악하고, 마법 궁수가 있다면 관통 각도를 노립니다.',
    double:'광부가 탱킹할 때 돌격병을 반대/같은 라인에 선택적으로 보내고, 독은 수비 유닛과 타워를 함께 때릴 때 사용합니다.',
    defense:'기사·폭탄 타워·궁수 등 수비 카드로 먼저 비용 이득을 만들고 남은 유닛과 함께 광부를 보냅니다.',
    combo:'상대 수비 카드가 빠짐 → 광부로 어그로 분산 → 돌격병/독으로 타워 연결.',
    reserve:'상대의 저비용 유닛이나 건물이 아직 손에 있다면 광부·돌격병을 동시에 모두 소모하지 마세요.',
    mistake:'광부를 늘 같은 위치에 보내 예측을 허용하거나 수비 손해를 보며 억지로 타워 피해를 노리지 마세요.',
    sources:['season','november'],exact:false
  });
  else if(has(d,'Goblin Drill'))set({
    overview:'고블린 드릴을 타워 옆으로 보내 반복 타격을 노리는 순환 공격 덱입니다.',
    opening:'드릴 위치를 바꾸며 상대의 광역 수비와 통나무/화살을 확인하고, 초기에는 방어용 뇌전탑을 보존하세요.',
    double:'상대가 드릴을 막는 카드가 손에서 빠졌을 때 드릴을 재사용하고, 저비용 카드로 빠르게 다음 공격을 준비합니다.',
    defense:'뇌전탑·폭탄병·기사로 막고, 살아남은 수비 유닛이 강을 건널 때 드릴 압박을 연결합니다.',
    combo:'드릴 소환 → 상대 광역 수비 사용 확인 → 다음 주기에 파이어볼로 그 유닛을 함께 맞히기.',
    reserve:'상대가 발키리·볼러를 갖고 있을 경우 드릴을 같은 자리로 반복하지 마세요.',
    mistake:'드릴과 소형 유닛을 한 주문에 소모하지 말고 수비 건물 비용을 남기세요.',
    sources:['season'],exact:false
  });
  else if(has(d,'Royal Giant'))set({
    overview:'낚시꾼으로 수비 유닛의 위치를 바꾸고 로얄 자이언트를 강 앞에 투입해 타워를 때리는 컨트롤 덱입니다.',
    opening:'낚시꾼과 사냥꾼으로 상대 탱커를 처리하고 상대 건물·인페르노 카드를 먼저 확인하세요.',
    double:'살아남은 낚시꾼·사냥꾼 앞에 로얄 자이언트를 배치하고 번개로 수비 건물과 딜러를 동시에 때릴 기회를 보세요.',
    defense:'낚시꾼의 끌기와 사냥꾼 근접 화력으로 상대 주력 유닛을 막습니다.',
    combo:'낚시꾼 중앙 유도 → 사냥꾼으로 처치 → 로얄 자이언트 다리 압박.',
    reserve:'상대가 인페르노를 지녔다면 번개를 수비 건물에 쓸 수 있게 남기세요.',
    mistake:'낚시꾼을 단독으로 무리하게 공격에 소모하고 다음 호그·탱커를 방어하지 못하지 않도록 하세요.',
    sources:['season','meta'],exact:false
  });
  else if(has(d,'Three Musketeers'))set({
    overview:'삼총사를 양쪽으로 분할해 한 번의 대형 주문으로 모두 정리하기 어렵게 만들고 배틀 램으로 다른 라인을 압박합니다.',
    opening:'엘릭서 정제소를 무리하게 내기 전에 상대 로켓·파이어볼을 확인하고 배틀 램·도둑으로 약한 반대 라인을 찌르세요.',
    double:'삼총사를 2:1로 나눠 상대의 큰 주문을 유도하고 비어 있는 쪽으로 배틀 램을 보내 수비를 분산시킵니다.',
    defense:'아이스 골렘·배틀 램으로 어그로를 끌며 머스킷병의 공격을 지원하고 엘릭서 우위를 만드세요.',
    combo:'삼총사 분할 → 상대 파이어볼/로켓의 사용 위치 확인 → 반대 라인 배틀 램과 도둑 배치.',
    reserve:'상대 로켓을 확인했다면 삼총사 세 명을 붙여 배치하지 마세요.',
    mistake:'한 줄에 삼총사를 모아 로켓 한 방에 잃는 배치를 피하세요.',
    sources:['season','meta'],exact:false
  });
  else if(has(d,'Elixir Golem'))set({
    overview:'엘릭서 골렘과 배틀 힐러가 서로를 살리는 동안 지원 유닛을 겹쳐 한 번의 공격을 폭발시키는 덱입니다.',
    opening:'상대 광역 주문과 고화력 유닛을 확인하고, 무리하게 엘릭서 골렘을 먼저 사용하지 마세요.',
    double:'수비에서 살아남은 힐러·일렉트로 드래곤 앞에 엘릭서 골렘을 놓고 분노를 더해 순간 화력을 만듭니다.',
    defense:'상대 단일 고화력 유닛을 보조 드래곤과 마법으로 처리하고 힐러를 보존하세요.',
    combo:'수비 성공 → 배틀 힐러 + 일렉트로 드래곤 → 앞에 엘릭서 골렘 → 안전할 때 분노 마법.',
    reserve:'엘릭서 골렘 파괴 시 상대에게 엘릭서가 넘어갈 수 있으므로 실패했을 때 수비 비용을 미리 생각하세요.',
    mistake:'힐러도 없고 수비 카드도 없는데 엘릭서 골렘을 단독으로 공격하지 마세요.',
    sources:['november','meta'],exact:false
  });
  else if(has(d,'Mega Knight'))set({
    overview:'메가 나이트로 지상 밀집 공격을 막고, 그 앞에 미끼/광부를 붙여 반격하는 덱입니다.',
    opening:'스켈레톤 통과 고블린 통 등 미끼 카드로 상대 소형 주문을 확인합니다. 메가 나이트는 상대 지상 밀집 공격에 맞춰 수비로 사용하세요.',
    double:'메가 나이트가 살아남으면 광부와 스켈레톤 통을 다른 라인에 분산시켜 상대 수비 엘릭서를 나눕니다.',
    defense:'메가 나이트 착지 피해와 인페르노 드래곤으로 단일 대형 유닛을 처리합니다.',
    combo:'상대 지상 유닛 뭉침 → 메가 나이트 수비 → 광부/미끼로 압박.',
    reserve:'상대 페카처럼 메가 나이트를 단독으로 잡는 카드를 확인하고, 그 카드가 소모됐을 때 공격하세요.',
    mistake:'메가 나이트를 상대 페카 앞에 단독으로 던지거나 군중 유닛을 광역 주문에 겹쳐 잃지 마세요.',
    sources:['meta','season'],exact:false
  });
  else if(typ(d)==='분할')set({
    overview:'서로 다른 라인으로 병력을 분산해 상대 광역 주문을 강제로 나누어 쓰게 하는 덱입니다.',
    opening:'상대의 큰 광역 주문과 지상 방어 수단을 먼저 확인한 뒤 분할 배치를 시작합니다.',
    double:'한쪽에 방어 병력이 몰렸을 때 반대 라인에 이동 빠른 유닛으로 압박합니다.',
    defense:'넓은 범위의 수비 병력을 분할 배치해 방어 후 역공에 활용합니다.',
    combo:'병력 분할 → 상대 수비 배치 확인 → 빈 라인에 로얄 호그 추가.',
    reserve:'한 라인의 방어를 버려야 하는 상황인지, 두 라인을 다 살릴 수 있는지 엘릭서를 계산하세요.',
    mistake:'상대가 두 라인 모두 광역 수비를 준비했다면 분할이 무조건 유리하지 않습니다.',
    sources:['hogs','season'],exact:false
  });
  else if(has(d,'Giant'))set({
    overview:'자이언트로 전방 타워/수비 공격을 흡수하며 프린스·지원 유닛을 동반하는 대형 공격형입니다.',
    opening:'상대의 인페르노·페카 보유 여부를 확인하고 빠른 압박에 맞설 수비 엘릭서를 남깁니다.',
    double:'상대가 수비에 엘릭서를 소비했을 때 자이언트 뒤에 프린스·다크 프린스를 연결해 한 번에 밀어붙입니다.',
    defense:'프린스류로 단일 공격을 받아내고 살아남은 유닛 앞에 자이언트를 놓아 역공합니다.',
    combo:'프린스/다크 프린스 수비 → 자이언트가 앞에서 탱킹 → 마법으로 방어 유닛 제거.',
    reserve:'상대 방어 건물과 대형 단일 딜러를 제거할 주문을 남기세요.',
    mistake:'무방비 상태로 자이언트를 뒤에 배치해 반대 라인 타워를 잃지 마세요.',
    sources:['november','meta'],exact:false
  });
  return g;
}
function sourceTags(profile){
  const list=[...new Set(profile.sources||[])].map(k=>SOURCES[k]).filter(Boolean).slice(0,3);
  return '<div class="cr-coach-sources"><strong>최근 참고 자료 (2026.10.16~11.15)</strong>'+
    list.map(s=>'<a class="cr-coach-source" href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.date)+' · '+esc(s.title)+' ↗</a>').join('')+'</div>';
}
window.renderRecentDeckCoach=function(d){
  const g=deckProfile(d);
  const labelText=g.exact?'최근 유형 운영 가이드 + 해당 8장 카드 구성 반영':'최근 시즌 메타 참고 + 해당 8장 카드 구성 기반 운영 추론';
  const phase=(title,body)=>'<article class="cr-coach-phase"><h4>'+title+'</h4><p>'+esc(body)+'</p></article>';
  const action=(title,body)=>'<div class="cr-coach-action"><b>'+title+'</b><p>'+esc(body)+'</p></div>';
  return '<div class="cr-coach-intro"><div><h3>🎮 이 덱은 이렇게 운용하세요</h3><p>'+esc(g.overview)+'</p></div>'+
   '<span class="cr-coach-updated">● 최근 자료 대조 · 2026.11.15</span></div>'+
   '<div class="cr-coach-actions">'+action('핵심 공격 조합',g.combo)+action('반드시 남겨 둘 수비',g.reserve)+'</div>'+
   '<div class="cr-coach-phases">'+phase('① 초반 — 상대 카드 확인',g.opening)+phase('② 2배 엘릭서 — 주력 공격',g.double)+phase('③ 수비 → 역공',g.defense)+phase('④ 반복 운영의 핵심',g.reserve)+'</div>'+
   '<div class="cr-coach-mistake"><b>⚠ 자주 하는 실수</b> · '+esc(g.mistake)+'</div>'+
   sourceTags(g)+'<p class="cr-coach-caveat">'+esc(labelText)+'입니다. 링크의 덱과 카드 8장·진화/영웅 구성이 다를 수 있으며, 영상 리플레이를 직접 분석한 것으로 표시하지 않습니다. 최근 자료가 해당 조합을 다루지 않으면 덱 구성에 따른 전략 추정으로 해석해 주세요.</p>';
};
function counterEvidence(victim,foe){
  const r=[];
  function add(score,reason,response){r.push({score,reason,response});}
  if(has(victim,'Hog Rider')){
    if(has(foe,'Tornado'))add(3,'토네이도가 호그 라이더를 타워에서 떨어뜨리거나 킹 타워 활성화를 노립니다.','상대 토네이도 사용 뒤 호그를 보내거나 지진/지원 병력으로 다른 수비를 먼저 제거하세요.');
    if(hasAny(foe,['Cannon','Tesla','Bomb Tower','Inferno Tower','Goblin Cage'])){
      const building=['Cannon','Tesla','Bomb Tower','Inferno Tower','Goblin Cage'].filter(x=>has(foe,x)).map(x=>pretty(foe,x)).join('·');
      add(has(victim,'Earthquake')?0.7:1.6,building+'이 호그를 중앙으로 끌어 타워 타격을 지연시킵니다.','상대 건물 사이클을 세거나 지진이 있다면 호그 접근 시점에 맞춰 겹쳐 주세요.');
    }
    if(hasAny(foe,['Hunter','Mini P.E.K.K.A']))add(1.3,'사냥꾼/미니 페카가 호그를 짧은 시간에 제거해 역공 유닛까지 남길 수 있습니다.','해골·정령을 먼저 배치하여 상대 단일 딜러의 목표를 분산하세요.');
  }
  if(has(victim,'Goblin Barrel')){
    const spells=['The Log','Barbarian Barrel','Arrows','Zap','Snowball','Giant Snowball'].filter(x=>has(foe,x));
    if(spells.length) add(spells.length>=2?2.6:1.35,spells.map(x=>pretty(foe,x)).join('·')+' '+(spells.length>=2?'등 여러 소형 마법이 고블린 통을 번갈아 처리해 미끼 효과를 줄입니다.':'으로 고블린 통에 안정적으로 대응할 수 있습니다.'),'상대 주문 하나만 뺀 상태에서 통을 쓰지 말고, 보유한 소형 주문 수와 순환 순서를 함께 확인하세요.');
  }
  if(has(victim,'Graveyard')){
    if(has(foe,'Poison'))add(2.9,'독 마법이 무덤의 해골이 생기는 영역을 계속 견제해 누적 피해를 줄입니다.','상대 독이 다른 수비에 사용된 직후 무덤을 사용하거나 다른 라인에 압박을 먼저 걸어 보세요.');
    if(hasAny(foe,['Valkyrie','Bowler','Baby Dragon']))add(1.25,'발키리·볼러·베이비 드래곤 같은 범위 공격 유닛이 무덤 해골을 정리합니다.','탱커로 범위 공격 유닛을 다른 위치로 유도하고 독으로 지원하세요.');
  }
  if(hasAny(victim,['X-Bow','Mortar'])){
    if(has(foe,'Earthquake'))add(3.1,'지진 마법이 석궁·박격포와 방어 건물을 동시에 약화시켜 공성 유지 시간을 줄입니다.','한 장소에 건물을 겹치지 말고 수비용 공성 건물과 공격용 배치를 구분하세요.');
    if(hasAny(foe,['Golem','Giant','Electro Giant','Royal Giant']))add(1.5,'대형 탱커가 공성 건물의 공격을 대신 받아 타워 고정을 막을 수 있습니다.','상대 탱커가 손에서 빠졌거나 반대 라인에 투자했을 때 공격 공성 건물을 세우세요.');
    if(hasAny(foe,['Battle Ram','Bandit']))add(0.8,'다리 앞 빠른 공격으로 공성 건물 보호에 필요한 엘릭서를 분산시키게 합니다.','상대 브리지 유닛이 나온 뒤 수비 성공 시점에 공성 건물을 세우세요.');
  }
  if(has(victim,'Royal Hogs')){
    const splash=['Valkyrie','Bowler','Executioner','Mega Knight','Bomb Tower'].filter(n=>has(foe,n));
    if(splash.length)add(splash.length>1?2.3:1.4,splash.map(x=>pretty(foe,x)).join('·')+'의 광역 피해가 모여 오는 로얄 호그 여러 마리를 동시에 공격합니다.','호그를 2:2로 분할하거나 상대 광역 유닛이 다른 라인에 사용된 뒤 한곳에 집중하세요.');
    if(has(foe,'Tornado'))add(1.2,'토네이도로 로얄 호그를 모아 타워와 광역 유닛의 방어 효율을 올릴 수 있습니다.','한 라인에 몰아 공격하기보다 분할 압박을 검토하세요.');
  }
  if(hasAny(victim,['Golem','Giant','Goblin Giant','Royal Giant','Electro Giant','Elixir Golem'])){
    if(has(foe,'P.E.K.K.A'))add(2.45,'페카의 높은 단일 피해가 대형 지상 탱커를 상대하고 수비 후 역공의 중심이 됩니다.','페카의 위치를 확인하고 지원 유닛을 먼저 처리하거나 반대 라인을 압박하세요.');
    if(hasAny(foe,['Inferno Tower','Inferno Dragon'])&&!has(victim,'Electro Giant'))add(1.65,'인페르노류의 누적 피해로 대형 탱커 체력을 빠르게 깎을 수 있습니다.','감전·번개로 인페르노를 방해하거나 지원 유닛을 먼저 제거하세요.');
    if(hasAny(foe,['Battle Ram','Bandit'])&&has(victim,'Golem'))add(1.3,'상대가 골렘을 후방에 배치한 직후 배틀 램·도둑으로 반대 라인을 압박합니다.','골렘을 내기 전에 반대 라인 수비 비용을 반드시 남기세요.');
  }
  if(hasAny(victim,['Balloon','Lava Hound'])){
    if(has(foe,'Tornado'))add(1.85,'토네이도가 벌룬을 타워에서 멀리 끌어 벌룬 한 방을 지연시키거나 킹 타워 활성화를 노립니다.','토네이도 타이밍을 먼저 빼고 벌룬을 내거나 상대 대공을 주문으로 지원하세요.');
    const air=['Hunter','Musketeer','Archer Queen','Electro Wizard','Phoenix','Inferno Dragon','Tesla','Archers','Magic Archer','Baby Dragon','Mega Minion','Electro Dragon'].filter(n=>has(foe,n));
    if(air.length>=2)add(air.length>=3?2:1.35,air.slice(0,4).map(x=>pretty(foe,x)).join('·')+' 등 대공 방어 카드가 벌룬·라바 지원 유닛을 여러 차례 막아냅니다.','상대 대공이 소모된 뒤 벌룬을 연결하고 화살·파이어볼로 지원 방어를 제거하세요.');
  }
  if(has(victim,'Sparky')){
    if(hasAny(foe,['Electro Wizard','Electro Dragon']))add(2.8,'일렉트로 계열 마법사의 반복 감전이 스파키 충전을 끊습니다.','해당 감전 유닛을 다른 라인으로 유인하거나 지원 주문으로 먼저 처리하세요.');
    else if(has(foe,'Zap'))add(1.1,'감전 마법이 스파키 발사 시점을 늦춰 방어 시간을 벌어 줍니다.','상대 감전 사용 직후 스파키가 한 번 발사할 수 있도록 지원 유닛을 보호하세요.');
  }
  if(has(victim,'Three Musketeers')){
    if(has(foe,'Rocket'))add(3.2,'로켓이 삼총사 다수를 한꺼번에 맞히면 큰 엘릭서 이득을 얻을 수 있습니다.','삼총사를 2:1로 분할해 로켓이 세 명을 모두 맞히지 못하게 하세요.');
    else if(has(foe,'Fireball'))add(1.5,'파이어볼은 삼총사를 동시에 맞힐 때 강력한 주문 교환을 만듭니다.','가능하면 분할 배치하고 방어 유닛과 같이 맞지 않도록 해 주세요.');
  }
  if(has(victim,'P.E.K.K.A')&&hasAny(foe,['Balloon','Lava Hound'])){
    const airDefense=['Electro Wizard','Magic Archer','Phoenix','Musketeer','Hunter','Archers'].filter(c=>has(victim,c));
    if(airDefense.length<=2)add(2,'공중 덱은 페카가 타격할 수 없는 비행 유닛을 공격하고 제한된 대공 수비를 강요합니다.','일렉트로 마법사·마법 궁수의 대공 공격을 보존하고 반대 라인에 배틀 램으로 압박하세요.');
  }
  return r;
}
function evaluateMatch(own,other,side){
  const enemy=counterEvidence(own,other);
  const mine=counterEvidence(other,own);
  const enemyScore=enemy.reduce((sum,x)=>sum+x.score,0);
  const mineScore=mine.reduce((sum,x)=>sum+x.score,0);
  const difference=enemyScore-mineScore;
  if(side==='hard'&&difference<1.15)return null;
  if(side==='easy'&&difference> -1.15)return null;
  const facts=(side==='hard'?enemy:mine).sort((a,b)=>b.score-a.score);
  if(!facts.length)return null;
  return {opponent:other,strength:Math.abs(difference),facts:facts.slice(0,3),response:side==='hard'?facts[0].response:'상대의 핵심 방어 수단을 미리 확인하고 위 유리한 카드가 손에 있을 때 공격을 시작하세요.'};
}
window.renderDeckMatch=function(d,side){
  const rows=allDecks().filter(x=>x.id!==d.id).map(x=>evaluateMatch(d,x,side)).filter(Boolean).sort((a,b)=>b.strength-a.strength).slice(0,3);
  if(!rows.length)return '<div class="cr-counter-empty">내장 40개 덱 중 확실한 카드 상성 근거를 찾지 못했습니다. 실제 대전 기록으로 확인해야 합니다.</div>';
  return '<div class="cr-counter-stack">'+rows.map(x=>{
    const deck=x.opponent;
    const title='<div class="cr-counter-top"><strong class="cr-counter-title">'+esc(deck.name)+'</strong><span class="cr-counter-tag">'+esc(deck.kind)+' · 상성 추정</span></div>';
    const why='<div class="cr-counter-why"><strong>'+(side==='hard'?'⚔ 왜 이 덱이 카운터일까?':'✓ 왜 이 덱에 유리할까?')+'</strong><ul>'+x.facts.map(f=>'<li>'+esc(f.reason)+'</li>').join('')+'</ul></div>';
    return '<article class="cr-counter-card">'+title+deckImageRow(deck)+why+'<div class="cr-counter-response"><b>'+(side==='hard'?'대응하는 방법':'운영 포인트')+'</b> · '+esc(x.response)+'</div>'+
      '<div class="cr-counter-foot"><small>카드 상호작용 분석 · 상대전적 승률 아님</small><button class="btn sm" data-action="deck-view" data-id="'+esc(deck.id)+'">이 덱 8장 자세히 보기</button></div></article>';
  }).join('')+'</div>';
};
if(typeof state!=='undefined'&&state.page==='decks'&&typeof deckRerender==='function')deckRerender();
})();
