import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile_number = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)
    brand_tone = Column(String, default="Aesthetic")
    role = Column(String, default="OWNER")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    drafts = relationship("Draft", back_populates="user")
    past_posts = relationship("PastPost", back_populates="user")

class Draft(Base):
    __tablename__ = "drafts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    tag = Column(String, default="General")
    version_no = Column(Integer, default=1)
    review_status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="drafts")
    versions = relationship("DraftVersion", back_populates="draft", cascade="all, delete-orphan")

class DraftVersion(Base):
    __tablename__ = "draft_versions"

    id = Column(String, primary_key=True, index=True)
    draft_id = Column(String, ForeignKey("drafts.id"))
    version_no = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    tag = Column(String, nullable=False)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    draft = relationship("Draft", back_populates="versions")

class PastPost(Base):
    __tablename__ = "past_posts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    platform = Column(String, nullable=False)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    posted_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="past_posts")

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(String, primary_key=True, index=True)
    draft_id = Column(String, ForeignKey("drafts.id"))
    user_id = Column(String, ForeignKey("users.id"))
    platform = Column(String, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, default="PENDING")
    auto_publish = Column(Boolean, default=False)
    formatted_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
