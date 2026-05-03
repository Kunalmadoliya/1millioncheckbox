# 🧩 1 Million Checkbox — Real-time Sync System

A simple real-time app where multiple users can interact with checkboxes and see updates instantly.

---

## ✨ Overview

This project shows how real-time systems work using:

- WebSockets (Socket.IO)
- Redis (Pub/Sub)
- Shared state across users

When one user clicks a checkbox, all other users see the change instantly.

---

## 🎯 Why I Built This

To understand how real-time systems work behind the scenes.

Things explored:
- How multiple users stay in sync  
- How Redis Pub/Sub works  
- How to scale WebSocket apps  
- How state is shared across servers  

---

## ⚙️ Features

### 🔁 Real-time Sync
- Instant updates across all clients  
- No page refresh needed  

### 🌐 Multi-user Support
- Multiple users can interact at the same time  
- All changes are reflected globally  

### ⚡ Backend System
- Node.js + Express server  
- Socket.IO for real-time communication  

### 🔄 Redis Integration
- Pub/Sub system for syncing state  
- Works across multiple server instances  

---

## 🧠 How It Works

```
User clicks checkbox  
→ Event sent to server  
→ Server publishes to Redis  
→ Redis broadcasts message  
→ All servers receive update  
→ Socket.IO updates all clients  
```

---

## 🏗️ Tech Stack

- Backend: Node.js + Express  
- Real-time: Socket.IO  
- Messaging: Redis (Valkey)  
- Frontend: HTML + CSS + JS  

---

## ⚠️ Current Limit

- Uses 1000 checkboxes (not 1 million yet)  
- Rendering too many DOM elements can crash browser  

---

## 🔮 Future Improvements

- Virtual rendering (for 1M checkboxes)  
- Canvas/WebGL rendering  
- Performance optimization  
- Deployment scaling  

---

## 📂 Project Structure

```
/backend
  server.js
  redis-connection.js

/public
  index.html
```

---

## 🚀 Setup

```bash
git clone https://github.com/your-username/1millioncheckbox
cd 1millioncheckbox
npm install
npm start
```

---

## 🧪 How to Test

1. Open app in multiple tabs  
2. Click any checkbox  
3. Watch all tabs update instantly  

---

## 👨‍💻 Author

Kunal Madoliya  
B.Tech IT — Backend & Systems  

---

## ⭐ Support

If you found this useful, give it a star ⭐