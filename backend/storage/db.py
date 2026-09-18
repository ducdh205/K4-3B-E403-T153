import os
import json
from typing import Dict, Any, Optional

class Database:
    def __init__(self, storage_dir: str = "data/storage"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.state_file = os.path.join(self.storage_dir, "system_state.json")
        self.state: Dict[str, Any] = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "uploaded_file": None,
            "markdown_data": None,
            "lecturer_note": "Mới dạy xong Slide 1 - 10",
            "constraints": {"min_slide": 1, "max_slide": 10},
            "knowledge_graph": None,
            "current_quiz": None,
            "quiz_status": "NONE", # NONE, DRAFT, PUBLISHED
            "student_attempts": {},
            "remediation_sessions": {}
        }

    def save_state(self):
        try:
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving state: {e}")

    def set_markdown_data(self, data: Dict[str, Any]):
        self.state["markdown_data"] = data
        self.state["uploaded_file"] = data.get("source_file")
        self.save_state()

    def get_markdown_data(self) -> Optional[Dict[str, Any]]:
        return self.state.get("markdown_data")

    def set_lecturer_note(self, note: str, constraints: Dict[str, Any]):
        self.state["lecturer_note"] = note
        self.state["constraints"] = constraints
        self.save_state()

    def set_knowledge_graph(self, graph: Dict[str, Any]):
        self.state["knowledge_graph"] = graph
        self.save_state()

    def set_quiz_draft(self, quiz: Dict[str, Any]):
        self.state["current_quiz"] = quiz
        self.state["quiz_status"] = "DRAFT"
        self.save_state()

    def get_quiz(self) -> Optional[Dict[str, Any]]:
        return self.state.get("current_quiz")

    def publish_quiz(self) -> Dict[str, Any]:
        if self.state.get("current_quiz"):
            self.state["current_quiz"]["status"] = "PUBLISHED"
            self.state["quiz_status"] = "PUBLISHED"
            self.save_state()
            return self.state["current_quiz"]
        raise ValueError("Chưa có bản thảo Quiz để phát hành")

    def save_remediation_session(self, session_id: str, session_data: Dict[str, Any]):
        if "remediation_sessions" not in self.state:
            self.state["remediation_sessions"] = {}
        self.state["remediation_sessions"][session_id] = session_data
        self.save_state()

    def get_remediation_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.state.get("remediation_sessions", {}).get(session_id)

db = Database()

