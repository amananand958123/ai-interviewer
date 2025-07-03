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
<<<<<<< HEAD
  selectedTechStack: 'Generic',
  selectedLevel: 'Basic',
  pendingNavigationPath: null,

  showInterviewGuidelines: (techStack = 'Generic', level = 'Basic', navigationPath = '/technical-interview') => {
=======
  selectedTechStack: 'JavaScript',
  selectedLevel: 'Basic',
  pendingNavigationPath: null,

  showInterviewGuidelines: (techStack = 'JavaScript', level = 'Basic', navigationPath = '/technical-interview') => {
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
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
