import React, { useState, useEffect } from 'react';

const EconomicDashboard = () => {
  const [exchangeData, setExchangeData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 환율 데이터
      const exchangeResponse = await fetch('/api/exchange-rates');
      if (!exchangeResponse.ok) throw new Error('Failed to fetch exchange data');
      const exchangeResult = await exchangeResponse.json();
      if (!exchangeResult.success) throw new Error(exchangeResult.error);
      setExchangeData(exchangeResult.data);
      
      // 뉴스 데이터
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
    fetchData();
  }, []);

  const SignalBadge = ({ signal }) => {
    const colors = {
      buy: 'bg-green-500',
      wait: 'bg-red-500',
      neutral: 'bg-blue-500'
    };
    const icons = {
      buy: '✅',
      wait: '⚠️',
      neutral: '🔵'
    };
    
    return (
      <span className={`${colors[signal.signal]} text-white px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1`}>
        {icons[signal.signal]} {signal.message}
      </span>
    );
  };

  const ComparisonCard = ({ title, current, lastYear, sevenDay, thirtyDay, changes, signal, unit = '₩' }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <SignalBadge signal={signal} />
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-4">
        {unit}{current.toFixed(2)}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600">전년 평균 대비</span>
          <span className={`font-bold ${changes.vsLastYear > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {changes.vsLastYear > 0 ? '▲' : '▼'} {Math.abs(changes.vsLastYear).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600">7일 평균 대비</span>
          <span className={`font-bold ${changes.vsSevenDay > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {changes.vsSevenDay > 0 ? '▲' : '▼'} {Math.abs(changes.vsSevenDay).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">30일 평균 대비</span>
          <span className={`font-bold ${changes.vsThirtyDay > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {changes.vsThirtyDay > 0 ? '▲' : '▼'} {Math.abs(changes.vsThirtyDay).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <div>전년 평균: {unit}{lastYear.toFixed(2)}</div>
      </div>
    </div>
  );

  const NewsCard = ({ item }) => {
    const bgColors = {
      urgent: 'bg-red-50 border-red-300',
      important: 'bg-orange-50 border-orange-300',
      normal: 'bg-blue-50 border-blue-300'
    };
    
    const textColors = {
      urgent: 'text-red-700',
      important: 'text-orange-700',
      normal: 'text-blue-700'
    };

    return (
      <div className={`${bgColors[item.category]} border-2 rounded-lg p-4`}>
        <div className="flex items-start gap-2 mb-2">
          <span className="text-2xl">{item.icon}</span>
          <div className="flex-1">
            <span className={`${textColors[item.category]} text-xs font-bold uppercase`}>
              {item.label}
            </span>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-lg font-bold text-gray-900 hover:text-blue-600 hover:underline mt-1"
            >
              {item.title}
            </a>
          </div>
        </div>
        <p className="text-gray-700 text-sm mb-2 line-clamp-2">{item.description}</p>
        <p className="text-gray-500 text-xs">
          {new Date(item.pubDate).toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">💊 제약구매팀 SCM 대시보드</h1>
              <p className="text-gray-600 mt-1">
                {lastUpdate && `최종 업데이트: ${lastUpdate.toLocaleString('ko-KR')}`}
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 font-bold"
            >
              🔄 {loading ? '업데이트 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-bold">⚠️ {error}</p>
          </div>
        )}

        {!exchangeData && loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-semibold">실시간 데이터 분석 중...</p>
          </div>
        )}

        {exchangeData && (
          <div className="space-y-6">
            {/* 구매 시그널 섹션 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                🎯 구매 시그널
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">USD/KRW (미국 달러)</div>
                  <div className="text-xl font-bold mb-2">
                    {exchangeData.signals.usd_krw.message}
                  </div>
                  <div className="text-sm">
                    {exchangeData.changes.usd_krw.vsLastYear < 0 
                      ? '💰 전년 대비 낮은 환율 - 달러 결제 유리' 
                      : '⏳ 전년 대비 높은 환율 - 환율 하락 대기'}
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">USD/JPY (일본 엔)</div>
                  <div className="text-xl font-bold mb-2">
                    {exchangeData.signals.usd_jpy.message}
                  </div>
                  <div className="text-sm">
                    🇯🇵 일본 도매상 협상 시 참고
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-1">USD/CNY (중국 위안)</div>
                  <div className="text-xl font-bold mb-2">
                    {exchangeData.signals.usd_cny.message}
                  </div>
                  <div className="text-sm">
                    🇨🇳 중국 원료 구매 시 참고
                  </div>
                </div>
              </div>
            </div>

            {/* 환율 비교 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ComparisonCard
                title="USD/KRW (미국 달러)"
                current={exchangeData.current.usd_krw}
                lastYear={exchangeData.lastYearAvg.KRW}
                sevenDay={exchangeData.sevenDayAvg.usd_krw}
                thirtyDay={exchangeData.thirtyDayAvg.usd_krw}
                changes={exchangeData.changes.usd_krw}
                signal={exchangeData.signals.usd_krw}
                unit="₩"
              />
              
              <ComparisonCard
                title="JPY/KRW (100엔당)"
                current={exchangeData.current.jpy_krw}
                lastYear={(exchangeData.lastYearAvg.KRW / exchangeData.lastYearAvg.JPY) * 100}
                sevenDay={(exchangeData.sevenDayAvg.usd_krw / exchangeData.sevenDayAvg.usd_jpy) * 100}
                thirtyDay={(exchangeData.thirtyDayAvg.usd_krw / exchangeData.thirtyDayAvg.usd_jpy) * 100}
                changes={exchangeData.changes.usd_jpy}
                signal={exchangeData.signals.usd_jpy}
                unit="₩"
              />
              
              <ComparisonCard
                title="CNY/KRW (중국 위안)"
                current={exchangeData.current.cny_krw}
                lastYear={exchangeData.lastYearAvg.KRW / exchangeData.lastYearAvg.CNY}
                sevenDay={exchangeData.sevenDayAvg.usd_krw / exchangeData.sevenDayAvg.usd_cny}
                thirtyDay={exchangeData.thirtyDayAvg.usd_krw / exchangeData.thirtyDayAvg.usd_cny}
                changes={exchangeData.changes.usd_cny}
                signal={exchangeData.signals.usd_cny}
                unit="₩"
              />
            </div>

            {/* 뉴스 섹션 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📰 제약업계 핵심 뉴스
                <span className="text-sm font-normal text-gray-500">(전문지 필터링)</span>
              </h2>
              
              {news.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {news.map((item, index) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">제약 전문지 뉴스를 불러오는 중...</p>
                </div>
              )}
            </div>

            {/* 안내 섹션 */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">💡 대시보드 활용 가이드</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <div className="font-bold mb-2">🎯 구매 시그널</div>
                  <ul className="space-y-1 ml-4">
                    <li>• <span className="text-green-600 font-bold">구매 유리</span>: 전년 대비 낮은 환율, 구매 적기</li>
                    <li>• <span className="text-red-600 font-bold">구매 주의</span>: 전년 대비 높은 환율, 환율 하락 대기</li>
                    <li>• <span className="text-blue-600 font-bold">안정적</span>: 평년 수준, 정상 구매</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold mb-2">📰 뉴스 분류</div>
                  <ul className="space-y-1 ml-4">
                    <li>• <span className="text-red-600 font-bold">🚨 긴급</span>: 리콜, 공급중단 등 즉시 대응 필요</li>
                    <li>• <span className="text-orange-600 font-bold">⚠️ 중요</span>: 허가, 가격변동 등 주시 필요</li>
                    <li>• <span className="text-blue-600 font-bold">📰 주요</span>: 업계 동향 정보</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-green-700 font-semibold">
                  ✅ 데이터 출처: 환율(exchangerate.host) + 뉴스(약업신문, 팜뉴스, 메디파나, 메디컬타임즈, 청년의사)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EconomicDashboard;
