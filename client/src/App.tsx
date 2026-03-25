import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CondominiumList from "@/pages/CondominiumList";
import CondominiumDetail from "@/pages/CondominiumDetail";
import DocumentUpload from "@/pages/DocumentUpload";
import OCRProcessing from "@/pages/OCRProcessing";
import DecisionExtraction from "@/pages/DecisionExtraction";
import RegulationAnalysis from "@/pages/RegulationAnalysis";
import RegulationRevisionDetail from "@/pages/RegulationRevisionDetail";
import AIRevisionGeneration from "@/pages/AIRevisionGeneration";
import KnowledgeBaseStandalone from "@/pages/KnowledgeBaseStandalone";
import RegulationWiki from "@/pages/RegulationWiki";
import StandardRegulations from "@/pages/StandardRegulations";
import StandardRegulationVersions from "@/pages/StandardRegulationVersions";
import StandardRegulationDetail from "@/pages/StandardRegulationDetail";
import MinuteDetail from "@/pages/MinuteDetail";
import AIAgentHistory from "@/pages/AIAgentHistory";
import AIAgentExecutionDetail from "@/pages/AIAgentExecutionDetail";
import RevisionYearList from "@/pages/RevisionYearList";
import RevisionYearDetail from "@/pages/RevisionYearDetail";
import Reports from "@/pages/Reports";
import EvaluationCheck from "@/pages/EvaluationCheck";
import EvaluationScore from "@/pages/EvaluationScore";
import EvaluationHistory from "@/pages/EvaluationHistory";
import NotFound from "@/pages/not-found";
import PlaceholderPage from "@/pages/PlaceholderPage";
import {
  ClipboardCheck,
  BarChart2,
  History,
  Wrench,
  List,
  FileStack,
  TrendingUp,
  BarChart,
  MessageSquare,
  FileText,
  Mic,
  Sparkles,
  CheckSquare,
  BookOpen,
  FilePen,
  Settings,
} from "lucide-react";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/ai-agent-history" component={AIAgentHistory} />
        <Route path="/ai-agent-history/:executionId" component={AIAgentExecutionDetail} />
        <Route path="/condominiums" component={CondominiumList} />
        <Route path="/condominiums/:id" component={CondominiumDetail} />
        <Route path="/condominiums/:id/upload" component={DocumentUpload} />
        <Route path="/data-import" component={OCRProcessing} />
        <Route path="/condominiums/:id/ocr" component={OCRProcessing} />
        <Route path="/condominiums/:id/decisions" component={DecisionExtraction} />
        <Route path="/condominiums/:id/regulation-analysis" component={RegulationAnalysis} />
        <Route path="/condominiums/:id/regulation-analysis/:revisionId" component={RegulationRevisionDetail} />
        <Route path="/condominiums/:id/analysis" component={RegulationAnalysis} />
        <Route path="/condominiums/:id/ai-revision" component={AIRevisionGeneration} />
        <Route path="/condominiums/:id/ai-agent-history" component={AIAgentHistory} />
        <Route path="/condominiums/:id/ai-agent-history/:executionId" component={AIAgentExecutionDetail} />
        <Route path="/condominiums/:id/knowledge" component={KnowledgeBaseStandalone} />
        <Route path="/condominiums/:id/wiki" component={RegulationWiki} />
        <Route path="/condominiums/:id/regulations/wiki" component={RegulationWiki} />
        <Route path="/standard-regulations" component={StandardRegulationVersions} />
        <Route path="/standard-regulations/:versionId" component={StandardRegulations} />
        <Route path="/standard-regulations/:versionId/:id" component={StandardRegulationDetail} />
        <Route path="/condominiums/:condominiumId/minutes/:minuteId" component={MinuteDetail} />
        <Route path="/revision-years" component={RevisionYearList} />
        <Route path="/revision-years/:id" component={RevisionYearDetail} />
        <Route path="/reports" component={Reports} />

        <Route path="/evaluation/check" component={EvaluationCheck} />
        <Route path="/evaluation/score" component={EvaluationScore} />
        <Route path="/evaluation/history" component={EvaluationHistory} />
        <Route path="/condominiums/:id/evaluation/check" component={EvaluationCheck} />
        <Route path="/condominiums/:id/evaluation/score" component={EvaluationScore} />
        <Route path="/condominiums/:id/evaluation/history" component={EvaluationHistory} />

        <Route path="/ai-revision">
          {() => <PlaceholderPage title="AI改訂案生成" icon={Sparkles} />}
        </Route>
        <Route path="/knowledge">
          {() => <PlaceholderPage title="ナレッジベース" icon={BookOpen} />}
        </Route>

        <Route path="/longterm/dashboard">
          {() => <PlaceholderPage title="修繕計画ダッシュボード" icon={Wrench} />}
        </Route>
        <Route path="/longterm/items">
          {() => <PlaceholderPage title="修繕項目一覧" icon={List} />}
        </Route>
        <Route path="/longterm/history">
          {() => <PlaceholderPage title="修繕履歴" icon={FileStack} />}
        </Route>
        <Route path="/longterm/simulation">
          {() => <PlaceholderPage title="積立金シミュレーション" icon={TrendingUp} />}
        </Route>
        <Route path="/longterm/analysis">
          {() => <PlaceholderPage title="AI見直し分析" icon={BarChart} />}
        </Route>

        <Route path="/consultation/chat">
          {() => <PlaceholderPage title="チャット相談" icon={MessageSquare} />}
        </Route>
        <Route path="/consultation/history">
          {() => <PlaceholderPage title="相談履歴" icon={History} />}
        </Route>

        <Route path="/minutes/list">
          {() => <PlaceholderPage title="議事録一覧" icon={FileText} />}
        </Route>
        <Route path="/minutes/import">
          {() => <PlaceholderPage title="音声・メモ取込" icon={Mic} />}
        </Route>
        <Route path="/minutes/generate">
          {() => <PlaceholderPage title="AI議事録生成" icon={Sparkles} />}
        </Route>
        <Route path="/minutes/actions">
          {() => <PlaceholderPage title="決定事項管理" icon={CheckSquare} />}
        </Route>

        <Route path="/proposals/list">
          {() => <PlaceholderPage title="議案書一覧" icon={BookOpen} />}
        </Route>
        <Route path="/proposals/generate">
          {() => <PlaceholderPage title="AI議案書生成" icon={Sparkles} />}
        </Route>
        <Route path="/proposals/edit">
          {() => <PlaceholderPage title="議案書編集" icon={FilePen} />}
        </Route>

        <Route path="/settings">
          {() => <PlaceholderPage title="設定" icon={Settings} />}
        </Route>

        {/* /condominiums/:id/evaluation/* */}
        <Route path="/condominiums/:id/evaluation/check">
          {() => <PlaceholderPage title="適正評価セルフチェック" icon={ClipboardCheck} />}
        </Route>
        <Route path="/condominiums/:id/evaluation/score">
          {() => <PlaceholderPage title="スコア詳細・改善提案" icon={BarChart2} />}
        </Route>
        <Route path="/condominiums/:id/evaluation/history">
          {() => <PlaceholderPage title="評価履歴・推移" icon={History} />}
        </Route>

        {/* /condominiums/:id/longterm/* */}
        <Route path="/condominiums/:id/longterm/dashboard">
          {() => <PlaceholderPage title="修繕計画ダッシュボード" icon={Wrench} />}
        </Route>
        <Route path="/condominiums/:id/longterm/items">
          {() => <PlaceholderPage title="修繕項目一覧" icon={List} />}
        </Route>
        <Route path="/condominiums/:id/longterm/history">
          {() => <PlaceholderPage title="修繕履歴" icon={FileStack} />}
        </Route>
        <Route path="/condominiums/:id/longterm/simulation">
          {() => <PlaceholderPage title="積立金シミュレーション" icon={TrendingUp} />}
        </Route>
        <Route path="/condominiums/:id/longterm/analysis">
          {() => <PlaceholderPage title="AI見直し分析" icon={BarChart} />}
        </Route>

        {/* /condominiums/:id/consultation/* */}
        <Route path="/condominiums/:id/consultation/chat">
          {() => <PlaceholderPage title="チャット相談" icon={MessageSquare} />}
        </Route>
        <Route path="/condominiums/:id/consultation/history">
          {() => <PlaceholderPage title="相談履歴" icon={History} />}
        </Route>

        {/* /condominiums/:id/minutes/* */}
        <Route path="/condominiums/:id/minutes/list">
          {() => <PlaceholderPage title="議事録一覧" icon={FileText} />}
        </Route>
        <Route path="/condominiums/:id/minutes/import">
          {() => <PlaceholderPage title="音声・メモ取込" icon={Mic} />}
        </Route>
        <Route path="/condominiums/:id/minutes/generate">
          {() => <PlaceholderPage title="AI議事録生成" icon={Sparkles} />}
        </Route>
        <Route path="/condominiums/:id/minutes/actions">
          {() => <PlaceholderPage title="決定事項管理" icon={CheckSquare} />}
        </Route>

        {/* /condominiums/:id/proposals/* */}
        <Route path="/condominiums/:id/proposals/list">
          {() => <PlaceholderPage title="議案書一覧" icon={BookOpen} />}
        </Route>
        <Route path="/condominiums/:id/proposals/generate">
          {() => <PlaceholderPage title="AI議案書生成" icon={Sparkles} />}
        </Route>
        <Route path="/condominiums/:id/proposals/edit">
          {() => <PlaceholderPage title="議案書編集" icon={FilePen} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
