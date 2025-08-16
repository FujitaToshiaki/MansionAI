import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText } from "lucide-react";
import { useLocation } from "wouter";

interface MinutesTabProps {
  condominiumId: string;
}

interface MeetingMinute {
  id: string;
  title: string;
  date: string;
  meetingType: string;
  status: string;
  attendees: number;
  totalUnits: number;
  attendanceRate: number;
  summary: string;
  createdAt: string;
}

export function MinutesTab({ condominiumId }: MinutesTabProps) {
  const [, setLocation] = useLocation();

  const { data: minutes, isLoading } = useQuery<MeetingMinute[]>({
    queryKey: [`/api/condominiums/${condominiumId}/minutes`],
    queryFn: () => fetch(`/api/condominiums/${condominiumId}/minutes`).then(res => res.json()),
  });

  const handleMinuteClick = (minuteId: string) => {
    setLocation(`/condominiums/${condominiumId}/minutes/${minuteId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!minutes || minutes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="mx-auto mb-4" size={48} />
        <p>議事録がアップロードされていません</p>
        <Button className="mt-4" variant="outline">
          議事録をアップロード
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {minutes.map((minute) => (
        <Card 
          key={minute.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleMinuteClick(minute.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-blue-600 hover:text-blue-800">
                  {minute.title.replace(/^### /, '')}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{minute.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>{minute.attendees}名参加 ({minute.attendanceRate.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge variant={minute.meetingType === '通常総会' ? 'default' : 'secondary'}>
                  {minute.meetingType}
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {minute.status === 'completed' ? '完了' : '作成中'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              {minute.summary}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              作成日: {new Date(minute.createdAt).toLocaleDateString('ja-JP')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}