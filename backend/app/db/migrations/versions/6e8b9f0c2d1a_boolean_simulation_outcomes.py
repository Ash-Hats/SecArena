"""Store simulation outcome fields as database booleans.

Revision ID: 6e8b9f0c2d1a
Revises: 1a3b3f46b479
"""

from alembic import op
import sqlalchemy as sa


revision = "6e8b9f0c2d1a"
down_revision = "1a3b3f46b479"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("simulation_actions") as batch_op:
        batch_op.alter_column(
            "success", existing_type=sa.String(length=10), type_=sa.Boolean(),
            postgresql_using="success::boolean", nullable=False,
        )
    with op.batch_alter_table("simulation_events") as batch_op:
        batch_op.alter_column(
            "detected", existing_type=sa.String(length=10), type_=sa.Boolean(),
            postgresql_using="detected::boolean", nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("simulation_events") as batch_op:
        batch_op.alter_column(
            "detected", existing_type=sa.Boolean(), type_=sa.String(length=10),
            postgresql_using="detected::text", nullable=False,
        )
    with op.batch_alter_table("simulation_actions") as batch_op:
        batch_op.alter_column(
            "success", existing_type=sa.Boolean(), type_=sa.String(length=10),
            postgresql_using="success::text", nullable=False,
        )
