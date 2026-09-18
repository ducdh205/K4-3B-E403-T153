# AI SPEC — Quiz có căn cứ và vòng lặp ôn tập thích ứng

- **Nhóm:** 3B · Zone E403
- **Track:** C1 — Knowledge-to-Lesson, có nhánh D2 — Học từ lỗi trước
- **Loại:** Tính năng mới
- **Trạng thái CP4:** Đã khóa phạm vi demo và chuẩn đạt ngày 18/09/2026
- **Mức prototype khai báo:** **Hybrid Mock / Working Prototype**

> Tài liệu này mô tả đúng trạng thái hiện tại của repository. Các phần chưa có bằng chứng, còn dùng dữ liệu cố định hoặc chỉ chạy khi có điều kiện được ghi rõ; không suy diễn thành kết quả thật.

---

## 0. Tuyên bố trung thực về trạng thái hiện tại

### Đã có và có thể kiểm tra trong mã nguồn

- Backend FastAPI có các API nạp PDF, đặt phạm vi bài dạy, tạo bản thảo quiz, phát hành, nộp bài, ôn lại và xem thống kê lỗi.
- `SlideParser` dùng Microsoft MarkItDown để chuyển PDF thành Markdown và phân trang.
- `GraphEngine` đọc một khoảng trang rõ ràng, chia concept thành `IN_SCOPE` và `BLOCKED_OUT_OF_SCOPE`.
- Quiz được tạo ở trạng thái `PENDING_LECTURER_REVIEW`; giảng viên phải xác nhận trên UI trước khi gọi API phát hành.
- Backend có chấm bài, tạo gói ôn tập và đánh giá lại. Có script kiểm thử pipeline 10 bước tại `tests/test_full_pipeline.py`.
- Bộ đánh giá xác định tại `eval/run_eval.py` đã ghi nhận **20/20 case đạt** trong `eval/eval_results.json`.
- Frontend React có UI cho giảng viên và người học, có responsive, light/dark mode và các hiệu ứng tương tác.

### Chạy có điều kiện

- `QuizGenerator` chỉ gọi **Gemini 1.5 Flash** khi có `GEMINI_API_KEY` hợp lệ và request thành công.
- Nếu thiếu key, hết thời gian chờ, lỗi mạng hoặc output không đọc được, hệ thống dùng ngân hàng câu hỏi cố định trong mã nguồn.
- Repository hiện không lưu log hoặc artefact đủ để chứng minh lần chạy 20/20 đã dùng Gemini. Vì vậy kết quả đó được ghi là kết quả của luồng xác định, không phải phép đo chất lượng của mô hình Gemini.

### Còn mô phỏng hoặc cố định

- Catalog concept cho các trang của tài liệu mẫu được viết cố định trong `backend/engine/graph_engine.py`; đây chưa phải knowledge graph được trích xuất ngữ nghĩa hoàn toàn từ một tài liệu bất kỳ.
- Bộ câu hỏi fallback và bộ câu hỏi ôn tập được viết cố định trong `quiz_generator.py` và `adaptive_engine.py`.
- Luồng người học đang hiển thị trong `frontend/src/App.jsx` chấm điểm ở phía client. API lấy quiz đã chủ động bỏ `correct_index`, trong khi client dùng `correct_index ?? 0`; vì vậy quiz lấy từ backend có thể bị chấm như thể mọi câu đều có đáp án đầu tiên đúng. Màn hình gỡ rối cũng tạo tình huống ôn tập cục bộ và chưa gọi các API remediation của backend.
- Một số nút trên workflow stepper dựng sẵn trạng thái 8/10 hoặc 10/10 để trình diễn nhanh.
- Golden set hiện là dữ liệu do nhóm tự soạn; chưa có ít nhất 10 case lấy từ chatlog hoặc phiên dùng thật.

### Chưa hoàn thành

- Chưa có thư mục/log phỏng vấn, survey, transcript mining hoặc biên bản validation để chứng minh các con số về nỗi đau và tác động.
- PDF do người dùng tải lên được lưu và parse ở endpoint upload, nhưng các endpoint đặt ràng buộc và tạo quiz vẫn đọc `data/sample_slides/slide-tu-duy-san-pham.pdf`. Vì vậy chưa thể tuyên bố chạy end-to-end với PDF bất kỳ.
- Chưa có chức năng sửa, đổi đáp án hoặc loại từng câu hỏi trong Studio; giảng viên hiện chỉ xem và duyệt hoặc chưa phát hành cả bộ.
- Ghi chú mơ hồ như “Tạo quiz” đang âm thầm fallback về một khoảng mặc định. Hệ thống chưa hỏi lại người dùng.
- Chưa đo thời gian tiết kiệm, tỷ lệ học viên hiểu bài hơn, semantic similarity của câu ôn tập hoặc độ chính xác do người đánh giá độc lập chấm.
- Chưa có kết quả kiểm thử với người dùng ngoài nhóm.

---

## §1. User & Job

### Người dùng chính

**Giảng viên, lab coach hoặc người soạn nội dung** đang chuẩn bị một bài quiz sau buổi học. Họ cần biết mỗi câu hỏi có nằm trong phần đã dạy và có truy về đúng trang tài liệu hay không trước khi phát hành.

Người học là người dùng thứ hai ở đầu ra của luồng. Nhánh ôn tập thích ứng giúp minh họa giá trị tiếp theo, nhưng không làm thay đổi lát cắt chính của CP4.

### Core JTBD

> Khi chuẩn bị bài kiểm tra cho phần vừa dạy, giảng viên muốn nhận một bản thảo câu hỏi có phạm vi và nguồn rõ ràng để kiểm tra rồi phát hành mà không phải dò lại toàn bộ tài liệu.

### Pain statement

Giảng viên phải đối chiếu thủ công câu hỏi với tài liệu và phạm vi đã dạy. Nếu bỏ sót, quiz có thể chứa kiến thức chưa học hoặc một claim không có căn cứ, khiến người học bị đánh giá sai.

### Bằng chứng hiện có

- `canvas.md` mới ghi **kế hoạch** phỏng vấn ít nhất 3 người và mining tài liệu; chưa có kết quả hay log đi kèm.
- Ba willing users đã được nêu trong Canvas, nhưng repository chưa có biên bản phiên thử hoặc phản hồi của họ.
- Vì chưa có artefact kiểm chứng, các số “24 người”, “21/24”, “8/9”, “42%”, “18%” và các quote trong bản spec cũ đã được gỡ bỏ.

**Kết luận bằng chứng tại CP4:** nỗi đau hợp lý theo workflow và tài liệu track C, nhưng **chưa được xác nhận bằng nghiên cứu người dùng của nhóm**. Đây là điểm yếu lớn nhất ở R1 và R6.

---

## §2. Impact & quyết định chọn

### Ba hướng đã cân nhắc

| Hướng | Giá trị dự kiến | Khả năng đo trong hackathon | Quyết định |
|---|---|---:|---|
| Tóm tắt slide cho người học | Giảm thời gian đọc | Khó xác minh “đúng ý chính” nếu chưa có người chấm | Không chọn |
| Quiz có phạm vi, provenance và chốt duyệt | Giảm công dò nguồn; giảm câu ngoài phần đã dạy | Có thể kiểm tra bằng trang nguồn, trạng thái block và publish gate | **Chọn** |
| Lớp học đa tác tử | Tăng tương tác | Phạm vi lớn, khó kiểm soát và khó demo ổn định | Không chọn |

### Tác động được phép tuyên bố

- Có thể đo trực tiếp: tỷ lệ câu có trường provenance, số câu vượt phạm vi, trạng thái trước/sau duyệt và tỷ lệ case kiểm thử đạt.
- Chưa thể tuyên bố: giảm 85% thời gian soạn đề, giảm từ 120 xuống 5 phút, hoặc tăng mastery từ 35% lên hơn 90%. Các chỉ số này chưa được đo.
- Quy mô khoảng 1.000 học viên trong tài liệu chương trình chỉ là bối cảnh của hackathon, không phải số người đã sử dụng sản phẩm.

### Chỉ số cần đo sau CP4

1. Thời gian một giảng viên tạo và duyệt quiz thủ công so với dùng prototype.
2. Số câu bị giảng viên sửa hoặc loại vì sai nguồn, sai phạm vi hoặc sai đáp án.
3. Tỷ lệ học viên trả lời đúng một tình huống mới cùng concept sau khi đọc phần giải thích.

---

## §3. Giải pháp tương tự đã nghiên cứu

### Quizizz và các công cụ quiz phổ biến

- Học ở họ: luồng vào bài nhanh, câu hỏi dễ quét, phản hồi rõ và tạo động lực.
- Khoảng trống nhóm nhắm tới: kiểm soát phạm vi đã dạy, provenance theo trang và chốt duyệt trước khi phát hành.
- Khác biệt hiện có trong prototype: mỗi câu mang metadata trang/mã nguồn và bản thảo có trạng thái chờ giảng viên.

### Công cụ tạo câu hỏi từ tài liệu

- Học ở họ: tải tài liệu rồi nhận bản thảo nhanh.
- Rủi ro cần tránh: xem output sinh tự động là đúng mặc định.
- Quyết định thiết kế: hệ thống chỉ hỗ trợ; giảng viên giữ quyền phát hành.

Không có nghiên cứu đối thủ có artefact trong repository, nên phần này là phân tích sản phẩm của nhóm, không phải kết quả benchmark.

---

## §4. Thiết kế

### Lát cắt một câu

> **Một giảng viên** chuẩn bị quiz cho phần vừa dạy; **hệ thống quyết định nội dung nào nằm trong khoảng trang giảng viên khai báo và tạo bản thảo có provenance**; **giảng viên nhìn thấy phần được dùng, phần bị chặn và chỉ phát hành sau khi tự xác nhận**.

### Một luồng chính sẽ demo

1. Người xem mở **Giảng viên Studio** và bấm **Nạp tài liệu mẫu**.
2. Người xem nhập một phạm vi rõ ràng, ví dụ: `Đã dạy từ trang 1 đến trang 5`.
3. Hệ thống parse khoảng trang, hiển thị số concept trong phạm vi và số concept bị chặn.
4. Người xem bấm **Sinh Quiz Có Căn Cứ**.
5. Hệ thống trả bản thảo; mỗi câu hiển thị câu hỏi, đáp án và provenance.
6. Giảng viên kiểm tra, tích ô xác nhận và bấm **Duyệt & Phát Hành**.
7. Người xem thấy quiz được chuyển sang màn hình người học.

### Một tình huống khó sẽ demo

Giảng viên giới hạn đến trang 5 trong khi tài liệu mẫu còn nội dung ở các trang sau. Kết quả mong đợi và hiện đã có trong backend: các concept ngoài khoảng bị gắn `BLOCKED_OUT_OF_SCOPE` và không đi vào quiz.

Tình huống ghi chú mơ hồ chưa được chọn để demo vì hành vi hiện tại là fallback thầm lặng về khoảng mặc định. Đây là điểm chưa đạt yêu cầu “thiếu thông tin thì hỏi lại”, được đưa vào backlog thay vì mô tả như đã làm xong.

### Non-goals sau khi khóa CP4

1. Không mở rộng sang lớp học đa tác tử, chatbot hỏi đáp tự do hoặc tóm tắt đa môn.
2. Không thêm chức năng mới vào luồng demo sau thời điểm khóa; chỉ sửa lỗi làm luồng đã chốt không chạy.
3. Không tự động phát hành quiz khi chưa có hành động xác nhận của giảng viên trên UI.
4. Không dùng nhánh người học mô phỏng làm bằng chứng rằng backend adaptive đã chạy.

### Mức tự động hóa

**Augment.** Hệ thống chuẩn bị bản thảo và gắn metadata; giảng viên chịu trách nhiệm kiểm tra rồi phát hành. Lý do là câu hỏi sai có thể truyền đạt kiến thức sai và làm sai kết quả đánh giá.

### Nguyên tắc HAX/PAIR và mức đáp ứng

| Nguyên tắc | Cách thể hiện hiện tại | Mức đáp ứng |
|---|---|---|
| G1 — Làm rõ khả năng | Studio chia các bước nạp tài liệu, đặt phạm vi, sinh bản thảo và duyệt | Đạt một phần; chưa hiện rõ chế độ Gemini hay fallback |
| G2 — Làm rõ hệ thống làm tốt đến đâu | Hiển thị provenance và số concept bị chặn | Đạt một phần; chưa có confidence hoặc cảnh báo output yếu |
| G8 — Hỗ trợ từ chối output | Giảng viên có thể không tích xác nhận và không phát hành | Đạt ở cấp cả bộ; chưa loại từng câu |
| G10 — Giữ kiểm soát | Có ranh giới do giảng viên nhập và publish gate trên UI | Đạt cho luồng demo rõ phạm vi |
| G11 — Giải thích hành vi | Hiển thị nguồn và lý do block; nhánh học viên có giải thích khi sai | Đạt một phần; nhánh học viên active còn chạy cục bộ |

---

## §5. Kiểu lỗi — 4 lớp chỗ khó & Kịch bản xử lý (Taxonomy)

| Lớp lỗi | Kịch bản | Hành vi hiện tại | Đánh giá trung thực |
|---|---|---|---|
| 1. Nguồn sự thật | Câu không có mã nguồn | Schema/test kiểm tra trường citation | Kiểm tra cấu trúc, chưa chấm nội dung câu có thật sự được nguồn hỗ trợ |
| 1. Nguồn sự thật | Citation chỉ đến sai trang | Các case đầu so mã DEMO theo trang mẫu | Chạy với fixture cố định; chưa có người chấm độc lập |
| 2. Mơ hồ/thiếu tin | Ghi chú không có số trang | Fallback về khoảng mặc định | **Chưa đạt** hành vi hỏi lại; có nguy cơ người dùng không biết |
| 2. Mơ hồ/thiếu tin | Học viên bỏ trống đáp án | Backend tính là sai và đưa vào gỡ rối | Đạt ở API/test xác định |
| 3. Ngoài phạm vi | Concept nằm ngoài khoảng giảng viên nhập | Gắn `BLOCKED_OUT_OF_SCOPE` | Đạt với tài liệu mẫu và khoảng số trang |
| 3. Ngoài phạm vi | Phát hành khi chưa kiểm duyệt | Draft có trạng thái chờ; UI yêu cầu checkbox | Đạt trên luồng UI; API publish chưa nhận token/xác nhận riêng từ request |
| 4. Đặc thù domain | Học viên nhớ đáp án cũ | Có ngân hàng câu ôn tập khác ngữ cảnh | Khác chuỗi ký tự, chưa đo độ mới ngữ nghĩa |
| 4. Đặc thù domain | Học viên vẫn sai ở lần ôn | Backend trả `REMEDIATION_RETRY_NEEDED` | Có ở backend; active UI chỉ đánh giá một lượt cục bộ |

Golden set có 20 case và bao phủ bốn lớp, nhưng toàn bộ là case tổng hợp do nhóm tạo. Do chưa có case từ phiên dùng thật, nó phù hợp cho regression test hơn là bằng chứng xác nhận nhu cầu hoặc chất lượng ngoài thực tế.

---

## §6. Bốn đường đi của trải nghiệm

### Happy path

Nạp fixture → nhập phạm vi rõ → xem in-scope/blocked → tạo draft → kiểm tra provenance → xác nhận → phát hành → người học thấy quiz.

### Low-confidence / thiếu thông tin

Hiện tại ghi chú mơ hồ bị fallback về khoảng mặc định và có ghi chú trong response backend. UI chưa yêu cầu người dùng xác nhận lại. Đây là một lỗi thiết kế đã biết; demo không được nói rằng hệ thống “tự hiểu đúng”.

### Failure path

Nếu không có file mẫu hoặc parse/gọi API lỗi, backend trả lỗi và UI hiển thị thông báo. Prototype chưa có retry có hướng dẫn chi tiết hay cơ chế khôi phục tài liệu dở dang.

### Correction path

Giảng viên có thể sửa lại ghi chú phạm vi rồi tạo lại bản thảo. Chưa thể sửa nội dung, đáp án hoặc xóa một câu riêng lẻ trên Studio.

---

## §7. Kiểm thử

### Chuẩn đạt khóa tại CP4

Ngưỡng số giữ nguyên từ bản spec trước: **ít nhất 18/20 case (90%)**. Ngoài tỷ lệ tổng, bài chỉ được gọi là đạt luồng demo khi đồng thời thỏa cả ba điều kiện quan trọng:

1. **0 câu** trong bản thảo nằm ngoài khoảng trang rõ ràng mà giảng viên đã nhập.
2. **100% câu** trả về có đủ trường trang và mã provenance theo schema.
3. Quiz ở trạng thái chờ duyệt trước khi giảng viên thực hiện hành động phát hành.

Các điều kiện trên là quality bar cho fixture và bộ kiểm thử hiện tại. Chúng không chứng minh citation hỗ trợ đúng về mặt ngữ nghĩa, câu hỏi hay về mặt sư phạm hoặc người học đã làm chủ kiến thức.

### Kết quả đang có

- `eval/eval_results.json`: **20/20 case đạt, 100%**.
- Phân bổ ghi trong file kết quả: nguồn sự thật 6/6, mơ hồ/thiếu thông tin 2/2, ngoài phạm vi 5/5, đặc thù domain 7/7.
- `tests/test_full_pipeline.py` định nghĩa 10 bước kiểm tra API end-to-end, nhưng trong lần rà soát CP4 hiện tại không chạy lại được vì môi trường Python đang thiếu `fastapi`. Spec không tuyên bố lần chạy mới đã pass.
- Frontend đã build thành công trong phiên hoàn thiện UI hiện tại.

### Giới hạn của phép đo 20/20

- Đây là kiểm thử xác định trên fixture và string/schema, không phải đánh giá mù bởi giảng viên.
- Một số case chỉ kiểm tra chuỗi không xuất hiện, hai câu không giống hệt nhau hoặc package có tồn tại; chúng chưa đủ để kết luận “không hallucination” hay “tình huống mới 100% về ngữ nghĩa”.
- Kết quả đã tồn tại trước lần chỉnh CP4 này, nên không được trình bày như một blind evaluation được chạy sau khi khóa ngưỡng.
- Kết quả không chứng minh lời gọi Gemini đã chạy.

**Kết luận đo lường:** prototype đạt regression bar do nhóm tự định nghĩa trên dữ liệu mẫu; **chưa đạt chuẩn xác nhận chất lượng sản phẩm với người dùng thật**.

---

### Điểm mạnh, điểm yếu và rủi ro

#### Điểm mạnh

1. Luồng giảng viên có đầu vào, quyết định phạm vi, đầu ra và bước tiếp theo rõ ràng.
2. Ranh giới theo khoảng trang và publish gate là các hành vi cụ thể, dễ demo và dễ kiểm thử.
3. Metadata provenance đi cùng từng câu giúp giảng viên có vị trí để kiểm tra.
4. Có backend, database fallback, bộ regression 20 case và script pipeline 10 bước thay vì chỉ có mock hình ảnh.
5. UI bao phủ cả vai trò giảng viên và người học, hiển thị tốt ở nhiều kích thước màn hình.

#### Điểm yếu

1. Chưa có evidence và validation artefact, nên chưa chứng minh người dùng thật cần sản phẩm hoặc sẵn sàng dùng.
2. Tài liệu tải lên chưa được truyền xuyên suốt các endpoint sau upload; fixture vẫn là nguồn chính của demo.
3. Knowledge graph, fallback quiz và remediation chủ yếu là dữ liệu viết sẵn.
4. Chế độ Gemini/fallback chưa được gắn nhãn trên UI; người xem có thể hiểu nhầm output cố định là AI thật.
5. Active learner UI chưa nối vào API submit/remediation; với quiz lấy từ backend, client còn có thể chấm sai vì không nhận `correct_index` nhưng lại mặc định đáp án đầu tiên là đúng.
6. Không có chỉnh sửa/loại từng câu, confidence, hỏi lại khi mơ hồ hoặc kiểm tra semantic grounding.
7. Golden set do nhóm tự viết và kết quả 20/20 có nguy cơ phản ánh việc test khớp implementation hơn là chất lượng thực tế.

#### Rủi ro khi demo

- Nếu nói “AI sinh thật” mà không chỉ ra log Gemini, đó là overclaim. Người demo phải nói rõ đang dùng Gemini hay fallback.
- Nếu tải một PDF mới rồi tiếp tục tạo quiz, kết quả vẫn có thể đến từ fixture mẫu. Không dùng thao tác này để chứng minh hỗ trợ tài liệu bất kỳ.
- Không dùng nút nhảy thẳng trên workflow stepper hoặc màn hình remediation cục bộ làm bằng chứng cho API adaptive.

---

## §8. Phân công & Kế hoạch

- **Hoàng Đức Minh** — Team lead, canvas/spec, khóa phạm vi và điều phối.
- **Nguyễn Văn Tứ** — phỏng vấn, mining evidence và lưu log; thuyết trình.
- **Đinh Hoàng Đức** — schema graph, provenance và golden set.
- **Nguyễn Quang Huy** — backend, prototype frontend và demo.

---

## §9. Changelog

| Thời điểm | Quyết định | Lý do |
|---|---|---|
| 17/09/2026 | Chọn C1, giảng viên là người dùng chính | Provenance và kiểm duyệt phù hợp Track C |
| 18/09/2026 | Giữ ngưỡng đạt tối thiểu 90% trên 20 case | Kế thừa ngưỡng đã ghi trước CP4, tránh đổi ngưỡng theo kết quả |
| 18/09/2026 | Khóa demo vào một luồng Studio và một case ngoài phạm vi | Luồng này có hành vi backend cụ thể và kiểm tra được |
| 18/09/2026 | Hạ mức khai báo từ “Working Prototype” tuyệt đối xuống “Hybrid Mock / Working” | UI learner, dữ liệu và một số engine còn dùng fallback/hardcode |
| 18/09/2026 | Gỡ số khảo sát và impact không có artefact | Bảo đảm trung thực, không biến kế hoạch thành bằng chứng |
| 18/09/2026 | Ghi rõ giới hạn của kết quả 20/20 | Tránh diễn giải regression test thành chất lượng AI hoặc validation người dùng |

