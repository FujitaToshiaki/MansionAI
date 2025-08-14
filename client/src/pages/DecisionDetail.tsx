import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Users, MapPin, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";

interface DecisionDetail {
  id: string;
  meetingDate: string;
  meetingType: string;
  category: string;
  agenda: string;
  relatedArticle: string;
  result: string;
  details: string;
  votingResults: {
    favor: number;
    against: number;
    abstain: number;
  };
  presenter: string;
  location?: string;
  summary: string;
  createdAt: string;
}

export default function DecisionDetail() {
  const { condominiumId, decisionId } = useParams<{ condominiumId: string; decisionId: string }>();
  const [location, setLocation] = useLocation();

  const { data: decision, isLoading } = useQuery<DecisionDetail>({
    queryKey: [`/api/condominiums/${condominiumId}/decisions/${decisionId}`],
    queryFn: () => fetch(`/api/condominiums/${condominiumId}/decisions/${decisionId}`).then(res => res.json()),
  });

  const handleBack = () => {
    // Parse URL parameters to determine which tab to return to
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const fromTab = searchParams.get('from') || 'decisions';
    
    // Return to the specific tab that was previously active
    setLocation(`/condominiums/${condominiumId}?tab=${fromTab}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="space-y-6">
        <p>決議詳細が見つかりません</p>
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
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>戻る</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <Badge variant={decision.meetingType === '通常総会' ? 'default' : 'secondary'}>
            {decision.meetingType}
          </Badge>
          <Badge variant={decision.category === '重要事項' ? 'destructive' : 'outline'}>
            {decision.category}
          </Badge>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl text-blue-600 mb-3">
                {decision.agenda}
              </CardTitle>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{decision.meetingDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>発表者: {decision.presenter}</span>
                </div>
                {decision.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{decision.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getResultIcon(decision.result)}
              <Badge 
                variant={decision.result === '可決' || decision.result === '承認' ? 'default' : 'destructive'}
                className="ml-2"
              >
                {decision.result}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Decision Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">決議詳細</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                {decision.details || decision.summary || '詳細情報がありません'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Voting Results */}
          {decision.votingResults && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">投票結果</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {decision.votingResults.favor}
                  </div>
                  <div className="text-sm text-green-600">賛成</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {decision.votingResults.against}
                  </div>
                  <div className="text-sm text-red-600">反対</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {decision.votingResults.abstain}
                  </div>
                  <div className="text-sm text-gray-600">棄権</div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Related Articles */}
          {decision.relatedArticle && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">関連条文</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  {decision.relatedArticle}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>
    </div>
  );
}