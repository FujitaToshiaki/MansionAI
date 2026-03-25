import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ClipboardCheck, 
  ChevronRight, 
  Info, 
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  History
} from "lucide-react";
import { SubNav } from "@/components/SubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MOCK_CATEGORIES = [
  {
    id: "finance",
    name: "管理組合会計・地方公共団体等との連携",
    score: 40,
    items: [
      { id: "f1", name: "収支報告の適正性", points: 10, hint: "予算・決算の承認状況" },
      { id: "f2", name: "滞納管理の状況", points: 10, hint: "管理費等の滞納月数・件数" },
      { id: "f3", name: "修繕積立金の積立状況", points: 10, hint: "計画に対する充足度" },
      { id: "f4", name: "会計監査の実施", points: 10, hint: "監事による監査状況" },
    ]
  },
  {
    id: "organization",
    name: "管理組合の運営体制",
    score: 20,
    items: [
      { id: "o1", name: "理事会の開催頻度", points: 5, hint: "年間の開催回数" },
      { id: "o2", name: "総会の開催状況", points: 5, hint: "定期総会の開催時期" },
      { id: "o3", name: "管理者等の選任", points: 5, hint: "理事・監事の選任状況" },
      { id: "o4", name: "名簿の備付け・更新", points: 5, hint: "組合員名簿の整備" },
    ]
  },
  {
    id: "building",
    name: "管理規約・共用部分の管理状態",
    score: 20,
    items: [
      { id: "b1", name: "管理規約の整備", points: 5, hint: "最新の標準管理規約への準拠" },
      { id: "b2", name: "長期修繕計画の作成", points: 5, hint: "計画の期間・更新頻度" },
      { id: "b3", name: "法定点検の実施", points: 5, hint: "エレベーター・消防設備等" },
      { id: "b4", name: "図書の保管状況", points: 5, hint: "設計図書・修繕履歴" },
    ]
  },
  {
    id: "earthquake",
    name: "耐震性",
    score: 10,
    items: [
      { id: "e1", name: "耐震診断の実施", points: 5, hint: "耐震基準への適合性確認" },
      { id: "e2", name: "耐震補強の計画", points: 5, hint: "必要に応じた補強実施" },
    ]
  },
  {
    id: "living",
    name: "居住環境・防犯",
    score: 10,
    items: [
      { id: "l1", name: "防犯対策の実施", points: 5, hint: "防犯カメラ・照明の整備" },
      { id: "l2", name: "防災対策の実施", points: 5, hint: "備蓄品・防災訓練の状況" },
    ]
  }
];

export default function EvaluationCheck() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";

  const { data: condominium } = useQuery<any>({
    queryKey: ['/api/condominiums', condominiumId],
    enabled: !!condominiumId,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name ?? "マンション詳細"}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">管理適正評価セルフチェック</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理適正評価</h1>
        <SubNav items={[
          { label: "セルフチェック実施", path: `/evaluation/check?condominiumId=${condominiumId}`, icon: ClipboardCheck },
          { label: "スコア詳細・改善提案", path: `/evaluation/score?condominiumId=${condominiumId}`, icon: BarChart2 },
          { label: "評価履歴・推移", path: `/evaluation/history?condominiumId=${condominiumId}`, icon: History },
        ]} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Checklists */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-orange-600" />
                評価項目チェック
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {MOCK_CATEGORIES.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-lg">{category.name}</span>
                        <Badge variant="secondary">{category.score}点分</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                      {category.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b pb-4 last:border-0">
                          <div className="md:col-span-6 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0">
                                      <Info className="h-3 w-3 text-gray-400" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{item.hint}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {Math.random() > 0.5 && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-200 bg-blue-50 text-blue-700 flex items-center gap-1">
                                  <RefreshCw className="w-2 h-2" />
                                  自動入力済
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">配点: {item.points}点</p>
                          </div>
                          <div className="md:col-span-6">
                            <Select defaultValue="unselected">
                              <SelectTrigger className="w-full" data-testid={`select-item-${item.id}`}>
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unselected">未選択</SelectItem>
                                <SelectItem value="full">基準を全て満たしている ({item.points}点)</SelectItem>
                                <SelectItem value="partial">一部基準を満たしている ({Math.floor(item.points / 2)}点)</SelectItem>
                                <SelectItem value="none">基準を満たしていない (0点)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Score Preview */}
        <div className="w-full md:w-80 space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">現在の推定スコア</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="text-5xl font-bold text-orange-600">72</div>
                <div className="text-sm text-gray-500 absolute -bottom-6">/ 100点</div>
              </div>
              
              <div className="flex justify-center gap-1 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
                <Star className="w-6 h-6 text-gray-300" />
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span>収支・会計</span>
                  <span className="font-medium">32/40</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '80%' }}></div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>運営体制</span>
                  <span className="font-medium">15/20</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>建築・維持</span>
                  <span className="font-medium">12/20</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              <Link href={`/evaluation/score?condominiumId=${condominiumId}`}>
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" data-testid="button-save-evaluation">
                  結果を保存してスコア詳細へ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
                <CheckCircle2 className="w-4 h-4" />
                評価のメリット
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-2 text-orange-700">
                <li>• マンション管理適正評価制度への申請</li>
                <li>• 共用部分火災保険料の割引（基準達成時）</li>
                <li>• 住宅金融支援機構の融資利息引下げ</li>
                <li>• 資産価値の維持・向上への寄与</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
