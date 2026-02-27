"""add_project_status_updates

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'd2e3f4a5b6c7'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Reuse existing projectstatus enum from projects table
    projectstatus_enum = sa.Enum('new', 'quoted', 'accepted', 'rejected', 'installed', name='projectstatus', create_type=False)
    op.create_table(
        'project_status_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('status', projectstatus_enum, nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('updated_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_project_status_updates_project_id', 'project_status_updates', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_project_status_updates_project_id', table_name='project_status_updates')
    op.drop_table('project_status_updates')
