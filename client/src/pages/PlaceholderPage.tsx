import { LucideIcon, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  icon?: LucideIcon;
}

export default function PlaceholderPage({ title, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      {Icon ? (
        <Icon size={64} className="text-gray-300 mb-6" />
      ) : (
        <Construction size={64} className="text-gray-300 mb-6" />
      )}
      <h1 className="text-2xl font-semibold text-gray-700 mb-3">{title}</h1>
      <p className="text-gray-500 text-base max-w-md">
        この機能は現在開発中です。近日公開予定ですので、しばらくお待ちください。
      </p>
    </div>
  );
}
