import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Calendar, MapPin, User, FileText, CheckCircle, XCircle, MinusCircle, Users } from "lucide-react";

interface AgendaItem {
  number: number;
  title: string;
  presenter: string;
  content: string;
  result: string;
  votingResults: {
    favor: number;
    against: number;
    abstain: number;
  };
}

interface Decision {
  agenda: string;
  result: string;
  details: string;
  votingResults: {
    favor: number;
    against: number;
    abstain: number;
  };
}

interface MinuteDetailData {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  meetingType: string;
  chairman?: string;
  secretary?: string;
  attendees: number;
  proxy?: number;
  votingForm?: number;
  totalUnits: number;
  attendanceRate: number;
  quorum?: boolean;
  agenda?: AgendaItem[];
  decisions?: Decision[];
  nextMeeting?: string;
  attachments?: string[];
  summary: string;
  content: string;
  rawContent?: string;
  sourceDocument?: string;
  status?: string;
  createdAt: string;
}

const mockMinuteDetails: Record<string, MinuteDetailData> = {
  "1": {
    id: "1",
    title: "第12回理事会議事録",
    date: "2025年3月15日",
    time: "19:00-21:10",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "修繕工事の業者選定・管理費滞納対応・防犯カメラ増設について審議し、全議案を可決した。",
    content: "",
    sourceDocument: "理事会資料2025-03",
    status: "完了",
    createdAt: "2025-03-16T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "外壁補修工事業者の選定",
        presenter: "田中 一郎（理事長）",
        content: "3社から見積を取得した結果、㈱マルイチ建設が最も条件が良く、施工実績・保証内容・価格の総合評価でトップとなった。工事金額は税込み4,840,000円、工期は4月上旬〜5月末の予定。理事会として承認を求める。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "管理費滞納区画への督促対応",
        presenter: "山田 花子（副理事長）",
        content: "現在3か月以上の滞納が2戸発生している。304号室（滞納6か月・計90,000円）および512号室（滞納4か月・計60,000円）に対し、内容証明郵便による督促を実施する。次回理事会までに改善が見られない場合は弁護士相談を検討する。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "防犯カメラ増設の検討",
        presenter: "佐々木 健（防災担当理事）",
        content: "駐輪場周辺での自転車盗難が3件発生しており、住民から防犯カメラ増設の要望が複数寄せられている。設置費用の概算は一式80万円〜120万円。次回理事会までに複数業者から見積を取得し、次々回の理事会で正式決定を目指す。",
        result: "継続審議",
        votingResults: { favor: 5, against: 0, abstain: 2 },
      },
    ],
    decisions: [
      {
        agenda: "外壁補修工事業者の選定",
        result: "可決",
        details: "㈱マルイチ建設と請負契約を締結する。契約金額：税込4,840,000円。工期：2025年4月7日〜5月30日。",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        agenda: "管理費滞納区画への督促対応",
        result: "可決",
        details: "304号室・512号室へ内容証明郵便にて督促を送付する。次回理事会（4月）までに状況を再確認する。",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        agenda: "防犯カメラ増設の検討",
        result: "継続審議",
        details: "担当理事が複数業者から見積を取得し、次回理事会（4月）で継続審議とする。",
        votingResults: { favor: 5, against: 0, abstain: 2 },
      },
    ],
  },
  "2": {
    id: "2",
    title: "第41回定期総会（通常総会）議事録",
    date: "2024年8月20日",
    time: "10:00-12:45",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "通常総会",
    chairman: "田中 一郎（理事長）",
    secretary: "鈴木 誠（書記）",
    attendees: 32,
    proxy: 18,
    votingForm: 12,
    totalUnits: 68,
    attendanceRate: 91.2,
    quorum: true,
    summary: "2023年度事業報告・収支決算承認、2024年度事業計画・予算案承認、役員改選、大規模修繕積立金増額改定の全議案が可決された。",
    content: "",
    sourceDocument: "第41回定期総会議案書",
    status: "完了",
    createdAt: "2024-08-21T09:00:00Z",
    agenda: [
      {
        number: 1,
        title: "2023年度事業報告の承認",
        presenter: "田中 一郎（理事長）",
        content: "2023年度の主な事業として、共用部LED照明化工事（6月完了）、エレベーター保守契約更新（9月）、植栽剪定工事（10月・3月）を実施した。管理組合運営は適正に行われ、区分所有者への周知も十分に行った。",
        result: "可決",
        votingResults: { favor: 60, against: 0, abstain: 2 },
      },
      {
        number: 2,
        title: "2023年度収支決算の承認",
        presenter: "佐藤 明（会計担当理事）",
        content: "2023年度の管理費会計は歳入5,712,000円・歳出5,498,000円で差引剰余金214,000円。修繕積立金会計は歳入12,240,000円・歳出2,980,000円で差引残高累計68,350,000円となった。監事による監査も完了し、適正との報告を受けている。",
        result: "可決",
        votingResults: { favor: 61, against: 0, abstain: 1 },
      },
      {
        number: 3,
        title: "2024年度事業計画の承認",
        presenter: "田中 一郎（理事長）",
        content: "2024年度の重点事業として（1）駐輪場区画整備（2）防犯カメラ増設（3）長期修繕計画の見直し（4）大規模修繕工事の設計業者選定を計画している。各事業の詳細スケジュールは議案書別紙のとおり。",
        result: "可決",
        votingResults: { favor: 59, against: 1, abstain: 2 },
      },
      {
        number: 4,
        title: "2024年度収支予算の承認",
        presenter: "佐藤 明（会計担当理事）",
        content: "2024年度管理費予算：歳入5,780,000円・歳出5,720,000円（予備費60,000円）。修繕積立金予算：歳入12,240,000円・歳出5,500,000円（防犯カメラ・駐輪場整備等）。管理費・修繕積立金の月額は据え置きとする。",
        result: "可決",
        votingResults: { favor: 60, against: 2, abstain: 0 },
      },
      {
        number: 5,
        title: "役員（理事・監事）の選任",
        presenter: "田中 一郎（議長）",
        content: "任期満了に伴う役員改選を行う。候補者名簿に記載のとおり、理事7名・監事2名の合計9名を選任する。なお、理事長・副理事長・各担当理事の互選は後日理事会において行う予定。",
        result: "可決",
        votingResults: { favor: 58, against: 0, abstain: 4 },
      },
      {
        number: 6,
        title: "長期修繕計画の見直しに伴う修繕積立金の増額",
        presenter: "修繕委員会代表 中村 勝（修繕担当理事）",
        content: "長期修繕計画（第3次改定版）に基づき、大規模修繕工事の実施に備えて修繕積立金を段階的に引き上げる。2025年1月より専有面積50㎡あたり月額15,000円→18,000円（20%増）に改定する。3分の2以上の賛成が必要。",
        result: "可決",
        votingResults: { favor: 52, against: 8, abstain: 2 },
      },
      {
        number: 7,
        title: "管理委託契約の更新",
        presenter: "田中 一郎（理事長）",
        content: "現管理会社㈱アセットマネジメントリアルティとの管理委託契約を、条件変更なしで2年間更新する。委託費用：年額4,980,000円（消費税込）。",
        result: "可決",
        votingResults: { favor: 60, against: 0, abstain: 2 },
      },
      {
        number: 8,
        title: "使用細則の一部改正（自転車駐輪ルール）",
        presenter: "田中 一郎（理事長）",
        content: "近年の電動アシスト自転車・電動キックボードの普及に対応し、使用細則第10条（駐輪場の使用）を改正する。1区画1台の原則、電動キックボードの一時駐輪エリア設置、1か月以上の放置自転車の撤去手続きを明記する。",
        result: "可決",
        votingResults: { favor: 61, against: 0, abstain: 1 },
      },
    ],
    decisions: [
      { agenda: "2023年度事業報告の承認", result: "可決", details: "2023年度事業報告を承認した。", votingResults: { favor: 60, against: 0, abstain: 2 } },
      { agenda: "2023年度収支決算の承認", result: "可決", details: "2023年度収支決算（管理費・修繕積立金）を承認した。", votingResults: { favor: 61, against: 0, abstain: 1 } },
      { agenda: "2024年度事業計画の承認", result: "可決", details: "2024年度事業計画を承認した。", votingResults: { favor: 59, against: 1, abstain: 2 } },
      { agenda: "2024年度収支予算の承認", result: "可決", details: "2024年度収支予算を承認した。管理費・積立金月額据え置き。", votingResults: { favor: 60, against: 2, abstain: 0 } },
      { agenda: "役員の選任", result: "可決", details: "理事7名・監事2名を選任した。", votingResults: { favor: 58, against: 0, abstain: 4 } },
      { agenda: "修繕積立金の増額改定", result: "可決", details: "2025年1月より月額20%増額（50㎡あたり15,000円→18,000円）を決議した。", votingResults: { favor: 52, against: 8, abstain: 2 } },
      { agenda: "管理委託契約の更新", result: "可決", details: "㈱アセットマネジメントリアルティとの委託契約を2年間更新した。", votingResults: { favor: 60, against: 0, abstain: 2 } },
      { agenda: "使用細則の一部改正", result: "可決", details: "自転車駐輪ルールを改正した（電動キックボード対応・放置自転車撤去手続き明記）。", votingResults: { favor: 61, against: 0, abstain: 1 } },
    ],
  },
  "3": {
    id: "3",
    title: "第11回理事会議事録",
    date: "2025年2月10日",
    time: "19:00-20:30",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "大規模修繕工事の設計業者選定プロポーザルと、3月定期総会の準備について審議した。",
    content: "",
    sourceDocument: "理事会資料2025-02",
    status: "完了",
    createdAt: "2025-02-11T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "大規模修繕工事・設計業者選定プロポーザルの結果報告",
        presenter: "中村 勝（修繕担当理事）",
        content: "4社に提案書提出を依頼し、3社から回答を受けた。評価委員会での審査の結果、㈱総合設計企画が技術提案・実績・費用の総合評価で最高点を獲得した。設計監理費用の概算は工事費の約8%を想定している。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "定期総会（3月）の開催準備",
        presenter: "田中 一郎（理事長）",
        content: "第42回定期総会を2025年3月29日（土）10:00〜集会室にて開催する。議案は（1）2024年度事業報告・決算、（2）2025年度事業計画・予算、（3）大規模修繕設計業者の正式選定、（4）修繕積立金特別徴収の承認。案内文・議案書の配布は3月8日予定。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "大規模修繕・設計業者選定プロポーザル", result: "可決", details: "㈱総合設計企画をプロポーザル選定業者として内定した。次の定期総会で正式承認を求める。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "第42回定期総会の開催決定", result: "可決", details: "2025年3月29日（土）10:00〜 集会室にて開催する。案内文・議案書を3月8日に配布する。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "4": {
    id: "4",
    title: "修繕委員会 第5回会合議事録",
    date: "2025年1月25日",
    time: "14:00-16:30",
    location: "サンプルレジデンスJ 管理事務室",
    meetingType: "修繕委員会",
    chairman: "中村 勝（修繕委員長・修繕担当理事）",
    secretary: "小林 達也（修繕委員）",
    attendees: 5,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 7.4,
    quorum: true,
    summary: "大規模修繕工事の施工業者選定に向けた見積比較、工事範囲の確定、施工スケジュールの審議を行った。",
    content: "",
    sourceDocument: "修繕委員会資料2025-01",
    status: "完了",
    createdAt: "2025-01-26T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "施工業者3社の見積比較・評価",
        presenter: "中村 勝（修繕委員長）",
        content: "A社：税込128,700,000円（工期6ヶ月）、B社：税込115,500,000円（工期7ヶ月）、C社：税込121,000,000円（工期6.5ヶ月）。価格・施工実績・アフター保証・近隣対応力の4項目で評価した結果、B社が総合評価最高点。ただし工期がやや長い点が課題。",
        result: "継続審議",
        votingResults: { favor: 3, against: 0, abstain: 2 },
      },
      {
        number: 2,
        title: "工事範囲・仕様の最終確認",
        presenter: "設計業者担当者（㈱総合設計企画 田邉氏）",
        content: "外壁塗装・防水改修（屋上・バルコニー）・鉄部塗装・共用廊下床改修を工事範囲とする。一部住民より要望のあった玄関扉の交換は、費用対効果および区分所有法上の問題から今回の工事範囲外とする。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "施工スケジュール（案）の審議",
        presenter: "中村 勝（修繕委員長）",
        content: "2025年6月〜12月を工事期間とする案（B社工期ベース）を検討。梅雨・台風シーズンを考慮し、足場解体を11月中旬までに完了させるよう業者と調整する。住民説明会は4月下旬に開催予定。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 4,
        title: "住民説明会の開催準備",
        presenter: "小林 達也（修繕委員）",
        content: "住民説明会を2025年4月26日（土）・27日（日）の2回開催する。説明資料の作成は設計業者㈱総合設計企画に依頼する。案内通知は4月10日までに全戸配布する。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "施工業者3社の見積比較・評価", result: "継続審議", details: "B社を第1候補とするが、工期短縮の可否について次回会合（2月）で再確認する。", votingResults: { favor: 3, against: 0, abstain: 2 } },
      { agenda: "工事範囲・仕様の最終確認", result: "可決", details: "外壁塗装・防水改修・鉄部塗装・共用廊下床改修を工事範囲として確定した。玄関扉交換は今回の工事範囲外とする。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "施工スケジュール（案）", result: "可決", details: "2025年6月〜12月の工事期間（B社工期ベース）を暫定スケジュールとして採択。住民説明会は4月下旬に開催する。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "住民説明会の開催準備", result: "可決", details: "2025年4月26日（土）・27日（日）の2回開催。案内通知は4月10日までに全戸配布する。", votingResults: { favor: 5, against: 0, abstain: 0 } },
    ],
  },
  "6": {
    id: "6",
    title: "臨時総会（大規模修繕承認）議事録",
    date: "2024年11月30日",
    time: "10:00-11:30",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "臨時総会",
    chairman: "田中 一郎（理事長）",
    secretary: "鈴木 誠（書記）",
    attendees: 28,
    proxy: 22,
    votingForm: 14,
    totalUnits: 68,
    attendanceRate: 94.1,
    quorum: true,
    summary: "大規模修繕工事の施工業者正式選定と特別修繕積立金一時徴収について審議し、両議案を可決した。",
    content: "",
    sourceDocument: "臨時総会議案書2024-11",
    status: "完了",
    createdAt: "2024-12-01T09:00:00Z",
    agenda: [
      {
        number: 1,
        title: "大規模修繕工事の施工業者選定および工事請負契約の締結",
        presenter: "中村 勝（修繕担当理事）",
        content: "修繕委員会・理事会での審議を経て、㈱ダイワリフォームズを施工業者として選定した。契約金額：税込115,500,000円（詳細内訳は議案書別紙のとおり）。工事期間：2025年6月上旬〜11月末。本議案は区分所有法第17条の「共用部分の変更」に該当し、区分所有者数および議決権の各4分の3以上の賛成が必要。",
        result: "可決",
        votingResults: { favor: 59, against: 4, abstain: 1 },
      },
      {
        number: 2,
        title: "大規模修繕工事費用に係る特別修繕積立金の一時徴収",
        presenter: "佐藤 明（会計担当理事）",
        content: "修繕積立金残高では工事費の全額を賄えないため、不足分約3,850万円を区分所有者から一時徴収する。専有面積割合に応じた按分で徴収し、平均専有面積（約65㎡）の住戸で概算約56万円となる予定。徴収時期：2025年5月末日一括または分割払い対応可。",
        result: "可決",
        votingResults: { favor: 55, against: 7, abstain: 2 },
      },
    ],
    decisions: [
      {
        agenda: "大規模修繕工事の施工業者選定および工事請負契約の締結",
        result: "可決",
        details: "㈱ダイワリフォームズとの工事請負契約（税込115,500,000円）の締結を承認した。（賛成59/4分の3以上充足）",
        votingResults: { favor: 59, against: 4, abstain: 1 },
      },
      {
        agenda: "特別修繕積立金の一時徴収",
        result: "可決",
        details: "不足分約3,850万円を区分所有者から専有面積割合に応じて徴収する。2025年5月末日を期限とする。",
        votingResults: { favor: 55, against: 7, abstain: 2 },
      },
    ],
  },
  "7": {
    id: "7",
    title: "修繕委員会 第4回会合議事録",
    date: "2024年11月15日",
    time: "14:00-17:00",
    location: "サンプルレジデンスJ 管理事務室",
    meetingType: "修繕委員会",
    chairman: "中村 勝（修繕委員長）",
    secretary: "小林 達也（修繕委員）",
    attendees: 5,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 7.4,
    quorum: true,
    summary: "施工業者の最終選定を行い、臨時総会への上程議案を確定した。",
    content: "",
    sourceDocument: "修繕委員会資料2024-11",
    status: "完了",
    createdAt: "2024-11-16T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "施工業者B社（㈱ダイワリフォームズ）工期短縮案の確認",
        presenter: "中村 勝（修繕委員長）",
        content: "前回会合でB社に依頼した工期短縮の可否について回答を受領。6ヶ月工期（6月〜11月末）への短縮が可能であり、追加費用は発生しないとの確認が取れた。これにより当初懸念されていた工期の問題が解消された。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "施工業者の最終決定",
        presenter: "中村 勝（修繕委員長）",
        content: "価格・施工実績・工期・アフター保証の総合評価において㈱ダイワリフォームズが最優秀と判断。委員会として同社を施工業者として推薦することを決議した。臨時総会での正式承認を経て契約締結する予定。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "臨時総会への上程議案の確認",
        presenter: "中村 勝（修繕委員長）",
        content: "臨時総会の上程議案として（1）施工業者の選定および工事請負契約締結（2）特別修繕積立金の一時徴収を提案する。議案書の内容について委員会として確認し、理事会に報告する。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 4,
        title: "工事中の生活影響・住民対応の検討",
        presenter: "小林 達也（修繕委員）",
        content: "工事期間中の騒音・振動・粉塵・足場設置による採光・通風への影響について検討した。施工業者に作業時間（平日8:00〜17:00・土曜8:00〜12:00）の遵守、週次の進捗報告、緊急連絡窓口の設置を求める仕様書を作成する。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 5,
        title: "工事中の生活支援措置（仮設駐輪場・荷物置き場）",
        presenter: "小林 達也（修繕委員）",
        content: "足場設置により駐輪場の一部が使用できなくなる期間について、敷地内の空きスペースに仮設駐輪場を設置する。また、バルコニー改修中は住民が植木鉢・物干し竿等を一時的に移動させる必要があるため、仮置きスペースを確保する。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "施工業者の最終決定", result: "可決", details: "㈱ダイワリフォームズを施工業者として推薦することを決議。臨時総会に上程する。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "臨時総会上程議案の確認", result: "可決", details: "（1）施工業者選定・契約締結、（2）特別修繕積立金一時徴収の2議案を臨時総会に上程する。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "工事中の住民対応方針", result: "可決", details: "作業時間・週次進捗報告・緊急連絡窓口の設置を施工仕様書に明記する。仮設駐輪場・荷物仮置きスペースを確保する。", votingResults: { favor: 5, against: 0, abstain: 0 } },
    ],
  },
  "11": {
    id: "11",
    title: "臨時総会（管理会社変更）議事録",
    date: "2024年6月22日",
    time: "10:00-12:00",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "臨時総会",
    chairman: "田中 一郎（理事長）",
    secretary: "鈴木 誠（書記）",
    attendees: 30,
    proxy: 20,
    votingForm: 10,
    totalUnits: 68,
    attendanceRate: 88.2,
    quorum: true,
    summary: "現管理会社との契約解除および新管理会社への移行について審議し、可決した。",
    content: "",
    sourceDocument: "臨時総会議案書2024-06",
    status: "完了",
    createdAt: "2024-06-23T09:00:00Z",
    agenda: [
      {
        number: 1,
        title: "現管理会社との管理委託契約の解除および新管理会社への変更",
        presenter: "田中 一郎（理事長）",
        content: "現管理会社㈱オールドマネジメントとの契約について、対応の遅滞・報告書の不備・担当者の頻繁な交代などのサービス品質低下が続いている。理事会として3社の管理会社と面接・比較検討を行い、㈱アセットマネジメントリアルティへの変更を推薦する。移行時期：2024年10月1日。",
        result: "可決",
        votingResults: { favor: 54, against: 5, abstain: 1 },
      },
    ],
    decisions: [
      {
        agenda: "管理会社の変更",
        result: "可決",
        details: "2024年10月1日付で㈱アセットマネジメントリアルティに管理委託先を変更することを決議した。（賛成54/区分所有者数の過半数かつ議決権の過半数を満たす）",
        votingResults: { favor: 54, against: 5, abstain: 1 },
      },
    ],
  },
  "13": {
    id: "13",
    title: "第40回定期総会（通常総会）議事録",
    date: "2023年8月26日",
    time: "10:00-13:00",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "通常総会",
    chairman: "前田 義雄（理事長）",
    secretary: "鈴木 誠（書記）",
    attendees: 30,
    proxy: 20,
    votingForm: 8,
    totalUnits: 68,
    attendanceRate: 85.3,
    quorum: true,
    summary: "2022年度事業報告・決算承認、2023年度事業計画・予算承認、役員改選および大規模修繕委員会の設置を決議した。",
    content: "",
    sourceDocument: "第40回定期総会議案書",
    status: "完了",
    createdAt: "2023-08-27T09:00:00Z",
    agenda: [
      {
        number: 1,
        title: "2022年度事業報告の承認",
        presenter: "前田 義雄（理事長）",
        content: "2022年度の主な事業として、共用廊下床シート改修（7月完了）、エレベーター遠隔監視システム導入（9月）を実施した。管理組合の運営は適正に行われた。",
        result: "可決",
        votingResults: { favor: 56, against: 0, abstain: 2 },
      },
      {
        number: 2,
        title: "2022年度収支決算の承認",
        presenter: "会計担当理事",
        content: "2022年度の管理費会計は歳入5,610,000円・歳出5,420,000円で差引剰余金190,000円。修繕積立金会計残高は56,890,000円となった。",
        result: "可決",
        votingResults: { favor: 57, against: 0, abstain: 1 },
      },
      {
        number: 3,
        title: "2023年度事業計画の承認",
        presenter: "前田 義雄（理事長）",
        content: "2023年度の重点事業として（1）LED照明化工事（2）管理規約の点検（3）大規模修繕に向けた準備（修繕委員会の設置）を計画している。",
        result: "可決",
        votingResults: { favor: 56, against: 1, abstain: 1 },
      },
      {
        number: 4,
        title: "2023年度収支予算の承認",
        presenter: "会計担当理事",
        content: "2023年度管理費予算：歳入5,700,000円・歳出5,640,000円。修繕積立金予算：歳入12,240,000円・歳出2,800,000円（LED照明化等）。",
        result: "可決",
        votingResults: { favor: 56, against: 2, abstain: 0 },
      },
      {
        number: 5,
        title: "役員（理事・監事）の選任",
        presenter: "前田 義雄（議長）",
        content: "任期満了に伴う役員改選。田中 一郎氏ほか6名を理事として、高橋 智氏ほか1名を監事として選任する。",
        result: "可決",
        votingResults: { favor: 55, against: 0, abstain: 3 },
      },
      {
        number: 6,
        title: "大規模修繕委員会の設置",
        presenter: "前田 義雄（理事長）",
        content: "築18年を経過したマンションの大規模修繕を計画的に進めるため、理事会の諮問機関として大規模修繕委員会を設置する。委員は区分所有者から公募し、理事2名・一般区分所有者3名程度で構成する。",
        result: "可決",
        votingResults: { favor: 57, against: 0, abstain: 1 },
      },
      {
        number: 7,
        title: "管理委託契約の更新（条件変更あり）",
        presenter: "前田 義雄（理事長）",
        content: "現管理会社との契約を1年間更新するが、対応品質改善のため担当者変更・月次報告書の詳細化・緊急対応SLAの明文化を条件に加える。",
        result: "可決",
        votingResults: { favor: 52, against: 3, abstain: 3 },
      },
    ],
    decisions: [
      { agenda: "2022年度事業報告の承認", result: "可決", details: "2022年度事業報告を承認した。", votingResults: { favor: 56, against: 0, abstain: 2 } },
      { agenda: "2022年度収支決算の承認", result: "可決", details: "2022年度収支決算を承認した。修繕積立金残高56,890,000円を確認。", votingResults: { favor: 57, against: 0, abstain: 1 } },
      { agenda: "2023年度事業計画の承認", result: "可決", details: "2023年度事業計画を承認した。大規模修繕準備を重点事業とする。", votingResults: { favor: 56, against: 1, abstain: 1 } },
      { agenda: "2023年度収支予算の承認", result: "可決", details: "2023年度収支予算を承認した。管理費・積立金月額据え置き。", votingResults: { favor: 56, against: 2, abstain: 0 } },
      { agenda: "役員の選任", result: "可決", details: "田中 一郎氏ほか6名を理事、高橋 智氏ほか1名を監事として選任した。", votingResults: { favor: 55, against: 0, abstain: 3 } },
      { agenda: "大規模修繕委員会の設置", result: "可決", details: "理事会の諮問機関として大規模修繕委員会を設置することを決議した。", votingResults: { favor: 57, against: 0, abstain: 1 } },
      { agenda: "管理委託契約の更新", result: "可決", details: "現管理会社との委託契約を条件付きで1年間更新した。", votingResults: { favor: 52, against: 3, abstain: 3 } },
    ],
  },
  "5": {
    id: "5",
    title: "第10回理事会議事録",
    date: "2025年1月12日",
    time: "19:00-20:15",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "修繕委員会から大規模修繕工事の業者選定スケジュールについて報告を受け、臨時総会の開催日程を決定した。",
    content: "",
    sourceDocument: "理事会資料2025-01",
    status: "完了",
    createdAt: "2025-01-13T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "修繕委員会からの業者選定スケジュール報告",
        presenter: "中村 勝（修繕担当理事）",
        content: "施工業者の最終選定を2025年1月末の修繕委員会（第5回）で行い、2月の理事会で結果を報告後、11月の臨時総会で区分所有者の承認を得る予定。スケジュールに変更はなく、順調に進捗している。",
        result: "承認",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "修繕委員会からの業者選定スケジュール報告", result: "承認", details: "修繕委員会提示のスケジュール（1月末最終選定→2月理事会報告→11月臨時総会承認）を承認した。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "8": {
    id: "8",
    title: "第9回理事会議事録",
    date: "2024年10月20日",
    time: "19:00-20:40",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 6,
    proxy: 1,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "新管理会社（㈱アセットマネジメントリアルティ）への引継ぎ状況確認、防犯カメラ増設工事の竣工確認、および年末の設備点検日程を決定した。",
    content: "",
    sourceDocument: "理事会資料2024-10",
    status: "完了",
    createdAt: "2024-10-21T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "新管理会社への引継ぎ状況の確認",
        presenter: "田中 一郎（理事長）",
        content: "10月1日付での管理会社変更後、引継ぎは概ね順調に進んでいる。鍵・書類類の引渡しは完了。一部システムのログイン情報移管が10月末までに完了予定。住民からのクレームは今のところ発生していない。",
        result: "承認",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "防犯カメラ増設工事の竣工確認",
        presenter: "佐々木 健（防災担当理事）",
        content: "10月15日に防犯カメラ4台（駐輪場2台・エントランス2台）の設置工事が完了した。稼働状況および録画データの確認を行い、正常稼働を確認した。工事費実績：税込792,000円（予算内）。",
        result: "承認",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "年末設備点検日程の決定",
        presenter: "山田 花子（副理事長）",
        content: "消防設備点検を12月14日（土）、貯水槽清掃を12月21日（土）に実施する。住民への通知は11月初旬に配布する。エレベーター法定検査は1月下旬に実施予定。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "新管理会社への引継ぎ状況", result: "承認", details: "引継ぎ状況を確認・承認。システムログイン情報の移管を10月末までに完了させる。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "防犯カメラ増設工事の竣工", result: "承認", details: "防犯カメラ4台の設置工事竣工を確認・承認した。工事費実績792,000円（予算内）。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "年末設備点検日程", result: "可決", details: "消防設備点検12月14日、貯水槽清掃12月21日の日程を決定した。住民通知を11月初旬に配布する。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "9": {
    id: "9",
    title: "第8回理事会議事録",
    date: "2024年9月14日",
    time: "19:00-20:30",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "管理会社変更後の業務引継ぎ確認と、修繕委員会の発足に関する委員公募について審議した。",
    content: "",
    sourceDocument: "理事会資料2024-09",
    status: "完了",
    createdAt: "2024-09-15T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "管理会社変更業務引継ぎの最終確認",
        presenter: "田中 一郎（理事長）",
        content: "9月30日の契約終了に向け、現管理会社との引継ぎ事項（書類・鍵・契約書・設備台帳）のチェックリストを確認した。新管理会社担当者との合同打合せを10月1日に設定済み。",
        result: "承認",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "修繕委員会委員の公募",
        presenter: "中村 勝（修繕担当理事）",
        content: "大規模修繕の検討・推進を行う修繕委員会の委員を区分所有者から公募する。募集対象：一般区分所有者3名程度。10月の広報誌・掲示板で案内を行い、11月末日を応募締め切りとする。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "管理会社変更業務引継ぎ", result: "承認", details: "引継ぎチェックリストを承認。10月1日の合同打合せにて正式引継ぎを行う。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "修繕委員会委員の公募", result: "可決", details: "一般区分所有者3名程度を公募する。応募締め切り：11月末日。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "10": {
    id: "10",
    title: "修繕委員会 第3回会合議事録",
    date: "2024年8月3日",
    time: "14:00-16:00",
    location: "サンプルレジデンスJ 管理事務室",
    meetingType: "修繕委員会",
    chairman: "中村 勝（修繕委員長）",
    secretary: "小林 達也（修繕委員）",
    attendees: 5,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 7.4,
    quorum: true,
    summary: "設計業者による劣化診断結果の報告を受け、工事優先順位を確定した。",
    content: "",
    sourceDocument: "修繕委員会資料2024-08",
    status: "完了",
    createdAt: "2024-08-04T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "設計業者による劣化診断結果の報告",
        presenter: "㈱総合設計企画 田邉氏",
        content: "外壁・屋上防水・鉄部の劣化診断を実施した結果、外壁（南面・東面）のひび割れ・剥離が緊急度「高」、屋上防水の膨れが緊急度「中」、鉄部サビが緊急度「中」と判定された。全体の修繕費概算は1億〜1億3千万円程度と試算。",
        result: "承認",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "工事優先順位と工事範囲の確定",
        presenter: "中村 勝（修繕委員長）",
        content: "劣化診断結果に基づき、（1）外壁塗装・補修、（2）屋上・バルコニー防水改修、（3）鉄部塗装、（4）共用廊下床改修の4工事を今回の大規模修繕の対象とする。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "施工業者選定プロセスの確認",
        presenter: "中村 勝（修繕委員長）",
        content: "施工業者の選定はプロポーザル方式（設計業者が仕様書作成→複数業者から見積取得→委員会で評価）とする。スケジュール：9月仕様書完成→10月見積取得→11月評価・選定→11月臨時総会承認。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "劣化診断結果の承認", result: "承認", details: "設計業者による劣化診断結果を承認した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "工事範囲の確定", result: "可決", details: "外壁塗装・防水改修・鉄部塗装・共用廊下床改修の4工事を今回の大規模修繕の対象として確定した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "施工業者選定プロセス", result: "可決", details: "プロポーザル方式で選定し、11月の臨時総会で承認を得るスケジュールを決定した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
    ],
  },
  "12": {
    id: "12",
    title: "第7回理事会議事録",
    date: "2024年5月18日",
    time: "19:00-21:00",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "管理会社変更に向けた候補会社3社との面談結果を評価し、推薦候補を臨時総会に上程することを決定した。また設計業者の選定プロポーザルの開始も決議した。",
    content: "",
    sourceDocument: "理事会資料2024-05",
    status: "完了",
    createdAt: "2024-05-19T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "管理会社変更候補3社の評価と推薦",
        presenter: "田中 一郎（理事長）",
        content: "A社（現管理会社）・B社（㈱アセットマネジメントリアルティ）・C社の3社を比較評価した。価格・サービス品質・実績・担当者の提案力の総合評価でB社が最優秀と判断。6月の臨時総会でB社への変更承認を求める。",
        result: "可決",
        votingResults: { favor: 6, against: 0, abstain: 1 },
      },
      {
        number: 2,
        title: "大規模修繕設計業者プロポーザルの開始",
        presenter: "中村 勝（修繕担当理事）",
        content: "大規模修繕工事の設計監理業者選定に向け、プロポーザルを4社に対して実施する。提案書提出期限：7月末。8月の修繕委員会で評価を行い、9月の理事会で内定する。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "駐輪場区画整備工事の発注",
        presenter: "佐々木 健（防災担当理事）",
        content: "2024年度事業計画に基づき、駐輪場の区画整備工事（ライン引き直し・ラック設置）を実施する。見積額：税込528,000円。7月中旬に施工予定。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 4,
        title: "防犯カメラ増設の業者選定",
        presenter: "佐々木 健（防災担当理事）",
        content: "2社からの見積の結果、㈱セーフガードシステムズ（税込792,000円）を採用する。設置場所：駐輪場2台・エントランス2台の計4台。施工時期：10月上旬。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "管理会社変更候補の推薦", result: "可決", details: "㈱アセットマネジメントリアルティを管理会社変更候補として推薦し、6月の臨時総会に上程することを決定。", votingResults: { favor: 6, against: 0, abstain: 1 } },
      { agenda: "大規模修繕設計業者プロポーザル開始", result: "可決", details: "4社にプロポーザルを実施し、9月理事会で内定する方針を決定。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "駐輪場区画整備工事の発注", result: "可決", details: "工事費528,000円（税込）で発注。7月中旬施工予定。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "防犯カメラ増設の業者選定", result: "可決", details: "㈱セーフガードシステムズ（792,000円）に発注。10月上旬施工予定。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "14": {
    id: "14",
    title: "修繕委員会 第2回会合議事録",
    date: "2024年3月9日",
    time: "14:00-15:30",
    location: "サンプルレジデンスJ 管理事務室",
    meetingType: "修繕委員会",
    chairman: "中村 勝（修繕委員長）",
    secretary: "小林 達也（修繕委員）",
    attendees: 5,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 7.4,
    quorum: true,
    summary: "大規模修繕の設計業者選定の進め方と劣化診断の実施方法について審議した。",
    content: "",
    sourceDocument: "修繕委員会資料2024-03",
    status: "完了",
    createdAt: "2024-03-10T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "劣化診断の実施方針",
        presenter: "中村 勝（修繕委員長）",
        content: "大規模修繕の工事範囲・仕様を確定するため、設計業者主導による専門的な劣化診断を実施する。診断項目：外壁・防水・鉄部・設備系統。費用は設計監理費の中に含める予定。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "設計業者選定スケジュールの確認",
        presenter: "中村 勝（修繕委員長）",
        content: "5月に理事会へプロポーザル開始を提案、7月末に提案書受領、8月の修繕委員会で評価、9月の理事会で内定。10月以降に設計・劣化診断着手のスケジュールを確認した。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "劣化診断の実施方針", result: "可決", details: "設計業者主導による専門的な劣化診断を実施する方針を決定した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "設計業者選定スケジュール", result: "可決", details: "5月理事会提案→7月提案書受領→8月修繕委員会評価→9月理事会内定のスケジュールを確認した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
    ],
  },
  "15": {
    id: "15",
    title: "第6回理事会議事録",
    date: "2024年2月17日",
    time: "19:00-20:45",
    location: "サンプルレジデンスJ 集会室",
    meetingType: "理事会",
    chairman: "田中 一郎（理事長）",
    secretary: "山田 花子（副理事長）",
    attendees: 7,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 10.3,
    quorum: true,
    summary: "修繕委員会の第1回会合報告を受け、大規模修繕のロードマップを承認した。また、管理費滞納者への対応方針を決定した。",
    content: "",
    sourceDocument: "理事会資料2024-02",
    status: "完了",
    createdAt: "2024-02-18T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "修繕委員会第1回会合の報告",
        presenter: "中村 勝（修繕担当理事）",
        content: "1月13日に修繕委員会第1回会合を開催し、委員の自己紹介・役割分担・活動方針を確認した。委員長：中村勝、副委員長：小林達也、その他委員3名。今後の活動スケジュール（月1回程度の開催予定）を承認した。",
        result: "承認",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "大規模修繕ロードマップの承認",
        presenter: "中村 勝（修繕担当理事）",
        content: "2024年度：設計業者選定・劣化診断→2024年末：工事仕様確定→2025年初：施工業者選定・臨時総会承認→2025年中旬〜末：工事実施のロードマップを理事会として承認する。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
      {
        number: 3,
        title: "管理費滞納者への対応方針",
        presenter: "佐藤 明（会計担当理事）",
        content: "現在2か月以上の滞納が3戸発生している。3か月未満は督促状送付、3か月以上は内容証明郵便送付、6か月以上は弁護士相談の対応フローを規定する。現状で6か月超過の滞納者はいない。",
        result: "可決",
        votingResults: { favor: 7, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "修繕委員会第1回会合の報告", result: "承認", details: "修繕委員会第1回会合の内容および今後の活動スケジュールを承認した。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "大規模修繕ロードマップ", result: "可決", details: "2024〜2025年の大規模修繕ロードマップを理事会として承認した。", votingResults: { favor: 7, against: 0, abstain: 0 } },
      { agenda: "管理費滞納者への対応方針", result: "可決", details: "滞納期間に応じた段階的対応フロー（督促状→内容証明→弁護士相談）を決定した。", votingResults: { favor: 7, against: 0, abstain: 0 } },
    ],
  },
  "16": {
    id: "16",
    title: "修繕委員会 第1回会合議事録",
    date: "2024年1月13日",
    time: "14:00-15:30",
    location: "サンプルレジデンスJ 管理事務室",
    meetingType: "修繕委員会",
    chairman: "中村 勝（修繕委員長・修繕担当理事）",
    secretary: "小林 達也（修繕委員）",
    attendees: 5,
    proxy: 0,
    votingForm: 0,
    totalUnits: 68,
    attendanceRate: 7.4,
    quorum: true,
    summary: "修繕委員会の初回会合として、委員の役割分担・活動方針・今後のスケジュールを確認した。",
    content: "",
    sourceDocument: "修繕委員会資料2024-01",
    status: "完了",
    createdAt: "2024-01-14T10:00:00Z",
    agenda: [
      {
        number: 1,
        title: "委員の自己紹介と役割分担の確認",
        presenter: "中村 勝（修繕委員長）",
        content: "委員5名の自己紹介を行い、役割を確認した。委員長：中村勝（修繕担当理事）、副委員長：小林達也（区分所有者・建築士）、委員：渡辺正（区分所有者）、松本美恵子（区分所有者）、斉藤浩二（区分所有者）。",
        result: "承認",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
      {
        number: 2,
        title: "修繕委員会の活動方針と会合頻度の決定",
        presenter: "中村 勝（修繕委員長）",
        content: "月1回程度の会合を開催し、大規模修繕工事の実施に向けた検討を進める。議事録は毎回作成し、理事会・広報誌で区分所有者に周知する。委員の任期は大規模修繕工事の竣工まで。",
        result: "可決",
        votingResults: { favor: 5, against: 0, abstain: 0 },
      },
    ],
    decisions: [
      { agenda: "委員の役割分担", result: "承認", details: "修繕委員会の委員構成および役割分担を承認した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
      { agenda: "活動方針と会合頻度", result: "可決", details: "月1回程度の会合開催、議事録の作成・公開、委員任期（工事竣工まで）を決定した。", votingResults: { favor: 5, against: 0, abstain: 0 } },
    ],
  },
};

function VotingBar({ favor, against, abstain }: { favor: number; against: number; abstain: number }) {
  const total = favor + against + abstain;
  if (total === 0) return null;
  const favorPct = Math.round((favor / total) * 100);
  const againstPct = Math.round((against / total) * 100);
  const abstainPct = 100 - favorPct - againstPct;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-5 rounded overflow-hidden text-xs font-medium">
        {favorPct > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-white"
            style={{ width: `${favorPct}%` }}
          >
            {favorPct >= 10 ? `${favorPct}%` : ""}
          </div>
        )}
        {againstPct > 0 && (
          <div
            className="bg-red-400 flex items-center justify-center text-white"
            style={{ width: `${againstPct}%` }}
          >
            {againstPct >= 10 ? `${againstPct}%` : ""}
          </div>
        )}
        {abstainPct > 0 && (
          <div
            className="bg-gray-300 flex items-center justify-center text-gray-600"
            style={{ width: `${abstainPct}%` }}
          >
            {abstainPct >= 10 ? `${abstainPct}%` : ""}
          </div>
        )}
      </div>
      <div className="flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500"></span>
          賛成 {favor}票
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400"></span>
          反対 {against}票
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-300"></span>
          棄権 {abstain}票
        </span>
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  const isApproved = result === "可決" || result === "承認";
  const isRejected = result === "否決";
  if (isApproved) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
        <CheckCircle className="w-3.5 h-3.5" />
        {result}
      </span>
    );
  }
  if (isRejected) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        <XCircle className="w-3.5 h-3.5" />
        {result}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
      <MinusCircle className="w-3.5 h-3.5" />
      {result}
    </span>
  );
}

function renderMarkdownContent(content: string) {
  if (!content) return null;

  let cleaned = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br>/g, "\n")
    .replace(/<br\/>/g, "\n")
    .replace(/\n\s*\n\s*\n/g, "\n\n");

  const lines = cleaned.split("\n");
  const firstHeaderIndex = lines.findIndex((l) => l.trim().startsWith("### "));
  if (firstHeaderIndex !== -1) {
    const secondHeaderIndex = lines.findIndex(
      (l, idx) => idx > firstHeaderIndex + 1 && l.trim().startsWith("### ")
    );
    if (secondHeaderIndex !== -1) {
      cleaned = lines.slice(0, secondHeaderIndex).join("\n");
    }
  }

  cleaned = cleaned
    .replace(/^---$/gm, "")
    .replace(/^\*\*$/gm, "")
    .replace(/^#{1,6}\s*$/gm, "")
    .replace(/\n\s*\n/g, "\n");

  return cleaned
    .split("\n")
    .map((line, index) => {
      const t = line.trim();
      if (!t || t === "---" || t === "**" || t.match(/^#{1,6}$/)) return null;
      if (t.startsWith("### ")) return null;
      if (t.startsWith("## ")) {
        return (
          <h2 key={index} className="text-base font-bold text-blue-800 mt-3 mb-1 border-b border-blue-200 pb-1">
            {t.substring(3)}
          </h2>
        );
      }
      if (t.includes("|")) {
        const cells = t.split("|").map((c) => c.trim()).filter((c) => c);
        if (cells.every((c) => c.includes("---") || c.includes(":"))) return null;
        if (cells.length > 1) {
          return (
            <div key={index} className="bg-white rounded border border-gray-200 overflow-hidden mb-2">
              <div className={`grid ${cells.length === 2 ? "grid-cols-2" : cells.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                {cells.map((cell, ci) => {
                  const isHeader = ci === 0;
                  const cls = isHeader
                    ? "bg-blue-50 font-semibold text-gray-900 p-2 border-r border-gray-200 text-sm"
                    : "text-gray-700 p-2 text-sm";
                  if (cell.includes("**")) {
                    const parts = cell.split("**");
                    return (
                      <div key={ci} className={cls}>
                        {parts.map((p, pi) =>
                          pi % 2 === 1 ? <strong key={pi}>{p}</strong> : <span key={pi}>{p}</span>
                        )}
                      </div>
                    );
                  }
                  return <div key={ci} className={cls}>{cell}</div>;
                })}
              </div>
            </div>
          );
        }
      }
      if (t.includes("**")) {
        const parts = t.split("**");
        return (
          <p key={index} className="mb-0.5 leading-tight text-sm">
            {parts.map((p, pi) =>
              pi % 2 === 1 ? (
                <strong key={pi} className="font-semibold text-gray-900">{p}</strong>
              ) : (
                <span key={pi} className="text-gray-700">{p}</span>
              )
            )}
          </p>
        );
      }
      return (
        <p key={index} className="mb-0.5 leading-tight text-gray-700 text-sm">
          {t}
        </p>
      );
    })
    .filter(Boolean);
}

export default function MinuteDetail() {
  const { condominiumId, minuteId } = useParams<{ condominiumId: string; minuteId: string }>();
  const [, setLocation] = useLocation();

  const { data: minute, isLoading } = useQuery<MinuteDetailData>({
    queryKey: [`/api/condominiums/${condominiumId}/minutes/${minuteId}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/condominiums/${condominiumId}/minutes/${minuteId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.agenda?.length > 0 || data.content)) {
            return data;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn("[MinuteDetail] API fetch failed, falling back to mock data:", err);
      }
      return mockMinuteDetails[minuteId] ?? null;
    },
  });

  const handleBack = () => {
    setLocation(`/minutes/list?condominiumId=${condominiumId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!minute) {
    return (
      <div className="space-y-6">
        <p>議事録が見つかりません</p>
        <Button onClick={handleBack} className="mt-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>
    );
  }

  const hasAgenda = minute.agenda && minute.agenda.length > 0;
  const hasDecisions = minute.decisions && minute.decisions.length > 0;

  const totalAttendees = minute.attendees || 0;
  const proxy = minute.proxy || 0;
  const votingForm = minute.votingForm || 0;
  const grandTotal = totalAttendees + proxy + votingForm;
  const totalUnits = minute.totalUnits || 0;
  const attendancePct = totalUnits > 0 ? ((grandTotal / totalUnits) * 100).toFixed(1) : minute.attendanceRate?.toFixed(1) || "0.0";

  const minuteNumMatch = minute.id?.match(/-minute-(\d+)$/);
  const docNumber = minuteNumMatch ? `第${minuteNumMatch[1]}号` : "—";

  const meetingTypeColor =
    minute.meetingType === "通常総会"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : minute.meetingType === "臨時総会"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : minute.meetingType === "理事会"
      ? "bg-purple-100 text-purple-800 border-purple-300"
      : "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 11pt; color: #000; }
          .print-page { max-width: 100% !important; padding: 0 !important; }
          .agenda-card { break-inside: avoid; }
          .voting-bar-container { break-inside: avoid; }
        }
      `}</style>

      <div className="print-page max-w-4xl mx-auto space-y-6 pb-12">
        {/* Toolbar — hidden when printing */}
        <div className="no-print flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            議事録一覧に戻る
          </Button>
          <Button variant="outline" onClick={handlePrint} data-testid="button-print">
            <Printer className="w-4 h-4 mr-2" />
            印刷
          </Button>
        </div>

        {/* ============================
            Document Header
        ============================= */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-testid="section-document-header">
          <div className="text-center space-y-2">
            {/* Meeting type badge + document number */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${meetingTypeColor}`}
                data-testid="badge-meeting-type"
              >
                {minute.meetingType}
              </span>
              <span className="text-xs text-gray-400 font-mono" data-testid="text-doc-number">
                文書番号 {docNumber}
              </span>
            </div>

            {/* Document title */}
            <h1
              className="text-2xl font-bold text-gray-900 leading-tight"
              data-testid="text-document-title"
            >
              {minute.title?.replace(/^###\s*/, "") || minute.title}
            </h1>

            {/* Date subtitle */}
            <p className="text-sm text-gray-500" data-testid="text-document-date">
              {minute.date}
            </p>
          </div>
        </div>

        {/* ============================
            Meeting Info Grid
        ============================= */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-testid="section-meeting-info">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            開催情報
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">日時</p>
                <p className="text-sm text-gray-800" data-testid="text-meeting-datetime">
                  {minute.date}{minute.time ? `　${minute.time}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">場所</p>
                <p className="text-sm text-gray-800" data-testid="text-meeting-location">
                  {minute.location || "サンプルレジデンスJ 集会室"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">議長</p>
                <p className="text-sm text-gray-800" data-testid="text-chairman">
                  {minute.chairman || "修繕 未来（理事長）"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">議事録作成者</p>
                <p className="text-sm text-gray-800" data-testid="text-secretary">
                  {minute.secretary || "佐藤花子（理事）"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================
            Attendance Section
        ============================= */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-testid="section-attendance">
          <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            出席状況
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>出席：</span>
              <strong data-testid="text-attendees">{totalAttendees}名</strong>
            </span>
            <span>
              委任状：<strong data-testid="text-proxy">{proxy}名</strong>
            </span>
            <span>
              議決権行使書：<strong data-testid="text-voting-form">{votingForm}名</strong>
            </span>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <span>
              合計：<strong data-testid="text-grand-total">{grandTotal > 0 ? grandTotal : totalAttendees}名</strong>
              {" / "}
              総戸数：<strong data-testid="text-total-units">{totalUnits}戸</strong>
              {" "}
              <span className="text-blue-700 font-semibold" data-testid="text-attendance-pct">
                ({attendancePct}%)
              </span>
            </span>
            <span>
              定足数：
              <strong
                className={minute.quorum !== false ? "text-green-700" : "text-red-700"}
                data-testid="text-quorum"
              >
                {minute.quorum !== false ? "充足・成立" : "不足・不成立"}
              </strong>
            </span>
          </div>
        </div>

        {/* ============================
            Agenda Cards OR Markdown Fallback
        ============================= */}
        {hasAgenda ? (
          <div className="space-y-4" data-testid="section-agenda">
            <h2 className="text-base font-bold text-gray-700">議案</h2>
            {minute.agenda!.map((item) => (
              <div
                key={item.number}
                className="agenda-card bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                data-testid={`card-agenda-${item.number}`}
              >
                {/* Card header */}
                <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                      {item.number}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug" data-testid={`text-agenda-title-${item.number}`}>
                      {item.title}
                    </h3>
                  </div>
                  <ResultBadge result={item.result} />
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-3">
                  {item.presenter && (
                    <p className="text-xs text-gray-500">
                      提案者：<span className="font-medium text-gray-700">{item.presenter}</span>
                    </p>
                  )}

                  {item.content && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">審議内容</p>
                      <p className="text-sm text-gray-700 leading-relaxed" data-testid={`text-agenda-content-${item.number}`}>
                        {item.content}
                      </p>
                    </div>
                  )}

                  {/* Voting visualization */}
                  {item.votingResults && (
                    <div className="voting-bar-container pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">採決結果</p>
                      <VotingBar
                        favor={item.votingResults.favor}
                        against={item.votingResults.against}
                        abstain={item.votingResults.abstain}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-testid="section-markdown-fallback">
            <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
              議事録詳細
            </h2>
            <div className="max-w-none text-sm leading-relaxed">
              {minute.content ? (
                renderMarkdownContent(minute.content)
              ) : (
                <p className="text-gray-500">議事録の内容が見つかりません。</p>
              )}
            </div>
          </div>
        )}

        {/* ============================
            Decision Summary Table
        ============================= */}
        {hasDecisions && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6" data-testid="section-decision-summary">
            <h2 className="text-base font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
              決議サマリー
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600 text-xs w-1/3">
                      議案
                    </th>
                    <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-600 text-xs">
                      概要
                    </th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold text-gray-600 text-xs w-20">
                      採決
                    </th>
                    <th className="text-center px-3 py-2 border border-gray-200 font-semibold text-gray-600 text-xs w-32">
                      投票内訳
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {minute.decisions!.map((dec, idx) => (
                    <tr key={idx} className="hover:bg-gray-50" data-testid={`row-decision-${idx}`}>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800 font-medium align-top">
                        {dec.agenda}
                      </td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-600 align-top text-xs leading-relaxed">
                        {dec.details}
                      </td>
                      <td className="px-3 py-2 border border-gray-200 text-center align-top">
                        <ResultBadge result={dec.result} />
                      </td>
                      <td className="px-3 py-2 border border-gray-200 align-top">
                        {dec.votingResults ? (
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex justify-between">
                              <span>賛成</span>
                              <span className="font-semibold text-green-700">{dec.votingResults.favor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>反対</span>
                              <span className="font-semibold text-red-600">{dec.votingResults.against}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>棄権</span>
                              <span className="font-semibold text-gray-500">{dec.votingResults.abstain}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================
            Document Footer
        ============================= */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-xs text-gray-500 space-y-1" data-testid="section-footer">
          {minute.sourceDocument && (
            <p>
              出典文書：<span className="font-medium text-gray-700">{minute.sourceDocument}</span>
            </p>
          )}
          <p>
            議事録作成日：
            <span className="font-medium text-gray-700">
              {new Date(minute.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </p>
          {minute.summary && (
            <p className="pt-1 text-gray-600 leading-relaxed">
              概要：{minute.summary}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
