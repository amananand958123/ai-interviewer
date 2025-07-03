import { create } from 'zustand'

interface UIStore {
  // Interview Guidelines Overlay
  showGuidelinesOverlay: boolean
  selectedTechStack: string
  selectedLevel: string
  pendingNavigationPath: string | null
  
  // Actions
  showInterviewGuidelines: (techStack?: string, level?: string, navigationPath?: string) => void
  hideGuidelinesOverlay: () => void
  proceedWithNavigation: () => string | null
  setSelectedTechStack: (techStack: string) => void
  setSelectedLevel: (level: string) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  showGuidelinesOverlay: false,
  selectedTechStack: 'Generic',
  selectedLevel: 'Basic',
  pendingNavigationPath: null,

  showInterviewGuidelines: (techStack = 'Generic', level = 'Basic', navigationPath = '/technical-interview') => {
    set({
      showGuidelinesOverlay: true,
      selectedTechStack: techStack,
      selectedLevel: level,
      pendingNavigationPath: navigationPath
    })
  },

  hideGuidelinesOverlay: () => {
    set({
      showGuidelinesOverlay: false,
      pendingNavigationPath: null
    })
  },

  proceedWithNavigation: () => {
    const { pendingNavigationPath } = get()
    set({
      showGuidelinesOverlay: false,
      pendingNavigationPath: null
    })
    return pendingNavigationPath
  },

  setSelectedTechStack: (techStack: string) => {
    set({ selectedTechStack: techStack })
  },

  setSelectedLevel: (level: string) => {
    set({ selectedLevel: level })
  }
}))
