import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Building, 
  FileText, 
  ClipboardList, 
  ScanLine, 
  Bot, 
  BarChart3, 
  Settings,
  Cog,
  History,
  FolderKanban
} from "lucide-react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Building, label: "マンション管理", path: "/condominiums" },
  { icon: FileText, label: "標準管理規約", path: "/standard-regulations" },
  { icon: FolderKanban, label: "改訂必要箇所一覧", path: "/revision-groups" },
  { icon: ClipboardList, label: "議事録管理", path: "/minutes" },
  { icon: ScanLine, label: "OCR処理", path: "/ocr" },
  { icon: Bot, label: "AI分析", path: "/ai-agent-history" },
  { icon: BarChart3, label: "レポート", path: "/reports" },
  { icon: Settings, label: "設定", path: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="sidebar-gradient text-white flex flex-col" style={{ width: "280px" }}>
      {/* Logo Area */}
      <div className="flex items-center px-5" style={{ height: "100px" }}>
        <Cog className="text-white text-xl mr-3" size={24} />
        <span className="text-white font-inter font-semibold text-xl">管理規約AI</span>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        <div className="space-y-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/standard-regulations" && location.startsWith("/standard-regulations")) ||
              (item.path === "/revision-groups" && location.startsWith("/revision-groups"));
            
            return (
              <div key={item.path}>
                <Link href={item.path}>
                  <div className={`menu-item py-3 px-6 flex items-center cursor-pointer relative ${
                    isActive ? 'menu-item-active' : ''
                  }`}>
                    <Icon className="mr-3" size={20} />
                    <span className="font-inter text-base font-medium">{item.label}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Upgrade Banner */}
      <div className="p-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <p className="text-base mb-3">プレミアムプランで<br />全機能をご利用ください</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-base font-medium transition-colors w-full">
            アップグレード
          </button>
        </div>
      </div>
    </div>
  );
}
