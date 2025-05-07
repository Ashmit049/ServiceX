# ServiceX

# ServiceX – Job & Service Matching Platform

**ServiceX** is a web platform that connects service seekers (homeowners, businesses) with job seekers (plumbers, carpenters, cleaners, etc.). The platform offers dedicated interfaces for service seekers and job seekers with personalized dashboards, booking history, and application tracking.

## 🚀 Features

### 👤 User Authentication
- Firebase Authentication (email/password)
- Auto-redirect based on user role (service or job seeker)

### 🏠 Home Pages
- `home.html` – Dashboard for **Service Seekers**
- `home1.html` – Dashboard for **Job Seekers**

### 📄 User Profile Management
- Edit name, phone number, address, region, and skills
- Dynamic routing after login based on profile data

### 📅 Bookings & Applications
- Service seekers: view and manage their bookings
- Job seekers: view submitted applications and availability

### 🔐 Auth State Management
- Redirect to login if unauthenticated
- Logout function with session cleanup
  
## 🛠️ Technologies Used

- HTML, CSS, JavaScript
- Firebase Authentication
- Firebase Firestore (NoSQL)
- Tailwind CSS (optional)
- SweetAlert (optional for alerts)

## 🔧 Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ServiceX.git
cd ServiceX

