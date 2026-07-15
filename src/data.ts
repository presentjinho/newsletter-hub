import { Newsletter } from './types';
import { industryRaw, industryList as industryListSeed } from './industryCatalog';

/** 기존 카드: url이 구독 페이지인 경우 분리 힌트 */
const subscribeHints: Record<string, { siteUrl: string; subscribeUrl: string }> = {
  tldr: { siteUrl: 'https://tldr.tech/', subscribeUrl: 'https://tldr.tech/signup' },
  'the-hustle': { siteUrl: 'https://thehustle.co/', subscribeUrl: 'https://thehustle.co/join' },
  'morning-brew': { siteUrl: 'https://www.morningbrew.com/', subscribeUrl: 'https://www.morningbrew.com/daily' },
  'rundown-ai': { siteUrl: 'https://www.therundown.ai/', subscribeUrl: 'https://www.therundown.ai/' },
  'hbr-tip': { siteUrl: 'https://hbr.org/', subscribeUrl: 'https://hbr.org/email-newsletters' },
  maeburi: { siteUrl: 'https://www.booding.co/', subscribeUrl: 'https://page.stibee.com/subscriptions/110950' },
  goodlawcat: { siteUrl: 'https://www.lawtimes.co.kr/', subscribeUrl: 'https://goodlawcat.stibee.com/' },
  dallem: { siteUrl: 'https://dallem.com/', subscribeUrl: 'https://dallem.stibee.com/' },
  'munhak-newsletter': { siteUrl: 'https://munhak.com/', subscribeUrl: 'https://munhak.com/newsletter' },
  'ec-digital-newsletter': { siteUrl: 'https://digital-strategy.ec.europa.eu/en', subscribeUrl: 'https://digital-strategy.ec.europa.eu/en/newsletters' },
  'nasa-official': { siteUrl: 'https://www.nasa.gov/', subscribeUrl: 'https://www.nasa.gov/newsletters/' },
  'smithsonian-natural-history': { siteUrl: 'https://naturalhistory.si.edu/', subscribeUrl: 'https://naturalhistory.si.edu/join-us/sign-up-newsletter' },
};

export const rawNewsletters: Partial<Newsletter>[] = [
  { id: 'newneek', name: '뉴닉', category: '시사', frequency: '매일', frequencyGroup: 'daily', description: '세상이 궁금한 사람들을 위한 쉽고 친절한 뉴스.', url: 'https://newneek.co/', daysSince: 0, typical: '평일 아침', status: 'alive', interests: ['시사', '재테크'], trust: ['최근 30일 발행', '공식 구독 링크 확인'] },
  { id: 'outstand', name: '아웃스탠딩', category: '비즈니스', frequency: '평일', frequencyGroup: 'daily', description: '스타트업과 IT 비즈니스의 맥락을 깊게 읽습니다.', url: 'https://outstand.co.kr/', daysSince: 0, typical: '평일', status: 'alive', interests: ['AI', '커리어', '재테크'], trust: ['최근 30일 발행', '공식 구독 링크 확인', '유료 포함'] },
  { id: 'stibee', name: '스티비', category: '마케팅', frequency: '주 1회', frequencyGroup: 'weekly', description: '이메일 마케팅과 뉴스레터를 잘 만드는 법.', url: 'https://stibee.com/', daysSince: 1, typical: '보통 화요일', status: 'alive', interests: ['디자인', '커리어'], trust: ['최근 30일 발행', '공식 구독 링크 확인'] },
  { id: 'geeknews', name: '긱뉴스', category: '테크', frequency: '매일', frequencyGroup: 'daily', description: '개발자와 기술 애호가가 함께 고르는 오늘의 링크.', url: 'https://news.hada.io/', daysSince: 0, typical: '매일 오전', status: 'alive', interests: ['AI', '커리어'], trust: ['최근 30일 발행', '공식 구독 링크 확인'] },
  { id: 'longblack', name: '롱블랙', category: '라이프', frequency: '매일', frequencyGroup: 'daily', description: '하루 한 편, 오래 남는 브랜드와 사람의 이야기.', url: 'https://www.longblack.co/', daysSince: 0, typical: '매일 오전 7시', status: 'alive', interests: ['디자인', '커리어'], trust: ['최근 30일 발행', '공식 구독 링크 확인', '유료 포함'] },
  { id: 'beletter', name: '비레터', category: '마케팅', frequency: '주 2회', frequencyGroup: 'weekly', description: '광고와 브랜드 업계의 흐름을 재치 있게 정리합니다.', url: 'https://www.beletter.co.kr/', daysSince: 2, typical: '화·목요일', status: 'alive', interests: ['디자인', '커리어'], trust: ['최근 30일 발행', '공식 구독 링크 확인', '광고성 높음'] },
  { id: 'maily', name: '메일리', category: '라이프', frequency: '가끔', frequencyGroup: 'occasional', description: '좋아하는 작가의 글을 메일함으로 받는 구독 플랫폼.', url: 'https://maily.so/', daysSince: 1, typical: '작가별 상이', status: 'alive', interests: ['디자인', '커리어'], trust: ['공식 구독 링크 확인'] },
  { id: 'weekly', name: '위클리비즈', category: '비즈니스', frequency: '주 1회', frequencyGroup: 'weekly', description: '일하는 방식과 비즈니스 인사이트를 전합니다.', url: 'https://www.chosun.com/economy/', daysSince: 6, typical: '보통 월요일', status: 'paused', interests: ['재테크', '커리어'], trust: ['공식 구독 링크 확인'] },
  { id: 'publy', name: '퍼블리', category: '커리어', frequency: '주 1회', frequencyGroup: 'weekly', description: '일과 성장에 필요한 지식을 차분히 전합니다.', url: 'https://publy.co/', daysSince: 1, typical: '보통 수요일', status: 'alive', interests: ['커리어', '디자인'], trust: ['최근 30일 발행', '공식 구독 링크 확인', '유료 포함'] },
  
  // 글로벌
  { id: 'morning-brew', name: 'Morning Brew', category: '비즈니스', frequency: '평일', frequencyGroup: 'daily', description: '비즈니스·경제의 큰 흐름을 약 5분 안에 유쾌하게 훑는 글로벌 데일리.', url: 'https://www.morningbrew.com/', daysSince: 0, typical: '평일 아침', status: 'alive', interests: ['재테크', '커리어'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'tldr', name: 'TLDR', category: '테크', frequency: '매일', frequencyGroup: 'daily', description: '기술·스타트업·개발 소식을 짧은 요약과 링크로 정리하는 데일리.', url: 'https://tldr.tech/signup', daysSince: 0, typical: '매일', status: 'alive', interests: ['AI', '개발', '커리어'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'rundown-ai', name: 'The Rundown AI', category: '테크', frequency: '매일', frequencyGroup: 'daily', description: 'AI 뉴스와 실제 업무 활용법을 빠르게 확인하고 싶은 사람을 위한 브리핑.', url: 'https://www.therundown.ai/', daysSince: 0, typical: '평일', status: 'alive', interests: ['AI', '개발', '커리어'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'the-hustle', name: 'The Hustle', category: '비즈니스', frequency: '평일', frequencyGroup: 'daily', description: '스타트업과 비즈니스 뉴스를 직설적이고 가볍게 풀어 주는 데일리.', url: 'https://thehustle.co/join', daysSince: 0, typical: '평일 오전', status: 'alive', interests: ['재테크', '커리어'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'stratechery', name: 'Stratechery', category: '테크', frequency: '주 1회', frequencyGroup: 'weekly', description: '기술 기업과 플랫폼 전략을 깊이 있는 해설로 읽는 분석형 뉴스레터.', url: 'https://stratechery.com/', daysSince: 1, typical: '주간 글 · 데일리 업데이트 선택', status: 'alive', interests: ['AI', '재테크', '커리어'], trust: ['공식 구독 링크 확인', '유료 포함', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'the-browser', name: 'The Browser', category: '문화', frequency: '평일', frequencyGroup: 'daily', description: '기사·팟캐스트·영상에서 좋은 것만 고르고 한 단락으로 맥락을 전하는 큐레이션.', url: 'https://thebrowser.com/', daysSince: 0, typical: '평일 · 주말 특집', status: 'alive', interests: ['문화', '시사', '디자인'], trust: ['공식 구독 링크 확인', '유료 포함', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'dense-discovery', name: 'Dense Discovery', category: '디자인', frequency: '주 1회', frequencyGroup: 'weekly', description: '디자인·기술·예술을 천천히 생각하게 만드는 엄선된 주간 링크 모음.', url: 'https://www.densediscovery.com/', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['디자인', '문화', '커리어'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'three-two-one', name: '3-2-1 Thursday', category: '자기계발', frequency: '주 1회', frequencyGroup: 'weekly', description: '3가지 아이디어, 2가지 인용, 1가지 질문으로 습관과 삶을 돌아보게 하는 짧은 주간 편지.', url: 'https://jamesclear.com/3-2-1', daysSince: 1, typical: '매주 목요일', status: 'alive', interests: ['커리어', '건강', '문화'], trust: ['공식 구독 링크 확인', '무료', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },
  { id: 'hbr-tip', name: 'HBR Management Tip', category: '리더십', frequency: '평일', frequencyGroup: 'daily', description: '일을 더 잘하기 위한 짧고 실용적인 관리·리더십 팁을 전하는 데일리.', url: 'https://hbr.org/email-newsletters', daysSince: 0, typical: '평일', status: 'alive', interests: ['커리어', '리더십', '자기계발'], trust: ['공식 구독 링크 확인', '글로벌 인기'], origin: '글로벌', language: '영어 · 소개 한국어' },

  // 매거진 & 사이트
  { id: 'folin', name: '폴인', category: '스타트업', frequency: '주 2회', frequencyGroup: 'weekly', description: '스타트업·AI·투자 이슈를 깊이 있게 풀어주는 지식 콘텐츠 플랫폼.', url: 'https://folin.co', daysSince: 1, typical: '주 2회', status: 'alive', interests: ['AI', '스타트업', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'magazine' },
  { id: 'yozm-it', name: '요즘IT', category: '테크', frequency: '매일', frequencyGroup: 'daily', description: '개발·디자인·기획 실무자가 쓰는 글을 모은 IT 매거진.', url: 'https://yozm.wishket.com/magazine/', daysSince: 0, typical: '매일', status: 'alive', interests: ['개발', '디자인', '커리어'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'disquiet', name: '디스콰이엇', category: '스타트업', frequency: '수시', frequencyGroup: 'occasional', description: '메이커와 스타트업 팀이 만드는 것을 공유하는 커뮤니티 겸 매거진.', url: 'https://disquiet.io/', daysSince: 0, typical: '수시 업데이트', status: 'alive', interests: ['스타트업', '디자인', '개발'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'eoplanet', name: 'EO플래닛', category: '스타트업', frequency: '주 2회', frequencyGroup: 'weekly', description: '스타트업·벤처투자 인터뷰와 트렌드를 전하는 뉴미디어.', url: 'https://eopla.net/', daysSince: 1, typical: '주 2회', status: 'alive', interests: ['스타트업', '재테크', '커리어'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  
  { id: 'wired', name: 'Wired', category: '테크', frequency: '매일', frequencyGroup: 'daily', description: '기술이 문화·사회를 바꾸는 방식을 깊이 있게 다루는 대표 테크 매거진.', url: 'https://www.wired.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['AI', '디자인', '문화'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },
  { id: 'the-atlantic', name: 'The Atlantic', category: '문화', frequency: '매일', frequencyGroup: 'daily', description: '시사·문화·정치를 깊이 있는 에세이로 풀어내는 미국 대표 매거진.', url: 'https://www.theatlantic.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['시사', '문화'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },
  { id: 'mit-tech-review', name: 'MIT Technology Review', category: '테크', frequency: '주 2회', frequencyGroup: 'weekly', description: 'AI·과학기술의 임팩트를 검증된 저널리즘으로 전하는 매거진.', url: 'https://www.technologyreview.com/', daysSince: 1, typical: '주 2회', status: 'alive', interests: ['AI', '테크'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },

  { id: 'booding', name: '부딩', category: '부동산', frequency: '주 2회', frequencyGroup: 'weekly', description: '밀레니얼 실수요자를 위한 부동산 정보를 쉬운 말로 정리하는 뉴스레터.', url: 'https://www.booding.co/', daysSince: 1, typical: '화·금요일', status: 'alive', interests: ['부동산', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter' },
  { id: 'maeburi', name: '매부리레터', category: '부동산', frequency: '주 2회', frequencyGroup: 'weekly', description: '청약·시황·재건축까지 부동산 재테크 이슈를 상세히 정리하는 뉴스레터.', url: 'https://page.stibee.com/subscriptions/110950', daysSince: 1, typical: '월·목요일', status: 'alive', interests: ['부동산', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter' },
  { id: 'surfit', name: '서핏', category: '커리어', frequency: '매일', frequencyGroup: 'daily', description: '기획·개발·디자인·마케팅 실무 아티클을 매일 모아 보여주는 커리어 플랫폼.', url: 'https://www.surfit.io/', daysSince: 0, typical: '매일', status: 'alive', interests: ['커리어', '개발', '디자인'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'careet', name: '캐릿', category: '마케팅', frequency: '주 2회', frequencyGroup: 'weekly', description: '대학내일이 운영하는 Z세대 트렌드·마케팅 인사이트 미디어.', url: 'https://www.careet.net/', daysSince: 1, typical: '주 2회', status: 'alive', interests: ['마케팅', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'goguma-farm', name: '고구마팜', category: '마케팅', frequency: '주 1회', frequencyGroup: 'weekly', description: '밈과 커뮤니티 반응으로 브랜드 트렌드를 읽는 마케팅 뉴스레터.', url: 'https://gogumafarm.kr/', daysSince: 1, typical: '매주', status: 'alive', interests: ['마케팅', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'designdb', name: '디자인DB', category: '디자인', frequency: '매일', frequencyGroup: 'daily', description: '국내 최대 규모의 디자인 트렌드·산업 정보 포털.', url: 'https://www.designdb.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['디자인', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'sciencetimes', name: '사이언스타임즈', category: '과학', frequency: '주 1회', frequencyGroup: 'weekly', description: '한국과학창의재단이 만드는 과학기술·정책·문화 전문 인터넷 신문.', url: 'https://www.sciencetimes.co.kr/main', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['과학', '교육'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'gmlawcat', name: '굿모닝로캣', category: '법률', frequency: '평일', frequencyGroup: 'daily', description: '법률신문이 보내는 아침 법률·판례 뉴스 뉴스레터.', url: 'https://gmlawcat.stibee.com/', daysSince: 0, typical: '평일 아침', status: 'alive', interests: ['법률', '시사'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter' },
  { id: 'gamemeca', name: '게임메카', category: '게임', frequency: '매일', frequencyGroup: 'daily', description: '국내 게임 뉴스·순위·공략을 매일 갱신하는 게임 전문 매체.', url: 'https://www.gamemeca.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['게임', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'newstravel', name: '뉴스트래블', category: '여행', frequency: '매일', frequencyGroup: 'daily', description: '항공·호텔·축제 등 국내외 여행 소식을 매일 전하는 여행 전문 매체.', url: 'https://www.newstravel.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['여행', '라이프'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'kinolights', name: '키노라이츠', category: '문화', frequency: '매일', frequencyGroup: 'daily', description: 'OTT·영화·드라마 랭킹과 추천을 통합 제공하는 콘텐츠 플랫폼.', url: 'https://www.kinolights.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['영화', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'esg-economy', name: 'ESG경제', category: '환경', frequency: '매일', frequencyGroup: 'daily', description: '탄소중립·기후기술·ESG 정책을 다루는 전문 매체.', url: 'https://www.esgeconomy.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['환경', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'dallem', name: '달램 웰니스 뉴스레터', category: '건강', frequency: '주 1회', frequencyGroup: 'weekly', description: '국내외 웰니스 트렌드와 기업 웰니스 사례를 큐레이션하는 뉴스레터.', url: 'https://dallem.stibee.com/', daysSince: 1, typical: '수요일 오전 8시', status: 'alive', interests: ['건강', '라이프'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter' },
  { id: 'munhak-newsletter', name: '문학동네 책첵레터', category: '문화', frequency: '주 1회', frequencyGroup: 'weekly', description: '신간 소식과 책 만드는 사람들의 이야기를 전하는 출판사 뉴스레터.', url: 'https://munhak.com/newsletter', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['도서', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter' },

  { id: 'nature', name: 'Nature', category: '과학', frequency: '매일', frequencyGroup: 'daily', description: '세계에서 가장 권위 있는 과학 학술 매거진으로 최신 연구와 과학 뉴스를 함께 전한다.', url: 'https://www.nature.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['과학', 'AI'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },
  { id: 'nomadicmatt', name: 'Nomadic Matt', category: '여행', frequency: '주 1회', frequencyGroup: 'weekly', description: '예산 여행 팁과 실전 노하우를 오래 쌓아온 여행 블로그.', url: 'https://www.nomadicmatt.com/', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['여행', '라이프'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'site' },
  { id: 'ign', name: 'IGN', category: '게임', frequency: '매일', frequencyGroup: 'daily', description: '게임·영화·테크 리뷰와 뉴스를 전하는 글로벌 대표 게임 매거진.', url: 'https://www.ign.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['게임', '문화'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },
  { id: 'rogerebert', name: 'RogerEbert.com', category: '문화', frequency: '매일', frequencyGroup: 'daily', description: '로저 이버트의 정신을 잇는 영화 비평 사이트.', url: 'https://www.rogerebert.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['영화', '문화'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'site' },
  { id: 'yaleclimate', name: 'Yale Climate Connections', category: '환경', frequency: '평일', frequencyGroup: 'daily', description: '예일대가 운영하는 기후 과학·정책 저널리즘 사이트.', url: 'https://yaleclimateconnections.org/', daysSince: 0, typical: '평일', status: 'alive', interests: ['환경', '과학'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'site' },
  { id: 'foreign-affairs', name: 'Foreign Affairs', category: '국제', frequency: '매일', frequencyGroup: 'daily', description: '외교·국제정세를 심층 분석하는 미국 대표 국제관계 매거진.', url: 'https://www.foreignaffairs.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['국제', '시사'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'magazine' },
  { id: 'petapixel', name: 'PetaPixel', category: '사진', frequency: '매일', frequencyGroup: 'daily', description: '카메라·사진 업계 뉴스와 리뷰를 매일 전하는 사진 전문 매체.', url: 'https://petapixel.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['사진', '문화'], origin: '글로벌', language: '영어 · 소개 한국어', type: 'site' },

  { id: 'foodbank', name: '식품외식경제', category: '음식', frequency: '매일', frequencyGroup: 'daily', description: '식품·외식·유통 산업의 뉴스와 트렌드를 매일 전하는 전문지.', url: 'https://www.foodbank.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['음식', '라이프'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'hrinsight', name: 'HR Insight', category: 'HR', frequency: '매달', frequencyGroup: 'weekly', description: 'HRM·HRD를 아우르는 국내 대표 인사·조직문화 전문지.', url: 'https://www.hrinsight.co.kr/', daysSince: 1, typical: '월간', status: 'alive', interests: ['HR', '커리어'], origin: '한국', language: '한국어', country: '대한민국', type: 'magazine' },
  { id: 'joseilbo', name: '조세일보', category: '세무', frequency: '매일', frequencyGroup: 'daily', description: '조세·회계·세무 신고와 판례를 다루는 조세회계 전문 경제지.', url: 'https://joseilbo.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['세무', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'ikpnews', name: '한국농정신문', category: '농업', frequency: '주 1회', frequencyGroup: 'weekly', description: '농업 정책과 농민 현장의 목소리를 전하는 농업 전문 매체.', url: 'https://www.ikpnews.net/', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['농업', '시사'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'platum', name: '플래텀', category: '스타트업', frequency: '매일', frequencyGroup: 'daily', description: '국내외 스타트업 투자·창업 스토리를 전하는 전문 미디어.', url: 'https://platum.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['스타트업', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'dailyvet', name: '데일리벳', category: '반려동물', frequency: '매일', frequencyGroup: 'daily', description: '수의사가 만드는 반려동물·동물의료 전문 신문.', url: 'https://www.dailyvet.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['반려동물', '건강'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'ibabynews', name: '베이비뉴스', category: '육아', frequency: '매일', frequencyGroup: 'daily', description: '임신·출산·육아·교육 소식을 전하는 국내 대표 육아 전문지.', url: 'https://www.ibabynews.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['육아', '건강'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'motorgraph', name: '모터그래프', category: '자동차', frequency: '매일', frequencyGroup: 'daily', description: '신차·시승기·산업 동향을 다루는 자동차 전문지.', url: 'https://www.motorgraph.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['자동차', '테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'fashionbiz', name: '패션비즈', category: '패션', frequency: '매일', frequencyGroup: 'daily', description: '패션 산업의 비즈니스·트렌드 뉴스를 전하는 전문 매거진.', url: 'https://fashionbiz.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['패션', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'magazine' },
  { id: 'medigatenews', name: '메디게이트뉴스', category: '의료', frequency: '매일', frequencyGroup: 'daily', description: '12만 의사 회원 기반 플랫폼이 만드는 의료·바이오 전문 미디어.', url: 'https://www.medigatenews.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['의료', '건강'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'irobotnews', name: '로봇신문', category: '로봇공학', frequency: '매일', frequencyGroup: 'daily', description: '산업·서비스 로봇과 AI·자율주행 관련 뉴스를 전하는 로봇 전문지.', url: 'https://www.irobotnews.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['로봇공학', 'AI'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'thelec', name: '디일렉', category: '반도체', frequency: '매일', frequencyGroup: 'daily', description: '반도체·디스플레이·배터리 산업을 심층 취재하는 전문 매체.', url: 'https://www.thelec.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['반도체', '테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'tokenpost', name: '토큰포스트', category: '크립토', frequency: '매일', frequencyGroup: 'daily', description: '국내 대표 블록체인·암호화폐 뉴스 미디어.', url: 'https://www.tokenpost.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['크립토', '재테크'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'osen', name: 'OSEN', category: '스포츠', frequency: '매일', frequencyGroup: 'daily', description: '야구·축구·연예까지 다루는 국내 대표 스포츠 전문 매체.', url: 'https://www.osen.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['스포츠', '문화'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },
  { id: 'eduinnews', name: '에듀인뉴스', category: '교육', frequency: '매일', frequencyGroup: 'daily', description: '유아·초중고·대학 교원과 학부모를 대상으로 한 교육 전문지.', url: 'https://www.eduinnews.co.kr/', daysSince: 0, typical: '매일', status: 'alive', interests: ['교육', '시사'], origin: '한국', language: '한국어', country: '대한민국', type: 'site' },

  // 검증 공공·비영리 출처
  { id: 'bbc-news', name: 'BBC News', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '영국 공영방송의 세계·정치·과학·문화 뉴스와 해설.', url: 'https://www.bbc.com/news', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '시사'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '영어 외 · 소개 한국어', country: '영국', type: 'site' },
  { id: 'dw-news', name: 'Deutsche Welle', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '독일·유럽·세계 이슈를 다국어로 제공하는 국제 공영 미디어.', url: 'https://www.dw.com/', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '시사', '정책'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '다국어 · 소개 한국어', country: '독일', type: 'site' },
  { id: 'france-24', name: 'France 24', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '프랑스 기반의 국제 뉴스·분석 채널.', url: 'https://www.france24.com/', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '시사'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '영어·프랑스어 외 · 소개 한국어', country: '프랑스', type: 'site' },
  { id: 'al-jazeera', name: 'Al Jazeera', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '중동과 세계 이슈를 폭넓게 다루는 카타르 기반 국제 뉴스 네트워크.', url: 'https://www.aljazeera.com/', daysSince: 0, typical: '상시 · 뉴스레터 선택 가능', status: 'alive', interests: ['국제', '시사', '정책'], trust: ['공식 뉴스레터', '무료 공개'], origin: '글로벌', language: '영어·아랍어 외 · 소개 한국어', country: '카타르', type: 'site' },
  { id: 'nhk-world', name: 'NHK WORLD-JAPAN', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '일본 공영 국제 서비스의 아시아·세계 뉴스와 문화 정보.', url: 'https://www3.nhk.or.jp/nhkworld/', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '문화', '시사'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '다국어 · 소개 한국어', country: '일본', type: 'site' },
  { id: 'abc-australia', name: 'ABC News Australia', category: '시사', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '호주 공영방송의 국내·국제 뉴스와 해설.', url: 'https://www.abc.net.au/news', daysSince: 0, typical: '상시', status: 'alive', interests: ['시사', '국제'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '영어 · 소개 한국어', country: '호주', type: 'site' },
  { id: 'cbc-news', name: 'CBC News', category: '시사', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '캐나다 공영방송의 뉴스·분석·지역 보도.', url: 'https://www.cbc.ca/news', daysSince: 0, typical: '상시', status: 'alive', interests: ['시사', '국제'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '영어·프랑스어 · 소개 한국어', country: '캐나다', type: 'site' },
  { id: 'agencia-brasil', name: 'Agência Brasil', category: '시사', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '브라질 공영 통신사의 포르투갈어 뉴스와 공공 정보.', url: 'https://agenciabrasil.ebc.com.br/', daysSince: 0, typical: '상시', status: 'alive', interests: ['시사', '국제'], trust: ['공영 미디어', '무료 공개'], origin: '글로벌', language: '포르투갈어 · 소개 한국어', country: '브라질', type: 'site' },
  { id: 'cna', name: 'Channel NewsAsia', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '싱가포르 기반의 동남아시아·국제 뉴스와 분석.', url: 'https://www.channelnewsasia.com/', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '시사', '경제'], trust: ['공식 미디어', '무료 공개'], origin: '글로벌', language: '영어 · 소개 한국어', country: '싱가포르', type: 'site' },
  
  { id: 'library-of-congress', name: '미국 의회도서관', category: '문화', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '역사·문학·법·민속·음악·공연예술·디지털 인문학을 주제별 RSS와 이메일로 받는 공공 아카이브.', url: 'https://www.loc.gov/rss/', daysSince: 0, typical: '주제별 상이', status: 'alive', interests: ['역사', '문학', '법률'], trust: ['공식 RSS·이메일', '공공기관', '직원 블로그 텍스트 재사용 조건 확인'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '인문·사회과학', reuseLevel: 'C', licenseUrl: 'https://blogs.loc.gov/about/' },
  { id: 'smithsonian-natural-history', name: '스미스소니언 자연사박물관', category: '과학', frequency: '월간', frequencyGroup: 'occasional', description: '생물다양성·진화·지질·자연사 연구와 전시 소식을 전하는 공공 박물관 뉴스레터.', url: 'https://naturalhistory.si.edu/join-us/sign-up-newsletter', daysSince: 1, typical: '뉴스레터 선택', status: 'alive', interests: ['생명과학', '지구과학', '문화'], trust: ['공식 뉴스레터', '공공 박물관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'newsletter', discipline: '자연과학' },
  { id: 'nasa-official', name: 'NASA Science', category: '과학', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '우주·지구·천문·항공우주·오픈사이언스의 RSS와 분야별 뉴스레터를 제공하는 미국 항공우주국.', url: 'https://www.nasa.gov/newsletters/', daysSince: 0, typical: '주제별 상이', status: 'alive', interests: ['우주', '천문학', '지구과학'], trust: ['공식 RSS·뉴스레터', '공공기관', '라이선스 개별 확인'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'newsletter', discipline: '자연과학', reuseLevel: 'C', licenseUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/' },
  { id: 'noaa-ocean-service', name: 'NOAA National Ocean Service', category: '환경', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '해양·기후·연안·해양생물·재난 정보를 주제별 RSS로 제공하는 미국 해양대기청 서비스.', url: 'https://oceanservice.noaa.gov/rss.html', daysSince: 0, typical: 'RSS 상시', status: 'alive', interests: ['기후', '해양', '재난'], trust: ['공식 RSS', '공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '자연과학' },
  { id: 'usgs-news', name: 'USGS', category: '과학', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '지질·지진·수자원·생태·지도·자연재해 정보를 RSS와 뉴스레터로 제공하는 미국 지질조사국.', url: 'https://www.usgs.gov/news/get-our-news/', daysSince: 0, typical: '주제별 RSS', status: 'alive', interests: ['지질', '지진', '환경'], trust: ['공식 RSS·뉴스레터', '공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '자연과학' },
  { id: 'nist-rss', name: 'NIST', category: '테크', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: 'AI·보안·반도체·화학·물리·제조·표준·나노기술을 주제별 RSS로 제공하는 미국 표준기술연구소.', url: 'https://www.nist.gov/coo/nist-rss-feeds', daysSince: 0, typical: '주제별 RSS', status: 'alive', interests: ['AI', '보안', '반도체'], trust: ['공식 RSS', '공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '공학·기술' },
  { id: 'nih-niehs', name: 'NIH NIEHS', category: '의료', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '환경보건·독성학·생의학 연구와 뉴스레터를 RSS로 제공하는 미국 국립보건원 산하 연구소.', url: 'https://www.niehs.nih.gov/rssfeed', daysSince: 0, typical: '뉴스·연구·뉴스레터 RSS', status: 'alive', interests: ['보건', '생명과학', '환경'], trust: ['공식 RSS', '공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '자연과학' },
  { id: 'jaxa-rss', name: 'JAXA', category: '과학', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '일본 항공우주연구개발기구의 우주·위성·항공 연구 보도자료와 새 소식 RSS.', url: 'https://www.jaxa.jp/public_j.html', daysSince: 0, typical: 'RSS 상시', status: 'alive', interests: ['우주', '항공우주', '지구과학'], trust: ['공식 RSS', '공공기관'], origin: '글로벌', language: '일본어·영어 · 소개 한국어', country: '일본', type: 'site', discipline: '공학·기술' },
  { id: 'esa-rss', name: 'European Space Agency', category: '과학', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '유럽우주국의 우주탐사·지구관측·위성·과학 프로그램별 RSS와 이메일 업데이트.', url: 'https://www.esa.int/Services/RSS_Feeds', daysSince: 0, typical: '프로그램별 RSS', status: 'alive', interests: ['우주', '천문학', '기후'], trust: ['공식 RSS·이메일', '공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '유럽', type: 'site', discipline: '공학·기술' },
  { id: 'eurostat-rss', name: 'Eurostat', category: '재테크', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '인구·경제·무역·노동·환경·과학기술 통계를 주제별 RSS와 알림으로 제공하는 유럽연합 통계청.', url: 'https://ec.europa.eu/eurostat/web/rss', daysSince: 0, typical: '통계 발표별 RSS', status: 'alive', interests: ['경제', '통계', '정책'], trust: ['공식 RSS', 'EU 공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '유럽', type: 'site', discipline: '인문·사회과학' },
  { id: 'eea-rss', name: 'European Environment Agency', category: '환경', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '유럽 환경·기후 지표, 보고서, 지도와 차트의 공개 업데이트 RSS.', url: 'https://www.eea.europa.eu/en/newsroom/rss-feeds', daysSince: 0, typical: '지표·발간물 RSS', status: 'alive', interests: ['환경', '기후', '데이터'], trust: ['공식 RSS', 'EU 공공기관', '라이선스 개별 확인'], origin: '글로벌', language: '영어 · 소개 한국어', country: '유럽', type: 'site', discipline: '자연과학', reuseLevel: 'C', licenseUrl: 'https://www.eea.europa.eu/en/newsroom/rss-feeds' },
  { id: 'ec-digital-newsletter', name: 'European Commission Digital', category: '테크', frequency: '매일·주간', frequencyGroup: 'weekly', description: 'AI·디지털 정책·플랫폼·사이버보안·연구 지원 소식을 일간 또는 주간으로 받는 유럽위원회 뉴스레터.', url: 'https://digital-strategy.ec.europa.eu/en/newsletters', daysSince: 1, typical: '매일 또는 주간 선택', status: 'alive', interests: ['AI', '정책', '보안'], trust: ['공식 뉴스레터', 'EU 공공기관'], origin: '글로벌', language: '영어 · 소개 한국어', country: '유럽', type: 'newsletter', discipline: '공학·기술' },
  { id: 'kbs-world-rss', name: 'KBS WORLD Radio', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '한국의 정치·경제·사회·문화·과학·스포츠를 언어별·분야별 RSS로 제공하는 공영 국제방송.', url: 'https://world.kbs.co.kr/service/about_rss.htm?lang=k', daysSince: 0, typical: '분야별 RSS', status: 'alive', interests: ['시사', '국제', '문화'], trust: ['공식 RSS', '공영 미디어'], origin: '한국', language: '한국어·다국어', country: '대한민국', type: 'site', discipline: '인문·사회과학' },
  { id: 'kdca-health', name: '질병관리청 국가건강정보포털', category: '건강', frequency: '월간', frequencyGroup: 'occasional', description: '생활 건강·질병 예방·공중보건 정보를 제공하고 월간세알 뉴스레터를 운영하는 국가 건강정보 포털.', url: 'https://health.kdca.go.kr/healthinfo/biz/health/intrcnYard/histMain.do', daysSince: 1, typical: '월간 뉴스레터', status: 'alive', interests: ['건강', '의료', '보건'], trust: ['공식 뉴스레터', '정부기관'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter', discipline: '자연과학' },
  { id: 'korea-policy-briefing', name: '대한민국 정책브리핑', category: '시사', frequency: '주간', frequencyGroup: 'weekly', description: '정부 정책과 생활 행정 정보를 뉴스레터로 받아보는 대한민국 공식 정책 포털.', url: 'https://m.korea.kr/etc/noticeList.do', daysSince: 1, typical: '뉴스레터 · RSS 종료 공지 확인', status: 'alive', interests: ['시사', '정책', '교육'], trust: ['공식 뉴스레터', '정부기관'], origin: '한국', language: '한국어', country: '대한민국', type: 'newsletter', discipline: '인문·사회과학' },
  { id: 'bank-of-japan-rss', name: 'Bank of Japan', category: '재테크', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '금융정책·경제 분석·통계 발표를 RSS와 이메일 알림으로 제공하는 일본 중앙은행.', url: 'https://www.boj.or.jp/en/tips.htm', daysSince: 0, typical: '새 소식·통계 RSS', status: 'alive', interests: ['경제', '금융', '통계'], trust: ['공식 RSS·이메일', '공공기관'], origin: '글로벌', language: '일본어·영어 · 소개 한국어', country: '일본', type: 'site', discipline: '인문·사회과학' },
  { id: 'japan-energy-newsletter', name: '일본 자원에너지청', category: '환경', frequency: '주간', frequencyGroup: 'weekly', description: '에너지 안보·전력·재생에너지·산업 정책을 전하는 일본 정부의 주간 이메일 매거진.', url: 'https://www.enecho.meti.go.jp/about/mailmagazine/index.html', daysSince: 1, typical: '주 1회', status: 'alive', interests: ['에너지', '환경', '정책'], trust: ['공식 뉴스레터', '정부기관'], origin: '글로벌', language: '일본어 · 소개 한국어', country: '일본', type: 'newsletter', discipline: '공학·기술' },
  { id: 'xinhua-rss', name: 'Xinhua / Xinhuanet', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '중국·세계·경제·문화·과학기술 분야의 영어 RSS를 제공하는 중국 국영 통신사 포털.', url: 'https://english.news.cn/rss/', daysSince: 0, typical: '분야별 RSS', status: 'alive', interests: ['국제', '시사', '경제'], trust: ['공식 RSS', '국영 통신사'], origin: '글로벌', language: '영어·중국어 · 소개 한국어', country: '중국', type: 'site', discipline: '인문·사회과학' },
  { id: 'china-daily-rss', name: 'China Daily', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '중국·경제·세계·문화 등 분야별 RSS를 제공하는 중국 국영 영어 신문.', url: 'https://europe.chinadaily.com.cn/rss.html', daysSince: 0, typical: '분야별 RSS', status: 'alive', interests: ['국제', '경제', '문화'], trust: ['공식 RSS', '국영 미디어', '원문 외부 링크만'], origin: '글로벌', language: '영어·중국어 · 소개 한국어', country: '중국', type: 'site', discipline: '인문·사회과학' },
  { id: 'cgtn-rss', name: 'CGTN', category: '국제', frequency: '매일', frequencyGroup: 'daily', description: '중국·세계·문화·과학기술 등의 최신 헤드라인과 원문 링크를 RSS로 제공하는 공영 국제 미디어.', url: 'https://www.cgtn.com/subscribe/rss.html', daysSince: 0, typical: '분야별 RSS', status: 'alive', interests: ['국제', '시사', '문화'], trust: ['공식 RSS', '공영 미디어'], origin: '글로벌', language: '영어·중국어 · 소개 한국어', country: '중국', type: 'site', discipline: '인문·사회과학' },

  { id: 'un-news', name: 'UN News', category: '국제', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '유엔의 인권·평화·인도주의·지속가능발전 공식 보도. 다국어 뉴스와 주제별 업데이트를 제공한다.', url: 'https://news.un.org/', daysSince: 0, typical: '상시', status: 'alive', interests: ['국제', '시사', '정책'], trust: ['국제기구', '무료 공개', '공식 미디어'], origin: '글로벌', language: '다국어 · 소개 한국어', country: '국제', type: 'site', discipline: '인문·사회과학', reuseLevel: 'A' },
  { id: 'who-news', name: 'WHO News', category: '건강', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '세계보건기구의 공중보건·질병·백신·글로벌 헬스 공식 뉴스와 브리핑.', url: 'https://www.who.int/news', daysSince: 0, typical: '상시', status: 'alive', interests: ['건강', '의료', '국제'], trust: ['국제기구', '무료 공개'], origin: '글로벌', language: '영어 외 · 소개 한국어', country: '국제', type: 'site', discipline: '자연과학', reuseLevel: 'A' },
  { id: 'imf-blogs', name: 'IMF Blogs', category: '재테크', frequency: '주 수회', frequencyGroup: 'weekly', description: '국제통화기금 전문가의 세계 경제·금융·정책 분석 블로그.', url: 'https://www.imf.org/en/Blogs', daysSince: 1, typical: '주 수회', status: 'alive', interests: ['경제', '재테크', '정책'], trust: ['국제기구', '무료 공개'], origin: '글로벌', language: '영어 · 소개 한국어', country: '국제', type: 'site', discipline: '인문·사회과학', reuseLevel: 'A' },
  { id: 'our-world-in-data', name: 'Our World in Data', category: '과학', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '빈곤·건강·기후·교육 등 글로벌 데이터를 차트와 해설로 공개하는 옥스퍼드 기반 연구 사이트. 항목별 라이선스 확인 후 재사용.', url: 'https://ourworldindata.org/', daysSince: 0, typical: '데이터셋·해설 상시', status: 'alive', interests: ['과학', '환경', '교육'], trust: ['비영리 연구', '데이터 공개', '라이선스 항목별'], origin: '글로벌', language: '영어 · 소개 한국어', country: '영국', type: 'site', discipline: '인문·사회과학', reuseLevel: 'C', licenseUrl: 'https://ourworldindata.org/faqs#how-can-i-use-your-work' },
  { id: 'world-bank-open-data', name: 'World Bank Open Data', category: '재테크', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '세계은행의 개발·경제·인구 공개 데이터 카탈로그. 다수 데이터셋이 CC BY 조건.', url: 'https://data.worldbank.org/', daysSince: 0, typical: '데이터셋 상시', status: 'alive', interests: ['경제', '데이터', '국제'], trust: ['국제기구', '오픈 데이터'], origin: '글로벌', language: '영어 · 소개 한국어', country: '국제', type: 'site', discipline: '인문·사회과학', reuseLevel: 'C', licenseUrl: 'https://datacatalog.worldbank.org/public-licenses' },
  { id: 'quanta-magazine', name: 'Quanta Magazine', category: '과학', frequency: '주 수회', frequencyGroup: 'weekly', description: '수학·물리·생명과학·컴퓨터과학을 깊이 있게 다루는 시몬스 재단 지원 무료 과학 저널리즘.', url: 'https://www.quantamagazine.org/', daysSince: 1, typical: '주 수회', status: 'alive', interests: ['과학', 'AI', '교육'], trust: ['비영리 저널리즘', '무료 공개'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'magazine', discipline: '자연과학', reuseLevel: 'A' },
  { id: 'the-conversation', name: 'The Conversation', category: '시사', frequency: '매일', frequencyGroup: 'daily', description: '연구자가 직접 쓰는 해설 기사. 개별 글의 Creative Commons 조건을 확인한 뒤 재게시 가능.', url: 'https://theconversation.com/', daysSince: 0, typical: '매일', status: 'alive', interests: ['시사', '과학', '교육'], trust: ['비영리', 'CC 조건부', '연구자 기고'], origin: '글로벌', language: '영어 외 · 소개 한국어', country: '호주', type: 'site', discipline: '인문·사회과학', reuseLevel: 'B', licenseUrl: 'https://theconversation.com/us/republishing-guidelines' },
  { id: 'propublica', name: 'ProPublica', category: '시사', frequency: '매일', frequencyGroup: 'daily', description: '미국 비영리 탐사보도. 공공 이슈·권력 감시 기사와 뉴스레터를 제공한다.', url: 'https://www.propublica.org/', daysSince: 0, typical: '매일 · 뉴스레터 선택', status: 'alive', interests: ['시사', '정책', '법률'], trust: ['비영리 탐사보도', '무료 공개'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '인문·사회과학', reuseLevel: 'A' },
  { id: 'internet-archive', name: 'Internet Archive', category: '문화', frequency: '상시 업데이트', frequencyGroup: 'occasional', description: '디지털 도서관·웹 아카이브·공개 도서·영상. 보존과 오픈 액세스를 위한 비영리 아카이브.', url: 'https://archive.org/', daysSince: 0, typical: '아카이브 상시', status: 'alive', interests: ['문화', '역사', '교육'], trust: ['비영리', '디지털 보존'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '인문·사회과학', reuseLevel: 'A' },
  { id: 'github-blog', name: 'The GitHub Blog', category: '테크', frequency: '주 수회', frequencyGroup: 'weekly', description: '오픈소스·개발자 도구·보안·AI 코딩 관련 공식 발표. 개발 생태계 흐름을 공식 채널로 확인.', url: 'https://github.blog/', daysSince: 1, typical: '주 수회 · RSS 제공', status: 'alive', interests: ['AI', '개발', '테크'], trust: ['공식 블로그', 'RSS'], origin: '글로벌', language: '영어 · 소개 한국어', country: '미국', type: 'site', discipline: '공학·기술', reuseLevel: 'A' }
];

export const publicSourceIds = new Set([
  'bbc-news', 'dw-news', 'france-24', 'al-jazeera', 'nhk-world', 'abc-australia', 'cbc-news', 'agencia-brasil', 'cna',
  'library-of-congress', 'smithsonian-natural-history', 'nasa-official', 'noaa-ocean-service', 'usgs-news', 'nist-rss', 'nih-niehs', 'jaxa-rss', 'esa-rss', 'eurostat-rss', 'eea-rss', 'ec-digital-newsletter',
  'kbs-world-rss', 'kdca-health', 'korea-policy-briefing', 'bank-of-japan-rss', 'japan-energy-newsletter', 'xinhua-rss', 'china-daily-rss', 'cgtn-rss',
  'un-news', 'who-news', 'imf-blogs', 'our-world-in-data', 'world-bank-open-data', 'quanta-magazine', 'the-conversation', 'propublica', 'internet-archive', 'github-blog', 'yaleclimate',
  // industryCatalog public
  'ind-semi-nl-asml-news', 'ind-fin-ch-snb', 'ind-ene-us-eia', 'ind-ene-no-ssb', 'ind-ene-de-bundesnetz', 'ind-ene-ca-cer',
  'ind-ai-uk-bbc-tech', 'ind-pharma-us-fda', 'ind-pharma-ch-swissmedic', 'ind-pharma-de-pei', 'ind-pharma-uk-mhra',
  'ind-space-us-nasa', 'ind-space-fr-esa', 'ind-space-jp-jaxa', 'ind-space-in-isro', 'ind-space-ca-csa',
  'ind-media-us-npr', 'ind-media-de-dw', 'ind-media-fr-france24', 'ind-media-br-agencia', 'ind-media-au-abc',
  'ind-ag-us-usda', 'ind-ag-br-embrapa', 'ind-ag-nl-wageningen', 'ind-ag-in-icar', 'ind-ag-fr-inrae'
]);

export const readingTimes: Record<string, string> = {
  '시사': '3분 읽기', '비즈니스': '4분 읽기', '마케팅': '3분 읽기', '테크': '5분 읽기', '라이프': '3분 읽기', '커리어': '4분 읽기', '재테크': '3분 읽기', '스타트업': '4분 읽기', 'AI': '2분 읽기', '부동산': '4분 읽기', '과학': '4분 읽기', '법률': '3분 읽기', '게임': '3분 읽기', '여행': '3분 읽기', '환경': '4분 읽기', '건강': '3분 읽기', '음식': '3분 읽기', 'HR': '4분 읽기', '세무': '4분 읽기', '농업': '4분 읽기', '반려동물': '3분 읽기', '육아': '3분 읽기', '자동차': '4분 읽기', '패션': '3분 읽기', '의료': '4분 읽기', '로봇공학': '4분 읽기', '반도체': '4분 읽기', '크립토': '3분 읽기', '스포츠': '2분 읽기', '교육': '4분 읽기', '국제': '5분 읽기', '사진': '2분 읽기'
};

export const valuePromises: Record<string, string> = {
  '시사': '한 줄 요약 뒤에, 왜 중요한지까지 알려줘요.', '비즈니스': '일하는 사람에게 필요한 맥락을 먼저 짚어줘요.', '마케팅': '바로 써먹을 수 있는 브랜드 사례를 골라줘요.', '테크': '링크보다 맥락을 먼저 확인할 수 있어요.', '라이프': '짧게 읽어도 오래 생각할 이야기를 전해요.', '커리어': '내 일과 성장에 연결되는 포인트를 보여줘요.', '재테크': '시장을 보는 관점을 짧게 정리해줘요.', '스타트업': '만드는 사람의 관점에서 흐름을 짚어줘요.', 'AI': 'AI 현장의 변화를 가장 빠르게 알려줘요.', '부동산': '실수요자에게 필요한 정보만 골라줘요.', '과학': '검증된 연구를 쉬운 말로 풀어줘요.', '법률': '판례와 제도 변화를 놓치지 않게 해줘요.', '게임': '신작과 업계 소식을 빠르게 훑어줘요.', '여행': '가기 전 알아야 할 실전 정보를 챙겨줘요.', '환경': '기후·ESG 흐름을 놓치지 않게 해줘요.', '건강': '몸과 마음을 챙기는 근거 있는 정보를 줘요.', '음식': '식품·외식 산업 흐름을 챙겨줘요.', 'HR': '조직과 사람 관리의 실무 감각을 키워줘요.', '세무': '세법·판례 변화를 놓치지 않게 해줘요.', '농업': '농업 현장과 정책 변화를 전해줘요.', '반려동물': '반려동물 건강·정보를 근거 있게 전해요.', '육아': '임신·출산·육아 정보를 실용적으로 전해요.', '자동차': '신차와 산업 동향을 빠르게 훑어줘요.', '패션': '패션 산업의 흐름과 비즈니스를 짚어줘요.', '의료': '의료 정책과 산업 변화를 전해요.', '로봇공학': '로봇·자동화 기술 동향을 짚어줘요.', '반도체': '반도체 산업 흐름을 깊이 있게 전해요.', '크립토': '블록체인·암호화폐 소식을 정리해줘요.', '스포츠': '경기와 업계 소식을 빠르게 훑어줘요.', '교육': '교육 정책과 현장 변화를 전해요.', '국제': '국제정세를 깊이 있게 분석해줘요.', '사진': '카메라·사진 업계 소식을 전해요.'
};

export const disciplineByCategory: Record<string, string> = {
  '시사': '인문·사회과학', '비즈니스': '인문·사회과학', '재테크': '인문·사회과학', '커리어': '인문·사회과학', '법률': '인문·사회과학', 'HR': '인문·사회과학', '세무': '인문·사회과학', '교육': '인문·사회과학', '국제': '인문·사회과학',
  '과학': '자연과학', '환경': '자연과학', '건강': '자연과학', '의료': '자연과학', '농업': '자연과학', '반려동물': '자연과학',
  '테크': '공학·기술', 'AI': '공학·기술', '스타트업': '공학·기술', '자동차': '공학·기술', '로봇공학': '공학·기술', '반도체': '공학·기술', '크립토': '공학·기술', '리더십': '인문·사회과학', '자기계발': '인문·사회과학',
  '디자인': '예술·체육·생활', '문화': '예술·체육·생활', '사진': '예술·체육·생활', '게임': '예술·체육·생활', '패션': '예술·체육·생활', '스포츠': '예술·체육·생활', '음식': '예술·체육·생활', '여행': '예술·체육·생활', '라이프': '예술·체육·생활', '육아': '예술·체육·생활', '부동산': '예술·체육·생활', '마케팅': '예술·체육·생활'
};

export const globalCountries: Record<string, string> = {
  'morning-brew': '미국', 'tldr': '미국', 'rundown-ai': '미국', 'the-hustle': '미국', 'stratechery': '미국', 'the-browser': '영국', 'dense-discovery': '호주', 'three-two-one': '미국', 'hbr-tip': '미국', 'wired': '미국', 'the-atlantic': '미국', 'mit-tech-review': '미국', 'nature': '영국', 'nomadicmatt': '미국', 'ign': '미국', 'rogerebert': '미국', 'yaleclimate': '미국', 'foreign-affairs': '미국', 'petapixel': '미국'
};

export const stackTools = [
  { name: 'awesome-newsletters', blurb: '커뮤니티 큐레이션 뉴스레터 목록. 후보 발굴용.', url: 'https://github.com/zudochkin/awesome-newsletters', kind: '목록' },
  { name: 'awesome-rss-feeds', blurb: '국가·주제별 RSS/OPML 시드. 공개 피드 확장용.', url: 'https://github.com/plenaryapp/awesome-rss-feeds', kind: 'OPML' },
  { name: 'ALL-about-RSS', blurb: 'RSS 도구·서비스·튜토리얼 총정리 메타 목록.', url: 'https://github.com/AboutRSS/ALL-about-RSS', kind: '목록' },
  { name: 'RSSHub', blurb: '웹 서비스를 RSS로 노출. 약관·속도 제한 준수 필수.', url: 'https://github.com/DIYgod/RSSHub', kind: '변환' },
  { name: 'FreshRSS', blurb: '자가 호스팅 멀티유저 RSS 리더. 개인 읽기함.', url: 'https://github.com/FreshRSS/FreshRSS', kind: '리더' },
  { name: 'Miniflux', blurb: '가벼운 프라이버시 지향 RSS 리더.', url: 'https://github.com/miniflux/v2', kind: '리더' },
  { name: 'NetNewsWire', blurb: 'macOS/iOS 오픈소스 리더. OPML 가져오기 쉬움.', url: 'https://github.com/Ranchero-Software/NetNewsWire', kind: '리더' },
  { name: 'FeedMe', blurb: '다소스 요약형 피드 UI. GH Pages/Vercel 배포 사례.', url: 'https://github.com/Seanium/feedme', kind: '집계' },
  { name: 'kill-the-news', blurb: '뉴스레터 수신 주소를 개인 RSS로 변환 (Cloudflare).', url: 'https://github.com/juherr/kill-the-news', kind: '브릿지' },
  { name: 'Listmonk', blurb: '자가 호스팅 발송 도구. 외부 구독 대행용이 아님.', url: 'https://github.com/knadh/listmonk', kind: '발송' }
];

function normalizeItem(item: Partial<Newsletter>): Newsletter {
  const id = item.id || '';
  const isPublic = publicSourceIds.has(id) || item.sourceScope === 'public';
  const origin = item.origin || '한국';
  const country = item.country || (origin === '글로벌' ? (globalCountries[id] || '미국') : '대한민국');
  const type = item.type || 'newsletter';
  const category = item.category || '시사';
  const discipline = item.discipline || disciplineByCategory[category] || '기타·융합';
  const hint = subscribeHints[id];
  const siteUrl = item.siteUrl || hint?.siteUrl || item.url || '';
  const subscribeUrl = item.subscribeUrl || hint?.subscribeUrl;
  const url = siteUrl || item.url || '';

  return {
    id,
    name: item.name || '',
    category,
    frequency: item.frequency || '매일',
    frequencyGroup: item.frequencyGroup || 'daily',
    description: item.description || '',
    siteUrl: siteUrl || url,
    subscribeUrl: subscribeUrl && subscribeUrl !== siteUrl ? subscribeUrl : subscribeUrl,
    url,
    daysSince: item.daysSince !== undefined ? item.daysSince : 0,
    typical: item.typical || '매일 오전',
    status: item.status || 'alive',
    interests: item.interests || [],
    trust: item.trust || ['공식 링크 확인'],
    origin,
    language: item.language || (origin === '글로벌' ? '영어 · 소개 한국어' : '한국어'),
    country,
    type,
    discipline,
    reuseLevel: item.reuseLevel || 'A',
    licenseUrl: item.licenseUrl || '',
    feedUrl: item.feedUrl,
    sourceScope: isPublic ? 'public' : 'general',
    stability: item.stability || (isPublic ? 'high' : 'medium'),
    industry: item.industry,
  };
}

// 기존 + 산업별 상위국 카탈로그 (id 중복 시 industry 쪽이 덮어씀)
const mergedRaw = (() => {
  const map = new Map<string, Partial<Newsletter>>();
  for (const row of rawNewsletters) {
    if (row.id) map.set(row.id, row);
  }
  for (const row of industryRaw) {
    if (!row.id) continue;
    // industry 전용 id는 추가, 동일 id면 industry 필드로 보강
    const prev = map.get(row.id);
    map.set(row.id, prev ? { ...prev, ...row } : row);
  }
  return [...map.values()];
})();

export const newsletters: Newsletter[] = mergedRaw.map(normalizeItem);

export const categories = ['전체', ...new Set(newsletters.map(n => n.category))];
export const topics = ['전체', ...new Set(newsletters.flatMap(n => n.interests))];
export const countriesList = ['전체', ...new Set(newsletters.map(n => n.country))];
export const typesList = ['전체', ...new Set(newsletters.map(n => n.type))];
export const disciplinesList = ['전체', ...new Set(newsletters.map(n => n.discipline))];
export const industryList = industryListSeed.length > 1
  ? industryListSeed
  : ['전체', ...new Set(newsletters.map(n => n.industry).filter(Boolean) as string[])];
export const unsubscribeText: Record<string, string> = {
  newsletter: '해지 · 원문 메일 하단 수신거부 링크 또는 계정 설정',
  magazine: '해지 · 구독 관리 페이지 또는 메일 하단 링크',
  site: '그만 보기 · 즐겨찾기 삭제 또는 방문 중단'
};
export const reuseLabels: Record<string, string> = {
  A: '외부 링크·자체 소개만',
  B: '조건부 재사용',
  C: '오픈 라이선스 확인'
};
