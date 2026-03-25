import { Search, Bell, ChevronDown, User, Building, ChevronRight,
  FileText, AlertTriangle, BarChart3, FileOutput, Upload, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation, useSearch, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Path → { parent, title } lookup                                     */
/* ------------------------------------------------------------------ */
interface NavInfo { parent: string | null; title: string; }

const EXACT_MAP: Record<string, NavInfo> = {
  "/":                          { parent: null,               title: "ダッシュボード" },
  "/condominiums":              { parent: null,               title: "物件管理" },
  "/data-import":               { parent: null,               title: "データ取込" },
  "/reports":                   { parent: null,               title: "レポート" },
  "/settings":                  { parent: null,               title: "設定" },
  "/ai-agent-history":          { parent: null,               title: "AI実行履歴" },
  "/standard-regulations":      { parent: "管理規約管理",     title: "標準管理規約" },
  "/revision-years":            { parent: "管理規約管理",     title: "年度別改訂管理" },
  "/ai-revision":               { parent: "管理規約管理",     title: "AI改訂案生成" },
  "/knowledge":                 { parent: "管理規約管理",     title: "ナレッジベース" },
  "/evaluation/check":          { parent: "管理適正評価",     title: "セルフチェック実施" },
  "/evaluation/score":          { parent: "管理適正評価",     title: "スコア詳細・改善提案" },
  "/evaluation/history":        { parent: "管理適正評価",     title: "評価履歴・推移" },
  "/longterm/dashboard":        { parent: "長期修繕計画管理", title: "修繕計画ダッシュボード" },
  "/longterm/items":            { parent: "長期修繕計画管理", title: "修繕項目一覧" },
  "/longterm/history":          { parent: "長期修繕計画管理", title: "修繕履歴" },
  "/longterm/simulation":       { parent: "長期修繕計画管理", title: "積立金シミュレーション" },
  "/longterm/analysis":         { parent: "長期修繕計画管理", title: "AI見直し分析" },
  "/consultation/chat":         { parent: "管理業務相談",     title: "チャット相談" },
  "/consultation/history":      { parent: "管理業務相談",     title: "相談履歴" },
  "/minutes/list":              { parent: "議事録管理",       title: "議事録一覧" },
  "/minutes/import":            { parent: "議事録管理",       title: "音声・メモ取込" },
  "/minutes/generate":          { parent: "議事録管理",       title: "AI議事録生成" },
  "/minutes/actions":           { parent: "議事録管理",       title: "決定事項管理" },
  "/proposals/list":            { parent: "総会議案書管理",   title: "議案書一覧" },
  "/proposals/generate":        { parent: "総会議案書管理",   title: "AI議案書生成" },
  "/proposals/edit":            { parent: "総会議案書管理",   title: "議案書編集" },
};

const CONDO_SUFFIX_MAP: Record<string, NavInfo> = {
  "issues":              { parent: "物件管理",     title: "問合せ管理" },
  "upload":              { parent: "物件管理",     title: "ドキュメントアップロード" },
  "ocr":                 { parent: "物件管理",     title: "データ取込" },
  "decisions":           { parent: "物件管理",     title: "決議抽出" },
  "regulation-analysis": { parent: "管理規約管理", title: "規約改訂分析" },
  "analysis":            { parent: "管理規約管理", title: "規約改訂分析" },
  "ai-revision":         { parent: "管理規約管理", title: "AI改訂案生成" },
  "knowledge":           { parent: "管理規約管理", title: "ナレッジベース" },
  "wiki":                { parent: "管理規約管理", title: "規約Wiki" },
  "ai-agent-history":    { parent: null,            title: "AI実行履歴" },
};

function getNavInfo(location: string): NavInfo {
  if (EXACT_MAP[location]) return EXACT_MAP[location];
  const condoSuffix = location.match(/^\/condominiums\/[^/]+\/([^/]+)/);
  if (condoSuffix) return CONDO_SUFFIX_MAP[condoSuffix[1]] ?? { parent: "物件管理", title: "物件詳細" };
  if (location.match(/^\/condominiums\/[^/]+$/)) return { parent: "物件管理", title: "物件詳細" };
  if (location.startsWith("/standard-regulations/")) return { parent: "管理規約管理", title: "標準管理規約" };
  if (location.startsWith("/revision-years/"))       return { parent: "管理規約管理", title: "年度別改訂管理" };
  if (location.startsWith("/ai-agent-history/"))     return { parent: null, title: "AI実行履歴" };
  return { parent: null, title: "ダッシュボード" };
}

/* ------------------------------------------------------------------ */
/*  Extract condominiumId from URL                                       */
/* ------------------------------------------------------------------ */
function extractCondominiumId(location: string, search: string): string | null {
  const qs = new URLSearchParams(search);
  const fromQuery = qs.get("condominiumId");
  if (fromQuery) return fromQuery;
  const match = location.match(/^\/condominiums\/([^/]+)/);
  return match ? match[1] : null;
}

/* ------------------------------------------------------------------ */
/*  Feature buttons shown when a condominium is selected                */
/* ------------------------------------------------------------------ */
interface FeatureBtn {
  label: string;
  icon: LucideIcon;
  href: (id: string) => string;
  /** paths that count as "active" for this button */
  activePatterns: Array<(loc: string) => boolean>;
}

const FEATURE_BUTTONS: FeatureBtn[] = [
  {
    label: "問合せ管理",
    icon: AlertTriangle,
    href: (id) => `/condominiums/${id}/issues`,
    activePatterns: [(loc) => /^\/condominiums\/[^/]+\/issues/.test(loc)],
  },
  {
    label: "議案管理",
    icon: BookOpen,
    href: (id) => `/proposals/list?condominiumId=${id}`,
    activePatterns: [(loc) => loc.startsWith("/proposals")],
  },
  {
    label: "議事録管理",
    icon: FileOutput,
    href: (id) => `/minutes/list?condominiumId=${id}`,
    activePatterns: [(loc) => loc.startsWith("/minutes")],
  },
  {
    label: "長期修繕計画管理",
    icon: BarChart3,
    href: (id) => `/longterm/dashboard?condominiumId=${id}`,
    activePatterns: [(loc) => loc.startsWith("/longterm")],
  },
  {
    label: "規約改訂",
    icon: FileText,
    href: (id) => `/condominiums/${id}/analysis`,
    activePatterns: [
      (loc) => /^\/condominiums\/[^/]+\/(analysis|regulation-analysis|ai-revision|knowledge|wiki)/.test(loc),
      (loc) => ["/ai-revision", "/knowledge", "/standard-regulations", "/revision-years"].some(p => loc === p || loc.startsWith(p + "/")),
    ],
  },
  {
    label: "管理適正評価",
    icon: Upload,
    href: (id) => `/evaluation/check?condominiumId=${id}`,
    activePatterns: [(loc) => loc.startsWith("/evaluation")],
  },
];

function isFeatureActive(btn: FeatureBtn, location: string): boolean {
  return btn.activePatterns.some((fn) => fn(location));
}

/* ------------------------------------------------------------------ */
/*  Header component                                                     */
/* ------------------------------------------------------------------ */
export default function Header() {
  const [location] = useLocation();
  const search = useSearch();

  const { parent, title } = getNavInfo(location);
  const condominiumId = extractCondominiumId(location, search);

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const showFeatureBar = !!condominiumId;

  return (
    <header className={`bg-white border-b border-gray-200 flex flex-col ${showFeatureBar ? "" : ""}`}>
      {/* ── Row 1: title + condominium chip + right tools ── */}
      <div className="h-14 flex items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {parent && (
              <>
                <span className="text-sm text-gray-400 font-medium whitespace-nowrap hidden sm:block">
                  {parent}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 hidden sm:block" />
              </>
            )}
            <h1 className="text-base font-semibold text-gray-900 whitespace-nowrap truncate">
              {title}
            </h1>
          </div>

          {condominiumId && (
            <>
              <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 flex-shrink-0">
                <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-medium text-orange-700 whitespace-nowrap max-w-[180px] truncate">
                  {condominium?.name ?? "…"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <Input
              type="text"
              placeholder="検索..."
              className="bg-gray-100 border-0 rounded-lg px-4 py-2 pl-9 text-sm w-48"
            />
          </div>

          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="text-gray-600" size={18} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>

          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"
                alt="修繕未来"
              />
              <AvatarFallback><User size={16} /></AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">修繕 未来</span>
            <ChevronDown className="text-gray-500" size={12} />
          </div>
        </div>
      </div>

      {/* ── Row 2: feature quick-nav (only when condominium selected) ── */}
      {showFeatureBar && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto">
          {/* Back to detail link */}
          <Link href={`/condominiums/${condominiumId}`}>
            <button
              data-testid="header-btn-detail"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                location === `/condominiums/${condominiumId}` || location === `/condominiums/${condominiumId}/`
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Building size={13} />
              物件詳細
            </button>
          </Link>

          <div className="h-4 w-px bg-gray-300 flex-shrink-0 mx-0.5" />

          {FEATURE_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            const active = isFeatureActive(btn, location);
            return (
              <Link key={btn.label} href={btn.href(condominiumId)}>
                <button
                  data-testid={`header-btn-${btn.label}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={13} />
                  {btn.label}
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
