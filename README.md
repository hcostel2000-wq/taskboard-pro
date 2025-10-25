# 🚀 TaskBoard Pro - Ghid Deployment Vercel

Aplicație profesională de management taskuri pentru echipe, construită cu **Next.js 14** + **Supabase**.

---

## ✨ Features

✅ **Multi-user** - Toată echipa poate accesa simultan  
✅ **Roluri** - Editor (poate modifica) sau Viewer (doar vizualizare)  
✅ **Kanban Board** - Drag & Drop între coloane  
✅ **Checklist** - Cu deadline-uri și mutare automată  
✅ **Assignments** - Asignează taskuri la membrii echipei  
✅ **Dashboard** - Vizualizare taskuri personale  
✅ **Real-time** - Actualizări instant  
✅ **Responsive** - Funcționează pe mobile  

---

## 📋 Cerințe

- Cont **GitHub** (gratuit)
- Cont **Vercel** (gratuit)
- **Supabase** deja configurat (ai deja asta ✅)

---

## 🚀 PAS 1: Pregătire Cod

### 1.1 Extrage arhiva

Extrage fișierul `taskboard-app.zip` pe desktop.

### 1.2 Creează fișierul .env.local

În folder-ul `taskboard-app`, creează un fișier numit `.env.local` și adaugă:

```
NEXT_PUBLIC_SUPABASE_URL=https://xemfajxizokzwuagomgt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbWZhanhpem9rend1YWdvbWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTU2NjMsImV4cCI6MjA3Njg5MTY2M30.O5vyp_VvbPqn-7KWpb2SFwRiVzK1nAbIoWX4V2Y0T2o
```

**IMPORTANT:** Păstrează cheile tale private! Nu le partaja pe GitHub public!

---

## 🔧 PAS 2: Upload pe GitHub

### 2.1 Creează cont GitHub

Mergi la https://github.com și creează cont gratuit (dacă nu ai deja).

### 2.2 Creează repository nou

1. Click **"+"** (dreapta-sus) → **"New repository"**
2. Nume: `taskboard-pro`
3. Descriere: "Professional task management app"
4. **Private** (recomandat) sau Public
5. **NU** adăuga README, .gitignore
6. Click **"Create repository"**

### 2.3 Upload cod

**Opțiunea A - Drag & Drop (Simplu):**

1. În GitHub repo, click **"uploading an existing file"**
2. **Trage toate fișierele** din folder-ul `taskboard-app`
3. **NU** include `.env.local` (păstrează-l local!)
4. Scroll jos → Commit message: "Initial commit"
5. Click **"Commit changes"**

**Opțiunea B - Git Command Line:**

```bash
cd taskboard-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TauUsername/taskboard-pro.git
git push -u origin main
```

---

## ☁️ PAS 3: Deploy pe Vercel

### 3.1 Creează cont Vercel

1. Mergi la https://vercel.com
2. Click **"Sign Up"**
3. **"Continue with GitHub"** (recomand at)
4. Autorizează Vercel

### 3.2 Import project

1. În dashboard Vercel, click **"Add New..."** → **"Project"**
2. Găsește `taskboard-pro` în listă
3. Click **"Import"**

### 3.3 Configurare

1. **Project Name:** `taskboard-pro` (sau altul)
2. **Framework Preset:** Next.js (detectat automat)
3. **Root Directory:** `./` (default)
4. **Environment Variables:** ⚠️ **IMPORTANT!**
   - Click **"Add Environment Variables"**
   - Adaugă:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://xemfajxizokzwuagomgt.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbWZhanhpem9rend1YWdvbWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTU2NjMsImV4cCI6MjA3Njg5MTY2M30.O5vyp_VvbPqn-7KWpb2SFwRiVzK1nAbIoWX4V2Y0T2o
     ```

5. Click **"Deploy"**

### 3.4 Așteaptă build

- Durează ~2-3 minute
- Vei vedea log-uri în timp real
- Când e gata: **"Congratulations! 🎉"**

---

## 🎉 PAS 4: Accesează Aplicația

### 4.1 Link-ul tău

Vercel îți dă un link de tipul:
```
https://taskboard-pro.vercel.app
```

**SAU** cu username-ul tău:
```
https://taskboard-pro-tau.vercel.app
```

### 4.2 Testare

1. Deschide link-ul
2. **Sign Up** - creează cont
3. Verifică emailul (Supabase trimite link confirmare)
4. **Login** cu noul cont
5. Creează proiect test
6. Adaugă task
7. **Invită** alți membri (după ce ei își creează conturi)

---

## 👥 PAS 5: Adaugă Echipa

### 5.1 Creează conturi pentru echipă

Fiecare membru al echipei:

1. Merge la link-ul tău Vercel
2. Click **"Creează cont nou"**
3. Email + Parolă (min 6 caractere)
4. Verifică emailul
5. Login

### 5.2 Invită în proiecte

Tu (owner-ul proiectului):

1. Intră în proiect
2. Click **"📧 Invită"**
3. Selectează membru
4. Alege **rol**:
   - **Editor** = Poate modifica tot
   - **Viewer** = Doar vizualizează
5. Click **"Invită"**

### 5.3 Invite beneficiari (clienți)

Pentru clienți care vor doar să vadă progresul:

1. Cere-le să creeze cont (Sign Up)
2. Invită-i cu rol **"Viewer"**
3. Ei văd tot, dar nu pot modifica nimic

---

## 🔧 Actualizări Viitoare

Când vrei să modifici ceva:

### Opțiunea 1 - GitHub Desktop (Recomandat):

1. Instalează **GitHub Desktop**
2. Clone repository-ul local
3. Modifică fișierele
4. Commit + Push
5. **Vercel re-deploy automat!** ⚡

### Opțiunea 2 - Direct în GitHub:

1. Mergi pe GitHub → repository
2. Click pe fișier → Edit (icon creion)
3. Salvează (Commit)
4. **Vercel re-deploy automat!** ⚡

---

## 🎯 Use Cases

### Exemplu 1: Proiect Construcție

**Echipa (5 persoane) = Editors:**
- Manager proiect
- Inginer șef
- Electrician
- Instalator
- Arhitect

**Beneficiar = Viewer:**
- Client (dezvoltator imobiliar)

**Workflow:**
1. Manager creează proiect "Bloc A - Fundații"
2. Invită echipa ca **Editors**
3. Invită clientul ca **Viewer**
4. Echipa creează taskuri, assignments, checklist
5. Clientul vede progres în timp real

### Exemplu 2: Proiect Website

**Echipa = Editors:**
- Project Manager
- Designer
- Developer
- Tester

**Beneficiar = Viewer:**
- Client (compania care a comandat site-ul)

---

## ❓ Troubleshooting

### Problema 1: Nu se încarcă aplicația

**Soluție:**
- Verifică că ai adăugat **Environment Variables** în Vercel
- Redeploy: Vercel dashboard → Project → Deployments → Latest → ... → Redeploy

### Problema 2: Erori la login

**Soluție:**
- Verifică că RLS e dezactivat în Supabase (ai făcut asta deja)
- Verifică că cheile Supabase sunt corecte

### Problema 3: Nu pot invita utilizatori

**Soluție:**
- Utilizatorii trebuie să creeze cont mai întâi prin Sign Up
- Nu poți invita email-uri care nu au cont

### Problema 4: Vreau domeniu custom

**Soluție:**
1. Cumpără domeniu (ex: GoDaddy, Namecheap)
2. În Vercel: Settings → Domains
3. Adaugă domeniul tău
4. Configurează DNS (Vercel îți arată cum)

---

## 🆘 Suport

**Ai probleme?**

1. Verifică log-urile în Vercel (Deployments → View Function Logs)
2. Verifică Console browser-ului (F12 → Console)
3. Verifică că toate variabilele de environment sunt setate

**Vrei modificări?**

Contactează-mă și îți ajut!

---

## 🎉 Succes!

Acum ai o aplicație profesională, hostată online, accesibilă de toată echipa!

**Link-ul tău:** `https://taskboard-pro-{username}.vercel.app`

Distribuie link-ul către echipă și începe să lucrați! 🚀

---

## 📝 Licență

Acest proiect este pentru uz personal/comercial. Modifică-l cum vrei!
