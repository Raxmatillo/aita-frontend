import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Upload, Trash2, Edit2, Grid, List, Search, Filter, FolderOpen } from 'lucide-react'
import Header from '../components/Header'
import WordCard from '../components/WordCard'
import {
  getVocabularies,
  createVocabulary,
  deleteVocabulary,
  getCategories,
  uploadBulkFiles,
  createCategory,
} from '../services/api'

const Library = () => {
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categorySubmitting, setCategorySubmitting] = useState(false)

  const [vocabularies, setVocabularies] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [bulkFiles, setBulkFiles] = useState([]) // { file, word } array
  const [bulkCategory, setBulkCategory] = useState('')

  // ================= CATEGORY CREATE =================
const handleCreateCategory = async (e) => {
  e.preventDefault()

  if (!newCategoryName.trim()) return

  try {
    setCategorySubmitting(true)

    await createCategory({ name: newCategoryName })

    setNewCategoryName('')
    setShowCategoryModal(false)

    // 🔥 kategoriyalarni qayta yuklash
    const cats = await getCategories()
    setCategories(cats)
  } catch (error) {
    console.error('Create category error:', error)
    alert('Kategoriya qo‘shib bo‘lmadi')
  } finally {
    setCategorySubmitting(false)
  }
}


  const [newVocab, setNewVocab] = useState({
    word: '',
    category: '',
    image: null,
  })

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)

      const [vocabData, categoryData] = await Promise.all([
        getVocabularies(
          selectedCategory !== 'all'
            ? { category: selectedCategory }
            : {}
        ),
        getCategories(),
      ])

      setVocabularies(vocabData.results || vocabData)
      console.log('Fetched vocabularies:', vocabData);
      console.log('Fetched categories:', categoryData);
      setCategories(categoryData || []) // 🔥 MUHIM
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkFiles = (files) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    const newFiles = images.map((file) => {
      // fayl nomidan kengaytmani olib tashlash
      const word = file.name.replace(/\.[^/.]+$/, "")
      return { file, word }
    })
    setBulkFiles((prev) => [...prev, ...newFiles])
  }

  const handleBulkUpload = async () => {
  if (!bulkCategory) {
    alert('Please select a category')
    return
  }
  if (bulkFiles.some((bf) => !bf.word)) {
    alert('Please fill in all words')
    return
  }



  try {
    setSubmitting(true)  // optional: spinner
    const res = await uploadBulkFiles(bulkFiles, bulkCategory)
    console.log('Uploaded:', res)

    // Reset modal and state
    setBulkFiles([])
    setBulkCategory('')
    setShowBulkUploadModal(false)

    // Refresh vocabularies
    await loadData()
  } catch (error) {
    console.error('Bulk upload failed:', error)
    alert('Bulk upload failed')
  } finally {
    setSubmitting(false)
  }
}


  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should not exceed 5MB')
        return
      }
      setNewVocab({ ...newVocab, image: file })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newVocab.word || !newVocab.category || !newVocab.image) {
      alert('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('word', newVocab.word)
      formData.append('category', newVocab.category)
      formData.append('image', newVocab.image)

      await createVocabulary(formData)
      setNewVocab({ word: '', category: '', image: null })
      setShowAddModal(false)
      await loadData()
    } catch (error) {
      console.error('Error creating vocabulary:', error)
      alert('Failed to create vocabulary')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (vocabId) => {
    if (!confirm('Are you sure you want to delete this vocabulary?')) return

    try {
      await deleteVocabulary(vocabId)
      await loadData()
    } catch (error) {
      console.error('Error deleting vocabulary:', error)
      alert('Failed to delete vocabulary')
    }
  }

  const filteredVocabularies = vocabularies.filter((vocab) =>
    vocab.word.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vocabulary Library</h1>
              <p className="text-gray-500 mt-1">
                Manage your word-image collection
              </p>
            </div>
            <button
            onClick={() => setShowBulkUploadModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ko'p yuklash</span>
          </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Vocabulary</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vocabularies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  if (e.target.value === '__add__') {
                    setShowCategoryModal(true)
                  } else {
                    setSelectedCategory(e.target.value)
                  }
                }}
                className="input-field"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}

                <option value="__add__">➕ Kategoriya qo‘shish</option>
              </select>

            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vocabularies</p>
                <p className="text-2xl font-bold text-gray-900">{vocabularies.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Search Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredVocabularies.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Vocabularies Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="card text-center py-20">
            <Upload className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Vocabularies Found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Start building your vocabulary library'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Vocabulary
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >

            <AnimatePresence>
              {filteredVocabularies.map((vocab) => (
                <motion.div
                  key={vocab.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <WordCard
                    word={vocab.word}
                    image={vocab.image_url}
                    category={vocab.category_name}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(vocab.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="card">
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredVocabularies.map((vocab) => (
                  <motion.div
                    key={vocab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={vocab.image_url}
                        alt={vocab.word}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{vocab.word}</h3>
                        <p className="text-sm text-gray-500">{vocab.category_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(vocab.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Add Vocabulary Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Vocabulary
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Word
                  </label>
                  <input
                    type="text"
                    value={newVocab.word}
                    onChange={(e) =>
                      setNewVocab({ ...newVocab, word: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Apple"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newVocab.category}
                    onChange={(e) =>
                      setNewVocab({ ...newVocab, category: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      required
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer"
                    >
                      {newVocab.image ? (
                        <div>
                          <img
                            src={URL.createObjectURL(newVocab.image)}
                            alt="Preview"
                            className="w-32 h-32 object-cover mx-auto rounded-lg mb-2"
                          />
                          <p className="text-sm text-gray-600">
                            {newVocab.image.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Add Vocabulary'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {showCategoryModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowCategoryModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Kategoriya qo‘shish
        </h3>

        <form onSubmit={handleCreateCategory} className="space-y-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="input-field"
            placeholder="Masalan: Fruits"
            autoFocus
            required
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={categorySubmitting}
              className="flex-1 btn-primary"
            >
              {categorySubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {showBulkUploadModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowBulkUploadModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Bulk Upload Vocabulary
        </h3>

        {/* Category select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer mb-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleBulkFiles(Array.from(e.dataTransfer.files))
          }}
        >
          <p className="text-gray-500">Drag & drop images here or click to select</p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="bulk-upload-input"
            onChange={(e) => handleBulkFiles(Array.from(e.target.files))}
          />
          <label htmlFor="bulk-upload-input" className="cursor-pointer text-blue-600 underline">
            Browse files
          </label>
        </div>


        {/* Preview & Word Input */}
        {bulkFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 max-h-96 overflow-y-auto">
            {bulkFiles.map((bf, index) => (
              <div key={index} className="border rounded-lg p-2 relative">
                <img
                  src={URL.createObjectURL(bf.file)}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Word"
                  value={bf.word}
                  onChange={(e) => {
                    const updated = [...bulkFiles]
                    updated[index].word = e.target.value
                    setBulkFiles(updated)
                  }}
                  className="input-field w-full text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBulkFiles((prev) => prev.filter((_, i) => i !== index))
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowBulkUploadModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkUpload}
            disabled={submitting}
            className="btn-primary flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Upload All'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  )
}

export default Library
