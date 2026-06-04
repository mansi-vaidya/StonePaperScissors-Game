# 🎮 Rock Paper Scissors - Battle Arena

A modern full-stack Rock Paper Scissors game built with **Next.js**, **TypeScript**, **Spring Boot**, and **MySQL**. The game supports multiplayer gameplay, game history tracking, score management, and a responsive UI.

---

## 🚀 Features

- 🎯 Rock, Paper, Scissors gameplay
- 👥 Two Player Mode
- 🤖 Computer Mode
- 🏆 Winner Tracking
- 📜 Game History
- 💾 Database Storage using MySQL
- 🎨 Modern UI with Next.js & Tailwind CSS
- 🔊 Sound Effects
- 📱 Responsive Design

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React

### Backend
- Spring Boot
- Java 17
- Maven
- Spring Data JPA

### Database
- MySQL

---

## 📂 Project Structure

```text
StonePaperScissors-Game/
│
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   └── package.json
│
├── Backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
│
└── README.md
```

---

## ⚙️ Backend Setup

### 1. Open Backend Folder

```bash
cd Backend
```

### 2. Configure Database

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rpsdb
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

### 3. Run Backend

```bash
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

API Endpoint:

```text
http://localhost:8080/api/games
```

---

## ⚙️ Frontend Setup

### 1. Open Frontend Folder

```bash
cd Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

## 🔗 API Integration

Frontend communicates with Spring Boot Backend using:

```javascript
http://localhost:8080/api/games
```

---

## 📸 Screenshots

### Game Setup
- Player name selection
- Game mode selection

### Gameplay
- Real-time score updates
- Winner tracking

### History Panel
- Match history
- Round details
- Final winner display

---

## 👩‍💻 Author

**Mansi Vaidya**

- GitHub: https://github.com/mansi-vaidya
- LinkedIn: https://www.linkedin.com/in/mansi-vaidya/

---

## 📄 License

This project is created for learning and portfolio purposes.
