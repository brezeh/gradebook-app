import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [newCourseName, setNewCourseName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentPoints, setNewAssignmentPoints] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentGrades, setStudentGrades] = useState({});
  const [tempGrades, setTempGrades] = useState({});

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('courses')) || []);
    setStudents(JSON.parse(localStorage.getItem('students')) || []);
    setAssignments(JSON.parse(localStorage.getItem('assignments')) || []);
    setStudentGrades(JSON.parse(localStorage.getItem('grades')) || {});
  }, []);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('grades', JSON.stringify(studentGrades));
  }, [courses, students, assignments, studentGrades]);

  const addCourse = () => {
    if (newCourseName.trim()) {
      const updatedCourses = [...courses, { name: newCourseName, students: [], assignments: [] }];
      setCourses(updatedCourses);
      setNewCourseName('');
    }
  };

  const deleteCourse = (index) => {
    const updatedCourses = courses.filter((_, idx) => idx !== index);
    setCourses(updatedCourses);
  };

  const addStudent = () => {
    if (newStudentName.trim() && newStudentEmail.trim()) {
      const student = { fullname: newStudentName, email: newStudentEmail };
      setStudents([...students, student]);
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
      const assignment = { name: newAssignmentName, points: newAssignmentPoints };
      setAssignments([...assignments, assignment]);
      setNewAssignmentName('');
      setNewAssignmentPoints('');
    }
  };

  const deleteAssignment = (index) => {
    const updatedAssignments = assignments.filter((_, idx) => idx !== index);
    setAssignments(updatedAssignments);
  };

  const assignStudentToCourse = (student) => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map((course) => {
      if (course.name === selectedCourse.name) {
        const alreadyAssigned = course.students.some((s) => s.email === student.email);
        if (!alreadyAssigned) {
          return {
            ...course,
            students: [...course.students, student]
          };
        }
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.name === selectedCourse.name));
  };

  const assignAssignmentToCourse = (assignment) => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map((course) => {
      if (course.name === selectedCourse.name) {
        const alreadyAssigned = course.assignments.some((a) => a.name === assignment.name);
        if (!alreadyAssigned) {
          return {
            ...course,
            assignments: [...course.assignments, assignment]
          };
        }
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find(c => c.name === selectedCourse.name));
  };

  const submitGrade = (student, assignment, grade) => {
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) return;

    const updatedGrades = {
      ...studentGrades,
      [assignment.name]: {
        ...studentGrades[assignment.name],
        [student.email]: numericGrade,
      },
    };
    setStudentGrades(updatedGrades);
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
            <li key={index} onClick={() => { setSelectedCourse(course); setSelectedAssignment(null); }}>
              {course.name}
              <button onClick={() => deleteCourse(index)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedCourse && (
        <div className="section">
          <h4>Selected Course: {selectedCourse.name}</h4>

          <h5>Students</h5>
          <ul>
            {selectedCourse.students.map((student, index) => (
              <li key={index}>
                {student.fullname} ({student.email})
                <ul className="nested-list">
                  {selectedCourse.assignments.map((assignment, i) => {
                    const grade = studentGrades[assignment.name]?.[student.email];
                    return (
                      <li key={i}>
                        {assignment.name}: {grade !== undefined ? `${grade}/${assignment.points}` : 'Not graded'}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>

          <h5>Assignments</h5>
          <ul>
            {selectedCourse.assignments.map((assignment, index) => (
              <li key={index}>
                {assignment.name} ({assignment.points} points)
                <button onClick={() => { setSelectedAssignment(assignment); setTempGrades({}); }}>
                  Grade
                </button>
              </li>
            ))}
          </ul>

          <h5>Student Grades (Percentage)</h5>
          <ul>
            {selectedCourse.students.map((student, index) => {
              const grades = selectedCourse.assignments.map((assignment) => {
                const grade = studentGrades[assignment.name]?.[student.email];
                const points = parseFloat(assignment.points);
                return grade != null && points ? (grade / points) * 100 : null;
              });

              const valid = grades.filter(g => g !== null);
              const avg = valid.length > 0
                ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
                : 'N/A';

              return (
                <li key={index}>
                  {student.fullname} - Avg: {avg !== 'N/A' ? `${avg}%` : 'No grades yet'}
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
              {selectedCourse && <button onClick={() => assignStudentToCourse(student)}>Assign to {selectedCourse.name}</button>}
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
              {selectedCourse && <button onClick={() => assignAssignmentToCourse(assignment)}>Assign to {selectedCourse.name}</button>}
            </li>
          ))}
        </ul>
      </div>

      {selectedAssignment && (
        <div className="section">
          <h4>Grade Assignment: {selectedAssignment.name}</h4>
          <ul>
            {selectedCourse?.students.map((student, index) => (
              <li key={index}>
                {student.fullname} - Grade:
                <input
                  type="number"
                  value={tempGrades[student.email] || ''}
                  onChange={(e) => setTempGrades({ ...tempGrades, [student.email]: e.target.value })}
                  placeholder="Enter grade"
                />
                <button
                  onClick={() => {
                    submitGrade(student, selectedAssignment, tempGrades[student.email]);
                    setTempGrades({ ...tempGrades, [student.email]: '' });
                  }}
                >
                  Save Grade
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