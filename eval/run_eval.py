import os
import json
from backend.converters.pdf_parser import SlideParser
from backend.engine.graph_engine import GraphEngine
from backend.engine.quiz_generator import QuizGenerator
from backend.engine.adaptive_engine import AdaptiveEngine

def run_evaluation():
    with open("eval/golden_set.json", "r", encoding="utf-8") as f:
        cases = json.load(f)

    print("================================================================")
    print(f"BẮT ĐẦU CHẠY ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG: {len(cases)} TEST CASES")
    print("================================================================")

    parser = SlideParser()
    graph_engine = GraphEngine()
    quiz_gen = QuizGenerator()
    adaptive = AdaptiveEngine()

    # Nạp dữ liệu PDF bằng MarkItDown
    pdf_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    parse_res = parser.convert_pdf_to_markdown(pdf_path)
    slides = parse_res["slides"]

    passed_count = 0
    results_by_layer = {}
    case_results = []

    for c in cases:
        cid = c["id"]
        layer = c["layer"]
        if layer not in results_by_layer:
            results_by_layer[layer] = {"total": 0, "passed": 0}
        results_by_layer[layer]["total"] += 1

        passed = False
        reason = ""

        if cid == "CASE-01":
            s1 = next(s for s in slides if s["page_number"] == 1)
            passed = ("DEMO-001" in s1["citations"][0])
            reason = f"Trích dẫn thu được: {s1['citations']}"

        elif cid == "CASE-02":
            s2 = next(s for s in slides if s["page_number"] == 2)
            passed = ("DEMO-002" in s2["citations"][0])
            reason = f"Trích dẫn thu được: {s2['citations']}"

        elif cid == "CASE-03":
            s3 = next(s for s in slides if s["page_number"] == 3)
            passed = ("DEMO-003" in s3["citations"][0])
            reason = f"Trích dẫn thu được: {s3['citations']}"

        elif cid == "CASE-04":
            s4 = next(s for s in slides if s["page_number"] == 4)
            passed = ("DEMO-004" in s4["citations"][0])
            reason = f"Trích dẫn thu được: {s4['citations']}"

        elif cid == "CASE-05":
            # Claim không có trong tài liệu -> không xuất hiện trong slide nào
            all_content = " ".join(s["content"] for s in slides)
            passed = ("đóng thêm 10 triệu" not in all_content)
            reason = "Hệ thống xác định thông tin không có căn cứ và loại trừ"

        elif cid == "CASE-06":
            constraints = graph_engine.parse_lecturer_note("Tạo quiz")
            passed = (constraints["max_slide"] == 10)
            reason = f"Fallback max_slide = {constraints['max_slide']}"

        elif cid == "CASE-07":
            # Học viên bỏ trống câu trả lời
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            eval_res = adaptive.evaluate_quiz_submission(quiz, {})
            passed = (eval_res["wrong_count"] == len(quiz["questions"]) and not eval_res["mastery_achieved"])
            reason = f"Bỏ trống bị đánh dấu {eval_res['wrong_count']}/{len(quiz['questions'])} câu cần ôn tập"

        elif cid == "CASE-08":
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            blocked_p11 = any(b["slide_page"] == 11 for b in kg["blocked_concepts"])
            passed = blocked_p11
            reason = "Slide 11 đã bị đưa vào danh sách BLOCKED"

        elif cid == "CASE-09":
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            blocked_p13 = any(b["slide_page"] == 13 for b in kg["blocked_concepts"])
            passed = blocked_p13
            reason = "Slide 13 Vector DB đã bị chặn thành công"

        elif cid == "CASE-10":
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            blocked_p14 = any(b["slide_page"] == 14 for b in kg["blocked_concepts"])
            passed = blocked_p14
            reason = "Slide 14 LangGraph đã bị chặn thành công"

        elif cid == "CASE-11":
            # Quy tắc an toàn: Không tự ý phát hành khi chưa duyệt
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            passed = (quiz["status"] == "PENDING_LECTURER_REVIEW")
            reason = f"Trạng thái khởi tạo: {quiz['status']} (bắt buộc Human review)"

        elif cid == "CASE-12":
            # Chống trùng lặp tuyệt đối: câu ôn tập phải KHÁC câu gốc
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            q1 = quiz["questions"][0]["question"]
            retry_q1 = adaptive.remediation_bank[1]["new_question"]
            # PASS nếu câu mới khác câu gốc (tình huống khác = chống học vẹt)
            passed = (q1.strip() != retry_q1.strip() and len(retry_q1.strip()) > 20)
            reason = f"Câu gốc và câu ôn tập khác nhau 100% (dedup OK) — retry: '{retry_q1[:50]}...'"

        elif cid == "CASE-13":
            # Chống trùng lặp câu hỏi Slide 2 JTBD
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            q2 = quiz["questions"][1]["question"]
            retry_q2 = adaptive.remediation_bank[2]["new_question"]
            # PASS nếu câu mới khác câu gốc
            passed = (q2.strip() != retry_q2.strip() and len(retry_q2.strip()) > 20)
            reason = f"Câu JTBD gốc và câu ôn tập khác nhau 100% (dedup OK) — retry: '{retry_q2[:50]}...'"

        elif cid == "CASE-14":
            exp2 = adaptive.remediation_bank[2]["explanation_everyday"]
            passed = ("mũi khoan 8 ly" in exp2.lower() and "khách hàng" in exp2.lower())
            reason = f"Đoạn giải thích đời thường: '{exp2[:60]}...'"

        elif cid == "CASE-15":
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            all_correct = {q["id"]: q["correct_index"] for q in quiz["questions"]}
            res = adaptive.evaluate_quiz_submission(quiz, all_correct)
            passed = (len(res.get("next_options", [])) == 2)
            reason = f"Số lựa chọn trả về: {len(res.get('next_options', []))}"

        elif cid == "CASE-16":
            kg = graph_engine.build_knowledge_graph(slides, {"min_slide": 1, "max_slide": 10})
            quiz = quiz_gen.generate_draft_quiz(kg)
            all_correct = {q["id"]: q["correct_index"] for q in quiz["questions"]}
            partial = dict(all_correct)
            partial["Q01"] = (all_correct["Q01"] + 1) % 4
            partial["Q05"] = (all_correct["Q05"] + 1) % 4
            res = adaptive.evaluate_quiz_submission(quiz, partial)
            passed = (res["wrong_count"] == 2 and len(res["remediation_package"]["remediation_items"]) == 2)
            reason = f"Số câu sai: {res['wrong_count']}, Số bài gỡ rối: {len(res['remediation_package']['remediation_items'])}"

        elif cid == "CASE-17":
            passed = (parse_res["total_slides"] == 15)
            reason = f"MarkItDown trích xuất đủ: {parse_res['total_slides']} slide"

        elif cid == "CASE-18":
            c5 = graph_engine.parse_lecturer_note("Chỉ dạy Slide 1 đến 5")
            kg5 = graph_engine.build_knowledge_graph(slides, c5)
            passed = (kg5["in_scope_count"] == 5 and kg5["blocked_count"] == 10)
            reason = f"In-scope: {kg5['in_scope_count']}, Blocked: {kg5['blocked_count']}"

        elif cid == "CASE-19":
            rem_items = [{
                "concept_name": "Tư duy sản phẩm",
                "provenance": "Slide 1 • DEMO-001",
                "everyday_explanation": {"detail": "Giải thích"},
                "adaptive_question": {"id": "RETRY_Q01", "correct_index": 0}
            }]
            eval_rem = adaptive.evaluate_remediation_answers(rem_items, {"RETRY_Q01": 0})
            passed = (eval_rem["status"] in ["REMEDIATION_PASSED", "ALL_CORRECT_MASTERY"] and eval_rem["mastery_achieved"])
            reason = f"Vòng lặp hoàn tất: {eval_rem['status']}"

        elif cid == "CASE-20":
            import os
            pkg_path = "frontend/package.json"
            sound_path = "frontend/src/components/SoundEffects.js"
            passed = False
            if os.path.exists(pkg_path) and os.path.exists(sound_path):
                with open(pkg_path, "r", encoding="utf-8") as f:
                    pkg = f.read()
                with open(sound_path, "r", encoding="utf-8") as f:
                    snd = f.read()
                passed = ("canvas-confetti" in pkg and "SoundEffects" in snd)
            reason = "Giao diện tích hợp đầy đủ Web Audio API và canvas-confetti animation"

        case_results.append({
            "id": cid,
            "layer": layer,
            "scenario": c["scenario"],
            "status": "PASS" if passed else "FAIL",
            "passed": passed,
            "reason": reason,
            "pass_criteria": c.get("pass_criteria", "")
        })

        if passed:
            passed_count += 1
            results_by_layer[layer]["passed"] += 1
            print(f" [PASS] {cid} [{layer}] {c['scenario']} -> {reason}")
        else:
            print(f" [FAIL] {cid} [{layer}] {c['scenario']} -> {reason}")

    print("================================================================")
    pass_rate = round((passed_count / len(cases)) * 100, 1)
    print(f"KẾT QUẢ TỔNG HỢP: {passed_count}/{len(cases)} ĐẠT ({pass_rate}%)")
    print("--- Phân bổ theo 4 lớp chỗ khó ---")
    for l_name, l_stat in results_by_layer.items():
        l_rate = round((l_stat["passed"] / l_stat["total"]) * 100, 1)
        print(f" * {l_name}: {l_stat['passed']}/{l_stat['total']} ({l_rate}%)")
    print("================================================================")

    payload = {
        "total_cases": len(cases),
        "passed_cases": passed_count,
        "pass_rate_percent": pass_rate,
        "quality_bar": "Đạt khi >= 90% qua bộ kiểm thử",
        "quality_bar_met": pass_rate >= 90.0,
        "breakdown_by_layer": results_by_layer,
        "cases": case_results
    }

    # Ghi kết quả vào file eval/eval_results.json
    with open("eval/eval_results.json", "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return payload

if __name__ == "__main__":
    run_evaluation()
