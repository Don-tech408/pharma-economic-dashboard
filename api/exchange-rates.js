// Vercel Serverless Function - 환율 API (frankfurter.dev 사용, 무료/키 불필요)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const now = new Date();
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const fmt = (d) => d.toISOString().split('T')[0];

    // frankfurter.dev: ECB 기반 무료 API (키 불필요)
    const [curRes, d7Res, d30Res] = await Promise.all([
      fetch('https://api.frankfurter.dev/latest?base=USD&symbols=KRW,JPY,CNY,EUR'),
      fetch(`https://api.frankfurter.dev/${fmt(d7)}?base=USD&symbols=KRW,JPY,CNY,EUR`),
      fetch(`https://api.frankfurter.dev/${fmt(d30)}?base=USD&symbols=KRW,JPY,CNY,EUR`),
    ]);

    if (!curRes.ok) throw new Error('Failed to fetch current rates');
    
    const curData = await curRes.json();
    const d7Data = d7Res.ok ? await d7Res.json() : curData;
    const d30Data = d30Res.ok ? await d30Res.json() : curData;

    const rates = curData.rates;
    const d7Rates = d7Data.rates;
    const d30Rates = d30Data.rates;

    // 2025년 환율 연평균
    const lastYearAverage = {
      KRW: 1438.75,
      JPY: 153.60,
      CNY: 7.29,
      EUR: 0.94,
    };

    const calcChange = (cur, prev) => (prev ? ((cur - prev) / prev) * 100 : 0);

    const genSignal = (cur, lastYear, sevenDay) => {
      const vsLY = calcChange(cur, lastYear);
      const vs7 = calcChange(cur, sevenDay);
      if (vsLY < -2 && vs7 < 0) return { signal: 'buy', message: '구매 유리 구간' };
      if (vsLY > 2 && vs7 > 0) return { signal: 'wait', message: '구매 주의' };
      return { signal: 'neutral', message: '안정적' };
    };

    const usdKrw = rates.KRW;
    const usdJpy = rates.JPY;
    const usdCny = rates.CNY;

    const data = {
      current: {
        usd_krw: usdKrw,
        usd_jpy: usdJpy,
        usd_cny: usdCny,
        eur_krw: usdKrw / rates.EUR,
        jpy_krw: (usdKrw / usdJpy) * 100,
        cny_krw: usdKrw / usdCny,
      },
      lastYearAvg: lastYearAverage,
      sevenDayAvg: { usd_krw: d7Rates.KRW, usd_jpy: d7Rates.JPY, usd_cny: d7Rates.CNY },
      thirtyDayAvg: { usd_krw: d30Rates.KRW, usd_jpy: d30Rates.JPY, usd_cny: d30Rates.CNY },
      changes: {
        usd_krw: {
          vsLastYear: calcChange(usdKrw, lastYearAverage.KRW),
          vsSevenDay: calcChange(usdKrw, d7Rates.KRW),
          vsThirtyDay: calcChange(usdKrw, d30Rates.KRW),
        },
        usd_jpy: {
          vsLastYear: calcChange(usdJpy, lastYearAverage.JPY),
          vsSevenDay: calcChange(usdJpy, d7Rates.JPY),
          vsThirtyDay: calcChange(usdJpy, d30Rates.JPY),
        },
        usd_cny: {
          vsLastYear: calcChange(usdCny, lastYearAverage.CNY),
          vsSevenDay: calcChange(usdCny, d7Rates.CNY),
          vsThirtyDay: calcChange(usdCny, d30Rates.CNY),
        },
      },
      signals: {
        usd_krw: genSignal(usdKrw, lastYearAverage.KRW, d7Rates.KRW),
        usd_jpy: genSignal(usdJpy, lastYearAverage.JPY, d7Rates.JPY),
        usd_cny: genSignal(usdCny, lastYearAverage.CNY, d7Rates.CNY),
      },
    };

    res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Exchange rate API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
