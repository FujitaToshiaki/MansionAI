import { Search, Bell, ChevronDown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <Input 
            type="text" 
            placeholder="検索..." 
            className="bg-gray-100 border-0 rounded-lg px-4 py-2 pl-10 text-sm w-64" 
          />
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="text-gray-600" size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face" alt="修繕未来" />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">修繕 未来</span>
          <ChevronDown className="text-gray-500" size={12} />
        </div>
      </div>
    </header>
  );
}
