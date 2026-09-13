import { apiRequest } from './api';
import { EventStatus, TrainingEvent, TrainingEventPayload } from '../types/event';

export const getInstructorEvents = () => apiRequest<TrainingEvent[]>('/events/manage');
export const getPublishedEvents = () => apiRequest<TrainingEvent[]>('/events');
export const getEvent = (eventId: string) => apiRequest<TrainingEvent>(`/events/${encodeURIComponent(eventId)}`);
export const saveEvent = (payload: TrainingEventPayload, eventId?: string) => apiRequest<TrainingEvent>(eventId ? `/events/${encodeURIComponent(eventId)}` : '/events', { method: eventId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
export const setEventStatus = (eventId: string, status: EventStatus) => apiRequest<TrainingEvent>(`/events/${encodeURIComponent(eventId)}/status`, { method: 'POST', body: JSON.stringify({ status }) });
export const joinEvent = (joinCode: string) => apiRequest<TrainingEvent>('/events/join', { method: 'POST', body: JSON.stringify({ join_code: joinCode }) });
