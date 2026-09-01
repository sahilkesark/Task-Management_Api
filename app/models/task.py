from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    priority = Column(
        String(20),
        nullable=False,
        default="medium"
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # Relationships
    project = relationship(
        "Project",
        back_populates="tasks"
    )

    assignee = relationship(
        "User",
        back_populates="assigned_tasks"
    )