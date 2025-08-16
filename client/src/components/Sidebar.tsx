import { useLocation } from "wouter";
import { Link } from "wouter";
import { useState } from "react";
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
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Building, label: "マンション管理", path: "/condominiums" },
  { icon: FileText, label: "標準管理規約", path: "/standard-regulations" },
  { icon: ClipboardList, label: "議事録管理", path: "/minutes" },
  { icon: ScanLine, label: "OCR処理", path: "/ocr" },
  { icon: Bot, label: "AI分析", path: "/ai-analysis", subItems: [{ label: "実行履歴", path: "/ai-agent-history" }] },
  { icon: BarChart3, label: "レポート", path: "/reports" },
  { icon: Settings, label: "設定", path: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

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
            const isActive = location === item.path || (item.path === "/standard-regulations" && location.startsWith("/standard-regulations")) || (item.subItems && item.subItems.some(sub => location === sub.path));
            const isExpanded = expandedItems.includes(item.path);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <div key={item.path}>
                <div 
                  className={`menu-item py-3 px-6 flex items-center cursor-pointer relative ${
                    isActive ? 'menu-item-active' : ''
                  }`}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.path);
                    }
                  }}
                >
                  {!hasSubItems ? (
                    <Link href={item.path} className="flex items-center w-full">
                      <Icon className="mr-3 text-sm" size={16} />
                      <span className="font-inter text-sm font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <>
                      <Icon className="mr-3 text-sm" size={16} />
                      <span className="font-inter text-sm font-medium flex-1">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown size={14} className="ml-auto" />
                      ) : (
                        <ChevronRight size={14} className="ml-auto" />
                      )}
                    </>
                  )}
                </div>
                
                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="bg-black bg-opacity-20">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = location === subItem.path;
                      return (
                        <Link key={subItem.path} href={subItem.path}>
                          <div className={`py-2 px-12 flex items-center cursor-pointer text-sm ${
                            isSubActive ? 'bg-white bg-opacity-10 text-white' : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5'
                          }`}>
                            <span className="font-inter text-sm">{subItem.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
