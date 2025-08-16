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
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
  { icon: Building, label: "マンション管理", path: "/condominiums" },
  { 
    icon: FileText, 
    label: "規約管理", 
    path: "/regulations",
    hasSubmenu: true,
    submenu: [
      { label: "標準規約改訂版管理", path: "/standard-regulations" },
      { label: "規約一覧", path: "/regulations" }
    ]
  },
  { icon: ClipboardList, label: "議事録管理", path: "/minutes" },
  { icon: ScanLine, label: "OCR処理", path: "/ocr" },
  { icon: Bot, label: "AI分析", path: "/ai-analysis" },
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

  const isSubmenuActive = (submenu: any[]) => {
    return submenu.some(subItem => location === subItem.path);
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
            const isActive = location === item.path;
            const isExpanded = expandedMenus.includes(item.path);
            const hasActiveSubmenu = item.submenu && isSubmenuActive(item.submenu);
            
            return (
              <div key={item.path}>
                {item.hasSubmenu ? (
                  <>
                    <div 
                      className={`menu-item py-3 px-6 flex items-center justify-between cursor-pointer relative ${
                        isActive || hasActiveSubmenu ? 'menu-item-active' : ''
                      }`}
                      onClick={() => toggleSubmenu(item.path)}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 text-sm" size={16} />
                        <span className="font-inter text-sm font-medium">{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </div>
                    {isExpanded && item.submenu && (
                      <div className="bg-black bg-opacity-20">
                        {item.submenu.map((subItem) => (
                          <Link key={subItem.path} href={subItem.path}>
                            <div className={`menu-item py-2 px-12 flex items-center cursor-pointer relative ${
                              location === subItem.path ? 'menu-item-active' : ''
                            }`}>
                              <span className="font-inter text-sm font-medium">{subItem.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
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
