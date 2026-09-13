"""Add persistent training events and student enrolments.

Revision ID: 003_add_training_events
Revises: 002_add_admin_role
"""
from alembic import op
import sqlalchemy as sa

revision = "003_add_training_events"
down_revision = "002_add_admin_role"
branch_labels = None
depends_on = None


def upgrade() -> None:
    event_status = sa.Enum("DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED", name="eventstatus")
    op.create_table("training_events", sa.Column("id", sa.String(36), primary_key=True), sa.Column("title", sa.String(150), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("join_code", sa.String(40), nullable=False), sa.Column("status", event_status, nullable=False), sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False), sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False), sa.Column("capacity", sa.Integer(), nullable=True), sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.UniqueConstraint("join_code"))
    op.create_index("ix_training_events_author_id", "training_events", ["author_id"])
    op.create_index("ix_training_events_join_code", "training_events", ["join_code"])
    op.create_table("event_labs", sa.Column("id", sa.String(36), primary_key=True), sa.Column("event_id", sa.String(36), sa.ForeignKey("training_events.id", ondelete="CASCADE"), nullable=False), sa.Column("lab_id", sa.String(36), sa.ForeignKey("labs.id", ondelete="CASCADE"), nullable=False), sa.UniqueConstraint("event_id", "lab_id", name="uq_event_lab"))
    op.create_index("ix_event_labs_event_id", "event_labs", ["event_id"]); op.create_index("ix_event_labs_lab_id", "event_labs", ["lab_id"])
    op.create_table("event_enrollments", sa.Column("id", sa.String(36), primary_key=True), sa.Column("event_id", sa.String(36), sa.ForeignKey("training_events.id", ondelete="CASCADE"), nullable=False), sa.Column("student_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False), sa.UniqueConstraint("event_id", "student_id", name="uq_event_enrollment"))
    op.create_index("ix_event_enrollments_event_id", "event_enrollments", ["event_id"]); op.create_index("ix_event_enrollments_student_id", "event_enrollments", ["student_id"])


def downgrade() -> None:
    op.drop_table("event_enrollments"); op.drop_table("event_labs"); op.drop_table("training_events")
