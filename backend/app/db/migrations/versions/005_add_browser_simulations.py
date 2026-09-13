"""Add safe browser simulation persistence.

Revision ID: 005_add_browser_simulations
Revises: 004_add_lab_instances
"""
from alembic import op
import sqlalchemy as sa

revision = "005_add_browser_simulations"
down_revision = "004_add_lab_instances"
branch_labels = None
depends_on = None


def upgrade() -> None:
    status_type = sa.Enum("RUNNING", "STOPPED", "COMPLETED", name="simulationstatus")
    op.create_table("simulation_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("scenario_slug", sa.String(100), nullable=False),
        sa.Column("student_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", status_type, nullable=False), sa.Column("state", sa.JSON(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False), sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.Column("stopped_at", sa.DateTime(timezone=True)))
    op.create_index("ix_simulation_sessions_scenario_slug", "simulation_sessions", ["scenario_slug"])
    op.create_index("ix_simulation_sessions_student_id", "simulation_sessions", ["student_id"])
    op.create_table("simulation_actions",
        sa.Column("id", sa.String(36), primary_key=True), sa.Column("session_id", sa.String(36), sa.ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_input", sa.String(500), nullable=False), sa.Column("command", sa.String(50), nullable=False), sa.Column("success", sa.String(10), nullable=False),
        sa.Column("result", sa.Text(), nullable=False), sa.Column("score_contribution", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_simulation_actions_session_id", "simulation_actions", ["session_id"])
    op.create_table("simulation_events",
        sa.Column("id", sa.String(36), primary_key=True), sa.Column("session_id", sa.String(36), sa.ForeignKey("simulation_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(80), nullable=False), sa.Column("severity", sa.String(20), nullable=False), sa.Column("description", sa.Text(), nullable=False),
        sa.Column("detected", sa.String(10), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_simulation_events_session_id", "simulation_events", ["session_id"])


def downgrade() -> None:
    op.drop_table("simulation_events"); op.drop_table("simulation_actions"); op.drop_table("simulation_sessions")
