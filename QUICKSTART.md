# Quick Start Guide - AstroBharatAI Recruitment Platform

## ✅ What's Already Done

- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ Email configured (mohitdhanuka01@gmail.com)
- ✅ Code fixed (dependency conflicts resolved)

## 🚀 Next Steps

### 1. Install MongoDB

You have **2 options**:

#### Option A: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: **Windows, MSI installer**
   - Click **Download**

2. **Install**
   - Run the `.msi` file
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (GUI tool)
   - Click Install

3. **Verify Installation**
   ```powershell
   mongod --version
   ```
   If this works, you're good to go!

#### Option B: Use MongoDB Atlas (Cloud - Free)

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Get connection string
4. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astrobharatai_recruitment
   ```

### 2. Run the Application

**Option A: If using LOCAL MongoDB**

Open **3 terminals**:

**Terminal 1 - MongoDB** (if not running as service):
```powershell
mongod
```

**Terminal 2 - Backend**:
```powershell
cd server
npm start
```

**Terminal 3 - Frontend**:
```powershell
npm run dev
```

**Option B: If using MongoDB Atlas (Cloud)**

Just open **2 terminals** (no need for mongod):

**Terminal 1 - Backend**:
```powershell
cd server
npm start
```

**Terminal 2 - Frontend**:
```powershell
npm run dev
```

### 3. Test the Application

1. **Open browser**: http://localhost:5173
2. **Apply as candidate**: 
   - Fill form with YOUR email  
   - Check email for OTP
   - Upload a PDF resume
   - Submit
3. **Check results**:
   - If ATS score >= 70, check mohitdhanuka01@gmail.com for notification
   - Open MongoDB Compass to view data

## 📊 View Data in MongoDB Compass

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. Look for database: `astrobharatai_recruitment`
4. Collections:
   - **candidates** - All applications with scores
   - **otps** - Temporary OTP codes
   - **resumes.files** - Resume metadata

## 🆘 Troubleshooting

### MongoDB won't start
- Check if already running as Windows service
- Open Services app (Win + R → services.msc)
- Look for "MongoDB Server" → should be "Running"

### Backend errors
- Make sure MongoDB is running first
- Check `server/.env` has correct settings

### Frontend won't connect
- Make sure backend is running on port 5000
- Check browser console for errors

## 📧 Email Testing

Your Gmail is configured:
- **User**: mohitdhanuka01@gmail.com
- **App Password**: (already in .env)
- **HR Email**: mohitdhanuka01@gmail.com

Test by submitting a resume with good skills/experience to get 70+ score!

---

**Need help?** Check the detailed guides:
- `README.md` - Full documentation
- `MONGODB_SETUP.md` - MongoDB installation details
- `walkthrough.md` - Complete feature overview
