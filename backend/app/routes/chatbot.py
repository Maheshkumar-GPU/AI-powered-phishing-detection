from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse
from app.models import ChatMessage
from app.ollama.client import ollama_client
from app.utils.logger import logger
from datetime import datetime, timezone

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatResponse)
async def send_message(payload: ChatRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id.strip()
    user_text = payload.message.strip()

    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_msg = ChatMessage(session_id=session_id, role="user", content=user_text)
    db.add(user_msg)
    db.commit()

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
        .all()
    )
    history.reverse()
    messages = [{"role": m.role, "content": m.content} for m in history]

    logger.info(f"Chat [{session_id}]: {user_text[:60]}...")
    assistant_text = await ollama_client.chat(messages)

    assistant_msg = ChatMessage(
        session_id=session_id, role="assistant", content=assistant_text
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        session_id=session_id,
        role="assistant",
        content=assistant_text,
        created_at=assistant_msg.created_at,
    )


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {"role": m.role, "content": m.content, "created_at": m.created_at}
        for m in messages
    ]


@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str, db: Session = Depends(get_db)):
    deleted = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .delete()
    )
    db.commit()
    return {"deleted": deleted}
