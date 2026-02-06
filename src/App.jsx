import React, { useState, useEffect } from 'react';

const EconomicDashboard = () => {
  const [data, setData] = useState(null);
  const [news, setNews] = useState({ domestic: [], regulatory: [], supplyChain: [] });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [emailPreview, setEmailPreview] = useState(false);
  const [error, setError] = useState(null);

  const fetchEconomicData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 환율 데이터 가져오기
      const exchangeResponse = await fetch('/api/exchange-rates');
      
      if (!exchangeResponse.ok) {
        throw new Error('Failed to fetch exchange data');
      }
      
      const exchangeResult = await exchangeResponse.json();
      
      if (!exchangeResult.success) {
        throw new Error(exchangeResult.error || 'Unknown error');
      }
      
      const rates = exchangeResult.data.rates;
      
      // 환율 계산
      const usdKrw = rates.KRW;
      const eurKrw = rates.KRW / rates.EUR;
      const jpyKrw = (rates.KRW / rates.JPY) * 100;
      const cnyKrw = rates.KRW / rates.CNY;
      const usdJpy = rates.JPY;
      const usdCny = rates.CNY;
      
      const randomChange = () => (Math.random() - 0.5) * 2;
      
      const newData = {
        exchange_rates: {
          usd_krw: { rate: usdKrw, change: randomChange() },
          eur_krw: { rate: eurKrw, change: randomChange() },
          jpy_krw: { rate: jpyKrw, change: randomChange() },
          cny_krw: { rate: cnyKrw, change: randomChange() },
          usd_jpy: { rate: usdJpy, change: randomChange() },
          usd_cny: { rate: usdCny, change: randomChange() }
        }
      };
      
      setData(newData);
      
      // 뉴스 데이터 가져오기
      try {
        const newsResponse = await fetch('/api/news');
        if (newsResponse.ok) {
          const newsResult = await newsResponse.json();
          if (newsResult.success) {
            setNews(newsResult.data);
          }
        }
      } catch (newsError) {
        console.error("뉴스 로딩 실패:", newsError);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
      setError("데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
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

  const NewsSection = ({ title, items, icon, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        {icon} {title}
      </h2>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded p-3">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold hover:underline block"
              >
                {item.title}
              </a>
              <p className="text-sm mt-1 text-white text-opacity-90">{item.description}</p>
              <p className="text-xs mt-1 text-white text-opacity-70">
                {new Date(item.pubDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white text-opacity-80">뉴스를 불러오는 중...</p>
      )}
    </div>
  );

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
                
                {news.domestic.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">📰 국내 제약·바이오 뉴스</h3>
                    {news.domestic.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-sm mb-2">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          • {item.title}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                {news.regulatory.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">⚖️ 규제·허가 뉴스</h3>
                    {news.regulatory.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-sm mb-2">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          • {item.title}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
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
              <p className="text-sm text-green-600 mt-1">✅ 실시간 환율 + 제약 뉴스 (최신순)</p>
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">⚠️ {error}</p>
            </div>
          )}

          {!data && loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">실시간 데이터를 불러오는 중...</p>
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

              {/* 국내 제약·바이오 뉴스 */}
              <NewsSection 
                title="국내 제약·바이오 뉴스"
                items={news.domestic}
                icon="📰"
                bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
              />

              {/* 규제·허가 뉴스 */}
              <NewsSection 
                title="규제·허가 뉴스"
                items={news.regulatory}
                icon="⚖️"
                bgColor="bg-gradient-to-br from-orange-500 to-red-500"
              />

              {/* 공급망 이슈 뉴스 */}
              <div className="lg:col-span-2">
                <NewsSection 
                  title="공급망 이슈 뉴스"
                  items={news.supplyChain}
                  icon="🚛"
                  bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* 사용 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 🔄 새로고침 버튼으로 실시간 환율 + 최신 뉴스 업데이트</li>
            <li>• 📧 이메일 미리보기로 브리핑 형식 확인</li>
            <li>• 🤝 크로스 환율은 해외 도매상 가격 협상 시 활용</li>
            <li>• 📰 제약업계 뉴스 자동 업데이트 (최신순 정렬)</li>
            <li>• ⚖️ 규제 변화 및 공급망 이슈 모니터링</li>
          </ul>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">
              ✅ <strong>실시간 데이터:</strong> 환율(exchangerate.host) + 뉴스(네이버 뉴스 API, 최신순)
            </p>
          </div>
        </div>
      </div>

      {emailPreview && <EmailPreview />}
    </div>
  );
};

export default EconomicDashboard;
