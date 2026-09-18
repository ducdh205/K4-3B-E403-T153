import os
import sys
import json
import uuid
import random

# Load .env
from dotenv import load_dotenv
load_dotenv()

from backend.converters.pdf_parser import SlideParser
from backend.engine.graph_engine import GraphEngine
from backend.engine.quiz_generator import QuizGenerator
from backend.engine.adaptive_engine import AdaptiveEngine
from backend.storage.mysql_db import mysql_db

def seed_database():
    print("==================================================================")
    print("BẮT ĐẦU CHẠY THẬT & ĐỔ ĐẦY DỮ LIỆU VÀO DATABASE (SEEDING)")
    print("==================================================================")

    # 1. BƯỚC 1: MarkItDown trích xuất PDF -> Markdown và lưu vào docs/ & documents table
    pdf_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    if not os.path.exists(pdf_path):
        from scripts.generate_sample_pdf import generate_sample_pdf
        generate_sample_pdf(pdf_path)

    print("\n[BƯỚC 1] Chạy MarkItDown trích xuất Slide PDF...")
    parser = SlideParser()
    parse_result = parser.convert_pdf_to_markdown(pdf_path)
    doc_id = mysql_db.save_document(
        source_file=parse_result["source_file"],
        total_slides=parse_result["total_slides"],
        structured_markdown=parse_result["structured_markdown"],
        raw_markdown=parse_result["raw_markdown"]
    )
    print(f" -> Đã lưu tài liệu ID {doc_id} ({parse_result['total_slides']} slide) vào Database!")
    print(f" -> Đã lưu file Markdown vào: {parse_result.get('saved_md_path', 'docs/')}")
    print(f" -> Đã lưu file PDF vào: {parse_result.get('saved_pdf_path', 'docs/')}")

    # 2. BƯỚC 2: Thiết lập Ghi chú Giảng viên (Ranh giới cứng Slide 1-10)
    print("\n[BƯỚC 2] Thiết lập Ràng buộc Giảng viên...")
    graph_engine = GraphEngine()
    constraints = graph_engine.parse_lecturer_note("Mới dạy xong Slide 1 - 10")
    kg = graph_engine.build_knowledge_graph(parse_result["slides"], constraints)
    mysql_db.save_constraint(
        raw_note="Mới dạy xong Slide 1 - 10",
        min_slide=constraints["min_slide"],
        max_slide=constraints["max_slide"],
        in_scope=kg["in_scope_count"],
        blocked=kg["blocked_count"]
    )
    print(f" -> Đã lưu ràng buộc: Cho phép {kg['in_scope_count']} Concept (Slide 1-10), Chặn {kg['blocked_count']} Concept (Slide 11-15)!")

    # 3. BƯỚC 3: AI.Graph Engine kết nối Gemini sinh Quiz
    print("\n[BƯỚC 3] AI.Graph Engine kết nối Gemini sinh 10 câu hỏi có căn cứ...")
    quiz_gen = QuizGenerator()
    draft_quiz = quiz_gen.generate_draft_quiz(kg)
    quiz_id = mysql_db.save_quiz_draft(draft_quiz)
    print(f" -> Đã lưu bản thảo Quiz ID '{quiz_id}' ({draft_quiz['total_questions']} câu) vào bảng quizzes & questions!")

    # 4. BƯỚC 4: Giảng viên duyệt & Phát hành Quiz
    print("\n[BƯỚC 4] Giảng viên kiểm duyệt & Phát hành Quiz...")
    published = mysql_db.publish_latest_quiz()
    print(f" -> Quiz ID '{published['quiz_id']}' đã chuyển trạng thái thành: {published['status']}!")

    # 5. BƯỚC 5: Sinh dữ liệu lượt làm bài của học viên (Student Attempts)
    print("\n[BƯỚC 5] Đổ dữ liệu 15 lượt học viên nộp bài kiểm tra...")
    adaptive = AdaptiveEngine()
    quiz_obj = mysql_db.get_latest_quiz()
    questions = quiz_obj["questions"]

    student_names = [
        ("Nguyễn Văn An", "SV01"),
        ("Trần Thị Bình", "SV02"),
        ("Lê Hoàng Cường", "SV03"),
        ("Phạm Thị Dung", "SV04"),
        ("Hoàng Đức Minh", "SV05"),
        ("Nguyễn Văn Tứ", "SV06"),
        ("Đinh Hoàng Đức", "SV07"),
        ("Nguyễn Quang Huy", "SV08"),
        ("Vũ Minh Thu", "SV09"),
        ("Đặng Thanh Bình", "SV10"),
        ("Bùi Phước Tiến", "SV11"),
        ("Lý Gia Hân", "SV12"),
        ("Mai Quốc Việt", "SV13"),
        ("Đỗ Hải Yến", "SV14"),
        ("Phan Thành Nam", "SV15"),
    ]

    for idx, (s_name, s_code) in enumerate(student_names, 1):
        answers = {}
        # 3 học viên đầu làm đúng 100% (Mastered)
        if idx <= 3:
            for q in questions:
                answers[q["id"]] = q["correct_index"]
        else:
            # Các học viên khác có lỗi sai thực tế
            for q_idx, q in enumerate(questions):
                correct = q["correct_index"]
                # Tỉ lệ sai cao hơn ở Q01, Q02, Q04 để tạo biểu đồ phân bố đẹp
                if q["id"] in ["Q01", "Q02"] and random.random() < 0.6:
                    answers[q["id"]] = (correct + 1) % 4  # Chọn sai
                elif q["id"] in ["Q04", "Q05"] and random.random() < 0.4:
                    answers[q["id"]] = (correct + 2) % 4  # Chọn sai
                elif random.random() < 0.2:
                    answers[q["id"]] = (correct + 1) % 4
                else:
                    answers[q["id"]] = correct

        eval_res = adaptive.evaluate_quiz_submission(quiz_obj, answers)
        attempt_id = str(uuid.uuid4())
        mysql_db.save_attempt(
            attempt_id=attempt_id,
            quiz_id=quiz_obj["quiz_id"],
            student_name=f"{s_name} ({s_code})",
            answers=answers,
            correct_count=eval_res["correct_count"],
            total_questions=eval_res["total_questions"],
            score_percent=eval_res["score_percent"],
            status=eval_res["status"]
        )
        print(f"   [{idx:02d}/15] {s_name} ({s_code}): {eval_res['correct_count']}/10 câu ({eval_res['score_percent']}%) -> Trạng thái: {eval_res['status']}")

    # 6. BƯỚC 6: Kiểm tra Báo cáo Giảng viên từ cơ sở dữ liệu
    print("\n[BƯỚC 6] Trích xuất Báo cáo Lỗi sai Giảng viên (Dashed Feedback Loop)...")
    analytics = mysql_db.get_mistake_analytics()
    print(f" -> Tổng số lượt làm bài: {analytics['total_attempts']}")
    print(" -> Bảng xếp hạng các concept bị làm sai nhiều nhất:")
    for item in analytics["ranked_mistakes"]:
        print(f"    [Rank {item['rank']}] {item['concept']} ({item['provenance']}): {item['fail_count']} lần sai ({item['fail_rate']}%)")

    print("\n🎉 ĐÃ NẠP ĐẦY ĐỦ TOÀN BỘ DỮ LIỆU THẬT VÀO CƠ SỞ DỮ LIỆU THÀNH CÔNG! 🎉")

if __name__ == "__main__":
    seed_database()
