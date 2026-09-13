"""Initial Phase 1, Phase 2, Phase 3 Migration (Users, Labs, Hints).

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-12 19:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('STUDENT', 'INSTRUCTOR', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Labs table
    op.create_table(
        'labs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('short_description', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.Enum('WEB', 'LINUX', 'NETWORK', 'API', 'CLOUD', 'FORENSICS', 'OSINT', 'MOBILE', name='labcategory'), nullable=False),
        sa.Column('difficulty', sa.Enum('EASY', 'MEDIUM', 'HARD', 'EXPERT', name='difficulty'), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'PUBLISHED', 'ARCHIVED', name='labstatus'), nullable=False),
        sa.Column('estimated_duration_minutes', sa.Integer(), nullable=False),
        sa.Column('learning_objectives', sa.JSON(), nullable=False),
        sa.Column('required_tools', sa.JSON(), nullable=False),
        sa.Column('author_id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_labs_slug'), 'labs', ['slug'], unique=True)
    op.create_index(op.f('ix_labs_title'), 'labs', ['title'], unique=False)

    # Lab Hints table
    op.create_table(
        'lab_hints',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('lab_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('hint_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['lab_id'], ['labs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_lab_hints_lab_id'), 'lab_hints', ['lab_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_lab_hints_lab_id'), table_name='lab_hints')
    op.drop_table('lab_hints')
    op.drop_index(op.f('ix_labs_title'), table_name='labs')
    op.drop_index(op.f('ix_labs_slug'), table_name='labs')
    op.drop_table('labs')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
