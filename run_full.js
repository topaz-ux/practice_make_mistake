const { collectFullAppData } = require('./collect_full_google_play_data');
const { generateFullHTMLDashboard } = require('./generate_full_html_dashboard');

/**
 * 전체 프로세스 실행: 모든 기능을 활용한 데이터 수집 → 완전한 HTML 대시보드 생성
 */
async function run() {
    try {
        console.log('🚀 Google Play 스토어 완전한 대시보드 생성 프로세스 시작\n');
        console.log('⚠️  이 프로세스는 시간이 오래 걸릴 수 있습니다 (각 앱당 약 2초)');
        console.log('    총 30개 앱 × 2초 = 약 1분 이상 소요됩니다.\n');
        
        // 1. 전체 데이터 수집
        await collectFullAppData();
        
        // 2. 완전한 HTML 대시보드 생성
        generateFullHTMLDashboard();
        
        console.log('\n✅ 모든 작업이 완료되었습니다!');
        console.log('   브라우저에서 Google_Play_Full_Dashboard.html 파일을 열어보세요.');
    } catch (error) {
        console.error('\n❌ 오류 발생:', error);
        process.exit(1);
    }
}

// 실행
run();


