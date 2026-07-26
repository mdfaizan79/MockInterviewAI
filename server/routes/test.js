import express from 'express'
import { generateTest, getSession, submitTest, getStatus } from '../controllers/testController.js'

const router = express.Router()
router.post('/generate',              generateTest)
// Fixed routes must come before the id matcher; otherwise "status" is
// treated as a MongoDB id and evaluation polling cannot complete.
router.get('/:sessionId/status',      getStatus)
router.get('/:sessionId',             getSession)
router.post('/:sessionId/submit',     submitTest)

export default router
