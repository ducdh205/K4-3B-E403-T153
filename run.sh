#!/bin/bash
# ==============================================================================
# SCRIPT KHỞI CHẠY HỆ THỐNG QUIZAI (PORT 8000: PHỤC VỤ CẢ FRONTEND & BACKEND)
# ==============================================================================

# Dừng toàn bộ tiến trình con khi nhấn Ctrl+C
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# Kiểm tra nếu truyền tham số --dev thì chạy cả Vite Hot-Reload lẫn FastAPI
if [ "$1" == "--dev" ]; then
    echo "========================================================="
    echo "⚡ KHỞI CHẠY CHẾ ĐỘ DEV (HOT-RELOAD):"
    echo "👉 Frontend (Vite Dev Server): http://localhost:5173"
    echo "👉 Backend API (FastAPI):       http://localhost:8000"
    echo "👉 Tài liệu API Swagger:        http://localhost:8000/docs"
    echo "========================================================="
    
    PYTHONPATH=. ./.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir backend &
    (cd frontend && npm run dev) &
    wait
else
    # Chế độ tiêu chuẩn: 1 port duy nhất 8000 phục vụ cả FE và BE
    if [ ! -d "frontend/dist" ]; then
        echo "📦 Đang build giao diện Frontend lần đầu..."
        (cd frontend && npm run build)
    fi

    echo "========================================================="
    echo "🚀 HỆ THỐNG QUIZAI ĐANG KHỞI CHẠY (FE + BE HỢP NHẤT):"
    echo "👉 Mở trình duyệt và truy cập: http://localhost:8000"
    echo "👉 Tài liệu API Swagger:       http://localhost:8000/docs"
    echo "========================================================="

    PYTHONPATH=. ./.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir backend
fi

