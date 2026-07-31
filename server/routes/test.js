import express from 'express'
import { generateTest, getSession, submitTest, getStatus } from '../controllers/testController.js'

const router = express.Router()
router.post('/generate',              generateTest)
// Fixed routes must come before the id matcher;

router.get('/:sessionId/status',      getStatus)
router.get('/:sessionId',             getSession)
router.post('/:sessionId/submit',     submitTest)

export default router
