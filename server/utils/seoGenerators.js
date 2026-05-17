const normalizeUrl = (value) => {
  const trimmed = String(value || "").trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol);
};

const scoreSeed = (text, offset = 0) => {
  const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), offset);
  return 58 + (total % 38);
};

export const createAnalysisPayload = (inputUrl, userId) => {
  const parsed = normalizeUrl(inputUrl);
  const domain = parsed.hostname.replace(/^www\./, "");
  const seo = scoreSeed(domain, 7);
  const performance = scoreSeed(domain, 19);
  const accessibility = scoreSeed(domain, 31);
  const bestPractices = scoreSeed(domain, 43);
  const overallScore = Math.round((seo + performance + accessibility + bestPractices) / 4);
  const words = domain.split(/[.-]/).filter(Boolean);
  const imageTotal = 12 + (domain.length % 12);
  const missingAlt = domain.length % 4;

  return {
    userId,
    url: parsed.href,
    overallScore,
    status: "completed",
    loadTime: 900 + (domain.length % 5) * 420,
    pageSize: 180000 + domain.length * 4200,
    wordCount: 480 + domain.length * 18,
    categories: { seo, performance, accessibility, bestPractices },
    metaData: {
      title: `${domain} - SEO audit`,
      description: `Generated Rank Pilot audit for ${domain}.`,
      canonical: parsed.href,
      robots: "index, follow",
      ogTitle: `${domain} overview`,
      ogDescription: `Open graph summary for ${domain}.`,
      ogImage: "",
      twitterCard: "summary_large_image",
      viewport: "width=device-width, initial-scale=1",
      charset: "utf-8",
    },
    headings: { h1: 1, h2: 6, h3: 4, h4: 0, h5: 0, h6: 0, h1Texts: [`${domain} homepage`] },
    links: { internal: 24 + domain.length, external: 4 + (domain.length % 8), total: 28 + domain.length + (domain.length % 8) },
    images: { total: imageTotal, missingAlt, withAlt: imageTotal - missingAlt },
    keywords: words.slice(0, 5).map((word, index) => ({
      word,
      count: Math.max(3, 18 - index * 3),
      density: Number((4.8 - index * 0.7).toFixed(1)),
    })),
    issues: [
      {
        severity: seo >= 80 ? "info" : "warning",
        category: "SEO",
        message: "Review the title, meta description, and page headings for stronger keyword focus.",
        recommendation: "Use the primary keyword in the title, one H1, and the first paragraph.",
      },
      {
        severity: performance >= 80 ? "info" : "warning",
        category: "Performance",
        message: "Some page assets may slow down loading on mobile networks.",
        recommendation: "Compress images and defer non-critical scripts.",
      },
      {
        severity: accessibility >= 80 ? "info" : "warning",
        category: "Accessibility",
        message: "Check image alt text and contrast for important content.",
        recommendation: "Add descriptive alt text and keep text contrast readable.",
      },
    ],
  };
};

export const createRankingPayload = ({ keyword, url, userId }) => {
  const parsed = normalizeUrl(url);
  const domain = parsed.hostname.replace(/^www\./, "");
  const cleanKeyword = String(keyword || "").trim();
  const position = 4 + ((cleanKeyword.length + domain.length) % 24);
  const now = new Date();
  const rankHistory = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const historicalPosition = Math.max(1, position + (3 - index));
    return {
      date,
      position: historicalPosition,
      page: Math.ceil(historicalPosition / 10),
      title: `${domain} result for ${cleanKeyword}`,
      snippet: `Estimated ranking snapshot for ${cleanKeyword}.`,
    };
  });

  return {
    userId,
    keyword: cleanKeyword,
    url: parsed.href,
    domain,
    currentPosition: position,
    currentPage: Math.ceil(position / 10),
    bestPosition: Math.min(...rankHistory.map((item) => item.position), position),
    positionChange: 1,
    rankHistory,
    competitors: [],
    active: true,
    lastChecked: now,
    status: "completed",
  };
};
