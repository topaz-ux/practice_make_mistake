const gplayModule = require('google-play-scraper');
const gplay = gplayModule.default || gplayModule;
const fs = require('fs');
const path = require('path');

/**
 * Google Play 스토어에서 모든 기능을 활용하여 앱 데이터를 수집합니다.
 */
async function collectFullAppData() {
    console.log('='.repeat(60));
    console.log('Google Play 스토어 전체 데이터 수집 시작');
    console.log('='.repeat(60));

    const appsData = [];
    const searchTerms = [
        'game', 'social', 'productivity', 'entertainment', 'education'
    ];

    try {
        // 1. 카테고리 목록 가져오기
        console.log('\n📂 카테고리 목록 가져오는 중...');
        let categoriesList = [];
        try {
            categoriesList = await gplay.categories();
            console.log(`   ✅ ${categoriesList.length}개 카테고리 발견`);
        } catch (err) {
            console.log(`   ⚠️ 카테고리 목록 가져오기 실패: ${err.message}`);
        }

        // 2. 인기 앱 검색 및 상세 정보 수집
        console.log('\n🔍 인기 앱 검색 중...');
        const appIds = new Set();
        
        for (const term of searchTerms.slice(0, 3)) {
            try {
                console.log(`  - "${term}" 검색 중...`);
                const results = await gplay.search({
                    term: term,
                    num: 15,
                    throttle: 2
                });

                for (const app of results) {
                    if (!appIds.has(app.appId)) {
                        appIds.add(app.appId);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.log(`  ⚠️ "${term}" 검색 실패: ${err.message}`);
            }
        }

        // 3. 카테고리별 인기 앱 추가
        console.log('\n📱 카테고리별 인기 앱 가져오는 중...');
        const categories = [
            { name: 'GAME', value: gplay.category.GAME },
            { name: 'SOCIAL', value: gplay.category.SOCIAL },
            { name: 'PRODUCTIVITY', value: gplay.category.PRODUCTIVITY }
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
                    if (!appIds.has(app.appId)) {
                        appIds.add(app.appId);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.log(`  ⚠️ ${category.name} 카테고리 실패: ${err.message}`);
            }
        }

        // 4. 각 앱의 전체 정보 수집 (최대 30개로 제한)
        const appIdsArray = Array.from(appIds).slice(0, 30);
        console.log(`\n📊 ${appIdsArray.length}개 앱의 전체 정보 수집 중...`);

        for (let i = 0; i < appIdsArray.length; i++) {
            const appId = appIdsArray[i];
            try {
                console.log(`\n[${i + 1}/${appIdsArray.length}] 앱 정보 수집: ${appId}`);
                
                // 기본 앱 정보
                const appDetail = await gplay.app({
                    appId: appId,
                    lang: 'ko',
                    country: 'kr'
                });
                
                const fullAppData = {
                    ...appDetail,
                    reviews: null,
                    similar: null,
                    permissions: null,
                    datasafety: null,
                    developerInfo: null
                };

                // 리뷰 수집 (최대 50개)
                try {
                    console.log(`  📝 리뷰 수집 중...`);
                    const reviews = await gplay.reviews({
                        appId: appId,
                        lang: 'ko',
                        country: 'kr',
                        sort: gplay.sort.NEWEST,
                        num: 50
                    });
                    fullAppData.reviews = reviews.data || [];
                    fullAppData.reviewsSummary = {
                        total: reviews.data?.length || 0,
                        averageRating: appDetail.score || 0,
                        ratingDistribution: appDetail.histogram || {}
                    };
                    console.log(`  ✅ ${fullAppData.reviews.length}개 리뷰 수집`);
                } catch (err) {
                    console.log(`  ⚠️ 리뷰 수집 실패: ${err.message}`);
                }

                // 유사 앱 수집
                try {
                    console.log(`  🔗 유사 앱 수집 중...`);
                    const similar = await gplay.similar({
                        appId: appId,
                        lang: 'ko',
                        country: 'kr',
                        fullDetail: false
                    });
                    fullAppData.similar = similar || [];
                    console.log(`  ✅ ${fullAppData.similar.length}개 유사 앱 발견`);
                } catch (err) {
                    console.log(`  ⚠️ 유사 앱 수집 실패: ${err.message}`);
                }

                // 권한 정보 수집
                try {
                    console.log(`  🔐 권한 정보 수집 중...`);
                    const permissions = await gplay.permissions({
                        appId: appId,
                        lang: 'ko',
                        country: 'kr'
                    });
                    fullAppData.permissions = permissions || [];
                    console.log(`  ✅ ${fullAppData.permissions.length}개 권한 발견`);
                } catch (err) {
                    console.log(`  ⚠️ 권한 정보 수집 실패: ${err.message}`);
                }

                // 데이터 안전성 정보 수집
                try {
                    console.log(`  🛡️ 데이터 안전성 정보 수집 중...`);
                    const datasafety = await gplay.datasafety({
                        appId: appId,
                        lang: 'ko'
                    });
                    fullAppData.datasafety = datasafety || null;
                    console.log(`  ✅ 데이터 안전성 정보 수집 완료`);
                } catch (err) {
                    console.log(`  ⚠️ 데이터 안전성 정보 수집 실패: ${err.message}`);
                }

                // 개발자 정보 수집
                if (appDetail.developerId) {
                    try {
                        console.log(`  👨‍💻 개발자 정보 수집 중...`);
                        const developerInfo = await gplay.developer({
                            devId: appDetail.developerId,
                            lang: 'ko',
                            country: 'kr',
                            fullDetail: false
                        });
                        fullAppData.developerInfo = {
                            name: appDetail.developer,
                            apps: developerInfo?.length || 0,
                            topApps: (developerInfo || []).slice(0, 5).map(app => ({
                                title: app.title,
                                appId: app.appId,
                                score: app.score
                            }))
                        };
                        console.log(`  ✅ 개발자 정보 수집 완료 (${fullAppData.developerInfo.apps}개 앱)`);
                    } catch (err) {
                        console.log(`  ⚠️ 개발자 정보 수집 실패: ${err.message}`);
                    }
                }

                appsData.push(fullAppData);
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (err) {
                console.log(`  ❌ ${appId} 앱 정보 수집 실패: ${err.message}`);
            }
        }

        // 5. 검색 제안 테스트
        console.log('\n💡 검색 제안 테스트 중...');
        const suggestions = {};
        for (const term of ['game', 'social'].slice(0, 2)) {
            try {
                const suggest = await gplay.suggest({ term: term });
                suggestions[term] = suggest || [];
                console.log(`  ✅ "${term}" 검색 제안: ${suggestions[term].length}개`);
            } catch (err) {
                console.log(`  ⚠️ "${term}" 검색 제안 실패: ${err.message}`);
            }
        }

        // 데이터 저장
        const outputDir = path.join(__dirname, 'data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputData = {
            metadata: {
                collectedAt: new Date().toISOString(),
                totalApps: appsData.length,
                categories: categoriesList,
                suggestions: suggestions
            },
            apps: appsData
        };

        const outputFile = path.join(outputDir, 'google_play_full_data.json');
        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');

        console.log('\n' + '='.repeat(60));
        console.log(`✅ 전체 데이터 수집 완료!`);
        console.log(`   총 ${appsData.length}개 앱 데이터 수집`);
        console.log(`   - 리뷰: ${appsData.filter(a => a.reviews).length}개 앱`);
        console.log(`   - 유사 앱: ${appsData.filter(a => a.similar).length}개 앱`);
        console.log(`   - 권한 정보: ${appsData.filter(a => a.permissions).length}개 앱`);
        console.log(`   - 데이터 안전성: ${appsData.filter(a => a.datasafety).length}개 앱`);
        console.log(`   - 개발자 정보: ${appsData.filter(a => a.developerInfo).length}개 앱`);
        console.log(`   저장 위치: ${outputFile}`);
        console.log('='.repeat(60));

        return outputData;
    } catch (error) {
        console.error('❌ 데이터 수집 중 오류 발생:', error);
        throw error;
    }
}

// 실행
if (require.main === module) {
    collectFullAppData()
        .then(() => {
            console.log('\n✅ 모든 작업 완료!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 오류:', error);
            process.exit(1);
        });
}

module.exports = { collectFullAppData };


