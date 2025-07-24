'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Mobile Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.3 
            }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                    <span className="text-white font-bold text-sm">学</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">小小读书郎</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-8">
                <div className="space-y-4">
                  <Link
                    href="/classics"
                    onClick={onClose}
                    className="flex items-center px-4 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">经典阅读</div>
                      <div className="text-sm text-gray-500">三字经、弟子规、道德经</div>
                    </div>
                  </Link>

                  <Link
                    href="/enhanced-writing"
                    onClick={onClose}
                    className="flex items-center px-4 py-4 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mr-4 group-hover:bg-emerald-200 transition-colors">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">汉字练习</div>
                      <div className="text-sm text-gray-500">笔画顺序和字形结构</div>
                    </div>
                  </Link>

                  <Link
                    href="/pinyin-practice"
                    onClick={onClose}
                    className="flex items-center px-4 py-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">拼音练习</div>
                      <div className="text-sm text-gray-500">发音练习和声调训练</div>
                    </div>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-700">传承中华文化，启蒙智慧人生</p>
                  <div className="flex justify-center space-x-2 text-lg">
                    <span>🏮</span>
                    <span>🐉</span>
                    <span>🏮</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}