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
  time?: string;
  location?: string;
  meetingType: string;
  chairman?: string;
  secretary?: string;
  attendees: number;
  totalUnits: number;
  attendanceRate: number;
  quorum?: boolean;
  agenda?: AgendaItem[];
  decisions?: Decision[];
  nextMeeting?: string;
  attachments?: string[];
  summary: string;
  content: string; // Raw markdown content from RAG system
  rawContent?: string;
  sourceDocument?: string;
  status?: string;
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
      <div className="space-y-6">
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

  // Helper function to render markdown-like content with proper styling
  const renderMarkdownContent = (content: string) => {
    if (!content) return null;
    
    // First, clean up the content and extract only the selected minute
    let cleanedContent = content
      .replace(/\r\n/g, '\n')  // Normalize line breaks
      .replace(/\r/g, '\n')    // Convert remaining carriage returns
      .replace(/<br>/g, '\n')  // Replace HTML <br> tags with line breaks
      .replace(/<br\/>/g, '\n') // Replace self-closing <br/> tags
      .replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive empty lines (3+ becomes 2)
    
    // Extract only the first section (stop at next ### header to show only selected minute)
    const lines = cleanedContent.split('\n');
    const firstHeaderIndex = lines.findIndex(line => line.trim().startsWith('### '));
    if (firstHeaderIndex !== -1) {
      // Find the next ### header after the first one
      const secondHeaderIndex = lines.findIndex((line, index) => 
        index > firstHeaderIndex + 1 && line.trim().startsWith('### ')
      );
      
      if (secondHeaderIndex !== -1) {
        // Only take content up to the second header to isolate selected minute
        cleanedContent = lines.slice(0, secondHeaderIndex).join('\n');
      }
    }
    
    // Remove RAG management text labels (---, ###, **)
    cleanedContent = cleanedContent
      .replace(/^---$/gm, '') // Remove standalone ---
      .replace(/^\*\*$/gm, '') // Remove standalone **
      .replace(/^#{1,6}\s*$/gm, '') // Remove standalone ### headers
      .replace(/\n\s*\n/g, '\n') // Clean up extra empty lines
    
    return cleanedContent.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip completely empty lines and RAG management labels
      if (!trimmedLine || trimmedLine === '---' || trimmedLine === '**' || trimmedLine.match(/^#{1,6}$/)) {
        return null;
      }
      
      // Headers (### and ##) - completely hide ### headers to remove RAG management labels
      if (trimmedLine.startsWith('### ')) {
        return null; // Hide all ### headers including titles
      }
      if (trimmedLine.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-bold text-blue-800 mt-2 mb-1 border-b border-blue-300 pb-1">
            {trimmedLine.substring(3)}
          </h2>
        );
      }
      
      // Table rows (|---|---|) - Process before bold text to avoid conflicts
      if (trimmedLine.includes('|')) {
        const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        
        // Skip header separator rows (|:---|:---|)
        if (cells.every(cell => cell.includes('---') || cell.includes(':'))) {
          return null;
        }
        
        if (cells.length > 1) {
          return (
            <div key={index} className="bg-white rounded border border-gray-200 overflow-hidden mb-2">
              <div className={`grid ${cells.length === 2 ? 'grid-cols-2' : cells.length === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {cells.map((cell, cellIndex) => {
                  // Process bold/italic text within cells
                  const processedCell = cell.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n');
                  
                  const isHeader = cellIndex === 0;
                  const cellClass = isHeader 
                    ? "bg-blue-50 font-semibold text-gray-900 p-2 border-r border-gray-200 text-sm" 
                    : "text-gray-700 p-2 text-sm";
                  
                  if (processedCell.includes('**')) {
                    const parts = processedCell.split('**');
                    return (
                      <div key={cellIndex} className={cellClass}>
                        {parts.map((part, partIndex) => 
                          partIndex % 2 === 1 ? 
                            <strong key={partIndex}>{part}</strong> : 
                            <span key={partIndex}>{part}</span>
                        )}
                      </div>
                    );
                  }
                  
                  // Handle multi-line content in cells
                  const lines = processedCell.split('\n');
                  
                  return (
                    <div key={cellIndex} className={cellClass}>
                      {lines.length > 1 ? (
                        <div className="space-y-1">
                          {lines.map((line, lineIndex) => (
                            <div key={lineIndex} className={line.trim().length > 0 ? '' : 'h-1'}>
                              {line.trim()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>{processedCell}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      }
      
      // Bold text (**text**)
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        return (
          <p key={index} className="mb-0.5 leading-tight text-sm">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? 
                <strong key={partIndex} className="font-semibold text-gray-900">{part}</strong> : 
                <span key={partIndex} className="text-gray-700">{part}</span>
            )}
          </p>
        );
      }
      
      // Italics (*text*) - but render normally without italic styling
      if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split('*');
        return (
          <p key={index} className="mb-0.5 leading-tight text-gray-700 text-sm">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? 
                <span key={partIndex} className="text-gray-600">{part}</span> : 
                <span key={partIndex}>{part}</span>
            )}
          </p>
        );
      }
      
      // Special handling for dates and key info
      if (trimmedLine.match(/^\d{4}年\d{1,2}月\d{1,2}日/)) {
        return (
          <div key={index} className="bg-blue-50 px-2 py-1 rounded mb-1 border-l-2 border-blue-400">
            <p className="text-blue-800 font-medium text-sm">{trimmedLine}</p>
          </div>
        );
      }
      
      // Organization names
      if (trimmedLine.includes('管理組合') && trimmedLine.length < 50) {
        return (
          <div key={index} className="text-center mb-2">
            <p className="text-base font-semibold text-blue-700">{trimmedLine}</p>
          </div>
        );
      }
      
      // Regular text with tighter spacing
      return (
        <p key={index} className="mb-0.5 leading-tight text-gray-700 text-sm">
          {trimmedLine}
        </p>
      );
    }).filter(Boolean); // Remove null/undefined elements
  };

  return (
    <div className="space-y-4">
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

      {/* Meeting Info - Compact Layout */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-blue-700">{minute.title?.replace(/^###\s*/, '') || minute.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 text-gray-600" />
              <span><strong>開催日時:</strong> {minute.date} {minute.time || ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-gray-600" />
              <span><strong>開催場所:</strong> {minute.location || 'メゾンドオプテージ 集会室'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-gray-600" />
              <span><strong>出席者:</strong> {minute.attendees}名 / {minute.totalUnits}戸 ({minute.attendanceRate ? minute.attendanceRate.toFixed(1) : '0.0'}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-gray-600" />
              <span><strong>成立:</strong> {minute.quorum !== false ? '成立' : '不成立'}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <strong>議長:</strong> {minute.chairman || '田中一郎 (理事長)'}
            </div>
            <div>
              <strong>議事録作成者:</strong> {minute.secretary || '佐藤花子 (理事)'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Markdown Rendered with Compact Layout */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">議事録詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-none text-sm leading-relaxed">
            {minute.content ? renderMarkdownContent(minute.content) : (
              <p className="text-gray-500">議事録の内容が見つかりません。</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {minute.sourceDocument && (
              <div>
                <strong>出典文書:</strong> {minute.sourceDocument}
              </div>
            )}
            <div>
              <strong>議事録作成日:</strong> {new Date(minute.createdAt).toLocaleDateString('ja-JP')}
            </div>
            <Separator />
            <div>
              <strong>概要:</strong>
              <p className="mt-2 text-gray-700">{minute.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}