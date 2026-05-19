"""
MinePanel — захищений main.py
Всі патчі безпеки застосовані + виправлено вихід і створення товару.
Додано можливість керувати безпекою (CSRF та паролі) з адмін-панелі.
"""

import httpx
import logging
import os
import re
import uuid
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv, set_key
from fastapi import (
    FastAPI, Depends, HTTPException, Request, Response,
    UploadFile, File
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field, validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from sqlalchemy import func
import jwt
import html

import database
import rcon_client

# ═══════════════════════════════════════════════════════════
# КОНФІГУРАЦІЯ ЛОГУВАННЯ
# ═══════════════════════════════════════════════════════════
LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "security.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("minepanel")

# ═══════════════════════════════════════════════════════════
# ЗАВАНТАЖЕННЯ .ENV
# ═══════════════════════════════════════════════════════════
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ═══════════════════════════════════════════════════════════
# КРИТИЧНА ПЕРЕВІРКА СЕКРЕТІВ
# ═══════════════════════════════════════════════════════════
JWT_SECRET = os.getenv("JWT_SECRET", "")
if len(JWT_SECRET) < 32:
    raise RuntimeError(
        "❌ JWT_SECRET не встановлено або коротший за 32 символи.\n"
        "Згенеруй: python -c \"import secrets; print(secrets.token_hex(32))\"\n"
        "Додай у .env: JWT_SECRET=<результат>"
    )

ADMIN_USER = os.getenv("ADMIN_USER", "")
ADMIN_PASS = os.getenv("ADMIN_PASS", "")
if not ADMIN_USER or not ADMIN_PASS:
    raise RuntimeError("❌ ADMIN_USER або ADMIN_PASS не встановлено в .env!")
if len(ADMIN_PASS) < 12:
    raise RuntimeError("❌ ADMIN_PASS занадто короткий (мін. 12 символів)!")

ALGORITHM = "HS256"
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")   

# ═══════════════════════════════════════════════════════════
# КОНСТАНТИ ЗАВАНТАЖЕННЯ ФАЙЛІВ
# ═══════════════════════════════════════════════════════════
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm"}
MAX_FILE_BYTES = 50 * 1024 * 1024   # 50 MB

IMAGE_SIGNATURES = {
    b"\xff\xd8\xff": "jpeg",
    b"\x89PNG": "png",
    b"GIF8": "gif",
    b"RIFF": "webp",
    b"\x00\x00\x00": "mp4",
    b"\x1aE\xdf\xa3": "webm"
}

PLAYER_RE = re.compile(r'^[a-zA-Z0-9_]{3,16}$')

# ═══════════════════════════════════════════════════════════
# ІНІЦІАЛІЗАЦІЯ FASTAPI
# ═══════════════════════════════════════════════════════════
app = FastAPI(title="MinePanel API", docs_url=None, redoc_url=None)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

if ALLOWED_ORIGIN:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[ALLOWED_ORIGIN],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# ═══════════════════════════════════════════════════════════
# SECURITY HEADERS MIDDLEWARE
# ═══════════════════════════════════════════════════════════
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if "server" in response.headers:
        del response.headers["server"]
    return response

# ═══════════════════════════════════════════════════════════
# PYDANTIC МОДЕЛІ З ВАЛІДАЦІЄЮ
# ═══════════════════════════════════════════════════════════
DANGEROUS_CMD_CHARS = [";", "&&", "||", "`", "$(", "\n", "\r", "|"]

def _validate_command(v: str) -> str:
    for ch in DANGEROUS_CMD_CHARS:
        if ch in v:
            raise ValueError(f"Команда містить заборонений символ: {ch!r}")
    return v

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    price: float
    command: str = Field(..., min_length=1, max_length=300)
    icon_url: str = Field(..., max_length=500)
    category_id: Optional[int] = None

    @validator("price")
    def price_positive(cls, v):
        if v <= 0:
            raise ValueError("Ціна має бути більше 0")
        return round(v, 2)

    @validator("command")
    def command_safe(cls, v):
        return _validate_command(v)

class ProductUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    price: float
    command: str = Field(..., min_length=1, max_length=300)
    icon_url: str = Field(..., max_length=500)
    discount_price: Optional[float] = None
    category_id: Optional[int] = None

    @validator("price")
    def price_positive(cls, v):
        if v <= 0:
            raise ValueError("Ціна має бути більше 0")
        return round(v, 2)

    @validator("discount_price")
    def discount_valid(cls, v, values):
        if v is not None:
            if v <= 0:
                raise ValueError("Ціна зі знижкою має бути більше 0")
            if "price" in values and v >= values["price"]:
                raise ValueError("Знижка має бути меншою за звичайну ціну")
            return round(v, 2)
        return v

    @validator("command")
    def command_safe(cls, v):
        return _validate_command(v)

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class PromoCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=30)
    discount_percent: int = Field(..., ge=1, le=99)
    max_uses: int = Field(default=0, ge=0)
    expires_at: Optional[datetime] = None

class CartItem(BaseModel):
    id: int = Field(..., ge=1)

class BuyCartRequest(BaseModel):
    player_name: str = Field(..., min_length=3, max_length=16)
    items: List[CartItem] = Field(..., min_items=1, max_items=20)
    promocode: Optional[str] = Field(default=None, max_length=30)

class TestDeliveryRequest(BaseModel):
    player_name: str = Field(..., min_length=3, max_length=16)
    product_id: int = Field(..., ge=1)

# Моделі для безпеки
class CredentialsUpdate(BaseModel):
    username: str
    password: str

class CSRFUpdate(BaseModel):
    enabled: bool

# ═══════════════════════════════════════════════════════════
# ДОПОМІЖНІ ФУНКЦІЇ
# ═══════════════════════════════════════════════════════════
def validate_player_name(name: str) -> str:
    name = name.strip()
    if not PLAYER_RE.match(name):
        raise HTTPException(status_code=400, detail="Невалідний нікнейм. Лише латиниця, цифри та _ (3–16 символів).")
    return name

def is_valid_image_bytes(data: bytes) -> bool:
    for sig in IMAGE_SIGNATURES:
        if data[:len(sig)] == sig:
            return True
    return False

def get_setting_value(db: Session, key: str, default: str = "") -> str:
    s = db.query(database.Setting).filter(database.Setting.key == key).first()
    if not s:
        s = database.Setting(key=key, value=default)
        db.add(s)
        db.commit()
    return s.value

# ═══════════════════════════════════════════════════════════
# АУТЕНТИФІКАЦІЯ
# ═══════════════════════════════════════════════════════════
def is_authenticated(request: Request) -> bool:
    token = request.cookies.get("admin_session")
    if not token:
        return False
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return True
    except jwt.ExpiredSignatureError:
        logger.warning(f"[AUTH] Прострочений токен — IP {request.client.host}")
        return False
    except Exception:
        return False

def verify_admin(request: Request):
    if not is_authenticated(request):
        raise HTTPException(status_code=401, detail="Не авторизовано")
    
    # ПЕРЕВІРКА ТУМБЛЕРА CSRF
    csrf_enabled = os.getenv("ENABLE_CSRF", "true").lower() == "true"
    if csrf_enabled and ALLOWED_ORIGIN:
        origin = request.headers.get("origin", "")
        if origin and not origin.startswith(ALLOWED_ORIGIN):
            raise HTTPException(status_code=403, detail="CSRF заблоковано")
            
    return True

# ═══════════════════════════════════════════════════════════
# DISCORD WEBHOOK
# ═══════════════════════════════════════════════════════════
async def send_discord_log(db: Session, player: str, product_name: str, price: float):
    if get_setting_value(db, "discord_enabled") != "true": return
    webhook_url = get_setting_value(db, "discord_webhook")
    if not webhook_url.startswith("https://discord.com/api/webhooks/"): return
    
    bot_name = get_setting_value(db, "discord_name", "MineStore Bot")[:80]
    title_tpl = get_setting_value(db, "discord_title", "🎉 Нова покупка!")
    desc_tpl = get_setting_value(db, "discord_desc", "Гравець **{player}** придбав **{product}** за **{price} ₴**")
    try: color = int(get_setting_value(db, "discord_color", "5814783"))
    except ValueError: color = 5814783

    description = desc_tpl.replace("{player}", player).replace("{product}", product_name).replace("{price}", str(price))
    payload = {
        "username": bot_name,
        "embeds": [{
            "title": title_tpl[:256],
            "description": description[:2048],
            "color": color,
            "timestamp": datetime.utcnow().isoformat(),
            "thumbnail": {"url": f"https://minotar.net/helm/{player}/100.png"},
        }],
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client: await client.post(webhook_url, json=payload)
    except Exception as exc: pass

# ═══════════════════════════════════════════════════════════
# ПУБЛІЧНІ ЕНДПОІНТИ
# ═══════════════════════════════════════════════════════════
@app.get("/api/products")
def get_products(db: Session = Depends(database.get_db)):
    return db.query(database.Product).all()

@app.get("/api/categories")
def get_categories(db: Session = Depends(database.get_db)):
    return db.query(database.Category).all()

@app.get("/api/recent_purchases")
def get_recent_purchases(db: Session = Depends(database.get_db)):
    rows = db.query(database.Purchase, database.Product).join(database.Product, database.Purchase.product_id == database.Product.id).filter(database.Purchase.status == "completed").order_by(database.Purchase.created_at.desc()).limit(15).all()
    return [{"player": r.Purchase.player_name, "icon": r.Product.icon_url} for r in rows]

@app.post("/api/buy_cart")
@limiter.limit("10/minute")
async def buy_cart(request: Request, req: BuyCartRequest, db: Session = Depends(database.get_db)):
    player = validate_player_name(req.player_name)
    discount_mult = 1.0
    if req.promocode:
        safe_code = re.sub(r'[^A-Z0-9_\-]', '', req.promocode.upper())[:30]
        promo = db.query(database.Promocode).filter(database.Promocode.code == safe_code, database.Promocode.is_active == True).first()
        if promo:
            valid = True
            if promo.expires_at and promo.expires_at < datetime.utcnow(): valid = False
            if promo.max_uses > 0 and promo.uses >= promo.max_uses: valid = False
            if valid:
                discount_mult = (100 - promo.discount_percent) / 100
                promo.uses += 1

    method = get_setting_value(db, "delivery_method", "rcon")
    r_ip = get_setting_value(db, "rcon_ip", "127.0.0.1")
    r_port_str = get_setting_value(db, "rcon_port", "25575")
    r_pass = get_setting_value(db, "rcon_password", "")

    try: r_port = int(r_port_str)
    except ValueError: r_port = 25575

    seen_ids: set = set()
    for item in req.items:
        if item.id in seen_ids: continue
        seen_ids.add(item.id)
        product = db.query(database.Product).filter(database.Product.id == item.id).first()
        if not product: continue

        final_price = round((product.discount_price or product.price) * discount_mult, 2)
        cmd = product.command.replace("{player}", player)
        status = "pending"

        if method == "rcon":
            try:
                if rcon_client.execute_rcon_command(cmd, r_ip, r_port, r_pass): status = "completed"
            except Exception as exc: pass

        db.add(database.Purchase(player_name=player, product_id=product.id, price_paid=final_price, status=status))
        if status == "completed": await send_discord_log(db, player, product.name, final_price)

    db.commit()
    return {"status": "success"}

# ═══════════════════════════════════════════════════════════
# АВТОРИЗАЦІЯ АДМІНА
# ═══════════════════════════════════════════════════════════
@app.post("/api/admin/login")
@limiter.limit("5/minute")
async def admin_login(request: Request, data: dict, response: Response):
    # Використовуємо змінні середовища напряму, оскільки вони могли змінитися
    current_admin = os.getenv("ADMIN_USER", "")
    current_pass = os.getenv("ADMIN_PASS", "")
    
    username = str(data.get("username", ""))[:100]
    password = str(data.get("password", ""))[:200]

    if username == current_admin and password == current_pass:
        token = jwt.encode({"sub": username, "exp": datetime.utcnow() + timedelta(hours=24)}, JWT_SECRET, algorithm=ALGORITHM)
        response.set_cookie(key="admin_session", value=token, httponly=True, samesite="strict", secure=os.getenv("COOKIE_SECURE", "true").lower() == "true", max_age=86400)
        return {"status": "success"}

    raise HTTPException(status_code=401, detail="Невірний логін або пароль")

@app.get("/api/admin/logout")
async def admin_logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("admin_session")
    return response

# ═══════════════════════════════════════════════════════════
# АДМІН — НАЛАШТУВАННЯ БЕЗПЕКИ (НОВЕ)
# ═══════════════════════════════════════════════════════════
@app.get("/api/admin/security/status")
async def get_security_status(a=Depends(verify_admin)):
    csrf_status = os.getenv("ENABLE_CSRF", "true").lower() == "true"
    return {"csrf_enabled": csrf_status}

@app.post("/api/admin/security/csrf")
async def update_csrf_status(data: CSRFUpdate, a=Depends(verify_admin)):
    val = "true" if data.enabled else "false"
    env_path = BASE_DIR / ".env"
    
    set_key(str(env_path), "ENABLE_CSRF", val)
    os.environ["ENABLE_CSRF"] = val
    
    return {"message": "Налаштування CSRF оновлено"}

@app.post("/api/admin/security/credentials")
async def update_credentials(data: CredentialsUpdate, a=Depends(verify_admin)):
    if len(data.password) < 12:
        raise HTTPException(status_code=400, detail="Пароль має бути мінімум 12 символів!")
        
    env_path = BASE_DIR / ".env"
    
    set_key(str(env_path), "ADMIN_USER", data.username)
    set_key(str(env_path), "ADMIN_PASS", data.password)
    
    os.environ["ADMIN_USER"] = data.username
    os.environ["ADMIN_PASS"] = data.password
    
    return {"message": "Дані доступу успішно оновлено!"}

# ═══════════════════════════════════════════════════════════
# АДМІН — СТАТИСТИКА
# ═══════════════════════════════════════════════════════════
@app.get("/api/admin/stats")
def get_stats(request: Request, search: Optional[str] = None, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    total_sales = db.query(func.sum(database.Purchase.price_paid)).filter(database.Purchase.status == "completed").scalar() or 0
    count_orders = db.query(database.Purchase).count()

    query = db.query(database.Purchase, database.Product.name).join(database.Product, database.Purchase.product_id == database.Product.id)
    if search:
        safe_search = search[:50]
        query = query.filter(database.Purchase.player_name.ilike(f"%{safe_search}%"))

    recent = query.order_by(database.Purchase.created_at.desc()).limit(10).all()
    recent_purchases = [{"id": p.Purchase.id, "player_name": p.Purchase.player_name, "product_name": p.name, "status": p.Purchase.status, "date": p.Purchase.created_at.strftime("%d.%m.%Y %H:%M")} for p in recent]
    return {"total_revenue": round(total_sales, 2), "total_orders": count_orders, "recent": recent_purchases}

# ═══════════════════════════════════════════════════════════
# АДМІН — НАЛАШТУВАННЯ
# ═══════════════════════════════════════════════════════════
ALLOWED_SETTING_KEYS = {
    "server_name", "server_ip", "delivery_method", "rcon_ip", "rcon_port", "rcon_password",
    "discord_enabled", "discord_webhook", "discord_name", "discord_color", "discord_title", "discord_desc",
    "site_title", "site_favicon", "site_logo", "hero_title", "hero_subtitle", "bg_type", "bg_url", "bg_blur",
    "dc_url", "dc_mode", "tg_url", "tg_mode", "yt_url", "yt_mode", "show_online", "max_online", "mc_version",
    "contact_email", "terms_text",
}
SENSITIVE_KEYS = {"rcon_password"}
MASK = "••••••••"

@app.get("/api/admin/settings")
def get_settings(db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    result = {}
    for s in db.query(database.Setting).all():
        if s.key in SENSITIVE_KEYS: result[s.key] = MASK if s.value else ""
        else: result[s.key] = s.value
    return result

@app.post("/api/admin/settings")
def save_settings(data: dict, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    for k, v in data.items():
        if k not in ALLOWED_SETTING_KEYS: continue
        str_v = str(v)[:2000]
        if k in SENSITIVE_KEYS and str_v.startswith("••"): continue
        if k == "discord_webhook" and str_v and not str_v.startswith("https://discord.com/api/webhooks/"): raise HTTPException(status_code=400, detail="Невалідний Discord webhook")
        if k == "rcon_port":
            try:
                port = int(str_v)
                if not (1 <= port <= 65535): raise ValueError
            except ValueError: raise HTTPException(status_code=400, detail="Невалідний RCON порт")

        s = db.query(database.Setting).filter(database.Setting.key == k).first()
        if s: s.value = str_v
        else: db.add(database.Setting(key=k, value=str_v))
    db.commit()
    return {"status": "success"}

# ═══════════════════════════════════════════════════════════
# АДМІН — DB CONFIG
# ═══════════════════════════════════════════════════════════
@app.get("/api/admin/db_config")
def get_db_config(a=Depends(verify_admin)):
    raw = os.getenv("DB_URL", "")
    masked = re.sub(r'://([^:]+):([^@]+)@', r'://\1:••••••@', raw)
    return {"db_url": masked}

@app.post("/api/admin/db_config")
def save_db_config(data: dict, a=Depends(verify_admin)):
    db_url = str(data.get("db_url", ""))[:500]
    if db_url and not re.match(r'^(postgresql|mysql|sqlite)://', db_url): raise HTTPException(status_code=400, detail="Дозволені схеми: postgresql://, mysql://, sqlite://")
    env_path = BASE_DIR / ".env"
    lines = []
    found = False
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("DB_URL="):
                lines.append(f"DB_URL={db_url}")
                found = True
            else: lines.append(line)
    if not found: lines.append(f"DB_URL={db_url}")
    env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return {"status": "success", "message": "Збережено. Перезапусти сервер для застосування."}

# ═══════════════════════════════════════════════════════════
# АДМІН — ЗАВАНТАЖЕННЯ МЕДІА
# ═══════════════════════════════════════════════════════════
@app.post("/api/admin/upload")
@limiter.limit("30/minute")
async def upload_image(request: Request, file: UploadFile = File(...), a=Depends(verify_admin)):
    if not file.content_type or not (file.content_type.startswith("image/") or file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Дозволені лише медіафайли")

    original_ext = Path(file.filename or "").suffix.lower()
    if original_ext not in ALLOWED_EXTENSIONS: raise HTTPException(status_code=400, detail=f"Недозволений формат. Дозволені: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_BYTES: raise HTTPException(status_code=400, detail="Файл занадто великий (макс. 50 MB)")

    if not is_valid_image_bytes(content):
        raise HTTPException(status_code=400, detail="Файл не є дійсним медіа")

    safe_name = f"{uuid.uuid4().hex}{original_ext}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(content)
    return {"url": f"/static/uploads/{safe_name}"}

# ═══════════════════════════════════════════════════════════
# АДМІН — ПРОМОКОДИ, КАТЕГОРІЇ, ТОВАРИ
# ═══════════════════════════════════════════════════════════
@app.get("/api/admin/promocodes")
def get_promos(db: Session = Depends(database.get_db), a=Depends(verify_admin)): return db.query(database.Promocode).all()
@app.post("/api/admin/promocodes")
def add_promo(promo: PromoCreate, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    if db.query(database.Promocode).filter(database.Promocode.code == promo.code).first(): raise HTTPException(status_code=400, detail="Промокод з таким кодом вже існує")
    db.add(database.Promocode(**promo.dict()))
    db.commit()
    return {"status": "success"}
@app.delete("/api/admin/promocodes/{id}")
def del_promo(id: int, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    if not db.query(database.Promocode).filter(database.Promocode.id == id).delete(): raise HTTPException(status_code=404, detail="Не знайдено")
    db.commit()
    return {"status": "ok"}

@app.post("/api/admin/categories")
def add_category(cat: CategoryCreate, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    if db.query(database.Category).filter(database.Category.name == cat.name).first(): raise HTTPException(status_code=400, detail="Вже існує")
    db.add(database.Category(name=cat.name))
    db.commit()
    return {"status": "success"}
@app.delete("/api/admin/categories/{id}")
def del_category(id: int, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    if not db.query(database.Category).filter(database.Category.id == id).delete(): raise HTTPException(status_code=404, detail="Не знайдено")
    db.commit()
    return {"status": "ok"}

@app.post("/api/products")
def create_product(p: ProductCreate, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    db.add(database.Product(**p.dict()))
    db.commit()
    return {"status": "success"}
@app.put("/api/products/{id}")
def update_product(id: int, p: ProductUpdate, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    product = db.query(database.Product).filter(database.Product.id == id).first()
    if not product: raise HTTPException(status_code=404, detail="Товар не знайдено")
    for field, value in p.dict().items(): setattr(product, field, value)
    db.commit()
    return {"status": "success"}
@app.delete("/api/products/{id}")
def del_product(id: int, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    if not db.query(database.Product).filter(database.Product.id == id).delete(): raise HTTPException(status_code=404, detail="Не знайдено")
    db.commit()
    return {"status": "ok"}

@app.post("/api/admin/test_delivery")
def test_delivery(req: TestDeliveryRequest, db: Session = Depends(database.get_db), a=Depends(verify_admin)):
    player = validate_player_name(req.player_name)
    product = db.query(database.Product).filter(database.Product.id == req.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Товар не знайдено")
    method = get_setting_value(db, "delivery_method", "rcon")
    cmd = product.command.replace("{player}", player)
    if method == "rcon":
        r_ip = get_setting_value(db, "rcon_ip", "127.0.0.1")
        r_port = int(get_setting_value(db, "rcon_port", "25575"))
        r_pass = get_setting_value(db, "rcon_password", "")
        try:
            if rcon_client.execute_rcon_command(cmd, r_ip, r_port, r_pass): return {"status": "success", "message": "Команду успішно відправлено!"}
        except Exception as exc: pass
        raise HTTPException(status_code=500, detail="Помилка RCON. Перевір налаштування.")
    else:
        db.add(database.Purchase(player_name=player, product_id=product.id, price_paid=0.0, status="pending"))
        db.commit()
        return {"status": "success", "message": "Команду додано в чергу!"}

# ═══════════════════════════════════════════════════════════
# HTML СТОРІНКИ
# ═══════════════════════════════════════════════════════════
@app.get("/", response_class=HTMLResponse)
async def serve_store(request: Request, db: Session = Depends(database.get_db)):
    settings = {s.key: s.value for s in db.query(database.Setting).all()}
    server_name = settings.get("server_name", "MineStore")
    
    raw_hero_title = settings.get("hero_title", "Підтримай свій улюблений {server_name}")
    safe_title = html.escape(raw_hero_title)
    formatted_server_name = f"<span class='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400'>{server_name}</span>"
    final_hero_title = safe_title.replace("{server_name}", formatted_server_name)
    
    context = {
        "server_name": server_name,
        "server_ip": settings.get("server_ip", "play.yourserver.com"),
        "site_title": settings.get("site_title", "MineStore - Store"),
        "site_favicon": settings.get("site_favicon", "https://minotar.net/helm/Steve/32.png"),
        "site_logo": settings.get("site_logo", ""),
        "hero_title": final_hero_title,
        "hero_subtitle": settings.get("hero_subtitle", "Отримайте унікальні бонуси миттєво після оплати."),
        "bg_type": settings.get("bg_type", "color"),
        "bg_url": settings.get("bg_url", ""),
        "bg_blur": settings.get("bg_blur", "false"),
        "dc_url": settings.get("dc_url", ""), "dc_mode": settings.get("dc_mode", "none"),
        "tg_url": settings.get("tg_url", ""), "tg_mode": settings.get("tg_mode", "none"),
        "yt_url": settings.get("yt_url", ""), "yt_mode": settings.get("yt_mode", "none"),
        "show_online": settings.get("show_online", "false"),
        "max_online": settings.get("max_online", "100"),
        "mc_version": settings.get("mc_version", "1.16.5"),
        "contact_email": settings.get("contact_email", "admin@yourserver.com"),
        "terms_text": settings.get("terms_text", "1. Усі кошти йдуть на розвиток проєкту.\n2. Повернення коштів не передбачено.\n3. Адміністрація має право змінювати умови.")
    }
    return templates.TemplateResponse(request=request, name="index.html", context=context)

@app.get("/admin", response_class=HTMLResponse)
async def serve_admin(request: Request, db: Session = Depends(database.get_db)):
    if not is_authenticated(request):
        return RedirectResponse(url="/login")
    site_logo = get_setting_value(db, "site_logo", "")
    site_favicon = get_setting_value(db, "site_favicon", "")
    return templates.TemplateResponse(request=request, name="admin.html", context={"site_logo": site_logo, "site_favicon": site_favicon})

@app.get("/login", response_class=HTMLResponse)
async def serve_login(request: Request):
    if is_authenticated(request):
        return RedirectResponse(url="/admin")
    return templates.TemplateResponse(request=request, name="login.html")