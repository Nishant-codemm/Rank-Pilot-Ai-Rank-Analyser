export interface AnalysisData {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterCard: string;
        viewport: string;
        charset: string;
    };
    headings: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
        h1Texts: string[];
    };
    links: {
        internal: number;
        external: number;
        total: number;
    };
    images: {
        total: number;
        missingAlt: number;
        withAlt: number;
    };
    keywords: { word: string; count: number; density: number }[];
    issues: { severity: string; category: string; message: string; recommendation: string }[];
}

export interface RankingData {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    rankHistory: { date: string; position: number | null; page: number | null; title: string; snippet: string }[];
    competitors: { position: number; url: string; domain: string; title: string; snippet: string }[];
    active: boolean;
    lastChecked: string | null;
    status: string;
    createdAt: string;
}

const ANALYSES_KEY = "rankpilot-analyses";
const RANKINGS_KEY = "rankpilot-rankings";

const readJson = <T,>(key: string, fallback: T): T => {
    try {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : fallback;
    } catch {
        return fallback;
    }
};

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol);
};

const scoreSeed = (text: string, offset = 0) => {
    const total = [...text].reduce((sum, char) => sum + char.charCodeAt(0), offset);
    return 58 + (total % 38);
};

export const getAnalyses = () => readJson<AnalysisData[]>(ANALYSES_KEY, []);

export const saveAnalyses = (items: AnalysisData[]) => {
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(items));
};

export const saveAnalysis = (analysis: AnalysisData) => {
    const current = getAnalyses().filter((item) => item._id !== analysis._id);
    saveAnalyses([analysis, ...current]);
};

export const getAnalysis = (id?: string) => getAnalyses().find((item) => item._id === id) || null;

export const deleteAnalysis = (id: string) => {
    saveAnalyses(getAnalyses().filter((item) => item._id !== id));
};

export const createAnalysis = (inputUrl: string): AnalysisData => {
    const parsed = normalizeUrl(inputUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    const seo = scoreSeed(domain, 7);
    const performance = scoreSeed(domain, 19);
    const accessibility = scoreSeed(domain, 31);
    const bestPractices = scoreSeed(domain, 43);
    const overallScore = Math.round((seo + performance + accessibility + bestPractices) / 4);
    const words = domain.split(/[.-]/).filter(Boolean);
    const keywords = words.slice(0, 5).map((word, index) => ({
        word,
        count: Math.max(3, 18 - index * 3),
        density: Number((4.8 - index * 0.7).toFixed(1)),
    }));

    return {
        _id: `analysis-${Date.now()}`,
        url: parsed.href,
        overallScore,
        status: "completed",
        createdAt: new Date().toISOString(),
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
        images: { total: 12 + (domain.length % 12), missingAlt: domain.length % 4, withAlt: 12 + (domain.length % 12) - (domain.length % 4) },
        keywords,
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

export const getRankings = () => readJson<RankingData[]>(RANKINGS_KEY, []);

export const saveRankings = (items: RankingData[]) => {
    localStorage.setItem(RANKINGS_KEY, JSON.stringify(items));
};

export const saveRanking = (ranking: RankingData) => {
    const current = getRankings().filter((item) => item._id !== ranking._id);
    saveRankings([ranking, ...current]);
};

export const getRanking = (id?: string) => getRankings().find((item) => item._id === id) || null;

export const createRanking = (keyword: string, inputUrl: string): RankingData => {
    const parsed = normalizeUrl(inputUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    const position = 4 + ((keyword.length + domain.length) % 24);
    const now = new Date();
    const history = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));
        const historicalPosition = Math.max(1, position + (3 - index));
        return {
            date: date.toISOString(),
            position: historicalPosition,
            page: Math.ceil(historicalPosition / 10),
            title: `${domain} result for ${keyword}`,
            snippet: `Estimated ranking snapshot for ${keyword}.`,
        };
    });

    return {
        _id: `ranking-${Date.now()}`,
        keyword: keyword.trim(),
        url: parsed.href,
        domain,
        currentPosition: position,
        currentPage: Math.ceil(position / 10),
        bestPosition: Math.min(...history.map((item) => item.position || 99), position),
        positionChange: 1,
        rankHistory: history,
        competitors: [],
        active: true,
        lastChecked: now.toISOString(),
        status: "completed",
        createdAt: now.toISOString(),
    };
};
