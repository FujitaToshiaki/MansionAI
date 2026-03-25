import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Building,
  ChevronDown,
  ClipboardCheck,
  FileEdit,
  Wrench,
  MessageSquare,
  FileText,
  BookOpen,
  ScanLine,
  BarChart3,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SubItem {
  label: string;
  path: string;
}

interface AccordionGroup {
  type: "accordion";
  icon: LucideIcon;
  label: string;
  paths: string[];
  items: SubItem[];
}

interface SingleLink {
  type: "single";
  icon: LucideIcon;
  label: string;
  path: string;
}

interface Divider {
  type: "divider";
}

type NavEntry = AccordionGroup | SingleLink | Divider;

const navEntries: NavEntry[] = [
  { type: "single", icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { type: "single", icon: Building, label: "物件管理", path: "/condominiums" },
  { type: "divider" },
  {
    type: "accordion",
    icon: ClipboardCheck,
    label: "管理適正評価",
    paths: ["/evaluation/check", "/evaluation/score", "/evaluation/history"],
    items: [
      { label: "セルフチェック実施", path: "/evaluation/check" },
      { label: "スコア詳細・改善提案", path: "/evaluation/score" },
      { label: "評価履歴・推移", path: "/evaluation/history" },
    ],
  },
  {
    type: "accordion",
    icon: FileEdit,
    label: "管理規約管理",
    paths: [
      "/condominiums",
      "/standard-regulations",
      "/ai-revision",
      "/revision-years",
      "/knowledge",
    ],
    items: [
      { label: "規約改訂分析", path: "/condominiums" },
      { label: "標準管理規約", path: "/standard-regulations" },
      { label: "AI改訂案生成", path: "/ai-revision" },
      { label: "年度別改訂管理", path: "/revision-years" },
      { label: "ナレッジベース", path: "/knowledge" },
    ],
  },
  {
    type: "accordion",
    icon: Wrench,
    label: "長期修繕計画管理",
    paths: [
      "/longterm/dashboard",
      "/longterm/items",
      "/longterm/history",
      "/longterm/simulation",
      "/longterm/analysis",
    ],
    items: [
      { label: "修繕計画ダッシュボード", path: "/longterm/dashboard" },
      { label: "修繕項目一覧", path: "/longterm/items" },
      { label: "修繕履歴", path: "/longterm/history" },
      { label: "積立金シミュレーション", path: "/longterm/simulation" },
      { label: "AI見直し分析", path: "/longterm/analysis" },
    ],
  },
  {
    type: "accordion",
    icon: MessageSquare,
    label: "管理業務相談",
    paths: ["/consultation/chat", "/consultation/history"],
    items: [
      { label: "チャット相談", path: "/consultation/chat" },
      { label: "相談履歴", path: "/consultation/history" },
    ],
  },
  {
    type: "accordion",
    icon: FileText,
    label: "議事録管理",
    paths: [
      "/minutes/list",
      "/minutes/import",
      "/minutes/generate",
      "/minutes/actions",
    ],
    items: [
      { label: "議事録一覧", path: "/minutes/list" },
      { label: "音声・メモ取込", path: "/minutes/import" },
      { label: "AI議事録生成", path: "/minutes/generate" },
      { label: "決定事項管理", path: "/minutes/actions" },
    ],
  },
  {
    type: "accordion",
    icon: BookOpen,
    label: "総会議案書管理",
    paths: ["/proposals/list", "/proposals/generate", "/proposals/edit"],
    items: [
      { label: "議案書一覧", path: "/proposals/list" },
      { label: "AI議案書生成", path: "/proposals/generate" },
      { label: "議案書編集", path: "/proposals/edit" },
    ],
  },
  { type: "divider" },
  { type: "single", icon: ScanLine, label: "データ取込", path: "/data-import" },
  { type: "single", icon: BarChart3, label: "レポート", path: "/reports" },
  { type: "single", icon: Settings, label: "設定", path: "/settings" },
];

function isGroupActive(entry: AccordionGroup, location: string): boolean {
  return entry.paths.some(
    (p) => location === p || location.startsWith(p + "/")
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  function computeOpenGroups(loc: string): Record<number, boolean> {
    const open: Record<number, boolean> = {};
    navEntries.forEach((entry, idx) => {
      if (entry.type === "accordion" && isGroupActive(entry, loc)) {
        open[idx] = true;
      }
    });
    return open;
  }

  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>(() =>
    computeOpenGroups(location)
  );

  useEffect(() => {
    setOpenGroups(computeOpenGroups(location));
  }, [location]);

  function toggleGroup(idx: number) {
    setOpenGroups((prev) => {
      const isCurrentlyOpen = !!prev[idx];
      // Close all groups, then toggle the clicked one
      const next: Record<number, boolean> = {};
      if (!isCurrentlyOpen) next[idx] = true;
      return next;
    });
  }

  return (
    <div
      className="sidebar-gradient text-white flex flex-col overflow-y-auto"
      style={{ width: "280px", minHeight: "100vh" }}
    >
      <div className="flex items-center px-5 flex-shrink-0" style={{ height: "100px" }}>
        <Building className="text-white mr-3 flex-shrink-0" size={24} />
        <span className="text-white font-inter font-semibold text-base leading-tight">
          マンション管理AI
        </span>
      </div>

      <nav className="flex-1 pb-4">
        {navEntries.map((entry, idx) => {
          if (entry.type === "divider") {
            return (
              <div
                key={`divider-${idx}`}
                className="mx-4 my-2 border-t border-white border-opacity-20"
              />
            );
          }

          if (entry.type === "single") {
            const Icon = entry.icon;
            const isActive =
              location === entry.path ||
              (entry.path !== "/" && location.startsWith(entry.path + "/"));
            return (
              <div key={`single-${idx}`}>
                <Link href={entry.path}>
                  <div
                    data-testid={`nav-single-${entry.path.replace(/\//g, "-")}`}
                    className={`menu-item py-3 px-6 flex items-center cursor-pointer relative ${
                      isActive ? "menu-item-active" : ""
                    }`}
                  >
                    <Icon className="mr-3 flex-shrink-0" size={20} />
                    <span className="font-inter text-sm font-medium">{entry.label}</span>
                  </div>
                </Link>
              </div>
            );
          }

          if (entry.type === "accordion") {
            const Icon = entry.icon;
            const isOpen = !!openGroups[idx];

            return (
              <div key={`accordion-${idx}`}>
                <div
                  data-testid={`nav-accordion-${idx}`}
                  className={`menu-item py-3 px-6 flex items-center cursor-pointer relative select-none ${
                    isOpen ? "menu-item-active" : ""
                  }`}
                  onClick={() => toggleGroup(idx)}
                >
                  <Icon className="mr-3 flex-shrink-0" size={20} />
                  <span className="font-inter text-sm font-medium flex-1">{entry.label}</span>
                  <ChevronDown
                    size={16}
                    className="flex-shrink-0 opacity-70"
                    style={{
                      transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
                <div
                  style={{
                    maxHeight: isOpen ? "500px" : "0",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {entry.items.map((sub) => {
                    const isSubActive =
                      location === sub.path ||
                      (sub.path !== "/" && location.startsWith(sub.path + "/"));
                    return (
                      <Link href={sub.path} key={sub.path}>
                        <div
                          data-testid={`nav-sub-${sub.path.replace(/\//g, "-")}`}
                          className={`submenu-item py-2 pl-14 pr-4 cursor-pointer text-sm font-inter ${
                            isSubActive ? "submenu-item-active" : ""
                          }`}
                        >
                          {sub.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </nav>
    </div>
  );
}
