const { collectAppData } = require('./collect_google_play_data');
const { generateHTMLDashboard } = require('./generate_html_dashboard');

/**
 * 전체 프로세스 실행: 데이터 수집 → HTML 대시보드 생성
 */
async function run() {
    try {
        console.log('🚀 Google Play 스토어 대시보드 생성 프로세스 시작\n');
        
        // 1. 데이터 수집
        await collectAppData();
        
        // 2. HTML 대시보드 생성
        generateHTMLDashboard();
        
        console.log('\n✅ 모든 작업이 완료되었습니다!');
        console.log('   브라우저에서 Google_Play_Dashboard.html 파일을 열어보세요.');
    } catch (error) {
        console.error('\n❌ 오류 발생:', error);
        process.exit(1);
    }
}

// 실행
run();


