'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FeatureCardProps {
  title: string
  subtitle?: string
  description: string
  icon?: ReactNode
  emoji?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    color?: string
  }
  actions?: Array<{
    text: string
    href: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    icon?: ReactNode
    color?: string
  }>
  stats?: Array<{
    value: string | number
    label: string
    color?: string
  }>
  className?: string
  delay?: number
}

export function FeatureCard({ 
  title, 
  subtitle, 
  description, 
  icon, 
  emoji,
  badge,
  actions = [],
  stats = [],
  className = "",
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group"
    >
      <Card className={`h-full bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group-hover:scale-[1.02] ${className}`}>
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="text-center mb-6">
            {(icon || emoji) && (
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                {emoji ? (
                  <span className="text-3xl">{emoji}</span>
                ) : icon ? (
                  <div className="text-blue-600 w-10 h-10">{icon}</div>
                ) : null}
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-blue-600 font-semibold text-lg">{subtitle}</p>
              )}
              {badge && (
                <Badge 
                  variant={badge.variant || 'default'} 
                  className={badge.color ? `bg-${badge.color}-100 text-${badge.color}-700 border-${badge.color}-200` : ''}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6 text-center text-base">
            {description}
          </p>

          {/* Stats Section */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color ? `text-${stat.color}-600` : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions Section */}
          {actions.length > 0 && (
            <div className="space-y-3">
              {actions.map((action, index) => (
                <Link key={index} href={action.href} className="block">
                  <Button 
                    variant={action.variant || 'default'}
                    className={`w-full flex items-center justify-center gap-2 group ${
                      action.color ? `bg-${action.color}-600 hover:bg-${action.color}-700 text-white` : ''
                    }`}
                  >
                    {action.icon && (
                      <span className="group-hover:scale-110 transition-transform">
                        {action.icon}
                      </span>
                    )}
                    <span>{action.text}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}