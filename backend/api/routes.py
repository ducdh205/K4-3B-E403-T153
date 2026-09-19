import os
import re
import shutil
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
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
    file_name: Optional[str] = None
    lecturer_note: Optional[str] = None
    scope_note: Optional[str] = None       # Ô 1: Nội dung đã học đến đâu
    emphasis_note: Optional[str] = None    # Ô 2: Cần lưu ý và nhấn mạnh ở đâu
    max_questions: Optional[int] = 10      # Ô 3: Sinh ra tối đa bao nhiêu câu hỏi

class UpdateQuestionRequest(BaseModel):
    question_id: str
    question_text: Optional[str] = None
    options: Optional[list] = None
    correct_index: Optional[int] = None

class StudentSubmitRequest(BaseModel):
    quiz_id: Optional[str] = None
    student_name: str = "Học viên AI Thực Chiến"
    answers: Dict[str, Any]

class RemediationSubmitRequest(BaseModel):
    session_id: str
    answers: Dict[str, Any]

DEFAULT_TITLE_MAP = {
    'slide-tu-duy-san-pham.pdf': ('Tư duy sản phẩm AI & Bài học thích ứng', 'PROD-K4', 'Bài giảng về tư duy phát triển sản phẩm AI, khung JTBD và mô hình thích ứng lỗi sai.'),
    'TỔNG QUAN TMĐT NHÓM 7.pdf': ('Tổng quan Thương mại điện tử (Báo cáo Nhóm 7)', 'TMDT-K4', 'Nghiên cứu về hệ sinh thái thương mại điện tử, các mô hình B2B, B2C và hành vi người tiêu dùng số.'),
    'Chap3-4.pdf': ('Thương mại điện tử - Chương 3 & 4 (Hạ tầng & Thanh toán)', 'TMDT-0304', 'Chuyên đề về công nghệ thanh toán điện tử, chuỗi cung ứng số và kiến trúc nền tảng giao dịch trực tuyến.'),
    'diemtoandammay.pdf': ('Điện toán đám mây & Hạ tầng Cloud', 'CLOUD-01', 'Tổng quan về mô hình dịch vụ IaaS, PaaS, SaaS, kiến trúc ảo hóa và triển khai ứng dụng trên đám mây.'),
    'chip bán dẫnn.pdf': ('Công nghệ Bán dẫn & Vi mạch AI', 'SEMI-01', 'Tổng quan ngành công nghiệp bán dẫn, quy trình quang khắc và kiến trúc chip tăng tốc trí tuệ nhân tạo.'),
    'thuchi.pdf': ('Quản trị Tài chính & Thu Chi Doanh nghiệp', 'FIN-01', 'Quy trình kế toán doanh nghiệp, quản lý dòng tiền thu chi và kiểm soát ngân sách.'),
    'scan.pdf': ('Tài liệu Chuyên đề Scan', 'SCAN-DOC', 'Tài liệu trích xuất từ bản quét chuyên môn.')
}

class SelectDocumentRequest(BaseModel):
    file_name: str
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None

class CreateQuizRequest(BaseModel):
    title: str = "Bộ Câu Hỏi Đánh Giá Tư Duy Sản Phẩm AI"
    status: str = "PUBLISHED"

class UpdateQuizRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None

class QuizQuestionRequest(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: Optional[str] = ""
    slide_page: Optional[int] = 1
    core_concept: Optional[str] = "Khái niệm bài dạy"

class GenerateQuizRequest(BaseModel):
    file_name: Optional[str] = None
    scope_note: Optional[str] = None
    emphasis_note: Optional[str] = None
    max_questions: Optional[int] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None

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

# Trạng thái ghi nhận giảng viên đã áp dụng ràng buộc ghi chú bài dạy hay chưa
_lecturer_constraint_applied = False

@router.post("/lecturer/upload-pdf")
async def upload_pdf(
    file: Optional[UploadFile] = File(None),
    transcript_text: Optional[str] = Form(None),
    transcript_file: Optional[UploadFile] = File(None),
    subject_name: Optional[str] = Form(None),
    subject_code: Optional[str] = Form(None)
):
    """
    GIAI ĐOẠN 1: 1A. Slide PDF + Transcript lời giảng -> MarkItDown -> 1B. File Markdown
    Trích xuất văn bản có cấu trúc và lưu trữ vào Cơ sở dữ liệu MySQL.
    """
    global _lecturer_constraint_applied
    _lecturer_constraint_applied = False

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

    merged_transcript = transcript_text or ""
    if transcript_file and transcript_file.filename:
        try:
            t_bytes = await transcript_file.read()
            t_str = t_bytes.decode("utf-8", errors="ignore")
            if t_str.strip():
                merged_transcript = (merged_transcript + "\n" + t_str).strip()
        except Exception:
            pass

    try:
        parsed_result = slide_parser.convert_pdf_to_markdown(target_path, transcript_text=merged_transcript)
    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error_code": "IMAGE_ONLY_PDF",
                "message": str(e)
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error_code": "CONVERSION_ERROR",
                "message": f"Lỗi trong quá trình chuyển đổi PDF: {str(e)}"
            }
        )
    
    # Xác định tên môn và mã môn
    sub_name = (subject_name or "").strip()
    sub_code = (subject_code or "").strip()
    fname = os.path.basename(target_path)
    if not sub_name or not sub_code:
        meta = DEFAULT_TITLE_MAP.get(fname)
        if meta:
            sub_name = sub_name or meta[0]
            sub_code = sub_code or meta[1]
        else:
            sub_name = sub_name or fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
            sub_code = sub_code or "SUB-01"

    # Lưu vào MySQL
    mysql_db.save_document(
        source_file=parsed_result["source_file"],
        total_slides=parsed_result["total_slides"],
        structured_markdown=parsed_result["structured_markdown"],
        raw_markdown=parsed_result["raw_markdown"],
        subject_name=sub_name,
        subject_code=sub_code
    )

    return {
        "success": True,
        "message": f"Đã chuyển đổi và lưu trữ thành công {parsed_result['total_slides']} slide môn '{sub_name}' ({sub_code}) bằng MarkItDown vào CSDL",
        "file_name": parsed_result["source_file"],
        "subject_name": sub_name,
        "subject_code": sub_code,
        "total_slides": parsed_result["total_slides"],
        "has_transcript": parsed_result.get("has_transcript", False),
        "slides": parsed_result["slides"],
        "structured_markdown": parsed_result["structured_markdown"]
    }

@router.get("/lecturer/markdown-preview")
def get_markdown_preview():
    doc = mysql_db.get_latest_document()
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"

    if not doc:
        # Tự động nạp sample nếu database trống
        if os.path.exists(sample_path):
            parsed_result = slide_parser.convert_pdf_to_markdown(sample_path)
            mysql_db.save_document(
                source_file=parsed_result["source_file"],
                total_slides=parsed_result["total_slides"],
                structured_markdown=parsed_result["structured_markdown"],
                raw_markdown=parsed_result["raw_markdown"]
            )
            return parsed_result
        raise HTTPException(status_code=404, detail="Chưa có tài liệu slide nào")
    
    # Kiểm tra file nguồn của doc có tồn tại trên đĩa không để parse ra cấu trúc slides chi tiết
    source_name = doc.get("source_file") or "slide-tu-duy-san-pham.pdf"
    target_path = None
    for p in [
        os.path.join("data/uploads", source_name),
        os.path.join("data/sample_slides", source_name),
        os.path.join("docs", source_name),
        sample_path
    ]:
        if os.path.exists(p):
            target_path = p
            break

    if target_path:
        try:
            return slide_parser.convert_pdf_to_markdown(target_path)
        except Exception:
            return slide_parser.convert_pdf_to_markdown(sample_path)
            
    return doc

@router.get("/lecturer/documents")
def get_available_documents():
    """
    Trả về danh sách tất cả các tài liệu đã có trong hệ thống (từ sample_slides và uploads)
    kèm thông tin số trang, dung lượng và cờ đang kích hoạt. Quét động trực tiếp từ thư mục thật.
    """
    latest_doc = mysql_db.get_latest_document()
    active_filename = latest_doc.get("source_file") if latest_doc else "slide-tu-duy-san-pham.pdf"

    found_files = {}

    # Quét sample_slides
    sample_dir = "data/sample_slides"
    if os.path.exists(sample_dir):
        for fname in sorted(os.listdir(sample_dir)):
            if fname.lower().endswith(".pdf"):
                fpath = os.path.join(sample_dir, fname)
                found_files[fname] = {
                    "file_name": fname,
                    "category": "Tài liệu chuẩn",
                    "path": fpath
                }

    # Quét uploads
    uploads_dir = "data/uploads"
    if os.path.exists(uploads_dir):
        for fname in sorted(os.listdir(uploads_dir)):
            if fname.lower().endswith(".pdf") and fname not in found_files:
                fpath = os.path.join(uploads_dir, fname)
                found_files[fname] = {
                    "file_name": fname,
                    "category": "Tài liệu đã tải lên",
                    "path": fpath
                }

    docs = []
    for fname, info in found_files.items():
        p = info["path"]
        if os.path.exists(p):
            sz = os.path.getsize(p)
            num_slides = 0
            has_text = False
            try:
                from pypdf import PdfReader
                reader = PdfReader(p)
                num_slides = len(reader.pages)
                for page in reader.pages[:3]:
                    txt = page.extract_text() or ""
                    if len(re.sub(r'[\s\x00-\x1f\x7f-\x9f]+', '', txt)) >= 20:
                        has_text = True
                        break
            except Exception:
                num_slides = 0
                has_text = False

            meta = DEFAULT_TITLE_MAP.get(fname)
            if meta:
                clean_title = meta[0]
                sub_code = meta[1]
                sub_desc = meta[2]
            else:
                clean_title = fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
                sub_code = f"SUB-{len(docs)+1:02d}"
                sub_desc = f"Tài liệu PDF gồm {num_slides} trang trích xuất trực tiếp từ tệp tin nguồn."

            docs.append({
                "file_name": fname,
                "title": clean_title,
                "subject_name": clean_title,
                "subject_code": sub_code,
                "category": info["category"],
                "total_slides": num_slides,
                "file_size": sz,
                "description": sub_desc,
                "is_active": (fname == active_filename),
                "has_text_layer": has_text,
                "is_scanned": not has_text
            })

    return {
        "success": True,
        "active_file": active_filename,
        "documents": docs
    }

@router.post("/lecturer/select-document")
def select_document(req: SelectDocumentRequest):
    """
    Chọn và kích hoạt một tài liệu có sẵn trong hệ thống để nạp vào giao diện Studio.
    """
    file_name = req.file_name.strip()
    target_path = None
    for candidate in [
        os.path.join("data/sample_slides", file_name),
        os.path.join("data/uploads", file_name),
        os.path.join("docs", file_name)
    ]:
        if os.path.exists(candidate):
            target_path = candidate
            break

    if not target_path:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy tài liệu '{file_name}' trên hệ thống.")

    try:
        parsed_result = slide_parser.convert_pdf_to_markdown(target_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi chuyển đổi: {str(e)}")

    sub_name = (req.subject_name or "").strip()
    sub_code = (req.subject_code or "").strip()
    if not sub_name or not sub_code:
        meta = DEFAULT_TITLE_MAP.get(file_name)
        if meta:
            sub_name = sub_name or meta[0]
            sub_code = sub_code or meta[1]
        else:
            sub_name = sub_name or file_name.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
            sub_code = sub_code or "SUB-01"

    # Lưu vào DB để trở thành tài liệu mới nhất kèm môn học
    mysql_db.save_document(
        source_file=parsed_result["source_file"],
        total_slides=parsed_result["total_slides"],
        structured_markdown=parsed_result["structured_markdown"],
        raw_markdown=parsed_result["raw_markdown"],
        subject_name=sub_name,
        subject_code=sub_code
    )

    return {
        "success": True,
        "message": f"Đã chọn và nạp thành công môn '{sub_name}' ({sub_code}) - tài liệu '{parsed_result['source_file']}' ({parsed_result['total_slides']} slide)",
        "file_name": parsed_result["source_file"],
        "source_file": parsed_result["source_file"],
        "subject_name": sub_name,
        "subject_code": sub_code,
        "total_slides": parsed_result["total_slides"],
        "has_transcript": parsed_result.get("has_transcript", False),
        "slides": parsed_result["slides"],
        "structured_markdown": parsed_result["structured_markdown"]
    }

@router.post("/lecturer/set-constraints")
def set_constraints(req: NoteConstraintRequest):
    """
    GIAI ĐOẠN 1: 2. GHI CHÚ BÀI DẠY CỦA GIẢNG VIÊN (Ràng buộc nội dung - Điều kiện tiên quyết)
    Chỉ định rõ 3 ô chỉ lệnh:
    - Ô 1: Nội dung đã học đến đâu
    - Ô 2: Cần lưu ý và nhấn mạnh ở đâu
    - Ô 3: Sinh ra tối đa bao nhiêu câu hỏi
    """
    global _lecturer_constraint_applied
    scope_text = (req.scope_note or req.lecturer_note or "").strip()
    emphasis_text = (req.emphasis_note or "").strip()
    max_q = req.max_questions or 10

    if not scope_text:
        raise HTTPException(status_code=400, detail="Vui lòng nhập nội dung phạm vi bài dạy đã học đến đâu (Ô 1).")

    # Xây dựng ghi chú tổng hợp lưu DB
    note_parts = [f"Phạm vi: {scope_text}"]
    if emphasis_text:
        note_parts.append(f"Lưu ý & Nhấn mạnh: {emphasis_text}")
    note_parts.append(f"Số câu tối đa: {max_q}")
    combined_raw_note = " | ".join(note_parts)

    target_path = None
    req_file = req.file_name.strip() if (req and req.file_name) else None
    candidates = []
    if req_file:
        candidates.extend([
            os.path.join("data/uploads", req_file),
            os.path.join("data/sample_slides", req_file),
            os.path.join("docs", req_file),
            req_file
        ])
    latest_doc = mysql_db.get_latest_document()
    if latest_doc and latest_doc.get("source_file"):
        source_name = latest_doc["source_file"]
        candidates.extend([
            os.path.join("data/uploads", source_name),
            os.path.join("data/sample_slides", source_name),
            os.path.join("docs", source_name),
            source_name
        ])
    candidates.append("data/sample_slides/slide-tu-duy-san-pham.pdf")

    for p in candidates:
        if os.path.exists(p):
            target_path = p
            break

    if not target_path or not os.path.exists(target_path):
        raise HTTPException(status_code=400, detail="Vui lòng nạp PDF trước")

    parsed = slide_parser.convert_pdf_to_markdown(target_path)
    constraints = graph_engine.parse_lecturer_note(scope_text)
    graph_result = graph_engine.build_knowledge_graph(parsed["slides"], constraints)

    # Lưu vào MySQL
    mysql_db.save_constraint(
        raw_note=combined_raw_note,
        min_slide=constraints["min_slide"],
        max_slide=constraints["max_slide"],
        in_scope=graph_result["in_scope_count"],
        blocked=graph_result["blocked_count"]
    )
    _lecturer_constraint_applied = True

    return {
        "success": True,
        "message": f"Đã áp dụng thành công 3 chỉ lệnh bài dạy của Giảng viên (Phạm vi Slide {constraints['min_slide']}-{constraints['max_slide']}, Tối đa {max_q} câu hỏi). Mở khóa AI sinh Quiz!",
        "constraints": constraints,
        "scope_note": scope_text,
        "emphasis_note": emphasis_text,
        "max_questions": max_q,
        "combined_note": combined_raw_note,
        "in_scope_count": graph_result["in_scope_count"],
        "blocked_count": graph_result["blocked_count"],
        "in_scope_concepts": graph_result["in_scope_concepts"],
        "blocked_concepts": graph_result["blocked_concepts"]
    }

@router.post("/lecturer/generate-quiz")
def generate_quiz(req: Optional[GenerateQuizRequest] = None):
    """
    GIAI ĐOẠN 1: 3. AI.GRAPH ENGINE
    - Kiểm tra ĐIỀU KIỆN TIÊN QUYẾT: Giảng viên đã ghi chú bài dạy và áp dụng ràng buộc
    - Nhận trực tiếp 3 ô chỉ lệnh (Ô 1: Phạm vi, Ô 2: Lưu ý & Nhấn mạnh, Ô 3: Số lượng câu)
    - Gửi kèm toàn bộ System Prompt sư phạm và 3 ô chỉ lệnh lên Google Gemini AI
    - Đối chiếu MD với Ghi chú
    - Chặn câu hỏi vượt trang quy định (Hard boundary block)
    - Gửi bản thảo sang MySQL
    """
    global _lecturer_constraint_applied
    c_info = mysql_db.get_latest_constraint()
    
    # Kiểm tra điều kiện tiên quyết cứng
    if not _lecturer_constraint_applied and not c_info and not (req and req.scope_note):
        raise HTTPException(
            status_code=400,
            detail="ĐIỀU KIỆN TIÊN QUYẾT: Vui lòng nhập ghi chú bài dạy thực tế (Bước 2) và bấm 'Áp Dụng Ràng Buộc' trước khi AI sinh đề."
        )

    scope_text = req.scope_note if req and req.scope_note else None
    emphasis_text = req.emphasis_note if req and req.emphasis_note else None
    max_questions = req.max_questions if req and req.max_questions else None

    if c_info and (not scope_text or not emphasis_text or not max_questions):
        raw_note = c_info.get("raw_note", "")
        if not scope_text:
            m_scope = re.search(r'Phạm vi:\s*([^|]+)', raw_note)
            if m_scope:
                scope_text = m_scope.group(1).strip()
            else:
                scope_text = c_info.get("raw_note", "Mới dạy xong Slide 1 - 10")
        if not emphasis_text:
            m_emp = re.search(r'Lưu ý & Nhấn mạnh:\s*([^|]+)', raw_note)
            if m_emp:
                emphasis_text = m_emp.group(1).strip()
        if not max_questions:
            m_q = re.search(r'Số câu tối đa:\s*(\d+)', raw_note)
            if m_q:
                max_questions = int(m_q.group(1))

    scope_text = scope_text or "Mới dạy xong Slide 1 - 10"
    emphasis_text = emphasis_text or "Nhấn mạnh vào tư duy JTBD (Jobs-to-be-done) và nỗi đau thực tế của người dùng, chuyển thành tình huống kinh doanh thuần Việt gần gũi."
    max_questions = max_questions or 10

    # Xác định file tài liệu đang kích hoạt
    sample_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    target_path = None
    req_file = req.file_name.strip() if (req and req.file_name) else None
    candidates = []
    if req_file:
        candidates.extend([
            os.path.join("data/uploads", req_file),
            os.path.join("data/sample_slides", req_file),
            os.path.join("docs", req_file),
            req_file
        ])
    latest_doc = mysql_db.get_latest_document()
    if latest_doc and latest_doc.get("source_file"):
        source_name = latest_doc["source_file"]
        candidates.extend([
            os.path.join("data/uploads", source_name),
            os.path.join("data/sample_slides", source_name),
            os.path.join("docs", source_name),
            source_name
        ])
    candidates.append(sample_path)

    for p in candidates:
        if os.path.exists(p):
            target_path = p
            break

    if not target_path or not os.path.exists(target_path):
        raise HTTPException(status_code=400, detail="Chưa có dữ liệu slide PDF")

    parsed = slide_parser.convert_pdf_to_markdown(target_path)
    constraints = graph_engine.parse_lecturer_note(scope_text)
    
    kg = graph_engine.build_knowledge_graph(parsed["slides"], constraints)
    draft_quiz = quiz_generator.generate_draft_quiz(
        kg, 
        max_questions=max_questions,
        scope_note=scope_text,
        emphasis_note=emphasis_text
    )

    if draft_quiz.get("status") == "AI_GENERATION_FAILED" or not draft_quiz.get("questions"):
        raise HTTPException(
            status_code=502,
            detail=draft_quiz.get("error_message", "Không thể sinh câu hỏi tự động từ AI Google Gemini.")
        )
    
    # Gắn thông tin môn học vào bộ đề
    sub_name = (req.subject_name if req else None) or (latest_doc.get("subject_name") if latest_doc else None)
    sub_code = (req.subject_code if req else None) or (latest_doc.get("subject_code") if latest_doc else None)
    file_basename = os.path.basename(target_path)
    if not sub_name or not sub_code:
        meta = DEFAULT_TITLE_MAP.get(file_basename)
        if meta:
            sub_name = sub_name or meta[0]
            sub_code = sub_code or meta[1]
        else:
            sub_name = sub_name or file_basename.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
            sub_code = sub_code or "SUB-01"

    draft_quiz["subject_name"] = sub_name
    draft_quiz["subject_code"] = sub_code
    draft_quiz["source_file"] = file_basename
    if sub_name and ("Tư duy sản phẩm" not in draft_quiz.get("quiz_title", "") or file_basename != "slide-tu-duy-san-pham.pdf"):
        draft_quiz["quiz_title"] = f"Bộ Đánh Giá Kiến Thức: {sub_name}"

    # Lưu vào MySQL
    quiz_id = mysql_db.save_quiz_draft(draft_quiz)
    draft_quiz["quiz_id"] = quiz_id

    return {
        "success": True,
        "message": f"AI.Graph Engine đã sinh thành công {draft_quiz['total_questions']} câu hỏi môn '{sub_name}' ({sub_code}) bám sát 3 chỉ lệnh bài dạy của Giảng viên từ tài liệu {file_basename} và lưu vào CSDL",
        "quiz": draft_quiz
    }

@router.get("/lecturer/current-draft")
def get_current_draft_quiz():
    """
    Lấy bản thảo bộ câu hỏi mới nhất do AI sinh ra (từ CSDL)
    để hiển thị trực tiếp trên giao diện Giảng viên Menu 3.
    """
    quiz = mysql_db.get_latest_quiz()
    if not quiz:
        return {"success": False, "message": "Chưa có bản thảo quiz nào trong hệ thống."}
    return {
        "success": True,
        "quiz": quiz
    }

@router.put("/lecturer/questions/{question_id}")
def update_draft_question(question_id: str, req: UpdateQuestionRequest):
    """
    GIAI ĐOẠN 1: 4. GIẢNG VIÊN KIỂM DUYỆT (Chỉnh sửa trực tiếp trước khi duyệt)
    """
    ok = mysql_db.update_draft_question(
        question_code=question_id,
        question_text=req.question_text,
        options=req.options,
        correct_index=req.correct_index,
        explanation=None
    )
    if not ok:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy câu hỏi {question_id} để cập nhật")
    return {"success": True, "message": f"Đã cập nhật câu hỏi {question_id}"}

@router.delete("/lecturer/questions/{question_id}")
def delete_draft_question(question_id: str):
    """
    GIAI ĐOẠN 1: 4. GIẢNG VIÊN KIỂM DUYỆT (Loại bỏ câu hỏi không đạt yêu cầu)
    """
    ok = mysql_db.delete_draft_question(question_id)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy câu hỏi {question_id} để xóa")
    return {"success": True, "message": f"Đã xóa câu hỏi {question_id}"}

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

@router.get("/student/courses")
def get_student_courses():
    """
    Trả về danh sách toàn bộ các môn học thật được tạo ra từ tài liệu bài giảng thật 
    và các bộ đề thi đã sinh ra trong hệ thống. Loại bỏ 100% dữ liệu mẫu giả định.
    """
    title_map = DEFAULT_TITLE_MAP

    dirs = ['data/sample_slides', 'data/uploads']
    found_files = {}
    for d in dirs:
        if os.path.exists(d):
            for f in sorted(os.listdir(d)):
                if f.lower().endswith('.pdf') and f not in found_files:
                    p = os.path.join(d, f)
                    found_files[f] = p

    all_quizzes = mysql_db.get_all_quizzes()
    published_quizzes = [q for q in all_quizzes if q.get("status") == "PUBLISHED"]

    courses = []
    for idx, (fname, fpath) in enumerate(found_files.items(), 1):
        num_slides = 0
        try:
            from pypdf import PdfReader
            num_slides = len(PdfReader(fpath).pages)
        except Exception:
            num_slides = 0

        default_meta = (
            fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title(),
            f"SUB-{idx:02d}",
            f"Tài liệu bài giảng gồm {num_slides} trang trích xuất trực tiếp từ tệp tin nguồn."
        )
        meta = title_map.get(fname, default_meta)
        name, code, desc = meta[0], meta[1], meta[2]

        # Tìm các quiz gắn với môn học này
        matching_quizzes = []
        for q in all_quizzes:
            q_title_lower = q.get("title", "").lower()
            q_code = (q.get("subject_code") or "").upper()
            q_name = (q.get("subject_name") or "").lower()
            q_file = q.get("source_file") or ""

            if q_code and q_code == code.upper():
                matching_quizzes.append(q)
            elif q_file and q_file == fname:
                matching_quizzes.append(q)
            elif q_name and (q_name in name.lower() or name.lower() in q_name):
                matching_quizzes.append(q)
            elif fname == "slide-tu-duy-san-pham.pdf" and ("tư duy sản phẩm" in q_title_lower or "product" in q_title_lower):
                matching_quizzes.append(q)
            elif "tmđt" in q_title_lower and ("tmdt" in fname.lower() or "chap3" in fname.lower()):
                matching_quizzes.append(q)
            elif "đám mây" in q_title_lower and "diemtoan" in fname.lower():
                matching_quizzes.append(q)
            elif "bán dẫn" in q_title_lower and "bán dẫnn" in fname.lower():
                matching_quizzes.append(q)
            elif "thu chi" in q_title_lower and "thuchi" in fname.lower():
                matching_quizzes.append(q)

        # Mặc định gắn quiz đã duyệt nếu là môn chính và chưa có quiz khớp
        if not matching_quizzes and fname == "slide-tu-duy-san-pham.pdf" and published_quizzes:
            matching_quizzes = [published_quizzes[0]]

        exercises = []
        if matching_quizzes:
            # Dedup matching quizzes by id
            seen_ids = set()
            for q_idx, q in enumerate(matching_quizzes, 1):
                if q["id"] in seen_ids:
                    continue
                seen_ids.add(q["id"])
                exercises.append({
                    "id": q["id"],
                    "quiz_id": q["id"],
                    "title": q["title"],
                    "time": q.get("created_at") or "Vừa cập nhật",
                    "progress": 0,
                    "color": "indigo" if q_idx % 2 == 1 else "emerald",
                    "total_questions": q.get("total_questions", 10),
                    "status": q.get("status", "PUBLISHED")
                })
        else:
            exercises.append({
                "id": f"ex_{idx}",
                "quiz_id": published_quizzes[0]["id"] if published_quizzes else (all_quizzes[0]["id"] if all_quizzes else None),
                "title": f"Bài đánh giá thích ứng: {name}",
                "time": "Sẵn sàng",
                "progress": 0,
                "color": "indigo",
                "total_questions": num_slides if (num_slides > 0 and num_slides <= 15) else 10,
                "status": "READY"
            })

        courses.append({
            "id": idx,
            "name": name,
            "code": code,
            "docsCount": 1,
            "total_slides": num_slides,
            "file_name": fname,
            "description": desc,
            "exercises": exercises
        })

    return {
        "success": True,
        "total": len(courses),
        "courses": courses
    }

@router.get("/student/current-quiz")
def get_student_quiz(quiz_id: Optional[str] = None):
    """
    5. HỌC VIÊN LÀM BÀI QUIZ ĐÁNH GIÁ (Giao diện phong cách Quiz.com)
    """
    quiz = None
    if quiz_id:
        quiz = mysql_db.get_quiz_details(quiz_id)
    if not quiz or not quiz.get("questions"):
        quiz = mysql_db.get_latest_quiz(published_only=True)
    if not quiz or not quiz.get("questions"):
        quiz = mysql_db.get_latest_quiz()

    if not quiz or not quiz.get("questions"):
        # Dự phòng quét toàn bộ CSDL tìm đề có câu hỏi
        all_quizzes = mysql_db.get_all_quizzes()
        for candidate in all_quizzes:
            det = mysql_db.get_quiz_details(candidate.get("id"))
            if det and det.get("questions"):
                quiz = det
                break

    if not quiz or not quiz.get("questions"):
        return {
            "is_published": False,
            "message": "Giảng viên đang biên soạn bộ câu hỏi. Vui lòng quay lại sau ít phút!"
        }

    # Trả về câu hỏi an toàn không lộ đáp án
    safe_questions = []
    for q in quiz["questions"]:
        safe_questions.append({
            "id": q.get("id"),
            "question_index": q.get("question_index", 1),
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "slide_page": q.get("slide_page", 1),
            "provenance": q.get("provenance") or f"Slide Trang {q.get('slide_page', 1)}",
            "core_concept": q.get("core_concept", "Kiến thức trọng tâm"),
            "is_core": q.get("is_core", True)
        })

    resolved_quiz_id = quiz.get("quiz_id") or quiz.get("id")
    resolved_title = quiz.get("quiz_title") or quiz.get("title") or "Bộ Đánh Giá Thích Ứng"

    return {
        "is_published": True,
        "id": resolved_quiz_id,
        "quiz_id": resolved_quiz_id,
        "title": resolved_title,
        "quiz_title": resolved_title,
        "total_questions": len(safe_questions),
        "questions": safe_questions
    }

@router.post("/student/submit-quiz")
def submit_student_quiz(req: StudentSubmitRequest):
    """
    GIAI ĐOẠN 2: PHÂN LOẠI KẾT QUẢ BÀI LÀM
    - Đúng toàn bộ / 100% đúng -> ĐÚNG HẾT CÁC CÂU CỐT LÕI (2 lựa chọn đi tiếp)
    - Có câu làm sai -> CÓ CÂU LÀM SAI (Phát hiện hổng kiến thức):
      + Kích hoạt lưu trữ và Thống kê các câu/concept bị sai nhiều nhất (Xếp từ cao xuống thấp)
        -> Đường nét đứt: Báo danh sách các phần bị làm sai nhiều nhất về Giảng viên
      + Vòng lặp: Giải thích lại bằng ngôn ngữ đời thường + Quiz ôn tập tình huống mới 100%
    """
    quiz = None
    if req.quiz_id:
        quiz = mysql_db.get_quiz_details(req.quiz_id)
    if not quiz:
        quiz = mysql_db.get_latest_quiz(published_only=True)
    if not quiz:
        quiz = mysql_db.get_latest_quiz()
    if not quiz:
        raise HTTPException(status_code=400, detail="Không tìm thấy bài thi")

    # 1. Khối hình thoi: PHÂN LOẠI KẾT QUẢ BÀI LÀM
    result = adaptive_engine.evaluate_quiz_submission(quiz, req.answers)
    
    # 2. Lưu lượt làm bài vào MySQL
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

    # 3. Nếu rơi vào nhánh CÓ CÂU LÀM SAI (Phát hiện hổng kiến thức):
    if not result.get("mastery_achieved") and "remediation_package" in result:
        mysql_db.save_remediation_session(
            session_id=result["session_id"],
            student_name=req.student_name,
            items=result["remediation_package"]["remediation_items"]
        )

    # Đính kèm số liệu thống kê lỗi mới nhất được tính từ khối Thống kê sai
    result["mistake_analytics"] = mysql_db.get_mistake_analytics()
    return result

@router.post("/student/submit-remediation")
def submit_remediation(req: RemediationSubmitRequest):
    """
    GIAI ĐOẠN 2: Điểm hồi tiếp của Vòng lặp Re-eval:
    Làm xong Quiz ôn tập -> Đánh giá lại -> QUAY TRỞ LẠI HÌNH THOI "PHÂN LOẠI KẾT QUẢ BÀI LÀM"
    - Nếu đạt: Sang nhánh xanh "ĐÚNG HẾT CÁC CÂU CỐT LÕI" -> Mở 2 lựa chọn đi tiếp
    - Nếu chưa đạt: Tự động rẽ lại vào nhánh đỏ "CÓ CÂU LÀM SAI" -> Cập nhật thống kê & đưa gói ôn tập mới
    """
    session = mysql_db.get_remediation_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Phiên ôn tập không tồn tại")

    # Đánh giá lại và hồi tiếp vào bộ phân loại
    eval_res = adaptive_engine.evaluate_remediation_answers(session["remediation_items"], req.answers)
    
    # Cập nhật kết quả phiên ôn tập vào MySQL
    mysql_db.update_remediation_session(
        session_id=req.session_id,
        retry_answers=req.answers,
        status=eval_res["status"],
        score_percent=eval_res["score_percent"]
    )

    # Nếu vẫn còn câu sai -> Cập nhật danh sách câu hỏi ôn tập tiếp theo vào session
    if not eval_res.get("mastery_achieved") and "remediation_package" in eval_res:
        mysql_db.save_remediation_session(
            session_id=req.session_id,
            student_name=session.get("student_name", "Học viên"),
            items=eval_res["remediation_package"]["remediation_items"]
        )

    eval_res["mistake_analytics"] = mysql_db.get_mistake_analytics()
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

# ==============================================================================
# MENU 4: QUẢN LÝ CÁC BÀI ĐÁNH GIÁ ĐÃ SINH & ĐÃ DUYỆT (THÊM, SỬA, XÓA, HỦY QUYỀN LÀM BÀI)
# ==============================================================================

@router.get("/lecturer/quizzes")
def get_all_quizzes():
    """
    Trả về danh sách tất cả các bộ đề thi đã sinh ra / đã được duyệt trong hệ thống.
    """
    quizzes = mysql_db.get_all_quizzes()
    return {
        "success": True,
        "total": len(quizzes),
        "quizzes": quizzes
    }

@router.get("/lecturer/quizzes/{quiz_id}")
def get_quiz_details(quiz_id: str):
    """
    Trả về chi tiết một bộ đề thi cùng toàn bộ câu hỏi bên trong.
    """
    quiz = mysql_db.get_quiz_details(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ đề thi này.")
    return {
        "success": True,
        "quiz": quiz
    }

@router.post("/lecturer/quizzes")
def create_new_quiz(req: CreateQuizRequest):
    """
    Thêm mới một bộ đề thi rỗng hoặc từ mẫu.
    """
    quiz_id = mysql_db.create_quiz(title=req.title, status=req.status)
    return {
        "success": True,
        "message": "Đã tạo bộ đề thi mới thành công!",
        "quiz_id": quiz_id
    }

@router.put("/lecturer/quizzes/{quiz_id}")
def update_quiz_info(quiz_id: str, req: UpdateQuizRequest):
    """
    Chỉnh sửa thông tin bộ đề thi (tiêu đề, trạng thái).
    """
    ok = mysql_db.update_quiz(quiz_id, title=req.title, status=req.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ đề thi.")
    return {
        "success": True,
        "message": "Đã cập nhật bộ đề thi thành công!"
    }

@router.delete("/lecturer/quizzes/{quiz_id}")
def delete_quiz(quiz_id: str):
    """
    Xóa một bộ đề thi khỏi hệ thống.
    """
    ok = mysql_db.delete_quiz(quiz_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ đề thi để xóa.")
    return {
        "success": True,
        "message": "Đã xóa bộ đề thi thành công!"
    }

@router.post("/lecturer/quizzes/{quiz_id}/toggle-status")
def toggle_quiz_status(quiz_id: str):
    """
    Bật / Hủy quyền cho sinh viên làm bài ở đề thi này:
    - Nếu đang PUBLISHED -> Chuyển thành DISABLED (Hủy quyền làm bài)
    - Nếu đang DISABLED/DRAFT -> Chuyển thành PUBLISHED (Mở quyền cho SV làm)
    """
    quiz = mysql_db.get_quiz_details(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ đề thi.")
    
    current_status = quiz.get("status")
    new_status = "DISABLED" if current_status == "PUBLISHED" else "PUBLISHED"
    mysql_db.update_quiz(quiz_id, status=new_status)
    
    status_msg = "Đã khóa / Hủy quyền làm bài của sinh viên đối với đề thi này!" if new_status == "DISABLED" else "Đã mở quyền cho sinh viên vào làm bài đề thi này!"
    return {
        "success": True,
        "status": new_status,
        "message": status_msg
    }

@router.post("/lecturer/quizzes/{quiz_id}/questions")
def add_question_to_quiz(quiz_id: str, req: QuizQuestionRequest):
    """
    Thêm câu hỏi mới vào một bộ đề thi cụ thể.
    """
    q_data = {
        "question": req.question,
        "options": req.options,
        "correct_index": req.correct_index,
        "explanation": req.explanation,
        "slide_page": req.slide_page,
        "core_concept": req.core_concept
    }
    try:
        q_code = mysql_db.add_question_to_quiz(quiz_id, q_data)
        return {
            "success": True,
            "message": f"Đã thêm câu hỏi {q_code} vào bộ đề thi thành công!",
            "question_code": q_code
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/lecturer/quizzes/{quiz_id}/questions/{question_code}")
def update_question_in_quiz(quiz_id: str, question_code: str, req: QuizQuestionRequest):
    """
    Chỉnh sửa nội dung câu hỏi trong một bộ đề thi cụ thể.
    """
    q_data = {
        "question": req.question,
        "options": req.options,
        "correct_index": req.correct_index,
        "explanation": req.explanation,
        "slide_page": req.slide_page,
        "core_concept": req.core_concept
    }
    ok = mysql_db.update_question_in_quiz(quiz_id, question_code, q_data)
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi tương ứng để sửa.")
    return {
        "success": True,
        "message": f"Đã cập nhật câu hỏi {question_code} thành công!"
    }

@router.delete("/lecturer/quizzes/{quiz_id}/questions/{question_code}")
def delete_question_from_quiz(quiz_id: str, question_code: str):
    """
    Xóa câu hỏi khỏi một bộ đề thi cụ thể.
    """
    ok = mysql_db.delete_question_from_quiz(quiz_id, question_code)
    if not ok:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi để xóa.")
    return {
        "success": True,
        "message": f"Đã xóa câu hỏi {question_code} khỏi bộ đề thi!"
    }
