# GitHub Pages 배포 가이드

이 가이드는 Steam Dataset 대시보드를 GitHub Pages로 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. ✅ GitHub Desktop이 설치되어 있고 연결되어 있음
2. ✅ 프로젝트가 GitHub 저장소에 연결되어 있음
3. ✅ `index.html` 파일이 생성됨 (이미 완료)

## 🚀 배포 단계

### 1단계: 변경사항 커밋 및 푸시

1. **GitHub Desktop 열기**
   - GitHub Desktop 앱을 실행합니다

2. **변경사항 확인**
   - 왼쪽 패널에서 변경된 파일들을 확인합니다
   - `index.html` 파일이 추가된 것을 확인합니다

3. **커밋 메시지 작성**
   - 하단의 "Summary" 필드에 커밋 메시지를 입력합니다
   - 예: `Add index.html for GitHub Pages deployment`

4. **커밋 및 푸시**
   - "Commit to main" (또는 현재 브랜치 이름) 버튼 클릭
   - "Push origin" 버튼을 클릭하여 GitHub에 업로드

### 2단계: GitHub Pages 활성화

1. **GitHub 웹사이트 접속**
   - 브라우저에서 [github.com](https://github.com) 접속
   - 로그인 후 해당 저장소로 이동

2. **Settings 메뉴로 이동**
   - 저장소 페이지에서 상단의 **"Settings"** 탭 클릭
   - 왼쪽 사이드바에서 **"Pages"** 메뉴 클릭

3. **Pages 설정**
   - **Source** 섹션에서:
     - **Branch**: `main` (또는 `master`) 선택
     - **Folder**: `/ (root)` 선택
   - **Save** 버튼 클릭

4. **배포 완료 대기**
   - 몇 분 정도 기다리면 페이지가 배포됩니다
   - 상단에 녹색 체크 표시와 함께 배포 완료 메시지가 표시됩니다
   - 배포된 사이트 URL이 표시됩니다:
     ```
     https://[사용자명].github.io/[저장소명]/
     ```

### 3단계: 사이트 확인

1. **URL 접속**
   - GitHub Pages에서 제공한 URL로 접속
   - 또는 `https://[사용자명].github.io/[저장소명]/` 형식으로 직접 접속

2. **대시보드 확인**
   - 모든 차트와 기능이 정상적으로 작동하는지 확인
   - 모바일에서도 접속하여 반응형 디자인 확인

## 🔄 업데이트 방법

대시보드를 수정한 후:

1. **변경사항 저장**
   - `Steam_Dataset_2025_Full_Dashboard.html` 파일 수정
   - `index.html` 파일도 동일하게 업데이트:
     ```powershell
     Copy-Item "Steam_Dataset_2025_Full_Dashboard.html" -Destination "index.html" -Force
     ```

2. **GitHub Desktop에서 커밋 및 푸시**
   - 변경사항 커밋
   - 푸시하여 GitHub에 업로드

3. **자동 배포**
   - GitHub Pages가 자동으로 변경사항을 감지하고 재배포합니다
   - 보통 1-2분 내에 업데이트가 반영됩니다

## ⚠️ 주의사항

1. **공개 저장소**
   - 무료 GitHub Pages는 공개 저장소에서만 작동합니다
   - 비공개 저장소를 사용하려면 GitHub Pro 계정이 필요합니다

2. **파일 크기 제한**
   - GitHub Pages는 1GB 저장소 제한이 있습니다
   - 현재 HTML 파일은 이 제한 내에 있습니다

3. **빌드 시간**
   - 첫 배포는 몇 분 걸릴 수 있습니다
   - 이후 업데이트는 보통 1-2분 내에 반영됩니다

## 🎯 추가 팁

### 커스텀 도메인 사용 (선택사항)

1. Settings > Pages에서 "Custom domain" 섹션에 도메인 입력
2. 도메인 DNS 설정에서 CNAME 레코드 추가

### README 업데이트

저장소 README에 배포된 사이트 링크를 추가할 수 있습니다:

```markdown
## 🌐 라이브 데모

[대시보드 보기](https://[사용자명].github.io/[저장소명]/)
```

## 📞 문제 해결

### 페이지가 표시되지 않는 경우

1. **배포 상태 확인**
   - Settings > Pages에서 배포 상태 확인
   - Actions 탭에서 배포 로그 확인

2. **파일 이름 확인**
   - `index.html` 파일이 루트 디렉토리에 있는지 확인
   - 대소문자 구분 확인

3. **캐시 문제**
   - 브라우저 캐시 삭제 후 다시 시도
   - 시크릿 모드에서 접속 시도

### 차트가 표시되지 않는 경우

1. **CDN 연결 확인**
   - Chart.js CDN이 정상적으로 로드되는지 확인
   - 브라우저 개발자 도구(F12)에서 네트워크 탭 확인

2. **콘솔 오류 확인**
   - 브라우저 개발자 도구 콘솔에서 오류 메시지 확인

## ✅ 체크리스트

배포 전 확인사항:

- [ ] `index.html` 파일이 루트 디렉토리에 있음
- [ ] 모든 변경사항이 커밋됨
- [ ] GitHub에 푸시됨
- [ ] GitHub Pages가 활성화됨
- [ ] 배포 완료 메시지 확인
- [ ] 배포된 사이트가 정상 작동함

---

**축하합니다! 🎉** 이제 전 세계 누구나 여러분의 Steam Dataset 대시보드를 볼 수 있습니다!

