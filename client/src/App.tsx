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
import NotFound from "@/pages/not-found";

// 新機能プレースホルダーページ
import EvaluationCheck from "@/pages/EvaluationCheck";
import EvaluationDetail from "@/pages/EvaluationDetail";
import EvaluationHistory from "@/pages/EvaluationHistory";
import LongTermPlan from "@/pages/LongTermPlan";
import LongTermPlanItems from "@/pages/LongTermPlanItems";
import LongTermPlanFund from "@/pages/LongTermPlanFund";
import LongTermPlanAnalysis from "@/pages/LongTermPlanAnalysis";
import LongTermPlanSummary from "@/pages/LongTermPlanSummary";
import Consultation from "@/pages/Consultation";
import ConsultationHistory from "@/pages/ConsultationHistory";
import MinutesAI from "@/pages/MinutesAI";
import MinutesUpload from "@/pages/MinutesUpload";
import MinutesGenerate from "@/pages/MinutesGenerate";
import MinutesActions from "@/pages/MinutesActions";
import ProposalAI from "@/pages/ProposalAI";
import ProposalGenerate from "@/pages/ProposalGenerate";
import ProposalEdit from "@/pages/ProposalEdit";
import ProposalExport from "@/pages/ProposalExport";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* ダッシュボード */}
        <Route path="/" component={Dashboard} />

        {/* 物件管理 */}
        <Route path="/condominiums" component={CondominiumList} />
        <Route path="/condominiums/:id" component={CondominiumDetail} />
        <Route path="/condominiums/:id/upload" component={DocumentUpload} />
        <Route path="/data-import" component={OCRProcessing} />
        <Route path="/condominiums/:id/ocr" component={OCRProcessing} />
        <Route path="/condominiums/:id/decisions" component={DecisionExtraction} />

        {/* 適正評価セルフチェック */}
        <Route path="/condominiums/:id/evaluation/check" component={EvaluationCheck} />
        <Route path="/condominiums/:id/evaluation/detail" component={EvaluationDetail} />
        <Route path="/condominiums/:id/evaluation/history" component={EvaluationHistory} />

        {/* 01 規約改訂AI（既存） */}
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
        <Route path="/revision-years" component={RevisionYearList} />
        <Route path="/revision-years/:id" component={RevisionYearDetail} />

        {/* 02 長期修繕計画AI */}
        <Route path="/condominiums/:id/02-longterm-plan" component={LongTermPlan} />
        <Route path="/condominiums/:id/02-longterm-plan/items" component={LongTermPlanItems} />
        <Route path="/condominiums/:id/02-longterm-plan/fund" component={LongTermPlanFund} />
        <Route path="/condominiums/:id/02-longterm-plan/analysis" component={LongTermPlanAnalysis} />
        <Route path="/condominiums/:id/02-longterm-plan/summary" component={LongTermPlanSummary} />

        {/* 03 業務相談Bot */}
        <Route path="/03-consultation" component={Consultation} />
        <Route path="/03-consultation/history" component={ConsultationHistory} />

        {/* 04 議事録作成AI */}
        <Route path="/condominiums/:id/04-minutes" component={MinutesAI} />
        <Route path="/condominiums/:id/04-minutes/upload" component={MinutesUpload} />
        <Route path="/condominiums/:id/04-minutes/generate" component={MinutesGenerate} />
        <Route path="/condominiums/:id/04-minutes/actions" component={MinutesActions} />
        <Route path="/condominiums/:condominiumId/minutes/:minuteId" component={MinuteDetail} />

        {/* 05 総会議案書AI */}
        <Route path="/condominiums/:id/05-proposal" component={ProposalAI} />
        <Route path="/condominiums/:id/05-proposal/generate" component={ProposalGenerate} />
        <Route path="/condominiums/:id/05-proposal/edit" component={ProposalEdit} />
        <Route path="/condominiums/:id/05-proposal/export" component={ProposalExport} />

        {/* ユーティリティ */}
        <Route path="/ai-agent-history" component={AIAgentHistory} />
        <Route path="/ai-agent-history/:executionId" component={AIAgentExecutionDetail} />
        <Route path="/reports" component={Reports} />

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
