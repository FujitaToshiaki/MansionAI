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
  Cog
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Building, label: "マンション管理", path: "/condominiums" },
  { icon: FileText, label: "規約管理", path: "/regulations" },
  { icon: ClipboardList, label: "議事録管理", path: "/minutes" },
  { icon: ScanLine, label: "OCR処理", path: "/ocr" },
  { icon: Bot, label: "AI分析", path: "/ai-analysis" },
  { icon: BarChart3, label: "レポート", path: "/reports" },
  { icon: Settings, label: "設定", path: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="sidebar-gradient text-white flex flex-col" style={{ width: "280px" }}>
      {/* Logo Area */}
      <div className="flex items-center px-5" style={{ height: "100px" }}>
        <Cog className="text-white text-xl mr-3" size={20} />
        <span className="text-white font-inter font-semibold text-lg">管理規約AI</span>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        <div className="space-y-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`menu-item py-3 px-6 flex items-center cursor-pointer relative ${
                  isActive ? 'menu-item-active' : ''
                }`}>
                  <Icon className="mr-3 text-sm" size={16} />
                  <span className="font-inter text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Upgrade Banner */}
      <div className="p-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <p className="text-sm mb-3">プレミアムプランで<br />全機能をご利用ください</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
            アップグレード
          </button>
        </div>
      </div>
    </div>
  );
}
