# Database Setup Guide for X_Edge

## The Error You're Seeing

```
Error: getaddrinfo ENOTFOUND base
```

This happens because the `.env` file has a placeholder database URL. You need a **real PostgreSQL database** to run X_Edge locally.

---

## ⚡ Quick Fix (2 minutes)

### Option 1: Neon (Recommended - Easiest)

1. **Go to** [https://neon.tech](https://neon.tech)
2. **Sign up** (it's free)
3. **Create a new project** (click "Create Project")
4. **Copy the connection string** - it looks like:
   ```
   postgresql://user:password@ep-xyz-123.us-east-2.aws.neon.tech/neondb
   ```

### Option 2: Supabase

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign up** (free tier available)
3. **Create a new project**
4. **Go to Project Settings → Database**
5. **Copy the "Connection String" under "Connection pooling"**

### Option 3: Local PostgreSQL

If you have PostgreSQL installed locally:
```
postgresql://postgres:your_password@localhost:5432/x_edge
```

---

## 📝 Update Your .env File

1. **Open** `.env` in your X_Edge folder
2. **Replace** the placeholder with your real database URL:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

Example with Neon:
```env
DATABASE_URL=postgresql://neondb_owner:xyz123@ep-cool-name-123.us-east-2.aws.neon.tech/neondb
```

3. **Save** the file

---

## 🚀 Re-run the Startup Script

Now run the script again:

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

This time it should:
✅ Sync the database schema successfully
✅ Start the app on http://localhost:5000

---

## ✅ Verify It's Working

Open http://localhost:5000 in your browser. You should see:
- Dashboard page loads
- No database errors in console
- "Start Analysis" button available

---

## 🆘 Still Having Issues?

**Error: "Failed to connect"**
- Check your database URL is correct
- Make sure your database allows connections from your IP
- For Neon/Supabase, check that the project is active

**Error: "SSL required"**
- Some databases require SSL. Try adding `?sslmode=require` to your URL:
  ```
  postgresql://user:pass@host/db?sslmode=require
  ```

**Starting fresh?**
- Delete the `.env` file
- Re-run `start.bat` or `./start.sh`
- It will create a new placeholder .env for you to fill in
