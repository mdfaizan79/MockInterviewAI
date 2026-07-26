import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured on the server')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' })
}

const parseJSON = (text) => {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('The AI returned an invalid resume analysis. Please try again.')
  return JSON.parse(cleaned.slice(start, end + 1))
}

const extractText = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase()

  if (ext === '.pdf') {
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js')
    const buffer = fs.readFileSync(file.path)
    const data = await pdfParse(buffer)
    return data.text || ''
  }

  if (ext === '.docx') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ path: file.path })
    return result.value || ''
  }

  return ''
}

// @desc  Upload and parse resume
// @route POST /api/resume/parse
export const parseResume = async (req, res) => {
  let uploadedPath
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    uploadedPath = req.file.path
    const rawText = await extractText(req.file)

    if (!rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from resume' })
    }

    const prompt = `You are an expert resume parser. Extract structured information from this resume text.

Resume Text:
${rawText.substring(0, 4000)}

Return ONLY valid JSON:
{
  "name": "Full Name or null",
  "experience": "X years or 'Fresher' or '0-1 year'",
  "education": "Degree, Institution, Year or null",
  "skills": ["skill1", "skill2", ...],
  "projects": 3,
  "companies": ["Company1", "Company2"],
  "summary": "2-3 sentence professional summary based on the resume"
}

Rules:
- skills must be an array of individual technology names (React, Node.js, Python, etc.)
- Include ALL technical skills found (languages, frameworks, tools, platforms, databases)
- experience should be like "2 years", "3.5 years", "Fresher"
- projects should be the count of projects found
- companies should list all work experience companies`

    const result = await getModel().generateContent(prompt)
    const parsed = parseJSON(result.response.text())

    res.json({
      success: true,
      data: {
        ...parsed,
        rawText: rawText.substring(0, 5000),
      }
    })
  } catch (error) {
    console.error('Resume parse error:', error)
    const message = error.message || 'Unable to analyze this resume.'
    const isConfigError = message.includes('GEMINI_API_KEY')
    const isProviderError = /API key|permission|quota|model|GoogleGenerativeAI/i.test(message)
    const isFileError = /PDF|document|extract|password|encrypted/i.test(message)
    res.status(isConfigError ? 503 : isFileError ? 422 : isProviderError ? 502 : 500).json({
      success: false,
      message: isConfigError
        ? 'AI resume analysis is not configured. Add a valid GEMINI_API_KEY to server/.env and restart the server.'
        : isFileError
          ? 'We could not read this file. Upload a text-based PDF or a DOCX file (not a scanned or password-protected PDF).'
          : `Resume analysis failed: ${message}`,
    })
  } finally {
    if (uploadedPath) fs.unlink(uploadedPath, () => {})
  }
}
