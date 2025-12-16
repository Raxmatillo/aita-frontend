import { motion } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'

const WordCard = ({ word, image, category, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
        {image ? (
          <img
            src={image}
            alt={word}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{word}</h3>
        <p className="text-sm text-gray-500">{category}</p>
      </div>
    </motion.div>
  )
}

export default WordCard
