# 💎 MinePanel - Minecraft Server Web Store

A lightweight, secure, and highly customizable web store and admin panel for Minecraft servers. Built with modern web technologies, it allows server owners to easily monetize their projects, manage products, and deliver items to players automatically.

---

## ✨ Features

- 🛒 **Shopping Cart System:** Smooth, modern cart with automatic player skin rendering (via Minotar API).
- 📦 **Product Management:** Create items, assign commands, set discounts, and group them by categories.
- 🎟️ **Promo Codes:** Flexible discount system with usage limits and expiration dates.
- ⚡ **Automatic Delivery:** Built-in RCON integration to automatically execute console commands upon purchase.
- 🔔 **Discord Webhooks:** Get instant notifications about new purchases directly in your Discord server.
- 🖼️ **Highly Customizable:** Change backgrounds (supports images and live video wallpapers), branding, and social links right from the admin panel.
- 📊 **Dashboard & Stats:** Track your revenue, recent purchases, and server online status in real-time.
- 🌐 **Multilingual:** Frontend supports English, Ukrainian, and Russian out of the box.
- 🔒 **Secure:** Built-in rate limiting, JWT authentication, CSRF protection, and secure file uploads.
- 🎛️ **In-App Security Controls:** Change your admin username and password, or toggle CSRF protection on/off directly from the dashboard UI without touching the code.

---

## 🛠 Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** SQLite (default) / MySQL / PostgreSQL supported
- **Frontend:** HTML, JavaScript (Vanilla), Tailwind CSS
- **Icons:** Lucide Icons

---

## ❓ Troubleshooting & Common Issues

**🔴 Error: `403 Forbidden` or "CSRF blocked" when creating items/categories**
- **Cause:** Your browser's URL doesn't match the allowed origin in the backend security settings.
- **Solution:** Open your `.env` file and make sure `ALLOWED_ORIGIN` exactly matches the URL you use in your browser (e.g., `ALLOWED_ORIGIN=http://127.0.0.1:8000`). Alternatively, you can temporarily turn off CSRF protection in the **Security** tab of the Admin Panel.

**🔴 Error: Cannot log in to the Admin Panel (`401 Unauthorized`)**
- **Cause:** Incorrect credentials or your password is too short.
- **Solution:** Check your `.env` file. The `ADMIN_PASS` must be **at least 12 characters long** for security reasons. After changing anything in the `.env` file, always restart your server (`Ctrl+C` then `uvicorn main:app --reload`).

**🔴 Error: Images or Video Backgrounds won't upload**
- **Solution:** The maximum allowed file size is 50MB. Ensure your file is in a supported format (`.jpg`, `.png`, `.gif`, `.webp`, `.mp4`, `.webm`) and that your server has write permissions for the `static/uploads` directory.

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/TheJumer/MinePanel.git
cd MinePanel
```

---

### 2. Install dependencies

Make sure you have Python 3.9+ installed.

```bash
pip install -r requirements.txt
```

---

### 3. Environment Configuration

Rename `.env.example` to `.env` and fill in your secure details:

```env
JWT_SECRET=your_super_secret_32_characters_long_string

ADMIN_USER=admin
ADMIN_PASS=your_strong_password
```

---

### 4. Run the server

```bash
cd app
uvicorn main:app --reload
```

---

### 5. Access the store

- **Store frontend:** http://127.0.0.1:8000
- **Admin Panel:** http://127.0.0.1:8000/admin

---

## 📄 License

This project is open-source and available under the MIT License.

Not an official Minecraft product. Not approved by or associated with Mojang.
