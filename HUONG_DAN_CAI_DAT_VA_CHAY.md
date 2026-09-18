# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG QUIZAI

> **Dự án**: Hệ thống AI Sinh Quiz Có Căn Cứ từ Slide PDF (Microsoft MarkItDown), Cổng Kiểm Duyệt Giảng Viên (Human-in-the-loop), Giao Diện Gamified Chuẩn [Quiz.com](https://quiz.com/) và Vòng Lặp Học Tập Thích Ứng (Adaptive Remediation Loop).  
> **Khoá học**: AI Thực Chiến K4 • Nhóm 3B • Zone E403.

---

## 1. Yêu Cầu Môi Trường

- **Hệ điều hành**: Linux / macOS / Windows (WSL2 hoặc PowerShell).
- **Python**: Phiên bản 3.10 trở lên (khuyến nghị Python 3.11 hoặc 3.12).
- **Trình duyệt web**: Chrome, Edge, Firefox hoặc Safari bất kỳ.

---

## 2. Các Bước Cài Đặt (Step-by-Step)

### Bước 2.1. Clone Repository & Di Chuyển Vào Thư Mục
```bash
git clone https://github.com/ducdh205/K4-3B-E403-T153.git
cd K4-3B-E403-T153
```

### Bước 2.2. Tạo Môi Trường Ảo Python (Virtual Environment)
```bash
python3 -m venv .venv

# Kích hoạt môi trường ảo:
# Trên Linux/macOS:
source .venv/bin/activate

# Trên Windows PowerShell:
# .venv\Scripts\Activate.ps1
```

### Bước 2.3. Cài Đặt Các Gói Thư Viện Cần Thiết
Hệ thống sử dụng **Microsoft MarkItDown** (`markitdown`) kèm bộ giải nén PDF, FastAPI và Uvicorn:

```bash
pip install markitdown pdfminer.six pdfplumber fastapi uvicorn pydantic python-multipart reportlab pypdf httpx
```

*(Lưu ý: Thư mục `.venv` đã được đưa vào `.gitignore` để không bị đẩy lên git repository).*

### Bước 2.4. Khởi Tạo File Slide PDF Mẫu (15 Trang)
Chạy script sinh file PDF bài giảng mẫu `data/sample_slides/slide-tu-duy-san-pham.pdf` (gồm 10 slide cơ bản đã dạy và 5 slide nâng cao chưa dạy):

```bash
python scripts/generate_sample_pdf.py
```

---

## 3. Hướng Dẫn Khởi Chạy Ứng Dụng

Chạy lệnh sau để khởi động Web Server:

```bash
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*(Nếu dùng môi trường ảo mà không activate, bạn có thể gọi trực tiếp: `PYTHONPATH=. ./.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`)*

Sau khi server khởi động xong, mở trình duyệt và truy cập:
👉 **`http://localhost:8000`**

---

## 4. Hướng Dẫn Trải Nghiệm Các Tính Năng

### 🎓 Tab 1: Studio Giảng Viên (Creator & Reviewer Mode)
1. **Bước 1: Nạp tài liệu Slide PDF**:
   - Nhấn **"⚡ Nạp Bản Mẫu"** (hoặc bấm chọn tải lên file PDF của bạn).
   - Hệ thống gọi thư viện **Microsoft MarkItDown** để parse PDF sang Markdown, giữ nguyên số trang và mã trích dẫn `[DEMO-NNN]`.
2. **Bước 2: Ghi chú ràng buộc bài dạy**:
   - Nhập hoặc chọn ghi chú: *"Mới dạy xong Slide 1 - 10"*.
   - Nhấn **"🔒 Áp Dụng Ràng Buộc"**.
   - Hệ thống hiển thị ranh giới cứng: Cho phép 10 Concept (Slide 1-10) và **chặn toàn bộ 5 Concept vượt trang (Slide 11-15)**.
3. **Bước 3: AI Sinh Bản Thảo Quiz**:
   - Nhấn **"✨ AI Sinh Quiz Có Căn Cứ"**.
   - AI.Graph Engine sinh 10 câu hỏi tình huống đời thường gần gũi thuần Việt, kèm huy hiệu trích dẫn nguồn: `Slide Trang X • [DEMO-NNN]`.
4. **Bước 4: Giảng viên kiểm duyệt (Human-in-the-loop)**:
   - Xem soát các câu hỏi, tick chọn xác nhận *"Tôi xác nhận 100% câu hỏi bám sát bài dạy và đầy đủ trích dẫn nguồn"*.
   - Nhấn **"🚀 Duyệt & Phát Hành Quiz Cho Học Viên"**.

---

### 🎮 Tab 2: Phòng Chơi Học Viên (Quiz.com Gamified Experience)
1. **Sảnh chờ (Lobby)**:
   - Nhập tên người chơi / biệt danh và bấm **"BẮT ĐẦU LÀM BÀI NGAY! 🚀"**.
2. **Giao diện làm bài phong cách Quiz.com**:
   - Trực quan, rực rỡ với 4 ô phương án A/B/C/D mang 4 khối màu năng động (Đỏ, Lam, Vàng, Lục).
   - Âm thanh sống động qua **Web Audio API** (âm bấm nút, âm đúng/sai, chuỗi streak 🔥).
   - Thanh tiến trình câu hỏi và trích dẫn bài học theo thời gian thực.
3. **Phân loại kết quả & Vòng lặp thích ứng**:
   - **Nhánh A (Đúng 100% cốt lõi)**:
     - Hiệu ứng pháo hoa Confetti nổ rực rỡ.
     - Cung cấp 2 lựa chọn đi tiếp: *Lựa chọn 1: Nâng cao level bài hiện tại* | *Lựa chọn 2: Chuyển sang bài học tiếp theo*.
   - **Nhánh B (Có câu làm sai)**:
     - Kích hoạt chế độ **"Gỡ Rối Ngay Tại Chỗ"**.
     - *Phần 1 - Giải thích kiến thức sai*: Đọc phần giải thích bằng ngôn ngữ đời thường thuần Việt, chỉ tập trung trúng đích vào lỗi vừa sai kèm trích dẫn `Slide Trang X / DEMO-NNN`.
     - *Phần 2 - Quiz ôn tập tình huống MỚI TOANH 100%*: Làm các câu hỏi tình huống mới hoàn toàn (chống trùng lặp tuyệt đối, không học vẹt).
     - Bấm **"Nộp bài ôn tập & Đánh giá lại năng lực"** $\rightarrow$ Thăng hạng lên Mastery khi vượt qua!

---

## 5. Hướng Dẫn Chạy Kiểm Thử Tự Động

Dự án đi kèm bộ kiểm thử tự động toàn diện:

### A. Kiểm Thử Tích Hợp Toàn Trình (Full Pipeline Test)
Kiểm tra tự động cả 9 bước từ MarkItDown đến vòng lặp đóng:
```bash
PYTHONPATH=. python tests/test_full_pipeline.py
```
*(Kết quả mong đợi: `🎉 ALL 9 PIPELINE TESTS PASSED 100%! 🎉`)*

### B. Đánh Giá Golden Set (20 Test Cases Theo Rubric R4)
Đánh giá độ tuân thủ 4 lớp chỗ khó (① Nguồn sự thật, ② Mơ hồ, ③ Ngoài phạm vi, ④ Đặc thù domain):
```bash
PYTHONPATH=. python eval/run_eval.py
```
*(Kết quả mong đợi: `KẾT QUẢ TỔNG HỢP: 20/20 ĐẠT (100.0%)` — Vượt cam kết Quality Bar $\ge 90%$)*

---

## 6. Cấu Trúc Thư Mục Dự Án

```
K4-3B-E403-T153/
├── backend/
│   ├── converters/
│   │   └── pdf_parser.py          # Wrapper Microsoft MarkItDown trích xuất slide
│   ├── engine/
│   │   ├── graph_engine.py        # Phân tích concept, đối chiếu ghi chú & chặn slide > 10
│   │   ├── quiz_generator.py      # Sinh quiz tình huống đời thường có trích dẫn nguồn
│   │   └── adaptive_engine.py     # Phân loại kết quả & vòng lặp gỡ rối 100% tình huống mới
│   ├── storage/
│   │   └── db.py                  # Quản lý trạng thái và các phiên học tập
│   ├── api/
│   │   └── routes.py              # REST API Giảng viên & Học viên
│   └── main.py                    # Khởi tạo FastAPI Server & phục vụ Frontend tĩnh
├── frontend/
│   └── index.html                 # Giao diện Gamified chuẩn Quiz.com (Web Audio, Confetti)
├── scripts/
│   └── generate_sample_pdf.py     # Script tạo slide PDF 15 trang chuẩn bị sẵn
├── eval/
│   ├── golden_set.json            # 20 Test case kiểm thử chuẩn Rubric
│   ├── run_eval.py                # Script chạy đánh giá hệ thống
│   └── eval_results.json          # File kết quả đánh giá (100% Đạt)
├── tests/
│   └── test_full_pipeline.py      # Bộ kiểm thử tích hợp 9 bước
├── .gitignore                     # Cấu hình bỏ qua .venv, cache và dữ liệu tạm
├── spec.md                        # Đặc tả AI Spec 8 phần theo chuẩn chương trình
└── HUONG_DAN_CAI_DAT_VA_CHAY.md   # Tài liệu hướng dẫn này
```
