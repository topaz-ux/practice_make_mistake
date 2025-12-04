const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Steam Dataset 2025 데이터 로더
 * GitHub: https://github.com/vintagedon/steam-dataset-2025
 * 
 * 실제 데이터 파일을 로드하거나 Steam API를 통해 데이터를 가져옵니다.
 */

// GitHub 저장소에서 데이터 파일 확인
const GITHUB_REPO = 'https://github.com/vintagedon/steam-dataset-2025';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/vintagedon/steam-dataset-2025/main';

// 가능한 데이터 파일 경로들
const POSSIBLE_DATA_FILES = [
    'data/games.json',
    'data/steam_games.json',
    'data/games.csv',
    'games.json',
    'steam_games.json',
    'games.csv',
    'dataset.json',
    'steam_dataset.json'
];

/**
 * GitHub에서 파일 존재 여부 확인
 */
function checkGitHubFile(filePath) {
    return new Promise((resolve, reject) => {
        const url = `${GITHUB_RAW_BASE}/${filePath}`;
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

/**
 * GitHub에서 JSON 파일 다운로드
 */
function downloadGitHubJSON(filePath) {
    return new Promise((resolve, reject) => {
        const url = `${GITHUB_RAW_BASE}/${filePath}`;
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 로컬 파일에서 데이터 로드
 */
function loadLocalData() {
    const localFiles = [
        'data/games.json',
        'games.json',
        'steam_games.json',
        'dataset.json'
    ];
    
    for (const file of localFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                console.log(`✅ 로컬 파일에서 데이터 로드: ${file}`);
                return data;
            } catch (e) {
                console.warn(`⚠️ 파일 파싱 실패: ${file}`, e.message);
            }
        }
    }
    return null;
}

/**
 * Steam API를 통해 게임 목록 가져오기
 * Steam의 공개 API는 인증이 필요 없습니다.
 */
async function fetchSteamAppList() {
    return new Promise((resolve, reject) => {
        // Steam의 공개 앱 목록 API (인증 불필요)
        const url = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/';
        
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.applist && json.applist.apps) {
                        resolve(json);
                    } else {
                        reject(new Error('예상하지 못한 응답 형식'));
                    }
                } catch (e) {
                    reject(new Error(`JSON 파싱 실패: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            reject(new Error(`네트워크 오류: ${err.message}`));
        });
    });
}

/**
 * Steam Store API를 통해 특정 게임의 상세 정보 가져오기
 */
async function fetchGameDetails(appId) {
    return new Promise((resolve, reject) => {
        const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=korean`;
        
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 메인 데이터 로드 함수
 */
async function loadSteamData() {
    console.log('='.repeat(60));
    console.log('Steam Dataset 2025 데이터 로드 시도 중...');
    console.log('='.repeat(60));
    
    // 1. 로컬 파일 확인
    console.log('\n1. 로컬 파일 확인 중...');
    const localData = loadLocalData();
    if (localData) {
        return localData;
    }
    
    // 2. GitHub 저장소에서 데이터 파일 확인
    console.log('\n2. GitHub 저장소에서 데이터 파일 확인 중...');
    for (const file of POSSIBLE_DATA_FILES) {
        console.log(`   확인 중: ${file}`);
        const exists = await checkGitHubFile(file);
        if (exists) {
            console.log(`   ✅ 파일 발견: ${file}`);
            try {
                const data = await downloadGitHubJSON(file);
                console.log(`   ✅ 데이터 다운로드 완료: ${file}`);
                return data;
            } catch (e) {
                console.warn(`   ⚠️ 다운로드 실패: ${e.message}`);
            }
        }
    }
    
    // 3. Steam API 사용 (공개 API - 앱 목록)
    console.log('\n3. Steam API를 통한 앱 목록 가져오기 시도 중...');
    try {
        const steamData = await fetchSteamAppList();
        const apps = steamData.applist?.apps || [];
        console.log(`   ✅ Steam API에서 앱 목록 가져옴`);
        console.log(`   총 앱 수: ${apps.length.toLocaleString()}개`);
        
        // 샘플 데이터 구조로 변환
        const convertedData = {
            source: 'steam_api',
            metadata: {
                totalApplications: apps.length,
                lastUpdated: new Date().toISOString(),
                source: 'Steam API - GetAppList',
                note: '이 데이터는 Steam의 공개 API에서 가져온 앱 목록입니다. 상세 정보는 개별 API 호출이 필요합니다.'
            },
            statistics: {
                totalGames: apps.length,
                totalReviews: 0, // 개별 API 호출 필요
                averagePrice: 0, // 개별 API 호출 필요
                freeGames: 0, // 개별 API 호출 필요
                averageRating: 0, // 개별 API 호출 필요
                totalDevelopers: 0, // 개별 API 호출 필요
                totalPublishers: 0, // 개별 API 호출 필요
                platformSupport: {
                    windows: apps.length, // 대부분 Windows 지원
                    mac: 0, // 개별 API 호출 필요
                    linux: 0 // 개별 API 호출 필요
                }
            },
            topGames: apps.slice(0, 100).map(app => ({
                appId: app.appid,
                title: app.name,
                developer: 'Unknown', // 개별 API 호출 필요
                publisher: 'Unknown', // 개별 API 호출 필요
                releaseDate: 'Unknown', // 개별 API 호출 필요
                price: 0, // 개별 API 호출 필요
                isFree: false, // 개별 API 호출 필요
                rating: 0, // 개별 API 호출 필요
                reviews: 0, // 개별 API 호출 필요
                genres: [], // 개별 API 호출 필요
                platforms: { windows: true, mac: false, linux: false } // 개별 API 호출 필요
            })),
            allApps: apps // 전체 앱 목록
        };
        
        return convertedData;
    } catch (e) {
        console.warn(`   ⚠️ Steam API 호출 실패: ${e.message}`);
        console.warn(`   참고: Steam API는 공개 API이지만, 대량의 상세 정보를 가져오려면`);
        console.warn(`   각 게임마다 개별 API 호출이 필요합니다 (Rate Limit 주의)`);
    }
    
    console.log('\n❌ 데이터를 찾을 수 없습니다. 샘플 데이터를 사용합니다.');
    return null;
}

// 모듈로 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadSteamData, loadLocalData, fetchSteamAppList };
}

// 직접 실행 시
if (require.main === module) {
    loadSteamData().then(data => {
        if (data) {
            console.log('\n✅ 데이터 로드 성공!');
            console.log('데이터 구조:', Object.keys(data));
            if (data.metadata) {
                console.log('메타데이터:', data.metadata);
            }
        } else {
            console.log('\n⚠️ 실제 데이터를 찾을 수 없습니다.');
            console.log('GitHub 저장소를 확인하거나 Steam API를 사용하세요.');
        }
    }).catch(err => {
        console.error('❌ 오류:', err);
    });
}

