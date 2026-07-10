# Task Manager Pro

Welcome to **Task Manager Pro**! This is a comprehensive, full-stack task management solution designed to provide a robust and intuitive user experience for managing personal and team tasks.

## 🚀 Features

- **User Authentication**: Secure user registration, login, and authorization.
- **Task Management**: Create, read, update, and delete (CRUD) tasks.
- **Prioritization**: Assign priority levels (e.g., Low, Medium, High) to tasks.
- **Responsive UI**: A modern, sleek, and responsive user interface built with React.
- **Robust Backend**: A scalable, layered architecture backend built with C# .NET.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Modern CSS / Vanilla CSS

### Backend
- **Framework**: ASP.NET Core
- **Language**: C# 11+
- **Architecture**: Clean Architecture / CQRS (Command Query Responsibility Segregation)
- **Database**: Entity Framework Core

## 📁 Project Structure

This repository is divided into two main sections:

1. **`/frontend`**: Contains the React application. Built with Vite and TypeScript.
2. **`/backend`**: Contains the C# .NET solution. Includes Domain, Application, and API layers.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- .NET 8.0 SDK (or the version specified in the backend project)
- A modern web browser

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Restore dependencies:
   ```bash
   dotnet restore TaskManager.slnx
   ```
3. Run the application:
   ```bash
   dotnet run --project src/TaskManager.Api
   ```
   *(Note: Adjust the project path based on the exact startup project name)*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the MIT License.
