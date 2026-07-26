import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseResume } from '../controllers/resumeController.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})

const fileFilter = (_, file, cb) => {
  // Mammoth supports modern Word .docx files, not the legacy binary .doc
  // format. Allowing .doc made otherwise valid-looking uploads fail at parse.
  const allowed = ['.pdf', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and DOCX files are supported'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

const router = express.Router()
router.post('/parse', upload.single('resume'), parseResume)

export default router
