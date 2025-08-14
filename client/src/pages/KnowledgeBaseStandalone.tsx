import { Link } from "wouter";
import { KnowledgeBase } from "./KnowledgeBase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface KnowledgeBaseStandaloneProps {
  params: { id: string };
}

export default function KnowledgeBaseStandalone({ params }: KnowledgeBaseStandaloneProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center space-x-4 text-sm text-gray-500">
            <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
            <span>{'>'}</span>
            <Link href={`/condominiums/${params.id}`} className="hover:text-gray-700">コンドミニアム詳細</Link>
            <span>{'>'}</span>
            <span className="text-gray-900">ナレッジベース</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="mb-6">
          <Link href={`/condominiums/${params.id}`}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2" size={16} />
              詳細に戻る
            </Button>
          </Link>
        </div>
        
        <KnowledgeBase condominiumId={params.id} />
      </div>
    </div>
  );
}