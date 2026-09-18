import uuid
from typing import List, Dict, Any, Optional

# ==============================================================================
# SYSTEM PROMPT CHO VÒNG LẶP HỌC TẬP THÍCH ỨNG (GỠ RỐI & TÌNH HUỐNG MỚI 100%)
# ==============================================================================
ADAPTIVE_REMEDIATION_SYSTEM_PROMPT = """
BẠN LÀ VLEARN ADAPTIVE TUTOR — TRỢ LÝ HỌC TẬP THÍCH ỨNG CHUYÊN SÂU.
NHIỆM VỤ: Khi học viên làm sai câu hỏi trong bài đánh giá ban đầu, thực hiện gỡ rối kiến thức tại chỗ và kiểm tra lại bằng tình huống mới.

QUY TẮC BẮT BUỘC:
1. GIẢI THÍCH NGÔN NGỮ ĐỜI THƯỜNG THUẦN VIỆT (EVERYDAY EXPLANATION):
   - Không lặp lại định nghĩa khô cứng trong sách giáo khoa.
   - Dùng ví dụ đời thường, cách so sánh hình tượng dễ nhớ ("Đừng mua mũi khoan khi chưa cần lỗ khoan", "Đừng vội mua búa thông minh...").
   - Tập trung trực diện vào bản chất lỗi sai mà học viên vừa mắc phải.

2. TRÍCH DẪN NGUỒN CHUẨN XÁC (PROVENANCE):
   - Trích dẫn chính xác số trang slide và mã DEMO: `Slide Trang X • [DEMO-NNN]`.

3. KHỐI QUIZ ÔN TẬP TÌNH HUỐNG MỚI TOANH 100% (ZERO DUPLICATION):
   - Đổi 100% bối cảnh và nhân vật so với câu hỏi học viên vừa làm sai (Ví dụ: câu cũ anh Nam bán trà sữa -> câu mới chị Mai shop thời trang).
   - Đảm bảo kiểm tra cùng một concept cốt lõi nhưng qua tình huống hoàn toàn mới để chống học vẹt đáp án A, B, C, D.
"""

class AdaptiveEngine:
    def __init__(self):
        self.system_prompt = ADAPTIVE_REMEDIATION_SYSTEM_PROMPT
        # Ngân hàng câu hỏi tình huống mới 100% (hoàn toàn khác biệt với Q01-Q10) dùng cho vòng lặp ôn tập
        self.remediation_bank = {
            1: { # Concept: AI-User-Centricity (Slide 1, DEMO-001)
                "new_question": "Chị Mai quản lý một cửa hàng thời trang muốn tăng doanh thu. Chị đang cân nhắc giữa: (A) Chi 50 triệu thuê làm chatbot AI gợi ý phối đồ, hay (B) Nói chuyện với 15 khách quen để biết vì sao họ bỏ giỏ hàng giữa chừng. Theo tư duy sản phẩm AI đúng đắn, chị Mai nên làm gì trước?",
                "options": [
                    "Chọn (B): Nói chuyện tìm hiểu đúng 'pain point' trước khi quyết định có cần AI hay không",
                    "Chọn (A): Mua ngay chatbot AI vì công nghệ luôn đi đầu",
                    "Không làm gì cả vì ngành thời trang không thể áp dụng AI",
                    "Tự suy đoán lý do rồi tự sửa website mà không cần hỏi khách"
                ],
                "correct_index": 0,
                "explanation_everyday": "Chào bạn! Ở câu này, bạn hãy nhớ nguyên tắc cốt lõi: 'Đừng vội mua búa thông minh khi chưa biết chiếc đinh nằm ở đâu'. Làm sản phẩm AI phải bắt đầu từ việc hiểu sâu sắc nỗi đau thực tế của người dùng, chứ không phải sính công nghệ LLM.",
                "slide_page": 1,
                "citation_code": "DEMO-001",
                "core_concept": "Tư duy sản phẩm lấy người dùng làm trung tâm"
            },
            2: { # Concept: JTBD-Framework (Slide 2, DEMO-002)
                "new_question": "Một bạn sinh viên phỏng vấn người dùng dịch vụ giặt là để viết tuyên bố JTBD. Bạn ấy viết: 'Người dùng cần một hệ thống AI nhận diện loại vải tự động'. Câu này bị giảng viên nhắc nhở vì lý do gì?",
                "options": [
                    "Câu quá ngắn, cần viết dài ít nhất 3 dòng",
                    "Đã vi phạm nguyên tắc JTBD vì nhồi nhét chữ 'AI' và giải pháp công nghệ vào nhu cầu cốt lõi",
                    "Vì sinh viên thường tự giặt đồ bằng tay",
                    "Vì nhận diện loại vải là việc của máy móc chứ không phải con người"
                ],
                "correct_index": 1,
                "explanation_everyday": "Bí kíp nằm ở đây: Khách hàng mua mũi khoan 8 ly không phải vì họ yêu cái mũi khoan, mà vì họ cần 'một cái lỗ 8 ly trên tường'. Khi viết JTBD, chỉ mô tả việc người ta muốn hoàn thành (Động từ + Đối tượng + Ngữ cảnh), TUYỆT ĐỐI không cho chữ 'AI' hay công nghệ vào câu bạn nhé!",
                "slide_page": 2,
                "citation_code": "DEMO-002",
                "core_concept": "Khung công việc JTBD chuẩn"
            },
            3: { # Concept: Evidence-Standards (Slide 3, DEMO-003)
                "new_question": "Bạn Tuấn muốn thuyết phục nhà đầu tư rằng ứng dụng tìm bạn học cùng của mình có tiềm năng. Dữ liệu nào sau đây được xem là 'Bằng chứng đạt chuẩn'?",
                "options": [
                    "Tuấn nói: 'Em thấy 5 người bạn thân cùng phòng em ai cũng thích ý tưởng này'",
                    "Tuấn đưa kết quả khảo sát 25 sinh viên ngẫu nhiên với 68% xác nhận gặp khó khăn khi tìm bạn ôn thi, kèm bảng ghi âm và trích dẫn 6 câu nói nguyên văn",
                    "Tuấn trích dẫn một bài báo chung chung về giáo dục năm 2020",
                    "Tuấn dự đoán trong tương lai sinh viên sẽ lười học nhóm hơn"
                ],
                "correct_index": 1,
                "explanation_everyday": "Căn cứ khoa học rất rõ ràng: 'Cảm giác' của vài người bạn thân không thể làm bằng chứng sản phẩm. Chuẩn A bắt buộc phải có ít nhất 20 người được khảo sát độc lập (với ≥50% đồng thuận), hoặc Chuẩn B phải có số đếm thống kê kèm trích dẫn nguyên văn kiểm tra được.",
                "slide_page": 3,
                "citation_code": "DEMO-003",
                "core_concept": "Chuẩn bằng chứng A & B"
            },
            4: { # Concept: One-Sentence-Slice (Slide 4, DEMO-004)
                "new_question": "Trong buổi bảo vệ ý tưởng, đội A trình bày: 'Dự án của em là một nền tảng hỗ trợ tuyển dụng thông minh cho toàn bộ doanh nghiệp Việt Nam'. Huấn luyện viên yêu cầu thu nhỏ thành 'Lát cắt một câu'. Câu nào dưới đây đạt chuẩn?",
                "options": [
                    "Một ứng viên tải CV lên, AI tự động quét lỗi sai định dạng phổ biến và gợi ý cách sửa câu văn, giúp ứng viên tăng tỷ lệ được gọi phỏng vấn",
                    "Một siêu ứng dụng tự động phỏng vấn và chấm điểm mọi nghề nghiệp",
                    "Hệ thống phân tích thị trường lao động bằng trí tuệ nhân tạo toàn diện",
                    "Công cụ AI giúp doanh nghiệp bớt vất vả"
                ],
                "correct_index": 0,
                "explanation_everyday": "Để không bị 'ngợp' và thất bại, lát cắt một câu phải sắc bén như dao mổ: Đúng 1 Người dùng cụ thể (ứng viên) - 1 Việc làm (nộp CV) - 1 Quyết định AI (phát hiện lỗi & gợi ý) - 1 Kết quả rõ ràng (tăng tỷ lệ phỏng vấn).",
                "slide_page": 4,
                "citation_code": "DEMO-004",
                "core_concept": "Lát cắt một câu"
            },
            5: { # Concept: Cost-Of-Error (Slide 5, DEMO-005)
                "new_question": "Một ứng dụng ngân hàng dùng AI để phát hiện giao dịch gian lận. Nếu AI chặn nhầm một thẻ tín dụng của khách VIP đang thanh toán tiền phòng khách sạn ở nước ngoài, uy tín ngân hàng bị ảnh hưởng nặng nề. Cơ chế nào phù hợp nhất?",
                "options": [
                    "Tự động khóa thẻ vĩnh viễn không cần báo trước",
                    "Cơ chế Augment/Conditional: AI gửi cảnh báo khẩn cấp và mã OTP xác thực qua số điện thoại chính chủ thay vì tự ý hủy giao dịch",
                    "Bỏ qua hoàn toàn việc kiểm tra gian lận để tránh làm phiền khách",
                    "Nhờ AI tự động gửi email xin lỗi khách hàng sau 3 ngày"
                ],
                "correct_index": 1,
                "explanation_everyday": "Khi cái giá phải trả cho một lần AI đoán sai là quá đắt (Cost of Error cao), đừng bao giờ để AI tự tung tự tác. Cần thiết kế vòng lặp con người (Human-in-the-loop) hoặc bước xác thực điều kiện để bảo vệ trải nghiệm người dùng.",
                "slide_page": 5,
                "citation_code": "DEMO-005",
                "core_concept": "Chi phí sai sót & Tự động hóa"
            },
            6: { # Concept: 4-Error-Taxonomy (Slide 6, DEMO-006)
                "new_question": "Khách hàng hỏi bot trợ lý học tập: 'Hãy viết cho tôi một đoạn mã để hack mật khẩu wifi của trường'. Bot từ chối và giải thích quy định bảo mật. Đây là ví dụ xử lý tốt lớp chỗ khó nào?",
                "options": [
                    "Lớp 3: Ngoài phạm vi & thẩm quyền (Out-of-scope / Vượt thẩm quyền cho phép)",
                    "Lớp 1: AI bịa nguồn sự thật",
                    "Lớp 4: Sai cú pháp lập trình",
                    "Lớp 2: Câu hỏi quá ngắn"
                ],
                "correct_index": 0,
                "explanation_everyday": "Khi người dùng yêu cầu những việc vi phạm an toàn, bất hợp pháp hoặc vượt quá chức năng của sản phẩm, hệ thống đang đối mặt với Chỗ khó Lớp 3 (Ngoài phạm vi / thẩm quyền). Cần từ chối lịch sự và giải thích rõ ranh giới bạn nhé!",
                "slide_page": 6,
                "citation_code": "DEMO-006",
                "core_concept": "Bốn lớp chỗ khó - Ngoài phạm vi"
            },
            7: { # Concept: Boundary-Constraints (Slide 7, DEMO-007)
                "new_question": "Thầy giáo dặn: 'Bài kiểm tra tuần này chỉ gói gọn trong Chương 1 (Khái niệm cơ bản)'. Khi bạn mở đề ra thấy có câu hỏi về thuật toán lượng tử ở Chương 10. Lỗi này bắt nguồn từ đâu trong hệ thống tạo đề?",
                "options": [
                    "Do đường truyền mạng wifi bị chậm",
                    "Hệ thống sinh đề đã vi phạm ranh giới kiến thức (Knowledge Boundary Constraints), không đối chiếu với chỉ định phạm vi của giáo viên",
                    "Do học sinh chưa đọc trước sách học kỳ sau",
                    "Không có lỗi nào cả, học sinh phải tự học thêm"
                ],
                "correct_index": 1,
                "explanation_everyday": "Chặn kiến thức vượt rào là quy tắc sống còn! Nếu thầy dặn dạy đến trang 10 thì AI chỉ được phép quét tài liệu trong giới hạn trang 10. Mọi nỗ lực ra đề vượt trang đều là lỗi vi phạm ranh giới bài giảng.",
                "slide_page": 7,
                "citation_code": "DEMO-007",
                "core_concept": "Ràng buộc phạm vi bài dạy"
            },
            8: { # Concept: Provenance-Traceability (Slide 8, DEMO-008)
                "new_question": "Một người dùng phàn nàn: 'Câu trả lời của AI trong app nghe rất thuyết phục nhưng khi tôi tìm trong sách thì không thấy'. Để giải quyết triệt để vấn đề này, tính năng nào là cần thiết nhất?",
                "options": [
                    "Tăng font chữ to hơn",
                    "Tính năng Trích dẫn nguồn (Provenance Traceability): Mỗi câu khẳng định đều có link bấm đến đúng số trang và mã đoạn tài liệu gốc",
                    "Tạo thêm hình vẽ hoạt hình minh họa",
                    "Bổ sung nút đánh giá 5 sao cho chatbot"
                ],
                "correct_index": 1,
                "explanation_everyday": "Muốn người dùng tin tưởng 100%, lời nói của AI phải 'nói có sách, mách có chứng'. Tính năng Provenance gắn chặt từng câu hỏi, câu trả lời với số trang và mã trích dẫn gốc trong tài liệu.",
                "slide_page": 8,
                "citation_code": "DEMO-008",
                "core_concept": "Trích dẫn nguồn chuẩn xác"
            },
            9: { # Concept: Educator-Gatekeeping (Slide 9, DEMO-009)
                "new_question": "Công ty giáo dục X quyết định sa thải toàn bộ ban cố vấn chuyên môn và để AI tự động 100% sinh đề và gửi bài thi cho 10.000 học sinh. Rủi ro lớn nhất công ty phải đối mặt là gì?",
                "options": [
                    "Mất đi chốt chặn con người (Educator Gatekeeping), dẫn đến việc câu hỏi sai lệch hoặc có ảo giác không được phát hiện, gây khủng hoảng niềm tin nghiêm trọng",
                    "Máy chủ chạy quá nhanh làm tốn điện",
                    "Học sinh được điểm quá cao",
                    "Các phụ huynh không thích giao diện website"
                ],
                "correct_index": 0,
                "explanation_everyday": "AI là công cụ trợ lực tuyệt vời nhưng không thể thay thế phán đoán sư phạm của người thầy. Chốt chặn kiểm duyệt của giảng viên đảm bảo đề thi chuẩn mực, không có hạt sạn kiến thức trước khi đến tay học viên.",
                "slide_page": 9,
                "citation_code": "DEMO-009",
                "core_concept": "Chốt chặn kiểm duyệt"
            },
            10: { # Concept: Adaptive-Remediation (Slide 10, DEMO-010)
                "new_question": "Sau khi làm sai câu hỏi về 'Tư duy lấy người dùng làm trung tâm', bé Na được hệ thống cho làm lại ngay câu hỏi y hệt câu vừa sai và Na chọn đáp án A vì vừa thấy màn hình giải thích chọn A. Cách thiết kế này mắc khuyết điểm gì?",
                "options": [
                    "Bé Na chưa thực sự hiểu bản chất mà chỉ đang 'học vẹt' lại đáp án câu cũ; hệ thống cần đưa tình huống MỚI TOANH 100% để đánh giá năng lực thật",
                    "Hệ thống nên trừ hết điểm của Na",
                    "Na cần phải làm thêm 50 câu hỏi tương tự",
                    "Không có khuyết điểm gì, làm lại đúng là đạt"
                ],
                "correct_index": 0,
                "explanation_everyday": "Làm lại đúng câu cũ thì chỉ là nhớ mặt chữ thôi bạn ơi! Vòng lặp thích ứng thông minh phải tạo ra một bài toán đời thường hoàn toàn mới nhưng cùng bản chất để kiểm tra xem bạn đã thực sự 'giác ngộ' kiến thức hay chưa.",
                "slide_page": 10,
                "citation_code": "DEMO-010",
                "core_concept": "Vòng lặp học tập thích ứng"
            }
        }

    def evaluate_quiz_submission(self, original_quiz: Dict[str, Any], student_answers: Dict[str, int]) -> Dict[str, Any]:
        """
        GIAI ĐOẠN 2: PHÂN LOẠI KẾT QUẢ & VÒNG LẶP ÔN TẬP KIẾN THỨC SAI
        - Phân loại kết quả bài làm:
          + Đúng 100% (Đúng hết các câu cốt lõi) -> Sang nhánh chúc mừng & 2 lựa chọn đi tiếp
          + Có câu làm sai -> Sang nhánh Gỡ rối tại chỗ (Giải thích thuần Việt + Quiz ôn tập tình huống mới 100%)
        """
        questions = original_quiz.get("questions", [])
        total_questions = len(questions)
        
        correct_count = 0
        wrong_questions = []

        for q_idx, q in enumerate(questions):
            q_id = q.get("id", f"Q{q_idx+1:02d}")
            # Flexible answer matching (support q_id, string index, int index)
            user_ans = student_answers.get(q_id)
            if user_ans is None:
                user_ans = student_answers.get(str(q_idx))
            if user_ans is None:
                user_ans = student_answers.get(q_idx)
            if user_ans is None and "question_index" in q:
                user_ans = student_answers.get(str(q["question_index"]))
            if user_ans is not None:
                try:
                    user_ans = int(user_ans)
                except (ValueError, TypeError):
                    user_ans = None

            correct_ans = q.get("correct_index", 0)
            is_correct = (user_ans is not None and user_ans == correct_ans)

            if is_correct:
                correct_count += 1
            else:
                wrong_questions.append({
                    "id": q_id,
                    "question_id": q_id,
                    "question": q["question"],
                    "question_text": q["question"],
                    "options": q["options"],
                    "user_selected": user_ans,
                    "user_selected_text": q["options"][user_ans] if user_ans is not None and 0 <= user_ans < len(q["options"]) else "Chưa chọn",
                    "correct_index": correct_ans,
                    "correct_text": q["options"][correct_ans] if 0 <= correct_ans < len(q["options"]) else "",
                    "slide_page": q.get("slide_page", 1),
                    "citation_code": q.get("citation_code", f"DEMO-{q_idx+1:03d}"),
                    "core_concept": q.get("core_concept", "Core Concept"),
                    "explanation": q.get("explanation", ""),
                    "original_explanation": q.get("explanation", "")
                })

        score_percent = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0
        is_all_correct = (correct_count == total_questions)

        if is_all_correct:
            return {
                "session_id": str(uuid.uuid4()),
                "status": "ALL_CORRECT_MASTERY",
                "score_percent": 100,
                "correct_count": correct_count,
                "wrong_count": 0,
                "wrong_questions": [],
                "total_questions": total_questions,
                "message": "Tuyệt vời! Bạn đã xuất sắc trả lời đúng toàn bộ các câu hỏi cốt lõi!",
                "mastery_achieved": True,
                "next_options": [
                    {
                        "id": "OPT_ADVANCED_LEVEL",
                        "title": "Lựa chọn 1: Nâng cao level bài hiện tại",
                        "description": "Thử thách với các câu hỏi phân tích tình huống thực chiến đa chiều và bài toán sản phẩm hóc búa hơn."
                    },
                    {
                        "id": "OPT_NEXT_LESSON",
                        "title": "Lựa chọn 2: Chuyển sang bài học tiếp theo",
                        "description": "Tiến bước sang bài giảng tiếp theo trong lộ trình khoá học AI Thực Chiến."
                    }
                ]
            }
        else:
            # Nhánh Có câu làm sai -> Kích hoạt Gỡ rối tại chỗ
            remediation_items = []
            for w in wrong_questions:
                p_num = w["slide_page"]
                rem_data = self.remediation_bank.get(p_num, {
                    "new_question": f"Tình huống thực tế ứng dụng kiến thức Slide {p_num}: Khi triển khai trong doanh nghiệp thực tế, cách tiếp cận nào đảm bảo nguyên tắc cốt lõi?",
                    "options": [
                        f"Tuân thủ nghiêm ngặt chuẩn mực nêu tại {w['citation_code']}",
                        "Bỏ qua quy chuẩn để đẩy nhanh tiến độ",
                        "Làm theo cảm tính không cần đo lường",
                        "Không quan tâm phản hồi của người dùng"
                    ],
                    "correct_index": 0,
                    "explanation_everyday": f"Bạn chú ý nhé: Kiến thức này xuất phát từ tài liệu đào tạo Slide Trang {p_num}. Hãy lưu ý áp dụng đúng quy chuẩn.",
                    "slide_page": p_num,
                    "citation_code": w["citation_code"],
                    "core_concept": w["core_concept"]
                })

                item = {
                    "source_question_id": w["question_id"],
                    "concept_name": w["core_concept"],
                    "provenance": f"Slide Trang {p_num} • {w['citation_code']}",
                    "slide_page": p_num,
                    "citation_code": w["citation_code"],
                    # 1. Giải thích kiến thức sai bằng ngôn ngữ đời thường thuần Việt & trích dẫn chuẩn
                    "everyday_explanation": {
                        "summary": f"Điểm mấu chốt bạn cần nhớ ở {w['core_concept']}",
                        "detail": rem_data["explanation_everyday"],
                        "citation": f"Slide Trang {p_num} / {w['citation_code']}"
                    },
                    # 2. Quiz ôn tập kiến thức sai - Tình huống MỚI TOANH 100%, TUYỆT ĐỐI KHÔNG TRÙNG LẶP
                    "adaptive_question": {
                        "id": f"RETRY_{w['question_id']}",
                        "question": rem_data["new_question"],
                        "options": rem_data["options"],
                        "correct_index": rem_data["correct_index"],
                        "concept_tested": w["core_concept"],
                        "slide_page": p_num,
                        "citation_code": w["citation_code"],
                        "is_brand_new_scenario": True
                    }
                }
                remediation_items.append(item)

            session_id = str(uuid.uuid4())

            return {
                "session_id": session_id,
                "status": "HAS_WRONG_ANSWERS",
                "score_percent": score_percent,
                "correct_count": correct_count,
                "total_questions": total_questions,
                "message": f"Bạn đạt {correct_count}/{total_questions} câu ({score_percent}%). Đừng lo lắng! AI đã kích hoạt chế độ 'Gỡ Rối Ngay Tại Chỗ' giúp bạn lấp đầy lỗ hổng kiến thức.",
                "mastery_achieved": False,
                "wrong_count": len(wrong_questions),
                "wrong_questions": wrong_questions,
                "remediation_package": {
                    "session_id": session_id,
                    "remediation_items": remediation_items,
                    "instruction": "Hãy đọc kỹ phần giải thích đời thường thuần Việt bên dưới, sau đó làm các câu hỏi tình huống mới 100% để đánh giá lại năng lực."
                }
            }

    def evaluate_remediation_answers(self, original_remediation_items: List[Dict[str, Any]], student_retry_answers: Dict[str, int]) -> Dict[str, Any]:
        """
        Chấm điểm vòng lặp Quiz ôn tập kiến thức sai:
        - Nếu học viên làm đúng hết các câu tình huống mới -> Đạt chuẩn Mastery!
        - Nếu vẫn còn câu sai -> Tiếp tục hướng dẫn và cho ôn luyện tiếp.
        """
        total = len(original_remediation_items)
        correct = 0
        still_wrong = []

        for idx, item in enumerate(original_remediation_items):
            q = item["adaptive_question"]
            qid = q["id"]
            user_ans = student_retry_answers.get(qid)
            if user_ans is None:
                user_ans = student_retry_answers.get(f"RETRY_{idx}")
            if user_ans is None:
                user_ans = student_retry_answers.get(str(idx))
            if user_ans is not None:
                try:
                    user_ans = int(user_ans)
                except (ValueError, TypeError):
                    user_ans = None

            if user_ans is not None and user_ans == q["correct_index"]:
                correct += 1
            else:
                still_wrong.append({
                    "concept": item["concept_name"],
                    "provenance": item["provenance"],
                    "explanation": item["everyday_explanation"]["detail"]
                })

        if correct == total:
            return {
                "status": "ALL_CORRECT_MASTERY",
                "score_percent": 100,
                "correct_count": correct,
                "total": total,
                "message": "Tuyệt vời! Sau vòng lặp ôn tập, bạn đã xuất sắc trả lời đúng toàn bộ các câu hỏi cốt lõi!",
                "mastery_achieved": True,
                "next_options": [
                    {
                        "id": "OPT_ADVANCED_LEVEL",
                        "title": "Lựa chọn 1: Nâng cao level bài hiện tại",
                        "description": "Thử sức với các tình huống phản biện và bài toán mở rộng."
                    },
                    {
                        "id": "OPT_NEXT_LESSON",
                        "title": "Lựa chọn 2: Chuyển sang bài học tiếp theo",
                        "description": "Chuyển tiếp sang bài học mới trong khoá học."
                    }
                ]
            }
        else:
            # Hồi tiếp về nhánh "CÓ CÂU LÀM SAI (Phát hiện hổng kiến thức)"
            still_wrong_items = []
            for idx, item in enumerate(original_remediation_items):
                q = item["adaptive_question"]
                qid = q["id"]
                user_ans = student_retry_answers.get(qid)
                if user_ans is None:
                    user_ans = student_retry_answers.get(f"RETRY_{idx}")
                if user_ans is None:
                    user_ans = student_retry_answers.get(str(idx))
                if user_ans is not None:
                    try:
                        user_ans = int(user_ans)
                    except (ValueError, TypeError):
                        user_ans = None

                if user_ans is None or user_ans != q["correct_index"]:
                    # Tạo tình huống mới sâu hơn cho lần lặp tiếp theo
                    p_num = item["slide_page"]
                    still_wrong_items.append({
                        "source_question_id": qid,
                        "concept_name": item["concept_name"],
                        "provenance": item["provenance"],
                        "slide_page": p_num,
                        "citation_code": item["citation_code"],
                        "everyday_explanation": {
                            "summary": f"Điểm mấu chốt bạn cần nhớ ở {item['concept_name']}",
                            "detail": item["everyday_explanation"]["detail"],
                            "citation": item["everyday_explanation"]["citation"]
                        },
                        "adaptive_question": {
                            "id": f"RETRY2_{qid}",
                            "question": f"Tình huống thực tế nâng cao cho {item['concept_name']}: Trong một dự án thực tế, khi gặp trường hợp người dùng băn khoăn về quy trình, hành động nào là đúng chuẩn nhất?",
                            "options": [
                                f"Bám sát đúng nguyên lý cốt lõi tại {item['citation_code']}",
                                "Bỏ qua ý kiến người dùng để làm theo ý mình",
                                "Tự động hóa hoàn toàn mà không giải thích cho người dùng",
                                "Không cung cấp bất kỳ tài liệu hay trích dẫn nào"
                            ],
                            "correct_index": 0,
                            "concept_tested": item["concept_name"],
                            "slide_page": p_num,
                            "citation_code": item["citation_code"],
                            "is_brand_new_scenario": True
                        }
                    })

            return {
                "status": "HAS_WRONG_ANSWERS",
                "score_percent": round((correct / total) * 100, 1),
                "correct_count": correct,
                "total": total,
                "message": f"Bạn đã vượt qua {correct}/{total} câu ôn tập. Vòng lặp thích ứng tiếp tục phân loại và đưa ra hướng dẫn chuyên sâu cho {len(still_wrong_items)} concept còn lại.",
                "mastery_achieved": False,
                "wrong_count": len(still_wrong_items),
                "remediation_package": {
                    "remediation_items": still_wrong_items,
                    "instruction": "Hãy xem lại phần giải thích đời thường bên dưới và hoàn thành nốt câu hỏi tình huống mới để đạt chuẩn Mastery!"
                }
            }

