const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');  // 用于解决跨域问题
const app = express();
const port = 3001;

// 使用 body-parser 解析 JSON 数据
app.use(bodyParser.json());

// 允许跨域请求
app.use(cors());

// 配置 MySQL 数据库连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // MySQL 用户名
  password: 'zxy050903', // MySQL 密码
  database: 'track_point_db',  // 数据库名
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// // 接收 SDK 上传的元素信息
// app.post('/api/upload-elements', (req, res) => {
//   const { project_id, page_id, elements, user_id, browser_info, os_info, timestamp } = req.body;

//   // 验证数据完整性
//   if (!project_id || !page_id || !elements || !Array.isArray(elements)) {
//     return res.status(400).send({ message: 'Missing or invalid required data' });
//   }

//   // 将数据存储到 MySQL 数据库
//   const query = 'INSERT INTO elements (project_id, page_id, elements, user_id, browser_info, os_info, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)';
//   const values = [project_id, page_id, JSON.stringify(elements), user_id, browser_info, os_info, timestamp];

//   db.query(query, values, (err, result) => {
//     if (err) {
//       console.error('Error storing elements:', err);
//       return res.status(500).send({ message: 'Internal Server Error' });
//     }
//     res.send({ success: true, message: 'Elements uploaded successfully' });
//   });
// });


// 接收 SDK 上传的事件信息
app.post('/api/upload-events', (req, res) => {
  const { event_name, event_data } = req.body;

  // 验证数据完整性
  if (!event_name || !event_data ) {
    return res.status(400).send({ message: 'Missing or invalid required event data' });
  }

  // 将事件数据存储到 MySQL 数据库
  const query = 'INSERT INTO events (event_name, event_data) VALUES (?, ?)';
  const values = [event_name, JSON.stringify(event_data)];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error storing event:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
    res.send({ success: true, message: 'Event uploaded successfully' });
  });
});

// // 查询所有元素信息
// app.get('/api/get-elements', (req, res) => {
//   const query = 'SELECT * FROM elements';

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching elements:', err);
//       return res.status(500).send({ message: 'Internal Server Error' });
//     }
//     res.json({ success: true, data: results });
//   });
// });

// 查询所有事件数据
app.get('/api/get-events', (req, res) => {
  const query = 'SELECT * FROM events';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
    res.json({ success: true, data: results });
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
