import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, Trash2, UserPlus, BookOpen, ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import StudentTable from '../components/StudentTable'
import ModalQuiz from '../components/ModalQuiz'
import {
  getClasses,
  createClass,
  deleteClass,
  createStudent,
  deleteStudent,
  getCategories,
  getAllStudentsResults,
  clearStudentResults,
  getRandomQuestion,
} from '../services/api'

const Dashboard = () => {
  const [classes, setClasses] = useState([])
  const [categories, setCategories] = useState([])
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)


  const [selectedClassId, setSelectedClassId] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [selectedClassData, setSelectedClassData] = useState(null)

  const [loading, setLoading] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newClassName, setNewClassName] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [submitting, setSubmitting] = useState(false)


  const reloadClasses = async () => {
    const classData = await getClasses()
    const classList = classData.results || classData
    setClasses(classList)

    // agar tanlangan sinf o‘chib ketgan bo‘lsa
    if (!classList.find(c => c.id === selectedClassId)) {
      setSelectedClassId(classList[0]?.id || null)
      setSelectedClass(classList[0] || null)
    }
  }



  /* ================= INITIAL LOAD ================= */
 useEffect(() => {
  const init = async () => {
    setLoading(true)
    const classData = await getClasses()
    const categoryData = await getCategories()
    const classList = classData.results || classData

    setClasses(classList)
    setCategories(categoryData)

    const savedClassId = Number(localStorage.getItem('selectedClassId')) || classList?.[0]?.id
    const savedCategoryId = Number(localStorage.getItem('selectedCategoryId')) || categoryData?.[0]?.id

    setSelectedClassId(savedClassId)
    setSelectedCategoryId(savedCategoryId)

    // ✅ selectedClass ham set qilinadi
    setSelectedClass(classList.find(c => c.id === savedClassId) || null)

    setLoading(false)
  }
  init()
}, [])


  /* ================= FETCH CLASS DETAILS ================= */
  useEffect(() => {
    if (!selectedClassId) return

    const fetchData = async () => {
      const data = await getAllStudentsResults(
        selectedClassId,
        selectedCategoryId
      )

      setSelectedClassData({
        ...data,
        students: Array.isArray(data.students) ? data.students : [],
      })
    }


    fetchData()

    localStorage.setItem('selectedClassId', selectedClassId)
    if (selectedCategoryId)
      localStorage.setItem('selectedCategoryId', selectedCategoryId)
  }, [selectedClassId, selectedCategoryId])

  /* ================= HANDLERS ================= */
  const handleClassSelection = (cls) => {
    setSelectedClassId(cls.id)
    setSelectedClass(cls) // 🔥 SHART
  }


  const handleCreateClass = async (e) => {
    e.preventDefault()
    await createClass({ name: newClassName })

    setNewClassName('')
    setShowClassModal(false)

    await reloadClasses() // 🔥 MUHIM
  }



  const handleDeleteClass = async (id) => {
    if (!confirm('Delete class?')) return

    await deleteClass(id)
    await reloadClasses() // 🔥 MUHIM
  }


  const handleBeginTest = async (studentId, categoryId) => {
    if (!categoryId) return

    setIsTestStarted(true)
    console.log('categoryId', categoryId)

    try {
      const questions = await getRandomQuestion(studentId, categoryId)

      if (questions.finished) {
        alert("Siz testni allaqachon topshirib bo'lgansiz!")
      } else {
        const data = await getAllStudentsResults(selectedClassId, categoryId)
        setSelectedClassData(data)

        const student = data.students.find(s => s.id === studentId)
        setSelectedStudent(student)
        setShowQuizModal(true)
      }
    } catch (error) {

      // 400 yoki boshqa xatolarni tutib foydalanuvchiga xabar berish
      if (error.response && error.response.status === 400) {
        alert("Ushbu kategoriyada test mavjud emas!")
      } else {
        alert("Savol olishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.")
      }
    }
  }





  const handleCreateStudent = async (e) => {
    e.preventDefault()

    await createStudent({
      full_name: newStudentName,
      class_room: selectedClassId,
    })

    setNewStudentName('')
    setShowStudentModal(false)

    // 🔥 student table darhol yangilansin
    const data = await getAllStudentsResults(
      selectedClassId,
      selectedCategoryId
    )
    setSelectedClassData(data)

    // 🔥 sidebar student_count yangilansin
    await reloadClasses()
  }


  const handleDeleteStudent = async (id) => {
    if (!confirm("O‘quvchini o‘chirmoqchimisiz?")) return

    await deleteStudent(id)

    // 🔄 UI ni yangilash
    const data = await getAllStudentsResults(
      selectedClassId,
      selectedCategoryId
    )
    setSelectedClassData(data)
  }


  const handleRestartQuiz = async (studentId) => {
    if (!confirm('Bu test natijalarini tozalashni tasdiqlaysizmi?')) return
    await clearStudentResults(studentId)
    // Refresh student table
    const data = await getAllStudentsResults(
      selectedClassId,
      selectedCategoryId
    )
    setSelectedClassData(data)
  }

  const handleStartQuiz = (student) => {
    setSelectedStudent(student)
    setShowQuizModal(true)
  }

  const handleCloseQuiz = () => {
    setShowQuizModal(false)
    setSelectedStudent(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  const currentCategoryName = categories.find(
    (c) => c.id === selectedCategoryId
  )?.name

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Classes Sidebar (1/4 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                  title="Add Class"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No classes yet</p>
                  <button
                    onClick={() => setShowClassModal(true)}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Create your first class
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {classes.map((cls) => (
                    <motion.div
                      key={cls.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${selectedClass?.id === cls.id
                        ? 'bg-primary-50 border border-primary-500 shadow-sm'
                        : 'bg-white border border-gray-100 hover:bg-gray-50'
                        }`}
                      onClick={() => handleClassSelection(cls)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {cls.name}
                          </p>
                          {/* Displaying total count from the initial classes list */}
                          <p className="text-sm text-gray-500">
                            {cls.student_count || 0} students
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClass(cls.id)
                          }}
                          className="p-1 ml-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedClassData ? (
              <>
                {/* Header doim ko‘rinsin */}
                <div className="card">
                  <div className="flex items-start justify-between gap-6">
                    <div className="text-left">
                      <h2 className="text-3xl font-bold">
                        {selectedClassData.class}
                      </h2>

                      <p className="text-gray-500">
                        {selectedClassData.students?.length || 0} students
                        {currentCategoryName &&
                          ` (Filtered by ${currentCategoryName})`}
                      </p>
                    </div>
                    

                    <div className="flex flex-col gap-3 ml-auto">
                         {/* Add Student Button */}
                        <button
                            onClick={() => setShowStudentModal(true)}
                            className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add Student</span>
                        </button>
                        <select
                          value={selectedCategoryId || ''}
                          onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                          className="input-field w-56"
                          disabled={categories.length === 0}
                        >
                          {categories.length === 0 ? (
                            <option value="">Kategoriyalar mavjud emas</option>
                          ) : (
                            categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))
                          )}
                        </select>

                    </div>
                  </div>
                </div>

                {/* Student table yoki empty holat */}
                {selectedClassData.students.length > 0 ? (
                  <StudentTable
                    students={selectedClassData.students}
                    onStartQuiz={handleStartQuiz}
                    onBeginTest={(studentId) =>
                      handleBeginTest(studentId, selectedCategoryId)
                    }
                    onDeleteStudent={handleDeleteStudent}
                    onRestartQuiz={handleRestartQuiz}
                  />
                ) : (
                  <div className="card text-center py-10">
                    <p className="text-gray-500 mb-4">
                      Ushbu sinfda hali o‘quvchilar mavjud emas.
                    </p>
                    <button
                      onClick={() => setShowStudentModal(true)}
                      className="btn-primary"
                    >
                      Add Student
                    </button>
                  </div>
                )}

              </>
            ) : (
              <div className="card text-center py-10 text-gray-500">
                Sinf tanlanmagan
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Create Class Modal */}
      <AnimatePresence>
        {showClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Create New Class
              </h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Grade 5A"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClassModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary"
                  >
                    {submitting ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStudentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Add Student to {selectedClass?.name}
              </h3>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., John Doe"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary"
                  >
                    {submitting ? 'Adding...' : 'Add Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedStudent && (
        <ModalQuiz
          isOpen={showQuizModal}
          student={selectedStudent}
          category={selectedCategoryId}
          onClose={async () => {
            setShowQuizModal(false)
            setSelectedStudent(null)
            const data = await getAllStudentsResults(
              selectedClassId,
              selectedCategoryId
            )
            setSelectedClassData(data)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
