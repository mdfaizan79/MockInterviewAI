import express from 'express'
import { getResults } from '../controllers/resultsController.js'

const router = express.Router()
router.get('/:sessionId', getResults)



export default router
