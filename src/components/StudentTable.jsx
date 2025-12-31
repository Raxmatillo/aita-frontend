import { useState } from 'react'
import { Users, Trash2, Edit, Play, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const StudentTable = ({ students, onStartQuiz, onRestartQuiz, onDeleteStudent, onBeginTest,  onEditStudent }) => {
  const [selectedStudent, setSelectedStudent] = useState(null)

  if (!students || students.length === 0) {
    return (
      <div className="card text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No students in this class yet.</p>
        <p className="text-sm text-gray-400 mt-2">Add students to get started!</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header">Student Name</th>
            <th className="table-header text-center">Total Tests</th>
            <th className="table-header text-center">Correct</th>
            <th className="table-header text-center">Wrong</th>
            <th className="table-header text-center">Accuracy</th>
            <th className="table-header text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <AnimatePresence>
            {students.map((student) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="table-cell">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold mr-3">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{student.full_name}</span>
                  </div>
                </td>
                <td className="table-cell text-center">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                    {student.total_tests || 0}
                  </span>
                </td>
                <td className="table-cell text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {student.correct_answers || 0} ✓
                  </span>
                </td>
                <td className="table-cell text-center">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {student.incorrect_answers || 0} ✗
                  </span>
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${student.accuracy_percentage || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {student.accuracy_percentage || 0}%
                    </span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center justify-center space-x-2">
  <button
    onClick={() => onBeginTest(student.id)}
    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
    title="Start Quiz"
  >
    <Play className="w-5 h-5" />
  </button>

  {/* Restart button */}
  <button
    onClick={() => onRestartQuiz(student.id)}
    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    title="Restart Quiz"
  >
    <RotateCcw className="w-4 h-4" />
  </button>

  <button
    onClick={() => onEditStudent(student)}
    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
    title="Edit Student"
  >
    <Edit className="w-4 h-4" />
  </button>

  <button
    onClick={() => onDeleteStudent(student.id)}
    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    title="Delete Student"
  >
    <Trash2 className="w-4 h-4" />
  </button>
</div>

                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

export default StudentTable
