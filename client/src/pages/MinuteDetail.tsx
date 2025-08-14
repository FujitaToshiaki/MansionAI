import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Users, MapPin, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";

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

interface MinuteDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  meetingType: string;
  chairman: string;
  secretary: string;
  attendees: number;
  totalUnits: number;
  attendanceRate: number;
  quorum: boolean;
  agenda: AgendaItem[];
  decisions: Decision[];
  nextMeeting: string;
  attachments: string[];
  summary: string;
  createdAt: string;
}

export default function MinuteDetail() {
  const { condominiumId, minuteId } = useParams<{ condominiumId: string; minuteId: string }>();
  const [, setLocation] = useLocation();

  const { data: minute, isLoading } = useQuery<MinuteDetail>({
    queryKey: [`/api/condominiums/${condominiumId}/minutes/${minuteId}`],
    queryFn: () => fetch(`/api/condominiums/${condominiumId}/minutes/${minuteId}`).then(res => res.json()),
  });

  const handleBack = () => {
    setLocation(`/condominiums/${condominiumId}`);
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
      <div className="max-w-4xl mx-auto p-6">
        <p>議事録が見つかりません</p>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>
    );
  }

  const getResultIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case '可決':
      case '承認':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case '否決':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <MinusCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          議事録一覧に戻る
        </Button>
        <Badge variant={minute.meetingType === '通常総会' ? 'default' : 'secondary'}>
          {minute.meetingType}
        </Badge>
      </div>

      {/* Meeting Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-700">{minute.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span><strong>開催日時:</strong> {minute.date} {minute.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span><strong>開催場所:</strong> {minute.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span><strong>出席者:</strong> {minute.attendees}名 / {minute.totalUnits}戸 ({minute.attendanceRate ? minute.attendanceRate.toFixed(1) : '0.0'}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span><strong>成立:</strong> {minute.quorum ? '成立' : '不成立'}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>議長:</strong> {minute.chairman}
            </div>
            <div>
              <strong>議事録作成者:</strong> {minute.secretary}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>議題</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {minute.agenda?.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  第{item.number}号議案: {item.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {getResultIcon(item.result)}
                  <Badge variant={item.result === '可決' || item.result === '承認' ? 'default' : 'destructive'}>
                    {item.result}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>提案者:</strong> {item.presenter}
              </p>
              <p className="text-gray-700 mb-3">{item.content}</p>
              
              {item.votingResults && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <strong>採決結果:</strong> 
                  <span className="ml-2">賛成 {item.votingResults.favor}票</span>
                  <span className="ml-2">反対 {item.votingResults.against}票</span>
                  <span className="ml-2">棄権 {item.votingResults.abstain}票</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Decisions Summary */}
      {minute.decisions && minute.decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>決議事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {minute.decisions.map((decision, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-blue-900">{decision.agenda}</h4>
                  <Badge variant={decision.result === '可決' ? 'default' : 'destructive'}>
                    {decision.result}
                  </Badge>
                </div>
                <p className="text-blue-800 mb-2">{decision.details}</p>
                {decision.votingResults && (
                  <div className="text-sm text-blue-700">
                    賛成 {decision.votingResults.favor}票 / 反対 {decision.votingResults.against}票 / 棄権 {decision.votingResults.abstain}票
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {minute.attachments && minute.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>添付資料</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {minute.attachments.map((attachment, index) => (
                <li key={index} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                  <span>• {attachment}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div>
              <strong>次回会議:</strong> {minute.nextMeeting}
            </div>
            <div>
              <strong>議事録作成日:</strong> {new Date(minute.createdAt).toLocaleDateString('ja-JP')}
            </div>
            <Separator />
            <div>
              <strong>総括:</strong>
              <p className="mt-2 text-gray-700">{minute.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}