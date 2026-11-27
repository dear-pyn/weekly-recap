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
| `scripts/cleanup-gifs.mjs` · `.github/workflows/cleanup-gifs.yml` | ลบ GIF เก่ากว่า 90 วัน ทุกสัปดาห์ |
| `avatars/` | รูปสมาชิก (ชื่อไฟล์ตาม key ใน `MEMBERS` ของ `index.html`) |

## เพิ่ม/แก้สมาชิก

แก้ `MEMBERS` ใน `index.html` แล้ววางรูป `avatars/<key>.webp`

## ประหยัดโควตา Supabase free plan

- GIF ไม่เกิน 5 MB ต่อไฟล์ · เบราว์เซอร์จำไฟล์ไว้ 1 ปี (เปิดบอร์ดซ้ำไม่ดาวน์โหลดใหม่)
- ลบ GIF ที่เก่ากว่า 90 วันทุกวันจันทร์ ด้วย GitHub Action `Cleanup old GIFs` (ข้อความยังอยู่ การ์ดขึ้นว่า "GIF ถูกลบไปแล้ว")
  - ต้องตั้ง secret ก่อน: repo → Settings → Secrets and variables → Actions → New repository secret
    ชื่อ `SUPABASE_SERVICE_KEY` · ค่า = secret key ของ project weekly-recap (Supabase → Project Settings → API Keys)
  - ยังไม่ตั้ง = Action ข้ามไปเฉย ๆ ไม่ลบอะไร
  - ลองนับก่อนลบ: Actions → Cleanup old GIFs → Run workflow (dry run ติ๊กไว้)
- Free plan หยุด project ถ้าไม่มีคนใช้ราว 1 สัปดาห์ → เข้า Supabase dashboard กด Restore (ข้อมูลไม่หาย)

## ข้อควรรู้

- ทุกคนที่มีลิงก์อ่าน เขียน และลบข้อมูลได้ (ตั้งใจให้ไม่ต้องล็อกอิน) อย่าใส่ข้อมูลลับ
- "ฉันคือ" เลือกชื่อเอง ระบบไม่ได้ยืนยันตัวตน
- ข้อมูลเก่าจากบอร์ดบน claude.ai ไม่ได้ย้ายมาอัตโนมัติ
