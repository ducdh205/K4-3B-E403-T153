import os
import re
from typing import List, Dict, Any
from markitdown import MarkItDown

class SlideParser:
    def __init__(self):
        self.md_converter = MarkItDown()

    def convert_pdf_to_markdown(self, pdf_path: str) -> Dict[str, Any]:
        """
        Sử dụng repo MarkItDown để chuyển đổi PDF sang định dạng Markdown chuẩn,
        đồng thời phân tách và đánh số slide cùng mã trích dẫn [DEMO-NNN].
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        # Gọi MarkItDown
        conversion_result = self.md_converter.convert(pdf_path)
        raw_text = conversion_result.text_content

        # Phân tách từng trang theo ký tự ngắt trang \x0c hoặc tiêu đề Slide
        raw_pages = raw_text.split('\x0c')
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

            # Đánh giá xem slide này có thuộc phạm vi cơ bản hay nâng cao
            is_advanced = "[NÂNG CAO" in clean_content or "CHƯA DẠY" in clean_content or page_number > 10

            slide_item = {
                "page_number": page_number,
                "title": title,
                "content": clean_content,
                "citations": citations,
                "is_advanced": is_advanced,
                "scope_label": "NÂNG CAO - CHƯA DẠY" if is_advanced else "ĐÃ DẠY - BUỔI 1"
            }
            slides.append(slide_item)

            # Định dạng lại markdown có gắn mốc neo cấu trúc
            slide_md = f"<!-- Slide {page_number} -->\n"
            slide_md += f"## Slide {page_number}: {title}\n\n"
            slide_md += f"{clean_content}\n\n"
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

        # Lưu hoặc sao chép file PDF tương ứng
        if os.path.abspath(pdf_path) != os.path.abspath(target_pdf_path):
            import shutil
            shutil.copyfile(pdf_path, target_pdf_path)

        return {
            "source_file": os.path.basename(pdf_path),
            "total_slides": len(slides),
            "slides": slides,
            "structured_markdown": full_structured_md,
            "raw_markdown": raw_text,
            "saved_md_path": target_md_path,
            "saved_pdf_path": target_pdf_path
        }

