// Vercel Serverless Function for fetching Naver News (3 categories)
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 네이버 API 인증 정보
  const clientId = 'Rjul4tuTrwGobWuUlNaK';
  const clientSecret = 'N7qwJfqqFN';

  // HTML 태그 제거 함수
  const removeHtmlTags = (text) => {
    return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  };

  // 뉴스 검색 함수
  const fetchNews = async (query, display = 3) => {
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodedQuery}&display=${display}&sort=date`; // 최신순 정렬

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news for query: ${query}`);
    }

    const data = await response.json();
    
    return data.items.map(item => ({
      title: removeHtmlTags(item.title),
      description: removeHtmlTags(item.description),
      link: item.link,
      pubDate: item.pubDate,
    }));
  };

  try {
    // 3가지 카테고리 뉴스 가져오기
    const [domesticNews, regulatoryNews, supplyChainNews] = await Promise.all([
      fetchNews('제약 OR 바이오', 3),           // 국내 제약·바이오 뉴스
      fetchNews('식약처 OR FDA OR 허가', 3),    // 규제·허가 뉴스
      fetchNews('원료의약품 OR 공급망 OR 수급', 3), // 공급망 이슈
    ]);

    // 성공 응답
    res.status(200).json({
      success: true,
      data: {
        domestic: domesticNews,
        regulatory: regulatoryNews,
        supplyChain: supplyChainNews,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Naver News API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
