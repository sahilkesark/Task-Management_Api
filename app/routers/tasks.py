from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    TaskResponse
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


def get_owned_task(
    task_id: int,
    db: Session,
    current_user: User
):
    task = (
        db.query(Task)
        .join(Project, Task.project_id == Project.id)
        .filter(
            Task.id == task_id,
            Project.created_by == current_user.id
        )
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


def validate_assignee(assigned_to: int | None, db: Session):
    if assigned_to is None:
        return

    assigned_user = db.query(User).filter(
        User.id == assigned_to
    ).first()

    if assigned_user is None:
        raise HTTPException(
            status_code=404,
            detail="Assigned user not found"
        )


@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == task_data.project_id,
        Project.created_by == current_user.id
    ).first()

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    validate_assignee(task_data.assigned_to, db)

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        project_id=task_data.project_id,
        assigned_to=task_data.assigned_to
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = (
        db.query(Task)
        .join(Project, Task.project_id == Project.id)
        .filter(Project.created_by == current_user.id)
        .all()
    )

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_owned_task(task_id, db, current_user)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_owned_task(task_id, db, current_user)

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.priority is not None:
        task.priority = task_data.priority

    if task_data.status is not None:
        task.status = task_data.status

    if task_data.assigned_to is not None:
        validate_assignee(task_data.assigned_to, db)
        task.assigned_to = task_data.assigned_to

    db.commit()
    db.refresh(task)

    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_owned_task(task_id, db, current_user)
    task.status = status_data.status

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_owned_task(task_id, db, current_user)

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


