import { pool } from "./db";

export async function seedRevisionHeaders() {
  try {
    console.log("[SEED] Starting revision_headers seed check...");

    const { rows } = await pool.query("SELECT COUNT(*) FROM revision_headers");
    const count = parseInt(rows[0].count);
    console.log(`[SEED] Found ${count} existing revision_headers records`);

    if (count > 0) {
      console.log(`[SEED] revision_headers already has ${count} records. Skipping seed.`);
      return;
    }

    console.log("[SEED] Seeding revision_headers data...");

    const headers = [
      {
        id: "3125710f-b498-4949-86e2-b01bc9fcc13a",
        year: 7,
        title: "令和7年度改訂対応",
        description: "令和7年の建物の区分所有等に関する法律改正に対応した標準管理規約の改訂項目",
        status: "in_progress",
        total_items: 16,
        completed_items: 12,
        start_date: "2025-04-01",
        target_completion_date: "2025-12-31",
        revision_type: "law_compliance",
        priority_level: "high",
        assigned_manager: "修繕 未来",
        notes: "法改正への対応を最優先として実施",
      },
      {
        id: "299fca79-500d-4412-bc44-45d82efaf4be",
        year: 6,
        title: "令和6年度改訂対応",
        description: "令和6年度の標準管理規約改正への対応項目",
        status: "completed",
        total_items: 8,
        completed_items: 8,
        start_date: "2024-04-01",
        target_completion_date: "2024-12-31",
        revision_type: "law_compliance",
        priority_level: "medium",
        assigned_manager: "佐藤花子",
        notes: "全項目完了済み",
      },
      {
        id: "659cd2e3-9409-4485-84db-2e04bdfd0057",
        year: 5,
        title: "令和5年度改訂対応",
        description: "令和5年度の内部改善に伴う管理規約の見直し",
        status: "completed",
        total_items: 5,
        completed_items: 5,
        start_date: "2023-04-01",
        target_completion_date: "2023-12-31",
        revision_type: "internal_improvement",
        priority_level: "low",
        assigned_manager: "山田次郎",
        notes: "内部改善として実施済み",
      },
    ];

    for (const h of headers) {
      await pool.query(
        `INSERT INTO revision_headers
           (id, year, title, description, status, total_items, completed_items,
            start_date, target_completion_date, revision_type, priority_level,
            assigned_manager, notes, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          h.id, h.year, h.title, h.description, h.status,
          h.total_items, h.completed_items, h.start_date,
          h.target_completion_date, h.revision_type, h.priority_level,
          h.assigned_manager, h.notes,
        ]
      );
    }

    console.log(`[SEED] Successfully seeded ${headers.length} revision_headers.`);
  } catch (error) {
    console.error("[SEED] Error seeding revision_headers:", error);
    throw error;
  }
}
