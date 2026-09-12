import { RevealImage } from './Reveal';
import { CAMPUS_PHOTOS } from './media';

const AREAS = [
  { title: 'Campus', src: CAMPUS_PHOTOS.hero },
  { title: 'Courtyard', src: CAMPUS_PHOTOS.courtyard },
  { title: 'Science labs', src: CAMPUS_PHOTOS.scienceLab },
  { title: 'Computer lab', src: CAMPUS_PHOTOS.computerLab },
  { title: 'Library', src: CAMPUS_PHOTOS.library },
  { title: 'Classrooms', src: CAMPUS_PHOTOS.classroom },
  { title: 'Sports', src: CAMPUS_PHOTOS.sports },
  { title: 'Corridors', src: CAMPUS_PHOTOS.corridor },
  { title: 'Science labs', src: CAMPUS_PHOTOS.scienceLab },
  { title: 'Computer lab', src: CAMPUS_PHOTOS.computerLab },
  { title: 'Library', src: CAMPUS_PHOTOS.library },
  { title: 'Classrooms', src: CAMPUS_PHOTOS.classroom },
];

export default function CampusPage() {
  return (
    <div>
      <header className="page-hero">
        <p className="kicker">Student life</p>
        <h1>Campus</h1>
      </header>
      <section className="section" style={{ paddingTop: 0 }}>
        <p style={{ maxWidth: '38rem', lineHeight: 1.7, color: '#334155' }}>
          Near Harichand Bazar on Peshawar Road — laboratories, library, courtyard and sports ground
          for a full college year, not only lecture hours.
        </p>
      </section>
      <section className="masonry site-pad" style={{ paddingBottom: '5rem' }}>
        {AREAS.map((room) => (
          <RevealImage key={room.title} src={room.src} alt={room.title} />
        ))}
      </section>
    </div>
  );
}
