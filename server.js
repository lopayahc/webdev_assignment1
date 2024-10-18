const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json()); // ทำให้ API สามารถรับข้อมูลแบบ JSON ได้

// URLs ของ servers ภายนอก
const CONFIG_SERVER_URL = 'https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec';
const LOG_SERVER_URL = 'https://app-tracking.pockethost.io/api/collections/drone_logs/records';

// GET /configs/:id
app.get('/configs/:id', async (req, res) => {
  try {
    const { id } = req.params; // รับ drone_id จาก URL
    const response = await axios.get(`${CONFIG_SERVER_URL}?drone_id=${id}`); // เรียก API server1
    let config = response.data;

    // ถ้า max_speed ไม่มี ให้ตั้งค่าเป็น 100
    if (!config.max_speed) {
      config.max_speed = 100;
    }

    // ถ้า max_speed มากกว่า 110 ให้จำกัดที่ 110
    if (config.max_speed > 110) {
      config.max_speed = 110;
    }

    res.json(config); // ส่ง response กลับไป
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเรียกข้อมูล config', error: error.message });
  }
});

// GET 
app.get('/status/:id', (req, res) => {
  const { id } = req.params;
  // ตรงนี้สถานะถูกกำหนดเป็น static (แก้ไขตามที่ต้องการได้)
  res.json({ condition: 'good' });
});

// GET /logs
app.get('/logs', async (req, res) => {
  try {
    const response = await axios.get(LOG_SERVER_URL); // เรียก API จาก server2
    const logs = response.data;
    res.json(logs); // ส่งข้อมูล logs กลับไป
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเรียกข้อมูล logs', error: error.message });
  }
});

// POST /logs
app.post('/logs', async (req, res) => {
  try {
    const newLog = req.body; // รับข้อมูล log จาก request
    const response = await axios.post(LOG_SERVER_URL, newLog); // ส่งข้อมูลไปยัง server2
    res.json(response.data); // ส่งผลลัพธ์กลับไป
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึก log', error: error.message });
  }
});

// เริ่ม server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server กำลังทำงานที่ port ${PORT}`);
});
