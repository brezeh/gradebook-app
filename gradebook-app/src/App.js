import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [newCourseName, setNewCourseName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentPoints, setNewAssignmentPoints] = useState('');
  
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const addCourse = () => {
    if (newCourseName.trim()) {
      setCourses([...courses, { name: newCourseName }]);
      setNewCourseName('');
    }
  };

  const deleteCourse = (index) => {
    const updatedCourses = courses.filter((_, idx) => idx !== index);
    setCourses(updatedCourses);
  };

  const addStudent = () => {
    if (newStudentName.trim() && newStudentEmail.trim()) {
      setStudents([...students, { fullname: newStudentName, email: newStudentEmail }]);
      setNewStudentName('');
      setNewStudentEmail('');
    }
  };

  const deleteStudent = (index) => {
    const updatedStudents = students.filter((_, idx) => idx !== index);
    setStudents(updatedStudents);
  };

  const addAssignment = () => {
    if (newAssignmentName.trim() && newAssignmentPoints.trim()) {
      setAssignments([...assignments, { name: newAssignmentName, points: newAssignmentPoints }]);
      setNewAssignmentName('');
      setNewAssignmentPoints('');
    }
  };

  const deleteAssignment = (index) => {
    const updatedAssignments = assignments.filter((_, idx) => idx !== index);
    setAssignments(updatedAssignments);
  };

  return (
    <div className="container">
      <h3>Gradebook App</h3>

      <div className="section">
        <h4>Create Course</h4>
        <input
          type="text"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
          placeholder="Enter course name"
        />
        <button onClick={addCourse}>Create Course</button>
        <ul>
          {courses.map((course, index) => (
            <li key={index}>
              {course.name}
              <button onClick={() => deleteCourse(index)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h4>Create Student</h4>
        <input
          type="text"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          placeholder="Enter student's full name"
        />
        <input
          type="email"
          value={newStudentEmail}
          onChange={(e) => setNewStudentEmail(e.target.value)}
          placeholder="Enter student's email"
        />
        <button onClick={addStudent}>Create Student</button>
        <ul>
          {students.map((student, index) => (
            <li key={index}>
              {student.fullname} ({student.email})
              <button onClick={() => deleteStudent(index)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h4>Create Assignment</h4>
        <input
          type="text"
          value={newAssignmentName}
          onChange={(e) => setNewAssignmentName(e.target.value)}
          placeholder="Enter assignment name"
        />
        <input
          type="number"
          value={newAssignmentPoints}
          onChange={(e) => setNewAssignmentPoints(e.target.value)}
          placeholder="Enter total points"
        />
        <button onClick={addAssignment}>Create Assignment</button>
        <ul>
          {assignments.map((assignment, index) => (
            <li key={index}>
              {assignment.name} ({assignment.points} points)
              <button onClick={() => deleteAssignment(index)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;