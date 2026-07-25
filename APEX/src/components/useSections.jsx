import { useState, useEffect } from "react";
import axios from "axios";

const useSections = () => {
  const [sections, setSections] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Sec_Read.php");
        setSections(response.data);
      } catch (error) {
        console.error("Error fetching sections", error);
      }
    };
    fetchSections();
  }, []);

  const fetchAssignmentsBySection = async (sectionId) => {
    try {
      const response = await axios.get("https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/Filter.php", {
        params: { section_id: sectionId },
      });
      setFilteredAssignments(response.data || []);
    } catch (error) {
      console.error("Error fetching assignments", error);
    }
  };

  return { sections, filteredAssignments, fetchAssignmentsBySection };
};

export default useSections;
