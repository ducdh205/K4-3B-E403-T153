# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 18/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — [Tên lát cắt] · Nhóm [XX] · Zone [X]
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [ ] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
- Core JTBD (không tên sản phẩm/AI trong câu):
- Problem statement (KHÔNG chữ AI):
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):
  - ≥5 quote/ví dụ nguyên văn + nguồn:

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
- Ứng viên ĐÃ LOẠI + vì sao:
- Ứng viên CHỌN + vì sao (bằng số):

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm

- **Happy path:**
  * **Khối 1 ➔ 2 ➔ 3 (Trích xuất theo ghi chú bài dạy):** Giảng viên nạp Slide PDF (hệ thống bóc tách thành file Markdown `.md`) + nhập **Ghi chú kiến thức đã dạy** (VD: *"Hôm nay mới dạy xong Slide 1 - 10"*). AI đối chiếu Markdown với Ghi chú để chỉ sinh ra các câu hỏi trong phạm vi đã dạy, đổi thuật ngữ khó thành ẩn dụ đời thường và gắn nhãn nguồn `[Trang X / Txx-NNN]`.
  * **Khối 4 (Giảng viên duyệt):** Giảng viên kiểm tra nhanh, thấy câu hỏi đúng phạm vi ghi chú $\rightarrow$ Bấm **[Duyệt nhanh]** trong 1 phút.
  * **Khối 5 ➔ Giai đoạn 2 (Học viên làm bài & Phân nhánh):**
    - *Nếu Đúng hết các câu cốt lõi:* Màn hình hiện chúc mừng và mở 2 lựa chọn: `[⭐ Nâng cao level bài hiện tại]` hoặc `[⏭️ Sang bài học tiếp theo]`.
    - *Nếu Có câu làm sai (Vòng lặp ôn tập tức thì):* Hệ thống không đẩy link ngoài mà **giải thích lại kiến thức sai ngay trên màn hình** bằng ngôn ngữ đời thường $\rightarrow$ Chuyển học viên sang **Khối Quiz ôn tập** (chỉ gồm các câu kiểm tra lại phần kiến thức vừa sai) $\rightarrow$ Học viên làm xong, **mũi tên trỏ ngược về khối Phân loại kết quả bài làm** để kiểm tra lại: nếu đã nắm vững thì cho học tiếp, nếu vẫn sai thì tiếp tục hỗ trợ.

- **Low-confidence (②):**
  * *Tại Khối 2 & 3 (Ghi chú bài dạy mơ hồ):* Giảng viên chỉ ghi "Đã dạy Bài 1" mà không ghi rõ số trang dừng lại $\rightarrow$ AI không đoán mò, hiện danh sách checklist các Concept bóc tách từ Markdown để Giảng viên tick chọn xác nhận trước khi sinh Quiz.
  * *Tại Khối Quiz ôn tập lại:* Học viên làm lại câu hỏi ôn tập nhưng mất thời gian quá lâu hoặc đổi đáp án liên tục $\rightarrow$ Hệ thống không vội kết luận mà đưa ra một câu gợi ý tư duy đời thường (Hint) để học viên tự tin chọn lại.

- **Failure/không căn cứ & Vượt phạm vi ghi chú (①):**
  * *Tình huống 1 (Không có căn cứ):* AI sinh câu hỏi hoặc ví dụ đời thường nhưng không tìm thấy số trang trong file Markdown hoặc không có mã `[Txx-NNN]`.
  * *Tình huống 2 (Vượt ngoài ghi chú bài dạy - Case Slide trang 15):* File Slide có trang 15, nhưng trong Ghi chú của Giảng viên chỉ xác nhận đã dạy Trang 1–10 $\rightarrow$ Bộ lọc tự động chặn ngay lập tức: `[❌ Vượt phạm vi ghi chú bài dạy: Nguồn Trang 15]` và khóa câu hỏi, không cho phát hành xuống học viên.

- **Correction (user sửa):**
  * *Giảng viên can thiệp (Khối 4):* Nếu ví dụ đời thường AI gợi ý chưa vừa ý $\rightarrow$ Giảng viên bấm **[Sửa trực tiếp]**, hệ thống lưu lại log để lần sau ưu tiên học theo phong cách của giảng viên.
  * *Học viên phản hồi trong vòng lặp ôn tập:* Nếu học viên làm Quiz ôn tập kiến thức sai mà thấy lời giải thích vẫn khó hiểu $\rightarrow$ Bấm nút **[Giải thích bằng ví dụ khác]**, AI sẽ lập tức đổi sang một ví dụ ẩn dụ đời thường mới dễ hiểu hơn.

- **Khi bị đòi ngoài phạm vi (③):**
  * *Tình huống:* Giảng viên đòi AI tự viết đề thi môn khác không có tài liệu, hoặc Học viên yêu cầu giải hộ bài tập lớn, hoặc hỏi kiến thức các trang sau chưa có trong ghi chú bài dạy.
  * *Xử lý:* Hệ thống từ chối lịch sự: *"Theo Ghi chú bài dạy của Giảng viên, nội dung này chưa được học trên lớp. Hiện tại hệ thống chỉ hỗ trợ các kiến thức trong phạm vi Slide 1 - 10!"* $\rightarrow$ Điều hướng người dùng quay lại các Concept hiện có.

- **Case đặc thù domain (④ - Vòng lặp học tập sư phạm & Cải tiến bài giảng):**
  * *Vòng lặp khắc phục hổng kiến thức kín (Closed Remediation Loop):* Học viên không bị bỏ rơi với một danh sách link tài liệu thụ động; thay vào đó, hệ thống giải thích lại ngay lập tức và bắt buộc làm lại **Quiz ôn tập kiến thức sai** trỏ ngược về khâu đánh giá cho đến khi thực sự hiểu bản chất câu hỏi.
  * *Ghi chú bài dạy là "Nguồn sự thật" (Pedagogical Ground Truth):* Giải quyết triệt để bài toán lệch tiến độ bài giảng giữa slide lý thuyết soạn sẵn và thực tế trên lớp.
  * *Vòng lặp cải tiến bài giảng (Feedback loop về Khối 4):* Bảng thống kê tổng hợp những câu hỏi/concept nào học viên phải vào "Vòng lặp Quiz ôn tập" nhiều nhất (xếp từ cao xuống thấp) $\rightarrow$ Báo động cho Giảng viên: *"Khái niệm này học viên hay bị sai và phải ôn lại nhiều nhất, đề xuất Giảng viên giảng lại kỹ hơn trên lớp!"*

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```
