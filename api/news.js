// Vercel Serverless Function for fetching Naver News
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

  try {
    // 제약 + 바이오 뉴스 검색 (조회수 많은 순)
    const query = encodeURIComponent('제약 OR 바이오');
    const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=5&sort=sim`; // sim = 정확도순 (조회수 반영)

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news from Naver');
    }

    const data = await response.json();

    // HTML 태그 제거 함수
    const removeHtmlTags = (text) => {
      return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    };

    // 뉴스 데이터 정제
    const newsItems = data.items.slice(0, 3).map(item => ({
      title: removeHtmlTags(item.title),
      description: removeHtmlTags(item.description),
      link: item.link,
      pubDate: item.pubDate,
    }));

    // 성공 응답
    res.status(200).json({
      success: true,
      data: newsItems,
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
