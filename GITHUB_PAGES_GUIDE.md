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

### 2단계: 저장소를 공개로 변경 (필수!)

**⚠️ 중요**: 무료 GitHub Pages는 공개 저장소에서만 작동합니다.

1. **저장소 설정으로 이동**
   - 저장소 페이지에서 상단의 **"Settings"** 탭 클릭
   - 왼쪽 사이드바 맨 아래 **"General"** 섹션으로 스크롤

2. **저장소 공개 설정**
   - **"Danger Zone"** 섹션 찾기
   - **"Change visibility"** 또는 **"Change repository visibility"** 클릭
   - **"Make public"** 선택
   - 저장소 이름을 입력하여 확인
   - **"I understand, change repository visibility"** 클릭

3. **GitHub Pages 활성화**
   - Settings에서 왼쪽 사이드바의 **"Pages"** 메뉴 클릭
   - 이제 "Upgrade or make this repository public" 메시지가 사라지고 설정 옵션이 나타납니다

4. **Pages 설정**
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

1. **공개 저장소 (중요!)**
   - 무료 GitHub Pages는 **공개 저장소에서만 작동합니다**
   - 비공개 저장소를 사용하려면 GitHub Pro 계정이 필요합니다
   - **해결 방법**: 저장소를 공개로 변경하세요 (아래 참조)

2. **파일 크기 제한**
   - GitHub Pages는 1GB 저장소 제한이 있습니다
   - 현재 HTML 파일은 이 제한 내에 있습니다

3. **빌드 시간**
   - 첫 배포는 몇 분 걸릴 수 있습니다
   - 이후 업데이트는 보통 1-2분 내에 반영됩니다

## 🎯 추가 팁

### 커스텀 도메인 사용 (선택사항)

**⚠️ 주의**: 커스텀 도메인을 사용하지 않는 경우 이 필드를 비워두세요!

1. Settings > Pages에서 "Custom domain" 섹션 확인
2. **커스텀 도메인을 사용하지 않는 경우**: 필드를 비워두고 Save 클릭
3. **실제 도메인을 사용하는 경우**:
   - 올바른 도메인 형식 입력 (예: `example.com`, `www.example.com`)
   - 도메인 DNS 설정에서 CNAME 레코드 추가
   - GitHub에서 제공하는 DNS 레코드 설정

**오류 해결**: "The custom domain is not properly formatted" 오류가 발생하면:
- 커스텀 도메인 필드를 완전히 비우고 Save 클릭
- 또는 올바른 도메인 형식으로 수정 (도메인 이름만, 경로나 특수문자 없이)

### README 업데이트

저장소 README에 배포된 사이트 링크를 추가할 수 있습니다:

```markdown
## 🌐 라이브 데모

[대시보드 보기](https://[사용자명].github.io/[저장소명]/)
```

## 📞 문제 해결

### "Canceling since a higher priority waiting request" 오류

**이것은 실제 오류가 아닙니다!** 

이 메시지는 여러 배포 요청이 동시에 발생했을 때 나타나는 정상적인 동작입니다.

**해결 방법:**
1. **기다리기**: GitHub가 자동으로 최신 배포를 처리합니다
2. **Actions 탭 확인**: 
   - 저장소의 "Actions" 탭으로 이동
   - 가장 최근 배포 작업이 "Success" 상태인지 확인
3. **Pages 설정 확인**:
   - Settings > Pages에서 배포 상태 확인
   - 녹색 체크 표시가 있으면 배포 성공입니다

**예방 방법:**
- 여러 번 빠르게 커밋/푸시하지 않기
- 설정 변경 후 한 번만 저장하기
- 배포가 완료될 때까지 기다리기 (보통 1-2분)

### 페이지가 표시되지 않는 경우

1. **배포 상태 확인**
   - Settings > Pages에서 배포 상태 확인
   - Actions 탭에서 배포 로그 확인
   - 가장 최근 성공한 배포 확인

2. **파일 이름 확인**
   - `index.html` 파일이 루트 디렉토리에 있는지 확인
   - 대소문자 구분 확인

3. **캐시 문제**
   - 브라우저 캐시 삭제 후 다시 시도
   - 시크릿 모드에서 접속 시도
   - URL에 `?v=2` 같은 쿼리 파라미터 추가하여 강제 새로고침

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

