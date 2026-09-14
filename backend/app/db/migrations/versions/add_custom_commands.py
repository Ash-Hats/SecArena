"""Add custom_commands table

Revision ID: add_custom_commands
Revises: 
Create Date: 2026-09-14 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_custom_commands'
down_revision = '09d5ee5e26c1'
depends_on = None

def upgrade() -> None:
    # Get the current state to find the latest revision to chain to, 
    # but since this is a manual migration and we might not know the exact previous one,
    # we'll just run the DDL. Ideally down_revision should be set to the previous.
    op.create_table('custom_commands',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('command_name', sa.String(length=100), nullable=False),
        sa.Column('output', sa.Text(), nullable=True),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_real_execution', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_custom_commands_command_name'), 'custom_commands', ['command_name'], unique=True)

def downgrade() -> None:
    op.drop_index(op.f('ix_custom_commands_command_name'), table_name='custom_commands')
    op.drop_table('custom_commands')
