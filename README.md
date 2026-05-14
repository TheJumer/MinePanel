# 💎 MinePanel - Minecraft Server Web Store

A lightweight, secure, and highly customizable web store and admin panel for Minecraft servers. Built with modern web technologies, it allows server owners to easily monetize their projects, manage products, and deliver items to players automatically.

## ✨ Features

- **🛒 Shopping Cart System**: Smooth, modern cart with automatic player skin rendering (via Minotar API).
- **📦 Product Management**: Create items, assign commands, set discounts, and group them by categories.
- **🎟️ Promo Codes**: Flexible discount system with usage limits and expiration dates.
- **🔌 Automatic Delivery**: Built-in RCON integration to automatically execute console commands upon purchase.
- **🔔 Discord Webhooks**: Get instant notifications about new purchases directly in your Discord server.
- **🎨 Highly Customizable**: Change backgrounds (supports images and live video wallpapers), branding, and social links right from the admin panel.
- **📊 Dashboard & Stats**: Track your revenue, recent purchases, and server online status in real-time.
- **🌐 Multilingual**: Frontend supports English, Ukrainian, and Russian out of the box.
- **🛡️ Secure**: Built-in rate limiting, JWT authentication, CSRF protection, and secure file uploads.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (default) / MySQL / PostgreSQL supported
- **Frontend**: HTML, JavaScript (Vanilla), Tailwind CSS
- **Icons**: Lucide Icons

## 🚀 Installation & Setup

**1. Clone the repository:**
bash
git clone https://github.com/TheJumer/MinePanel.git
cd MinePanel
2. Install dependencies:

Make sure you have Python 3.9+ installed.

Bash
pip install -r requirements.txt
3. Environment Configuration:

Rename .env.example to .env and fill in your secure details:
JWT_SECRET=your_super_secret_32_characters_long_string
ADMIN_USER=admin
ADMIN_PASS=your_strong_password
4. Run the server:

Bash
cd app
uvicorn main:app --reload
5. Access the store:
Store frontend: http://127.0.0.1:8000
Admin Panel: http://127.0.0.1:8000/admin

📄 License
This project is open-source and available under the MIT License. Not an official Minecraft product. Not approved by or associated with Mojang.
