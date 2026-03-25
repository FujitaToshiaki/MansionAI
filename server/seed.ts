/**
 * マスターシードスクリプト
 *
 * 新しい環境でDBを初期状態に復元するために使います。
 *
 * 実行方法:
 *   npx tsx server/seed.ts
 *
 * 各シーダーはべき等（既にデータがあればスキップ）なので、
 * 何度実行しても安全です。
 *
 * 実行順序（外部キー制約に従う）:
 *   1. condominiums
 *   2. revision_headers
 *   3. documents
 *   4. regulation_revisions  (revision_groups → regulation_revisions)
 *   5. regulation_analysis_results
 *   6. long_term_data        (long_term_plans, repair_items, repair_history)
 *   7. consultation_data     (consultation_logs, meeting_recordings)
 *   8. proposals_and_actions (proposals, action_items)
 *   9. evaluation_data       (evaluation_items_master, evaluation_checks)
 */

import { pool } from "./db";
import { seedCondominiums } from "./seedCondominiums";
import { seedRevisionHeaders } from "./seedRevisionHeaders";
import { seedDocuments } from "./seedDocuments";
import { seedRegulationRevisions } from "./seedRegulationRevisions";
import { seedRegulationAnalysisResults } from "./seedRegulationAnalysisResults";
import { seedLongTermData } from "./seedLongTermData";
import { seedConsultationData } from "./seedConsultationData";
import { seedProposalsAndActions } from "./seedProposalsAndActions";
import { seedEvaluationData } from "./seedEvaluationData";

async function main() {
  console.log("=================================================");
  console.log("[SEED] マスターシード開始");
  console.log("=================================================");

  const steps: { name: string; fn: () => Promise<void> }[] = [
    { name: "condominiums",               fn: seedCondominiums },
    { name: "revision_headers",            fn: seedRevisionHeaders },
    { name: "documents",                   fn: seedDocuments },
    { name: "regulation_revisions",        fn: seedRegulationRevisions },
    { name: "regulation_analysis_results", fn: seedRegulationAnalysisResults },
    { name: "long_term_data",              fn: seedLongTermData },
    { name: "consultation_data",           fn: seedConsultationData },
    { name: "proposals_and_actions",       fn: seedProposalsAndActions },
    { name: "evaluation_data",             fn: seedEvaluationData },
  ];

  let success = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await step.fn();
      success++;
    } catch (err) {
      console.error(`[SEED] ❌ ${step.name} の投入に失敗:`, err);
      failed++;
    }
  }

  console.log("=================================================");
  console.log(`[SEED] 完了: 成功=${success} 失敗=${failed}`);
  console.log("=================================================");

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[SEED] 予期せぬエラー:", err);
  process.exit(1);
});
