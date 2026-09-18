import os
import shutil
from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from backend.converters.pdf_parser import SlideParser
from backend.engine.graph_engine import GraphEngine
from backend.engine.quiz_generator import QuizGenerator
from backend.engine.adaptive_engine import AdaptiveEngine
from backend.storage.mysql_db import mysql_db

router = APIRouter(prefix="/api")

slide_parser = SlideParser()
graph_engine = GraphEngine()
quiz_generator = QuizGenerator()
adaptive_engine = AdaptiveEngine()

class NoteConstraintRequest(BaseModel):
    lecturer_note: str

class UpdateQuestionRequest(BaseModel):
    question_id: str
    question_text: Optional[str] = None
    options: Optional[list] = None
    correct_index: Optional[int] = None

class StudentSubmitRequest(BaseModel):
    student_name: str = "Học viên AI Thực Chiến"
    answers: Dict[str, int]

class RemediationSubmitRequest(BaseModel):
    session_id: str
    answers: Dict[str, int]

@router.get("/system/status")
def get_system_status():
    doc = mysql_db.get_latest_document()
    c = mysql_db.get_latest_constraint()
    quiz = mysql_db.get_latest_quiz()
    return {
        "database_type": "MySQL" if mysql_db.is_mysql else "SQLite (Fallback)",
        "uploaded_file": doc["source_file"] if doc else None,
        "total_slides": doc["total_slides"] if doc else 0,
        "lecturer_note": c.get("raw_note") if c else "Mới dạy xong Slide 1 - 10",
        "constraints": {
            "min_slide": c.get("min_slide", 1),
            "max_slide": c.get("max_slide", 10),
            "in_scope_count": c.get("in_scope_count", 10),
            "blocked_count": c.get("blocked_count", 5)
        } if c else {"min_slide": 1, "max_slide": 10},
        "quiz_status": quiz["status"] if quiz else "NONE",
        "total_quiz_questions": quiz["total_questions"] if quiz else 0
    }

@router.post("/lecturer/upload-pdf")
async def upload_pdf(file: Optional[UploadFile] = File(None)):
    """
    GIAI ĐOẠN 1: 1A. Slide PDF + Transcript -> MarkItDown -> 1B. Markdown
    Trích xuất văn bản và lưu trữ vào Cơ sở dữ liệu MySQL.
    """
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    target_path = sample_path

    if file and file.filename:
        upload_dir = "data/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        target_path = os.path.join(upload_dir, file.filename)
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="File PDF không tồn tại")

    parsed_result = slide_parser.convert_pdf_to_markdown(target_path)
    
    # Lưu vào MySQL
    mysql_db.save_document(
        source_file=parsed_result["source_file"],
        total_slides=parsed_result["total_slides"],
        structured_markdown=parsed_result["structured_markdown"],
        raw_markdown=parsed_result["raw_markdown"]
    )

    # Tự động lập ranh giới mặc định
    c = graph_engine.parse_lecturer_note("Mới dạy xong Slide 1 - 10")
    kg = graph_engine.build_knowledge_graph(parsed_result["slides"], c)
    mysql_db.save_constraint(
        raw_note="Mới dạy xong Slide 1 - 10",
        min_slide=c["min_slide"],
        max_slide=c["max_slide"],
        in_scope=kg["in_scope_count"],
        blocked=kg["blocked_count"]
    )

    return {
        "success": True,
        "message": f"Đã chuyển đổi và lưu trữ thành công {parsed_result['total_slides']} slide bằng MarkItDown vào MySQL",
        "file_name": parsed_result["source_file"],
        "total_slides": parsed_result["total_slides"],
        "slides": parsed_result["slides"],
        "structured_markdown": parsed_result["structured_markdown"]
    }

@router.get("/lecturer/markdown-preview")
def get_markdown_preview():
    doc = mysql_db.get_latest_document()
    if not doc:
        # Tự động nạp sample nếu database trống
        sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
        if os.path.exists(sample_path):
            parsed_result = slide_parser.convert_pdf_to_markdown(sample_path)
            mysql_db.save_document(
                source_file=parsed_result["source_file"],
                total_slides=parsed_result["total_slides"],
                structured_markdown=parsed_result["structured_markdown"],
                raw_markdown=parsed_result["raw_markdown"]
            )
            c = graph_engine.parse_lecturer_note("Mới dạy xong Slide 1 - 10")
            kg = graph_engine.build_knowledge_graph(parsed_result["slides"], c)
            mysql_db.save_constraint(
                raw_note="Mới dạy xong Slide 1 - 10",
                min_slide=c["min_slide"],
                max_slide=c["max_slide"],
                in_scope=kg["in_scope_count"],
                blocked=kg["blocked_count"]
            )
            return parsed_result
        raise HTTPException(status_code=404, detail="Chưa có tài liệu slide nào")
    
    # Parse lại từ raw/sample để lấy slides list
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    if os.path.exists(sample_path):
        return slide_parser.convert_pdf_to_markdown(sample_path)
    return doc

@router.post("/lecturer/set-constraints")
def set_constraints(req: NoteConstraintRequest):
    """
    GIAI ĐOẠN 1: 2. GHI CHÚ BÀI DẠY CỦA GIẢNG VIÊN (Ràng buộc nội dung - Điều kiện tiên quyết)
    AI.Graph Engine đối chiếu Markdown với Ghi chú, chặn câu hỏi vượt trang quy định.
    """
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=400, detail="Vui lòng nạp PDF trước")

    parsed = slide_parser.convert_pdf_to_markdown(sample_path)
    constraints = graph_engine.parse_lecturer_note(req.lecturer_note)
    graph_result = graph_engine.build_knowledge_graph(parsed["slides"], constraints)

    # Lưu vào MySQL
    mysql_db.save_constraint(
        raw_note=req.lecturer_note,
        min_slide=constraints["min_slide"],
        max_slide=constraints["max_slide"],
        in_scope=graph_result["in_scope_count"],
        blocked=graph_result["blocked_count"]
    )

    return {
        "success": True,
        "constraints": constraints,
        "in_scope_count": graph_result["in_scope_count"],
        "blocked_count": graph_result["blocked_count"],
        "in_scope_concepts": graph_result["in_scope_concepts"],
        "blocked_concepts": graph_result["blocked_concepts"]
    }

@router.post("/lecturer/generate-quiz")
def generate_quiz():
    """
    GIAI ĐOẠN 1: 3. AI.GRAPH ENGINE
    - Đối chiếu MD với Ghi chú
    - Chặn câu hỏi vượt trang 10
    - Đổi sang ví dụ đời thường
    - Gắn trích dẫn DEMO-NNN / Slide Trang X
    - Gửi bản thảo sang MySQL
    """
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=400, detail="Chưa có dữ liệu slide")

    parsed = slide_parser.convert_pdf_to_markdown(sample_path)
    c_info = mysql_db.get_latest_constraint()
    constraints = {
        "min_slide": c_info.get("min_slide", 1),
        "max_slide": c_info.get("max_slide", 10),
        "raw_note": c_info.get("raw_note", "Mới dạy xong Slide 1 - 10")
    }
    
    kg = graph_engine.build_knowledge_graph(parsed["slides"], constraints)
    draft_quiz = quiz_generator.generate_draft_quiz(kg)
    
    # Lưu vào MySQL
    quiz_id = mysql_db.save_quiz_draft(draft_quiz)
    draft_quiz["quiz_id"] = quiz_id

    return {
        "success": True,
        "message": f"AI.Graph Engine đã sinh thành công {draft_quiz['total_questions']} câu hỏi bám sát phạm vi bài dạy và lưu vào MySQL",
        "quiz": draft_quiz
    }

@router.post("/lecturer/publish-quiz")
def publish_quiz():
    """
    GIAI ĐOẠN 1: 4. GIẢNG VIÊN KIỂM DUYỆT (Chốt chặn con người - Human-in-the-loop)
    - Kiểm tra Quiz bám sát bài dạy
    - Xác nhận 100% trích dẫn nguồn
    - Bấm Duyệt để phát hành
    """
    try:
        pub = mysql_db.publish_latest_quiz()
        return {
            "success": True,
            "message": "Đã duyệt và phát hành Quiz thành công! Đã lưu vào MySQL.",
            "quiz": pub
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/student/current-quiz")
def get_student_quiz():
    """
    5. HỌC VIÊN LÀM BÀI QUIZ ĐÁNH GIÁ (Giao diện phong cách Quiz.com)
    """
    quiz = mysql_db.get_latest_quiz()
    if not quiz or quiz.get("status") != "PUBLISHED":
        return {
            "is_published": False,
            "message": "Giảng viên đang kiểm duyệt câu hỏi. Vui lòng quay lại sau ít phút!"
        }

    # Trả về câu hỏi an toàn không lộ đáp án
    safe_questions = []
    for q in quiz["questions"]:
        safe_questions.append({
            "id": q["id"],
            "question_index": q["question_index"],
            "question": q["question"],
            "options": q["options"],
            "slide_page": q["slide_page"],
            "provenance": q["provenance"],
            "core_concept": q["core_concept"],
            "is_core": q["is_core"]
        })

    return {
        "is_published": True,
        "quiz_id": quiz["quiz_id"],
        "quiz_title": quiz["quiz_title"],
        "total_questions": len(safe_questions),
        "questions": safe_questions
    }

@router.post("/student/submit-quiz")
def submit_student_quiz(req: StudentSubmitRequest):
    """
    GIAI ĐOẠN 2: PHÂN LOẠI KẾT QUẢ BÀI LÀM
    - Đúng toàn bộ / 100% đúng -> ĐÚNG HẾT CÁC CÂU CỐT LÕI (2 lựa chọn đi tiếp)
    - Có câu làm sai -> GỠ RỐI NGAY TẠI CHỖ:
      1. Giải thích kiến thức sai (ngôn ngữ đời thường thuần Việt + trích dẫn chuẩn)
      2. Quiz ôn tập kiến thức sai (tình huống MỚI TOANH 100%, tuyệt đối không trùng lặp)
    """
    quiz = mysql_db.get_latest_quiz()
    if not quiz:
        raise HTTPException(status_code=400, detail="Không tìm thấy bài thi")

    result = adaptive_engine.evaluate_quiz_submission(quiz, req.answers)
    
    # Lưu vào MySQL
    import uuid
    attempt_id = str(uuid.uuid4())
    mysql_db.save_attempt(
        attempt_id=attempt_id,
        quiz_id=quiz.get("quiz_id", "default-quiz"),
        student_name=req.student_name,
        answers=req.answers,
        correct_count=result["correct_count"],
        total_questions=result["total_questions"],
        score_percent=result["score_percent"],
        status=result["status"]
    )

    if not result.get("mastery_achieved") and "remediation_package" in result:
        mysql_db.save_remediation_session(
            session_id=result["session_id"],
            student_name=req.student_name,
            items=result["remediation_package"]["remediation_items"]
        )

    return result

@router.post("/student/submit-remediation")
def submit_remediation(req: RemediationSubmitRequest):
    """
    GIAI ĐOẠN 2: Làm xong Quiz ôn tập -> Đánh giá lại năng lực
    """
    session = mysql_db.get_remediation_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Phiên ôn tập không tồn tại")

    eval_res = adaptive_engine.evaluate_remediation_answers(session["remediation_items"], req.answers)
    
    # Cập nhật kết quả vào MySQL
    mysql_db.update_remediation_session(
        session_id=req.session_id,
        retry_answers=req.answers,
        status=eval_res["status"],
        score_percent=eval_res["score_percent"]
    )

    return eval_res

@router.get("/lecturer/mistake-analytics")
def get_mistake_analytics():
    """
    SƠ ĐỒ LUỒNG: Báo danh sách các phần bị làm sai nhiều nhất gửi ngược lên Giảng viên
    - Thống kê các câu/concept bị sai nhiều nhất
    - Xếp thứ tự từ cao xuống thấp
    """
    return mysql_db.get_mistake_analytics()

@router.get("/eval/latest")
def get_latest_eval():
    """
    Lấy kết quả chạy đánh giá Golden Set 20 Testcase gần nhất.
    """
    eval_file = "eval/eval_results.json"
    if os.path.exists(eval_file):
        try:
            with open(eval_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    from eval.run_eval import run_evaluation
    return run_evaluation()

@router.post("/eval/run")
def trigger_eval_run():
    """
    Kích hoạt chạy thực tế bộ đánh giá chất lượng hệ thống (20 Testcases Golden Set).
    """
    from eval.run_eval import run_evaluation
    result = run_evaluation()
    return {
        "success": True,
        "message": f"Đã chạy xong 20 testcase: {result['passed_cases']}/{result['total_cases']} đạt ({result['pass_rate_percent']}%)",
        "data": result
    }
