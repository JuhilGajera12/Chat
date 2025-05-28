import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

export type Task = {
  id: string;
  creator: string;
  task: string;
};

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, {rejectWithValue}) => {
    try {
      const tasksRef = firestore().collection('tasks');
      const tasksSnapshot = await tasksRef.get();
      return tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, {rejectWithValue}) => {
    try {
      const taskDoc = await firestore().collection('tasks').doc(taskId).get();
      if (!taskDoc.exists()) {
        return rejectWithValue('Task not found');
      }
      return {
        id: taskDoc.id,
        ...taskDoc.data(),
      } as Task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task');
    }
  },
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: state => {
      state.currentTask = null;
      state.error = null;
    },
    clearTasks: state => {
      state.tasks = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Task by ID
      .addCase(fetchTaskById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearCurrentTask, clearTasks} = taskSlice.actions;
export default taskSlice.reducer; 