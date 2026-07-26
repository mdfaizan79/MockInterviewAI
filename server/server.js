import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

dotenv.config()

import resumeRoutes  from './routes/resume.js'
import testRoutes    from './routes/test.js'
import resultsRoutes from './routes/results.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true })

const app  = express()
const PORT = process.env.PORT || 5001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/resume', resumeRoutes)
app.use('/api/test',   testRoutes)
app.use('/api/results', resultsRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File must be under 5MB' })
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' })
})

// Connect to MongoDB and start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mock-interview')
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1) })
