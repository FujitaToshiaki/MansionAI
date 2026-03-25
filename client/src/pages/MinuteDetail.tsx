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
    queryFn: () =>
      fetch(`/api/condominiums/${condominiumId}/minutes/${minuteId}`).then((res) => res.json()),
  });

  const handleBack = () => {
    setLocation(`/condominiums/${condominiumId}`);
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
                  {minute.location || "メゾンドオプテージ 集会室"}
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
