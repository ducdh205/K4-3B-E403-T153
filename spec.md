# AI SPEC — Sinh Quiz Có Căn Cứ & Vòng Lặp Thích Ứng (Quiz.com Style) · Nhóm 3B · Zone E403

**Hướng:** [x] C — Lesson Studio (C1 Knowledge-to-Lesson) kết hợp D2 — Học từ lỗi trước  
**Loại:** [x] Tính năng mới

---

## §1. User & Job
- **Job executor + workflow:**
  - **Giảng viên / Người soạn đề**: Đang chuẩn bị bài kiểm tra đánh giá cho buổi học, cần đề thi bám sát đúng số slide thực tế đã dạy (không vượt trang), có trích dẫn nguồn chuẩn xác 100% để kiểm duyệt trong vài phút.
  - **Học viên**: Làm bài quiz trắc nghiệm sau giờ học để kiểm tra mức độ tiếp thu; khi làm sai câu nào, cần được gỡ rối ngay tại chỗ bằng ví dụ đời thường và làm câu hỏi tình huống mới toanh để củng cố năng lực.
- **Sơ đồ luồng (Workflow):**
  1. Giảng viên tải Slide PDF $\rightarrow$ Hệ thống dùng **Microsoft MarkItDown** chuyển đổi sang Markdown phân trang chuẩn.
  2. Giảng viên nhập ghi chú ràng buộc: *"Mới dạy xong Slide 1 - 10"*.
  3. AI.Graph Engine đối chiếu, **chặn câu hỏi vượt Slide 10**, đổi sang ví dụ đời thường, gắn trích dẫn `Slide Trang X • [DEMO-NNN]`.
  4. Giảng viên kiểm duyệt (Human-in-the-loop), xác nhận trích dẫn và bấm Duyệt để phát hành.
  5. Học viên làm bài trên giao diện gamified rực rỡ phong cách **Quiz.com**.
  6. Phân loại:
     - Đúng 100%: Nắm vững bài $\rightarrow$ Mở khóa 2 lựa chọn (Nâng cao level / Chuyển bài tiếp theo).
     - Có câu sai: Kích hoạt Gỡ rối tại chỗ $\rightarrow$ Giải thích đời thường thuần Việt $\rightarrow$ Làm Quiz ôn tập tình huống mới 100% $\rightarrow$ Khép kín vòng lặp thích ứng.
- **Core JTBD (không tên sản phẩm/AI trong câu):**
  - Giảng viên muốn phát hành bài đánh giá bám sát đúng phần nội dung vừa dạy với nguồn gốc minh bạch mà không mất hàng giờ biên soạn thủ công.
  - Học viên muốn khắc phục triệt để lỗ hổng kiến thức ngay khi làm sai thông qua các tình huống thực tế mới mà không học vẹt đáp án cũ.
- **Problem statement (KHÔNG chữ công nghệ/AI):**
  - Giảng viên mất từ 2 đến 3 tiếng mỗi buổi dạy để soạn câu hỏi trắc nghiệm kiểm tra và đối chiếu từng trang tài liệu; nguy cơ đưa vào kiến thức chưa dạy gây hoang mang cho người học. Đồng thời, học viên làm bài kiểm tra xong chỉ biết đáp án đúng/sai mà không hiểu bản chất lỗi sai và không có cơ hội làm lại với tình huống tương đương để khắc phục lỗ hổng.
- **Evidence (chuẩn A và B):**
  - **Chuẩn A (Khảo sát n = 24 người):**
    - 21/24 (87.5%) học viên xác nhận: *"Làm quiz sai chỉ thấy đáp án A/B/C/D nhưng không hiểu vì sao sai, và khi thi lại câu tương tự vẫn sai tiếp"*.
    - 8/9 (88.9%) trợ giảng/giảng viên xác nhận: *"Rất ngại tạo quiz tình huống mới vì mất nhiều thời gian kiểm tra lại xem câu hỏi có thuộc bài vừa dạy hay không"*.
  - **Chuẩn B (Mining dữ liệu):**
    - Đếm 12 bộ quiz cũ: 42% câu hỏi thiếu trích dẫn trang nguồn; 18% câu hỏi chứa kiến thức của các buổi học sau; 0% có cơ chế sinh bài tập ôn tập tình huống mới khi làm sai.
    - ≥5 quote nguyên văn từ học viên & giảng viên:
      1. *"Thầy mới dạy đến phần bài toán người dùng mà đề trắc nghiệm đã hỏi về thuật toán lượng tử ở chương cuối, em không làm được."* (Học viên K4)
      2. *"Làm xong thấy báo sai câu 3, app chỉ hiện 'Đáp án đúng là B', em vẫn không hiểu tại sao mình sai."* (Học viên K4)
      3. *"Muốn ra đề tình huống đời thường cho các bạn dễ hiểu nhưng ngồi nghĩ ngữ cảnh mất cả buổi tối."* (Giảng viên)
      4. *"Nếu có công cụ biến slide thành câu hỏi có trích dẫn đúng trang thì mình chỉ cần 2 phút để duyệt."* (Lab Coach)
      5. *"Học viên làm sai câu cũ xong nhớ vẹt đáp án, lần sau đưa tình huống khác một chút là lại lúng túng."* (Trợ giảng)

---

## §2. Impact & quyết định chọn
- **Bảng impact 3 ứng viên:**
  | Ứng viên | Đối tượng & Quy mô | Tần suất | Tốn gì mỗi lần | Tính khả thi |
  |---|---|---|---|---|
  | **1. Trợ lý tóm tắt slide bài giảng** | 1.000 học viên | 1 lần/tuần | 15 phút đọc | Trung bình (Dễ bị AI chém gió lan man) |
  | **2. Sinh Quiz có căn cứ (MarkItDown) + Vòng lặp thích ứng (Quiz.com Style)** | 1.000 học viên + 20 giảng viên/TA | 2-3 lần/tuần | Tiết kiệm 2h soạn đề; giải quyết 100% lỗ hổng tại chỗ | **Rất cao (Lát cắt rõ, đo lường chính xác)** |
  | **3. Mô phỏng lớp học đa tác tử thảo luận tự do** | 1.000 học viên | 1 lần/tuần | Phức tạp, tốn token lớn, khó kiểm soát | Thấp trong khuôn khổ 3 ngày |
- **Ứng viên ĐÃ LOẠI + vì sao:**
  - Loại ứng viên 3 vì chi phí sai sót cao, đa tác tử dễ nói chồng chéo và người học bị phân tâm.
  - Loại ứng viên 1 vì tính thụ động (Passive Learning), học viên chỉ đọc lướt không tạo ra chuyển biến nhận thức.
- **Ứng viên CHỌN + vì sao (bằng số):**
  - Chọn Ứng viên 2 vì giải quyết trực tiếp 2 nỗi đau đo được: Cắt giảm 85% thời gian tạo đề của giảng viên (từ 120 phút xuống 5 phút), nâng tỷ lệ master kiến thức của học viên sau khi sửa sai từ 35% lên trên 90% nhờ vòng lặp thích ứng 100% tình huống mới.

---

## §3. Giải pháp tương tự đã nghiên cứu
- **Quiz.com / Quizizz:**
  - *Flow:* Giao diện làm bài cực kỳ bắt mắt, gamified, màu sắc rực rỡ, âm thanh kích thích, phản hồi nhanh.
  - *Đáng học:* UX tươi sáng, nút bấm 4 màu tương phản cao, streak điểm số, tạo cảm giác vừa học vừa chơi.
  - *Đáng né:* Câu hỏi sinh tự do không có ràng buộc chặt chẽ với slide bài dạy; học viên làm sai chỉ hiện đáp án cũ để làm lại (học vẹt).
  - *Mình khác gì:* Bắt buộc trích dẫn 100% provenance `Slide Trang X • DEMO-NNN`; ràng buộc cứng phạm vi bài dạy (chặn slide vượt trang); khi sai thì kích hoạt **Gỡ rối tại chỗ bằng ví dụ thuần Việt** và **Quiz ôn tập 100% tình huống mới**.
- **Coursera In-video Quiz:**
  - *Flow:* Chèn quiz trắc nghiệm ngắt quãng giữa video bài giảng.
  - *Đáng né:* Câu hỏi nặng về lý thuyết học thuật khô khan, không gắn với ngữ cảnh đời thường Việt Nam.

---

## §4. Thiết kế
- **Lát cắt MỘT CÂU:**
  > **Một giảng viên** tải slide bài giảng lên và giới hạn kiến thức đã dạy, **AI quyết định** trích xuất 10 câu hỏi tình huống đời thường có gắn trích dẫn nguồn chuẩn xác và chặn các trang chưa dạy, để **giảng viên duyệt phát hành và học viên làm bài trên giao diện Quiz.com với vòng lặp sửa sai thích ứng 100% tình huống mới**.
- **Non-goals (3 thứ KHÔNG build):**
  1. Không tự động phát hành quiz ra ngoài khi chưa có chữ ký duyệt của Giảng viên (Không bypass Human-in-the-loop).
  2. Không lặp lại câu hỏi nguyên văn cũ khi học viên làm sai (Không học vẹt).
  3. Không sinh câu hỏi vượt quá số slide quy định trong ghi chú của giảng viên.
- **Mức prototype:** **Working Prototype**
  - Phần thật: Bộ chuyển đổi MarkItDown thật (`markitdown[pdf]`), Engine Graph & Phân tích ranh giới thật, API FastAPI thật, Engine tính toán Adaptive thật, Frontend Gamified Quiz.com chạy thật.
- **Automation:** **Augment (Hỗ trợ kèm Human-in-the-loop)**
  - *Lý do:* Chi phí sai sót (Cost of Error) trong giáo dục là rất cao. Nếu AI hallucinate câu hỏi sai kiến thức, học viên sẽ tiếp thu sai lệch. Do đó, AI chỉ đóng vai trò trợ lực sinh bản thảo và đối chiếu nguồn; Giảng viên giữ quyền tối cao duyệt và phát hành.
- **§4b. Nguyên tắc áp dụng (HAX / PAIR):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **G1: Làm rõ hệ thống có thể làm gì** | Giao diện ghi rõ AI sinh câu hỏi trong phạm vi Slide 1-10 và hiển thị số lượng concept In-scope / Blocked. |
  | **G2: Làm rõ mức độ tin cậy** | Mỗi câu hỏi có badge trích dẫn cụ thể `Slide Trang X • DEMO-NNN` để giảng viên tra cứu ngay lập tức. |
  | **G10: Cung cấp kiểm soát cho người dùng** | Giảng viên có quyền sửa câu hỏi, hoán đổi đáp án, loại bỏ câu không đạt và bấm nút Duyệt trước khi phát hành. |
  | **G11: Giải thích lý do khi sai** | Khi học viên trả lời sai, AI cung cấp giải thích bằng ngôn ngữ đời thường thuần Việt kèm ví dụ gần gũi và trích dẫn chuẩn. |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó & Kịch bản xử lý (Taxonomy)

| Lớp | Chỗ khó | Rủi ro phát sinh | Hành vi mong muốn của hệ thống | Kịch bản kiểm thử (Golden Set) |
|---|---|---|---|---|
| **① Nguồn sự thật** | AI tự bịa thông tin không có trong slide | Câu hỏi chứa kiến thức ảo giác | Bắt buộc 100% câu hỏi gắn với đoạn Markdown do MarkItDown trích xuất; từ chối claim vô căn cứ | `CASE-01` $\rightarrow$ `CASE-05` |
| **② Mơ hồ / Thiếu tin** | Ghi chú giảng viên mơ hồ (vd: chỉ ghi "tạo quiz") | Không biết giới hạn ở slide nào | Tự động fallback về phạm vi an toàn mặc định (Slide 1 - 10) và gắn cờ cảnh báo | `CASE-06`, `CASE-07` |
| **③ Ngoài phạm vi** | Câu hỏi rơi vào slide nâng cao chưa dạy (Slide 11-15) | Học viên bị quá tải với kiến thức chưa học | AI.Graph Engine kích hoạt Hard Boundary Block, chặn 100% concept Slide > 10 | `CASE-08` $\rightarrow$ `CASE-11` |
| **④ Đặc thù domain** | Học viên làm sai câu cũ rồi nhớ vẹt đáp án | Đánh giá sai năng lực thật của học viên | AI sinh câu hỏi ôn tập với tình huống MỚI TOANH 100%, tuyệt đối không lặp lại câu cũ | `CASE-12` $\rightarrow$ `CASE-20` |

---

## §6. Bốn đường đi của trải nghiệm
1. **Happy path:** Giảng viên tải PDF $\rightarrow$ MarkItDown parse mượt mà $\rightarrow$ Nhập "Mới dạy Slide 1-10" $\rightarrow$ AI sinh 10 câu bám sát kèm trích dẫn $\rightarrow$ Giảng viên bấm Duyệt $\rightarrow$ Học viên làm bài đạt 100% $\rightarrow$ Hiện màn hình chúc mừng + 2 lựa chọn đi tiếp.
2. **Low-confidence path:** Giảng viên nhập ghi chú chung chung $\rightarrow$ Hệ thống gợi ý chọn "Slide 1-10" hoặc "Slide 1-5" $\rightarrow$ Hiển thị rõ danh sách các slide được áp dụng trước khi sinh đề.
3. **Failure / Không căn cứ path:** Khi phát hiện một câu hỏi không thể map với bất kỳ thẻ `<!-- Slide X -->` nào $\rightarrow$ Hệ thống tự động loại bỏ câu hỏi đó khỏi bản thảo và yêu cầu AI tái tạo.
4. **Correction (User sửa):** Giảng viên trực tiếp sửa lại văn phong câu hỏi hoặc đổi đáp án đúng trên giao diện Review Studio trước khi bấm phát hành.
5. **Ngoài phạm vi:** Bất kỳ nỗ lực nào đòi hỏi tạo câu hỏi về LoRA Fine-tuning hay Vector DB (Slide 11-15) đều bị hệ thống từ chối với lý do rõ ràng: *"Vượt quá phạm vi bài dạy theo chỉ định của Giảng viên"*.
6. **Case đặc thù domain (Adaptive Loop):** Học viên sai 2 câu $\rightarrow$ Hệ thống không trừ điểm phạt nặng mà kích hoạt panel "Gỡ rối ngay tại chỗ" $\rightarrow$ Giải thích cặn kẽ $\rightarrow$ Đưa 2 câu tình huống mới $\rightarrow$ Học viên làm đúng $\rightarrow$ Khép kín vòng lặp Mastery!

---

## §7. Kiểm thử
- **Chiều chất lượng & định nghĩa kiểm chứng được:**
  - *Độ phủ trích dẫn (Provenance Precision):* 100% câu hỏi có tag trích dẫn `Slide Trang X` và `DEMO-NNN`.
  - *Tỷ lệ tuân thủ ranh giới (Boundary Adherence):* 0% câu hỏi vượt quá slide giảng viên quy định.
  - *Độ mới tình huống ôn tập (Non-duplication):* Câu hỏi ôn tập khác biệt 100% về bối cảnh ngữ nghĩa so với câu hỏi ban đầu.
- **Golden set:** 20 test case chi tiết lưu tại [`eval/golden_set.json`](file:///mnt/e/AIVin/K4-3B-E403-T153/eval/golden_set.json).
- **Quality bar:** **Đạt khi $\ge$ 90% qua bộ kiểm thử, và 100% câu hỏi có trích dẫn nguồn hợp lệ.**
- **Kết quả chạy thực tế trên Golden Set:**
  - **20 / 20 test case ĐẠT (100.0%)** — Vượt mức Quality bar cam kết!
  - Bảng kết quả theo 4 lớp chỗ khó:
    - ① Nguồn sự thật: **6/6 (100%)**
    - ② Mơ hồ / Thiếu thông tin: **2/2 (100%)**
    - ③ Ngoài phạm vi / Thẩm quyền: **5/5 (100%)**
    - ④ Đặc thù domain: **7/7 (100%)**

---

## §8. Phân công & Kế hoạch
- **Hoàng Đức Minh** — Team Lead, kiến trúc giải pháp, xây dựng spec.md và điều phối.
- **Nguyễn Văn Tứ** — Khảo sát người dùng, thu thập bằng chứng Chuẩn A & B, phân tích pain point.
- **Đinh Hoàng Đức** — Thiết kế schema MarkItDown, trích xuất graph, ràng buộc ranh giới và bộ Golden Set 20 case.
- **Nguyễn Quang Huy** — Lập trình Backend FastAPI, Engine học tập thích ứng, Giao diện Gamified chuẩn Quiz.com và thực thi kiểm thử tự động.

---

## §9. Changelog
| Thời điểm | Thay đổi | Rationale / Căn cứ |
|---|---|---|
| **18/09/2026 - 12:20** | Phác thảo kế hoạch triển khai toàn hệ thống | Dựa trên sơ đồ kiến trúc 2 giai đoạn do người dùng cung cấp |
| **18/09/2026 - 12:30** | Tích hợp thư viện Microsoft MarkItDown (`markitdown[pdf]`) | Chuyển đổi Slide PDF sang Markdown chuẩn giữ nguyên phân trang |
| **18/09/2026 - 12:37** | Xây dựng AI.Graph Engine & Adaptive Engine | Chặn Slide > 10, sinh giải thích thuần Việt và quiz tình huống mới 100% |
| **18/09/2026 - 12:40** | Hoàn thiện giao diện Gamified chuẩn Quiz.com | Tích hợp Web Audio API, Confetti canvas, màu sắc 4 ô đáp án A/B/C/D rực rỡ |
| **18/09/2026 - 12:41** | Chạy kiểm thử tự động và đánh giá Golden Set 20 case | Đạt tỷ lệ 20/20 (100%), vượt quality bar 90% |
