// Vercel Serverless Function for enhanced exchange rates with historical comparison
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 현재 환율
    const currentResponse = await fetch('https://api.exchangerate.host/latest?base=USD');
    if (!currentResponse.ok) throw new Error('Failed to fetch current rates');
    const currentData = await currentResponse.json();
    
    // 30일 전 환율 (트렌드용)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const thirtyDaysResponse = await fetch(`https://api.exchangerate.host/${thirtyDaysDate}?base=USD`);
    const thirtyDaysData = thirtyDaysResponse.ok ? await thirtyDaysResponse.json() : null;
    
    // 7일 전 환율
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const sevenDaysResponse = await fetch(`https://api.exchangerate.host/${sevenDaysDate}?base=USD`);
    const sevenDaysData = sevenDaysResponse.ok ? await sevenDaysResponse.json() : null;
    
    // 2025년 환율 평균 계산 (매월 15일 기준)
    const months2025 = [
      '2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15',
      '2025-05-15', '2025-06-15', '2025-07-15', '2025-08-15',
      '2025-09-15', '2025-10-15', '2025-11-15', '2025-12-15'
    ];
    
    const fetchMonthData = async (date) => {
      try {
        const response = await fetch(`https://api.exchangerate.host/${date}?base=USD`);
        if (response.ok) {
          const data = await response.json();
          return data.rates;
        }
      } catch (err) {
        console.error(`Failed to fetch ${date}:`, err);
      }
      return null;
    };
    
    // 병렬로 모든 월 데이터 가져오기
    const monthlyData = await Promise.all(months2025.map(fetchMonthData));
    const validData = monthlyData.filter(d => d !== null);
    
    // 평균 계산
    const calculateAverage = (currency) => {
      const values = validData.map(d => d[currency]).filter(v => v);
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    };
    
    const lastYearAverage = validData.length > 0 ? {
      KRW: calculateAverage('KRW'),
      JPY: calculateAverage('JPY'),
      CNY: calculateAverage('CNY'),
      EUR: calculateAverage('EUR')
    } : {
      // 폴백값 (API 실패 시)
      KRW: 1380.50,
      JPY: 153.20,
      CNY: 7.28,
      EUR: 0.94
    };
    
    // 계산 함수
    const calculateChange = (current, previous) => {
      if (!previous) return 0;
      return ((current - previous) / previous) * 100;
    };
    
    const rates = currentData.rates;
    const thirtyDaysRates = thirtyDaysData?.rates || rates;
    const sevenDaysRates = sevenDaysData?.rates || rates;
    
    // 구매 시그널 생성
    const generateSignal = (current, lastYear, sevenDay, thirtyDay) => {
      const vsLastYear = calculateChange(current, lastYear);
      const vsSevenDay = calculateChange(current, sevenDay);
      const vsThirtyDay = calculateChange(current, thirtyDay);
      
      // 로직: 작년 평균보다 낮고, 하락 추세면 '사라'
      if (vsLastYear < -2 && vsSevenDay < 0) {
        return { signal: 'buy', color: 'green', message: '구매 유리 구간' };
      }
      // 작년 평균보다 높고, 상승 추세면 '기다려'
      if (vsLastYear > 2 && vsSevenDay > 0) {
        return { signal: 'wait', color: 'red', message: '구매 주의' };
      }
      // 그 외
      return { signal: 'neutral', color: 'blue', message: '안정적' };
    };
    
    const usdKrw = rates.KRW;
    const usdJpy = rates.JPY;
    const usdCny = rates.CNY;
    const usdEur = rates.EUR;
    
    const data = {
      current: {
        usd_krw: usdKrw,
        usd_jpy: usdJpy,
        usd_cny: usdCny,
        eur_krw: usdKrw / usdEur,
        jpy_krw: (usdKrw / usdJpy) * 100,
        cny_krw: usdKrw / usdCny
      },
      lastYearAvg: lastYearAverage,
      sevenDayAvg: {
        usd_krw: sevenDaysRates.KRW,
        usd_jpy: sevenDaysRates.JPY,
        usd_cny: sevenDaysRates.CNY
      },
      thirtyDayAvg: {
        usd_krw: thirtyDaysRates.KRW,
        usd_jpy: thirtyDaysRates.JPY,
        usd_cny: thirtyDaysRates.CNY
      },
      changes: {
        usd_krw: {
          vsLastYear: calculateChange(usdKrw, lastYearAverage.KRW),
          vsSevenDay: calculateChange(usdKrw, sevenDaysRates.KRW),
          vsThirtyDay: calculateChange(usdKrw, thirtyDaysRates.KRW)
        },
        usd_jpy: {
          vsLastYear: calculateChange(usdJpy, lastYearAverage.JPY),
          vsSevenDay: calculateChange(usdJpy, sevenDaysRates.JPY),
          vsThirtyDay: calculateChange(usdJpy, thirtyDaysRates.JPY)
        },
        usd_cny: {
          vsLastYear: calculateChange(usdCny, lastYearAverage.CNY),
          vsSevenDay: calculateChange(usdCny, sevenDaysRates.CNY),
          vsThirtyDay: calculateChange(usdCny, sevenDaysRates.CNY)
        }
      },
      signals: {
        usd_krw: generateSignal(usdKrw, lastYearAverage.KRW, sevenDaysRates.KRW, thirtyDaysRates.KRW),
        usd_jpy: generateSignal(usdJpy, lastYearAverage.JPY, sevenDaysRates.JPY, thirtyDaysRates.JPY),
        usd_cny: generateSignal(usdCny, lastYearAverage.CNY, sevenDaysRates.CNY, thirtyDaysRates.CNY)
      }
    };

    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
