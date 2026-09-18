import os
import sys
import json
import time
from fastapi.testclient import TestClient
from dotenv import load_dotenv

load_dotenv()

# Thêm root dir vào sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

client = TestClient(app)

def print_separator(title: str):
    print("\n" + "="*80)
    print(f"🚀 {title.upper()}")
    print("="*80)

def test_full_e2e_workflow():
    print_separator("BẮT ĐẦU KIỂM THỬ TOÀN TRÌNH E2E VỚI GEMINI API THẬT")

    # --------------------------------------------------------------------------
    # BƯỚC 1: ĐẨY FILE PDF LÊN HỆ THỐNG & CHUYỂN ĐỔI SANG MARKDOWN
    # --------------------------------------------------------------------------
    print_separator("BƯỚC 1: TẢI LÊN FILE PDF BÀI GIẢNG (UPLOAD & EXTRACT MARKDOWN)")
    pdf_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    assert os.path.exists(pdf_path), f"Không tìm thấy file PDF tại {pdf_path}"

    with open(pdf_path, "rb") as f:
        response = client.post(
            "/api/lecturer/upload-pdf",
            files={"file": ("slide-tu-duy-san-pham.pdf", f, "application/pdf")}
        )

    print(f"[Upload PDF] Status Code: {response.status_code}")
    assert response.status_code == 200, f"Upload thất bại: {response.text}"
    upload_res = response.json()
    print(f"  ✓ Tên tài liệu: {upload_res.get('file_name')}")
    print(f"  ✓ Tổng số trang trích xuất: {upload_res.get('total_slides')} trang")
    print(f"  ✓ Có kèm Transcript không: {upload_res.get('has_transcript')}")
    assert upload_res.get("total_slides") == 15, "Phải trích xuất đủ 15 slide"

    # --------------------------------------------------------------------------
    # BƯỚC 2: THIẾT LẬP CHỈ LỆNH & RANH GIỚI BÀI DẠY CỦA GIẢNG VIÊN (3 Ô)
    # --------------------------------------------------------------------------
    print_separator("BƯỚC 2: GIẢNG VIÊN ĐIỀN GHI CHÚ & CHỈ LỆNH BÀI DẠY (3 Ô)")
    constraints_payload = {
        "scope_note": "Mới dạy xong Slide 1 đến Slide 10. Slide 11 trở đi chưa dạy.",
        "emphasis_note": "Tập trung khai thác khái niệm JTBD (Jobs to Be Done) và Chân dung Khách hàng. Yêu cầu gắn trích dẫn chính xác.",
        "max_questions": 5
    }
    response = client.post("/api/lecturer/set-constraints", json=constraints_payload)
    print(f"[Set Constraints] Status Code: {response.status_code}")
    assert response.status_code == 200, f"Lỗi set constraints: {response.text}"
    constraints_res = response.json()
    print(f"  ✓ Ranh giới cho phép: Slide {constraints_res.get('constraints', {}).get('min_slide')} - {constraints_res.get('constraints', {}).get('max_slide')}")
    print(f"  ✓ Số concepts trong ranh giới: {constraints_res.get('in_scope_count')}")
    print(f"  ✓ Số concepts bị chặn (slide > 10): {constraints_res.get('blocked_count')}")

    # --------------------------------------------------------------------------
    # BƯỚC 3: AI CHẠY THẬT GEMINI API KEY ĐỂ SINH BỘ CÂU HỎI
    # --------------------------------------------------------------------------
    print_separator("BƯỚC 3: AI CHẠY THẬT GOOGLE GEMINI API KEY ĐỂ SINH CÂU HỎI TÌNH HUỐNG")
    start_time = time.time()
    response = client.post("/api/lecturer/generate-quiz")
    elapsed = time.time() - start_time

    print(f"[Generate Quiz] Status Code: {response.status_code} (Thời gian xử lý: {elapsed:.2f}s)")
    assert response.status_code == 200, f"Lỗi sinh đề: {response.text}"
    data = response.json()
    quiz_data = data.get("quiz", {})
    questions = quiz_data.get("questions", [])
    print(f"  ✓ Tiêu đề bộ câu hỏi: {quiz_data.get('quiz_title')}")
    print(f"  ✓ Số câu hỏi sinh ra: {len(questions)}")
    print(f"  ✓ Trạng thái bộ đề: {quiz_data.get('status')}")
    assert len(questions) > 0, "Không có câu hỏi nào được sinh ra!"

    # In chi tiết từng câu hỏi do Gemini sinh ra
    for i, q in enumerate(questions, 1):
        print(f"\n  --- [CÂU HỎI {i}: {q.get('id')}] ---")
        print(f"  Concept: {q.get('core_concept')}")
        print(f"  Căn cứ trích dẫn: {q.get('provenance')} (Code: {q.get('citation_code')})")
        print(f"  Nội dung tình huống: {q.get('question')}")
        for opt_idx, opt in enumerate(q.get("options", [])):
            prefix = " [*] " if opt_idx == q.get("correct_index") else " [ ] "
            print(f"    {chr(65 + opt_idx)}.{prefix}{opt}")
        print(f"  Giải thích: {q.get('explanation')}")

        # Kiểm tra quy tắc ranh giới cốt lõi: Không câu hỏi nào vượt quá Slide 10
        assert q.get("slide_page", 1) <= 10, f"Lỗi ranh giới: Câu {q.get('id')} từ slide {q.get('slide_page')} > 10!"
        assert q.get("citation_code", "").startswith("DEMO-"), "Thiếu mã trích dẫn DEMO-NNN!"

    # --------------------------------------------------------------------------
    # BƯỚC 4: GIẢNG VIÊN KIỂM ĐỊNH & PHÁT HÀNH ĐỀ THI (HUMAN-IN-THE-LOOP)
    # --------------------------------------------------------------------------
    print_separator("BƯỚC 4: GIẢNG VIÊN DUYỆT KIỂM ĐỊNH VÀ PHÁT HÀNH ĐỀ THI (PUBLISH)")
    response = client.post("/api/lecturer/publish-quiz")
    print(f"[Publish Quiz] Status Code: {response.status_code}")
    assert response.status_code == 200, f"Duyệt đề thất bại: {response.text}"
    publish_res = response.json()
    published_quiz = publish_res.get("quiz", {})
    print(f"  ✓ Đề thi đã được duyệt & phát hành thành công!")
    print(f"  ✓ Quiz ID phát hành: {published_quiz.get('quiz_id')}")
    print(f"  ✓ Trạng thái mới: {published_quiz.get('status')}")
    print(f"  ✓ Số câu hỏi được mở cho sinh viên: {len(published_quiz.get('questions', []))}")
    assert published_quiz.get("status") == "PUBLISHED", "Đề thi phải ở trạng thái PUBLISHED"

    # --------------------------------------------------------------------------
    # BƯỚC 5: SINH VIÊN NHẬN ĐỀ, LÀM BÀI VÀ NỘP BÀI THI
    # --------------------------------------------------------------------------
    print_separator("BƯỚC 5: SINH VIÊN LẤY ĐỀ THI VỪA PHÁT HÀNH, LÀM BÀI & NHẬN ĐÁNH GIÁ")
    # Sinh viên lấy đề thi hiện hành
    response = client.get("/api/student/current-quiz")
    print(f"[Student Current Quiz] Status Code: {response.status_code}")
    assert response.status_code == 200
    student_quiz = response.json()
    assert student_quiz.get("is_published") is True, "Học viên phải thấy đề thi đã được phát hành!"
    student_questions = student_quiz.get("questions", [])
    print(f"  ✓ Học viên nhận đề thi: {student_quiz.get('quiz_title')}")
    print(f"  ✓ Số lượng câu hỏi học viên nhận được: {len(student_questions)}")
    assert len(student_questions) == len(questions), "Số lượng câu hỏi sinh viên nhận phải khớp với đề đã duyệt!"

    # Sinh viên giải bài: chọn đúng một số câu và làm sai 1 câu để kích hoạt phân nhánh Adaptive Learning
    # Lấy đáp án đúng từ bộ đề gốc (để mô phỏng hành vi sinh viên)
    correct_map = {q["id"]: q["correct_index"] for q in questions}
    student_answers = {}
    for idx, q in enumerate(student_questions):
        q_id = q.get("id")
        c_idx = correct_map.get(q_id, 0)
        # Giả lập câu đầu chọn sai để test cơ chế Adaptive Learning, các câu sau chọn đúng
        student_answers[q_id] = (c_idx + 1) % 4 if idx == 0 else c_idx

    submit_payload = {
        "student_name": "Đặng Thị Mai Anh (K4-3B)",
        "answers": student_answers
    }
    submit_res = client.post("/api/student/submit-quiz", json=submit_payload)
    print(f"[Student Submit] Status Code: {submit_res.status_code}")
    assert submit_res.status_code == 200
    eval_result = submit_res.json()

    print("\n" + "-"*60)
    print(" KẾT QUẢ ĐÁNH GIÁ CỦA SINH VIÊN (AUTOMATED EVALUATION):")
    print(f"  ✓ Thí sinh: {eval_result.get('student_name')}")
    print(f"  ✓ Trạng thái phân loại: {eval_result.get('status')}")
    print(f"  ✓ Kết quả đúng: {eval_result.get('correct_count')} / {eval_result.get('total_questions')} câu")
    print(f"  ✓ Điểm số quy đổi: {eval_result.get('score_percent')}%")
    print(f"  ✓ Đạt chuẩn đầu ra (Mastery Achieved): {eval_result.get('mastery_achieved')}")

    # Gói học tập thích ứng (Adaptive Learning Remediation Package)
    remediation = eval_result.get("remediation_package", {})
    if remediation:
        items = remediation.get("remediation_items", [])
        print("\n PHÂN TÍCH LỖ HỔNG KIẾN THỨC & GÓI HỌC TẬP THÍCH ỨNG (ADAPTIVE REMEDIATION):")
        print(f"  ✓ Session ID ôn tập: {eval_result.get('session_id')}")
        print(f"  ✓ Số câu làm sai cần củng cố: {len(items)}")
        for rem_item in items:
            exp = rem_item.get("everyday_explanation", {})
            ad_q = rem_item.get("adaptive_question", {})
            print(f"  ✓ Slide bài giảng cần đọc lại: Trang {rem_item.get('slide_page')} ({rem_item.get('citation_code')})")
            print(f"  ✓ Concept hổng kiến thức: {rem_item.get('concept_name')}")
            print(f"  ✓ Giải thích ngôn ngữ đời thường: {exp.get('detail')}")
            print(f"  ✓ Câu hỏi ôn tập tình huống MỚI 100%: {ad_q.get('question')}")
            print(f"    Mới toanh (không trùng câu cũ): {ad_q.get('is_brand_new_scenario')}")

    print_separator("TOÀN TRÌNH KIỂM THỬ THÀNH CÔNG 100%!")
    return True

if __name__ == "__main__":
    test_full_e2e_workflow()
