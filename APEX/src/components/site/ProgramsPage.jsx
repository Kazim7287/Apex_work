import { Link } from 'react-router-dom';

const PROGRAMS = [
  { code: '01', title: 'F.Sc Pre-Medical', copy: 'Biology, chemistry and physics for medical, dental and life-science pathways.' },
  { code: '02', title: 'F.Sc Pre-Engineering', copy: 'Mathematics, physics and chemistry for engineering and applied sciences.' },
  { code: '03', title: 'ICS', copy: 'Computer science with mathematics for software, IT and related degrees.' },
  { code: '04', title: 'F.A / General Science', copy: 'Humanities and general science for students who want a broader intermediate base.' },
];

export default function ProgramsPage() {
  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Academics</p>
        <h1>Programs</h1>
      </header>
      <section className="section" style={{ paddingTop: 0 }}>
        <p style={{ maxWidth: '40rem', lineHeight: 1.7, color: '#334155' }}>
          Intermediate programmes recognised by the board. Choose the group that matches your
          university goal, then work it with faculty who stay with you through the year.
        </p>
      </section>
      <section className="section ink-panel" data-nav-theme="dark">
        {PROGRAMS.map((p) => (
          <Link to="/admissions" className="program-row" key={p.code}>
            <em>{p.code}</em>
            <strong>{p.title}</strong>
            <b>{p.copy}</b>
          </Link>
        ))}
      </section>
    </div>
  );
}
