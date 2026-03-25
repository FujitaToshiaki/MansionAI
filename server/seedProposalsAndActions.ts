import { pool } from "./db";

const MAISON_ID = "a7af9126-67ff-47d9-9c24-cf4054aeb63c";

export async function seedProposalsAndActions() {
  try {
    console.log("[SEED] Starting proposals, action_items seed...");

    // ── proposals ──────────────────────────────────────────────────
    const proposals = [
      {
        title: "管理規約改訂（ペット飼育規定・民泊禁止条項追加）",
        category: "規約改訂",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "近年、区分所有者によるペット飼育に関するトラブルが増加しており、令和5年度理事会において現行規約の不備が指摘された。また、住宅宿泊事業法（民泊新法）施行以降、マンション内での民泊営業に関する問い合わせが複数寄せられたため、明示的な禁止条項の整備が必要と判断した。法務アドバイザーおよびマンション管理士の監修のもと、改訂案を策定した。",
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
        background: "本マンションのエレベーター（1号機・2号機）は設置後22年が経過し、部品の製造中止品目が増加しており、保守業者より令和8年度中の更新を強く推奨されている。また、外壁の目視調査（令和6年実施）にて複数箇所でひび割れと浮きが確認されており、防水性能の低下が懸念されている。長期修繕計画第2版（令和5年改訂）においても同時期の工事実施が予定されていた。",
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
        background: "令和3年以降の物価上昇に伴い、清掃業務委託費・警備費・光熱費がいずれも10〜15%程度上昇しており、現行の管理費収入では収支が逼迫している。令和6年度末の収支見通しでは年間約85万円の赤字が見込まれるため、令和5年10月の臨時理事会において管理費改定の検討を開始した。管理会社と協議の上、令和9年1月からの改定案を策定した。",
        content: "管理費改定の承認。\n現行：月額8,500円/戸 → 改定後：月額9,000円/戸（5.9%値上げ）\n理由：清掃業務費・警備費・光熱費の上昇。改定時期：令和9年1月1日から。",
        result: "pending",
        votingResults: null,
        status: "draft",
      },
      {
        title: "駐車場使用細則の改訂（EV充電設備設置対応）",
        category: "規約改訂",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "電気自動車（EV）の普及に伴い、駐車場への充電設備設置を希望する区分所有者からの問い合わせが令和5年度より相次いでいる。現行の駐車場使用細則には充電設備の設置に関する規定がなく、個別対応が困難な状況が生じていた。令和6年6月の理事会にて専門委員会を設置し、他のマンション事例を参考に細則改訂案を作成した。",
        content: "駐車場使用細則第○条に「電気自動車充電設備の設置」に関する規定を新設する。\n内容：（1）充電設備の設置は理事会承認制とする。（2）設置費用は申請者負担。（3）電気料金は個別計量により実費精算。（4）退去時の原状回復義務あり。",
        result: "pending",
        votingResults: null,
        status: "submitted",
      },
      {
        title: "屋上防水工事の実施承認",
        category: "修繕",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "令和6年8月の豪雨により、最上階（14階）の複数の住戸で天井からの雨漏りが発生した。緊急調査の結果、屋上防水層の劣化が主因と判明した。防水層の耐用年数は一般的に15〜20年とされており、本マンションの防水工事は平成17年（21年前）が最終施工であったため、更新が急務となっている。速やかな対応のため、今期総会での承認を求める。",
        content: "屋上防水工事の実施を承認する。\n工事範囲：屋上全面（約850㎡）ウレタン防水絶縁工法による全面改修。\n工事費：4,200万円（修繕積立金より充当）。工期：2027年2月〜2027年4月（3ヶ月）。施工会社：3社以上の競争入札により選定。",
        result: "pending",
        votingResults: null,
        status: "decided",
      },
      {
        title: "管理員業務委託契約の更新（株式会社〇〇管理センター）",
        category: "運営",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "現在の管理員業務委託契約は令和8年12月31日をもって契約期間満了となる。現管理員は入居者からの評判も良く、日常業務を適切に遂行しており、理事会として継続を希望している。管理会社との協議の結果、令和9年1月1日から3年間の更新条件について合意に至ったため、区分所有者の承認を求めるものである。",
        content: "管理員業務委託契約の更新を承認する。\n契約相手方：株式会社〇〇管理センター。契約期間：令和9年1月1日〜令和11年12月31日（3年間）。委託費用：月額42万円（現行比1.5%増）。業務内容：現行契約と同等。",
        result: "pending",
        votingResults: null,
        status: "decided",
      },
      {
        title: "修繕積立金の積立額見直しの件",
        category: "管理費",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "国土交通省のガイドライン（平成23年改訂）では、新築時から段階的に積立額を増やすことが推奨されている。本マンションの現行積立額は㎡あたり月額150円と低水準にあり、令和6年度に改訂した長期修繕計画では今後10年間に約3億円の修繕費が見込まれている。現在の積立残高は約1.8億円であり、このままでは不足が生じる見通しのため、計画的な増額が必要と判断した。",
        content: "修繕積立金の積立額を段階的に引き上げる。\n現行：月額㎡あたり150円 → 令和9年1月より㎡あたり180円（20%増）→ 令和11年1月よりさらに200円に引上げ予定。\n標準的な70㎡住戸の場合：現行10,500円 → 12,600円 → 14,000円。",
        result: "pending",
        votingResults: null,
        status: "submitted",
      },
      {
        title: "防犯カメラ増設工事の件（共用部死角解消）",
        category: "運営",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "令和5年に管理組合が実施したアンケートにおいて、防犯に対する不安を訴える居住者が全体の62%に達した。現行の防犯カメラは平成28年設置の8台であり、駐輪場・ゴミ置き場・非常階段入口等に死角が生じている。令和6年7月には自転車盗難が2件発生し、防犯対策強化の要望が高まったことから、理事会にて増設計画を立案した。",
        content: "共用部への防犯カメラ増設工事を実施する。\n増設台数：12台（駐輪場×4、ゴミ置き場×2、非常階段各入口×4、機械室×2）。\n工事費：180万円。録画装置更新費：45万円。管理費会計より支出。設置後は個人情報保護規程を整備し、映像管理規則を制定する。",
        result: "pending",
        votingResults: null,
        status: "archived",
      },
      {
        title: "集会室使用細則の改訂（時間延長・利用料見直し）",
        category: "運営",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "現行の集会室使用細則では使用時間を午前9時から午後9時までと規定しているが、近年、コロナ禍を経てリモートワークや子育てサークル等の利用が増加しており、午前9時以前の利用希望が多く寄せられている。また、利用料金は平成20年の制定以来据え置きとなっており、現行の光熱費水準と乖離が生じているため、見直しを行うこととした。",
        content: "集会室使用細則を以下の通り改訂する。\n（1）使用可能時間：現行「9:00〜21:00」を「8:00〜22:00」に変更。\n（2）利用料金：平日2時間1,000円→1,500円、土日祝2時間1,500円→2,000円に改定。\n（3）商業目的の利用は引き続き禁止。改訂施行日：令和9年1月1日。",
        result: "pending",
        votingResults: null,
        status: "archived",
      },
      {
        title: "マンション管理適正化診断の受診承認",
        category: "その他",
        meetingType: "general",
        scheduledDate: "2026-10-25",
        background: "令和4年の「マンション管理適正化法」改正により、地方自治体によるマンション管理計画認定制度が創設された。認定を受けることで、住宅金融支援機構の融資優遇や管理組合の信頼性向上につながることが期待される。令和6年度に区から案内があり、理事会にてメリットを検討した結果、診断受診を総会に諮ることとした。",
        content: "マンション管理適正化診断サービスを受診し、管理計画認定申請の可否を判断することを承認する。\n診断実施機関：公益財団法人マンション管理センター。費用：5万円（管理費会計より支出）。実施時期：令和9年2月を予定。診断結果は区分所有者に報告し、認定申請の要否を次期理事会にて決定する。",
        result: "pending",
        votingResults: null,
        status: "submitted",
      },
    ];

    // Delete related decisions first (FK constraint), then proposals, then re-insert
    await pool.query(
      `DELETE FROM proposal_related_decisions WHERE proposal_id IN (
         SELECT id FROM proposals WHERE condominium_id = $1
       )`,
      [MAISON_ID]
    );
    await pool.query("DELETE FROM proposals WHERE condominium_id = $1", [MAISON_ID]);
    console.log("[SEED] proposals: deleted existing records (and related decisions)");

    for (const p of proposals) {
      await pool.query(
        `INSERT INTO proposals
           (condominium_id, title, category, meeting_type, scheduled_date, background, content, result, voting_results, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [MAISON_ID, p.title, p.category, p.meetingType, p.scheduledDate,
         p.background, p.content, p.result, p.votingResults ? JSON.stringify(p.votingResults) : null, p.status]
      );
    }
    console.log("[SEED] proposals: " + proposals.length + "件投入");

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
