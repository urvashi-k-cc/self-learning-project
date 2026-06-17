import * as apiUrl from '../constants/urls'
import api from '../api/axiosInstance'

export const registerUserApi = async (userData) => {
  try {
    const response = await api.post(apiUrl.register, userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed>>>>>>>>>>>>>>>>>>:', error);
    throw error;
  }
}
export const loginUserApi=async(userData)=>{
  try{
    const response = await api.post(apiUrl.login, userData);
    console.log('Login successful:', response.data);
    return response.data;

  }catch(error){
    console.error('Login failed:>>>>>>>>>>>>', error);
    throw error;
  }
}
export const forgetPasswordApi = async (email) => {
  try {
    const response = await api.post(apiUrl.forgotPassword, { email });
    console.log('Forget Password API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Forget Password API Error:', error);
    throw error;
  }
};
export const resetPasswordApi = async ({ token, password }) => {
  try {
    const response = await api.post(apiUrl.resetPassword, { token, password });
    console.log('Reset Password API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reset Password API Error:', error);
    throw error;
  }
}

export const getUserProfileApi = async () => {  
  try {
    const response = await api.get(apiUrl.userProfile);
    console.log('Get User Profile API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get User Profile API Error:', error);
    throw error;
  }
}

export const createProjectApi = async (projectData) => {
  const response = await api.post(apiUrl.projects, projectData);
  return response.data;
};
export const getProjectsApi = async () => {
  const response = await api.get(apiUrl.projects);
  return response.data;
};

export const getProjectByIdApi = async (id) => {
  const response = await api.get(`${apiUrl.projects}/${id}`);
  return response.data;
};

export const createTeamApi = async (teamData) => {
  const response = await api.post(apiUrl.teams, teamData);
  return response.data;
};
export const getTeamsApi = async (projectId) => {
  const params = projectId ? { projectId } : {};
  const response = await api.get(apiUrl.teams, { params });
  return response.data;
};
export const getAssignableUsersApi = async () => {
  const response = await api.get(apiUrl.assignableUsers);
  return response.data;
};

export const deleteProjectApi = async (projectId) => {
  const response = await api.delete(apiUrl.deleteproject(projectId));
  return response.data;
};

export const updateProjectApi = async (projectData) => {
  const response = await api.put(apiUrl.updateproject(projectData.id), projectData);
  return response.data;
};

export const updateProjectMembersApi = async (projectId, members) => {
  const response = await api.put(apiUrl.projectMembers(projectId), { members });
  return response.data;
};

export const getTasksApi = async (projectId) => {
  const params = projectId ? { projectId } : {};
  const response = await api.get(apiUrl.tasks, { params });
  return response.data;
};

export const createTaskApi = async (taskData) => {
  const response = await api.post(apiUrl.tasks, taskData);
  return response.data;
};

export const getTaskByIdApi = async (taskId) => {
  const response = await api.get(apiUrl.taskById(taskId));
  return response.data;
};

export const getTaskMessagesApi = async (taskId) => {
  const response = await api.get(apiUrl.getTaskMessages(taskId));
  return response.data;
};

export const updateTaskApi = async (taskId, taskData) => {
  const response = await api.patch(apiUrl.taskById(taskId), taskData);
  return response.data;
};

export const updateTaskStatusApi = async (taskId, status) => {
  const response = await api.patch(apiUrl.taskStatus(taskId), { status });
  return response.data;
};

export const getProjectDevelopersApi = async (projectId) => {
  const response = await api.get(apiUrl.projectDevelopers(projectId));
  return response.data; 
};

export const deleteTaskApi = async (taskId) => {
  const response = await api.delete(apiUrl.taskById(taskId));
  return response.data;
}

export const userGoogleLoginApi = async (tokenId) => {
  try {
    const response = await api.post(apiUrl.userGoogleLogin, { tokenId });
    console.log('Google Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Google Login failed:>>>>>>>>>>>>', error);
    throw error;
  }
}

export const totalProjectsApi = async () => {
  try {
    const response = await api.get(apiUrl.totalProjects);
    return response.data; 
  } catch (error) {
    throw error;
  };
}

export const totalUsersApi = async () => {
  const response = await api.get(apiUrl.totalUsers);
  return response.data;
};

export const taskStatsApi = async () => {
  const response = await api.get(apiUrl.taskStats);
  return response.data;
};