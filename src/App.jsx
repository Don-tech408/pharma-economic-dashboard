import React, { useState, useEffect } from 'react';

const EconomicDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [emailPreview, setEmailPreview] = useState(false);

  // 샘플 데이터
  const sampleData = {
    exchange_rates: {
      usd_krw: { rate: 1432.50, change: 0.35 },
      eur_krw: { rate: 1545.80, change: -0.12 },
      jpy_krw: { rate: 951.20, change: 0.28 },
      cny_krw: { rate: 197.35, change: -0.08 },
      usd_jpy: { rate: 150.65, change: 0.15 },
      usd_cny: { rate: 7.26, change: 0.22 }
    },
    oil_prices: {
      wti: { price: 78.45, change: 1.2 },
      brent: { price: 82.30, change: 0.8 }
    },
    materials: {
      gold: { price: 2654.80, change: 0.45 },
      copper: { price: 4.23, change: -0.32 }
    },
    news_summary: "글로벌 제약사들의 바이오시밀러 경쟁이 심화되고 있으며, 원자재 가격 상승으로 인한 생산 비용 증가가 예상됩니다. 달러 강세로 수입 원료 구매 비용 부담이 커지고 있어 환율 변동에 대한 면밀한 모니터링이 필요한 상황입니다."
  };

  const fetchEconomicData = () => {
    setLoading(true);
    
    // 실제 API 대신 샘플 데이터 사용
    setTimeout(() => {
      setData(sampleData);
      setLastUpdate(new Date());
      setLoading(false);
    }, 1500); // 1.5초 로딩 시뮬레이션
  };

  useEffect(() => {
    fetchEconomicData();
  }, []);

  const renderChangeIndicator = (change) => {
    if (change > 0) {
      return <span className="text-red-500 text-sm">📈 +{change.toFixed(2)}%</span>;
    } else if (change < 0) {
      return <span className="text-blue-500 text-sm">📉 {change.toFixed(2)}%</span>;
    }
    return <span className="text-gray-500 text-sm">➡️ 0.00%</span>;
  };

  const EmailPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📧 이메일 브리핑 미리보기</h2>
            <button 
              onClick={() => setEmailPreview(false)} 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            >
              ✕
            </button>
          </div>
          
          <div className="border rounded p-4 bg-gray-50">
            <div className="mb-4 pb-3 border-b">
              <p className="text-sm text-gray-600">수신: 구매팀 전체</p>
              <p className="text-sm text-gray-600">발신: 경제지표 브리핑 시스템</p>
              <p className="font-bold mt-2">제목: [제약구매팀] 일일 경제지표 브리핑 - {new Date().toLocaleDateString('ko-KR')}</p>
            </div>
            
            {data && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">📊 주요 환율</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b"><td className="py-1">USD/KRW</td><td className="text-right font-bold py-1">₩{data.exchange_rates.usd_krw.rate.toFixed(2)}</td><td className="text-right py-1">{renderChangeIndicator(data.exchange_rates.usd_krw.change)}</td></tr>
                      <tr className="border-b"><td className="py-1">USD/JPY</td><td className="text-right font-bold py-1">¥{data.exchange_rates.usd_jpy.rate.toFixed(2)}</td><td className="text-right py-1">{renderChangeIndicator(data.exchange_rates.usd_jpy.change)}</td></tr>
                      <tr><td className="py-1">USD/CNY</td><td className="text-right font-bold py-1">¥{data.exchange_rates.usd_cny.rate.toFixed(2)}</td><td className="text-right py-1">{renderChangeIndicator(data.exchange_rates.usd_cny.change)}</td></tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">⛽ 유가</h3>
                  <p className="text-sm">WTI: ${data.oil_prices.wti.price.toFixed(2)} {renderChangeIndicator(data.oil_prices.wti.change)}</p>
                  <p className="text-sm">Brent: ${data.oil_prices.brent.price.toFixed(2)} {renderChangeIndicator(data.oil_prices.brent.change)}</p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">📰 주요 뉴스</h3>
                  <p className="text-sm text-gray-700">{data.news_summary}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                  <p className="text-xs text-blue-800">💡 이 내용을 복사해서 팀 메일로 발송하실 수 있습니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">💊 제약구매팀 경제지표 대시보드</h1>
              <p className="text-gray-600 mt-1">
                {lastUpdate && `최종 업데이트: ${lastUpdate.toLocaleString('ko-KR')}`}
              </p>
              <p className="text-sm text-green-600 mt-1">✅ 데모 버전 - 샘플 데이터로 작동 중</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEmailPreview(true)}
                disabled={!data}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300"
              >
                📧 이메일 미리보기
              </button>
              <button
                onClick={fetchEconomicData}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                🔄 {loading ? '업데이트 중...' : '새로고침'}
              </button>
            </div>
          </div>

          {!data && loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
            </div>
          )}

          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 환율 정보 */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  💰 주요 환율
                </h2>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">USD/KRW</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₩{data.exchange_rates.usd_krw.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.usd_krw.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">EUR/KRW</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₩{data.exchange_rates.eur_krw.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.eur_krw.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">JPY/KRW (100엔당)</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₩{data.exchange_rates.jpy_krw.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.jpy_krw.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">CNY/KRW</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₩{data.exchange_rates.cny_krw.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.cny_krw.change)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 협상용 크로스 환율 */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">🤝 협상용 크로스 환율</h2>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">USD/JPY</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">¥{data.exchange_rates.usd_jpy.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.usd_jpy.change)}</div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-white text-opacity-80">🇯🇵 일본 도매상 협상 시 참고</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">USD/CNY</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">¥{data.exchange_rates.usd_cny.rate.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.exchange_rates.usd_cny.change)}</div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-white text-opacity-80">🇨🇳 중국 도매상 협상 시 참고</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-30 rounded p-4 mt-4">
                    <h3 className="font-bold text-sm mb-2">💡 협상 TIP</h3>
                    <p className="text-sm text-white text-opacity-90">
                      달러 강세 시 원화 결제 유리, 달러 약세 시 달러 결제 검토
                    </p>
                  </div>
                </div>
              </div>

              {/* 유가 정보 */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  ⛽ 국제 유가
                </h2>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">WTI</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${data.oil_prices.wti.price.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.oil_prices.wti.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Brent</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${data.oil_prices.brent.price.toFixed(2)}</div>
                        <div className="text-sm">{renderChangeIndicator(data.oil_prices.brent.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-30 rounded p-3 mt-3">
                    <p className="text-sm">📦 물류비용 영향도: {data.oil_prices.wti.price > 80 ? '높음' : '보통'}</p>
                  </div>
                </div>
              </div>

              {/* 원자재 가격 */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">🏭 주요 원자재</h2>
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">금 (Gold)</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${data.materials.gold.price.toFixed(2)}/oz</div>
                        <div className="text-sm">{renderChangeIndicator(data.materials.gold.change)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">구리 (Copper)</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${data.materials.copper.price.toFixed(2)}/lb</div>
                        <div className="text-sm">{renderChangeIndicator(data.materials.copper.change)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 뉴스 요약 */}
              <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">📰 제약업계 경제 뉴스</h2>
                <p className="text-gray-700 leading-relaxed">{data.news_summary}</p>
              </div>
            </div>
          )}
        </div>

        {/* 사용 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 🔄 새로고침 버튼으로 최신 데이터 업데이트 (데모 버전)</li>
            <li>• 📧 이메일 미리보기로 브리핑 형식 확인</li>
            <li>• 🤝 크로스 환율은 해외 도매상 가격 협상 시 활용</li>
            <li>• ⛽ 유가 상승 시 물류비용 재협상 검토 필요</li>
          </ul>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              ℹ️ <strong>데모 버전 안내:</strong> 현재 샘플 데이터로 작동 중입니다. 
              실제 운영 시에는 실시간 API 연동이 필요합니다.
            </p>
          </div>
        </div>
      </div>

      {emailPreview && <EmailPreview />}
    </div>
  );
};

export default EconomicDashboard;
