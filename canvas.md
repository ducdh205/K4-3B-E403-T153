# Canvas CP1 — C1 Knowledge-to-Lesson (Graph-first)

**Đội trưởng:** Hoàng Đức Minh · **Mã học viên:** 2A202602362  
**Repo GitHub công khai:** `https://github.com/ducdh205/K4-3B-E403-T153`

| # | Dòng | Nội dung |
|---|---|---|
| 1 | Track + đề | **C · Lesson Studio — C1 Knowledge-to-Lesson, hướng Graph-first:** trích xuất graph tri thức có nguồn từ tài liệu bài giảng và tạo quiz có thể duyệt. |
| 2 | Job executor (ai · đang ở đâu · làm gì) | **Giảng viên/người viết nội dung** đang chuẩn bị quiz cho một chương bài giảng, cần kiểm tra nhanh từng câu hỏi và biết chính xác câu trả lời được lấy từ slide hoặc transcript nào. |
| 3 | Pain một câu (ai – đang làm gì – vướng đâu – hậu quả) | Khi tự tạo quiz từ slide và transcript, giảng viên phải đọc lại tài liệu để kiểm tra concept, quan hệ giữa các concept và nguồn của từng câu; việc này tốn thời gian, dễ bỏ sót prerequisite hoặc đưa vào câu hỏi không có căn cứ, dẫn đến học viên học sai. |
| 4 | 1–2 bằng chứng đầu (số + cách đếm + mã hội thoại/tin nhắn, hoặc khảo sát/phỏng vấn có số người) | **Bằng chứng cần xác minh:** phỏng vấn ít nhất 3 giảng viên/lab coach hoặc người viết nội dung, ghi nguyên văn số người gặp khó khi kiểm tra nguồn của quiz. Mining 1–2 transcript và 2 bộ slide trong `data/vlearn-pack/`: đếm concept lặp tên, quan hệ prerequisite bị thiếu và câu hỏi/claim không truy được nguồn; lưu ít nhất 5 ví dụ kèm mã đoạn `[Txx-NNN]` hoặc trang slide. Chưa điền số đếm trước khi kiểm tra data thật. |
| 5 | Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả) | **Một giảng viên · cần quiz cho một chương · AI quyết định 10 câu hỏi có đủ căn cứ từ graph và nguồn phù hợp hay không · giảng viên nhận danh sách câu hỏi kèm provenance để duyệt hoặc loại từng câu.** |
| 6 | AI tự làm đến đâu + 1 dòng lý do · ≥3 willing users ngoài nhóm | **Tự:** trích xuất concept, quan hệ và câu hỏi; nối mỗi claim với file, trang/slide, đoạn nguồn và confidence; đánh dấu câu không đủ căn cứ. **Không tự:** bịa nguồn, khẳng định quan hệ khi thiếu bằng chứng hoặc tự xuất bản quiz; giảng viên luôn được sửa, duyệt hoặc loại. **Lý do:** quiz không truy được nguồn có thể truyền đạt kiến thức sai và làm mất niềm tin của giảng viên. **Willing users ngoài nhóm:** cần xác nhận và bổ sung ít nhất 3 giảng viên/lab coach/người học: `Minh Thu - Học viên`, `Thanh Bình - Học viên`, `Phước Tiến - Học viên`. |
| 7 | Phân công có tên | **Hoàng Đức Minh** — team lead, canvas/spec và điều phối · **Nguyễn Văn Tứ** — phỏng vấn, mining evidence và log · **Đinh Hoàng Đức** — thiết kế schema graph, provenance và golden set · **Nguyễn Quang Huy** — prototype, AI call thật và demo luồng duyệt quiz. |
