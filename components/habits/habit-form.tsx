"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useCreateHabit, useUpdateHabit } from "@/lib/hooks/useHabits"
import { getXpForDifficulty } from "@/lib/utils/xp"
import { toast } from "react-hot-toast"

const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Name too long"),
  description: z.string().optional(),
  category: z.enum(['health', 'productivity', 'mindfulness', 'learning', 'social', 'custom']),
  color: z.string(),
  icon: z.string(),
  frequency_type: z.enum(['daily', 'weekly', 'specific_days', 'custom']),
  frequency_config: z.record(z.any()).optional(),
  preferred_time: z.string().optional(),
  estimated_duration: z.number().optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
})

type HabitFormData = z.infer<typeof habitSchema>

const CATEGORY_OPTIONS = [
  { value: 'health', label: 'Health', icon: '💪', color: '#10b981' },
  { value: 'productivity', label: 'Productivity', icon: '🎯', color: '#6366f1' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#a855f7' },
  { value: 'learning', label: 'Learning', icon: '📚', color: '#f59e0b' },
  { value: 'social', label: 'Social', icon: '👥', color: '#ec4899' },
  { value: 'custom', label: 'Custom', icon: '✨', color: '#8b5cf6' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface HabitFormContentProps {
  userId: string
  onSuccess?: () => void
  initialData?: Partial<HabitFormData>
  habitId?: string // For edit mode
  isEditMode?: boolean
}

export function HabitFormContent({ userId, onSuccess, initialData, habitId, isEditMode = false }: HabitFormContentProps) {
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const [selectedDays, setSelectedDays] = useState<number[]>(
    (initialData?.frequency_config as any)?.days || []
  )
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || 'health')
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialData?.difficulty_level || 'medium')
  const [duration, setDuration] = useState([initialData?.estimated_duration || 30])

  const categoryData = CATEGORY_OPTIONS.find(c => c.value === selectedCategory)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || 'health',
      color: initialData?.color || categoryData?.color || '#6366f1',
      icon: initialData?.icon || categoryData?.icon || '✨',
      frequency_type: initialData?.frequency_type || 'daily',
      difficulty_level: initialData?.difficulty_level || 'medium',
      estimated_duration: initialData?.estimated_duration || 30,
      preferred_time: initialData?.preferred_time || undefined,
    },
  })

  // Watch category to update icon and color when it changes
  const watchedCategory = watch('category')

  // Update icon and color when category changes
  useEffect(() => {
    const newCategoryData = CATEGORY_OPTIONS.find(c => c.value === selectedCategory)
    if (newCategoryData) {
      setValue('category', selectedCategory as any)
      setValue('color', newCategoryData.color)
      setValue('icon', newCategoryData.icon)
    }
  }, [selectedCategory, setValue])

  const onSubmit = async (data: HabitFormData) => {
    try {
      // Ensure we use the selected category, icon, and color (in case form state is out of sync)
      const finalCategory = selectedCategory || data.category
      const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === finalCategory)
      const finalData = {
        ...data,
        category: finalCategory as any,
        icon: categoryInfo?.icon || data.icon,
        color: categoryInfo?.color || data.color,
      }

      // Build frequency config based on type (must be JSONB)
      let frequencyConfig: Record<string, any> = {}
      if (finalData.frequency_type === 'specific_days') {
        frequencyConfig = { days: selectedDays }
      } else if (finalData.frequency_type === 'daily') {
        frequencyConfig = {}
      }

      if (isEditMode && habitId) {
        // Update existing habit
        await updateHabit.mutateAsync({
          id: habitId,
          updates: {
            ...finalData,
            frequency_config: frequencyConfig,
            preferred_time: finalData.preferred_time || null,
            estimated_duration: duration[0] || null,
            xp_value: getXpForDifficulty(finalData.difficulty_level),
          },
        })
        toast.success('Habit updated successfully! 🎉')
      } else {
        // Create new habit
        await createHabit.mutateAsync({
          ...finalData,
          user_id: userId,
          frequency_config: frequencyConfig, // JSONB field
          preferred_time: finalData.preferred_time || null,
          time_flexibility: 60, // Default from schema
          estimated_duration: duration[0] || null,
          xp_value: getXpForDifficulty(finalData.difficulty_level),
          is_archived: false,
          is_template: false,
          template_name: null,
          stack_order: null,
          depends_on: null,
        })
        toast.success('Habit created successfully! 🎉')
      }
      
      onSuccess?.()
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update habit' : 'Failed to create habit')
    }
  }

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update your habit details' : 'Build a habit that aligns with your goals and values'}
        </DialogDescription>
      </DialogHeader>

      {/* Habit Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Morning Meditation"
          {...register('name')}
          maxLength={60}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Why is this habit important to you?"
          {...register('description')}
          rows={3}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value as any)
                setValue('category', cat.value as any)
                setValue('color', cat.color)
                setValue('icon', cat.icon)
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                selectedCategory === cat.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label>Frequency *</Label>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" onClick={() => register('frequency_type').onChange({ target: { value: 'daily' }})}>
              Daily
            </TabsTrigger>
            <TabsTrigger value="specific_days" onClick={() => register('frequency_type').onChange({ target: { value: 'specific_days' }})}>
              Specific Days
            </TabsTrigger>
            <TabsTrigger value="weekly" onClick={() => register('frequency_type').onChange({ target: { value: 'weekly' }})}>
              Weekly
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="text-sm text-muted-foreground mt-2">
            This habit will be scheduled every day
          </TabsContent>
          <TabsContent value="specific_days" className="space-y-2 mt-2">
            <div className="flex gap-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`flex-1 py-2 px-1 text-xs rounded-md border transition-all ${
                    selectedDays.includes(index)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="text-sm text-muted-foreground mt-2">
            Complete X times per week (coming soon)
          </TabsContent>
        </Tabs>
      </div>

      {/* Preferred Time */}
      <div className="space-y-2">
        <Label htmlFor="preferred_time">Preferred Time (Optional)</Label>
        <Input
          id="preferred_time"
          type="time"
          {...register('preferred_time')}
        />
        <p className="text-xs text-muted-foreground">When do you feel most energized?</p>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label>Estimated Duration: {duration[0]} minutes</Label>
        <Slider
          value={duration}
          onValueChange={setDuration}
          min={5}
          max={120}
          step={5}
          className="w-full"
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty *</Label>
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {[
            { value: 'easy', label: 'Easy', xp: 10, color: 'bg-green-100 border-green-500 text-green-700' },
            { value: 'medium', label: 'Medium', xp: 20, color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
            { value: 'hard', label: 'Hard', xp: 30, color: 'bg-red-100 border-red-500 text-red-700' },
          ].map((diff) => (
            <button
              key={diff.value}
              type="button"
              onClick={() => setSelectedDifficulty(diff.value as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedDifficulty === diff.value
                  ? diff.color
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{diff.label}</div>
              <div className="text-xs">+{diff.xp} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={isEditMode ? updateHabit.isPending : createHabit.isPending}
      >
        {isEditMode 
          ? (updateHabit.isPending ? 'Updating...' : 'Update Habit')
          : (createHabit.isPending ? 'Creating...' : 'Create Habit')
        }
      </Button>
    </form>
  )
}

