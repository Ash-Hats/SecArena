"""Add administrator role.

Revision ID: 002_add_admin_role
Revises: 001_initial_schema
"""
from alembic import op

revision = "002_add_admin_role"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMIN'")

def downgrade() -> None:
    # PostgreSQL cannot safely remove values from an enum in place.
    pass
