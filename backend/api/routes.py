import os
import shutil
from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from backend.converters.pdf_parser import SlideParser
from backend.engine.graph_engine import GraphEngine
from backend.engine.quiz_generator import QuizGenerator
from backend.engine.adaptive_engine import AdaptiveEngine
from backend.storage.db import db

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
    md_data = db.get_markdown_data()
    quiz = db.get_quiz()
    return {
        "uploaded_file": db.state.get("uploaded_file"),
        "total_slides": md_data["total_slides"] if md_data else 0,
        "lecturer_note": db.state.get("lecturer_note"),
        "constraints": db.state.get("constraints"),
        "quiz_status": db.state.get("quiz_status"),
        "total_quiz_questions": len(quiz["questions"]) if quiz else 0
    }

@router.post("/lecturer/upload-pdf")
async def upload_pdf(file: Optional[UploadFile] = File(None)):
    """
    Tải lên file PDF hoặc nạp sẵn slide mẫu slide-tu-duy-san-pham.pdf
    Sử dụng Microsoft MarkItDown để trích xuất văn bản sang Markdown cấu trúc.
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
    db.set_markdown_data(parsed_result)

    # Tự động khởi tạo knowledge graph với ghi chú mặc định
    constraints = graph_engine.parse_lecturer_note(db.state.get("lecturer_note", "Mới dạy xong Slide 1 - 10"))
    db.set_lecturer_note(db.state.get("lecturer_note", "Mới dạy xong Slide 1 - 10"), constraints)
    
    graph_result = graph_engine.build_knowledge_graph(parsed_result["slides"], constraints)
    db.set_knowledge_graph(graph_result)

    return {
        "success": True,
        "message": f"Đã chuyển đổi thành công {parsed_result['total_slides']} slide bằng MarkItDown",
        "file_name": parsed_result["source_file"],
        "total_slides": parsed_result["total_slides"],
        "slides": parsed_result["slides"],
        "structured_markdown": parsed_result["structured_markdown"]
    }

@router.get("/lecturer/markdown-preview")
def get_markdown_preview():
    md_data = db.get_markdown_data()
    if not md_data:
        # Nếu chưa nạp, tự nạp sample
        sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
        if os.path.exists(sample_path):
            md_data = slide_parser.convert_pdf_to_markdown(sample_path)
            db.set_markdown_data(md_data)
            constraints = graph_engine.parse_lecturer_note(db.state.get("lecturer_note", "Mới dạy xong Slide 1 - 10"))
            graph_result = graph_engine.build_knowledge_graph(md_data["slides"], constraints)
            db.set_knowledge_graph(graph_result)
        else:
            raise HTTPException(status_code=404, detail="Chưa có tài liệu slide nào được nạp")
    return md_data

@router.post("/lecturer/set-constraints")
def set_constraints(req: NoteConstraintRequest):
    """
    Giảng viên nhập ghi chú bài dạy (Vd: Mới dạy xong Slide 1 - 10).
    AI.GRAPH ENGINE đối chiếu Markdown với Ghi chú, xác lập ranh giới cứng (Hard Boundary).
    """
    md_data = db.get_markdown_data()
    if not md_data:
        raise HTTPException(status_code=400, detail="Vui lòng tải lên hoặc nạp PDF trước")

    constraints = graph_engine.parse_lecturer_note(req.lecturer_note)
    db.set_lecturer_note(req.lecturer_note, constraints)

    graph_result = graph_engine.build_knowledge_graph(md_data["slides"], constraints)
    db.set_knowledge_graph(graph_result)

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
    AI.GRAPH ENGINE sinh bản thảo câu hỏi:
    - Bám sát Slide 1 - 10
    - Chặn toàn bộ câu hỏi ngoài Slide 10
    - Đổi sang ví dụ đời thường
    - Gắn trích dẫn DEMO-NNN và Slide Trang X
    """
    kg = db.state.get("knowledge_graph")
    if not kg:
        raise HTTPException(status_code=400, detail="Chưa có dữ liệu graph kiến thức")

    draft_quiz = quiz_generator.generate_draft_quiz(kg)
    db.set_quiz_draft(draft_quiz)

    return {
        "success": True,
        "message": f"AI đã sinh thành công {draft_quiz['total_questions']} câu hỏi bám sát phạm vi bài dạy",
        "quiz": draft_quiz
    }

@router.post("/lecturer/update-question")
def update_question(req: UpdateQuestionRequest):
    quiz = db.get_quiz()
    if not quiz:
        raise HTTPException(status_code=400, detail="Chưa có bài quiz nào")

    found = False
    for q in quiz["questions"]:
        if q["id"] == req.question_id:
            if req.question_text is not None:
                q["question"] = req.question_text
            if req.options is not None:
                q["options"] = req.options
            if req.correct_index is not None:
                q["correct_index"] = req.correct_index
            q["reviewed"] = True
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")

    db.set_quiz_draft(quiz)
    return {"success": True, "quiz": quiz}

@router.post("/lecturer/publish-quiz")
def publish_quiz():
    """
    GIẢNG VIÊN KIỂM DUYỆT (Chốt chặn con người - Human-in-the-loop):
    - Xác nhận 100% trích dẫn nguồn
    - Kiểm tra tính bám sát bài dạy
    - Bấm Duyệt để phát hành cho học viên
    """
    try:
        pub = db.publish_quiz()
        return {
            "success": True,
            "message": "Đã duyệt và phát hành Quiz thành công! Học viên có thể vào làm bài.",
            "quiz": pub
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/student/current-quiz")
def get_student_quiz():
    """
    Học viên lấy đề thi để làm trên giao diện phong cách Quiz.com.
    Ẩn đáp án đúng (correct_index) và lời giải để đảm bảo tính khách quan.
    """
    quiz = db.get_quiz()
    if not quiz or db.state.get("quiz_status") != "PUBLISHED":
        # Nếu chưa duyệt, trả về thông báo
        return {
            "is_published": False,
            "message": "Giảng viên đang trong quá trình kiểm duyệt câu hỏi. Vui lòng quay lại sau ít phút!"
        }

    # Tạo bản copy an toàn cho học viên
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
        "quiz_title": quiz["quiz_title"],
        "total_questions": len(safe_questions),
        "questions": safe_questions
    }

@router.post("/student/submit-quiz")
def submit_student_quiz(req: StudentSubmitRequest):
    """
    GIAI ĐOẠN 2: PHÂN LOẠI KẾT QUẢ BÀI LÀM
    - Đúng 100% -> Chúc mừng & 2 lựa chọn đi tiếp
    - Có câu sai -> Kích hoạt Gỡ rối tại chỗ (Giải thích đời thường thuần Việt + Quiz ôn tập 100% tình huống mới)
    """
    quiz = db.get_quiz()
    if not quiz:
        raise HTTPException(status_code=400, detail="Không tìm thấy bài thi")

    result = adaptive_engine.evaluate_quiz_submission(quiz, req.answers)
    
    # Lưu phiên remediation nếu có
    if not result.get("mastery_achieved") and "remediation_package" in result:
        db.save_remediation_session(result["session_id"], {
            "student_name": req.student_name,
            "remediation_items": result["remediation_package"]["remediation_items"],
            "original_answers": req.answers
        })

    return result

@router.post("/student/submit-remediation")
def submit_remediation(req: RemediationSubmitRequest):
    """
    Đánh giá lại bài làm vòng lặp ôn tập kiến thức sai (Adaptive Retry):
    Học viên trả lời các câu hỏi tình huống mới 100% để khắc phục triệt để lỗ hổng.
    """
    session = db.get_remediation_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Phiên ôn tập không tồn tại hoặc đã hết hạn")

    remediation_items = session.get("remediation_items", [])
    eval_res = adaptive_engine.evaluate_remediation_answers(remediation_items, req.answers)
    return eval_res

