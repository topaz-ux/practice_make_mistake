const fs = require('fs');
const path = require('path');

/**
 * Google Play 앱 데이터를 HTML 대시보드로 변환합니다.
 */
function generateHTMLDashboard() {
    console.log('='.repeat(60));
    console.log('HTML 대시보드 생성 중...');
    console.log('='.repeat(60));

    const dataFile = path.join(__dirname, 'data', 'google_play_apps.json');
    
    if (!fs.existsSync(dataFile)) {
        console.error('❌ 데이터 파일을 찾을 수 없습니다:', dataFile);
        console.error('   먼저 collect_google_play_data.js를 실행하세요.');
        process.exit(1);
    }

    const apps = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    console.log(`\n${apps.length}개 앱 데이터 로드 완료`);

    // 통계 계산
    const stats = calculateStatistics(apps);
    
    // HTML 생성
    const html = generateHTML(apps, stats);
    
    // 파일 저장
    const outputFile = path.join(__dirname, 'Google_Play_Dashboard.html');
    fs.writeFileSync(outputFile, html, 'utf-8');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ HTML 대시보드 생성 완료!');
    console.log(`   저장 위치: ${outputFile}`);
    console.log('='.repeat(60));
}

function calculateStatistics(apps) {
    const stats = {
        totalApps: apps.length,
        freeApps: apps.filter(app => app.free).length,
        paidApps: apps.filter(app => !app.free).length,
        averageRating: 0,
        totalInstalls: 0,
        topCategories: {},
        topDevelopers: {},
        priceRange: {
            free: 0,
            low: 0,      // $0.01 - $4.99
            medium: 0,   // $5.00 - $9.99
            high: 0      // $10.00+
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

        // 설치 수 계산
        if (app.installs) {
            const installs = parseInstalls(app.installs);
            stats.totalInstalls += installs;
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
            const price = parseFloat(app.price.replace(/[^0-9.]/g, ''));
            if (price < 5) stats.priceRange.low++;
            else if (price < 10) stats.priceRange.medium++;
            else stats.priceRange.high++;
        }
    });

    stats.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;

    // 상위 카테고리 및 개발자 정렬
    stats.topCategories = Object.entries(stats.topCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    stats.topDevelopers = Object.entries(stats.topDevelopers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    return stats;
}

function parseInstalls(installsStr) {
    if (!installsStr) return 0;
    const match = installsStr.match(/([\d.]+)([KMB]+)/);
    if (!match) return 0;
    
    const num = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === 'K') return num * 1000;
    if (unit === 'M') return num * 1000000;
    if (unit === 'B') return num * 1000000000;
    return num;
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function generateHTML(apps, stats) {
    // 앱 정렬 (평점 높은 순)
    const sortedApps = [...apps].sort((a, b) => (b.score || 0) - (a.score || 0));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Play 스토어 대시보드</title>
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
            max-width: 1600px;
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
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
        
        .app-rating {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        
        .rating-stars {
            color: #ffd700;
            margin-right: 10px;
        }
        
        .rating-value {
            font-weight: bold;
            color: #ff00ff;
        }
        
        .app-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 0.85em;
            opacity: 0.8;
        }
        
        .price-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            background: rgba(0, 212, 255, 0.3);
            color: #00d4ff;
        }
        
        .free-badge {
            background: rgba(76, 175, 80, 0.3);
            color: #4caf50;
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
            <h1>📱 Google Play 스토어 대시보드</h1>
            <p class="subtitle">앱 데이터 분석 및 통계</p>
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
                <h3>🆓 무료 앱</h3>
                <div class="stat-value">${stats.freeApps}</div>
                <div class="stat-label">${((stats.freeApps / stats.totalApps) * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <h3>💰 유료 앱</h3>
                <div class="stat-value">${stats.paidApps}</div>
                <div class="stat-label">${((stats.paidApps / stats.totalApps) * 100).toFixed(1)}%</div>
            </div>
        </div>
        
        <!-- 가격 분포 -->
        <div class="section">
            <h2>💰 가격 분포</h2>
            <div class="chart-container">
                <div class="chart-item">
                    <span class="chart-label">무료</span>
                    <span class="chart-value">${stats.priceRange.free}</span>
                </div>
                <div class="chart-item">
                    <span class="chart-label">$0.01 - $4.99</span>
                    <span class="chart-value">${stats.priceRange.low}</span>
                </div>
                <div class="chart-item">
                    <span class="chart-label">$5.00 - $9.99</span>
                    <span class="chart-value">${stats.priceRange.medium}</span>
                </div>
                <div class="chart-item">
                    <span class="chart-label">$10.00+</span>
                    <span class="chart-value">${stats.priceRange.high}</span>
                </div>
            </div>
        </div>
        
        <!-- 인기 카테고리 -->
        ${Object.keys(stats.topCategories).length > 0 ? `
        <div class="section">
            <h2>📂 인기 카테고리</h2>
            <div class="chart-container">
                ${Object.entries(stats.topCategories).map(([category, count]) => `
                <div class="chart-item">
                    <span class="chart-label">${category}</span>
                    <span class="chart-value">${count}</span>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 인기 개발자 -->
        ${Object.keys(stats.topDevelopers).length > 0 ? `
        <div class="section">
            <h2>👨‍💻 인기 개발자</h2>
            <div class="chart-container">
                ${Object.entries(stats.topDevelopers).map(([developer, count]) => `
                <div class="chart-item">
                    <span class="chart-label">${developer}</span>
                    <span class="chart-value">${count}</span>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 앱 목록 -->
        <div class="section">
            <h2>📱 앱 목록 (평점 높은 순)</h2>
            <div class="apps-grid">
                ${sortedApps.slice(0, 50).map(app => `
                <div class="app-card">
                    <div class="app-header">
                        ${app.icon ? `<img src="${app.icon}" alt="${app.title}" class="app-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Crect fill=\\'%23667eea\\' width=\\'100\\' height=\\'100\\'/%3E%3Ctext fill=\\'white\\' font-size=\\'50\\' x=\\'50\\' y=\\'70\\' text-anchor=\\'middle\\'%3E📱%3C/text%3E%3C/svg%3E'">` : ''}
                        <div class="app-info">
                            <div class="app-title">${escapeHtml(app.title || '앱 이름 없음')}</div>
                            <div class="app-developer">${escapeHtml(app.developer || '개발자 정보 없음')}</div>
                        </div>
                    </div>
                    ${app.score ? `
                    <div class="app-rating">
                        <span class="rating-stars">${'⭐'.repeat(Math.floor(app.score))}${app.score % 1 >= 0.5 ? '⭐' : ''}</span>
                        <span class="rating-value">${app.score.toFixed(1)}</span>
                        ${app.reviews ? `<span style="margin-left: 10px; opacity: 0.7;">(${formatNumber(app.reviews)}개 리뷰)</span>` : ''}
                    </div>
                    ` : ''}
                    <div class="app-meta">
                        <span>${app.genre || '카테고리 없음'}</span>
                        <span class="price-badge ${app.free ? 'free-badge' : ''}">
                            ${app.free ? '무료' : (app.price || '가격 정보 없음')}
                        </span>
                    </div>
                    ${app.installs ? `<div style="margin-top: 10px; font-size: 0.85em; opacity: 0.8;">다운로드: ${app.installs}</div>` : ''}
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
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

// 실행
if (require.main === module) {
    generateHTMLDashboard();
}

module.exports = { generateHTMLDashboard };

