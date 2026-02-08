// Vercel Serverless Function for filtered pharma news
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const clientId = 'Rjul4tuTrwGobWuUlNaK';
  const clientSecret = 'N7qwJfqqFN';

  const removeHtmlTags = (text) => {
    return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  };

  // 제약 전문 언론사 도메인
  const pharmaMedia = [
    'yakup.com',         // 약업신문
    'pharmnews.com',     // 팜뉴스
    'medipana.com',      // 메디파나뉴스
    'medicaltimes.com',  // 메디컬타임즈
    'docdocdoc.co.kr'    // 청년의사
  ];

  // 긴급 키워드
  const urgentKeywords = ['리콜', '회수', '공급 중단', '생산 중단', '품절', '판매 중지', '허가 취소', '긴급'];
  
  // 중요 키워드
  const importantKeywords = ['가격 인상', '허가', '승인', 'FDA', '식약처', '품목허가', '임상', '신약'];

  try {
    // 더 많은 뉴스 가져오기 (필터링할 것이므로)
    const query = encodeURIComponent('제약 OR 바이오 OR 의약품');
    const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=50&sort=date`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();

    // 제약 전문지 필터링
    const filteredNews = data.items
      .map(item => ({
        title: removeHtmlTags(item.title),
        description: removeHtmlTags(item.description),
        link: item.link,
        pubDate: item.pubDate,
        originalLink: item.originallink
      }))
      .filter(item => {
        // 전문 언론사만 포함
        return pharmaMedia.some(domain => 
          item.link.includes(domain) || item.originalLink?.includes(domain)
        );
      });

    // 우선순위 분류
    const categorizeNews = (item) => {
      const text = item.title + ' ' + item.description;
      
      if (urgentKeywords.some(keyword => text.includes(keyword))) {
        return { ...item, priority: 1, category: 'urgent', icon: '🚨', label: '긴급' };
      }
      if (importantKeywords.some(keyword => text.includes(keyword))) {
        return { ...item, priority: 2, category: 'important', icon: '⚠️', label: '중요' };
      }
      return { ...item, priority: 3, category: 'normal', icon: '📰', label: '주요 뉴스' };
    };

    const categorizedNews = filteredNews.map(categorizeNews);
    
    // 우선순위로 정렬
    categorizedNews.sort((a, b) => a.priority - b.priority);

    // 카테고리별로 1개씩 선택 (총 3개)
    const urgent = categorizedNews.find(n => n.category === 'urgent');
    const important = categorizedNews.find(n => n.category === 'important');
    const normal = categorizedNews.find(n => n.category === 'normal');

    const finalNews = [urgent, important, normal].filter(Boolean);
    
    // 3개 미만이면 일반 뉴스로 채우기
    if (finalNews.length < 3) {
      const remaining = categorizedNews
        .filter(n => !finalNews.includes(n))
        .slice(0, 3 - finalNews.length);
      finalNews.push(...remaining);
    }

    res.status(200).json({
      success: true,
      data: finalNews.slice(0, 3), // 최대 3개
      total: categorizedNews.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
