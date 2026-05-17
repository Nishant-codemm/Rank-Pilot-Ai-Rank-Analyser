import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon, ArrowRightIcon, BarChart3Icon, GlobeIcon, TrendingUpIcon } from "lucide-react";
import AnalysesCard from "../components/AnalysesCard";
import { api, useAppContext as useApp } from "../context/Appcontext";

interface AnalysisSummary {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
}

export default function Dashboard() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecent = async () => {
        try {
            const response = await api.get("/api/analyses");
            setAnalyses(response.data.analyses);
        } catch (error) {
            console.error("Load analyses error:", error);
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    const handleAnalyze = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (url.trim()) {
            navigate(`/analyze?url=${encodeURIComponent(url)}`);
        }
    };

    const completedAnalyses = analyses.filter((a) => a.status === "completed");
    const avgScore = completedAnalyses.length ? Math.round(completedAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / completedAnalyses.length) : 0;
    const plan = user?.plan || "free";
    const scansLeft = plan === "free" ? Math.max(0, 5 - completedAnalyses.length) : "Unlimited";
    const strongestCategory = completedAnalyses.length
        ? [
              { label: "SEO", value: Math.round(completedAnalyses.reduce((sum, a) => sum + a.categories.seo, 0) / completedAnalyses.length) },
              { label: "Performance", value: Math.round(completedAnalyses.reduce((sum, a) => sum + a.categories.performance, 0) / completedAnalyses.length) },
              { label: "Accessibility", value: Math.round(completedAnalyses.reduce((sum, a) => sum + a.categories.accessibility, 0) / completedAnalyses.length) },
              { label: "Best Practices", value: Math.round(completedAnalyses.reduce((sum, a) => sum + a.categories.bestPractices, 0) / completedAnalyses.length) },
          ].sort((a, b) => b.value - a.value)[0]
        : { label: "SEO", value: 0 };

    const getScoreClass = (s: number) => {
        if (s >= 80) return "score-good";
        if (s >= 50) return "score-medium";
        return "score-poor";
    };

    useEffect(() => {
        (async () => await fetchRecent())();
    }, []);

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8 glass rounded-3xl p-6 sm:p-8 bg-dot-pattern bg-[length:28px_28px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">AI SEO command center</p>
                    <h1 className="text-3xl sm:text-5xl font-semibold text-foreground mb-3">
                        Welcome back, <span className="gradient-text">{user?.name || "there"}</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">Analyze websites, track keywords, and turn AI recommendations into ranking wins from one dashboard.</p>
                </div>

                {/* Quick Analyze */}
                <form onSubmit={handleAnalyze} className="mb-10" style={{ animationDelay: "100ms" }}>
                    <div className="border border-primary/20 rounded-full p-2 flex items-center gap-2 max-w-2xl">
                        <div className="flex items-center gap-3 flex-1 px-3">
                            <SearchIcon size={20} className="text-muted-foreground shrink-0" />
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter a URL to analyze..." className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-3" id="dashboard-url-input" />
                        </div>
                        <button type="submit" className="bg-primary px-5 py-3 rounded-full text-primary-foreground text-sm hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2" style={{ color: "var(--background)" }} id="dashboard-analyze-btn">
                            Analyze
                            <ArrowRightIcon size={16} />
                        </button>
                    </div>
                </form>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="glass rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <GlobeIcon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{analyses.length}</p>
                            <p className="text-xs text-muted-foreground">Total Scans</p>
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUpIcon size={22} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${getScoreClass(avgScore)}`}>{avgScore}</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <BarChart3Icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{scansLeft}</p>
                            <p className="text-xs text-muted-foreground">Scans Left Today</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
                    <div className="glass rounded-2xl p-5 lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">AI Analyzer Insight</p>
                                <p className="text-sm text-muted-foreground mt-1">Your strongest average category is {strongestCategory.label}. Use the analyzer to find the next fix that can lift the total score.</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-bold ${getScoreClass(strongestCategory.value)}`}>{strongestCategory.value}</p>
                                <p className="text-xs text-muted-foreground">category score</p>
                            </div>
                        </div>
                    </div>
                    <Link to="/rank-tracker" className="glass rounded-2xl p-5 hover:bg-muted/50 transition-all">
                        <p className="text-sm font-semibold text-foreground">Keyword Tracking</p>
                        <p className="text-sm text-muted-foreground mt-1">Monitor ranking movement and refresh your tracked search positions.</p>
                        <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 mt-4">
                            Open tracker <ArrowRightIcon size={14} />
                        </span>
                    </Link>
                </div>

                {/* Recent Analyses */}
                <div style={{ animationDelay: "300ms" }}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-foreground">Recent Analyses</h2>
                        {analyses.length > 0 && (
                            <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View All <ArrowRightIcon size={14} />
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-30">
                            <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center">
                            <SearchIcon size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">Enter a URL above to run your first SEO analysis.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analyses.map((a) => (
                                <AnalysesCard key={a._id} analysis={a} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
