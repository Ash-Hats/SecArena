"""Add Phase 4 isolated lab instance lifecycle records.

Revision ID: 004_add_lab_instances
Revises: 003_add_training_events
"""
from alembic import op
import sqlalchemy as sa

revision = "004_add_lab_instances"
down_revision = "003_add_training_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    instance_status = sa.Enum("PROVISIONING", "RUNNING", "STOPPED", "FAILED", name="labinstancestatus")
    op.create_table(
        "lab_instances",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("lab_id", sa.String(36), sa.ForeignKey("labs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("student_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", instance_status, nullable=False),
        sa.Column("container_id", sa.String(128), nullable=True, unique=True),
        sa.Column("network_name", sa.String(100), nullable=True, unique=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("stopped_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("failure_reason", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_lab_instances_lab_id", "lab_instances", ["lab_id"])
    op.create_index("ix_lab_instances_student_id", "lab_instances", ["student_id"])


def downgrade() -> None:
    op.drop_table("lab_instances")
