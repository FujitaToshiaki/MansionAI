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
import IssueManagement from "@/pages/IssueManagement";
import AIAgentHistory from "@/pages/AIAgentHistory";
import AIAgentExecutionDetail from "@/pages/AIAgentExecutionDetail";
import RevisionYearList from "@/pages/RevisionYearList";
import RevisionYearDetail from "@/pages/RevisionYearDetail";
import Reports from "@/pages/Reports";
import PlaceholderPage from "@/pages/PlaceholderPage";
import EvaluationCheck from "@/pages/EvaluationCheck";
import EvaluationScore from "@/pages/EvaluationScore";
import EvaluationHistory from "@/pages/EvaluationHistory";
import LongtermDashboard from "@/pages/LongtermDashboard";
import LongtermItems from "@/pages/LongtermItems";
import LongtermHistory from "@/pages/LongtermHistory";
import LongtermSimulation from "@/pages/LongtermSimulation";
import LongtermAnalysis from "@/pages/LongtermAnalysis";
import ConsultationChat from "@/pages/ConsultationChat";
import ConsultationHistory from "@/pages/ConsultationHistory";
import MinutesList from "@/pages/MinutesList";
import MinutesImport from "@/pages/MinutesImport";
import MinutesGenerate from "@/pages/MinutesGenerate";
import MinutesActions from "@/pages/MinutesActions";
import ProposalsList from "@/pages/ProposalsList";
import ProposalsGenerate from "@/pages/ProposalsGenerate";
import ProposalsEdit from "@/pages/ProposalsEdit";
import NotFound from "@/pages/not-found";
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
        <Route path="/condominiums/:id/issues" component={IssueManagement} />
        <Route path="/condominiums/:condominiumId/minutes/:minuteId" component={MinuteDetail} />
        <Route path="/revision-years" component={RevisionYearList} />
        <Route path="/revision-years/:id" component={RevisionYearDetail} />
        <Route path="/reports" component={Reports} />

        <Route path="/evaluation/check" component={EvaluationCheck} />
        <Route path="/evaluation/score" component={EvaluationScore} />
        <Route path="/evaluation/history" component={EvaluationHistory} />

        <Route path="/ai-revision">
          {() => <PlaceholderPage title="AI改訂案生成" icon={Sparkles} />}
        </Route>
        <Route path="/knowledge">
          {() => <PlaceholderPage title="ナレッジベース" icon={BookOpen} />}
        </Route>

        <Route path="/longterm/dashboard" component={LongtermDashboard} />
        <Route path="/longterm/items" component={LongtermItems} />
        <Route path="/longterm/history" component={LongtermHistory} />
        <Route path="/longterm/simulation" component={LongtermSimulation} />
        <Route path="/longterm/analysis" component={LongtermAnalysis} />

        <Route path="/consultation/chat" component={ConsultationChat} />
        <Route path="/consultation/history" component={ConsultationHistory} />

        <Route path="/minutes/list" component={MinutesList} />
        <Route path="/minutes/import" component={MinutesImport} />
        <Route path="/minutes/generate" component={MinutesGenerate} />
        <Route path="/minutes/actions" component={MinutesActions} />

        <Route path="/proposals/list" component={ProposalsList} />
        <Route path="/proposals/generate" component={ProposalsGenerate} />
        <Route path="/proposals/edit" component={ProposalsEdit} />

        <Route path="/settings">
          {() => <PlaceholderPage title="設定" icon={Settings} />}
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
