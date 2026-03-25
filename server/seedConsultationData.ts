import { pool } from "./db";

const MAISON_ID = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

export async function seedConsultationData() {
  try {
    console.log("[SEED] Starting consultation_logs, meeting_recordings seed...");

    // ── consultation_logs ──────────────────────────────────────────
    const { rows: logRows } = await pool.query(
      "SELECT COUNT(*) FROM consultation_logs WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(logRows[0].count) === 0) {
      const logs = [
        {
          category: "クレーム",
          title: "上階からの騒音クレーム対応",
          content: "305号室の居住者から、406号室の深夜騒音について相談あり。子どもの走り回る音が頻繁に聞こえる。",
          response: "406号室に注意文書を送付。管理規約第20条（生活マナー）を案内。1週間後にフォローアップ実施予定。",
          respondedBy: "修繕 未来",
          status: "resolved",
          priority: "medium",
          consultedAt: "2025-11-10T10:00:00Z",
          resolvedAt: "2025-11-17T10:00:00Z",
        },
        {
          category: "法令解釈",
          title: "マンション標準管理規約改正への対応要否確認",
          content: "令和3年管理規約標準改正に伴い、当マンション管理規約の改訂が必要か確認したい。",
          response: "第3条（共用部分の範囲）、第17条（専有部分の修繕等）、第68条（義務違反者への対応）等を要改訂と判断。改訂作業を開始。",
          respondedBy: "修繕 未来",
          status: "resolved",
          priority: "high",
          consultedAt: "2025-08-05T09:00:00Z",
          resolvedAt: "2025-09-30T09:00:00Z",
        },
        {
          category: "運用判断",
          title: "ペット飼育申請の審査基準について",
          content: "規約改正によりペット飼育が条件付きで許可されたが、申請書類の審査基準が不明確。具体的な運用方法を検討したい。",
          response: "審査委員会（理事長・副理事長・管理会社）で審査することを決定。申請様式・審査基準書を新たに作成し総会資料に添付。",
          respondedBy: "修繕 未来",
          status: "resolved",
          priority: "medium",
          consultedAt: "2025-10-20T14:00:00Z",
          resolvedAt: "2025-11-05T14:00:00Z",
        },
        {
          category: "設備",
          title: "エレベーター1号機の異音発生対応",
          content: "1号機エレベーターで8階付近を通過する際に金属音が発生している。複数の居住者から報告あり。",
          response: "保守会社に緊急点検を依頼。ドアレール歪みが原因と判明。部品発注中。修理完了まで速度制限モードで運行。",
          respondedBy: "修繕 未来",
          status: "in_progress",
          priority: "high",
          consultedAt: "2026-02-15T11:00:00Z",
          resolvedAt: null,
        },
        {
          category: "法令解釈",
          title: "長期修繕計画の法定見直しタイミングについて",
          content: "改正区分所有法により長期修繕計画の法定見直し義務化が検討されているが、当マンションの対応時期を確認したい。",
          response: "現行法では義務ではないが推奨。当マンションは第2版（2018年策定）のため、2028年頃に第3版策定を予定するよう理事会に提案済み。",
          respondedBy: "修繕 未来",
          status: "resolved",
          priority: "medium",
          consultedAt: "2026-01-20T15:00:00Z",
          resolvedAt: "2026-02-01T15:00:00Z",
        },
      ];

      for (const log of logs) {
        await pool.query(
          `INSERT INTO consultation_logs
             (condominium_id, category, title, content, response, responded_by, status, priority, consulted_at, resolved_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [MAISON_ID, log.category, log.title, log.content, log.response,
           log.respondedBy, log.status, log.priority, log.consultedAt, log.resolvedAt]
        );
      }
      console.log("[SEED] consultation_logs: " + logs.length + "件投入");
    } else {
      console.log("[SEED] consultation_logs: already seeded, skipping.");
    }

    // ── meeting_recordings ─────────────────────────────────────────
    const { rows: recRows } = await pool.query(
      "SELECT COUNT(*) FROM meeting_recordings WHERE condominium_id = $1",
      [MAISON_ID]
    );
    if (parseInt(recRows[0].count) === 0) {
      const recordings = [
        {
          title: "第41期通常総会（令和7年10月）",
          meetingDate: "2025-10-25",
          duration: 7200,
          transcriptionStatus: "completed",
          transcriptionText: "第41期通常総会議事録の文字起こし。出席者45名。議題：事業報告、収支決算、修繕積立金値上げ、規約改訂、役員改選。修繕積立金値上げ（月額1万円→1.2万円）を賛成多数で可決。",
        },
        {
          title: "第42期第1回理事会（令和8年1月）",
          meetingDate: "2026-01-15",
          duration: 3600,
          transcriptionStatus: "completed",
          transcriptionText: "第42期第1回理事会議事録文字起こし。参加者：理事長・副理事長・理事4名・監事2名・管理会社担当。議題：EV更新工事業者選定、総会議案書案審議。EV更新工事はOTIS社を選定。",
        },
      ];

      for (const rec of recordings) {
        await pool.query(
          `INSERT INTO meeting_recordings
             (condominium_id, title, meeting_date, duration, transcription_status, transcription_text)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [MAISON_ID, rec.title, rec.meetingDate, rec.duration,
           rec.transcriptionStatus, rec.transcriptionText]
        );
      }
      console.log("[SEED] meeting_recordings: " + recordings.length + "件投入");
    } else {
      console.log("[SEED] meeting_recordings: already seeded, skipping.");
    }

  } catch (error) {
    console.error("[SEED] Error seeding consultation data:", error);
    throw error;
  }
}
