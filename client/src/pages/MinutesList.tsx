import { useState } from "react";
import { useSearch, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, ChevronRight, Filter, Mic, Sparkles, CheckSquare } from "lucide-react";
import { SubNav } from "@/components/SubNav";

const mockMinutes = [
  {
    id: "1",
    type: "理事会",
    date: "2025-03-15",
    title: "第12回理事会議事録",
    decisionsCount: 3,
    status: "完了",
  },
  {
    id: "2",
    type: "総会",
    date: "2024-08-20",
    title: "第41回定期総会（通常総会）議事録",
    decisionsCount: 8,
    status: "完了",
  },
  {
    id: "3",
    type: "理事会",
    date: "2025-02-10",
    title: "第11回理事会議事録",
    decisionsCount: 2,
    status: "完了",
  },
  {
    id: "4",
    type: "委員会",
    date: "2025-01-25",
    title: "修繕委員会 第5回会合議事録",
    decisionsCount: 4,
    status: "完了",
  },
  {
    id: "5",
    type: "理事会",
    date: "2025-01-12",
    title: "第10回理事会議事録",
    decisionsCount: 1,
    status: "完了",
  },
  {
    id: "6",
    type: "臨時総会",
    date: "2024-11-30",
    title: "臨時総会（大規模修繕承認）議事録",
    decisionsCount: 2,
    status: "完了",
  },
  {
    id: "7",
    type: "委員会",
    date: "2024-11-15",
    title: "修繕委員会 第4回会合議事録",
    decisionsCount: 5,
    status: "完了",
  },
  {
    id: "8",
    type: "理事会",
    date: "2024-10-20",
    title: "第9回理事会議事録",
    decisionsCount: 3,
    status: "完了",
  },
  {
    id: "9",
    type: "理事会",
    date: "2024-09-14",
    title: "第8回理事会議事録",
    decisionsCount: 2,
    status: "完了",
  },
  {
    id: "10",
    type: "委員会",
    date: "2024-08-03",
    title: "修繕委員会 第3回会合議事録",
    decisionsCount: 3,
    status: "完了",
  },
  {
    id: "11",
    type: "臨時総会",
    date: "2024-06-22",
    title: "臨時総会（管理会社変更）議事録",
    decisionsCount: 1,
    status: "完了",
  },
  {
    id: "12",
    type: "理事会",
    date: "2024-05-18",
    title: "第7回理事会議事録",
    decisionsCount: 4,
    status: "完了",
  },
  {
    id: "13",
    type: "総会",
    date: "2023-08-26",
    title: "第40回定期総会（通常総会）議事録",
    decisionsCount: 7,
    status: "完了",
  },
  {
    id: "14",
    type: "委員会",
    date: "2024-03-09",
    title: "修繕委員会 第2回会合議事録",
    decisionsCount: 2,
    status: "完了",
  },
  {
    id: "15",
    type: "理事会",
    date: "2024-02-17",
    title: "第6回理事会議事録",
    decisionsCount: 3,
    status: "完了",
  },
  {
    id: "16",
    type: "委員会",
    date: "2024-01-13",
    title: "修繕委員会 第1回会合議事録",
    decisionsCount: 2,
    status: "完了",
  },
];

export default function MinutesList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const condominiumId = params.get("condominiumId") ?? "";
  const [, navigate] = useLocation();
  const [filterType, setFilterType] = useState("all");

  const { data: condominium } = useQuery<any>({
    queryKey: ["/api/condominiums", condominiumId],
    enabled: !!condominiumId,
  });

  const filteredMinutes = filterType === "all"
    ? mockMinutes
    : mockMinutes.filter((m) => m.type === filterType || (filterType === "総会" && (m.type === "総会" || m.type === "臨時総会")));

  const handleCardClick = (minuteId: string) => {
    navigate(`/condominiums/${condominiumId}/minutes/${minuteId}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{">"}</span>
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700">
          {condominium?.name ?? "マンション詳細"}
        </Link>
        <span className="mx-2">{">"}</span>
        <span>議事録管理</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">議事録一覧</h1>
        <SubNav items={[
          { label: "議事録一覧", path: `/minutes/list?condominiumId=${condominiumId}`, icon: FileText },
          { label: "音声・メモ取込", path: `/minutes/import?condominiumId=${condominiumId}`, icon: Mic },
          { label: "AI議事録生成", path: `/minutes/generate?condominiumId=${condominiumId}`, icon: Sparkles },
          { label: "決定事項管理", path: `/minutes/actions?condominiumId=${condominiumId}`, icon: CheckSquare },
        ]} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">
            フィルタ
            <span className="ml-2 text-sm font-normal text-gray-500">
              （{filteredMinutes.length}件）
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-44" data-testid="select-meeting-type">
                <SelectValue placeholder="会議種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="理事会">理事会</SelectItem>
                <SelectItem value="総会">総会・臨時総会</SelectItem>
                <SelectItem value="委員会">修繕委員会</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMinutes.map((minute) => (
              <Card
                key={minute.id}
                className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                data-testid={`card-minute-${minute.id}`}
                onClick={() => handleCardClick(minute.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-white">
                            {minute.type}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {minute.date}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mt-1">
                          {minute.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          決定事項: {minute.decisionsCount}件
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
