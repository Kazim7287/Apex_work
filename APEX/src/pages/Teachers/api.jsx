export const fetchAssignments = async (teacherId) => {
  const response = await fetch(`http://localhost/CMS/Filter.php?teacher_id=${teacherId}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
};

export const fetchPerformanceData = async (teacherId) => {
  const response = await fetch(`http://localhost/CMS/teachPerformance.php?teacher_id=${teacherId}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
};

export const fetchStudentsBySection = async (sectionId) => {
  const response = await fetch('http://localhost/CMS/secstudents.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_id: sectionId })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.section_students || [];
};

export const submitPerformance = async (data) => {
  const response = await fetch('http://localhost/CMS/performance.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const deletePerformance = async (performanceId) => {
  const response = await fetch('http://localhost/CMS/PerformanceDelete.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ performance_id: performanceId })
  });
  return await response.json();
};

export const updatePerformance = async (data) => {
  const response = await fetch('http://localhost/CMS/Performanceupdate.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};