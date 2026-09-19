import os
import sqlite3
import pymysql
from sqlalchemy import create_engine
import backend.storage.mysql_db as db

def migrate():
    # 1. Connect to MySQL and create quizai_db
    conn = pymysql.connect(host='localhost', port=3306, user='root', password='root')
    with conn.cursor() as cur:
        cur.execute("CREATE DATABASE IF NOT EXISTS `quizai_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    conn.commit()
    conn.close()

    # 2. Create tables in MySQL
    mysql_engine = create_engine('mysql+pymysql://root:root@localhost:3306/quizai_db?charset=utf8mb4')
    db.Base.metadata.create_all(bind=mysql_engine)

    # 3. Transfer data from SQLite
    sqlite_file = 'data/storage/quizai_fallback.db'
    if not os.path.exists(sqlite_file):
        print("SQLite fallback DB does not exist.")
        return

    sqlite_conn = sqlite3.connect(sqlite_file)
    sqlite_conn.row_factory = sqlite3.Row
    mysql_conn = pymysql.connect(host='localhost', port=3306, user='root', password='root', database='quizai_db')
    mysql_cur = mysql_conn.cursor()

    tables = ['documents', 'lecturer_constraints', 'quizzes', 'quiz_questions', 'student_attempts', 'remediation_sessions']
    for t in tables:
        scur = sqlite_conn.cursor()
        try:
            scur.execute(f"SELECT * FROM {t}")
            rows = scur.fetchall()
        except Exception as e:
            print(f"Skipping table {t}: {e}")
            continue

        if not rows:
            print(f"Table {t} is empty.")
            continue

        cols = list(rows[0].keys())
        col_str = ", ".join([f"`{c}`" for c in cols])
        placeholders = ", ".join(["%s"] * len(cols))
        sql = f"INSERT IGNORE INTO `{t}` ({col_str}) VALUES ({placeholders})"

        data = []
        for r in rows:
            data.append([r[c] for c in cols])

        mysql_cur.executemany(sql, data)
        mysql_conn.commit()
        print(f"Migrated {t}: {len(rows)} records.")

    mysql_conn.close()
    sqlite_conn.close()
    print("Migration finished successfully!")

if __name__ == '__main__':
    migrate()

