import os
import re
from typing import List, Dict, Any, Optional
from markitdown import MarkItDown

class SlideParser:
    def __init__(self):
        self.md_converter = MarkItDown()
        self._cache: Dict[str, Dict[str, Any]] = {}

    def convert_pdf_to_markdown(self, pdf_path: str, transcript_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Sử dụng repo MarkItDown để chuyển đổi PDF sang định dạng Markdown chuẩn,
        đồng thời phân tách và đánh số slide cùng mã trích dẫn [DEMO-NNN],
        kết hợp Transcript lời giảng nếu có. Có bộ đệm cache tốc độ cao.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        mtime = os.path.getmtime(pdf_path)
        cache_key = f"{os.path.abspath(pdf_path)}_{mtime}_{transcript_text or ''}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        cache_dir = "data/storage/parsed_cache"
        os.makedirs(cache_dir, exist_ok=True)
        import hashlib, json
        h = hashlib.md5(cache_key.encode('utf-8')).hexdigest()
        cache_file = os.path.join(cache_dir, f"{h}.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    self._cache[cache_key] = cached_data
                    return cached_data
            except Exception:
                pass

        # Gọi MarkItDown
        conversion_result = self.md_converter.convert(pdf_path)
        raw_text = conversion_result.text_content or ""

        # Kiểm tra nếu file PDF là dạng ảnh quét (scanned image) không có text layer để copy được
        clean_text_check = re.sub(r'[\s\x00-\x1f\x7f-\x9f]+', '', raw_text)
        pypdf_chars = 0
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                t = page.extract_text() or ""
                pypdf_chars += len(re.sub(r'[\s\x00-\x1f\x7f-\x9f]+', '', t))
        except Exception:
            pass

        if max(len(clean_text_check), pypdf_chars) < 30:
            raise ValueError(
                "File PDF tải lên là dạng ảnh quét (scanned) hoặc file ảnh thuần túy, không có lớp văn bản (text layer) để sao chép hoặc trích xuất nội dung. Vui lòng sử dụng file PDF chứa văn bản có thể chọn và copy chữ được!"
            )

        # Phân tách Transcript lời giảng theo từng slide nếu có cú pháp Slide X / Trang X
        transcript_by_slide: Dict[int, str] = {}
        if transcript_text and transcript_text.strip():
            # Tách các đoạn có dạng Slide 1: ... hoặc Trang 1: ...
            t_parts = re.split(r'(?:Slide|Trang)\s*(\d+)\s*[:\-]', transcript_text, flags=re.IGNORECASE)
            if len(t_parts) > 1:
                for i in range(1, len(t_parts), 2):
                    p_num = int(t_parts[i])
                    content_t = t_parts[i+1].strip()
                    transcript_by_slide[p_num] = content_t
            else:
                # Nếu không đánh số, gán vào toàn bộ hoặc slide đầu
                transcript_by_slide[1] = transcript_text.strip()

        # Phân tách từng trang theo ký tự ngắt trang \x0c hoặc tiêu đề Slide
        raw_pages = raw_text.split('\x0c')
        if len([p for p in raw_pages if p.strip()]) <= 1:
            try:
                from pypdf import PdfReader
                reader = PdfReader(pdf_path)
                if len(reader.pages) > 1:
                    raw_pages = [page.extract_text() or "" for page in reader.pages]
            except Exception:
                pass
        slides: List[Dict[str, Any]] = []

        formatted_md_parts = []

        for idx, page_content in enumerate(raw_pages):
            clean_content = page_content.strip()
            if not clean_content:
                continue

            page_number = idx + 1
            
            # Tìm kiếm tiêu đề slide
            title_match = re.search(r'Slide\s*\d+:\s*([^\n\r]+)', clean_content)
            if title_match:
                title = title_match.group(1).strip()
            else:
                lines = [l.strip() for l in clean_content.split('\n') if l.strip()]
                title = lines[0] if lines else f"Slide {page_number}"

            # Tìm kiếm các mã trích dẫn dạng [DEMO-NNN]
            citations = re.findall(r'\[DEMO-\d+\]', clean_content)

            # Lấy transcript của slide này nếu có
            slide_transcript = transcript_by_slide.get(page_number, "")

            # Đánh giá xem slide này có thuộc phạm vi cơ bản hay nâng cao
            is_advanced = "[NÂNG CAO" in clean_content or "CHƯA DẠY" in clean_content or page_number > 10

            slide_item = {
                "page_number": page_number,
                "title": title,
                "content": clean_content,
                "transcript": slide_transcript,
                "citations": citations,
                "is_advanced": is_advanced,
                "scope_label": "NÂNG CAO - CHƯA DẠY" if is_advanced else "ĐÃ DẠY - BUỔI 1"
            }
            slides.append(slide_item)

            # Định dạng lại markdown có gắn mốc neo cấu trúc
            slide_md = f"<!-- Slide {page_number} -->\n"
            slide_md += f"## Slide {page_number}: {title}\n\n"
            slide_md += f"{clean_content}\n\n"
            if slide_transcript:
                slide_md += f"### Transcript Lời giảng:\n{slide_transcript}\n\n"
            slide_md += f"**Trích dẫn nguồn:** {', '.join(citations) if citations else f'Slide Trang {page_number}'}\n"
            slide_md += "---\n"
            formatted_md_parts.append(slide_md)

        full_structured_md = "\n".join(formatted_md_parts)

        # Lưu cả file PDF và file Markdown vào thư mục docs/
        docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs"))
        os.makedirs(docs_dir, exist_ok=True)

        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        target_md_path = os.path.join(docs_dir, f"{base_name}.md")
        target_pdf_path = os.path.join(docs_dir, f"{base_name}.pdf")

        # Ghi file Markdown đã sinh
        with open(target_md_path, "w", encoding="utf-8") as f:
            f.write(full_structured_md)

        # Lưu hoặc sao chép file PDF tương ứng nếu chưa tồn tại
        if os.path.abspath(pdf_path) != os.path.abspath(target_pdf_path) and not os.path.exists(target_pdf_path):
            import shutil
            try:
                shutil.copyfile(pdf_path, target_pdf_path)
            except Exception:
                pass

        res = {
            "source_file": os.path.basename(pdf_path),
            "total_slides": len(slides),
            "slides": slides,
            "structured_markdown": full_structured_md,
            "raw_markdown": raw_text,
            "has_transcript": bool(transcript_text and transcript_text.strip()),
            "saved_md_path": target_md_path,
            "saved_pdf_path": target_pdf_path
        }
        self._cache[cache_key] = res
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(res, f, ensure_ascii=False)
        except Exception:
            pass
        return res

