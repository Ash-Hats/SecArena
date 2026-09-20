"""Add is_approved to simulation_session_users

Revision ID: 1a3b3f46b479
Revises: 'add_custom_commands'
Create Date: 2026-09-20 23:49:59.727590

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a3b3f46b479'
down_revision: Union[str, None] = 'add_custom_commands'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_alter_table for SQLite compatibility
    with op.batch_alter_table('simulation_session_users') as batch_op:
        batch_op.add_column(sa.Column('is_approved', sa.Boolean(), server_default='0', nullable=False))


def downgrade() -> None:
    with op.batch_alter_table('simulation_session_users') as batch_op:
        batch_op.drop_column('is_approved')
