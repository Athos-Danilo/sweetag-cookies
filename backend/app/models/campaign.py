from sqlalchemy import Column, Integer, Numeric, String, Boolean
from app.core.database import Base

class CampaignState(Base):
    __tablename__ = "campaign_states"

    id = Column(Integer, primary_key=True, index=True)
    total_goal = Column(Numeric(precision=10, scale=2), nullable=False, default=0.00)
    current_arrecadado = Column(Numeric(precision=10, scale=2), nullable=False, default=0.00)
    motivational_text = Column(String, nullable=True)
    show_publicly = Column(Boolean, default=True)
