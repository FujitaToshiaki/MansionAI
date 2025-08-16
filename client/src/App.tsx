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
import NotFound from "@/pages/not-found";

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
