import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  id:             Number,
  question:       String,
  type:           { type: String, enum: ['mcq', 'true_false', 'fill_blank', 'short_answer', 'code_output'] },
  tech:           String,
  difficulty:     { type: String, enum: ['easy', 'medium', 'hard'] },
  options:        [String],           // A) ... B) ... etc. null for non-MCQ
  correctAnswer:  String,
  explanation:    String,
  whyOthersWrong: mongoose.Schema.Types.Mixed,
  realWorldContext: String,
  topicsToStudy:  [String],
  resources:      [String],
})

const userAnswerSchema = new mongoose.Schema({
  questionId:  Number,
  answer:      String,
  timeTaken:   Number,  // seconds
  flagged:     { type: Boolean, default: false },
})

const questionResultSchema = new mongoose.Schema({
  questionId:   Number,
  correct:      Boolean,
  partialScore: { type: Number, default: 0 },
  aiEvaluation: mongoose.Schema.Types.Mixed, // for short answers
})

const testSessionSchema = new mongoose.Schema({
  resumeText:      String,
  resumeSummary:   String,
  resumeSkills:    [String],
  candidateName:   String,
  candidateExp:    String,
  candidateEdu:    String,
  selectedStacks:  [String],
  difficulty: {
    easy:   { type: Number, default: 30 },
    medium: { type: Number, default: 50 },
    hard:   { type: Number, default: 20 },
  },
  questionCount:   { type: Number, default: 10 },
  questionTypes:   [String],
  timeLimit:       { type: Number, default: 900 }, // seconds
  level:           { type: String, default: 'junior' },
  tone:            { type: String, default: 'technical' },
  questions:       [questionSchema],
  userAnswers:     [userAnswerSchema],
  results: {
    totalScore:        Number,
    maxScore:          Number,
    percentage:        Number,
    timeTaken:         Number,
    categoryScores:    mongoose.Schema.Types.Mixed,
    difficultyScores:  mongoose.Schema.Types.Mixed,
    typeScores:        mongoose.Schema.Types.Mixed,
    questionResults:   [questionResultSchema],
  },
  improvementPlan: String,
  badges:          [mongoose.Schema.Types.Mixed],
  status: { type: String, enum: ['configured', 'in_progress', 'submitted', 'evaluated'], default: 'configured' },
  createdAt:   { type: Date, default: Date.now },
  submittedAt: Date,
  evaluatedAt: Date,
})

export default mongoose.model('TestSession', testSessionSchema)
