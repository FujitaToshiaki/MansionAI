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
  ChevronDown,
  ChevronRight,
  History
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  submenu?: Array<{
    icon: any;
    label: string;
    path: string;
  }>;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Building, label: "マンション管理", path: "/condominiums" },
  { icon: FileText, label: "標準管理規約", path: "/standard-regulations" },
  { icon: ClipboardList, label: "議事録管理", path: "/minutes" },
  { icon: ScanLine, label: "OCR処理", path: "/ocr" },
  { 
    icon: Bot, 
    label: "AI分析", 
    path: "/ai-analysis",
    submenu: [
      { icon: History, label: "AI履歴", path: "/ai-agent-history" }
    ]
  },
  { icon: BarChart3, label: "レポート", path: "/reports" },
  { icon: Settings, label: "設定", path: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (itemPath: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemPath) 
        ? prev.filter(path => path !== itemPath)
        : [...prev, itemPath]
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
            const isActive = location === item.path || (item.path === "/standard-regulations" && location.startsWith("/standard-regulations"));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.path);
            
            return (
              <div key={item.path}>
                {hasSubmenu ? (
                  <div>
                    <div 
                      className={`menu-item py-3 px-6 flex items-center justify-between cursor-pointer relative ${
                        isActive ? 'menu-item-active' : ''
                      }`}
                      onClick={() => toggleSubmenu(item.path)}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 text-sm" size={16} />
                        <span className="font-inter text-sm font-medium">{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="text-sm transition-transform duration-200" size={14} />
                      ) : (
                        <ChevronRight className="text-sm transition-transform duration-200" size={14} />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="submenu-items animate-slideDown">
                        {item.submenu.map((subitem) => {
                          const SubIcon = subitem.icon;
                          const isSubActive = location.includes(subitem.path);
                          return (
                            <Link href={subitem.path} key={subitem.path}>
                              <div className={`submenu-item py-2 px-12 flex items-center cursor-pointer relative transition-all duration-200 ${
                                isSubActive ? 'submenu-item-active' : ''
                              }`}>
                                <SubIcon className="mr-3 text-sm" size={14} />
                                <span className="font-inter text-sm">{subitem.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.path}>
                    <div className={`menu-item py-3 px-6 flex items-center cursor-pointer relative ${
                      isActive ? 'menu-item-active' : ''
                    }`}>
                      <Icon className="mr-3 text-sm" size={16} />
                      <span className="font-inter text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
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
