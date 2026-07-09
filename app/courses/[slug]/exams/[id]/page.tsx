"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, ChevronLeft, Send, Timer, PlayCircle, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { Header } from "@/components/Header"

export default function TakeExamPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = use(params)
  const router = useRouter()
  
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    fetchExamData()
  }, [])

  const fetchExamData = async () => {
    try {
      const examRes = await fetch(`/api/exams/${id}`)
      const examData = await examRes.json()
      setExam(examData)
      setQuestions(examData.questions)
      setTimeLeft(examData.questions.length * 60) // 1 minute per question
      setLoading(false)
    } catch (error) {
      toast.error("Failed to load exam")
    }
  }

  // Timer Effect
  useEffect(() => {
    if (loading || result) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [loading, timeLeft, result])

  const handleAnswer = (questionIdx: number, optionIdx: number) => {
    if (result) return
    setAnswers({ ...answers, [questionIdx]: optionIdx })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/exams/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        toast.success("Exam submitted!")
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-blue-600 font-bold">Preparing Examination...</div>

  if (result) return <ExamResultView result={result} questions={questions} slug={slug} />

  const currentQuestion: any = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="font-black outfit text-lg">{exam.title}</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm ${timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>
              <Timer size={16} />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? "..." : <><Send size={16} /> Submit</>}
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-8 md:p-12 mb-8 bg-white dark:bg-slate-900 shadow-xl border-none rounded-[2.5rem]">
          <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentIndex, idx)}
                className={`flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all group ${
                  answers[currentIndex] === idx 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md" 
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent"
                }`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  answers[currentIndex] === idx ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`font-bold ${answers[currentIndex] === idx ? "text-blue-900 dark:text-blue-100" : "text-slate-600 dark:text-slate-400"}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="px-8 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm disabled:opacity-30 flex items-center gap-2 hover:bg-white transition-colors"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <button 
            onClick={() => isLast ? handleSubmit() : setCurrentIndex(currentIndex + 1)}
            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {isLast ? "Finish Test" : <>Next Question <ChevronRight size={18} /></>}
          </button>
        </div>
      </div>
    </main>
  )
}

function ExamResultView({ result, questions, slug }: { result: any, questions: any[], slug: string }) {
  const router = useRouter()
  const percentage = Math.round((result.score / result.total) * 100)
  
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="card p-12 text-center bg-white dark:bg-slate-900 shadow-2xl border-none rounded-[3rem] mb-12">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black outfit mb-2">Examination Completed!</h1>
          <p className="text-slate-500 font-medium mb-12">Great effort! Your results are calculated below.</p>
          
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
              <div className="text-3xl font-black text-blue-600">{result.score}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Correct</div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
              <div className="text-3xl font-black text-slate-900 dark:text-white">{percentage}%</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
              <div className="text-3xl font-black text-red-500">{result.total - result.score}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Wrong</div>
            </div>
          </div>

          <button 
            onClick={() => router.push(`/courses/${slug}`)}
            className="btn-primary w-full py-5 rounded-2xl font-bold text-lg shadow-xl"
          >
            Back to Course
          </button>
        </div>

        <h2 className="text-2xl font-bold outfit mb-8">Detailed Review</h2>
        <div className="space-y-6">
          {questions.map((q: any, i: number) => {
            const userAns = result.answers?.[i]
            const isCorrect = userAns === q.correctOption
            
            return (
              <div key={q.id} className="card p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {i + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-6">{q.question}</h3>
                
                <div className="grid gap-3 mb-6">
                  {q.options.map((opt: string, idx: number) => (
                    <div key={idx} className={`p-4 rounded-xl border-2 flex items-center gap-3 text-sm font-bold ${
                      idx === q.correctOption 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : idx === userAns && !isCorrect
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : "border-slate-50 dark:border-slate-800 text-slate-500"
                    }`}>
                      <span className="opacity-40">{String.fromCharCode(65 + idx)})</span>
                      {opt}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{q.explanation}</p>
                  </div>
                )}

                {q.explanationVideoUrl && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Watch Solving Video</p>
                        <p className="text-[10px] text-blue-600 font-medium">Step-by-step visual explanation</p>
                      </div>
                    </div>
                    <a 
                      href={q.explanationVideoUrl} 
                      target="_blank" 
                      className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Watch Now
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
