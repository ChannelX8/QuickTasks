// file: src/utils/sorters.js
const priorityOrder = {
  high: 1,
  normal: 2,
  low: 3,
};

export const sortBySpec = (tasks) => {
  return tasks.sort((a, b) => {
    // 1. Incomplete before completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // 2. Priority order: high < normal < low
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // 3. Earlier due date first; tasks with no due sort after those with due
    if (a.due && b.due) {
      const dateA = new Date(a.due).getTime();
      const dateB = new Date(b.due).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
    } else if (a.due) {
      return -1; // a has due, b does not -> a comes first
    } else if (b.due) {
      return 1; // b has due, a does not -> b comes first
    }

    // 4. Newer createdAt first (desc)
    return b.createdAt - a.createdAt;
  });
};
