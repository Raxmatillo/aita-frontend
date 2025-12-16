import { useState, useEffect, useCallback } from 'react'
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
  getClassDetails,
  getCategories, // <-- Import the new function
} from '../services/api'


// Custom Tailwind Classes (Define these in your main CSS file, e.g., index.css or a utils file)
// .card: bg-white rounded-xl shadow-lg p-6 border border-gray-100
// .input-field: w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out
// .btn-primary: px-4 py-2 bg-primary-600 text-white font-medium rounded-lg shadow-md hover:bg-primary-700 disabled:opacity-50
// .btn-secondary: px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50


const Dashboard = () => {
  const [classes, setClasses] = useState([])
  const [categories, setCategories] = useState([]) // NEW: State for categories
  const [selectedCategory, setSelectedCategory] = useState(null) // NEW: State for selected filter
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newClassName, setNewClassName] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  
  // Memoized function for loading class details, accepts categoryId
  const loadClassDetails = useCallback(async (classId, categoryId = selectedCategory) => {
    try {
        // Pass the categoryId to the API for filtering
      const data = await getClassDetails(classId, categoryId) 
      setSelectedClass(data)
      
      // OPTIONAL: Update total student count in the sidebar list (though API returns filtered students)
      // I'll assume the API returns the original total count in `data.total_student_count`
      // For now, I'll rely on the original class object for the total count display in the sidebar
      // and update the main content with the filtered list.
      
    } catch (error) {
      console.error('Error loading class details:', error)
    }
  }, [selectedCategory])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const classData = await getClasses()
      const categoryData = await getCategories()

      setClasses(classData.results || classData)
      setCategories(categoryData)

      if ((classData.results?.length > 0 || classData.length > 0)) {
        const firstClass = classData.results?.[0] || classData[0];
        // Set the default selected class
        // We will load details AFTER setting the default category
        setSelectedClass(firstClass);
        
        if (categoryData.length > 0) {
            // Set first category as selected default
            setSelectedCategory(categoryData[0].id)
            // Load details for the first class, filtered by the first category
            await loadClassDetails(firstClass.id, categoryData[0].id); 
        } else {
            // Load details for the first class without category filter
            await loadClassDetails(firstClass.id, null);
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, []) // Initial load

  // Re-load class details when selectedCategory changes
  useEffect(() => {
    if (selectedClass) {
      // loadClassDetails will use the updated selectedCategory from state
      loadClassDetails(selectedClass.id, selectedCategory)
    }
  }, [selectedCategory, loadClassDetails])

  // Handler for class selection from sidebar
  const handleClassSelection = async (cls) => {
    // Only re-load details if a different class is selected
    if (selectedClass?.id !== cls.id) {
        setSelectedClass(cls);
        // Load details for the newly selected class, filtered by the current category
        await loadClassDetails(cls.id, selectedCategory); 
    }
  }


  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!newClassName.trim()) return

    try {
      setSubmitting(true)
      await createClass({ name: newClassName })
      setNewClassName('')
      setShowClassModal(false)
      await loadClasses() // Full reload to refresh the class list and re-select/load the first one
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      await deleteClass(classId)
      // Reload classes to remove the deleted class
      await loadClasses() 
      if (selectedClass?.id === classId) {
        // Find a new class to select
        const newSelectedClass = classes.find(c => c.id !== classId) || null;
        setSelectedClass(newSelectedClass);
        if (newSelectedClass) {
            await loadClassDetails(newSelectedClass.id, selectedCategory);
        }
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    if (!newStudentName.trim() || !selectedClass) return

    try {
      setSubmitting(true)
      await createStudent({
        full_name: newStudentName,
        class_room: selectedClass.id,
      })
      setNewStudentName('')
      setShowStudentModal(false)
      // Reload details for the selected class using the current category filter
      await loadClassDetails(selectedClass.id, selectedCategory) 
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Failed to add student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      await deleteStudent(studentId)
      // Reload details for the selected class using the current category filter
      await loadClassDetails(selectedClass.id, selectedCategory) 
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }


  const handleStartQuiz = (student) => {
    setSelectedStudent(student)
    setShowQuizModal(true)
  }

  const handleCloseQuiz = async () => {
    setShowQuizModal(false)
    setSelectedStudent(null)
    // Reload class details to update student stats based on the current filter
    if (selectedClass) {
      await loadClassDetails(selectedClass.id, selectedCategory)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          {/* Using custom class for spinner */}
          <div className="loading-spinner"></div> 
        </div>
      </div>
    )
  }

  // Helper to find the current category name for display
  const currentCategoryName = categories.find(cat => cat.id === selectedCategory)?.name;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedClass?.id === cls.id
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
          
          {/* Main Content Area (3/4 width on large screens) */}
          <div className="lg:col-span-3 space-y-6">
            {selectedClass ? (
              <>
                {/* Class Header with Category Filter and Add Student Button */}
                <div className="card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Class Info */}
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900">
                        {selectedClass.name}
                      </h2>
                      <p className="text-gray-500 text-lg mt-1">
                        {/* Displaying the count of students *currently visible* (i.e., filtered) */}
                        <span className='font-semibold'>{selectedClass.students?.length || 0}</span> students 
                        {currentCategoryName && (
                            <span className='text-sm text-primary-600 ml-1'> (Filtered by {currentCategoryName})</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 ml-auto">
                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <div className="relative w-full sm:w-48">
                                <select
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="input-field appearance-none pr-10 bg-white"
                                >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                    </option>
                                ))}
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                        
                        {/* Add Student Button */}
                        <button
                            onClick={() => setShowStudentModal(true)}
                            className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add Student</span>
                        </button>
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <StudentTable
                  students={selectedClass.students || []}
                  onStartQuiz={handleStartQuiz}
                  onDeleteStudent={handleDeleteStudent}
                  onEditStudent={(student) => console.log('Edit', student)}
                />
              </>
            ) : (
              <div className="card text-center py-20">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Class Selected
                </h3>
                <p className="text-gray-500">
                  Select a class from the sidebar or create a new one to get started.
                </p>
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

      {/* Quiz Modal */}
      {selectedStudent && (
        <ModalQuiz
          isOpen={showQuizModal}
          onClose={handleCloseQuiz}
          student={selectedStudent}
        />
      )}
    </div>
  )
}

export default Dashboard