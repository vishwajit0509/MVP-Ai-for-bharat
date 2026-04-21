from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from app.config import DB_PATH, ensure_platform_dirs


def get_connection() -> sqlite3.Connection:
    ensure_platform_dirs()
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    connection = get_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS tenders (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                authority TEXT NOT NULL,
                reference_no TEXT,
                summary TEXT,
                status TEXT NOT NULL,
                ai_mode TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bidders (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                organization_type TEXT,
                city TEXT,
                state TEXT,
                overall_status TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                summary TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                bidder_id TEXT REFERENCES bidders(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                extension TEXT NOT NULL,
                extraction_method TEXT NOT NULL,
                extraction_confidence REAL NOT NULL,
                extraction_status TEXT NOT NULL,
                notes TEXT,
                extracted_text TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS criteria (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                code TEXT NOT NULL,
                category TEXT NOT NULL,
                rule_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                threshold_text TEXT,
                threshold_value REAL,
                unit TEXT,
                is_mandatory INTEGER NOT NULL,
                extraction_confidence REAL NOT NULL,
                source_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
                source_excerpt TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS evaluations (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                bidder_id TEXT NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
                criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
                verdict TEXT NOT NULL,
                verdict_reason TEXT NOT NULL,
                confidence REAL NOT NULL,
                source_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
                source_excerpt TEXT,
                found_value TEXT,
                rule_value TEXT,
                review_decision TEXT,
                reviewer_note TEXT,
                reviewed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(bidder_id, criterion_id)
            );

            CREATE TABLE IF NOT EXISTS audit_events (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
                bidder_id TEXT REFERENCES bidders(id) ON DELETE CASCADE,
                evaluation_id TEXT REFERENCES evaluations(id) ON DELETE CASCADE,
                actor TEXT NOT NULL,
                event_type TEXT NOT NULL,
                details_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
