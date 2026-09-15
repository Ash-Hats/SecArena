import { apiRequest } from './api';
import { Scenario, SimulationAction, SimulationEvent, SimulationSession } from '../types/simulation';

export const getScenarios = () => apiRequest<Scenario[]>('/simulations/scenarios');
export const getSimulations = () => apiRequest<SimulationSession[]>('/simulations');
export const leavePvpSession = (id: string) => apiRequest<{status: string}>(`/simulations/${encodeURIComponent(id)}/leave`, { method: 'POST' });
export const startSimulation = (scenario_slug = 'linux-reconnaissance-beginner') => apiRequest<SimulationSession>('/simulations/start', { method: 'POST', body: JSON.stringify({ scenario_slug }) });
export const getSimulation = (id: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}`);
export const runSimulationAction = (id: string, input: string) => apiRequest<SimulationAction>(`/simulations/${encodeURIComponent(id)}/action`, { method: 'POST', body: JSON.stringify({ input }) });
export const stopSimulation = (id: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}/stop`, { method: 'POST' });
export const getTimeline = (id: string) => apiRequest<SimulationEvent[]>(`/simulations/${encodeURIComponent(id)}/timeline`);

export const createPvpSession = (scenario_slug: string, team_choice: string, lobby_name: string, flag_format: string, time_limit_minutes?: number) => apiRequest<SimulationSession>('/simulations/pvp/create', { method: 'POST', body: JSON.stringify({ scenario_slug, team_choice, lobby_name, flag_format, time_limit_minutes }) });
export const joinPvpSession = (join_code: string, team_choice: string) => apiRequest<SimulationSession>('/simulations/pvp/join', { method: 'POST', body: JSON.stringify({ join_code, team_choice }) });
export const createPvpFlag = (id: string, flag_content: string, flag_path: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}/create_flag`, { method: 'POST', body: JSON.stringify({ flag_content, flag_path }) });
export const submitPvpFlag = (id: string, flag_content: string) => apiRequest<SimulationSession>(`/simulations/${encodeURIComponent(id)}/submit_flag`, { method: 'POST', body: JSON.stringify({ flag_content, flag_path: '' }) });

export const getPvpHistory = () => apiRequest<SimulationSession[]>('/simulations/pvp/history');
export const getPublicLobbies = () => apiRequest<SimulationSession[]>('/simulations/pvp/public-lobbies');
