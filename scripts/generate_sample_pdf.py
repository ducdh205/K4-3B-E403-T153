import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Đăng ký DejaVuSans để tiếng Việt hiển thị 100% chuẩn
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
font_bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if os.path.exists(font_path):
    pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
    pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', font_bold_path))
    MAIN_FONT = 'DejaVuSans'
    BOLD_FONT = 'DejaVuSans-Bold'
else:
    MAIN_FONT = 'Helvetica'
    BOLD_FONT = 'Helvetica-Bold'

def create_sample_slides():
    os.makedirs("data/sample_slides", exist_ok=True)
    pdf_path = "data/sample_slides/slide-tu-duy-san-pham.pdf"
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontName=BOLD_FONT,
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=15
    )
    sub_title_style = ParagraphStyle(
        'SlideSubTitle',
        parent=styles['Heading2'],
        fontName=BOLD_FONT,
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#4338ca'),
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'SlideBody',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=8
    )
    code_style = ParagraphStyle(
        'SlideCode',
        parent=styles['Normal'],
        fontName=BOLD_FONT,
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#b91c1c')
    )

    slides_content = [
        # Slide 1
        ("Slide 1: Tổng Quan Tư Duy Sản Phẩm AI",
         "Khái niệm cốt lõi & Tư duy lấy người dùng làm trung tâm",
         ["• Sản phẩm AI thành công bắt đầu từ bài toán thật của người dùng, không bắt đầu từ mô hình LLM.",
          "• Trọng tâm: Tìm kiếm 'Pain point' nhức nhối nhất của người dùng mục tiêu.",
          "• Mã nguồn trích dẫn học phần: [DEMO-001] Cơ bản về AI Product Management."]),
        # Slide 2
        ("Slide 2: Khung Công Việc JTBD (Jobs-To-Be-Done)",
         "Xác định công việc cốt lõi của người dùng",
         ["• JTBD cốt lõi phải được diễn đạt không chứa tên công nghệ hay từ 'AI'.",
          "• Công thức: Động từ + Đối tượng hành động + Ngữ cảnh bối cảnh.",
          "• Ví dụ thực tế: 'Học viên muốn nắm vững kiến thức bị hổng ngay sau khi làm quiz sai.'",
          "• Mã nguồn trích dẫn: [DEMO-002] Khung JTBD chuẩn."]),
        # Slide 3
        ("Slide 3: Bằng Chứng & Khảo Sát (Evidence Standards)",
         "Chuẩn A và Chuẩn B trong thu thập bằng chứng",
         ["• Chuẩn A: Khảo sát tối thiểu 20 người dùng bên ngoài, ít nhất 50% xác nhận gặp vấn đề.",
          "• Chuẩn B: Mining dữ liệu thật đếm được (tần suất, tỷ lệ lỗi) + tối thiểu 5 quote nguyên văn.",
          "• Tuyệt đối tránh: 'Mọi người đều cảm thấy bất tiện' (không có số liệu đo lường).",
          "• Mã nguồn trích dẫn: [DEMO-003] Mining & Verification."]),
        # Slide 4
        ("Slide 4: Lát Cắt Một Câu (One-Sentence Slice)",
         "Định nghĩa phạm vi một tính năng tối thiểu",
         ["• Công thức 4 thành tố: 1 Người dùng - 1 Công việc - 1 Quyết định AI - 1 Kết quả đo được.",
          "• Ví dụ: 'Một học viên làm bài trắc nghiệm, AI phát hiện lỗ hổng và giải thích bằng ví dụ đời thường, giúp học viên hiểu bài.'",
          "• Giúp sản phẩm tập trung cao độ, tránh lan man tính năng dư thừa.",
          "• Mã nguồn trích dẫn: [DEMO-004] Lát cắt sản phẩm AI."]),
        # Slide 5
        ("Slide 5: Chi Phí Sai Sót (Cost of Error & Automation)",
         "Lựa chọn mức độ tự động hóa: Augment vs Automate",
         ["• Khi Cost of Error cao (nguy cơ sai kiến thức trầm trọng): Bắt buộc dùng Human-in-the-loop (Augment).",
          "• Giảng viên phải là chốt chặn cuối cùng kiểm duyệt câu hỏi trước khi học viên tiếp cận.",
          "• Khi Cost of Error thấp: Có thể tự động hóa có điều kiện (Conditional Automation).",
          "• Mã nguồn trích dẫn: [DEMO-005] Ma trận rủi ro và tự động hóa."]),
        # Slide 6
        ("Slide 6: Bốn Lớp Chỗ Khó (4 Error Taxonomies)",
         "Nhận diện các rủi ro cốt lõi của hệ thống AI",
         ["• Lớp 1 (Nguồn sự thật): AI tự bịa thông tin không có trong tài liệu giảng dạy.",
          "• Lớp 2 (Mơ hồ/Thiếu thông tin): Đề bài hoặc câu hỏi của học viên không đủ ngữ cảnh.",
          "• Lớp 3 (Ngoài phạm vi): Đòi hỏi AI xử lý kiến thức chưa dạy hoặc vượt thẩm quyền.",
          "• Lớp 4 (Đặc thù domain): Hiểu sai thuật ngữ chuyên môn gây hậu quả học tập.",
          "• Mã nguồn trích dẫn: [DEMO-006] Phân loại 4 lớp chỗ khó."]),
        # Slide 7
        ("Slide 7: Ràng Buộc Phạm Vi (Knowledge Boundary Constraints)",
         "Nguyên tắc chặn câu hỏi vượt trang bài dạy",
         ["• Giảng viên chỉ định phạm vi kiến thức đã dạy (Ví dụ: Chỉ dạy Slide 1 đến Slide 10).",
          "• AI Engine BẮT BUỘC đối chiếu với ghi chú của giảng viên và loại bỏ câu hỏi thuộc Slide > 10.",
          "• Ngăn chặn học viên bị quá tải với kiến thức chưa được học trên lớp.",
          "• Mã nguồn trích dẫn: [DEMO-007] Boundary Enforcement."]),
        # Slide 8
        ("Slide 8: Trích Dẫn Nguồn Chuẩn Xác (Provenance & Citation)",
         "Đảm bảo 100% nội dung có thể truy vết về tài liệu gốc",
         ["• Mỗi câu hỏi và đáp án bắt buộc đi kèm tag: Slide Trang X và Mã trích dẫn DEMO-NNN.",
          "• Giúp giảng viên kiểm tra nhanh độ chính xác chỉ trong vài giây.",
          "• Xây dựng niềm tin vững chắc giữa người học, người dạy và hệ thống AI.",
          "• Mã nguồn trích dẫn: [DEMO-008] Traceability & Citation."]),
        # Slide 9
        ("Slide 9: Chốt Chặn Giảng Viên Kiểm Duyệt (Human-in-the-loop)",
         "Quy trình kiểm soát chất lượng trước khi phát hành",
         ["• AI chỉ đề xuất bản thảo (Draft Assessment).",
          "• Giảng viên có toàn quyền: Sửa đổi câu từ, hoán đổi đáp án, loại bỏ câu không đạt, duyệt xuất bản.",
          "• Hệ thống không bao giờ tự ý phát hành quiz trực tiếp cho học viên mà chưa có chữ ký duyệt.",
          "• Mã nguồn trích dẫn: [DEMO-009] Educator Gatekeeping."]),
        # Slide 10
        ("Slide 10: Vòng Lặp Học Tập Thích Ứng (Adaptive Remediation)",
         "Phương pháp khắc phục triệt để lỗ hổng sau khi làm quiz",
         ["• Khi học viên trả lời sai: Gỡ rối tức thì bằng ngôn ngữ đời thường thuần Việt.",
          "• Đưa ra tình huống MỚI TOANH 100% để kiểm tra lại, TUYỆT ĐỐI không lặp lại câu hỏi cũ.",
          "• Giúp học viên thực sự chuyển hóa kiến thức thay vì học vẹt đáp án.",
          "• Mã nguồn trích dẫn: [DEMO-010] Adaptive Learning Loop."]),
        # Slide 11 - NÂNG CAO (CHƯA DẠY TRONG BUỔI 1)
        ("Slide 11: [NÂNG CAO] Fine-Tuning & Huấn Luyện LLM Chuyên Sâu",
         "Kiến thức nâng cao - Không được xuất hiện trong Quiz buổi 1",
         ["• Kỹ thuật LoRA (Low-Rank Adaptation) và QLoRA tối ưu tài nguyên tính toán.",
          "• Chuẩn bị tập dữ liệu Instruction Tuning chất lượng cao cho domain giáo dục.",
          "• Mã nguồn trích dẫn: [DEMO-011] Deep LLM Training."]),
        # Slide 12 - NÂNG CAO (CHƯA DẠY)
        ("Slide 12: [NÂNG CAO] Can Thiệp Hành Vi Bằng RLHF & DPO",
         "Kiến thức nâng cao - Vượt quá phạm vi Slide 1-10",
         ["• Direct Preference Optimization (DPO) thay thế Reward Model truyền thống.",
          "• Căn chỉnh alignment giảm thiểu độc hại và ảo giác (hallucination).",
          "• Mã nguồn trích dẫn: [DEMO-012] Alignment Techniques."]),
        # Slide 13 - NÂNG CAO (CHƯA DẠY)
        ("Slide 13: [NÂNG CAO] Vector Database & Chỉ Mục Đa Chiều HNSW",
         "Kiến thức nâng cao - Chưa dạy",
         ["• Phân đoạn văn bản đệ quy kết hợp Hierarchical Navigable Small World graphs.",
          "• Tối ưu độ trễ truy vấn vector dưới 50ms ở quy mô hàng triệu embeddings.",
          "• Mã nguồn trích dẫn: [DEMO-013] High-scale Vector Search."]),
        # Slide 14 - NÂNG CAO (CHƯA DẠY)
        ("Slide 14: [NÂNG CAO] Đa Tác Tử (Multi-Agent Orchestration)",
         "Kiến thức nâng cao - Chưa dạy",
         ["• Điều phối đồ thị tác tử bằng LangGraph / StateGraph đa luồng.",
          "• Giao tiếp bất đồng bộ giữa Planner, Critic, Executor và Reviewer.",
          "• Mã nguồn trích dẫn: [DEMO-014] Multi-Agent Systems."]),
        # Slide 15 - NÂNG CAO (CHƯA DẠY)
        ("Slide 15: [NÂNG CAO] Vòng Lặp Đánh Giá Tự Động LLM-as-a-Judge",
         "Kiến thức nâng cao - Chưa dạy",
         ["• Xây dựng bộ rubric đánh giá tự động đa tiêu chí.",
          "• Kiểm thử mù đôi (blind test) và đối chiếu độ tương quan với con người (Cohen's Kappa).",
          "• Mã nguồn trích dẫn: [DEMO-015] Automated Evaluation Metrics."]),
    ]

    story = []
    for idx, (title, sub, bullets) in enumerate(slides_content):
        # Card container header
        page_num = idx + 1
        scope_badge = " [ĐÃ DẠY - PHẠM VI BUỔI 1]" if page_num <= 10 else " [NÂNG CAO - CHƯA DẠY]"
        story.append(Paragraph(f"<b>{title}</b> <font size=10 color='#6366f1'>{scope_badge}</font>", title_style))
        story.append(Paragraph(sub, sub_title_style))
        story.append(Spacer(1, 10))
        
        for b in bullets:
            story.append(Paragraph(b, body_style))
            story.append(Spacer(1, 4))
            
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"Tài liệu đào tạo K4 AI Thực Chiến • Slide Trang {page_num}/15", code_style))
        
        if idx < len(slides_content) - 1:
            from reportlab.platypus import PageBreak
            story.append(PageBreak())
            
    doc.build(story)
    print(f"Sample slide PDF successfully generated: {pdf_path} (15 pages)")

if __name__ == "__main__":
    create_sample_slides()

