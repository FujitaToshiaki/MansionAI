import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Star,
  BookOpen,
  Wrench,
  MessageCircle,
  FileVideo,
  ClipboardList,
  ScanLine,
  BarChart3,
  Settings,
  Cpu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SubItem {
  label: string;
  path: string;
  propertySpecific?: boolean;
}

interface DirectItem {
  type: "direct";
  icon: any;
  label: string;
  path: string;
  matchPrefixes?: string[];
}

interface SectionItem {
  type: "section";
  icon: any;
  label: string;
  subItems: SubItem[];
  matchPrefixes: string[];
}

interface DividerItem {
  type: "divider";
}

type MenuItem = DirectItem | SectionItem | DividerItem;

function buildMenu(condoId: string | null): MenuItem[] {
  const c = (path: string) => condoId ? `/condominiums/${condoId}${path}` : "/condominiums";

  return [
    {
      type: "direct",
      icon: LayoutDashboard,
      label: "ダッシュボード",
      path: "/",
      matchPrefixes: ["/"],
    },
    {
      type: "direct",
      icon: Building2,
      label: "物件管理",
      path: "/condominiums",
      matchPrefixes: ["/condominiums"],
    },
    { type: "divider" },
    {
      type: "section",
      icon: Star,
      label: "適正評価セルフチェック",
      matchPrefixes: ["/evaluation", "/condominiums/"],
      subItems: [
        { label: "セルフチェック実施", path: c("/evaluation/check"), propertySpecific: true },
        { label: "スコア詳細・改善提案", path: c("/evaluation/detail"), propertySpecific: true },
        { label: "評価履歴・推移", path: c("/evaluation/history"), propertySpecific: true },
      ],
    },
    {
      type: "section",
      icon: BookOpen,
      label: "01 規約改訂AI",
      matchPrefixes: ["/condominiums/", "/standard-regulations", "/revision-years"],
      subItems: [
        { label: "規約改訂分析", path: c("/regulation-analysis"), propertySpecific: true },
        { label: "標準管理規約", path: "/standard-regulations" },
        { label: "AI改訂案生成", path: c("/ai-revision"), propertySpecific: true },
        { label: "年度別改訂管理", path: "/revision-years" },
        { label: "ナレッジベース", path: c("/knowledge"), propertySpecific: true },
      ],
    },
    {
      type: "section",
      icon: Wrench,
      label: "02 長期修繕計画AI",
      matchPrefixes: ["/longterm", "/condominiums/"],
      subItems: [
        { label: "長計ダッシュボード", path: c("/02-longterm-plan"), propertySpecific: true },
        { label: "修繕項目一覧", path: c("/02-longterm-plan/items"), propertySpecific: true },
        { label: "積立金推移", path: c("/02-longterm-plan/fund"), propertySpecific: true },
        { label: "AI見直し分析", path: c("/02-longterm-plan/analysis"), propertySpecific: true },
        { label: "住民説明要約", path: c("/02-longterm-plan/summary"), propertySpecific: true },
      ],
    },
    {
      type: "section",
      icon: MessageCircle,
      label: "03 業務相談Bot",
      matchPrefixes: ["/03-consultation"],
      subItems: [
        { label: "チャット相談", path: "/03-consultation" },
        { label: "相談履歴", path: "/03-consultation/history" },
      ],
    },
    {
      type: "section",
      icon: FileVideo,
      label: "04 議事録作成AI",
      matchPrefixes: ["/condominiums/"],
      subItems: [
        { label: "議事録一覧", path: c("/04-minutes"), propertySpecific: true },
        { label: "音声・メモ取込", path: c("/04-minutes/upload"), propertySpecific: true },
        { label: "AI議事録生成", path: c("/04-minutes/generate"), propertySpecific: true },
        { label: "アクション管理", path: c("/04-minutes/actions"), propertySpecific: true },
      ],
    },
    {
      type: "section",
      icon: ClipboardList,
      label: "05 総会議案書AI",
      matchPrefixes: ["/condominiums/"],
      subItems: [
        { label: "議案書一覧", path: c("/05-proposal"), propertySpecific: true },
        { label: "AI議案書生成", path: c("/05-proposal/generate"), propertySpecific: true },
        { label: "議案書編集", path: c("/05-proposal/edit"), propertySpecific: true },
        { label: "PDF出力", path: c("/05-proposal/export"), propertySpecific: true },
      ],
    },
    { type: "divider" },
    {
      type: "direct",
      icon: ScanLine,
      label: "データ取込",
      path: "/data-import",
      matchPrefixes: ["/data-import"],
    },
    {
      type: "direct",
      icon: BarChart3,
      label: "レポート",
      path: "/reports",
      matchPrefixes: ["/reports"],
    },
    {
      type: "direct",
      icon: Settings,
      label: "設定",
      path: "/settings",
      matchPrefixes: ["/settings"],
    },
  ];
}

function isSectionActive(item: SectionItem, location: string): boolean {
  return item.subItems.some((s) => location === s.path || location.startsWith(s.path + "/"));
}

export default function Sidebar() {
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const condoId = location.match(/\/condominiums\/([a-f0-9-]{36})/)?.[1] ?? null;
  const menuItems = buildMenu(condoId);

  useEffect(() => {
    const nextOpen = new Set<string>();
    menuItems.forEach((item) => {
      if (item.type === "section" && isSectionActive(item, location)) {
        nextOpen.add(item.label);
      }
    });
    if (nextOpen.size > 0) {
      setOpenSections((prev) => new Set([...prev, ...nextOpen]));
    }
  }, [location]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isDirectActive = (item: DirectItem) => {
    if (item.path === "/") return location === "/";
    return location === item.path || location.startsWith(item.path + "/");
  };

  return (
    <div className="sidebar-gradient text-white flex flex-col" style={{ width: "260px", minHeight: "100vh" }}>
      {/* ロゴ */}
      <div className="flex items-center px-5 py-5 border-b border-white/10" style={{ minHeight: "72px" }}>
        <Cpu className="text-white mr-3 shrink-0" size={22} />
        <div>
          <div className="text-white font-semibold text-sm leading-tight">管理AI</div>
          <div className="text-white/70 text-xs leading-tight">プラットフォーム</div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item, idx) => {
          if (item.type === "divider") {
            return <div key={idx} className="my-2 mx-4 border-t border-white/10" />;
          }

          if (item.type === "direct") {
            const active = isDirectActive(item);
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-${item.label}`}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          }

          if (item.type === "section") {
            const Icon = item.icon;
            const isOpen = openSections.has(item.label);
            const active = isSectionActive(item, location);

            return (
              <div key={item.label}>
                <button
                  data-testid={`nav-section-${item.label}`}
                  onClick={() => toggleSection(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm font-medium ${
                    active && !isOpen
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? (
                    <ChevronDown size={14} className="shrink-0 opacity-70" />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 opacity-70" />
                  )}
                </button>

                {isOpen && (
                  <div className="bg-black/20 pb-1">
                    {item.subItems.map((sub) => {
                      const subActive = location === sub.path || location.startsWith(sub.path + "/");
                      const isCondoFallback = sub.propertySpecific && !condoId;
                      return (
                        <Link key={sub.label} href={isCondoFallback ? "/condominiums" : sub.path}>
                          <div
                            data-testid={`nav-sub-${sub.label}`}
                            className={`flex items-center gap-2 pl-10 pr-4 py-2 text-xs cursor-pointer transition-colors ${
                              subActive
                                ? "bg-white/20 text-white font-medium"
                                : isCondoFallback
                                ? "text-white/40 hover:text-white/60"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-60" />
                            <span>{sub.label}</span>
                            {isCondoFallback && (
                              <span className="text-white/30 text-xs ml-auto">物件選択</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </nav>

      {/* フッター */}
      <div className="p-3 border-t border-white/10">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/80 text-xs mb-2">プレミアムプランで<br />全機能をご利用ください</p>
          <button
            data-testid="btn-upgrade"
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors w-full"
          >
            アップグレード
          </button>
        </div>
      </div>
    </div>
  );
}
