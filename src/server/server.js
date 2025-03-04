require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3001;

// 允许跨域请求（CORS）
app.use(cors({
  origin: '*',  // 可以改成 'http://localhost:3000' 以提高安全性
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 解析 JSON 请求
app.use(bodyParser.json());

// 配置 MySQL 连接
const db = mysql.createConnection({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME 
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error(' Error connecting to MySQL:', err);
  } else {
    console.log(' Connected to MySQL database');
  }
});

// 工具函数：格式化时间为 MySQL DATETIME
const formatDateForSQL = (date) => {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
};

//  接收 SDK 上传的事件信息
app.post('/api/upload-events', (req, res) => {
  const { event_name, event_data } = req.body;

  if (!event_name || !event_data || !event_data.uid || !event_data.timestamp) {
    return res.status(400).json({ message: 'Missing required event data' });
  }

  const timestamp = formatDateForSQL(event_data.timestamp);

  const query = 'INSERT INTO events (event_name, event_data, user_id, timestamp) VALUES (?, ?, ?, ?)';
  const values = [event_name, JSON.stringify(event_data), event_data.uid, timestamp];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error storing event:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'Event uploaded successfully' });
  });
});

app.get('/api/get-all-events', (req, res) => {
  const query = `
    SELECT id, event_name, event_data, timestamp 
    FROM events
    ORDER BY timestamp DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    console.log("原始数据库数据:", results);

    // **确保 event_data 直接返回 JSON 对象**
    results = results.map(event => ({
      id: event.id,
      event_name: event.event_name,
      event_data: event.event_data,  // **不再 JSON.parse**
      timestamp: event.timestamp
    }));

    console.log("处理后的数据:", results);
    res.json({ success: true, data: results });
  });
});


//  查询特定时间段内某事件的 PV/UV 数据
app.get('/api/get-events-pv-uv', (req, res) => {
  let { event_name, start_date, end_date } = req.query;

  console.log(" Received request:", { event_name, start_date, end_date });

  if (!event_name || !start_date || !end_date) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    start_date = formatDateForSQL(start_date);
    end_date = formatDateForSQL(end_date);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  const query = `
    SELECT event_name, COUNT(*) AS pv, COUNT(DISTINCT user_id) AS uv
    FROM events
    WHERE event_name = ? 
      AND timestamp BETWEEN ? AND ?
    GROUP BY event_name;
  `;

  console.log(" Executing SQL query:", query, [event_name, start_date, end_date]);

  db.query(query, [event_name, start_date, end_date], (err, results) => {
    if (err) {
      console.error(' Error fetching events data:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    console.log("Query results:", results);
    res.json({ success: true, data: results });
  });
});

// 事件增删改查（CRUD）
/** 添加事件 */
app.post('/api/add-event', (req, res) => {
  const { event_name, event_data, timestamp } = req.body;

  if (!event_name || !event_data || !timestamp) {
    return res.status(400).json({ message: 'Missing required event data' });
  }

  const query = 'INSERT INTO events (event_name, event_data, user_id, timestamp) VALUES (?, ?, ?, ?)';
  const values = [event_name, JSON.stringify(event_data), event_data.uid, formatDateForSQL(timestamp)];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(' Error adding event:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'Event added successfully' });
  });
});

/** 删除事件 */
app.delete('/api/delete-event/:id', (req, res) => {
  const id = Number(req.params.id); // 确保 ID 是数值

  // 1. 确保 ID 是有效整数
  if (!id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    console.warn("无效的事件 ID:", req.params.id);
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }

  const query = 'DELETE FROM events WHERE id = ?';

  // 2. 记录 SQL 查询和 ID
  console.log(" 执行 DELETE 查询, 事件 ID:", id);

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(" 删除事件失败，SQL 执行错误:", err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }

    // 3. 确保事件确实被删除
    if (result.affectedRows === 0) {
      console.warn(" 事件未找到, ID:", id);
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    console.log(" 事件删除成功, ID:", id);
    res.json({ success: true, message: "Event deleted successfully" });
  });
});



/** 更新事件 */
app.put('/api/update-event/:id', (req, res) => {
  const { id } = req.params;
  const { event_name, event_data, timestamp } = req.body;

  const query = `
    UPDATE events 
    SET event_name = ?, event_data = ?, timestamp = ?
    WHERE id = ?;
  `;
  const values = [event_name, JSON.stringify(event_data), formatDateForSQL(timestamp), id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(' Error updating event:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'Event updated successfully' });
  });
});

/** 获取事件 */
app.get('/api/get-event/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM events WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(' Error fetching event:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ success: true, data: results[0] });
  });
});

//  服务器启动
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
