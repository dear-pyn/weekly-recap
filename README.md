# Maintain-D Weekly Retro

บอร์ด retro ประจำสัปดาห์ของทีม PEA Maintain-D: ลง GIF · ตอบคำถามประจำสัปดาห์ · ปลูก Oopsie Daisy · ส่งของขวัญขึ้น Hall of Fame

หน้าเว็บไฟล์เดียว (`index.html`) เปิดบน GitHub Pages ได้เลย ไม่ต้องล็อกอิน ข้อมูลเก็บใน Supabase

## ตั้งค่าครั้งแรก

1. สร้าง Supabase project ใหม่ (แยกจาก VMS Plus)
2. Supabase → SQL Editor → วางไฟล์ `schema.sql` แล้วกด Run
3. Supabase → Project Settings → API → คัดลอก Project URL กับ publishable (anon) key ใส่ใน `config.js`
   ห้ามใส่ service_role / secret key
4. GitHub → repo → Settings → Pages → Source: Deploy from a branch · Branch `main` · โฟลเดอร์ `/ (root)`

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าบอร์ดทั้งหมด (HTML · CSS · JS) |
| `store.js` | ต่อ Supabase ให้หน้าใช้ API แบบเดียวกับตอนอยู่บน claude.ai (`db` · `assets` · `user` · `downloads`) |
| `config.js` | URL และ publishable key ของ Supabase |
| `schema.sql` | ตาราง `retro_docs` + bucket `retro-gifs` + สิทธิ์ |
| `avatars/` | รูปสมาชิก (ชื่อไฟล์ตาม key ใน `MEMBERS` ของ `index.html`) |

## เพิ่ม/แก้สมาชิก

แก้ `MEMBERS` ใน `index.html` แล้ววางรูป `avatars/<key>.webp`

## ข้อควรรู้

- ทุกคนที่มีลิงก์อ่าน เขียน และลบข้อมูลได้ (ตั้งใจให้ไม่ต้องล็อกอิน) อย่าใส่ข้อมูลลับ
- "ฉันคือ" เลือกชื่อเอง ระบบไม่ได้ยืนยันตัวตน
- ข้อมูลเก่าจากบอร์ดบน claude.ai ไม่ได้ย้ายมาอัตโนมัติ
