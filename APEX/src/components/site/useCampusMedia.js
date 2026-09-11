import { useEffect, useState } from 'react';
import { API_ROOT, remoteImage, FALLBACK_IMAGES } from './media';

export function useCampusMedia() {
  const [sections, setSections] = useState([]);
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`${API_ROOT}get_about_sections.php`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const rows = data.data || [];
        const withImages = await Promise.all(
          rows.map(async (section) => {
            try {
              const imagesResponse = await fetch(
                `${API_ROOT}imagesread.php?section_id=${section.id}`
              );
              const imagesData = imagesResponse.ok ? await imagesResponse.json() : { data: [] };
              const list = (imagesData.data || []).map((item) => ({
                ...item,
                src: remoteImage(item.image_path),
              }));
              return {
                ...section,
                content: section.content || section.description || '',
                images: list,
              };
            } catch {
              return { ...section, content: section.content || '', images: [] };
            }
          })
        );
        if (cancelled) return;
        setSections(withImages);
        const collected = withImages.flatMap((s) => s.images.map((i) => i.src));
        if (collected.length) setImages(collected);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { sections, images, loading };
}

export function useFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`${API_ROOT}faculty.php`);
        if (!response.ok) throw new Error('Failed to fetch faculty');
        const data = await response.json();
        if (!cancelled && data.success) setFaculty(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { faculty, loading };
}
