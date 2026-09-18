import sys
import os
from starlette.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)
    print("=== TEST 1: System Status ===")
    res = client.get("/api/system/status")
    assert res.status_code == 200
    print("PASS: System Status OK")

    print("\n=== TEST 2: Convert PDF with MarkItDown & Extract Slides ===")
    with open("data/sample_slides/slide-tu-duy-san-pham.pdf", "rb") as f:
        res = client.post("/api/lecturer/upload-pdf", files={"file": ("slide-tu-duy-san-pham.pdf", f, "application/pdf")})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["total_slides"] == 15
    print(f"PASS: MarkItDown converted {data['total_slides']} slides successfully!")

    print("\n=== TEST 3: Lecturer Constraints (Hard Boundary Enforcement) ===")
    note_payload = {"lecturer_note": "Mới dạy xong Slide 1 - 10, tuyệt đối không ra câu hỏi kiến thức nâng cao"}
    res = client.post("/api/lecturer/set-constraints", json=note_payload)
    assert res.status_code == 200
    c_data = res.json()
    assert c_data["constraints"]["max_slide"] == 10
    assert c_data["in_scope_count"] == 10
    assert c_data["blocked_count"] == 5
    print(f"PASS: In-scope concepts: {c_data['in_scope_count']}, Blocked concepts: {c_data['blocked_count']}")
    print(f"Verified First Blocked: {c_data['blocked_concepts'][0]['label']} -> {c_data['blocked_concepts'][0]['block_reason']}")

    print("\n=== TEST 4: AI.GRAPH ENGINE Generate Draft Quiz ===")
    res = client.post("/api/lecturer/generate-quiz")
    assert res.status_code == 200
    quiz_data = res.json()["quiz"]
    assert quiz_data["total_questions"] == 10
    assert quiz_data["status"] == "PENDING_LECTURER_REVIEW"
    # Kiểm tra 100% câu hỏi có trích dẫn Slide <= 10 và DEMO-NNN
    for q in quiz_data["questions"]:
        assert q["slide_page"] <= 10, f"Vi phạm ranh giới: {q['slide_page']} > 10"
        assert "DEMO-" in q["citation_code"], f"Thiếu trích dẫn DEMO: {q['citation_code']}"
        assert len(q["options"]) == 4
    print("PASS: Generated 10/10 questions within Slide 1-10 with 100% Provenance citations!")

    print("\n=== TEST 5: Lecturer Review & Publish (Human-in-the-loop Gatekeeping) ===")
    res = client.post("/api/lecturer/publish-quiz")
    assert res.status_code == 200
    assert res.json()["quiz"]["status"] == "PUBLISHED"
    print("PASS: Lecturer approved and published quiz successfully!")

    print("\n=== TEST 6: Student Quiz Fetch ===")
    res = client.get("/api/student/current-quiz")
    assert res.status_code == 200
    st_quiz = res.json()
    assert st_quiz["is_published"] is True
    assert st_quiz["total_questions"] == 10
    # Đảm bảo học viên không thấy trường 'correct_index' hay 'explanation'
    for q in st_quiz["questions"]:
        assert "correct_index" not in q, "Lỗi bảo mật: Lộ đáp án đúng cho học viên!"
        assert "explanation" not in q, "Lỗi bảo mật: Lộ lời giải trước khi nộp bài!"
    print("PASS: Student view is clean and secure without answer leakage!")

    print("\n=== TEST 7: Case A - Student 100% Correct (Mastery Branch) ===")
    all_correct = {q["id"]: quiz_data["questions"][i]["correct_index"] for i, q in enumerate(st_quiz["questions"])}
    res = client.post("/api/student/submit-quiz", json={"student_name": "Nguyễn Văn A", "answers": all_correct})
    assert res.status_code == 200
    pass_res = res.json()
    assert pass_res["status"] == "ALL_CORRECT_MASTERY"
    assert pass_res["mastery_achieved"] is True
    assert len(pass_res["next_options"]) == 2
    print(f"PASS: 100% Score -> Direct Mastery with 2 choices: {[opt['title'] for opt in pass_res['next_options']]}")

    print("\n=== TEST 8: Case B - Student Has Mistakes (Adaptive Remediation Branch) ===")
    partial_answers = dict(all_correct)
    # Cố tình chọn sai câu Q01 và Q02
    partial_answers["Q01"] = (all_correct["Q01"] + 1) % 4
    partial_answers["Q02"] = (all_correct["Q02"] + 1) % 4
    res = client.post("/api/student/submit-quiz", json={"student_name": "Trần Thị B", "answers": partial_answers})
    assert res.status_code == 200
    fail_res = res.json()
    assert fail_res["status"] == "HAS_WRONG_ANSWERS"
    assert fail_res["mastery_achieved"] is False
    assert fail_res["wrong_count"] == 2
    rem_pkg = fail_res["remediation_package"]
    assert len(rem_pkg["remediation_items"]) == 2

    for item in rem_pkg["remediation_items"]:
        # Kiểm tra giải thích đời thường thuần Việt & trích dẫn nguồn
        exp = item["everyday_explanation"]
        assert len(exp["detail"]) > 20
        assert "Slide Trang" in exp["citation"]
        # Kiểm tra quiz ôn tập tình huống mới 100%
        retry_q = item["adaptive_question"]
        assert retry_q["is_brand_new_scenario"] is True
        assert retry_q["id"].startswith("RETRY_")
    print(f"PASS: Triggered Adaptive Remediation for {fail_res['wrong_count']} mistakes with everyday explanations & 100% new situational scenarios!")

    print("\n=== TEST 9: Student Completes Adaptive Retry (Closing the Loop) ===")
    session_id = fail_res["session_id"]
    retry_items = rem_pkg["remediation_items"]
    retry_answers = {item["adaptive_question"]["id"]: item["adaptive_question"]["correct_index"] for item in retry_items}
    res = client.post("/api/student/submit-remediation", json={"session_id": session_id, "answers": retry_answers})
    assert res.status_code == 200
    retry_res = res.json()
    assert retry_res["status"] == "REMEDIATION_PASSED"
    assert retry_res["mastery_achieved"] is True
    print(f"PASS: Completed Adaptive Loop! Mastery achieved: {retry_res['message']}")

    print("\n🎉 ALL 9 PIPELINE TESTS PASSED 100%! 🎉")

if __name__ == "__main__":
    run_tests()

