'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface PageLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  description?: string
  badge?: string
  className?: string
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  description, 
  badge,
  className = "" 
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 ${className}`} suppressHydrationWarning>
      {/* Page Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-6 py-2 text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {badge}
                </Badge>
              </motion.div>
            )}
            
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
              >
                {title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 leading-tight"
              >
                {subtitle}
              </motion.p>
              
              {description && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-lg"
                >
                  {description}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Page Content */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="px-6 pb-20"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          {children}
        </div>
      </motion.section>
    </div>
  )
}