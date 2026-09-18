import os
import json
import datetime
from typing import Dict, Any, List, Optional
import pymysql
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

Base = declarative_base()

class DocumentModel(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_file = Column(String(255), nullable=False)
    total_slides = Column(Integer, default=0)
    structured_markdown = Column(Text, nullable=True)
    raw_markdown = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LecturerConstraintModel(Base):
    __tablename__ = "lecturer_constraints"
    id = Column(Integer, primary_key=True, autoincrement=True)
    raw_note = Column(String(500), nullable=False)
    min_slide = Column(Integer, default=1)
    max_slide = Column(Integer, default=10)
    is_constrained = Column(Boolean, default=True)
    in_scope_count = Column(Integer, default=10)
    blocked_count = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class QuizModel(Base):
    __tablename__ = "quizzes"
    id = Column(String(64), primary_key=True)
    title = Column(String(255), nullable=False)
    allowed_max_slide = Column(Integer, default=10)
    status = Column(String(32), default="DRAFT")  # DRAFT, PUBLISHED
    total_questions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    questions = relationship("QuestionModel", back_populates="quiz", cascade="all, delete-orphan")

class QuestionModel(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(String(64), ForeignKey("quizzes.id"), nullable=False)
    question_code = Column(String(32), nullable=False)  # Q01, Q02...
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON list
    correct_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    slide_page = Column(Integer, nullable=False)
    citation_code = Column(String(64), nullable=False)
    provenance = Column(String(255), nullable=False)
    core_concept = Column(String(255), nullable=False)
    is_core = Column(Boolean, default=True)
    reviewed = Column(Boolean, default=False)
    quiz = relationship("QuizModel", back_populates="questions")

class StudentAttemptModel(Base):
    __tablename__ = "student_attempts"
    id = Column(String(64), primary_key=True)
    quiz_id = Column(String(64), nullable=False)
    student_name = Column(String(255), default="Học viên Thực Chiến")
    answers_json = Column(Text, nullable=False)
    correct_count = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    score_percent = Column(Float, default=0.0)
    status = Column(String(64), default="COMPLETED")  # ALL_CORRECT_MASTERY, HAS_WRONG_ANSWERS
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RemediationSessionModel(Base):
    __tablename__ = "remediation_sessions"
    id = Column(String(64), primary_key=True)
    attempt_id = Column(String(64), nullable=True)
    student_name = Column(String(255), default="Học viên Thực Chiến")
    remediation_items_json = Column(Text, nullable=False)
    retry_answers_json = Column(Text, nullable=True)
    status = Column(String(64), default="PENDING")  # PENDING, REMEDIATION_PASSED, REMEDIATION_RETRY_NEEDED
    score_percent = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MySQLDatabase:
    def __init__(self):
        self.host = os.getenv("MYSQL_HOST", "localhost")
        self.port = int(os.getenv("MYSQL_PORT", 3306))
        self.user = os.getenv("MYSQL_USER", "root")
        self.password = os.getenv("MYSQL_PASSWORD", "")
        self.database = os.getenv("MYSQL_DATABASE", "quizai")
        self.engine = None
        self.SessionLocal = None
        self.is_mysql = False
        self._init_connection()

    def _init_connection(self):
        # Thử kết nối MySQL
        try:
            # Tạo database nếu chưa tồn tại
            conn = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                charset='utf8mb4'
            )
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{self.database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.commit()
            conn.close()

            mysql_url = f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}?charset=utf8mb4"
            self.engine = create_engine(mysql_url, echo=False, pool_recycle=3600)
            Base.metadata.create_all(bind=self.engine)
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            self.is_mysql = True
            print(f"[DATABASE] Kết nối thành công tới MySQL: {self.host}:{self.port}/{self.database}")
        except Exception as e:
            print(f"[DATABASE WARNING] Không thể kết nối tới MySQL ({e}). Tự động kích hoạt cơ chế SQLite an toàn để đảm bảo hệ thống luôn sẵn sàng.")
            os.makedirs("data/storage", exist_ok=True)
            sqlite_url = "sqlite:///data/storage/quizai_fallback.db"
            self.engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
            Base.metadata.create_all(bind=self.engine)
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            self.is_mysql = False

    def get_session(self):
        return self.SessionLocal()

    # Document APIs
    def save_document(self, source_file: str, total_slides: int, structured_markdown: str, raw_markdown: str):
        session = self.get_session()
        try:
            doc = DocumentModel(
                source_file=source_file,
                total_slides=total_slides,
                structured_markdown=structured_markdown,
                raw_markdown=raw_markdown
            )
            session.add(doc)
            session.commit()
            return doc.id
        finally:
            session.close()

    def get_latest_document(self) -> Optional[Dict[str, Any]]:
        session = self.get_session()
        try:
            doc = session.query(DocumentModel).order_by(DocumentModel.id.desc()).first()
            if doc:
                return {
                    "id": doc.id,
                    "source_file": doc.source_file,
                    "total_slides": doc.total_slides,
                    "structured_markdown": doc.structured_markdown,
                    "raw_markdown": doc.raw_markdown,
                    "created_at": doc.created_at.isoformat()
                }
            return None
        finally:
            session.close()

    # Constraint APIs
    def save_constraint(self, raw_note: str, min_slide: int, max_slide: int, in_scope: int, blocked: int):
        session = self.get_session()
        try:
            c = LecturerConstraintModel(
                raw_note=raw_note,
                min_slide=min_slide,
                max_slide=max_slide,
                in_scope_count=in_scope,
                blocked_count=blocked
            )
            session.add(c)
            session.commit()
            return c.id
        finally:
            session.close()

    def get_latest_constraint(self) -> Optional[Dict[str, Any]]:
        session = self.get_session()
        try:
            c = session.query(LecturerConstraintModel).order_by(LecturerConstraintModel.id.desc()).first()
            if c:
                return {
                    "raw_note": c.raw_note,
                    "min_slide": c.min_slide,
                    "max_slide": c.max_slide,
                    "in_scope_count": c.in_scope_count,
                    "blocked_count": c.blocked_count
                }
            return {
                "raw_note": "Mới dạy xong Slide 1 - 10",
                "min_slide": 1,
                "max_slide": 10,
                "in_scope_count": 10,
                "blocked_count": 5
            }
        finally:
            session.close()

    # Quiz APIs
    def save_quiz_draft(self, quiz_data: Dict[str, Any]) -> str:
        session = self.get_session()
        try:
            import uuid
            quiz_id = str(uuid.uuid4())
            quiz = QuizModel(
                id=quiz_id,
                title=quiz_data.get("quiz_title", "Đánh Giá Tư Duy Sản Phẩm AI"),
                allowed_max_slide=quiz_data.get("allowed_max_slide", 10),
                status=quiz_data.get("status", "DRAFT"),
                total_questions=quiz_data.get("total_questions", len(quiz_data.get("questions", [])))
            )
            session.add(quiz)
            session.flush()

            for q in quiz_data.get("questions", []):
                question = QuestionModel(
                    quiz_id=quiz_id,
                    question_code=q.get("id", "Q01"),
                    question_text=q["question"],
                    options_json=json.dumps(q["options"], ensure_ascii=False),
                    correct_index=q["correct_index"],
                    explanation=q["explanation"],
                    slide_page=q["slide_page"],
                    citation_code=q["citation_code"],
                    provenance=q.get("provenance", f"Slide Trang {q['slide_page']}"),
                    core_concept=q.get("core_concept", "Core Concept"),
                    is_core=q.get("is_core", True),
                    reviewed=q.get("reviewed", False)
                )
                session.add(question)

            session.commit()
            return quiz_id
        finally:
            session.close()

    def get_latest_quiz(self) -> Optional[Dict[str, Any]]:
        session = self.get_session()
        try:
            quiz = session.query(QuizModel).order_by(QuizModel.created_at.desc()).first()
            if not quiz:
                return None
            
            questions = []
            for q in quiz.questions:
                questions.append({
                    "id": q.question_code,
                    "question_index": int(q.question_code.replace("Q", "")) if q.question_code.startswith("Q") else 1,
                    "question": q.question_text,
                    "options": json.loads(q.options_json),
                    "correct_index": q.correct_index,
                    "explanation": q.explanation,
                    "slide_page": q.slide_page,
                    "citation_code": q.citation_code,
                    "provenance": q.provenance,
                    "core_concept": q.core_concept,
                    "is_core": q.is_core,
                    "reviewed": q.reviewed
                })

            return {
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "allowed_max_slide": quiz.allowed_max_slide,
                "status": quiz.status,
                "total_questions": len(questions),
                "questions": questions
            }
        finally:
            session.close()

    def publish_latest_quiz(self) -> Dict[str, Any]:
        session = self.get_session()
        try:
            quiz = session.query(QuizModel).order_by(QuizModel.created_at.desc()).first()
            if not quiz:
                raise ValueError("Chưa có bản thảo Quiz để phát hành")
            quiz.status = "PUBLISHED"
            quiz.published_at = datetime.datetime.utcnow()
            session.commit()
            return {"quiz_id": quiz.id, "status": "PUBLISHED", "published_at": quiz.published_at.isoformat()}
        finally:
            session.close()

    # Student Attempt APIs
    def save_attempt(self, attempt_id: str, quiz_id: str, student_name: str, answers: Dict[str, int], correct_count: int, total_questions: int, score_percent: float, status: str):
        session = self.get_session()
        try:
            att = StudentAttemptModel(
                id=attempt_id,
                quiz_id=quiz_id,
                student_name=student_name,
                answers_json=json.dumps(answers, ensure_ascii=False),
                correct_count=correct_count,
                total_questions=total_questions,
                score_percent=score_percent,
                status=status
            )
            session.add(att)
            session.commit()
        finally:
            session.close()

    # Remediation APIs
    def save_remediation_session(self, session_id: str, student_name: str, items: List[Dict[str, Any]]):
        session = self.get_session()
        try:
            rem = RemediationSessionModel(
                id=session_id,
                student_name=student_name,
                remediation_items_json=json.dumps(items, ensure_ascii=False),
                status="PENDING"
            )
            session.add(rem)
            session.commit()
        finally:
            session.close()

    def get_remediation_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session = self.get_session()
        try:
            rem = session.query(RemediationSessionModel).filter(RemediationSessionModel.id == session_id).first()
            if rem:
                return {
                    "id": rem.id,
                    "student_name": rem.student_name,
                    "remediation_items": json.loads(rem.remediation_items_json),
                    "retry_answers": json.loads(rem.retry_answers_json) if rem.retry_answers_json else {},
                    "status": rem.status,
                    "score_percent": rem.score_percent
                }
            return None
        finally:
            session.close()

    def update_remediation_session(self, session_id: str, retry_answers: Dict[str, int], status: str, score_percent: float):
        session = self.get_session()
        try:
            rem = session.query(RemediationSessionModel).filter(RemediationSessionModel.id == session_id).first()
            if rem:
                rem.retry_answers_json = json.dumps(retry_answers, ensure_ascii=False)
                rem.status = status
                rem.score_percent = score_percent
                session.commit()
        finally:
            session.close()

    def get_mistake_analytics(self) -> Dict[str, Any]:
        """
        Sơ đồ luồng Giai đoạn 2:
        Thống kê các câu/concept bị sai nhiều nhất (Xếp thứ tự từ cao xuống thấp)
        -> Báo danh sách các phần bị làm sai nhiều nhất cho Giảng viên
        """
        session = self.get_session()
        try:
            attempts = session.query(StudentAttemptModel).all()
            quiz = session.query(QuizModel).order_by(QuizModel.created_at.desc()).first()
            if not quiz:
                return {
                    "total_attempts": 0,
                    "total_wrong_count": 0,
                    "most_failed_concepts": []
                }

            q_map = {}
            for q in quiz.questions:
                q_key = q.question_code
                q_map[q_key] = {
                    "question_id": q_key,
                    "question_text": q.question_text,
                    "concept": q.core_concept or f"Khái niệm Slide {q.slide_page}",
                    "slide_page": q.slide_page,
                    "citation_code": q.citation_code,
                    "correct_index": q.correct_index,
                    "fail_count": 0
                }

            total_attempts = len(attempts)
            total_wrong = 0
            for att in attempts:
                answers = json.loads(att.answers_json) if att.answers_json else {}
                for qid, qinfo in q_map.items():
                    user_ans = answers.get(qid)
                    if user_ans is None or user_ans != qinfo["correct_index"]:
                        qinfo["fail_count"] += 1
                        total_wrong += 1

            # Xếp thứ tự từ cao xuống thấp
            sorted_fails = sorted(
                q_map.values(),
                key=lambda x: x["fail_count"],
                reverse=True
            )

            results = []
            for rank, item in enumerate(sorted_fails, 1):
                fail_rate = round((item["fail_count"] / total_attempts * 100), 1) if total_attempts > 0 else 0
                results.append({
                    "rank": rank,
                    "question_id": item["question_id"],
                    "question_text": item["question_text"],
                    "concept": item["concept"],
                    "slide_page": item["slide_page"],
                    "citation_code": item["citation_code"],
                    "provenance": f"Slide Trang {item['slide_page']} • {item['citation_code']}",
                    "fail_count": item["fail_count"],
                    "fail_rate": f"{fail_rate}%"
                })

            return {
                "total_attempts": total_attempts,
                "total_wrong_count": total_wrong,
                "most_failed_concepts": results,
                "ranked_mistakes": results
            }
        finally:
            session.close()

mysql_db = MySQLDatabase()

