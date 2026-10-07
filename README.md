# 강동혁 ♥ 김세희 — 모바일 청첩장 (초안)

정적 파일 3개로만 동작합니다. 빌드 과정이 없습니다.

```
index.html      마크업 (모든 텍스트/연락처/계좌가 여기 있습니다)
style.css       스타일 (색상은 :root 변수로 모아두었습니다)
script.js       캘린더·D-day·복사·갤러리·BGM·방명록
images/         웨딩 스냅 (원본을 가로 1600px로 리사이즈해 둠)
audio/          배경음악 (bgm.mp3 를 넣어주세요 — 현재 비어 있음)
```

## 보기

```bash
cd "세희모청"
python3 -m http.server 8777
# → http://localhost:8777
```

`file://` 로 바로 열어도 동작하지만, 지도 iframe과 클립보드는
로컬 서버(또는 https 배포)에서 보는 편이 정확합니다.

## 첫 페이지 (히어로)

현재는 **첫페이지레퍼런스(1)** 스타일입니다 — 흑백 스냅 전면 + 핑크 손글씨/손그림 포스터.

| 요소 | 내용 |
|---|---|
| 배경 | `images/photo3.jpg` 전면, 흑백 처리 + 느린 줌 인 |
| 타자기 문구 · 날짜 · `TWO LIVES / ONE LOVE` | 시스템 모노(`Courier New`) — 웹폰트 추가 없음 |
| 이름 `Dong Hyuk & Se Hee` | Pacifico, 핑크, 좌하단에서 오른쪽으로 흘러넘침 |
| 손그림 | 반지 · 하트2 · 컬 · 화살표 · 별(선/면) · 카메라 · 흰 서명 squiggle |

- 손그림 위치는 `style.css` 의 `.dd--ring / --heart1 / --heart2 / --curl / --arrow /
  --star1 / --star2 / --cam / --sign` 에서 `top / left / width` 로 조절합니다 (모두 %라 화면 크기 무관).
- 포스터 높이는 `.hero__poster` 의 `height:min(137vw, 630px)`.
- 사진을 바꾸려면 `.hero__bg` 의 `src` 만 교체하세요 (`photo4.jpg` 는 두 사람이 또렷한 세로컷).

### 히어로 버전 보관

`index.html` 에 **이전 두 버전이 주석으로 남아 있습니다.**

1. 스냅 + Parisienne 손글씨 이름 (최초안)
2. 마커 손글씨 포스터 (레퍼런스 2)

(잉크 도트 포스터 / 레퍼런스 3 버전은 HTML·CSS 모두 삭제했습니다.)

되돌리려면 해당 주석을 풀고 **안쪽의 `[[ ]]` 를 `<!-- -->` 로 복원**한 뒤 지금의 `.hero__poster` 블록을 지우면 됩니다.
(`[[ ]]` 로 바꿔둔 이유: 주석 안에 `-->` 가 남아 있으면 주석이 거기서 끊깁니다.)
관련 CSS 도 모두 남겨뒀습니다.

## 폰트

| 쓰임 | 폰트 |
|---|---|
| 본문 한글 | Gowun Batang (고운바탕) |
| 큰 디스플레이 영문 (`JUST MARRIED`, `FOREVER & ALWAYS`) | Archivo 800 |
| 이름 손글씨 (`Dong Hyuk & Se Hee`) | Parisienne |
| 숫자 (달력·D-day) | Cormorant Garamond |
| **작은 글씨 (영문·숫자 라벨, 캡션)** | **Dr Regular** → 폴백 DM Sans → 한글은 Gowun Dodum |

### Dr Regular 적용 방법

`fonts/` 폴더에 `Dr-Regular.woff2` (또는 .woff/.otf/.ttf) 를 넣으면 자동 적용됩니다.
`style.css` 최상단 `@font-face` 와 `--font-sm` 변수가 이미 연결되어 있습니다.

알아두실 점 세 가지:

1. **Dr 은 유료 폰트입니다.** Production Type(Bureau Brut / Quentin Schmerber) 제작,
   산돌클라우드 구독으로 제공됩니다. **웹폰트 임베딩이 라이선스에 포함되는지 확인**이 필요합니다.
2. **Dr 은 라틴(영문·숫자) 전용이라 한글 글리프가 없습니다.**
   그래서 한글 작은 글씨(`자가용`, `신랑`, `복사` 등)는 기존 서체를 그대로 두었습니다.
3. 파일을 넣기 전까지는 같은 지오메트릭 산세리프 계열인 **DM Sans** 로 표시됩니다.

적용된 곳: 섹션 라벨(`INVITATION`·`GALLERY` 등), 히어로 영문 문구, 달력 요일/월,
D-day 단위(`DAYS`/`HOUR`), 갤러리 넘버링·캡션·여백 타이포 소문자,
방명록 날짜, 푸터 날짜/문구, 라이트박스 카운터.

## 자주 바꾸는 곳

| 항목 | 위치 |
|---|---|
| 색상 (베이지/핑크) | `style.css` 최상단 `:root` |
| 작은 글씨 폰트 | `style.css` `:root` 의 `--font-sm` |
| 예식 일시 (캘린더·D-day 자동 반영) | `script.js` 의 `WEDDING` |
| 초대 문구 / 부모님 / 계좌 / 연락처 | `index.html` 해당 섹션 |

## 사진 추가하기

`images/` 에 `photo4.jpg …` 를 넣고, `index.html` 갤러리의 placeholder를
아래처럼 바꾸면 라이트박스까지 자동으로 연결됩니다.

```html
<figure class="mosaic__item m4 reveal">
  <span class="mosaic__no">( 4 )</span>
  <img src="images/photo4.jpg" alt="웨딩 스냅 4" loading="lazy">
</figure>
```

슬롯을 더 늘리려면 `style.css` 의 `.m1 ~ .m6` 패턴을 참고해
`grid-column / grid-row / aspect-ratio` 를 추가하면 됩니다.

## 갤러리 여백 타이포

레퍼런스처럼 사진 사이 여백에 웨딩 문구를 흩뿌려 두었습니다.
(`JUST MARRIED` / `2027. 01. 09` / `WEDDING DAY`(세로) / `JEJU ISLAND WEDDING` /
`FOREVER & ALWAYS` / `our little moments together in jeju`)

- 문구 수정 → `index.html` 갤러리 안의 `<p class="gw gw--___">`
- 위치·크기 수정 → `style.css` 의 `.gw--___` (`left/top` 은 %, 글자 크기는
  모자이크 폭 변수 `--gw` 에 비례하므로 화면 크기와 무관하게 비율이 유지됩니다)

`JUST MARRIED` 와 `FOREVER & ALWAYS` 는 같은 서체(Archivo 800)로 맞췄고,
모자이크 폭 안에 완전히 들어오도록 크기를 잡았습니다.

## 아직 비어 있는 항목 (자료 주시면 채웁니다)

- **배경음악** — `audio/bgm.mp3` 파일 필요. (파일이 없으면 버튼이 비활성처럼 보입니다)
- **버스 노선 안내** — `index.html` 의 `오시는 길 > 버스` 문구
- **지도** — 네이버 지도 API(NCP Maps, Dynamic Map). `script.js` 맨 위 `NAVER_MAP_KEY` / `VENUE`.
  청첩장을 올릴 도메인을 NCP 콘솔 Application 의 **Web 서비스 URL** 에 등록해야 지도가 뜹니다.
  (로컬 테스트는 `http://localhost:5500` 처럼 포트까지 등록). 인증 실패 시 네이버 지도 바로가기 링크로 대체됩니다.
- **메인 사진** — 현재 `photo3.jpg`(들판 샷) 사용. 레퍼런스처럼 흑백 톤을 입혀두었으며,
  `style.css` 의 `.hero__photo img { filter }` 에서 조절할 수 있습니다.

## 방명록

Google Sheets 에 저장됩니다. (`script.js` 의 `GB_API` 가 비어 있으면 localStorage 에만 저장)

연결 방법:

1. 구글 시트 새로 만들기 → **확장 프로그램 > Apps Script**
2. `apps-script/Code.gs` 내용을 통째로 붙여넣고 저장
3. **배포 > 새 배포** → 유형 **웹 앱** →
   실행 사용자 **나**, 액세스 권한 **모든 사용자** → 배포 (권한 승인)
4. 발급된 `https://script.google.com/macros/s/…/exec` URL 을
   `script.js` 맨 위 `GB_API = '…'` 에 넣기

`방명록` 시트는 첫 요청 때 자동으로 생깁니다 (작성시각 | 이름 | 메시지).
부적절한 글은 시트에서 해당 행을 지우면 됩니다.
`Code.gs` 를 고친 뒤에는 **배포 관리 > 수정 > 버전: 새 버전** 으로 다시 배포해야 반영됩니다 (URL 은 그대로).
