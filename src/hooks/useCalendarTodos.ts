import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface CalendarTodo {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  priority?: 'low' | 'medium' | 'high';
}

export function useCalendarTodos() {
  const { workspace } = useWorkspace();
  const [todos, setTodos] = useState<CalendarTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodos = async () => {
    if (!workspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_todos')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      setTodos((data || []) as CalendarTodo[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [workspace?.id]);

  const createTodo = async (todoData: CreateTodoData) => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in');
        return null;
      }

      const { data, error } = await supabase
        .from('calendar_todos')
        .insert({
          workspace_id: workspace.id,
          created_by: user.id,
          title: todoData.title,
          description: todoData.description || null,
          due_date: todoData.due_date,
          due_time: todoData.due_time || null,
          priority: todoData.priority || 'medium',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating todo:', error);
        toast.error('Failed to create todo');
        return null;
      }

      const newTodo = data as CalendarTodo;
      setTodos(prev => [...prev, newTodo].sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ));
      toast.success('To-do added');
      return newTodo;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return null;
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updates = {
        is_completed: !todo.is_completed,
        completed_at: !todo.is_completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('calendar_todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo:', error);
        toast.error('Failed to update todo');
        return null;
      }

      const updatedTodo = data as CalendarTodo;
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      return data;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return null;
    }
  };

  const updateTodo = async (id: string, updates: Partial<CreateTodoData>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating todo:', error);
        toast.error('Failed to update todo');
        return null;
      }

      const updatedData = data as CalendarTodo;
      setTodos(prev => prev.map(t => t.id === id ? updatedData : t));
      toast.success('To-do updated');
      return data;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return null;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        toast.error('Failed to delete todo');
        return false;
      }

      setTodos(prev => prev.filter(t => t.id !== id));
      toast.success('To-do deleted');
      return true;
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred');
      return false;
    }
  };

  return {
    todos,
    isLoading,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}