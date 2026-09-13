import { apiRequest } from './api';
import { Scenario, SimulationAction, SimulationEvent, SimulationSession } from '../types/simulation';

export const getScenarios = () => apiRequest<Scenario[]>('/simulations/scenarios');
export const startSimulation = (scenario_slug = 'linux-reconnaissance-beginner') => apiRequest<SimulationSession>('/simulations/start', { method: 'POST', body: JSON.stringify({ scenario_slug }) });
export const getSimulation = (id: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}`);
export const runSimulationAction = (id: string, input: string) => apiRequest<SimulationAction>(`/simulations/${encodeURIComponent(id)}/action`, { method: 'POST', body: JSON.stringify({ input }) });
export const stopSimulation = (id: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}/stop`, { method: 'POST' });
export const getTimeline = (id: string) => apiRequest<SimulationEvent[]>(`/simulations/${encodeURIComponent(id)}/timeline`);
