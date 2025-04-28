import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import './App.css';

const App = () => {
  const [newCourseName, setNewCourseName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentPoints, setNewAssignmentPoints] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [tempGrades, setTempGrades] = useState({});

  const courses = useLiveQuery(() => db.courses.toArray(), []);
  const students = useLiveQuery(() => db.students.toArray(), []);
  const assignments = useLiveQuery(() => db.assignments.toArray(), []);
  const grades = useLiveQuery(() => db.grades.toArray(), []);

  const selectedCourse = courses?.find(c => c.id === selectedCourseId);
  const selectedAssignment = assignments?.find(a => a.id === selectedAssignmentId);

  const getStudentsForCourse = (courseId) =>
    students?.filter(s => s.courseIds?.includes(courseId)) || [];

  const getAssignmentsForCourse = (courseId) =>
    assignments?.filter(a => a.courseIds?.includes(courseId)) || [];

  const getGrade = (assignmentId, studentId) =>
    grades?.find(g => g.assignmentId === assignmentId && g.studentId === studentId)?.grade;

  const calculateAverage = (studentId) => {
    const courseAssignments = getAssignmentsForCourse(selectedCourseId);
    const validGrades = courseAssignments
      .map(a => {
        const grade = getGrade(a.id, studentId);
        return grade != null ? (grade / a.points) * 100 : null;
      })
      .filter(g => g !== null);

    if (validGrades.length === 0) return 'No grades yet';
    return `${(validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)}%`;
  };

  const addCourse = async () => {
    if (newCourseName.trim()) {
      await db.courses.add({ name: newCourseName });
      setNewCourseName('');
    }
  };

  const deleteCourse = async (id) => {
    await db.courses.delete(id);
    setSelectedCourseId(null);
  };

  const addStudent = async () => {
    if (newStudentName.trim() && newStudentEmail.trim()) {
      await db.students.add({ name: newStudentName, email: newStudentEmail, courseIds: [] });
      setNewStudentName('');
      setNewStudentEmail('');
    }
  };

  const deleteStudent = async (id) => {
    await db.students.delete(id);
  };

  const addAssignment = async () => {
    if (newAssignmentName.trim() && newAssignmentPoints.trim()) {
      await db.assignments.add({ name: newAssignmentName, points: parseFloat(newAssignmentPoints), courseIds: [] });
      setNewAssignmentName('');
      setNewAssignmentPoints('');
    }
  };

  const deleteAssignment = async (id) => {
    await db.assignments.delete(id);
  };

  const assignStudentToCourse = async (student) => {
    if (!selectedCourseId) return;
    const courseIds = student.courseIds || [];
    if (!courseIds.includes(selectedCourseId)) {
      await db.students.update(student.id, { courseIds: [...courseIds, selectedCourseId] });
    }
  };

  const assignAssignmentToCourse = async (assignment) => {
    if (!selectedCourseId) return;
    const courseIds = assignment.courseIds || [];
    if (!courseIds.includes(selectedCourseId)) {
      await db.assignments.update(assignment.id, { courseIds: [...courseIds, selectedCourseId] });
    }
  };

  const submitGrade = async (studentId, assignmentId, grade) => {
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) return;

    const existing = await db.grades
      .where({ studentId, assignmentId })
      .first();

    if (existing) {
      await db.grades.update(existing.id, { grade: numericGrade });
    } else {
      await db.grades.add({ studentId, assignmentId, grade: numericGrade });
    }

    setTempGrades({ ...tempGrades, [studentId]: '' });
  };

  return (
    <div className="container">
      <h2>Gradebook App</h2>

      <div className="section">
        <h3>Create Course</h3>
        <input value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="Course name" />
        <button onClick={addCourse}>Add Course</button>
        <ul>
          {courses?.map(course => (
            <li key={course.id}>
              <span onClick={() => setSelectedCourseId(course.id)} className="clickable">{course.name}</span>
              <button className="delete-button" onClick={() => deleteCourse(course.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedCourse && (
        <div className="section">
          <h3>Course: {selectedCourse.name}</h3>

          <h4>Students</h4>
          <ul>
            {getStudentsForCourse(selectedCourse.id).map(student => (
              <li key={student.id}>
                {student.name} ({student.email})
                <ul className="nested-list">
                  {getAssignmentsForCourse(selectedCourse.id).map(a => (
                    <li key={a.id}>
                      {a.name}: {getGrade(a.id, student.id) ?? 'Not graded'} / {a.points}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <h4>Assignments</h4>
          <ul>
            {getAssignmentsForCourse(selectedCourse.id).map(a => (
              <li key={a.id}>
                {a.name} ({a.points} points)
                <button onClick={() => setSelectedAssignmentId(a.id)}>Grade</button>
              </li>
            ))}
          </ul>

          <h4>Grade Averages</h4>
          <ul>
            {getStudentsForCourse(selectedCourse.id).map(student => (
              <li key={student.id}>
                {student.name}: {calculateAverage(student.id)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <h3>Create Student</h3>
        <input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Student name" />
        <input value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} placeholder="Student email" />
        <button onClick={addStudent}>Add Student</button>
        <ul>
          {students?.map(student => (
            <li key={student.id}>
              {student.name} ({student.email})
              <button className="delete-button" onClick={() => deleteStudent(student.id)}>Delete</button>
              {selectedCourse && <button onClick={() => assignStudentToCourse(student)}>Assign to {selectedCourse.name}</button>}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Create Assignment</h3>
        <input value={newAssignmentName} onChange={(e) => setNewAssignmentName(e.target.value)} placeholder="Assignment name" />
        <input type="number" value={newAssignmentPoints} onChange={(e) => setNewAssignmentPoints(e.target.value)} placeholder="Points" />
        <button onClick={addAssignment}>Add Assignment</button>
        <ul>
          {assignments?.map(a => (
            <li key={a.id}>
              {a.name} ({a.points} pts)
              <button className="delete-button" onClick={() => deleteAssignment(a.id)}>Delete</button>
              {selectedCourse && <button onClick={() => assignAssignmentToCourse(a)}>Assign to {selectedCourse.name}</button>}
            </li>
          ))}
        </ul>
      </div>

      {selectedAssignment && selectedCourse && (
        <div className="section">
          <h3>Grade: {selectedAssignment.name}</h3>
          <ul>
            {getStudentsForCourse(selectedCourse.id).map(student => (
              <li key={student.id}>
                {student.name} - Grade:
                <input
                  type="number"
                  value={tempGrades[student.id] || ''}
                  onChange={(e) => setTempGrades({ ...tempGrades, [student.id]: e.target.value })}
                />
                <button onClick={() => submitGrade(student.id, selectedAssignment.id, tempGrades[student.id])}>
                  Save
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;