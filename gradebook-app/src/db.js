import Dexie from 'dexie';

export const db = new Dexie('GradebookDB');

db.version(1).stores({
  courses: '++id, name',
  students: '++id, name, email, courseIds', 
  assignments: '++id, name, points, courseIds', 
  grades: '++id, courseId, studentId, assignmentId, grade'
});

export default db;