import os
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DB_URL = os.getenv("DB_URL")

if DB_URL:
    engine = create_engine(DB_URL, pool_pre_ping=True)
else:
    DATA_DIR = BASE_DIR / "data"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{DATA_DIR / 'store.db'}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    discount_price = Column(Float, nullable=True)
    icon_url = Column(String, default="/static/uploads/default.png")
    command = Column(String)
    category_id = Column(Integer, nullable=True)

class Promocode(Base):
    __tablename__ = "promocodes"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount_percent = Column(Integer)
    max_uses = Column(Integer, default=0)
    uses = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

class Purchase(Base):
    __tablename__ = "purchases"
    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, index=True)
    product_id = Column(Integer)
    price_paid = Column(Float, default=0.0)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()

db = SessionLocal()

if not db.query(Category).first():
    db.add(Category(name="Загальне"))
    db.commit()

# --- ОНОВЛЕНІ СТАНДАРТНІ НАЛАШТУВАННЯ ---
defaults = {
    "server_name": "MineStore",
    "server_ip": "play.yourserver.com",
    "delivery_method": "rcon",
    "rcon_ip": "127.0.0.1", 
    "rcon_port": "25575", 
    "rcon_password": "",
    "discord_enabled": "false",
    "discord_webhook": "",
    "discord_name": "MineStore Bot",
    "discord_color": "5814783",
    "discord_title": "🎉 Нова покупка!",
    "discord_desc": "Гравець **{player}** придбав **{product}** за **{price} ₴**",
    "site_title": "MineStore - Store",
    "site_favicon": "https://minotar.net/helm/Steve/32.png",
    "site_logo": "", 
    "hero_title": "Підтримай свій улюблений {server_name}",
    "hero_subtitle": "Отримайте унікальні бонуси миттєво після оплати.",
    "bg_type": "color",
    "bg_url": "",
    "bg_blur": "false",
    "dc_url": "", "dc_mode": "none",
    "tg_url": "", "tg_mode": "none",
    "yt_url": "", "yt_mode": "none",
    # НОВІ НАЛАШТУВАННЯ (Онлайн, Контакти, Умови)
    "show_online": "false",
    "max_online": "100",
    "mc_version": "1.16.5",
    "contact_email": "admin@yourserver.com",
    "terms_text": "1. Усі кошти йдуть на розвиток проєкту.\n2. Повернення коштів не передбачено.\n3. Адміністрація має право змінювати умови."
}

for k, v in defaults.items():
    if not db.query(Setting).filter(Setting.key == k).first():
        db.add(Setting(key=k, value=v))
db.commit()
db.close()