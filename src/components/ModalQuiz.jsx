import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react'
import { getRandomQuestion, submitAnswer } from '../services/api'

const ModalQuiz = ({ isOpen, onClose, student }) => {
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showResult, setShowResult] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      loadQuestion()
    }
  }, [isOpen, student])

  const loadQuestion = async () => {
    try {
      setLoading(true)
      setSelectedOption(null)
      setIsCorrect(null)
      setShowResult(false)
      
      const data = await getRandomQuestion(student.id)
      setQuestion(data)
    } catch (error) {
      console.error('Error loading question:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionClick = async (option) => {
    if (selectedOption || isSubmitting) return

    setSelectedOption(option.id)
    setIsSubmitting(true)

    try {
      const result = await submitAnswer(student.id, {
        vocab_id: question.vocab_id,
        selected_option_id: option.id,
      })

      const correct = result.correct
      setIsCorrect(correct)
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }))

      // Show result animation
      setShowResult(true)

      // Move to next question after delay
      setTimeout(() => {
        loadQuestion()
      }, 2000)
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setScore({ correct: 0, total: 0 })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.full_name}'s Quiz</h2>
              <p className="text-sm text-gray-500 mt-1">Select the correct answer</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-lg">
                    {score.correct}/{score.total}
                  </span>
                </div>
                {score.total > 0 && (
                  <p className="text-xs text-gray-500">
                    {Math.round((score.correct / score.total) * 100)}% accuracy
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-500">Loading question...</p>
              </div>
            ) : question ? (
              <div className="space-y-6">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                    <img
                      src={question.image_url}
                      alt="Vocabulary"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Result Overlay */}
                  <AnimatePresence>
                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        } bg-opacity-90`}
                      >
                        {isCorrect ? (
                          <div className="text-center text-white">
                            <CheckCircle className="w-24 h-24 mx-auto mb-4" />
                            <p className="text-3xl font-bold">Correct!</p>
                          </div>
                        ) : (
                          <div className="text-center text-white">
                            <XCircle className="w-24 h-24 mx-auto mb-4" />
                            <p className="text-3xl font-bold">Wrong!</p>
                            <p className="text-xl mt-2">Correct answer: {question.word}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Options */}
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-gray-700 text-center mb-4">
                    What is this?
                  </p>
                  {question.options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleOptionClick(option)}
                      disabled={selectedOption !== null || isSubmitting}
                      className={`w-full p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 ${
                        selectedOption === option.id
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-700 animate-correct'
                            : 'border-red-500 bg-red-50 text-red-700 animate-wrong'
                          : selectedOption
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-primary-500 hover:bg-primary-50 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.word}</span>
                        {selectedOption === option.id && (
                          <span>
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <XCircle className="w-6 h-6" />
                            )}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pt-4"
                  >
                    <p className="text-gray-500 flex items-center justify-center space-x-2">
                      <span>Next question loading</span>
                      <ArrowRight className="w-5 h-5 animate-pulse" />
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">No questions available</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ModalQuiz
