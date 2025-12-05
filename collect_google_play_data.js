const gplayModule = require('google-play-scraper');
const gplay = gplayModule.default || gplayModule;
const fs = require('fs');
const path = require('path');

/**
 * Google Play 스토어에서 앱 데이터를 수집합니다.
 */
async function collectAppData() {
    console.log('='.repeat(60));
    console.log('Google Play 스토어 데이터 수집 시작');
    console.log('='.repeat(60));

    const appsData = [];
    const searchTerms = [
        'game', 'social', 'productivity', 'entertainment', 
        'education', 'shopping', 'music', 'video', 'photo', 'news'
    ];

    try {
        // 인기 앱 검색
        console.log('\n인기 앱 검색 중...');
        for (const term of searchTerms.slice(0, 5)) {
            try {
                console.log(`  - "${term}" 검색 중...`);
                const results = await gplay.search({
                    term: term,
                    num: 20,
                    throttle: 2
                });

                for (const app of results) {
                    try {
                        console.log(`    앱 상세 정보 가져오는 중: ${app.title}`);
                        const detail = await gplay.app({
                            appId: app.appId,
                            lang: 'ko',
                            country: 'kr'
                        });
                        appsData.push(detail);
                        
                        // Rate limiting
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (err) {
                        console.log(`    ⚠️ ${app.title} 상세 정보 가져오기 실패: ${err.message}`);
                    }
                }
            } catch (err) {
                console.log(`  ⚠️ "${term}" 검색 실패: ${err.message}`);
            }
        }

        // 카테고리별 인기 앱 가져오기
        console.log('\n카테고리별 인기 앱 가져오는 중...');
        const categories = [
            { name: 'GAME', value: gplay.category.GAME },
            { name: 'SOCIAL', value: gplay.category.SOCIAL },
            { name: 'PRODUCTIVITY', value: gplay.category.PRODUCTIVITY },
            { name: 'ENTERTAINMENT', value: gplay.category.ENTERTAINMENT }
        ];
        
        for (const category of categories) {
            try {
                console.log(`  - ${category.name} 카테고리...`);
                const results = await gplay.list({
                    category: category.value,
                    collection: gplay.collection.TOP_FREE,
                    num: 10,
                    throttle: 2
                });

                for (const app of results) {
                    try {
                        // 중복 체크
                        if (appsData.find(a => a.appId === app.appId)) {
                            continue;
                        }

                        console.log(`    앱 상세 정보 가져오는 중: ${app.title}`);
                        const detail = await gplay.app({
                            appId: app.appId,
                            lang: 'ko',
                            country: 'kr'
                        });
                        appsData.push(detail);
                        
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (err) {
                        console.log(`    ⚠️ ${app.title} 상세 정보 가져오기 실패: ${err.message}`);
                    }
                }
            } catch (err) {
                console.log(`  ⚠️ ${category} 카테고리 실패: ${err.message}`);
            }
        }

        // 데이터 저장
        const outputDir = path.join(__dirname, 'data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFile = path.join(outputDir, 'google_play_apps.json');
        fs.writeFileSync(outputFile, JSON.stringify(appsData, null, 2), 'utf-8');

        console.log('\n' + '='.repeat(60));
        console.log(`✅ 데이터 수집 완료!`);
        console.log(`   총 ${appsData.length}개 앱 데이터 수집`);
        console.log(`   저장 위치: ${outputFile}`);
        console.log('='.repeat(60));

        return appsData;
    } catch (error) {
        console.error('❌ 데이터 수집 중 오류 발생:', error);
        throw error;
    }
}

// 실행
if (require.main === module) {
    collectAppData()
        .then(() => {
            console.log('\n✅ 모든 작업 완료!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 오류:', error);
            process.exit(1);
        });
}

module.exports = { collectAppData };

