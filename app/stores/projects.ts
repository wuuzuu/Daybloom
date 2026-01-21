import { defineStore } from 'pinia'
import type { Project } from '~/types'

interface DBProject {
  id: string
  user_id: string
  crew: string
  jira_link: string | null
  title: string
  notion_link: string | null
  status: string
  created_at: string
  updated_at: string
}

interface ProjectsState {
  projects: Project[]
  crews: string[] // 사용자가 사용한 크루 목록
  isLoading: boolean
  isInitialized: boolean
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    crews: [],
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    // 활성 프로젝트만
    activeProjects: (state): Project[] => {
      return state.projects.filter(p => p.status === 'active')
    },
    
    // 완료된 프로젝트
    completedProjects: (state): Project[] => {
      return state.projects.filter(p => p.status === 'completed')
    },
    
    // 일시정지된 프로젝트
    pausedProjects: (state): Project[] => {
      return state.projects.filter(p => p.status === 'paused')
    },
    
    // 크루별 프로젝트
    projectsByCrew: (state) => (crew: string): Project[] => {
      return state.projects.filter(p => p.crew === crew)
    },
    
    // 고유 크루 목록
    uniqueCrews: (state): string[] => {
      const crewSet = new Set(state.projects.map(p => p.crew))
      return Array.from(crewSet).sort()
    },
  },

  actions: {
    async fetchProjects() {
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) {
        this.isInitialized = true
        return
      }
      
      this.isLoading = true
      
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Failed to fetch projects:', error)
      } else if (data) {
        this.projects = (data as DBProject[]).map((row) => ({
          id: row.id,
          crew: row.crew,
          jiraLink: row.jira_link || undefined,
          title: row.title,
          notionLink: row.notion_link || undefined,
          status: row.status as Project['status'],
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
        }))
        
        // 크루 목록 업데이트
        this.crews = this.uniqueCrews
      }
      
      this.isLoading = false
      this.isInitialized = true
    },
    
    async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) {
        console.error('No authenticated user found')
        return null
      }
      
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('projects')
        .insert({
          user_id: user.id,
          crew: project.crew,
          jira_link: project.jiraLink || null,
          title: project.title,
          notion_link: project.notionLink || null,
          status: project.status,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Failed to create project:', error)
        return null
      }
      
      const row = data as DBProject
      const newProject: Project = {
        id: row.id,
        crew: row.crew,
        jiraLink: row.jira_link || undefined,
        title: row.title,
        notionLink: row.notion_link || undefined,
        status: row.status as Project['status'],
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }
      
      this.projects.unshift(newProject)
      
      // 크루 목록 업데이트
      if (!this.crews.includes(project.crew)) {
        this.crews.push(project.crew)
        this.crews.sort()
      }
      
      return newProject
    },
    
    async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const now = new Date().toISOString()
      
      const updatePayload: Record<string, unknown> = {
        updated_at: now,
      }
      
      if (updates.crew !== undefined) updatePayload.crew = updates.crew
      if (updates.jiraLink !== undefined) updatePayload.jira_link = updates.jiraLink || null
      if (updates.title !== undefined) updatePayload.title = updates.title
      if (updates.notionLink !== undefined) updatePayload.notion_link = updates.notionLink || null
      if (updates.status !== undefined) updatePayload.status = updates.status
      
      const { error } = await (supabase as any)
        .from('projects')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Failed to update project:', error)
        return false
      }
      
      // 로컬 상태 업데이트
      const index = this.projects.findIndex(p => p.id === id)
      const current = this.projects[index]
      if (index !== -1 && current) {
        this.projects[index] = {
          id: current.id,
          crew: updates.crew ?? current.crew,
          jiraLink: updates.jiraLink ?? current.jiraLink,
          title: updates.title ?? current.title,
          notionLink: updates.notionLink ?? current.notionLink,
          status: updates.status ?? current.status,
          createdAt: current.createdAt,
          updatedAt: Date.now(),
        }
      }
      
      return true
    },
    
    async deleteProject(id: string): Promise<boolean> {
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const { error } = await (supabase as any)
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Failed to delete project:', error)
        return false
      }
      
      this.projects = this.projects.filter(p => p.id !== id)
      return true
    },
    
    // ID로 프로젝트 찾기
    getProjectById(id: string): Project | undefined {
      return this.projects.find(p => p.id === id)
    },
  },
})
