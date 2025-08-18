import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Calendar, Target, Database, Lightbulb, Languages, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const languages = {
  ja: { name: '日本語', flag: '🇯🇵' },
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  fil: { name: 'Filipino', flag: '🇵🇭' }
};

export default function RegulationRevisionDetail() {
  const { id, revisionId } = useParams();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('ja');

  const { data: condominium } = useQuery({
    queryKey: ['/api/condominiums', id],
  });

  const { data: revisionDetail } = useQuery({
    queryKey: ['/api/condominiums', id, 'regulation-analysis', revisionId],
  });

  // Get related decisions from decision history
  const { data: decisions } = useQuery({
    queryKey: ['/api/condominiums', id, 'decisions'],
  });

  // Get related decisions based on revision type
  const getRelatedDecisions = () => {
    if (!decisions || !revisionDetail) return [];
    
    // Define keywords based on revision title
    let keywords: string[] = [];
    const revisionTitle = revisionDetail?.title?.toLowerCase() || '';
    
    if (revisionTitle.includes('ペット') || revisionTitle.includes('動物') || revisionTitle.includes('飼育')) {
      keywords = ['動物', 'ペット', '飼育', '犬', '猫', 'バイク', '自転車', '駐車', '駐輪'];
    } else if (revisionTitle.includes('個人情報') || revisionTitle.includes('プライバシー')) {
      keywords = ['個人情報', 'プライバシー', '情報保護', '情報管理', '管理規約'];
    } else if (revisionTitle.includes('駐車') || revisionTitle.includes('車庫')) {
      keywords = ['駐車', '車庫', '自動車', '駐車場', 'バイク', 'オートバイ'];
    } else if (revisionTitle.includes('看板') || revisionTitle.includes('広告')) {
      keywords = ['看板', '広告', '表示', '掲示', '管理規約'];
    } else {
      // General keywords for any regulation revision
      keywords = ['管理規約', '規約', '改正', '改訂', '変更', '修正'];
    }
    
    const filteredDecisions = decisions.filter((decision: any) => {
      const agenda = decision.agenda?.toLowerCase() || '';
      const category = decision.category?.toLowerCase() || '';
      const relatedArticle = decision.relatedArticle?.toLowerCase() || '';
      
      return keywords.some(keyword => 
        agenda.includes(keyword) || 
        category.includes(keyword) || 
        relatedArticle.includes(keyword)
      );
    });
    
    // Sort by date (most recent first) and limit to 5 most relevant decisions
    return filteredDecisions.sort((a: any, b: any) => {
      // Parse dates like "2024年10月", "2024年8月", etc.
      const parseJapaneseDate = (dateStr: string) => {
        const match = dateStr.match(/(\d{4})年(\d{1,2})月/);
        if (match) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1);
        }
        return new Date('1900-01-01');
      };
      
      const aDate = parseJapaneseDate(a.meetingDate || '1900年1月');
      const bDate = parseJapaneseDate(b.meetingDate || '1900年1月');
      return bDate.getTime() - aDate.getTime();
    }).slice(0, 5);
  };

  // Get revision-specific current text
  const getRevisionSpecificCurrentText = (title: string | undefined) => {
    const titleLower = title?.toLowerCase() || '';
    
    if (titleLower.includes('ペット') || titleLower.includes('動物') || titleLower.includes('飼育')) {
      return '第18条 専有部分における動物の飼育は禁止する。';
    } else if (titleLower.includes('個人情報')) {
      return '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。';
    } else if (titleLower.includes('駐車') || titleLower.includes('車庫')) {
      return '第20条 敷地内の駐車場使用については、理事会が別に定める使用細則によるものとする。';
    } else if (titleLower.includes('看板') || titleLower.includes('広告')) {
      return '第25条 共用部分への看板等の設置は、管理組合の承認を得なければならない。';
    }
    
    return '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。';
  };

  // Get revision-specific proposed text
  const getRevisionSpecificProposedText = (title: string | undefined) => {
    const titleLower = title?.toLowerCase() || '';
    
    if (titleLower.includes('ペット') || titleLower.includes('動物') || titleLower.includes('飼育')) {
      return '第18条 専有部分における動物の飼育は、理事会の承認を得た場合に限り認める。ただし、小型犬・猫に限定し、1戸につき1匹までとし、共用部分での放し飼いは禁止する。また、他の居住者の迷惑となる鳴き声、臭気等を発生させてはならない。';
    } else if (titleLower.includes('個人情報')) {
      return '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。管理組合は、個人情報保護に関する基本方針を定め、適切な安全管理措置を講ずるものとする。';
    } else if (titleLower.includes('駐車') || titleLower.includes('車庫')) {
      return '第20条 敷地内の駐車場使用については、理事会が定める使用細則によるものとする。駐車場の使用権は区分所有者に限定し、月額使用料は理事会が決定する。また、電気自動車の充電設備設置についても、理事会の承認を必要とする。';
    } else if (titleLower.includes('看板') || titleLower.includes('広告')) {
      return '第25条 共用部分への看板、広告等の設置・表示については、事前に管理組合の書面による承認を得なければならない。承認にあたっては、景観への配慮、安全性の確保、近隣住民への配慮を総合的に判断するものとする。';
    }
    
    return '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。';
  };

  // Translation function
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'ja') return text;
    
    // Mock translation for demo purposes - in real implementation, use translation API
    const translations: Record<string, Record<string, string>> = {
      en: {
        '個人情報保護規定の追加': 'Addition of Personal Information Protection Regulations',
        '看板、広告等の設置、表示等の承認': 'Approval of Installation and Display of Signs and Advertisements',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Article 18 or attached documents regarding the installation and display of signs and advertisements in condominiums, specific unit owners or other related parties shall be approved to use the land and common areas of the building according to the provisions listed below, excluding item 1 but including item 2, section 5.',
        '改訂詳細': 'Revision Details',
        '改訂理由': 'Revision Reason',
        '規約の変更内容': 'Regulation Changes',
        '現在の規約条文': 'Current Regulation Article',
        '新しい規約条文': 'New Regulation Article',
        '変更のポイント': 'Key Changes',
        '実施スケジュール': 'Implementation Schedule',
        '実施手順': 'Implementation Procedures',
        '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。': 'To comply with the revised Personal Information Protection Act, it is necessary to strengthen regulations regarding the handling of personal information. Since the current regulations do not meet the standards required by law, revisions will be made with approval from the general meeting.',
        '改正個人情報保護法への対応が必要': 'Response to revised Personal Information Protection Act required',
        '法的根拠の明確化': 'Clarification of legal basis',
        '法適用範囲への統一': 'Unification of legal application scope',
        '利用条件の明確化': 'Clarification of usage conditions',
        '実施期間': 'Implementation Period',
        '法改正対応のため': 'To respond to legal revision',
        '3ヶ月以内に実施完了': 'Complete implementation within 3 months',
        '理事会での議案準備': 'Prepare agenda at board meeting',
        '改訂案・議事録作成（1～2週間）': 'Prepare revision proposal and meeting minutes (1-2 weeks)',
        '組合員への事前通知': 'Advance notice to union members',
        '総会関連資料作成（2週間前必須）': 'Create general meeting materials (required 2 weeks prior)',
        '臨時総会での決議': 'Resolution at extraordinary general meeting',
        '改訂規約の施行': 'Enforcement of revised regulations',
        '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。': 'Article 15: The management association shall properly manage the personal information of unit owners and residents, and use it only when necessary.',
        '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。': 'Article 15: The management association shall handle the personal information of unit owners and residents appropriately based on the Personal Information Protection Act (Act No. 57 of 2003), and shall not use it for purposes other than those for which consent has been obtained from the individual or as required by law.',
        '法的要件を完全満足': 'Fully meets legal requirements',
        '法的根拠が不明確': 'Legal basis is unclear'
      },
      zh: {
        '個人情報保護規定の追加': '个人信息保护规定的追加',
        '看板、広告等の設置、表示等の承認': '招牌、广告等的设置、显示等的批准',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': '第18条或附属文件中关于公寓招牌、广告等的设置、显示等，特定区分所有者或其他附属拥有者按照以下各项规定，对土地以及建筑物的共用部分（除第1项外，按第2条第5项）进行专用使用予以批准。',
        '改訂詳細': '修订详情',
        '改訂理由': '修订理由',
        '規約の変更内容': '规约变更内容',
        '現在の規約条文': '现行规约条文',
        '新しい規約条文': '新的规约条文',
        '変更のポイント': '变更要点',
        '実施スケジュール': '实施进度',
        '実施手順': '实施步骤',
        '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。': '为了应对修订的个人信息保护法，需要加强关于个人信息处理的规定。由于现行规约不满足法律要求的标准，将通过总会批准进行修订。',
        '改正個人情報保護法への対応が必要': '需要应对修订个人信息保护法',
        '法的根拠の明確化': '法律依据明确化',
        '法適用範囲への統一': '统一法律适用范围',
        '利用条件の明確化': '使用条件明确化',
        '実施期間': '实施期间',
        '法改正対応のため': '为应对法律修订',
        '3ヶ月以内に実施完了': '3个月内完成实施',
        '理事会での議案準備': '理事会准备议案',
        '改訂案・議事録作成（1～2週間）': '制定修订案和会议记录（1-2周）',
        '組合員への事前通知': '提前通知组合成员',
        '総会関連資料作成（2週間前必須）': '制作总会相关资料（必须提前2周）',
        '臨時総会での決議': '临时总会决议',
        '改訂規約の施行': '修订规约的施行',
        '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。': '第15条 管理组合应适当管理区分所有者和居住者的个人信息，仅在必要时使用。',
        '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。': '第15条 管理组合根据个人信息保护法（平成15年法律第57号），应适当处理区分所有者和居住者的个人信息，除获得本人同意或基于法令的情况外，不得进行目的外使用。',
        '法的要件を完全満足': '完全满足法律要求',
        '法的根拠が不明確': '法律依据不明确'
      },
      ko: {
        '個人情報保護規定の追加': '개인정보보호 규정 추가',
        '看板、広告等の設置、表示等の承認': '간판, 광고 등의 설치, 표시 등의 승인',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': '제18조 또는 첨부서류에서 맨션의 간판, 광고 등의 설치·표시 등에 대해 특정 구분소유자 또는 기타 부속 소유자가 다음 각호의 규정에 따라 부지 및 건물의 공용부분 또는 제1호를 제외하고 제2조 제5항에 의해 전용사용하는 것을 승인한다.',
        '改訂詳細': '개정 상세',
        '改訂理由': '개정 이유',
        '規約の変更内容': '규약 변경 내용',
        '現在の規約条文': '현재 규약 조문',
        '新しい規約条文': '새로운 규약 조문',
        '変更のポイント': '변경 포인트',
        '実施スケジュール': '실시 일정',
        '実施手順': '실시 절차',
        '改正個人情報保護法への対応が必要': '개정 개인정보보호법 대응 필요',
        '法的根拠の明確化': '법적 근거 명확화',
        '法適用範囲への統一': '법 적용 범위 통일',
        '利用条件の明確化': '이용 조건 명확화',
        '実施期間': '실시 기간',
        '法改正対応のため': '법 개정 대응을 위해',
        '3ヶ月以内に実施完了': '3개월 이내 실시 완료',
        '理事会での議案準備': '이사회에서 의안 준비',
        '改訂案・議事録作成（1～2週間）': '개정안·회의록 작성 (1～2주)',
        '組合員への事前通知': '조합원에게 사전 통지',
        '総会関連資料作成（2週間前必須）': '총회 관련 자료 작성 (2주 전 필수)',
        '臨時総会での決議': '임시총회에서 결의',
        '改訂規約の施行': '개정 규약 시행',
        '法的要件を完全満足': '법적 요건 완전 충족',
        '法的根拠が不明確': '법적 근거가 불분명',
        '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。': '개정 개인정보보호법에 대응하기 위해 개인정보 취급에 관한 규정을 강화할 필요가 있습니다. 현행 규약으로는 법률이 요구하는 기준을 충족하지 못하기 때문에 총회 승인을 받아 개정을 실시합니다.',
        '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。': '제15조 관리조합은 구분소유자 및 거주자의 개인정보를 적절히 관리하고, 필요한 경우에만 이용하는 것으로 한다.',
        '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。': '제15조 관리조합은 개인정보의 보호에 관한 법률(평성15년 법률 제57호)에 따라 구분소유자 및 거주자의 개인정보를 적정하게 취급하고, 본인의 동의를 얻은 경우 또는 법령에 근거한 경우를 제외하고는 목적 외 이용을 해서는 안 된다.'
      },
      vi: {
        '個人情報保護規定の追加': 'Bổ sung quy định bảo vệ thông tin cá nhân',
        '看板、広告等の設置、表示等の承認': 'Phê duyệt việc lắp đặt, hiển thị biển báo, quảng cáo, v.v.',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Điều 18 hoặc tài liệu đính kèm về việc lắp đặt và hiển thị biển báo, quảng cáo tại chung cư, chủ sở hữu phân khu cụ thể hoặc các chủ sở hữu phụ thuộc khác được phê duyệt sử dụng khu đất và các khu vực chung của tòa nhà theo các quy định dưới đây, ngoại trừ khoản 1, theo khoản 5 Điều 2.',
        '改訂詳細': 'Chi tiết sửa đổi',
        '改訂理由': 'Lý do sửa đổi',
        '規約の変更内容': 'Nội dung thay đổi quy định',
        '現在の規約条文': 'Điều khoản quy định hiện tại',
        '新しい規約条文': 'Điều khoản quy định mới',
        '変更のポイント': 'Điểm thay đổi',
        '実施スケジュール': 'Lịch trình thực hiện',
        '実施手順': 'Quy trình thực hiện',
        '改正個人情報保護法への対応が必要': 'Cần đáp ứng Luật Bảo vệ Thông tin Cá nhân sửa đổi',
        '法的根拠の明確化': 'Làm rõ căn cứ pháp lý',
        '法適用範囲への統一': 'Thống nhất phạm vi áp dụng pháp luật',
        '利用条件の明確化': 'Làm rõ điều kiện sử dụng',
        '実施期間': 'Thời gian thực hiện',
        '法改正対応のため': 'Để đáp ứng sửa đổi pháp luật',
        '3ヶ月以内に実施完了': 'Hoàn thành thực hiện trong 3 tháng',
        '理事会での議案準備': 'Chuẩn bị đề án tại hội đồng quản trị',
        '改訂案・議事録作成（1～2週間）': 'Tạo đề án sửa đổi và biên bản (1-2 tuần)',
        '組合員への事前通知': 'Thông báo trước cho thành viên hiệp hội',
        '総会関連資料作成（2週間前必須）': 'Tạo tài liệu liên quan đại hội (bắt buộc 2 tuần trước)',
        '臨時総会での決議': 'Nghị quyết tại đại hội bất thường',
        '改訂規約の施行': 'Thi hành quy định sửa đổi',
        '法的要件を完全満足': 'Đáp ứng đầy đủ yêu cầu pháp lý',
        '法的根拠が不明確': 'Căn cứ pháp lý không rõ ràng',
        '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。': 'Để đáp ứng Luật Bảo vệ Thông tin Cá nhân sửa đổi, cần tăng cường các quy định về xử lý thông tin cá nhân. Vì quy định hiện tại không đáp ứng tiêu chuẩn do pháp luật yêu cầu, việc sửa đổi sẽ được thực hiện sau khi có sự phê duyệt từ đại hội.',
        '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。': 'Điều 15: Hiệp hội quản lý phải quản lý thông tin cá nhân của chủ sở hữu đơn vị và cư dân một cách thích hợp, chỉ sử dụng khi cần thiết.',
        '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。': 'Điều 15: Hiệp hội quản lý phải xử lý thông tin cá nhân của chủ sở hữu đơn vị và cư dân một cách thích hợp dựa trên Luật Bảo vệ Thông tin Cá nhân (Luật số 57 năm 2003), và không được sử dụng cho mục đích khác ngoài trường hợp đã có sự đồng ý của cá nhân hoặc theo yêu cầu của pháp luật.'
      },
      fil: {
        '個人情報保護規定の追加': 'Pagdagdag ng mga regulasyon sa proteksyon ng personal na impormasyon',
        '看板、広告等の設置、表示等の承認': 'Pag-apruba sa pag-install at pagpapakita ng mga signboard, advertising, atbp.',
        '第18条又は付属書類をマンションにおける看板、広告等の設置・表示等について特定の区分所有者又は、その他付属有者が次の各号下の定めに従って敷地、並びに建物の共用部分又は、第1号を除き第2条第5項により専用使用することを承認するものとする。': 'Artikulo 18 o mga kasamang dokumento tungkol sa pag-install at pagpapakita ng mga signboard at advertising sa condominium, ang mga specific na unit owner o iba pang kaugnay na may-ari ay aprubado na gamitin ang lupa at mga common area ng gusali ayon sa mga sumusunod na probisyon, maliban sa item 1, sa pamamagitan ng seksyon 5 ng Artikulo 2.',
        '改訂詳細': 'Mga Detalye ng Rebisyon',
        '改訂理由': 'Dahilan ng Rebisyon',
        '規約の変更内容': 'Mga Pagbabago sa Regulasyon',
        '現在の規約条文': 'Kasalukuyang Artikulo ng Regulasyon',
        '新しい規約条文': 'Bagong Artikulo ng Regulasyon',
        '変更のポイント': 'Mga Puntong Pagbabago',
        '実施スケジュール': 'Takda ng Pagpapatupad',
        '実施手順': 'Mga Hakbang sa Pagpapatupad',
        '改正個人情報保護法への対応が必要': 'Kailangan tumugon sa binagong Personal Information Protection Act',
        '法的根拠の明確化': 'Paglilinaw ng legal na batayan',
        '法適用範囲への統一': 'Pagkakaisa sa saklaw ng aplikasyon ng batas',
        '利用条件の明確化': 'Paglilinaw ng mga kondisyon ng paggamit',
        '実施期間': 'Panahon ng pagpapatupad',
        '法改正対応のため': 'Para sa pagtugon sa pagbabago ng batas',
        '3ヶ月以内に実施完了': 'Kumpletuhing pagpapatupad sa loob ng 3 buwan',
        '理事会での議案準備': 'Paghahanda ng agenda sa board meeting',
        '改訂案・議事録作成（1～2週間）': 'Paggawa ng revision proposal at minutes (1-2 linggo)',
        '組合員への事前通知': 'Advance notice sa mga miyembro ng union',
        '総会関連資料作成（2週間前必須）': 'Paggawa ng mga materyales na may kinalaman sa general meeting (required 2 linggo bago)',
        '臨時総会での決議': 'Resolusyon sa special general meeting',
        '改訂規約の施行': 'Pagpapatupad ng binagong mga regulasyon',
        '法的要件を完全満足': 'Lubos na natutugunan ang mga legal na requirement',
        '法的根拠が不明確': 'Hindi malinaw ang legal na batayan',
        '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。': 'Upang tumugon sa binagong Personal Information Protection Act, kailangan palakasin ang mga regulasyon tungkol sa pangangalaga ng personal na impormasyon. Dahil ang kasalukuyang mga regulasyon ay hindi natutugunan ang mga pamantayang hinihiling ng batas, gagawin ang mga rebisyon na may pahintulot mula sa general meeting.',
        '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。': 'Artikulo 15: Ang management association ay dapat na tamang pamahalaan ang personal na impormasyon ng mga unit owner at mga residente, at gamitin lamang kapag kinakailangan.',
        '第15条 管理組合は、個人情報の保護に関する法律（平成15年法律第57号）に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。': 'Artikulo 15: Ang management association ay dapat na tamang pangasiwaan ang personal na impormasyon ng mga unit owner at mga residente batay sa Personal Information Protection Act (Act No. 57 ng 2003), at hindi gagamitin para sa iba pang layunin maliban sa mga pagkakaon na may pahintulot ng indibidwal o ayon sa batas.'
      }
    };
    
    return translations[targetLanguage]?.[text] || text;
  };

  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  // Helper function to get translated text
  const getTranslatedText = (text: string): string => {
    if (currentLanguage === 'ja') return text;
    return translatedContent[text] || text;
  };

  // Update translations when language changes
  useEffect(() => {
    if (currentLanguage === 'ja' || !revisionDetail) return;

    const textsToTranslate = [
      revisionDetail?.title || '',
      '改訂詳細',
      '改訂理由',
      '規約の変更内容',
      '現在の規約条文',
      '新しい規約条文',
      '変更のポイント',
      '実施スケジュール',
      '実施手順',
      '改正個人情報保護法への対応が必要',
      '法的根拠の明確化',
      '法適用範囲への統一',
      '利用条件の明確化',
      '実施期間',
      '法改正対応のため',
      '3ヶ月以内に実施完了',
      '理事会での議案準備',
      '改訂案・議事録作成（1～2週間）',
      '組合員への事前通知',
      '総会関連資料作成（2週間前必須）',
      '臨時総会での決議',
      '改訂規約の施行',
      '法的要件を完全満足',
      '法的根拠が不明確',
      revisionDetail?.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。',
      revisionDetail?.currentText || '第15条 管理組合は、区分所有者および居住者の個人情報を適切に管理し、必要な場合にのみ利用するものとする。',
      revisionDetail?.proposedText || '第15条 管理組合は、個人情報の保護に関する法律に基づき、区分所有者および居住者の個人情報を適正に取り扱い、本人の同意を得た場合または法令に基づく場合を除き、目的外利用を行ってはならない。'
    ];

    Promise.all(
      textsToTranslate.map(async (text) => ({
        original: text,
        translated: await translateText(text, currentLanguage)
      }))
    ).then(results => {
      const newTranslations: Record<string, string> = {};
      results.forEach(({ original, translated }) => {
        newTranslations[original] = translated;
      });
      setTranslatedContent(newTranslations);
    });
  }, [currentLanguage, revisionDetail]);

  if (!revisionDetail) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">詳細情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/condominiums" className="hover:text-gray-700">マンション一覧</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}`} className="hover:text-gray-700">{condominium?.name || ''}</Link>
        <span className="mx-2">{'>'}</span>
        <Link href={`/condominiums/${id}/regulation-analysis`} className="hover:text-gray-700">規約改訂分析</Link>
        <span className="mx-2">{'>'}</span>
        <span>改訂詳細</span>
      </nav>

      {/* Header with All Content - Single Unified Card */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <h1 className="text-xl font-bold">{getTranslatedText(revisionDetail?.title || '')}</h1>
                <Badge variant={
                  revisionDetail?.impact === 'high' ? 'destructive' :
                  revisionDetail?.impact === 'medium' ? 'secondary' : 'outline'
                }>
                  {revisionDetail?.impact === 'high' ? '緊急度：高' :
                   revisionDetail?.impact === 'medium' ? '緊急度：中' : '緊急度：低'}
                </Badge>
                {revisionDetail?.lawRevisionRequired && (
                  <Badge variant="outline">法改正対応</Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">{getTranslatedText('改訂詳細')} - {revisionDetail?.article || ''}</p>
            </div>
            
            {/* Language Selector and Back Button */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4 text-gray-500" />
                <Select value={currentLanguage} onValueChange={(value: keyof typeof languages) => setCurrentLanguage(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      {languages[currentLanguage].flag} {languages[currentLanguage].name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, lang]) => (
                      <SelectItem key={code} value={code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Link href={`/condominiums/${id}/regulation-analysis`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Reason Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-3">{getTranslatedText('改訂理由')}</h3>
            <p className="text-gray-700 leading-relaxed">
              {getTranslatedText(revisionDetail?.reason || '改正個人情報保護法に対応するため、個人情報の取り扱いに関する規定を強化する必要があります。現行の規約では法律が求める基準を満たしていないため、総会での承認を得て改訂を行います。')}
            </p>
          </div>

          {/* 規約の変更内容 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium mb-6">{getTranslatedText('規約の変更内容')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">現行</span>
                  <h4 className="font-medium text-gray-700">{getTranslatedText('現在の規約条文')}</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {getTranslatedText(revisionDetail?.currentText || getRevisionSpecificCurrentText(revisionDetail?.title))}
                  </p>
                  <div className="text-sm text-red-600">
                    ⚠️ {getTranslatedText('法的根拠が不明確')}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mr-3">改訂案</span>
                  <h4 className="font-medium text-gray-700">{getTranslatedText('新しい規約条文')}</h4>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm leading-relaxed mb-3">
                    {getTranslatedText(revisionDetail?.proposedText || getRevisionSpecificProposedText(revisionDetail?.title))}
                  </p>
                  <div className="text-sm text-green-600">
                    ✅ {getTranslatedText('法的要件を完全満足')}
                  </div>
                </div>
              </div>
            </div>

            {/* 変更のポイント - 最下段に配置 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-3">{getTranslatedText('変更のポイント')}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#法的根拠の明確化</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#法律用語への統一</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#利用条件の限定強化</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Related Decision History Timeline - 2段目に配置 */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            関連する過去の決議履歴
          </CardTitle>
          <p className="text-gray-600 text-sm mt-1">
            この改訂項目に関連する過去の議論と決議の流れをご確認いただけます
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRelatedDecisions().map((decision, index) => (
              <div key={decision.id} className="relative">
                {/* Timeline line */}
                {index < getRelatedDecisions().length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-12 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {decision.meetingType}
                          </Badge>
                          <span className="text-sm text-gray-600">{decision.meetingDate}</span>
                        </div>
                        <Badge variant={decision.category === '管理規約改定' ? 'default' : 'secondary'} className="text-xs">
                          {decision.category}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2 leading-relaxed">
                        {decision.agenda}
                      </h4>
                      
                      {decision.decision && (
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">決議内容：</span>{decision.decision}
                        </p>
                      )}
                      
                      {decision.relatedArticle && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">関連条文：</span>{decision.relatedArticle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {getRelatedDecisions().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>関連する過去の決議履歴はありません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 実施手順とスケジュール */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {getTranslatedText('実施スケジュール')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">{getTranslatedText('実施期間')}</h3>
              <p className="text-gray-700">
                {getTranslatedText('法改正対応のため')}<br/><strong>{getTranslatedText('3ヶ月以内に実施完了')}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle>{getTranslatedText('実施手順')}（4ステップ）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium">{getTranslatedText('理事会での議案準備')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{getTranslatedText('改訂案・議事録作成（1～2週間）')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium">{getTranslatedText('組合員への事前通知')}</h4>
                  <p className="text-sm text-gray-600 mt-1">{getTranslatedText('総会関連資料作成（2週間前必須）')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium">{getTranslatedText('臨時総会での決議')}</h4>
                  <p className="text-sm text-gray-600 mt-1">4分の3以上の賛成で可決</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium">{getTranslatedText('改訂規約の施行')}</h4>
                  <p className="text-sm text-gray-600 mt-1">決議後即座に効力発生</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* よくある質問と準備事項 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>よくある質問</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 改訂しないとどうなる？</h4>
                <p className="text-sm text-gray-600">
                  個人情報漏洩時の法的責任や行政指導の対象となる可能性があります。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 決議要件は？</h4>
                <p className="text-sm text-gray-600">
                  区分所有者及び議決権の各4分の3以上の賛成が必要です。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 費用はかかる？</h4>
                <p className="text-sm text-gray-600">
                  総会開催費用や司法書士相談費用が発生する場合があります。
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Q. 他のマンションでも実施？</h4>
                <p className="text-sm text-gray-600">
                  多くの管理組合で同様の改訂が行われています。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              準備事項と注意点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">準備すべき資料</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>現行規約と改訂案の対照表</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>法改正説明資料（国交省資料等）</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>総会議事次第と議案書</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                    <span>委任状（欠席者用）</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-3">注意点</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-1">管理会社との調整</h4>
                    <p className="text-sm text-gray-600">
                      管理委託契約の見直しも必要
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-800 mb-1">事前説明の徹底</h4>
                    <p className="text-sm text-gray-600">
                      組合員の理解と協力が重要
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}