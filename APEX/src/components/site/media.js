import logo from '../../assets/images.png';
import principal from '../../assets/clg4.png';
import campusHero from '../../assets/campus/apex-campus-hero.png';
import courtyard from '../../assets/campus/apex-courtyard.png';
import scienceLab from '../../assets/campus/apex-science-lab.png';
import computerLab from '../../assets/campus/apex-computer-lab.png';
import library from '../../assets/campus/apex-library.png';
import classroom from '../../assets/campus/apex-classroom.png';
import sports from '../../assets/campus/apex-sports.png';
import corridor from '../../assets/campus/apex-corridor.png';

export const API_ROOT =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';
export const IMAGE_ROOT = 'https://white-trout-460511.hostingersite.com/APEX/';

export const brand = { logo, principal };

export const CAMPUS_PHOTOS = {
  hero: campusHero,
  courtyard,
  scienceLab,
  computerLab,
  library,
  classroom,
  sports,
  corridor,
};

export const FALLBACK_IMAGES = [
  campusHero,
  courtyard,
  scienceLab,
  computerLab,
  library,
  classroom,
  sports,
  corridor,
];

export function remoteImage(path) {
  if (!path) return CAMPUS_PHOTOS.hero;
  if (String(path).startsWith('http')) return path;
  return `${IMAGE_ROOT}${path}`;
}
