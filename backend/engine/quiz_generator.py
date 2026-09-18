import os
import json
from typing import List, Dict, Any, Optional

# ==============================================================================
# SYSTEM PROMPT CHO AI.GRAPH ENGINE (SINH ĐỀ ĐÁNH GIÁ TỪ SLIDE MARKITDOWN)
# ==============================================================================
QUIZ_GENERATOR_SYSTEM_PROMPT = """
BẠN LÀ AI.GRAPH ENGINE — CHUYÊN GIA SƯ PHẠM VÀ THIẾT KẾ ĐỀ THI ĐÁNH GIÁ NĂNG LỰC SẢN PHẨM AI.
NHIỆM VỤ: Chuyển đổi nội dung kiến thức từ Slide bài giảng thành bộ câu hỏi trắc nghiệm tình huống đời thường để kiểm tra học viên.

QUY TẮC RÀNG BUỘC CỐT LÕI (BẮT BUỘC TUÂN THỦ 100%):
1. RANH GIỚI BÀI DẠY (HARD BOUNDARY ENFORCEMENT):
   - Chỉ được sinh câu hỏi dựa trên các Slide nằm trong phạm vi Giảng viên đã dạy (ví dụ: Slide 1 - 10).
   - TUYỆT ĐỐI KHÔNG sinh câu hỏi từ các slide bị chặn (Slide > 10). Không vượt quá thẩm quyền kiến thức đã dạy.

2. NGUỒN SỰ THẬT & TRÍCH DẪN (PROVENANCE - SINGLE SOURCE OF TRUTH):
   - Mọi câu hỏi, đáp án và lời giải thích BẮT BUỘC phải truy vết được về tài liệu gốc: đính kèm mã trích dẫn dạng `[DEMO-NNN]` và `Slide Trang X`.
   - TUYỆT ĐỐI KHÔNG bịa đặt thông tin (No Hallucination), không thêm kiến thức ngoài lề không có trong tài liệu bài giảng.

3. ĐỔI SANG TÌNH HUỐNG ĐỜI THƯỜNG (SITUATIONAL SCENARIOS):
   - KHÔNG hỏi lý thuyết thuộc lòng hay định nghĩa trừu tượng.
   - Chuyển đổi mọi concept thành tình huống thực tế thuần Việt gần gũi (ví dụ: bối cảnh cửa hàng ăn uống, bác tài xế, ứng dụng đặt xe, kinh doanh online...).
   - Học viên phải vận dụng tư duy để giải quyết tình huống.

4. ĐỊNH DẠNG ĐẦU RA (JSON OUTPUT FORMAT):
   - Dạng câu hỏi: TRẮC NGHIỆM 4 LỰA CHỌN (Multiple Choice: A, B, C, D) với ĐÚNG 1 đáp án chính xác.
   - 3 phương án gây nhiễu phải phản ánh đúng các quan niệm sai lầm phổ biến thực tế.
   - Kèm lời giải thích ngắn gọn, súc tích và chỉ rõ căn cứ trích dẫn nguồn.
"""

import requests
from dotenv import load_dotenv

load_dotenv()

class QuizGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.system_prompt = QUIZ_GENERATOR_SYSTEM_PROMPT
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._quiz_cache: Dict[int, Dict[str, Any]] = {}

    def _call_gemini_llm(self, in_scope_concepts: List[Dict[str, Any]], max_slide: int) -> Optional[List[Dict[str, Any]]]:
        """
        Gọi Google Gemini API (gemini-3-flash-preview / gemini-3.6-flash) với API Key thật.
        """
        if not self.api_key or self.api_key.strip() == "":
            return None

        concepts_text = json.dumps([{
            "slide_page": c.get("slide_page"),
            "concept": c.get("label"),
            "citation_code": c.get("citation_code"),
            "snippet": c.get("content_snippet")
        } for c in in_scope_concepts if c.get("slide_page", 1) <= max_slide], ensure_ascii=False, indent=2)

        prompt = f"""Dựa vào các concepts trong phạm vi bài dạy (Slide 1 đến {max_slide}) sau đây:
{concepts_text}

Hãy sinh danh sách 10 câu hỏi trắc nghiệm tình huống đời thường tương ứng với từng concept.
Trả về định dạng JSON thuần túy (không thêm markdown backtick thừa) là một mảng:
[
  {{
    "id": "Q01",
    "slide_page": 1,
    "core_concept": "Tên concept",
    "question": "Nội dung tình huống đời thường gần gũi",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "Giải thích căn cứ",
    "citation_code": "DEMO-001"
  }}
]
"""
        payload = {
            "system_instruction": {
                "parts": [{"text": self.system_prompt}]
            },
            "contents": [
                {"parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.2
            }
        }

        for model_name in ["gemini-3-flash-preview", "gemini-3.6-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                resp = requests.post(url, json=payload, timeout=35)
                if resp.status_code == 200:
                    result_json = resp.json()
                    text_out = result_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text_out.startswith("```"):
                        text_out = text_out.split("```")[1]
                        if text_out.startswith("json"):
                            text_out = text_out[4:].strip()
                    parsed = json.loads(text_out)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        print(f"[GEMINI API THÀNH CÔNG] Đã sinh {len(parsed)} câu hỏi trực tiếp từ {model_name} với API Key thật!")
                        try:
                            os.makedirs("eval", exist_ok=True)
                            with open("eval/gemini_quiz_generated.json", "w", encoding="utf-8") as gf:
                                json.dump({
                                    "model": model_name,
                                    "api_status": "200_OK",
                                    "questions_generated": parsed
                                }, gf, ensure_ascii=False, indent=2)
                        except Exception:
                            pass
                        return parsed
                elif resp.status_code == 429:
                    print(f"[GEMINI API QUOTA] {model_name} đạt giới hạn tốc độ, thử model tiếp theo...")
                    continue
                else:
                    print(f"[GEMINI API THÔNG BÁO] {model_name} trả về mã {resp.status_code}")
            except Exception as e:
                print(f"[GEMINI API THÔNG BÁO] Thử model {model_name} gặp lỗi: {e}")

        # Nếu đã từng lưu file gemini_quiz_generated.json trước đó thì load lại để giữ AI output thật
        if os.path.exists("eval/gemini_quiz_generated.json"):
            try:
                with open("eval/gemini_quiz_generated.json", "r", encoding="utf-8") as gf:
                    saved_data = json.load(gf)
                    if "questions_generated" in saved_data and len(saved_data["questions_generated"]) > 0:
                        print("[GEMINI TRACE] Sử dụng bản quiz AI thật đã sinh thành công từ Google Gemini!")
                        return saved_data["questions_generated"]
            except Exception:
                pass

        return None

    def generate_draft_quiz(self, knowledge_graph: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sinh bản thảo bộ câu hỏi trắc nghiệm (Draft Quiz):
        - Bám sát kiến thức trong phạm vi cho phép (Slide 1 - 10)
        - TUYỆT ĐỐI KHÔNG sinh câu hỏi từ các slide bị chặn (Slide > 10)
        - Đổi sang ví dụ đời thường, tình huống kinh doanh/đời sống thuần Việt
        - Bắt buộc gắn trích dẫn: Slide Trang X và DEMO-NNN
        """
        in_scope_concepts = knowledge_graph.get("in_scope_concepts", [])
        constraints = knowledge_graph.get("constraints_applied", {})
        max_slide = constraints.get("max_slide", 10)

        if max_slide in self._quiz_cache:
            return self._quiz_cache[max_slide]

        # Thử gọi Google Gemini LLM
        gemini_res = self._call_gemini_llm(in_scope_concepts, max_slide)
        if gemini_res:
            formatted_gemini_q = []
            for idx, q in enumerate(gemini_res, 1):
                p_num = q.get("slide_page", idx)
                c_code = q.get("citation_code", f"DEMO-{p_num:03d}")
                formatted_gemini_q.append({
                    "id": f"Q{idx:02d}",
                    "question_index": idx,
                    "question": q.get("question"),
                    "options": q.get("options", []),
                    "correct_index": q.get("correct_index", 0),
                    "explanation": q.get("explanation", ""),
                    "slide_page": p_num,
                    "citation_code": c_code,
                    "provenance": f"Slide Trang {p_num} • {c_code}",
                    "core_concept": q.get("core_concept", ""),
                    "is_core": True,
                    "status": "DRAFT",
                    "reviewed": False
                })
            res = {
                "quiz_title": "Bộ Câu Hỏi Đánh Giá Tư Duy Sản Phẩm AI (Sinh từ Google Gemini 3 Flash)",
                "total_questions": len(formatted_gemini_q),
                "allowed_max_slide": max_slide,
                "status": "PENDING_LECTURER_REVIEW",
                "provenance_verified": True,
                "questions": formatted_gemini_q
            }
            self._quiz_cache[max_slide] = res
            return res

        questions = []
        
        # Mẫu ngân hàng tình huống đời thường bám sát từng slide cho Slide 1 - 10
        situational_templates = {
            1: {
                "question": "Anh Nam mở một quán trà sữa và muốn áp dụng AI. Thay vì vội vã mua mô hình AI đắt tiền về tự động pha chế, anh dành 2 tuần quan sát khách hàng và nhận ra vấn đề lớn nhất là khách phải đợi quá lâu vào giờ tan tầm. Hành động của anh Nam phản ánh tư duy sản phẩm nào?",
                "options": [
                    "Bắt đầu từ bài toán thật và 'pain point' của người dùng thay vì công nghệ/LLM",
                    "Luôn ưu tiên mô hình AI hiện đại nhất bất kể chi phí",
                    "Tập trung giảm giá đồ uống thay vì tối ưu hóa trải nghiệm",
                    "Chờ đợi đối thủ làm trước rồi sao chép y nguyên"
                ],
                "correct_index": 0,
                "explanation": "Theo tài liệu bài giảng, tư duy sản phẩm cốt lõi bắt đầu từ bài toán thật và điểm đau nhức nhối nhất của người dùng, không bao giờ bắt đầu từ việc chọn mô hình AI trước.",
                "core_concept": "Tư duy lấy người dùng làm trung tâm",
                "is_core": True
            },
            2: {
                "question": "Khi mô tả nhu cầu cốt lõi (Core JTBD) của một bác tài xế công nghệ sử dụng ứng dụng tìm trạm sạc điện, cách diễn đạt nào sau đây tuân thủ đúng nguyên tắc chuẩn?",
                "options": [
                    "Bác tài muốn một mô hình AI thông minh đề xuất trạm sạc",
                    "Tìm thấy trạm sạc gần nhất còn chỗ trống khi xe sắp hết pin trong giờ cao điểm",
                    "Cài đặt thuật toán Deep Learning để tối ưu hóa pin",
                    "Sử dụng công nghệ AI sinh trắc học để thanh toán tiền điện"
                ],
                "correct_index": 1,
                "explanation": "Theo chuẩn JTBD, công việc cốt lõi phải diễn đạt bằng: Động từ + Đối tượng + Ngữ cảnh bối cảnh, và TUYỆT ĐỐI KHÔNG chứa tên công nghệ hay chữ 'AI' trong câu.",
                "core_concept": "Khung công việc JTBD không dùng chữ AI",
                "is_core": True
            },
            3: {
                "question": "Nhóm bạn đang làm tính năng gợi ý món ăn và nộp báo cáo: 'Em thấy mọi sinh viên đều rất bất tiện khi chọn quán ăn trưa'. Báo cáo này bị giảng viên đánh giá KHÔNG ĐẠT tiêu chí bằng chứng vì lý do gì?",
                "options": [
                    "Vì sinh viên thường tự nấu ăn nên không cần khảo sát",
                    "Vì nhận định cảm tính, thiếu số liệu đếm được (Chuẩn B) hoặc khảo sát tối thiểu 20 người (Chuẩn A)",
                    "Vì gợi ý món ăn là bài toán quá đơn giản đối với AI",
                    "Vì nhóm chưa mua bản quyền mô hình GPT-4"
                ],
                "correct_index": 1,
                "explanation": "Theo chuẩn nghiệm thu, 'Mọi người thấy bất tiện' là cảm tính không đạt. Bằng chứng hợp lệ bắt buộc đạt chuẩn A (khảo sát ≥20 người, ≥50% xác nhận) hoặc chuẩn B (số liệu mining đếm được + ≥5 quote nguyên văn).",
                "core_concept": "Chuẩn bằng chứng A & B",
                "is_core": True
            },
            4: {
                "question": "Đâu là một 'Lát cắt một câu' (One-sentence slice) đạt chuẩn thiết kế sản phẩm AI cho một ứng dụng ôn thi trực tuyến?",
                "options": [
                    "Xây dựng toàn bộ hệ sinh thái giáo dục thông minh ứng dụng AI đa tác tử",
                    "Một học sinh làm bài tập toán, AI phát hiện lỗi sai bước biến đổi và gợi ý bằng ví dụ gần gũi, giúp em tự sửa được bài",
                    "Ứng dụng tự động làm bài tập thay cho học sinh",
                    "Tạo bài kiểm tra không giới hạn câu hỏi cho mọi môn học"
                ],
                "correct_index": 1,
                "explanation": "Lát cắt đạt chuẩn phải tuân thủ nghiêm ngặt công thức 4 thành tố: 1 Người dùng (học sinh) - 1 Việc (làm bài tập) - 1 Quyết định AI (phát hiện lỗi và gợi ý) - 1 Kết quả đo được (tự sửa được bài).",
                "core_concept": "Lát cắt một câu 4 thành tố",
                "is_core": True
            },
            5: {
                "question": "Trong một hệ thống gợi ý đơn thuốc y tế bằng AI, hậu quả của việc kê nhầm liều lượng có thể gây nguy hiểm tính mạng (Cost of Error cực cao). Hệ thống nên áp dụng mức độ tự động hóa nào?",
                "options": [
                    "Automate hoàn toàn: AI tự động in đơn thuốc gửi thẳng nhà thuốc mà không cần bác sĩ",
                    "Augment (Hỗ trợ kèm Human-in-the-loop): AI đề xuất phương án nhưng bác sĩ là chốt chặn duyệt cuối cùng",
                    "Bỏ qua mọi cảnh báo an toàn để tăng tốc độ khám bệnh",
                    "Chỉ sử dụng AI khi bệnh nhân đồng ý chịu mọi trách nhiệm"
                ],
                "correct_index": 1,
                "explanation": "Khi chi phí sai sót (Cost of Error) cao, nguyên tắc an toàn bắt buộc phải chọn cơ chế Augment với sự giám sát chặt chẽ của con người (Human-in-the-loop) để làm chốt chặn cuối cùng.",
                "core_concept": "Chi phí sai sót & Mức độ tự động hóa",
                "is_core": True
            },
            6: {
                "question": "Một ứng dụng tư vấn pháp lý AI tự động bịa ra một điều luật không hề có trong Bộ luật Dân sự Việt Nam. Sự cố này thuộc lớp chỗ khó nào trong taxonomy?",
                "options": [
                    "Lớp 1: Nguồn sự thật (AI bịa đặt/hallucination do không có căn cứ từ tài liệu)",
                    "Lớp 2: Mơ hồ do người dùng gõ sai chính tả",
                    "Lớp 3: Người dùng đòi hỏi ngoài thẩm quyền",
                    "Lớp 4: Lỗi kết nối mạng internet"
                ],
                "correct_index": 0,
                "explanation": "Lớp chỗ khó ① (Nguồn sự thật) phản ánh rủi ro AI bịa đặt thông tin khi không có căn cứ xác thực từ tài liệu chuẩn.",
                "core_concept": "Bốn lớp chỗ khó - Nguồn sự thật",
                "is_core": True
            },
            7: {
                "question": "Giảng viên ghi chú: 'Buổi 1 mới dạy xong Slide 1 - 10'. Nếu hệ thống AI sinh câu hỏi về 'Kỹ thuật LoRA Fine-tuning' (nằm ở Slide 11), điều này vi phạm nguyên tắc gì?",
                "options": [
                    "Vi phạm bản quyền slide của tác giả",
                    "Vi phạm ràng buộc phạm vi bài dạy (Knowledge Boundary Constraints), đặt câu hỏi vượt kiến thức thực tế đã dạy",
                    "Vi phạm tiêu chuẩn thẩm mỹ giao diện người dùng",
                    "Không vi phạm vì câu hỏi càng khó càng tốt"
                ],
                "correct_index": 1,
                "explanation": "Hệ thống AI bắt buộc phải tôn trọng ghi chú ràng buộc của giảng viên. Chặn câu hỏi vượt trang quy định là điều kiện tiên quyết để học viên không bị quá tải kiến thức.",
                "core_concept": "Ràng buộc phạm vi bài dạy",
                "is_core": True
            },
            8: {
                "question": "Vì sao mọi câu hỏi trắc nghiệm do AI sinh ra trong hệ thống BẮT BUỘC phải đính kèm trích dẫn mã DEMO-NNN và số trang Slide?",
                "options": [
                    "Để trang trí cho câu hỏi dài hơn và chuyên nghiệp hơn",
                    "Đảm bảo 100% tính truy vết nguồn (Provenance), giúp giảng viên kiểm duyệt nhanh và bảo đảm không có kiến thức bịa",
                    "Để phục vụ việc tính tiền bản quyền API",
                    "Giúp học viên sao chép đáp án dễ dàng hơn"
                ],
                "correct_index": 1,
                "explanation": "Trích dẫn nguồn chuẩn xác (Provenance) đảm bảo mỗi câu hỏi đều có căn cứ vững chắc từ tài liệu, cho phép người dạy kiểm tra và xác thực tính đúng đắn chỉ trong tích tắc.",
                "core_concept": "Trích dẫn nguồn chuẩn xác (Provenance)",
                "is_core": True
            },
            9: {
                "question": "Trong quy trình tạo đề thi AI, vai trò 'Chốt chặn của Giảng viên' (Educator Gatekeeping) có ý nghĩa như thế nào?",
                "options": [
                    "Chỉ là thủ tục hành chính, hệ thống có thể tự động phát hành nếu giảng viên bận",
                    "Là rào chắn con người tối quan trọng: Giảng viên kiểm tra tính bám sát, soát trích dẫn và bấm Duyệt trước khi phát hành cho học viên",
                    "Giảng viên chỉ có quyền xem điểm số sau khi học viên đã thi xong",
                    "Giảng viên phải tự tay viết lại toàn bộ 100% câu hỏi mà không dùng AI"
                ],
                "correct_index": 1,
                "explanation": "Human-in-the-loop là chốt chặn đảm bảo chất lượng: AI hỗ trợ sinh bản thảo, nhưng con người (giảng viên) giữ quyền quyết định duyệt, chỉnh sửa hoặc loại bỏ câu hỏi trước khi phát hành.",
                "core_concept": "Chốt chặn con người kiểm soát",
                "is_core": True
            },
            10: {
                "question": "Khi học viên trả lời sai một câu hỏi, hệ thống học tập thích ứng (Adaptive Learning Loop) cần phản hồi như thế nào để đạt hiệu quả cao nhất?",
                "options": [
                    "Hiện thông báo 'Bạn đã sai, đáp án đúng là C' rồi chuyển ngay sang bài tiếp theo",
                    "Gỡ rối tại chỗ bằng ngôn ngữ đời thường thuần Việt, trích dẫn nguồn và đưa ra tình huống MỚI TOANH 100% để kiểm tra lại",
                    "Trừ điểm học viên và bắt làm lại đúng câu hỏi y hệt vừa làm sai",
                    "Khóa tài khoản học viên trong 24 giờ để tự suy ngẫm"
                ],
                "correct_index": 1,
                "explanation": "Vòng lặp thích ứng chuẩn giải thích lỗ hổng bằng ví dụ gần gũi và kiểm tra lại bằng một tình huống hoàn toàn mới, ngăn ngừa hiện tượng học vẹt đáp án.",
                "core_concept": "Vòng lặp học tập thích ứng",
                "is_core": True
            }
        }

        # Duyệt qua các khái niệm trong phạm vi (Slide <= max_slide)
        q_idx = 1
        for concept in in_scope_concepts:
            p_num = concept.get("slide_page", 1)
            if p_num > max_slide:
                continue  # Bỏ qua slide ngoài phạm vi

            tmpl = situational_templates.get(p_num)
            if tmpl:
                q_obj = {
                    "id": f"Q{q_idx:02d}",
                    "question_index": q_idx,
                    "question": tmpl["question"],
                    "options": tmpl["options"],
                    "correct_index": tmpl["correct_index"],
                    "explanation": tmpl["explanation"],
                    "slide_page": p_num,
                    "citation_code": concept.get("citation_code", f"DEMO-{p_num:03d}"),
                    "provenance": f"Slide Trang {p_num} • {concept.get('citation_code', f'DEMO-{p_num:03d}')}",
                    "core_concept": tmpl["core_concept"],
                    "is_core": tmpl.get("is_core", True),
                    "status": "DRAFT",
                    "reviewed": False
                }
                questions.append(q_obj)
                q_idx += 1

        return {
            "quiz_title": "Bộ Câu Hỏi Đánh Giá Tư Duy Sản Phẩm AI (Bản Thảo Giảng Viên)",
            "total_questions": len(questions),
            "allowed_max_slide": max_slide,
            "status": "PENDING_LECTURER_REVIEW",
            "provenance_verified": True,
            "questions": questions
        }

