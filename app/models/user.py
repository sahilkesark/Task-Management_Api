from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False, default="member")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    projects = relationship(
        "Project",
        back_populates="creator"
    )

    assigned_tasks = relationship(
        "Task",
        back_populates="assignee"
    )