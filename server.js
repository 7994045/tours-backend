javascript
require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'your-redis-url');

app.use(cors());
app.use(express.json());

// Поиск туров
app.get('/api/tours', async (req, res) => {
  const { from, to, date } = req.query;
  const cacheKey = `tours:${from}:${to}:${date}`;
  
  // Проверяем кеш
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Здесь будет запрос к туроператорам
  const tours = [
    { id: 1, from, to, date, price: 50000, airline: "AeroFlot" },
    { id: 2, from, to, date, price: 55000, airline: "S7" }
  ];
  
  // Кешируем на 5 минут
  await redis.setex(cacheKey, 300, JSON.stringify(tours));
  
  res.json(tours);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
