
export type Priority = 'high' | 'normal' | 'low';

export type Filter = 'all' | 'active' | 'completed';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  due: string | null;
}

export type NewTask = Omit<Task, 'id' | 'completed' | 'createdAt'>;
export type EditableTask = Omit<Task, 'id' | 'createdAt'>;
