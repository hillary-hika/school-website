from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

def now(): return datetime.now(timezone.utc)
class User(db.Model):
    id=db.Column(db.Integer,primary_key=True); email=db.Column(db.String(255),unique=True,nullable=False,index=True); password_hash=db.Column(db.String(255),nullable=False); role=db.Column(db.String(30),default='admin'); active=db.Column(db.Boolean,default=True); created_at=db.Column(db.DateTime(timezone=True),default=now)
    def set_password(self,p): self.password_hash=generate_password_hash(p)
    def check_password(self,p): return check_password_hash(self.password_hash,p)
class Project(db.Model):
    id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(200),nullable=False); category=db.Column(db.String(80)); status=db.Column(db.String(50)); target=db.Column(db.Float,default=0); raised=db.Column(db.Float,default=0); description=db.Column(db.Text,nullable=False); update=db.Column(db.Text); image_url=db.Column(db.String(600)); published=db.Column(db.Boolean,default=True); created_at=db.Column(db.DateTime(timezone=True),default=now)
class News(db.Model):
    id=db.Column(db.Integer,primary_key=True); title=db.Column(db.String(250),nullable=False); category=db.Column(db.String(80)); body=db.Column(db.Text,nullable=False); published=db.Column(db.Boolean,default=True); created_at=db.Column(db.DateTime(timezone=True),default=now)
class Gallery(db.Model):
    id=db.Column(db.Integer,primary_key=True); title=db.Column(db.String(200),nullable=False); category=db.Column(db.String(80)); caption=db.Column(db.Text); image_url=db.Column(db.String(600),nullable=False); published=db.Column(db.Boolean,default=False); created_at=db.Column(db.DateTime(timezone=True),default=now)
class SponsorEnquiry(db.Model):
    id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); organization=db.Column(db.String(200)); email=db.Column(db.String(255),nullable=False); phone=db.Column(db.String(60)); support_area=db.Column(db.String(160)); message=db.Column(db.Text,nullable=False); status=db.Column(db.String(40),default='new'); created_at=db.Column(db.DateTime(timezone=True),default=now)
class SchoolSettings(db.Model):
    id=db.Column(db.Integer,primary_key=True); phone=db.Column(db.String(80)); email=db.Column(db.String(255)); paybill=db.Column(db.String(100)); facebook=db.Column(db.String(500)); whatsapp=db.Column(db.String(500)); address=db.Column(db.String(300),default='West Pokot County, Kenya'); updated_at=db.Column(db.DateTime(timezone=True),default=now,onupdate=now)
