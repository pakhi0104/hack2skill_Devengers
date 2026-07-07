import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsService } from '../services';
import type { Application, ApplicationDocument, ApplicationStatus } from '../types';

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user?.id) {
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const apps = await applicationsService.getApplications(user.id);
    setApplications(apps);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const startApplication = useCallback(async (app: Omit<Application, 'id' | 'started_at' | 'updated_at'>) => {
    const newApp = await applicationsService.startApplication(app);
    if (newApp) {
      await fetchApplications();
    }
    return newApp;
  }, [fetchApplications]);

  const updateApplicationStatus = useCallback(async (
    id: string,
    status: ApplicationStatus,
    progressPercentage?: number
  ) => {
    if (!user?.id) return null;
    const updated = await applicationsService.updateApplicationStatus(id, user.id, status, progressPercentage);
    if (updated) {
      await fetchApplications();
    }
    return updated;
  }, [user?.id, fetchApplications]);

  const deleteApplication = useCallback(async (id: string) => {
    if (!user?.id) return false;
    const success = await applicationsService.deleteApplication(id, user.id);
    if (success) {
      await fetchApplications();
    }
    return success;
  }, [user?.id, fetchApplications]);

  return {
    applications,
    loading,
    fetchApplications,
    startApplication,
    updateApplicationStatus,
    deleteApplication,
  };
}

export function useApplicationDocuments(applicationId: string | null) {
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!applicationId) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const docs = await applicationsService.getApplicationDocuments(applicationId);
    setDocuments(docs);
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocuments = useCallback(async (docs: Omit<ApplicationDocument, 'id' | 'updated_at'>[]) => {
    if (!applicationId) return [];
    const newDocs = await applicationsService.addApplicationDocuments(applicationId, docs);
    await fetchDocuments();
    return newDocs;
  }, [applicationId, fetchDocuments]);

  const toggleDocument = useCallback(async (id: string, completed: boolean) => {
    const updated = await applicationsService.toggleDocumentCompletion(id, completed);
    if (updated) {
      await fetchDocuments();
    }
    return updated;
  }, [fetchDocuments]);

  const readiness = documents.length > 0
    ? Math.round((documents.filter(d => d.completed).length / documents.length) * 100)
    : 0;

  return {
    documents,
    loading,
    fetchDocuments,
    addDocuments,
    toggleDocument,
    readiness,
  };
}
