import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, Wrench, Shield, Megaphone, Leaf } from "lucide-react";
import { Link } from "wouter";

const MEMBERS_DEMO = [
  { room: "101", name: "田中 一郎", area: "68.5", votingRatio: "3.2%", email: "tanaka@example.com", note: "" },
  { room: "102", name: "鈴木 花子", area: "72.0", votingRatio: "3.4%", email: "suzuki@example.com", note: "理事長" },
  { room: "201", name: "佐藤 次郎", area: "65.0", votingRatio: "3.1%", email: "sato@example.com", note: "" },
  { room: "202", name: "山田 美咲", area: "80.3", votingRatio: "3.8%", email: "yamada@example.com", note: "副理事長" },
  { room: "301", name: "伊藤 健一", area: "68.5", votingRatio: "3.2%", email: "ito@example.com", note: "" },
  { room: "302", name: "渡辺 由美", area: "72.0", votingRatio: "3.4%", email: "watanabe@example.com", note: "" },
  { room: "401", name: "中村 大介", area: "65.0", votingRatio: "3.1%", email: "nakamura@example.com", note: "会計担当" },
  { room: "402", name: "小林 さくら", area: "80.3", votingRatio: "3.8%", email: "kobayashi@example.com", note: "" },
  { room: "501", name: "加藤 誠", area: "68.5", votingRatio: "3.2%", email: "kato@example.com", note: "" },
  { room: "502", name: "吉田 真理子", area: "72.0", votingRatio: "3.4%", email: "yoshida@example.com", note: "" },
  { room: "601", name: "山本 拓也", area: "95.0", votingRatio: "4.5%", email: "yamamoto@example.com", note: "監事" },
  { room: "602", name: "松本 春香", area: "65.0", votingRatio: "3.1%", email: "matsumoto@example.com", note: "" },
  { room: "701", name: "井上 浩", area: "68.5", votingRatio: "3.2%", email: "inoue@example.com", note: "" },
  { room: "702", name: "木村 めぐみ", area: "72.0", votingRatio: "3.4%", email: "kimura@example.com", note: "" },
  { room: "801", name: "林 隆司", area: "80.3", votingRatio: "3.8%", email: "hayashi@example.com", note: "" },
];

const COMMITTEES_DEMO = [
  {
    id: 1,
    name: "修繕委員会",
    icon: Wrench,
    leader: "山田 美咲",
    members: 5,
    activities: "長期修繕計画の見直し、外壁塗装工事の調査・入札管理、大規模修繕工事の準備",
    nextMeeting: "2026年4月10日（金）19:00",
    color: "text-gray-700",
    bgColor: "bg-white border-gray-200",
  },
  {
    id: 2,
    name: "防災委員会",
    icon: Shield,
    leader: "鈴木 花子",
    members: 4,
    activities: "年1回の防災訓練企画・運営、防災用品の点検・補充、避難経路の確認および掲示更新",
    nextMeeting: "2026年4月18日（土）10:00",
    color: "text-gray-700",
    bgColor: "bg-white border-gray-200",
  },
  {
    id: 3,
    name: "広報委員会",
    icon: Megaphone,
    leader: "伊藤 健一",
    members: 3,
    activities: "月次管理組合だよりの作成・配布、掲示板管理、総会資料の作成サポート",
    nextMeeting: "2026年4月22日（水）19:30",
    color: "text-gray-700",
    bgColor: "bg-white border-gray-200",
  },
  {
    id: 4,
    name: "環境美化委員会",
    icon: Leaf,
    leader: "小林 さくら",
    members: 6,
    activities: "共用部清掃スケジュール管理、植栽の手入れ・季節の花植え、ゴミ置き場の美化活動",
    nextMeeting: "2026年5月3日（日）9:00",
    color: "text-gray-700",
    bgColor: "bg-white border-gray-200",
  },
];

const SPECIAL_NOTES = [
  {
    category: "管理上の注意事項",
    items: [
      "駐車場の不正使用が継続的に報告されているため、月1回の巡回確認を実施中。来訪者用スペースの長時間占有には警告ステッカーを貼付。",
      "ペット飼育に関するトラブルが複数件発生。管理規約第○条に基づき、飼育登録未届出の世帯には書面で通知済み（2025年12月）。",
      "エレベーター保守点検は毎月第2火曜日に実施。点検日の9:00〜11:00はエレベーター1基が停止するため、事前掲示を徹底すること。",
    ],
  },
  {
    category: "工事・修繕履歴",
    items: [
      "【2025年9月】屋上防水工事完了。防水シートの全面貼り替えを実施。費用：約850万円（長期修繕積立金より支出）。",
      "【2025年3月】駐輪場増設工事完了。既存62台→82台に拡張。あわせて防犯カメラ2台を増設。",
      "【2024年11月】外壁タイル補修工事（部分補修）。3階南面および7階北面の浮きタイルを補修。費用：約120万円。",
      "【2024年6月】管理室エアコン更新。旧機器（設置から16年）を省エネ型に交換。次回大規模修繕は2027年度を予定。",
    ],
  },
  {
    category: "行政指導・届出",
    items: [
      "【2025年4月】建築基準法に基づく定期調査報告書を区役所へ提出済み。次回提出期限：2028年3月末。",
      "【2024年10月】消防設備点検結果報告書を消防署へ届出。スプリンクラー配管の一部に劣化が認められ、2026年度内の補修を推奨されている。",
    ],
  },
  {
    category: "その他",
    items: [
      "2026年度総会にて管理会社との委託契約更新を審議予定。現行の委託費は前年比2.5%増の見込みで複数社との比較検討を進めている。",
      "近隣の再開発計画（B地区）により、2027年以降は工事騒音・振動への対応が必要になる可能性あり。行政からの情報収集を継続中。",
    ],
  },
];

export default function CondominiumDetail() {
  console.log("CondominiumDetail component is rendering");
  const { id } = useParams();

  const { data: condominium, isLoading } = useQuery<any>({
    queryKey: ['/api/condominiums', id],
  });

  const { data: documents } = useQuery<any[]>({
    queryKey: ['/api/condominiums', id, 'documents'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!condominium) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">マンション情報が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <span>{condominium.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&w=80&h=80&fit=crop"
              alt={condominium.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{condominium.name}</h1>
              <p className="text-gray-600 mt-1">{condominium.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                築{new Date().getFullYear() - condominium.buildYear}年 / {condominium.units}戸 /
                管理開始：{new Date(condominium.managementStartDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">管理組合理事長</p>
                <p className="text-lg font-semibold text-gray-900">修繕 未来様</p>
                <p className="text-sm text-gray-500">連絡先: xxx-xxx-xxxx</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">次回会議・総会</p>
                <div className="flex justify-center items-center gap-6 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">前回</p>
                    <p className="text-sm font-semibold text-gray-900">2025年3月</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">次回</p>
                    <p className="text-sm font-semibold text-gray-900">2025年8月</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">法改正対応状況</p>
                <Badge variant={
                  condominium.lawRevisionStatus === 'completed' ? 'default' :
                  condominium.lawRevisionStatus === 'in_progress' ? 'secondary' :
                  'destructive'
                }>
                  {condominium.lawRevisionStatus === 'completed' ? '完了' :
                   condominium.lawRevisionStatus === 'in_progress' ? '進行中' : '未着手'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">期限: 2025年3月</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">最近の活動</p>
                <p className="text-lg font-semibold text-gray-900">
                  {condominium.lastActivity ? new Date(condominium.lastActivity).toLocaleDateString('ja-JP') : '未記録'}
                </p>
                <p className="text-sm text-gray-500">議事録更新</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="members">組合員リスト</TabsTrigger>
          <TabsTrigger value="committees">各種専門部会</TabsTrigger>
          <TabsTrigger value="notes">特記事項</TabsTrigger>
          <TabsTrigger value="files">その他ファイル</TabsTrigger>
        </TabsList>

        {/* 基本情報 */}
        <TabsContent value="basic">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">マンション名</label>
                  <p className="text-gray-900">{condominium.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">所在地</label>
                  <p className="text-gray-900">{condominium.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">総戸数</label>
                  <p className="text-gray-900">{condominium.units}戸</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">築年数</label>
                  <p className="text-gray-900">築{new Date().getFullYear() - condominium.buildYear}年（{condominium.buildYear}年建築）</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">管理開始日</label>
                  <p className="text-gray-900">{new Date(condominium.managementStartDate).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">現行規約版数</label>
                  <p className="text-gray-900">第{condominium.currentRegulationVersion}版</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 組合員リスト */}
        <TabsContent value="members">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                組合員リスト
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium text-gray-700 w-16">部屋番号</th>
                      <th className="text-left p-3 font-medium text-gray-700 w-28">氏名</th>
                      <th className="text-left p-3 font-medium text-gray-700 w-24">専有面積（㎡）</th>
                      <th className="text-left p-3 font-medium text-gray-700 w-24">議決権割合</th>
                      <th className="text-left p-3 font-medium text-gray-700">メールアドレス</th>
                      <th className="text-left p-3 font-medium text-gray-700 w-28">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS_DEMO.map((member) => (
                      <tr key={member.room} className="border-b hover:bg-gray-50" data-testid={`row-member-${member.room}`}>
                        <td className="p-3 text-gray-900 font-medium">{member.room}</td>
                        <td className="p-3 text-gray-900">{member.name}</td>
                        <td className="p-3 text-gray-700 text-right pr-6">{member.area}</td>
                        <td className="p-3 text-gray-700 text-right pr-6">{member.votingRatio}</td>
                        <td className="p-3 text-gray-600">{member.email}</td>
                        <td className="p-3">
                          {member.note ? (
                            <Badge variant="secondary" className="text-xs">{member.note}</Badge>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-400">※ 表示データはデモ用サンプルです</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 各種専門部会 */}
        <TabsContent value="committees">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>各種専門部会</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMITTEES_DEMO.map((committee) => {
                  const Icon = committee.icon;
                  return (
                    <div key={committee.id} className={`rounded-lg border p-5 ${committee.bgColor}`} data-testid={`card-committee-${committee.id}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={20} className={committee.color} />
                        <h3 className={`font-semibold text-base ${committee.color}`}>{committee.name}</h3>
                      </div>
                      <dl className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <dt className="text-gray-500 w-20 shrink-0">委員長</dt>
                          <dd className="text-gray-900 font-medium">{committee.leader}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-500 w-20 shrink-0">メンバー数</dt>
                          <dd className="text-gray-900">{committee.members}名</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-500 w-20 shrink-0">主な活動</dt>
                          <dd className="text-gray-700 leading-relaxed">{committee.activities}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-gray-500 w-20 shrink-0">次回開催</dt>
                          <dd className="text-gray-900 font-medium">{committee.nextMeeting}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-gray-400">※ 表示データはデモ用サンプルです</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 特記事項 */}
        <TabsContent value="notes">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>特記事項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {SPECIAL_NOTES.map((section) => (
                <div key={section.category} data-testid={`section-notes-${section.category}`}>
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3">{section.category}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                        <span className="text-gray-400 shrink-0 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-gray-400">※ 表示データはデモ用サンプルです</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* その他ファイル */}
        <TabsContent value="files">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>ファイル管理</CardTitle>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.fileSize && `${Math.round(doc.fileSize / 1024)}KB`} •
                            {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        ダウンロード
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>ファイルがアップロードされていません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
