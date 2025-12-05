const fs = require('fs');
const path = require('path');

/**
 * Google Play 앱 데이터를 완전한 HTML 대시보드로 변환합니다.
 */
function generateFullHTMLDashboard() {
    console.log('='.repeat(60));
    console.log('완전한 HTML 대시보드 생성 중...');
    console.log('='.repeat(60));

    const dataFile = path.join(__dirname, 'data', 'google_play_full_data.json');
    
    if (!fs.existsSync(dataFile)) {
        console.error('❌ 데이터 파일을 찾을 수 없습니다:', dataFile);
        console.error('   먼저 collect_full_google_play_data.js를 실행하세요.');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const apps = data.apps || [];
    const metadata = data.metadata || {};
    
    console.log(`\n${apps.length}개 앱 데이터 로드 완료`);

    // 통계 계산
    const stats = calculateFullStatistics(apps, metadata);
    
    // HTML 생성
    const html = generateFullHTML(apps, stats, metadata);
    
    // 파일 저장
    const outputFile = path.join(__dirname, 'Google_Play_Full_Dashboard.html');
    fs.writeFileSync(outputFile, html, 'utf-8');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 완전한 HTML 대시보드 생성 완료!');
    console.log(`   저장 위치: ${outputFile}`);
    console.log('='.repeat(60));
}

function calculateFullStatistics(apps, metadata) {
    const stats = {
        totalApps: apps.length,
        freeApps: apps.filter(app => app.free).length,
        paidApps: apps.filter(app => !app.free).length,
        averageRating: 0,
        totalReviews: 0,
        totalPermissions: 0,
        appsWithDatasafety: 0,
        appsWithSimilar: 0,
        topCategories: {},
        topDevelopers: {},
        priceRange: {
            free: 0,
            low: 0,
            medium: 0,
            high: 0
        },
        permissionTypes: {},
        dataSafetyCategories: {
            dataShared: 0,
            dataCollected: 0,
            securityPractices: 0
        }
    };

    let totalRating = 0;
    let ratingCount = 0;

    apps.forEach(app => {
        // 평점 계산
        if (app.score) {
            totalRating += app.score;
            ratingCount++;
        }

        // 리뷰 수
        if (app.reviews && app.reviews.length > 0) {
            stats.totalReviews += app.reviews.length;
        }

        // 권한 통계
        if (app.permissions && app.permissions.length > 0) {
            stats.totalPermissions += app.permissions.length;
            app.permissions.forEach(perm => {
                const type = perm.type || '기타';
                stats.permissionTypes[type] = (stats.permissionTypes[type] || 0) + 1;
            });
        }

        // 데이터 안전성 통계
        if (app.datasafety) {
            stats.appsWithDatasafety++;
            if (app.datasafety.dataShared) stats.dataSafetyCategories.dataShared += app.datasafety.dataShared.length;
            if (app.datasafety.dataCollected) stats.dataSafetyCategories.dataCollected += app.datasafety.dataCollected.length;
            if (app.datasafety.securityPractices) stats.dataSafetyCategories.securityPractices += app.datasafety.securityPractices.length;
        }

        // 유사 앱
        if (app.similar && app.similar.length > 0) {
            stats.appsWithSimilar++;
        }

        // 카테고리 통계
        if (app.genre) {
            stats.topCategories[app.genre] = (stats.topCategories[app.genre] || 0) + 1;
        }

        // 개발자 통계
        if (app.developer) {
            stats.topDevelopers[app.developer] = (stats.topDevelopers[app.developer] || 0) + 1;
        }

        // 가격 범위
        if (app.free) {
            stats.priceRange.free++;
        } else if (app.price) {
            const price = parseFloat(String(app.price).replace(/[^0-9.]/g, ''));
            if (price < 5) stats.priceRange.low++;
            else if (price < 10) stats.priceRange.medium++;
            else stats.priceRange.high++;
        }
    });

    stats.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;

    // 상위 항목 정렬
    stats.topCategories = Object.entries(stats.topCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    stats.topDevelopers = Object.entries(stats.topDevelopers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    stats.topPermissionTypes = Object.entries(stats.permissionTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    return stats;
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateFullHTML(apps, stats, metadata) {
    const sortedApps = [...apps].sort((a, b) => (b.score || 0) - (a.score || 0));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Play 스토어 완전한 대시보드</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1800px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            background: linear-gradient(45deg, #00d4ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-top: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .stat-card h3 {
            font-size: 1em;
            margin-bottom: 10px;
            color: #00d4ff;
            opacity: 0.9;
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
            color: #ff00ff;
        }
        
        .stat-label {
            font-size: 0.85em;
            opacity: 0.8;
        }
        
        .section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .section h2 {
            font-size: 2em;
            margin-bottom: 20px;
            color: #00d4ff;
        }
        
        .chart-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .chart-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #ff00ff;
        }
        
        .chart-label {
            font-size: 1em;
        }
        
        .chart-value {
            font-size: 1.3em;
            font-weight: bold;
            color: #ff00ff;
        }
        
        .apps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .app-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .app-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .app-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .app-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            margin-right: 15px;
            object-fit: cover;
        }
        
        .app-info {
            flex: 1;
        }
        
        .app-title {
            font-size: 1.1em;
            font-weight: bold;
            margin-bottom: 5px;
            color: #00d4ff;
        }
        
        .app-developer {
            font-size: 0.85em;
            opacity: 0.8;
        }
        
        .app-details {
            margin-top: 15px;
            font-size: 0.9em;
        }
        
        .detail-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .detail-title {
            font-weight: bold;
            color: #00d4ff;
            margin-bottom: 8px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8em;
            margin: 3px;
            background: rgba(0, 212, 255, 0.3);
            color: #00d4ff;
        }
        
        .review-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 10px;
            border-radius: 8px;
            margin: 5px 0;
            font-size: 0.85em;
        }
        
        .permission-item {
            background: rgba(255, 0, 0, 0.1);
            padding: 8px;
            border-radius: 6px;
            margin: 5px 0;
            font-size: 0.85em;
            border-left: 3px solid #ff4444;
        }
        
        .similar-app {
            display: inline-block;
            padding: 5px 10px;
            background: rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            margin: 3px;
            font-size: 0.85em;
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .tab {
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .tab.active {
            background: rgba(0, 212, 255, 0.3);
            border: 2px solid #00d4ff;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            h1 {
                font-size: 2em;
            }
            
            .apps-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📱 Google Play 스토어 완전한 대시보드</h1>
            <p class="subtitle">모든 기능을 활용한 종합 분석</p>
            <p style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">
                수집 시간: ${metadata.collectedAt ? new Date(metadata.collectedAt).toLocaleString('ko-KR') : 'N/A'}
            </p>
        </header>
        
        <!-- 전체 통계 -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>📊 총 앱 수</h3>
                <div class="stat-value">${stats.totalApps}</div>
                <div class="stat-label">수집된 앱 수</div>
            </div>
            <div class="stat-card">
                <h3>⭐ 평균 평점</h3>
                <div class="stat-value">${stats.averageRating}</div>
                <div class="stat-label">5점 만점</div>
            </div>
            <div class="stat-card">
                <h3>📝 총 리뷰 수</h3>
                <div class="stat-value">${formatNumber(stats.totalReviews)}</div>
                <div class="stat-label">수집된 리뷰</div>
            </div>
            <div class="stat-card">
                <h3>🔐 총 권한 수</h3>
                <div class="stat-value">${stats.totalPermissions}</div>
                <div class="stat-label">수집된 권한</div>
            </div>
            <div class="stat-card">
                <h3>🛡️ 데이터 안전성</h3>
                <div class="stat-value">${stats.appsWithDatasafety}</div>
                <div class="stat-label">정보 수집된 앱</div>
            </div>
            <div class="stat-card">
                <h3>🔗 유사 앱</h3>
                <div class="stat-value">${stats.appsWithSimilar}</div>
                <div class="stat-label">유사 앱 정보 있는 앱</div>
            </div>
        </div>
        
        <!-- 권한 타입 분포 -->
        ${Object.keys(stats.topPermissionTypes).length > 0 ? `
        <div class="section">
            <h2>🔐 권한 타입 분포</h2>
            <div class="chart-container">
                ${Object.entries(stats.topPermissionTypes).map(([type, count]) => `
                <div class="chart-item">
                    <span class="chart-label">${escapeHtml(type)}</span>
                    <span class="chart-value">${count}</span>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 데이터 안전성 통계 -->
        ${stats.appsWithDatasafety > 0 ? `
        <div class="section">
            <h2>🛡️ 데이터 안전성 통계</h2>
            <div class="chart-container">
                <div class="chart-item">
                    <span class="chart-label">공유되는 데이터</span>
                    <span class="chart-value">${stats.dataSafetyCategories.dataShared}</span>
                </div>
                <div class="chart-item">
                    <span class="chart-label">수집되는 데이터</span>
                    <span class="chart-value">${stats.dataSafetyCategories.dataCollected}</span>
                </div>
                <div class="chart-item">
                    <span class="chart-label">보안 관행</span>
                    <span class="chart-value">${stats.dataSafetyCategories.securityPractices}</span>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- 인기 카테고리 -->
        ${Object.keys(stats.topCategories).length > 0 ? `
        <div class="section">
            <h2>📂 인기 카테고리</h2>
            <div class="chart-container">
                ${Object.entries(stats.topCategories).map(([category, count]) => `
                <div class="chart-item">
                    <span class="chart-label">${escapeHtml(category)}</span>
                    <span class="chart-value">${count}</span>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 앱 상세 목록 -->
        <div class="section">
            <h2>📱 앱 상세 정보 (평점 높은 순)</h2>
            <div class="apps-grid">
                ${sortedApps.slice(0, 30).map(app => `
                <div class="app-card">
                    <div class="app-header">
                        ${app.icon ? `<img src="${app.icon}" alt="${escapeHtml(app.title)}" class="app-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23667eea\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'white\\' font-size=\\'50\\' x=\\'50\\' y=\\'70\\' text-anchor=\\'middle\\'%3E📱%3C/text%3E%3C/svg%3E'">` : ''}
                        <div class="app-info">
                            <div class="app-title">${escapeHtml(app.title || '앱 이름 없음')}</div>
                            <div class="app-developer">${escapeHtml(app.developer || '개발자 정보 없음')}</div>
                            ${app.score ? `<div style="margin-top: 5px; color: #ffd700;">${'⭐'.repeat(Math.floor(app.score))} ${app.score.toFixed(1)}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="app-details">
                        ${app.genre ? `<div><span class="badge">${escapeHtml(app.genre)}</span></div>` : ''}
                        ${app.free ? '<span class="badge" style="background: rgba(76, 175, 80, 0.3); color: #4caf50;">무료</span>' : (app.price ? `<span class="badge">${escapeHtml(app.priceText || app.price)}</span>` : '')}
                    </div>
                    
                    ${app.reviews && app.reviews.length > 0 ? `
                    <div class="detail-section">
                        <div class="detail-title">📝 최신 리뷰 (${app.reviews.length}개)</div>
                        ${app.reviews.slice(0, 3).map(review => `
                        <div class="review-item">
                            <div style="color: #ffd700; margin-bottom: 5px;">${'⭐'.repeat(review.score || 0)} ${review.score || 'N/A'}</div>
                            <div>${escapeHtml(review.text || '리뷰 내용 없음').substring(0, 100)}${(review.text && review.text.length > 100) ? '...' : ''}</div>
                            ${review.userName ? `<div style="margin-top: 5px; opacity: 0.7; font-size: 0.85em;">- ${escapeHtml(review.userName)}</div>` : ''}
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${app.permissions && app.permissions.length > 0 ? `
                    <div class="detail-section">
                        <div class="detail-title">🔐 권한 (${app.permissions.length}개)</div>
                        ${app.permissions.slice(0, 5).map(perm => `
                        <div class="permission-item">
                            ${escapeHtml(perm.permission || '권한 정보 없음')}
                            ${perm.type ? `<span style="opacity: 0.7;"> (${escapeHtml(perm.type)})</span>` : ''}
                        </div>
                        `).join('')}
                        ${app.permissions.length > 5 ? `<div style="opacity: 0.7; font-size: 0.85em;">외 ${app.permissions.length - 5}개 더...</div>` : ''}
                    </div>
                    ` : ''}
                    
                    ${app.similar && app.similar.length > 0 ? `
                    <div class="detail-section">
                        <div class="detail-title">🔗 유사 앱 (${app.similar.length}개)</div>
                        ${app.similar.slice(0, 5).map(sim => `
                        <span class="similar-app">${escapeHtml(sim.title || sim.summary || '앱 이름 없음')}</span>
                        `).join('')}
                        ${app.similar.length > 5 ? `<div style="opacity: 0.7; font-size: 0.85em; margin-top: 5px;">외 ${app.similar.length - 5}개 더...</div>` : ''}
                    </div>
                    ` : ''}
                    
                    ${app.datasafety ? `
                    <div class="detail-section">
                        <div class="detail-title">🛡️ 데이터 안전성</div>
                        ${app.datasafety.dataCollected && app.datasafety.dataCollected.length > 0 ? `
                        <div style="margin-top: 8px;">
                            <strong>수집 데이터:</strong> ${app.datasafety.dataCollected.length}개 항목
                        </div>
                        ` : ''}
                        ${app.datasafety.dataShared && app.datasafety.dataShared.length > 0 ? `
                        <div style="margin-top: 8px;">
                            <strong>공유 데이터:</strong> ${app.datasafety.dataShared.length}개 항목
                        </div>
                        ` : ''}
                        ${app.datasafety.securityPractices && app.datasafety.securityPractices.length > 0 ? `
                        <div style="margin-top: 8px;">
                            <strong>보안 관행:</strong> ${app.datasafety.securityPractices.length}개 항목
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    ${app.developerInfo ? `
                    <div class="detail-section">
                        <div class="detail-title">👨‍💻 개발자 정보</div>
                        <div style="margin-top: 8px;">
                            <strong>총 앱 수:</strong> ${app.developerInfo.apps}개
                        </div>
                        ${app.developerInfo.topApps && app.developerInfo.topApps.length > 0 ? `
                        <div style="margin-top: 8px;">
                            <strong>인기 앱:</strong>
                            ${app.developerInfo.topApps.map(topApp => `
                            <span class="similar-app">${escapeHtml(topApp.title)}</span>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        
        ${metadata.categories && metadata.categories.length > 0 ? `
        <div class="section">
            <h2>📂 전체 카테고리 목록</h2>
            <div class="chart-container">
                ${metadata.categories.map(cat => `
                <div class="chart-item">
                    <span class="chart-label">${escapeHtml(cat)}</span>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${metadata.suggestions && Object.keys(metadata.suggestions).length > 0 ? `
        <div class="section">
            <h2>💡 검색 제안</h2>
            ${Object.entries(metadata.suggestions).map(([term, suggestions]) => `
            <div style="margin-top: 20px;">
                <h3 style="color: #00d4ff; margin-bottom: 10px;">"${escapeHtml(term)}" 검색 제안</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${suggestions.map(sug => `
                    <span class="badge">${escapeHtml(sug)}</span>
                    `).join('')}
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
}

// 실행
if (require.main === module) {
    generateFullHTMLDashboard();
}

module.exports = { generateFullHTMLDashboard };


