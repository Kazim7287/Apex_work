import { Link } from 'react-router-dom';

export default function ChooseUser() {
  return (
    <div className="auth-wrap">
      <div>
        <p className="kicker">Login</p>
        <h1 className="display">College portal</h1>
        <p className="font-serif" style={{ fontSize: '1.05rem', maxWidth: '28rem', lineHeight: 1.65, color: '#5b6b82' }}>
          Sign in as a student, teacher or administrator. This is the same Apex College system used
          for attendance, results and administration.
        </p>
      </div>
      <div className="portal-grid">
        <Link className="portal-card" to="/admin-signIn">
          <p className="kicker">01</p>
          <h3>Admin</h3>
          <p>College administration, enrolment and records.</p>
        </Link>
        <Link className="portal-card" to="/teacher-signIn">
          <p className="kicker">02</p>
          <h3>Teachers</h3>
          <p>Attendance, assignments and examination grading.</p>
        </Link>
        <Link className="portal-card" to="/student-signIn">
          <p className="kicker">03</p>
          <h3>Students</h3>
          <p>Timetable, results, fees and announcements.</p>
        </Link>
      </div>
    </div>
  );
}
