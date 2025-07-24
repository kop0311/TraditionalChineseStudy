'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatItem {
  icon?: ReactNode
  emoji?: string
  value: string | number
  label: string
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'red' | 'gray'
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
  }
}

interface StatsPanelProps {
  title: string
  subtitle?: string
  stats: StatItem[]
  className?: string
  delay?: number
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    hoverBg: 'group-hover:bg-blue-200',
    text: 'text-blue-600',
    valueText: 'text-blue-900'
  },
  emerald: {
    bg: 'bg-emerald-100',
    hoverBg: 'group-hover:bg-emerald-200',
    text: 'text-emerald-600',
    valueText: 'text-emerald-900'
  },
  purple: {
    bg: 'bg-purple-100',
    hoverBg: 'group-hover:bg-purple-200',
    text: 'text-purple-600',
    valueText: 'text-purple-900'
  },
  amber: {
    bg: 'bg-amber-100',
    hoverBg: 'group-hover:bg-amber-200',
    text: 'text-amber-600',
    valueText: 'text-amber-900'
  },
  red: {
    bg: 'bg-red-100',
    hoverBg: 'group-hover:bg-red-200',
    text: 'text-red-600',
    valueText: 'text-red-900'
  },
  gray: {
    bg: 'bg-gray-100',
    hoverBg: 'group-hover:bg-gray-200',
    text: 'text-gray-600',
    valueText: 'text-gray-900'
  }
}

export function StatsPanel({ 
  title, 
  subtitle, 
  stats, 
  className = "",
  delay = 0 
}: StatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
        {(title || subtitle) && (
          <CardHeader className="text-center pb-6">
            {title && (
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <CardDescription className="text-lg text-gray-600">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader>
        )}
        
        <CardContent className="pt-0">
          <div className={`grid gap-6 ${
            stats.length === 1 ? 'grid-cols-1' :
            stats.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            stats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
            'grid-cols-2 sm:grid-cols-4'
          }`}>
            {stats.map((stat, index) => {
              const colors = colorClasses[stat.color || 'blue']
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: delay + (index * 0.1) }}
                  className="text-center group"
                >
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors.bg} ${colors.hoverBg} transition-colors duration-300 shadow-lg`}>
                    {stat.emoji ? (
                      <span className="text-2xl">{stat.emoji}</span>
                    ) : stat.icon ? (
                      <div className={`${colors.text} w-8 h-8`}>{stat.icon}</div>
                    ) : null}
                  </div>
                  
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${colors.valueText}`}>
                    {stat.value}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </div>

                  {stat.trend && (
                    <div className={`text-xs flex items-center justify-center gap-1 ${
                      stat.trend.direction === 'up' ? 'text-emerald-600' :
                      stat.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {stat.trend.direction === 'up' && '↗'}
                      {stat.trend.direction === 'down' && '↘'}
                      {stat.trend.direction === 'neutral' && '→'}
                      <span>{stat.trend.value}</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}