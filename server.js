const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// 보안 미들웨어
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://diyme66.shop' : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // IP당 최대 요청 수
});
app.use('/api/', limiter);

// 기본 미들웨어
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 데이터베이스 연결 테스트
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Database connected successfully');
  release();
});

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 이메일 전송 테스트
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP 설정 오류:', error);
  } else {
    console.log('SMTP 서버가 준비되었습니다.');
  }
});

// 입력 유효성 검사 미들웨어
const validateInquiry = (req, res, next) => {
  const { name, email, message } = req.body;
  
  if (!name || name.length > 100) {
    return res.status(400).json({ success: false, error: '이름은 필수이며 100자를 넘을 수 없습니다.' });
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: '유효한 이메일 주소를 입력해주세요.' });
  }
  
  if (!message || message.length > 5000) {
    return res.status(400).json({ success: false, error: '메시지는 필수이며 5000자를 넘을 수 없습니다.' });
  }
  
  next();
};

// 문의 접수 API
app.post('/api/inquiries', validateInquiry, async (req, res) => {
  const { name, email, message } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // DB에 문의 저장
    const result = await client.query(
      'INSERT INTO inquiries (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );

    // 관리자에게 이메일 발송
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: '새로운 문의가 접수되었습니다',
      html: `
        <h3>새로운 문의</h3>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>메시지:</strong> ${message}</p>
      `,
    });

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
});

// 문의 목록 조회 API
app.get('/api/inquiries', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id, name, email, message, 
        created_at, updated_at, status, is_read
      FROM inquiries 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
});

// 문의 상태 업데이트 API
app.post('/api/inquiries/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '문의를 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(port, '0.0.0.0', () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
}); 