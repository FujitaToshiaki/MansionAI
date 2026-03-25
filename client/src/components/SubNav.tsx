import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface SubNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SubNavProps {
  items: SubNavItem[];
}

export function SubNav({ items }: SubNavProps) {
  const [location] = useLocation();

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => {
        const basePath = item.path.split("?")[0];
        const isActive = location.startsWith(basePath);
        const Icon = item.icon;
        return (
          <Link href={item.path} key={item.label}>
            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
