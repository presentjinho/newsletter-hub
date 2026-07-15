// 배포 후 OWNER/REPOSITORY를 실제 GitHub 저장소 경로로 바꾸세요.
const ISSUE_URL = 'https://github.com/presentjinho/newsletter-hub/issues/new/choose';

const newsletters = [
  { id:'newneek', name:'뉴닉', category:'시사', frequency:'매일', frequencyGroup:'daily', description:'세상이 궁금한 사람들을 위한 쉽고 친절한 뉴스.', url:'https://newneek.co/', daysSince:0, typical:'평일 아침', status:'alive', interests:['시사','재테크'], trust:['최근 30일 발행','공식 구독 링크 확인'] },
  { id:'outstand', name:'아웃스탠딩', category:'비즈니스', frequency:'평일', frequencyGroup:'daily', description:'스타트업과 IT 비즈니스의 맥락을 깊게 읽습니다.', url:'https://outstand.co.kr/', daysSince:0, typical:'평일', status:'alive', interests:['AI','커리어','재테크'], trust:['최근 30일 발행','공식 구독 링크 확인','유료 포함'] },
  { id:'stibee', name:'스티비', category:'마케팅', frequency:'주 1회', frequencyGroup:'weekly', description:'이메일 마케팅과 뉴스레터를 잘 만드는 법.', url:'https://stibee.com/', daysSince:1, typical:'보통 화요일', status:'alive', interests:['디자인','커리어'], trust:['최근 30일 발행','공식 구독 링크 확인'] },
  { id:'geeknews', name:'긱뉴스', category:'테크', frequency:'매일', frequencyGroup:'daily', description:'개발자와 기술 애호가가 함께 고르는 오늘의 링크.', url:'https://news.hada.io/', daysSince:0, typical:'매일 오전', status:'alive', interests:['AI','커리어'], trust:['최근 30일 발행','공식 구독 링크 확인'] },
  { id:'longblack', name:'롱블랙', category:'라이프', frequency:'매일', frequencyGroup:'daily', description:'하루 한 편, 오래 남는 브랜드와 사람의 이야기.', url:'https://www.longblack.co/', daysSince:0, typical:'매일 오전 7시', status:'alive', interests:['디자인','커리어'], trust:['최근 30일 발행','공식 구독 링크 확인','유료 포함'] },
  { id:'beletter', name:'비레터', category:'마케팅', frequency:'주 2회', frequencyGroup:'weekly', description:'광고와 브랜드 업계의 흐름을 재치 있게 정리합니다.', url:'https://www.beletter.co.kr/', daysSince:2, typical:'화·목요일', status:'alive', interests:['디자인','커리어'], trust:['최근 30일 발행','공식 구독 링크 확인','광고성 높음'] },
  { id:'maily', name:'메일리', category:'라이프', frequency:'가끔', frequencyGroup:'occasional', description:'좋아하는 작가의 글을 메일함으로 받는 구독 플랫폼.', url:'https://maily.so/', daysSince:1, typical:'작가별 상이', status:'alive', interests:['디자인','커리어'], trust:['공식 구독 링크 확인'] },
  { id:'weekly', name:'위클리비즈', category:'비즈니스', frequency:'주 1회', frequencyGroup:'weekly', description:'일하는 방식과 비즈니스 인사이트를 전합니다.', url:'https://www.chosun.com/economy/', daysSince:6, typical:'보통 월요일', status:'paused', interests:['재테크','커리어'], trust:['공식 구독 링크 확인'] },
  { id:'publy', name:'퍼블리', category:'커리어', frequency:'주 1회', frequencyGroup:'weekly', description:'일과 성장에 필요한 지식을 차분히 전합니다.', url:'https://publy.co/', daysSince:1, typical:'보통 수요일', status:'alive', interests:['커리어','디자인'], trust:['최근 30일 발행','공식 구독 링크 확인','유료 포함'] }
];

newsletters.forEach(item => Object.assign(item, { origin:'한국', language:'한국어', country:'대한민국' }));
newsletters.push(
  { id:'morning-brew', name:'Morning Brew', category:'비즈니스', frequency:'평일', frequencyGroup:'daily', description:'비즈니스·경제의 큰 흐름을 약 5분 안에 유쾌하게 훑는 글로벌 데일리.', url:'https://www.morningbrew.com/', daysSince:0, typical:'평일 아침', status:'alive', interests:['재테크','커리어'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'tldr', name:'TLDR', category:'테크', frequency:'매일', frequencyGroup:'daily', description:'기술·스타트업·개발 소식을 짧은 요약과 링크로 정리하는 데일리.', url:'https://tldr.tech/signup', daysSince:0, typical:'매일', status:'alive', interests:['AI','개발','커리어'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'rundown-ai', name:'The Rundown AI', category:'테크', frequency:'매일', frequencyGroup:'daily', description:'AI 뉴스와 실제 업무 활용법을 빠르게 확인하고 싶은 사람을 위한 브리핑.', url:'https://www.therundown.ai/', daysSince:0, typical:'평일', status:'alive', interests:['AI','개발','커리어'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'the-hustle', name:'The Hustle', category:'비즈니스', frequency:'평일', frequencyGroup:'daily', description:'스타트업과 비즈니스 뉴스를 직설적이고 가볍게 풀어 주는 데일리.', url:'https://thehustle.co/join', daysSince:0, typical:'평일 오전', status:'alive', interests:['재테크','커리어'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'stratechery', name:'Stratechery', category:'테크', frequency:'주 1회', frequencyGroup:'weekly', description:'기술 기업과 플랫폼 전략을 깊이 있는 해설로 읽는 분석형 뉴스레터.', url:'https://stratechery.com/', daysSince:1, typical:'주간 글 · 데일리 업데이트 선택', status:'alive', interests:['AI','재테크','커리어'], trust:['공식 구독 링크 확인','유료 포함','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'the-browser', name:'The Browser', category:'문화', frequency:'평일', frequencyGroup:'daily', description:'기사·팟캐스트·영상에서 좋은 것만 고르고 한 단락으로 맥락을 전하는 큐레이션.', url:'https://thebrowser.com/', daysSince:0, typical:'평일 · 주말 특집', status:'alive', interests:['문화','시사','디자인'], trust:['공식 구독 링크 확인','유료 포함','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'dense-discovery', name:'Dense Discovery', category:'디자인', frequency:'주 1회', frequencyGroup:'weekly', description:'디자인·기술·예술을 천천히 생각하게 만드는 엄선된 주간 링크 모음.', url:'https://www.densediscovery.com/', daysSince:1, typical:'주 1회', status:'alive', interests:['디자인','문화','커리어'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' }
);

newsletters.push(
  { id:'three-two-one', name:'3-2-1 Thursday', category:'자기계발', frequency:'주 1회', frequencyGroup:'weekly', description:'3가지 아이디어, 2가지 인용, 1가지 질문으로 습관과 삶을 돌아보게 하는 짧은 주간 편지.', url:'https://jamesclear.com/3-2-1', daysSince:1, typical:'매주 목요일', status:'alive', interests:['커리어','건강','문화'], trust:['공식 구독 링크 확인','무료','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' },
  { id:'hbr-tip', name:'HBR Management Tip', category:'리더십', frequency:'평일', frequencyGroup:'daily', description:'일을 더 잘하기 위한 짧고 실용적인 관리·리더십 팁을 전하는 데일리.', url:'https://hbr.org/email-newsletters', daysSince:0, typical:'평일', status:'alive', interests:['커리어','리더십','자기계발'], trust:['공식 구독 링크 확인','글로벌 인기'], origin:'글로벌', language:'영어 · 소개 한국어' }
);

const globalCountries = { 'morning-brew':'미국', 'tldr':'미국', 'rundown-ai':'미국', 'the-hustle':'미국', 'stratechery':'미국', 'the-browser':'영국', 'dense-discovery':'호주', 'three-two-one':'미국', 'hbr-tip':'미국' };
newsletters.forEach(item => { if (item.origin === '글로벌') item.country = globalCountries[item.id] || '미국'; });

const $ = (selector) => document.querySelector(selector);
const stored = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const state = { category:'전체', topic:'전체', origin:'전체', country:'전체', frequency:'전체', query:'', sort:'recommended', saved:new Set(stored('letter-shelf', [])), personal:stored('letter-status', {}), interests:stored('letter-interests', []), preferences:stored('letter-preferences', { frequency:'all', paused:false }) };
const readingTimes = { '시사':'3분 읽기', '비즈니스':'4분 읽기', '마케팅':'3분 읽기', '테크':'5분 읽기', '라이프':'3분 읽기', '커리어':'4분 읽기' };
const valuePromises = { '시사':'한 줄 요약 뒤에, 왜 중요한지까지 알려줘요.', '비즈니스':'일하는 사람에게 필요한 맥락을 먼저 짚어줘요.', '마케팅':'바로 써먹을 수 있는 브랜드 사례를 골라줘요.', '테크':'링크보다 맥락을 먼저 확인할 수 있어요.', '라이프':'짧게 읽어도 오래 생각할 이야기를 전해요.', '커리어':'내 일과 성장에 연결되는 포인트를 보여줘요.' };
const categories = ['전체', ...new Set(newsletters.map(({category}) => category))];
const topics = ['전체', ...new Set(newsletters.flatMap(({interests}) => interests))];
const origins = [['전체','전체'], ['한국어 뉴스레터','한국'], ['글로벌 원문 · 한국어 소개','글로벌']];
const countries = ['전체', ...new Set(newsletters.map(({country}) => country || '미국'))];
const frequencyFilters = [['전체','전체'], ['매일','daily'], ['주 1회','weekly'], ['가끔만','occasional']];
const interests = ['AI','재테크','커리어','디자인','시사'];

function freshness(item) { if (item.daysSince === 0) return '오늘 발행'; if (item.daysSince === 1) return '어제 발행'; return `${item.daysSince}일째 새 글 없음`; }
function matches(item) { const words = `${item.name} ${item.category} ${item.description} ${item.interests.join(' ')}`.toLowerCase(); return (state.category === '전체' || item.category === state.category) && (state.topic === '전체' || item.interests.includes(state.topic)) && (state.origin === '전체' || item.origin === state.origin) && (state.country === '전체' || item.country === state.country) && (state.frequency === '전체' || item.frequencyGroup === state.frequency) && words.includes(state.query); }
function issueLink(item) { return `${ISSUE_URL}?title=${encodeURIComponent(`[정보 수정] ${item.name}`)}&body=${encodeURIComponent(`뉴스레터: ${item.name}\n\n수정할 내용:\n\n확인한 링크:`)}`; }

function card(item) {
  const node = $('#newsletter-template').content.firstElementChild.cloneNode(true);
  node.querySelector('.category').textContent = item.category;
  node.querySelector('.origin-badge').textContent = item.origin === '글로벌' ? `GLOBAL · ${item.country} · 한국어 소개` : '대한민국 · 한국어 원문';
  node.querySelector('.tag-list').textContent = item.interests.slice(0, 3).map(tag => `#${tag}`).join(' ');
  const status = node.querySelector('.status'); status.textContent = item.status === 'alive' ? '발행 중' : '확인 필요'; if (item.status !== 'alive') status.classList.add('paused');
  node.querySelector('h3').textContent = item.name; node.querySelector('.description').textContent = item.description;
  node.querySelector('.value-promise').textContent = valuePromises[item.category] || '내게 필요한 내용인지 빠르게 확인할 수 있어요.';
  node.querySelector('.frequency').textContent = item.frequency; node.querySelector('.last-issue').textContent = freshness(item);
  node.querySelector('.reading-time').textContent = readingTimes[item.category] || '3분 읽기';
  node.querySelector('.delivery').textContent = `평균 발행 · ${item.typical}`;
  node.querySelector('.unsubscribe-help').textContent = '해지 · 원문 메일 하단 수신거부 링크 또는 계정 설정';
  node.querySelector('.trust-badges').replaceChildren(...item.trust.map(label => { const badge = document.createElement('span'); badge.textContent = label; return badge; }));
  const visit = node.querySelector('.visit'); visit.href = item.url;
  const translate = node.querySelector('.translate'); if (item.origin === '글로벌') { translate.hidden = false; translate.href = `https://translate.google.com/translate?sl=auto&tl=ko&u=${encodeURIComponent(item.url)}`; }
  const save = node.querySelector('.save'); const isSaved = state.saved.has(item.id); save.textContent = isSaved ? '저장됨 ✓' : '+ 내 목록'; save.classList.toggle('saved', isSaved);
  save.addEventListener('click', () => { state.saved.has(item.id) ? state.saved.delete(item.id) : state.saved.add(item.id); localStorage.setItem('letter-shelf', JSON.stringify([...state.saved])); render(); });
  const personal = node.querySelector('.personal-state'); personal.value = state.personal[item.id] || '관심 있음';
  personal.addEventListener('change', () => { state.personal[item.id] = personal.value; localStorage.setItem('letter-status', JSON.stringify(state.personal)); });
  node.querySelector('.report').addEventListener('click', () => window.open(issueLink(item), '_blank', 'noopener'));
  return node;
}

function renderFilters() {
  const render = (target, values, active, set) => { const box = $(target); box.replaceChildren(...values.map(([label, value]) => { const button = document.createElement('button'); button.type = 'button'; button.className = `filter ${value === active ? 'active' : ''}`; button.textContent = label; button.addEventListener('click', () => { set(value); renderFilters(); render(); }); return button; })); };
  render('#filters', categories.map(value => [value, value]), state.category, value => state.category = value);
  render('#topic-filters', topics.map(value => [value === '전체' ? '세부 주제 전체' : `# ${value}`, value]), state.topic, value => state.topic = value);
  render('#frequency-filters', frequencyFilters, state.frequency, value => state.frequency = value);
  render('#origin-filters', origins, state.origin, value => state.origin = value);
  render('#country-filters', countries.map(value => [value === '전체' ? '국가 전체' : value, value]), state.country, value => state.country = value);
}
function sortItems(items) { return [...items].sort((a,b) => { if (state.sort === 'recent') return a.daysSince - b.daysSince; if (state.sort === 'light') return (readingTimes[a.category] || '').localeCompare(readingTimes[b.category] || ''); const aMatch = a.interests.filter(interest => state.interests.includes(interest)).length; const bMatch = b.interests.filter(interest => state.interests.includes(interest)).length; return bMatch - aMatch || a.daysSince - b.daysSince; }); }
function renderToday() { const picks = newsletters.filter(item => item.status === 'alive' && item.daysSince <= 1 && (state.preferences.frequency === 'all' || item.frequencyGroup === state.preferences.frequency)).slice(0, 3); $('#today-grid').replaceChildren(...(state.preferences.paused ? [] : picks.map(card))); }
function renderRecommendations() { const section = $('#recommendations'); if (!state.interests.length || state.preferences.paused) { section.hidden = true; return; } const source = newsletters.filter(item => state.preferences.frequency === 'all' || item.frequencyGroup === state.preferences.frequency); const matching = source.filter(item => item.interests.some(interest => state.interests.includes(interest))).sort((a,b) => a.daysSince - b.daysSince); const fallback = source.filter(item => !matching.includes(item)).sort((a,b) => a.daysSince - b.daysSince); const picked = [...matching, ...fallback].slice(0,5); section.hidden = false; $('#interest-name').textContent = state.interests.join(' · '); $('#recommendation-grid').replaceChildren(...picked.map(card)); }
function render() { const items = sortItems(newsletters.filter(matches)); $('#newsletter-grid').replaceChildren(...items.map(card)); $('#result-count').textContent = items.length; const saved = newsletters.filter(item => state.saved.has(item.id)); $('#saved-grid').replaceChildren(...saved.map(card)); $('#empty-state').hidden = saved.length > 0; $('#saved-count').textContent = saved.length; renderRecommendations(); renderToday(); }
function updateSummary() { const alive = newsletters.filter(({status}) => status === 'alive').length; $('#active-total').textContent = newsletters.length; $('#alive-total').textContent = alive; $('#today-count').textContent = newsletters.filter(({daysSince}) => daysSince === 0).length + '개'; $('#paused-count').textContent = newsletters.length - alive + '개'; $('#checked-date').textContent = new Intl.DateTimeFormat('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date()); }
function openOnboarding() { const dialog = $('#onboarding'); const options = $('#interest-options'); options.replaceChildren(...interests.map(interest => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'checkbox'; input.value = interest; input.checked = state.interests.includes(interest); input.addEventListener('change', () => { if ([...options.querySelectorAll('input:checked')].length > 3) input.checked = false; }); label.append(input, document.createTextNode(interest)); return label; })); dialog.showModal(); }

function openPreferences() { const dialog = $('#preferences'); const box = $('#preference-interests'); box.replaceChildren(...interests.map(interest => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'checkbox'; input.value = interest; input.checked = state.interests.includes(interest); label.append(input, document.createTextNode(interest)); return label; })); const frequency = dialog.querySelector(`[name="preference-frequency"][value="${state.preferences.frequency}"]`); if (frequency) frequency.checked = true; $('#pause-recommendations').checked = state.preferences.paused; dialog.showModal(); }
function applyTheme(theme) { document.body.classList.toggle('dark', theme === 'dark'); const toggle = $('#toggle-theme'); toggle.setAttribute('aria-pressed', String(theme === 'dark')); toggle.textContent = theme === 'dark' ? '라이트 모드' : '다크 모드'; }
function applyTextSize(size) { document.body.classList.toggle('large-text', size === 'large'); const toggle = $('#toggle-text-size'); toggle.setAttribute('aria-pressed', String(size === 'large')); toggle.textContent = size === 'large' ? '글자 기본' : '글자 크게'; }
async function applyLinkStatus() { try { const response = await fetch('data/link-status.json', { cache: 'no-store' }); if (!response.ok) return; const { results } = await response.json(); results.filter(item => item.status === 'needs-review').forEach(({ id }) => { const newsletter = newsletters.find(item => item.id === id); if (newsletter) newsletter.status = 'needs-review'; }); updateSummary(); render(); } catch { /* file:// 미리보기에서는 상태 파일을 읽지 못할 수 있음 */ } }

$('#search').addEventListener('input', event => { state.query = event.target.value.trim().toLowerCase(); render(); });
$('#sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
$('#edit-interests').addEventListener('click', openOnboarding);
$('#open-preferences').addEventListener('click', openPreferences);
$('#preferences-form').addEventListener('submit', () => { state.interests = [...$('#preference-interests').querySelectorAll('input:checked')].slice(0,3).map(input => input.value); state.preferences = { frequency: document.querySelector('[name="preference-frequency"]:checked').value, paused: $('#pause-recommendations').checked }; localStorage.setItem('letter-interests', JSON.stringify(state.interests)); localStorage.setItem('letter-preferences', JSON.stringify(state.preferences)); render(); });
$('#toggle-theme').addEventListener('click', () => { const theme = document.body.classList.contains('dark') ? 'light' : 'dark'; localStorage.setItem('letter-theme', theme); applyTheme(theme); });
$('#toggle-text-size').addEventListener('click', () => { const size = document.body.classList.contains('large-text') ? 'normal' : 'large'; localStorage.setItem('letter-text-size', size); applyTextSize(size); });
$('#onboarding-form').addEventListener('submit', () => { state.interests = [...$('#interest-options').querySelectorAll('input:checked')].map(input => input.value); localStorage.setItem('letter-interests', JSON.stringify(state.interests)); render(); });
document.querySelector('.footer-report').addEventListener('click', () => window.open(ISSUE_URL, '_blank', 'noopener'));
applyTheme(localStorage.getItem('letter-theme') || 'light'); applyTextSize(localStorage.getItem('letter-text-size') || 'normal'); updateSummary(); renderFilters(); renderToday(); render(); applyLinkStatus();
if (!localStorage.getItem('letter-onboarding-seen')) { $('#onboarding').addEventListener('close', () => localStorage.setItem('letter-onboarding-seen', 'true'), { once:true }); openOnboarding(); }
