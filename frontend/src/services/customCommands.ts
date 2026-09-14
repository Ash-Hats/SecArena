import { apiRequest } from './api';

export interface CustomCommand {
  id: string;
  command_name: string;
  output?: string;
  description?: string;
  is_real_execution: boolean;
  created_at: string;
}

export interface CustomCommandCreate {
  command_name: string;
  output?: string;
  description?: string;
  is_real_execution: boolean;
}

export const getCustomCommands = async (): Promise<CustomCommand[]> => {
  return await apiRequest<CustomCommand[]>('/admin/commands/');
};

export const createCustomCommand = async (data: CustomCommandCreate): Promise<CustomCommand> => {
  return await apiRequest<CustomCommand>('/admin/commands/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCustomCommand = async (id: string, data: Partial<CustomCommandCreate>): Promise<CustomCommand> => {
  return await apiRequest<CustomCommand>(`/admin/commands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCustomCommand = async (id: string): Promise<void> => {
  await apiRequest<void>(`/admin/commands/${id}`, {
    method: 'DELETE',
  });
};
