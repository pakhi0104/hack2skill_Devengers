import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Application, ApplicationDocument, ApplicationStatus } from '../types';

// Local storage keys for mock mode
const MOCK_APPLICATIONS_KEY = 'schemematch_mock_applications';
const MOCK_APPLICATION_DOCUMENTS_KEY = 'schemematch_mock_application_documents';

export const applicationsService = {
  /**
   * Get all applications for the current user
   */
  async getApplications(userId: string): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATIONS_KEY);
      if (mockData) {
        const allApps: Application[] = JSON.parse(mockData);
        return allApps.filter(a => a.user_id === userId)
                      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      }
      return [];
    }
  },

  /**
   * Get a single application by ID
   */
  async getApplication(id: string): Promise<Application | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching application:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATIONS_KEY);
      if (mockData) {
        const allApps: Application[] = JSON.parse(mockData);
        return allApps.find(a => a.id === id) || null;
      }
      return null;
    }
  },

  /**
   * Start tracking a new application
   */
  async startApplication(app: Omit<Application, 'id' | 'started_at' | 'updated_at'>): Promise<Application | null> {
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .insert([newApp])
        .select()
        .single();
      
      if (error) {
        console.error('Error starting application:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATIONS_KEY);
      const allApps: Application[] = mockData ? JSON.parse(mockData) : [];
      allApps.push(newApp);
      localStorage.setItem(MOCK_APPLICATIONS_KEY, JSON.stringify(allApps));
      return newApp;
    }
  },

  /**
   * Update application status
   */
  async updateApplicationStatus(
    id: string,
    userId: string,
    status: ApplicationStatus,
    progressPercentage?: number
  ): Promise<Application | null> {
    const updates: Partial<Application> = {
      current_status: status,
      updated_at: new Date().toISOString(),
    };
    if (progressPercentage !== undefined) {
      updates.progress_percentage = progressPercentage;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating application:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATIONS_KEY);
      if (mockData) {
        const allApps: Application[] = JSON.parse(mockData);
        const index = allApps.findIndex(a => a.id === id && a.user_id === userId);
        if (index !== -1) {
          allApps[index] = { ...allApps[index], ...updates };
          localStorage.setItem(MOCK_APPLICATIONS_KEY, JSON.stringify(allApps));
          return allApps[index];
        }
      }
      return null;
    }
  },

  /**
   * Delete an application
   */
  async deleteApplication(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting application:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATIONS_KEY);
      if (mockData) {
        const allApps: Application[] = JSON.parse(mockData);
        const filteredApps = allApps.filter(a => a.id !== id);
        localStorage.setItem(MOCK_APPLICATIONS_KEY, JSON.stringify(filteredApps));
      }
      return true;
    }
  },

  /**
   * Get documents for an application
   */
  async getApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('document_name');
      
      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATION_DOCUMENTS_KEY);
      if (mockData) {
        const allDocs: ApplicationDocument[] = JSON.parse(mockData);
        return allDocs.filter(d => d.application_id === applicationId)
                      .sort((a, b) => a.document_name.localeCompare(b.document_name));
      }
      return [];
    }
  },

  /**
   * Add documents to an application
   */
  async addApplicationDocuments(
    applicationId: string,
    documents: Omit<ApplicationDocument, 'id' | 'updated_at'>[]
  ): Promise<ApplicationDocument[]> {
    const newDocs: ApplicationDocument[] = documents.map(doc => ({
      ...doc,
      id: crypto.randomUUID(),
      updated_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('application_documents')
        .insert(newDocs)
        .select();
      
      if (error) {
        console.error('Error adding documents:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATION_DOCUMENTS_KEY);
      const allDocs: ApplicationDocument[] = mockData ? JSON.parse(mockData) : [];
      allDocs.push(...newDocs);
      localStorage.setItem(MOCK_APPLICATION_DOCUMENTS_KEY, JSON.stringify(allDocs));
      return newDocs;
    }
  },

  /**
   * Toggle document completion status
   */
  async toggleDocumentCompletion(
    id: string,
    completed: boolean
  ): Promise<ApplicationDocument | null> {
    const updates = {
      completed,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('application_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating document:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_APPLICATION_DOCUMENTS_KEY);
      if (mockData) {
        const allDocs: ApplicationDocument[] = JSON.parse(mockData);
        const index = allDocs.findIndex(d => d.id === id);
        if (index !== -1) {
          allDocs[index] = { ...allDocs[index], ...updates };
          localStorage.setItem(MOCK_APPLICATION_DOCUMENTS_KEY, JSON.stringify(allDocs));
          return allDocs[index];
        }
      }
      return null;
    }
  },
};
