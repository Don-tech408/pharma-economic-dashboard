// Vercel Serverless Function for fetching exchange rates
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ExchangeRate-API에서 환율 데이터 가져오기
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // 성공 응답
    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 에러 응답
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
