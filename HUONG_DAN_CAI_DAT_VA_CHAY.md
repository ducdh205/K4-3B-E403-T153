# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG QUIZAI (REACT + QUIZ.COM STYLE + MYSQL)

> **Dự án**: Hệ thống AI Sinh Quiz Có Căn Cứ từ Slide PDF (**Microsoft MarkItDown**), Cổng Kiểm Duyệt Giảng Viên (**Human-in-the-loop**), Giao Diện Gamified Chuẩn **[Quiz.com](https://quiz.com/)** dựng bằng **React**, và Vòng Lặp Học Tập Thích Ứng (**Adaptive Remediation Loop**), lưu trữ dữ liệu bằng **MySQL Database**.  
> **Khoá học**: AI Thực Chiến K4 • Nhóm 3B • Zone E403.

---

## 1. Yêu Cầu Môi Trường

- **Hệ điều hành**: Linux (Ubuntu/Debian) / macOS / Windows (WSL2 hoặc PowerShell).
- **Python**: Phiên bản 3.10 trở lên (khuyến nghị Python 3.11 hoặc 3.12).
- **Node.js**: Phiên bản 18 trở lên (khuyến nghị Node.js 20 hoặc 24) kèm npm.
- **Cơ sở dữ liệu**: MySQL hoặc MariaDB (cổng 3306).
  *(Hệ thống tích hợp cơ chế tự động tạo database `quizai` và các bảng dữ liệu, đồng thời có cơ chế dự phòng SQLite nếu MySQL chưa được bật).*

---

## 2. Hướng Dẫn Cài Đặt (Step-by-Step)

### Bước 2.1. Clone Repository & Di Chuyển Vào Thư Mục
```bash
git clone https://github.com/ducdh205/K4-3B-E403-T153.git
cd K4-3B-E403-T153
```

### Bước 2.2. Thiết Lập Môi Trường Ảo Python (Backend)
```bash
python3 -m venv .venv

# Kích hoạt môi trường ảo:
# Trên Linux/macOS:
source .venv/bin/activate

# Trên Windows PowerShell:
# .venv\Scripts\Activate.ps1
```

Cài đặt các gói thư viện Python (bao gồm Microsoft MarkItDown, SQLAlchemy, PyMySQL, FastAPI, Uvicorn):
```bash
pip install markitdown pdfminer.six pdfplumber pymysql sqlalchemy fastapi uvicorn pydantic python-multipart reportlab pypdf httpx
```

### Bước 2.3. Cài Đặt và Build React Frontend (Quiz.com Style)
```bash
cd frontend
npm install
npm run build
cd ..
```
*(Lệnh `npm run build` sẽ đóng gói toàn bộ ứng dụng React + Tailwind CSS v4 vào thư mục `frontend/dist/` để Backend FastAPI phục vụ trực tiếp).*

### Bước 2.4. Khởi Tạo File Slide PDF Mẫu (15 Trang)
Chạy script sinh file PDF bài giảng mẫu `data/sample_slides/slide-tu-duy-san-pham.pdf` (gồm 10 slide cơ bản đã dạy và 5 slide nâng cao chưa dạy):
```bash
python scripts/generate_sample_pdf.py
```

### Bước 2.5. Cấu Hình Cơ Sở Dữ Liệu MySQL (Tùy Chọn)
Mặc định hệ thống kết nối tới MySQL tại `localhost:3306` với user `root` và database `quizai`.  
Nếu bạn có mật khẩu MySQL riêng, có thể tạo file `.env` ở thư mục gốc:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=mat_khau_cua_ban
MYSQL_DATABASE=quizai
```
*(Nếu dịch vụ MySQL chưa bật, hệ thống sẽ tự động chuyển sang cơ chế SQLite an toàn để đảm bảo mọi chức năng vẫn vận hành mượt mà).*

---

## 3. Hướng Dẫn Khởi Chạy Ứng Dụng

Chạy lệnh sau từ thư mục gốc của repo:

```bash
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*(Nếu dùng môi trường ảo mà không activate, có thể chạy trực tiếp: `PYTHONPATH=. ./.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`)*

Sau đó mở trình duyệt và truy cập:
👉 **`http://localhost:8000`**

---

## 4. Trải Nghiệm Giao Diện Phong Cách Quiz.com

### 🎓 Tab 1: Studio Giảng Viên (Giai đoạn 1 theo Sơ đồ)
1. **1A. Slide PDF $\rightarrow$ 1B. File Markdown**:
   - Nhấn **"Nạp Slide Mẫu 15 Trang"** (hoặc upload file PDF từ máy).
   - Hệ thống dùng **Microsoft MarkItDown** bóc tách văn bản, giữ nguyên số trang và trích xuất mã nguồn `[DEMO-NNN]`. Dữ liệu được lưu trực tiếp vào bảng `documents` trong MySQL.
2. **2. Ghi chú bài dạy của Giảng viên (Ràng buộc nội dung - Tiên quyết)**:
   - Nhập ghi chú: *"Mới dạy xong Slide 1 - 10"*.
   - Nhấn **"Áp Dụng Ràng Buộc"**.
   - AI.Graph Engine đối chiếu và xác lập ranh giới cứng: Cho phép 10 Concept và **chặn tuyệt đối 5 Concept vượt trang (Slide 11-15)**.
3. **3. AI.Graph Engine**:
   - Nhấn **"AI Sinh Quiz Có Căn Cứ"**.
   - Chuyển đổi kiến thức sang **tình huống đời thường thuần Việt**, gắn trích dẫn `Slide Trang X • [DEMO-NNN]`.
4. **4. Giảng viên kiểm duyệt (Human-in-the-loop)**:
   - Soát lại các câu hỏi, tick chọn xác nhận 100% trích dẫn nguồn.
   - Bấm **"Duyệt & Phát Hành Quiz Cho Học Viên"**. Dữ liệu được lưu vào bảng `quizzes` và `quiz_questions` trong MySQL.

---

### 🎮 Tab 2: Phòng Chơi Học Viên (Giai đoạn 2 theo Sơ đồ)
1. **Sảnh Chờ (Lobby)**:
   - Chọn Avatar đại diện (🤖 Robo, 🐱 Mèo, 🦉 Cú, 🦊 Cáo, 🦁 Sư tử, 🚀 Phi hành gia).
   - Nhập nickname và bấm **"BẮT ĐẦU LÀM BÀI NGAY!"**.
2. **Giao Diện Chơi Quiz (Quiz.com Style)**:
   - Thanh đếm thời gian (Countdown progress bar), streak lửa 🔥, điểm số nhảy số real-time.
   - Câu hỏi tình huống rõ ràng kèm tag trích dẫn nguồn.
   - **4 Thẻ Màu Siêu Lớn Đặc Trưng**:
     - **A**: Đỏ Crimson (`#e21b3c`) với biểu tượng Tam Giác ▲ (Phím 1 hoặc A)
     - **B**: Xanh Lam (`#1368ce`) với biểu tượng Hình Thoi ◆ (Phím 2 hoặc B)
     - **C**: Vàng Hổ Phách (`#d89e00`) với biểu tượng Hình Tròn ● (Phím 3 hoặc C)
     - **D**: Xanh Lục (`#26890c`) với biểu tượng Hình Vuông ■ (Phím 4 hoặc D)
   - Tích hợp **Web Audio API** phát âm thanh arcade sinh động khi chọn đáp án.
3. **Phân Loại Kết Quả & Vòng Lặp Thích Ứng**:
   - **Nhánh Đúng 100% Cốt Lõi (Mastery Achieved)**:
     - Pháo hoa Confetti nổ rực rỡ, cúp vàng vô địch.
     - 2 Lựa chọn đi tiếp:
       - *Lựa chọn 1: Nâng cao level bài hiện tại*
       - *Lựa chọn 2: Chuyển sang bài học tiếp theo*
   - **Nhánh Có Câu Làm Sai (Gỡ Rối Ngay Tại Chỗ)**:
     - *Phần 1: Giải thích kiến thức sai*: Diễn đạt bằng ngôn ngữ đời thường thuần Việt, ví dụ gần gũi, kèm trích dẫn `Slide Trang X / DEMO-NNN`.
     - *Phần 2: Quiz ôn tập tình huống MỚI TOANH 100%*: Bộ câu hỏi tình huống mới hoàn toàn, **tuyệt đối không trùng lặp câu ban đầu Q01..Q10** để chống học vẹt.
     - Học viên trả lời các câu ôn tập và bấm **"Nộp bài ôn tập & Đánh giá lại năng lực"** $\rightarrow$ Thăng hạng lên Mastery khi vượt qua.

---

## 5. Hướng Dẫn Kiểm Thử Tự Động

```bash
# 1. Kiểm thử tích hợp 9 bước toàn bộ luồng hệ thống với MySQL:
PYTHONPATH=. python tests/test_full_pipeline.py

# 2. Đánh giá 20 test case Golden Set theo rubric 4 lớp chỗ khó:
PYTHONPATH=. python eval/run_eval.py
```

---

## 6. Cấu Trúc Thư Mục Sau Khi Nâng Cấp

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
│   │   └── mysql_db.py            # Quản lý Database MySQL với SQLAlchemy & PyMySQL
│   ├── api/
│   │   └── routes.py              # REST API kết nối MySQL cho Giảng viên & Học viên
│   └── main.py                    # FastAPI Server phục vụ API & React Frontend Bundle
├── frontend/                      # Ứng Dụng React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Header tím đậm Quiz.com + toggle âm thanh
│   │   │   ├── TeacherStudio.jsx  # Studio Giảng viên (PDF, MarkItDown, Ràng buộc, Duyệt)
│   │   │   ├── QuizLobby.jsx      # Sảnh game Quiz.com + chọn Avatar
│   │   │   ├── QuizPlayer.jsx     # Giao diện chơi game 4 thẻ màu lớn ▲◆●■
│   │   │   ├── AdaptiveRemediation.jsx # Vòng lặp gỡ rối & quiz tình huống mới 100%
│   │   │   └── SoundEffects.js    # Web Audio API Arcade Synthesizer
│   │   ├── App.jsx                # Component React chính
│   │   ├── index.css              # Theme màu Quiz.com & hiệu ứng 3D arcade
│   │   └── main.jsx               # Entry point
│   ├── dist/                      # Production build được phục vụ trực tiếp bởi FastAPI
│   ├── package.json               # Cấu hình dependencies (React 19, Lucide, Tailwind v4)
│   └── vite.config.js             # Cấu hình Vite & Tailwind plugin
├── scripts/
│   └── generate_sample_pdf.py     # Script tạo slide PDF mẫu 15 trang
├── eval/
│   ├── golden_set.json            # 20 Test case kiểm thử chuẩn Rubric
│   ├── run_eval.py                # Script chạy đánh giá hệ thống (100% Pass)
│   └── eval_results.json          # File kết quả đánh giá
├── tests/
│   └── test_full_pipeline.py      # Bộ kiểm thử tích hợp 9 bước (100% Pass)
├── .gitignore                     # Cấu hình bỏ qua .venv, node_modules, cache
├── spec.md                        # Đặc tả AI Spec 8 phần theo chuẩn chương trình
└── HUONG_DAN_CAI_DAT_VA_CHAY.md   # Tài liệu hướng dẫn này
```

