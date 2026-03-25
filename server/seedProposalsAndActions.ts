import { pool } from "./db";

const MAISON_ID = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

export async function seedProposalsAndActions() {
  try {
    console.log("[SEED] Starting proposals, action_items seed...");

    // ── proposals ──────────────────────────────────────────────────
    const { rows: propRows } = await pool.query(
      "SELECT COUNT(*) FROM proposals WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(propRows[0].count) === 0) {
      const proposals = [
        {
          title: "管理規約改訂（ペット飼育規定・民泊禁止条項追加）",
          category: "規約改訂",
          meetingType: "general",
          scheduledDate: "2026-10-25",
          content: "1. ペット飼育規定の新設（第○条）：小型犬・猫のみ届出制で許可。体重10kg以下。\n2. 民泊禁止条項の追加（第○条）：住宅宿泊事業法に基づく届出営業を禁止。",
          result: "pending",
          votingResults: null,
          status: "submitted",
        },
        {
          title: "大規模修繕工事実施の件（EV更新・外壁塗装）",
          category: "修繕",
          meetingType: "general",
          scheduledDate: "2026-10-25",
          content: "第42期大規模修繕工事の実施承認。\n対象工事：エレベーター更新（1号機・2号機）各5,000万円、外壁塗装2,500万円、計画総額1億2,500万円。\n工期：2027年4月〜2027年10月（7ヶ月）。財源：修繕積立金から充当。",
          result: "pending",
          votingResults: null,
          status: "submitted",
        },
        {
          title: "管理費改定の件（月額8,500円→9,000円）",
          category: "管理費",
          meetingType: "general",
          scheduledDate: "2026-10-25",
          content: "管理費改定の承認。\n現行：月額8,500円/戸 → 改定後：月額9,000円/戸（5.9%値上げ）\n理由：清掃業務費・警備費・光熱費の上昇。改定時期：令和9年1月1日から。",
          result: "pending",
          votingResults: null,
          status: "draft",
        },
      ];

      for (const p of proposals) {
        await pool.query(
          `INSERT INTO proposals
             (condominium_id, title, category, meeting_type, scheduled_date, content, result, voting_results, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [MAISON_ID, p.title, p.category, p.meetingType, p.scheduledDate,
           p.content, p.result, p.votingResults ? JSON.stringify(p.votingResults) : null, p.status]
        );
      }
      console.log("[SEED] proposals: " + proposals.length + "件投入");
    } else {
      console.log("[SEED] proposals: already seeded, skipping.");
    }

    // ── action_items ───────────────────────────────────────────────
    const { rows: actionRows } = await pool.query(
      "SELECT COUNT(*) FROM action_items WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(actionRows[0].count) === 0) {
      const actions = [
        {
          sourceType: "proposal",
          title: "EV更新工事業者選定・契約",
          description: "エレベーター更新工事（1号機・2号機）の施工業者選定と契約締結。見積もり3社以上取得のこと。",
          assignee: "修繕 未来",
          dueDate: "2026-08-31",
          status: "in_progress",
          priority: "high",
        },
        {
          sourceType: "proposal",
          title: "管理規約改訂案の最終確認・印刷",
          description: "総会提出用管理規約改訂案の法務確認完了後、総会資料として印刷・配布準備。",
          assignee: "佐藤花子",
          dueDate: "2026-09-30",
          status: "open",
          priority: "high",
        },
        {
          sourceType: "meeting_minutes",
          title: "騒音クレーム（305号室→406号室）フォローアップ",
          description: "注意文書送付後の状況確認。改善されない場合は理事会で対応策を協議。",
          assignee: "修繕 未来",
          dueDate: "2025-12-01",
          status: "completed",
          priority: "medium",
        },
        {
          sourceType: "consultation",
          title: "長期修繕計画第3版策定スケジュール立案",
          description: "2028年を目標に第3版策定のスケジュールを立案。専門家（マンション管理士・建築士）への相談も含む。",
          assignee: "修繕 未来",
          dueDate: "2027-04-01",
          status: "open",
          priority: "medium",
        },
        {
          sourceType: "proposal",
          title: "管理費改定の居住者向け説明資料作成",
          description: "管理費値上げ理由・内訳を記載した居住者向け説明資料の作成。総会2ヶ月前に配布予定。",
          assignee: "佐藤花子",
          dueDate: "2026-08-31",
          status: "open",
          priority: "medium",
        },
      ];

      for (const a of actions) {
        await pool.query(
          `INSERT INTO action_items
             (condominium_id, source_type, title, description, assignee, due_date, status, priority)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [MAISON_ID, a.sourceType, a.title, a.description, a.assignee,
           a.dueDate, a.status, a.priority]
        );
      }
      console.log("[SEED] action_items: " + actions.length + "件投入");
    } else {
      console.log("[SEED] action_items: already seeded, skipping.");
    }

  } catch (error) {
    console.error("[SEED] Error seeding proposals and actions:", error);
    throw error;
  }
}
