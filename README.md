# 반도체 4대 학회 기술동향 대시보드

국내(KCS)와 해외 3대 학회(IEDM·ISSCC·VLSI) 세션을 공통 기술분류(19영역)에
매핑해 국내·해외 연구동향을 비교하는 **정적 단일페이지 대시보드**입니다.
서버 없이 동작하며 GitHub Pages에 그대로 올릴 수 있습니다.

## 구성
```
dashboard/
  index.html        화면
  css/style.css      스타일
  js/data.js         데이터(자동 생성, 편집 금지)
  js/app.js          차트 로직 (Plotly.js, CDN)
```
- 차트 라이브러리 **Plotly.js**는 CDN으로 불러옵니다 → 인터넷 연결 필요.
- 데이터는 `js/data.js`에 임베드되어 있어 fetch/CORS 문제 없이 `file://` 와
  GitHub Pages 양쪽에서 동작합니다.

## 섹션
1. **국내·해외 비교** — 기술영역별 비중(%) 차이(국내% − 해외%) 다이버징 막대
2. **기술영역 Activity 산점도** — X=누적 세션수, Y=활동지수(최근성), 4사분면
   (Emerging / Core Rising / Niche / Mature). 전체/국내/해외 토글
3. **시즌별 트렌드** — 시즌(발행시기 코호트)별 영역 비중(%) 추이

## 로컬에서 보기
인터넷 연결 상태에서 `index.html` 을 브라우저로 열면 됩니다. (더블클릭)
> 일부 브라우저는 `file://` 에서 로컬 JS 로드를 막을 수 있습니다. 그럴 땐 이 폴더에서
> 간단한 로컬 서버를 띄우세요: `python -m http.server 8000` → http://localhost:8000

## 데이터 갱신
세션 데이터가 바뀌면 대시보드 데이터도 다시 생성:
```
python ../scripts/build_dashboard_data.py   # sessions_mapped.csv -> js/data.js
```

## GitHub Pages 배포 (코딩 없이)
1. https://github.com/new 에서 **Public** 저장소 생성 (예: `semiconductor-conf-dashboard`).
   "Add a README" 체크 해제.
2. 저장소 페이지에서 **Add file → Upload files** → 이 `dashboard/` 폴더 **안의 모든 것**
   (`index.html`, `css/`, `js/`)을 드래그 업로드 → **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. 1~2분 후 주소가 표시됩니다: `https://<계정>.github.io/<저장소이름>/`

> 기존 KCS 대시보드처럼 별도 저장소로 운영하면 됩니다.
> `_shot.png` 등 미리보기 이미지는 업로드하지 않아도 됩니다.

## 향후 확장
- 분석 단위를 **논문 단위**로 올리면(현재 세션 단위) 키워드·기관 분석과
  더 촘촘한 산점도가 가능합니다(참고 KCS 대시보드 방식).
- 영역별 **세션 제목 드릴다운**, 학회별 프로필 탭 추가 가능.
