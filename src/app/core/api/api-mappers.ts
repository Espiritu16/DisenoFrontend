import { ApiCaseStatus, ApiReportStatus } from './api-models';

export const reportStatusLabels: Record<ApiReportStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  DUPLICADO: 'Duplicado',
  RECHAZADO: 'Rechazado',
  ESCALADO: 'Escalado'
};

export const caseStatusLabels: Record<ApiCaseStatus, string> = {
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  ESCALADO: 'Escalado',
  RECHAZADO: 'Rechazado'
};

export function reportStatusLabel(status: ApiReportStatus): string {
  return reportStatusLabels[status] ?? status;
}

export function caseStatusLabel(status: ApiCaseStatus): string {
  return caseStatusLabels[status] ?? status;
}

export function reportStatusFromLabel(label: string): ApiReportStatus | undefined {
  const found = Object.entries(reportStatusLabels).find(([, value]) => value === label);
  return found?.[0] as ApiReportStatus | undefined;
}

export function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}
