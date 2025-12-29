"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Users, Star } from "lucide-react"
import { useCreateHabit } from "@/lib/hooks/useHabits"
import { toast } from "react-hot-toast"
import type { HabitTemplate } from "@/lib/types/database"
import { FunLoader } from "@/components/ui/fun-loader"

interface TemplatesBrowserProps {
  userId: string
}

export function TemplatesBrowser({ userId }: TemplatesBrowserProps) {
  const supabase = createClient()
  const createHabit = useCreateHabit()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_templates')
        .select('*')
        .eq('is_featured', true)
        .order('use_count', { ascending: false })

      if (error) throw error
      return data as HabitTemplate[]
    },
  })

  const applyTemplate = async (template: HabitTemplate) => {
    try {
      const habits = template.habits as any[]
      
      // Create all habits from template
      for (const habitData of habits) {
        await createHabit.mutateAsync({
          user_id: userId,
          name: habitData.name,
          description: habitData.description || null,
          category: habitData.category,
          color: habitData.color || '#6366f1',
          icon: habitData.icon || '✨',
          frequency_type: habitData.frequency_type || 'daily',
          frequency_config: habitData.frequency_config || {},
          difficulty_level: habitData.difficulty_level || 'medium',
          xp_value: habitData.xp_value || 20,
          is_archived: false,
          is_template: false,
        })
      }

      toast.success(`Added ${habits.length} habits from template! 🎉`)
    } catch (error) {
      toast.error('Failed to apply template')
    }
  }

  if (isLoading) {
    return <FunLoader message="Loading templates..." size="md" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {templates?.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <Badge className="w-fit mb-2">{template.category}</Badge>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {template.description}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{template.estimated_time_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Used by {template.use_count.toLocaleString()} people</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>{template.rating.toFixed(1)} rating</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                {(template.habits as any[]).length} habits included
              </p>
              <div className="flex flex-wrap gap-1">
                {(template.habits as any[]).slice(0, 3).map((habit: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {habit.name}
                  </Badge>
                ))}
                {(template.habits as any[]).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(template.habits as any[]).length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => applyTemplate(template)}
              disabled={createHabit.isPending}
            >
              {createHabit.isPending ? 'Adding...' : 'Use Template'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

