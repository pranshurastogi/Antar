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
import { useAIHabitDescription } from "@/lib/hooks/useAI"
import { getXpForDifficulty } from "@/lib/utils/xp"
import { toast } from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Icons } from "@/lib/icons"
import { Spinner } from "@/components/ui/spinner"

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
  const { generate: generateDescription, isLoading: aiDescriptionLoading } = useAIHabitDescription()
  const [selectedDays, setSelectedDays] = useState<number[]>(
    (initialData?.frequency_config as any)?.days || []
  )
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || 'health')
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialData?.difficulty_level || 'medium')
  const [duration, setDuration] = useState([initialData?.estimated_duration || 30])
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || categoryData?.icon || '✨')
  const [iconManuallyChanged, setIconManuallyChanged] = useState(!!initialData?.icon)

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
      icon: selectedIcon,
      frequency_type: initialData?.frequency_type || 'daily',
      difficulty_level: initialData?.difficulty_level || 'medium',
      estimated_duration: initialData?.estimated_duration || 30,
      preferred_time: initialData?.preferred_time || undefined,
    },
  })

  // Watch category to update icon and color when it changes
  const watchedCategory = watch('category')

  // Update icon and color when category changes (only if icon hasn't been manually changed)
  useEffect(() => {
    const newCategoryData = CATEGORY_OPTIONS.find(c => c.value === selectedCategory)
    if (newCategoryData) {
      setValue('category', selectedCategory as any)
      setValue('color', newCategoryData.color)
      // Only auto-update icon if user hasn't manually changed it
      if (!iconManuallyChanged) {
        setValue('icon', newCategoryData.icon)
        setSelectedIcon(newCategoryData.icon)
      }
    }
  }, [selectedCategory, setValue, iconManuallyChanged])

  const onSubmit = async (data: HabitFormData) => {
    try {
      // Use the actual selected values from state, not form defaults
      const finalCategory = selectedCategory || data.category
      const categoryInfo = CATEGORY_OPTIONS.find(c => c.value === finalCategory)
      const finalData = {
        ...data,
        category: finalCategory as any,
        icon: selectedIcon, // Use the selected icon from state
        color: categoryInfo?.color || data.color,
        difficulty_level: selectedDifficulty as any, // Use the selected difficulty from state
      }

      // Build frequency config based on type (must be JSONB)
      let frequencyConfig: Record<string, any> = {}
      if (finalData.frequency_type === 'specific_days') {
        frequencyConfig = { days: selectedDays }
      } else if (finalData.frequency_type === 'daily') {
        frequencyConfig = {}
      }

      if (isEditMode && habitId) {
        // Update existing habit - explicitly include all fields
        await updateHabit.mutateAsync({
          id: habitId,
          updates: {
            name: finalData.name,
            description: finalData.description || null,
            category: finalData.category,
            color: finalData.color,
            icon: finalData.icon, // Explicitly include icon
            frequency_type: finalData.frequency_type,
            frequency_config: frequencyConfig,
            preferred_time: finalData.preferred_time || null,
            estimated_duration: duration[0] || null,
            difficulty_level: finalData.difficulty_level, // Explicitly include difficulty_level
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
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description (Optional)</Label>
          <button
            type="button"
            onClick={async () => {
              const habitName = watch('name')
              if (!habitName) {
                toast.error("Please enter a habit name first")
                return
              }
              
              const description = await generateDescription(habitName, selectedCategory)
              if (description) {
                setValue('description', description)
                toast.success("Description generated! ✨")
              }
            }}
            disabled={aiDescriptionLoading || !watch('name')}
            className="flex items-center gap-2 text-xs sm:text-sm text-[#26547C] dark:text-[#60A5FA] hover:text-[#26547C]/80 dark:hover:text-[#60A5FA]/80 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] px-3 py-2 touch-manipulation"
          >
            {aiDescriptionLoading ? (
              <>
                <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={Icons.sparkles} className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Notebook Generate</span>
              </>
            )}
          </button>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value as any)
                setValue('category', cat.value as any)
                setValue('color', cat.color)
                // Only auto-set icon if user hasn't manually changed it
                if (!iconManuallyChanged) {
                  setValue('icon', cat.icon)
                  setSelectedIcon(cat.icon)
                }
              }}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[80px] touch-manipulation ${
                selectedCategory === cat.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-gray-200 hover:border-gray-300 active:border-indigo-400'
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1">{cat.icon}</span>
              <span className="text-xs sm:text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <span className="text-4xl">{selectedIcon}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Choose a custom icon for your habit</p>
          </div>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {[
            '💪', '🏃', '🧘', '📚', '🎯', '💧', '🍎', '🥗',
            '🏋️', '🚶', '🧠', '📖', '✍️', '🎨', '🎵', '🎬',
            '🌱', '🌳', '☀️', '🌙', '⭐', '🔥', '💎', '🎁',
            '📝', '✅', '🎉', '💯', '🏆', '🌟', '✨', '💫',
            '🔋', '⚡', '💡', '🎊', '🎈', '🎪', '🎭', '🎨',
            '🏠', '🌍', '🗺️', '📱', '💻', '⌚', '📊', '📈',
            '🧪', '🔬', '🌡️', '💊', '🏥', '❤️', '💚', '💙',
            '🧩', '🎲', '🃏', '🎴', '🖼️', '📷', '🎥', '🎞️',
            '🎤', '🎧', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻',
            '🏀', '⚽', '🎾', '🏐', '🏓', '🏸', '🥊', '🤸',
          ].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setSelectedIcon(emoji)
                setValue('icon', emoji)
                setIconManuallyChanged(true)
              }}
              className={`text-2xl sm:text-3xl p-2 rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90 touch-manipulation ${
                selectedIcon === emoji
                  ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                  : ''
              }`}
            >
              {emoji}
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
            <div className="flex gap-1 sm:gap-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`flex-1 py-2 sm:py-3 px-1 text-xs sm:text-sm rounded-md border transition-all min-h-[44px] touch-manipulation ${
                    selectedDays.includes(index)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:border-indigo-300 active:bg-indigo-50'
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { value: 'easy', label: 'Easy', xp: 10, color: 'bg-green-100 border-green-500 text-green-700' },
            { value: 'medium', label: 'Medium', xp: 20, color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
            { value: 'hard', label: 'Hard', xp: 30, color: 'bg-red-100 border-red-500 text-red-700' },
          ].map((diff) => (
            <button
              key={diff.value}
              type="button"
              onClick={() => {
                setSelectedDifficulty(diff.value as any)
                setValue('difficulty_level', diff.value as any)
              }}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[60px] touch-manipulation ${
                selectedDifficulty === diff.value
                  ? diff.color
                  : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm sm:text-base">{diff.label}</div>
              <div className="text-xs sm:text-sm">+{diff.xp} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 min-h-[48px] text-base touch-manipulation"
        disabled={isEditMode ? updateHabit.isPending : createHabit.isPending}
        size="lg"
      >
        {isEditMode 
          ? (updateHabit.isPending ? 'Updating...' : 'Update Habit')
          : (createHabit.isPending ? 'Creating...' : 'Create Habit')
        }
      </Button>
    </form>
  )
}

