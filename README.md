# Google Play 스토어 대시보드

Google Play 스토어에서 앱 데이터를 수집하고 HTML 대시보드로 시각화하는 프로젝트입니다.

## 📋 개요

이 프로젝트는 [google-play-scraper](https://github.com/facundoolano/google-play-scraper)를 사용하여 Google Play 스토어의 앱 데이터를 수집하고, 수집된 데이터를 아름다운 HTML 대시보드로 시각화합니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터 수집 및 대시보드 생성

```bash
node run.js
```

또는 단계별로 실행:

```bash
# 데이터 수집
node collect_google_play_data.js

# HTML 대시보드 생성
node generate_html_dashboard.js
```

### 3. 대시보드 확인

생성된 `Google_Play_Dashboard.html` 파일을 브라우저에서 엽니다.

## 📁 프로젝트 구조

```
.
├── collect_google_play_data.js    # Google Play 앱 데이터 수집 스크립트
├── generate_html_dashboard.js    # HTML 대시보드 생성 스크립트
├── run.js                         # 전체 프로세스 실행 스크립트
├── package.json                   # Node.js 프로젝트 설정
├── data/                          # 수집된 데이터 저장 폴더
│   └── google_play_apps.json     # 수집된 앱 데이터 (JSON)
└── Google_Play_Dashboard.html     # 생성된 HTML 대시보드
```

## 🎯 기능

### 데이터 수집 (`collect_google_play_data.js`)

- 인기 검색어로 앱 검색
- 카테고리별 인기 앱 수집
- 앱 상세 정보 수집 (평점, 리뷰, 가격, 개발자 등)
- Rate limiting으로 API 제한 방지
- JSON 형식으로 데이터 저장

### HTML 대시보드 (`generate_html_dashboard.js`)

- **전체 통계**: 총 앱 수, 평균 평점, 무료/유료 앱 비율
- **가격 분포**: 무료, 저가, 중가, 고가 앱 분포
- **인기 카테고리**: 가장 많은 앱이 있는 카테고리
- **인기 개발자**: 가장 많은 앱을 개발한 개발자
- **앱 목록**: 평점 높은 순으로 정렬된 앱 카드 뷰

## 📊 대시보드 특징

- 🎨 현대적인 그라데이션 디자인
- 📱 반응형 레이아웃 (모바일/태블릿/데스크톱 지원)
- ⚡ 빠른 로딩 및 부드러운 애니메이션
- 🌈 카드 기반 UI 디자인
- 📈 실시간 통계 계산

## ⚙️ 설정

### 검색어 변경

`collect_google_play_data.js` 파일의 `searchTerms` 배열을 수정하여 검색할 키워드를 변경할 수 있습니다:

```javascript
const searchTerms = [
    'game', 'social', 'productivity', 'entertainment', 
    'education', 'shopping', 'music', 'video', 'photo', 'news'
];
```

### 수집할 앱 수 조정

각 검색어당 수집할 앱 수를 변경하려면 `num` 옵션을 수정하세요:

```javascript
const results = await gplay.search({
    term: term,
    num: 20,  // 이 값을 변경
    throttle: 2
});
```

### Rate Limiting

너무 많은 요청을 보내면 Google Play에서 차단될 수 있습니다. `throttle` 옵션으로 요청 속도를 제한할 수 있습니다:

```javascript
throttle: 2  // 초당 최대 2개 요청
```

## 📝 사용된 라이브러리

- [google-play-scraper](https://github.com/facundoolano/google-play-scraper) - Google Play 스토어 데이터 수집

## ⚠️ 주의사항

1. **Rate Limiting**: Google Play는 과도한 요청을 차단할 수 있습니다. `throttle` 옵션을 적절히 설정하세요.
2. **데이터 수집 시간**: 많은 앱을 수집할 경우 시간이 오래 걸릴 수 있습니다.
3. **인터넷 연결**: 데이터 수집을 위해서는 안정적인 인터넷 연결이 필요합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🔗 참고 자료

- [google-play-scraper GitHub](https://github.com/facundoolano/google-play-scraper)
- [Google Play 스토어](https://play.google.com/store)
