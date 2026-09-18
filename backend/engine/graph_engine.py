import re
from typing import List, Dict, Any, Optional

class GraphEngine:
    def __init__(self):
        pass

    def parse_lecturer_note(self, note_text: str) -> Dict[str, Any]:
        """
        Phân tích ghi chú của giảng viên để trích xuất ràng buộc phạm vi bài dạy.
        Ví dụ: 'Mới dạy xong Slide 1 - 10', 'Chỉ dạy trang 1 đến 10', 'Slide 1..8'
        """
        constraints = {
            "raw_note": note_text,
            "min_slide": 1,
            "max_slide": 10,  # Mặc định an toàn là 10 nếu không chỉ định rõ
            "is_constrained": True,
            "notes": []
        }

        if not note_text:
            constraints["notes"].append("Không có ghi chú cụ thể, áp dụng phạm vi an toàn mặc định Slide 1 - 10.")
            return constraints

        # Nếu giảng viên chọn học tất cả / toàn bộ tài liệu
        if re.search(r'(?:tất cả|toàn bộ|hết|all|full)', note_text, re.IGNORECASE):
            constraints["min_slide"] = 1
            constraints["max_slide"] = 999
            constraints["notes"].append("Đã xác lập phạm vi: Cho phép toàn bộ tài liệu slide.")
            return constraints

        # Tìm kiếm biểu thức dạng 'Slide 1 - 10', 'Slide 1 đến Slide 10', 'trang 1 đến 8', '1 - 10'
        range_match = re.search(r'(?:slide|trang)?\s*(\d+)\s*(?:-|đến|\.\.|to)\s*(?:slide|trang)?\s*(\d+)', note_text, re.IGNORECASE)
        if range_match:
            min_s = int(range_match.group(1))
            max_s = int(range_match.group(2))
            constraints["min_slide"] = min(min_s, max_s)
            constraints["max_slide"] = max(min_s, max_s)
            constraints["notes"].append(f"Đã xác lập phạm vi cứng: Chỉ cho phép kiến thức từ Slide {constraints['min_slide']} đến Slide {constraints['max_slide']}.")
        else:
            single_match = re.search(r'(?:slide|trang)\s*(\d+)', note_text, re.IGNORECASE)
            if single_match:
                max_s = int(single_match.group(1))
                constraints["min_slide"] = 1
                constraints["max_slide"] = max_s
                constraints["notes"].append(f"Chỉ định kiến thức đến Slide {max_s}.")
            else:
                constraints["notes"].append("Ghi chú định tính, mặc định giới hạn Slide 1 - 10.")

        return constraints

    def build_knowledge_graph(self, slides: List[Dict[str, Any]], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """
        Đối chiếu Markdown với Ghi chú của giảng viên:
        - Giữ lại các slide trong phạm vi cho phép
        - CHẶN các slide vượt quá trang quy định (Hard Boundary Block)
        - Tạo Graph Concepts & Quan hệ
        """
        min_slide = constraints.get("min_slide", 1)
        max_slide = constraints.get("max_slide", 10)

        in_scope_concepts = []
        blocked_concepts = []
        nodes = []
        edges = []

        # Các khái niệm mẫu tương ứng từng slide
        concept_catalog = {
            1: {"name": "AI-User-Centricity", "label": "Tư duy sản phẩm lấy người dùng làm trung tâm", "demo": "DEMO-001", "type": "core"},
            2: {"name": "JTBD-Framework", "label": "Khung công việc JTBD không dùng chữ AI", "demo": "DEMO-002", "type": "core", "prereq": "AI-User-Centricity"},
            3: {"name": "Evidence-Standards", "label": "Chuẩn bằng chứng A & B (Mining & Survey)", "demo": "DEMO-003", "type": "method", "prereq": "JTBD-Framework"},
            4: {"name": "One-Sentence-Slice", "label": "Lát cắt một câu (4 thành tố sản phẩm)", "demo": "DEMO-004", "type": "core", "prereq": "JTBD-Framework"},
            5: {"name": "Cost-Of-Error", "label": "Chi phí sai sót & Tự động hóa Augment/Automate", "demo": "DEMO-005", "type": "strategy", "prereq": "One-Sentence-Slice"},
            6: {"name": "4-Error-Taxonomy", "label": "Bốn lớp chỗ khó (Sự thật, Mơ hồ, Thẩm quyền, Domain)", "demo": "DEMO-006", "type": "core", "prereq": "Cost-Of-Error"},
            7: {"name": "Boundary-Constraints", "label": "Ràng buộc phạm vi giảng dạy của Giảng viên", "demo": "DEMO-007", "type": "control", "prereq": "4-Error-Taxonomy"},
            8: {"name": "Provenance-Traceability", "label": "Trích dẫn nguồn chuẩn xác 100% Slide & DEMO", "demo": "DEMO-008", "type": "core", "prereq": "Boundary-Constraints"},
            9: {"name": "Educator-Gatekeeping", "label": "Chốt chặn con người kiểm duyệt (Human-in-the-loop)", "demo": "DEMO-009", "type": "control", "prereq": "Provenance-Traceability"},
            10: {"name": "Adaptive-Remediation", "label": "Vòng lặp khắc phục lỗ hổng với tình huống mới 100%", "demo": "DEMO-010", "type": "core", "prereq": "Educator-Gatekeeping"},
            11: {"name": "Deep-Fine-Tuning", "label": "Kỹ thuật LoRA & QLoRA Fine-tuning", "demo": "DEMO-011", "type": "advanced"},
            12: {"name": "RLHF-DPO-Alignment", "label": "Căn chỉnh mô hình bằng RLHF & DPO", "demo": "DEMO-012", "type": "advanced"},
            13: {"name": "Vector-DB-HNSW", "label": "Chỉ mục vector không gian cao HNSW", "demo": "DEMO-013", "type": "advanced"},
            14: {"name": "Multi-Agent-LangGraph", "label": "Hệ thống đa tác tử StateGraph", "demo": "DEMO-014", "type": "advanced"},
            15: {"name": "LLM-as-a-Judge-Eval", "label": "Đánh giá tự động đa tiêu chí LLM-as-a-Judge", "demo": "DEMO-015", "type": "advanced"},
        }

        for slide in slides:
            p_num = slide.get("page_number", 1)
            concept_info = concept_catalog.get(p_num, {
                "name": f"Concept-Slide-{p_num}",
                "label": slide.get("title", f"Slide {p_num}"),
                "demo": f"DEMO-{p_num:03d}",
                "type": "standard"
            })

            node_data = {
                "id": concept_info["name"],
                "label": concept_info["label"],
                "slide_page": p_num,
                "citation_code": concept_info.get("demo", f"DEMO-{p_num:03d}"),
                "slide_title": slide.get("title"),
                "is_core": concept_info.get("type") == "core",
                "content_snippet": slide.get("content", "")[:200]
            }

            if min_slide <= p_num <= max_slide:
                node_data["status"] = "IN_SCOPE"
                in_scope_concepts.append(node_data)
                nodes.append(node_data)
                if "prereq" in concept_info:
                    edges.append({
                        "source": concept_info["prereq"],
                        "target": concept_info["name"],
                        "relation": "PREREQUISITE_FOR"
                    })
            else:
                node_data["status"] = "BLOCKED_OUT_OF_SCOPE"
                node_data["block_reason"] = f"Vượt quá phạm vi bài dạy (Slide {p_num} > Slide {max_slide}). Giảng viên yêu cầu chặn."
                blocked_concepts.append(node_data)

        return {
            "constraints_applied": constraints,
            "in_scope_count": len(in_scope_concepts),
            "blocked_count": len(blocked_concepts),
            "in_scope_concepts": in_scope_concepts,
            "blocked_concepts": blocked_concepts,
            "graph": {
                "nodes": nodes,
                "edges": edges
            }
        }

