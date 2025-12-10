"""Content extractors for meeting decisions and minutes."""

import re
from typing import List, Dict, Any, Optional
from uuid import uuid4


class DecisionExtractor:
    """Extractor for meeting decisions from document content.
    
    Extracts structured decision data from Japanese meeting minutes.
    """

    # Patterns for decision extraction
    DECISION_PATTERNS = [
        # 議題第X号
        r'議題第(\d+)号[：:\s]*(.+?)(?=議題第|$)',
        # 第X号議案
        r'第(\d+)号議案[：:\s]*(.+?)(?=第\d+号議案|$)',
        # 決議事項
        r'決議事項[：:\s]*(.+?)(?=決議事項|$)',
        # 承認の件
        r'(.+?)承認の件',
    ]

    # Categories for classification
    CATEGORIES = {
        "管理規約": ["管理規約", "規約", "改定", "改正", "変更"],
        "修繕工事": ["修繕", "工事", "補修", "改修"],
        "駐車場": ["駐車場", "駐車", "車両"],
        "駐輪場": ["駐輪場", "自転車", "バイク"],
        "ペット飼育": ["ペット", "動物", "犬", "猫"],
        "防犯設備": ["防犯", "カメラ", "セキュリティ"],
        "総会運営": ["総会", "理事会", "役員"],
        "住宅宿泊": ["民泊", "宿泊", "住宅宿泊"],
        "設備追加": ["設備", "宅配ボックス", "設置"],
    }

    def extract_decisions(self, content: str) -> List[Dict[str, Any]]:
        """Extract decisions from document content.
        
        Args:
            content: Full document text
            
        Returns:
            List of decision dictionaries
        """
        decisions = []
        
        # Try each pattern
        for pattern in self.DECISION_PATTERNS:
            matches = re.findall(pattern, content, re.DOTALL)
            for match in matches:
                if isinstance(match, tuple):
                    number = match[0] if len(match) > 1 else None
                    text = match[-1]
                else:
                    number = None
                    text = match
                
                decision = self._parse_decision(text, number)
                if decision and not self._is_duplicate(decision, decisions):
                    decisions.append(decision)
        
        # If no patterns matched, try line-by-line extraction
        if not decisions:
            decisions = self._extract_from_lines(content)
        
        return decisions

    def _parse_decision(
        self, text: str, number: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Parse decision text into structured format.
        
        Args:
            text: Decision text
            number: Decision number if available
            
        Returns:
            Decision dictionary or None
        """
        text = text.strip()
        if not text or len(text) < 10:
            return None
        
        # Extract meeting info
        meeting_date = self._extract_date(text)
        meeting_type = self._extract_meeting_type(text)
        
        # Classify category
        category = self._classify_category(text)
        
        # Extract result
        result = self._extract_result(text)
        
        # Extract related article
        related_article = self._extract_article(text)
        
        return {
            "id": f"decision-{uuid4().hex[:8]}",
            "meetingDate": meeting_date,
            "meetingType": meeting_type,
            "category": category,
            "agenda": text[:200] if len(text) > 200 else text,
            "decision": text,
            "result": result,
            "votingResults": None,
            "relatedArticle": related_article
        }

    def _extract_date(self, text: str) -> str:
        """Extract date from text."""
        # Japanese date patterns
        patterns = [
            r'令和(\d+)年(\d+)月',
            r'(\d{4})年(\d+)月',
            r'R(\d+)\.(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                if pattern.startswith('令和') or pattern.startswith('R'):
                    year = 2018 + int(groups[0])
                else:
                    year = int(groups[0])
                month = int(groups[1])
                return f"{year}年{month}月"
        
        return "日付不明"

    def _extract_meeting_type(self, text: str) -> str:
        """Extract meeting type from text."""
        patterns = [
            r'第(\d+)期(通常|臨時)?総会',
            r'第(\d+)回(通常|臨時)?理事会',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        
        return "総会"

    def _classify_category(self, text: str) -> str:
        """Classify decision into category."""
        for category, keywords in self.CATEGORIES.items():
            for keyword in keywords:
                if keyword in text:
                    return category
        
        return "その他"

    def _extract_result(self, text: str) -> str:
        """Extract decision result."""
        if "承認" in text or "可決" in text:
            return "approved"
        elif "否決" in text or "不承認" in text:
            return "rejected"
        elif "継続審議" in text:
            return "pending"
        
        return "approved"  # Default to approved

    def _extract_article(self, text: str) -> Optional[str]:
        """Extract related regulation article."""
        patterns = [
            r'(管理規約第\d+条[^\s]*)',
            r'(第\d+条[^\s]*)',
            r'(使用細則第\d+条[^\s]*)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None

    def _is_duplicate(
        self, decision: Dict[str, Any], existing: List[Dict[str, Any]]
    ) -> bool:
        """Check if decision is duplicate."""
        for existing_decision in existing:
            if (decision["agenda"] == existing_decision["agenda"] and
                decision["meetingDate"] == existing_decision["meetingDate"]):
                return True
        return False

    def _extract_from_lines(self, content: str) -> List[Dict[str, Any]]:
        """Extract decisions from content line by line."""
        decisions = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for decision indicators
            if any(keyword in line for keyword in ["承認", "決議", "議案", "の件"]):
                decision = self._parse_decision(line)
                if decision:
                    decisions.append(decision)
        
        return decisions


class MinutesExtractor:
    """Extractor for meeting minutes metadata."""

    def extract_minutes(self, content: str) -> List[Dict[str, Any]]:
        """Extract meeting minutes from document content.
        
        Args:
            content: Full document text
            
        Returns:
            List of minutes dictionaries
        """
        minutes = []
        
        # Split by meeting headers
        meeting_pattern = r'(第\d+期.*?(?:通常|臨時)?(?:総会|理事会)議事録)'
        parts = re.split(meeting_pattern, content)
        
        current_title = None
        for part in parts:
            if re.match(meeting_pattern, part):
                current_title = part.strip()
            elif current_title and part.strip():
                minute = self._parse_minute(current_title, part)
                if minute:
                    minutes.append(minute)
                current_title = None
        
        # If no meetings found, create single minute from content
        if not minutes and content.strip():
            minutes.append({
                "id": f"minute-{uuid4().hex[:8]}",
                "title": "議事録",
                "date": self._extract_date(content),
                "meetingType": self._extract_meeting_type(content),
                "attendees": self._extract_attendees(content),
                "summary": content[:500] if len(content) > 500 else content,
                "agendaItems": self._extract_agenda_items(content)
            })
        
        return minutes

    def _parse_minute(self, title: str, content: str) -> Optional[Dict[str, Any]]:
        """Parse minute from title and content."""
        if not content.strip():
            return None
        
        return {
            "id": f"minute-{uuid4().hex[:8]}",
            "title": title,
            "date": self._extract_date(content),
            "meetingType": self._extract_meeting_type(title),
            "attendees": self._extract_attendees(content),
            "summary": content[:500] if len(content) > 500 else content,
            "agendaItems": self._extract_agenda_items(content)
        }

    def _extract_date(self, text: str) -> str:
        """Extract date from text."""
        patterns = [
            r'令和(\d+)年(\d+)月(\d+)日',
            r'(\d{4})年(\d+)月(\d+)日',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        
        return "日付不明"

    def _extract_meeting_type(self, text: str) -> str:
        """Extract meeting type."""
        if "臨時総会" in text:
            return "臨時総会"
        elif "通常総会" in text:
            return "通常総会"
        elif "理事会" in text:
            return "理事会"
        return "総会"

    def _extract_attendees(self, text: str) -> Optional[int]:
        """Extract number of attendees."""
        patterns = [
            r'出席者[：:\s]*(\d+)名',
            r'(\d+)名.*出席',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None

    def _extract_agenda_items(self, text: str) -> List[str]:
        """Extract agenda items."""
        items = []
        
        patterns = [
            r'議題第\d+号[：:\s]*(.+?)(?=議題第|$)',
            r'第\d+号議案[：:\s]*(.+?)(?=第\d+号議案|$)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            for match in matches:
                item = match.strip()[:100]
                if item:
                    items.append(item)
        
        return items
