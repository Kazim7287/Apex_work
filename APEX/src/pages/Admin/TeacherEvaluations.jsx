/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TeacherEvaluations.css';
import { BsPrinter } from 'react-icons/bs';

const TeacherEvaluations = () => {
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [averageRatings, setAverageRatings] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef();

  // Fetch all teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await axios.get('https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/teach_read.php', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setTeachers(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch teachers');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Network error. Please try again.');
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  const fetchEvaluations = async (id, limit = pagination.limit, offset = pagination.offset) => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/fetch_evaluations.php`, {
        params: {
          teacher_id: id,
          limit,
          offset
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setEvaluations(response.data.data);
        setTeacherInfo(response.data.teacher_info);
        setAverageRatings(response.data.average_ratings);
        setPagination({
          total: response.data.pagination.total,
          limit,
          offset,
          hasMore: response.data.pagination.has_more
        });
      } else {
        setError(response.data.error || 'Failed to fetch evaluations');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherId(teacher.id);
    fetchEvaluations(teacher.id);
  };

  const handleNextPage = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchEvaluations(teacherId, pagination.limit, newOffset);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    fetchEvaluations(teacherId, pagination.limit, newOffset);
  };

  const handlePrint = () => {
    if (!teacherInfo) return;
    
    setIsPrinting(true);
    
    // Use setTimeout to ensure state updates before printing
    setTimeout(() => {
      const printContent = printRef.current;
      const originalContents = document.body.innerHTML;
      
      // Create a print-friendly version
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Teacher Evaluation Report - ${teacherInfo.teach_name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .print-header h1 {
                margin: 0;
                color: #2c3e50;
              }
              .teacher-info {
                margin: 15px 0;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 5px;
              }
              .average-ratings-print {
                margin: 20px 0;
                padding: 15px;
                background-color: #f5f5f5;
                border-radius: 8px;
              }
              .rating-bar-print {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
              }
              .rating-label-print {
                width: 120px;
                font-weight: bold;
              }
              .rating-bar-container-print {
                flex-grow: 1;
                height: 20px;
                background-color: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin: 0 10px;
              }
              .rating-bar-fill-print {
                height: 100%;
                background-color: #ff9800;
              }
              .rating-value-print {
                width: 50px;
                text-align: right;
                font-weight: bold;
              }
              .evaluation-card-print {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                page-break-inside: avoid;
              }
              .evaluation-header-print {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                flex-wrap: wrap;
              }
              .ratings-grid-print {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 10px;
              }
              .rating-item-print {
                display: flex;
                justify-content: space-between;
                padding: 5px;
                background-color: #f9f9f9;
                border-radius: 4px;
                font-size: 14px;
              }
              .comments-print, .suggestions-print {
                margin-top: 10px;
                font-size: 14px;
              }
              .comments-print h4, .suggestions-print h4 {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #616161;
              }
              .print-footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              @media print {
                body {
                  margin: 0.5in;
                }
                .evaluation-card-print {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 250);
    }, 100);
  };

  const RatingBar = ({ value, max = 5, label }) => {
    const percentage = (value / max) * 100;
    
    return (
      <div className="rating-bar">
        <span className="rating-label">{label}:</span>
        <div className="rating-bar-container">
          <div 
            className="rating-bar-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="rating-value">{value.toFixed(2)}</span>
      </div>
    );
  };

  const RatingBarPrint = ({ value, max = 5, label }) => {
    const percentage = (value / max) * 100;
    
    return (
      <div className="rating-bar-print">
        <span className="rating-label-print">{label}:</span>
        <div className="rating-bar-container-print">
          <div 
            className="rating-bar-fill-print" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="rating-value-print">{value.toFixed(2)}</span>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="teacher-evaluations">
      <h1>Teacher Evaluation Dashboard</h1>
      
      <div className="teachers-section">
        <h2>Select a Teacher</h2>
        {loadingTeachers ? (
          <div className="loading">Loading teachers...</div>
        ) : (
          <div className="teachers-grid">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                className={`teacher-button ${selectedTeacher?.id === teacher.id ? 'active' : ''}`}
                onClick={() => handleTeacherSelect(teacher)}
              >
                <div className="teacher-name">{teacher.teach_name}</div>
                <div className="teacher-details">
                  <span>{teacher.Designation}</span>
                  <span>Section: {teacher.teach_sec}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {teacherInfo && (
        <div className="teacher-header">
          <div className="teacher-header-content">
            <h2>Evaluations for {teacherInfo.teach_name}</h2>
            <p>Teacher ID: {teacherInfo.id}</p>
          </div>
          <button 
            className="print-button"
            onClick={handlePrint}
            disabled={isPrinting || evaluations.length === 0}
          >
            <BsPrinter /> {isPrinting ? 'Preparing Report...' : 'Print Report'}
          </button>
        </div>
      )}
      
      {/* Print content (hidden from normal view) */}
      <div ref={printRef} style={{ display: 'none' }}>
        {teacherInfo && (
          <div className="print-content">
            <div className="print-header">
              <h1>Teacher Evaluation Report</h1>
              <h2>{teacherInfo.teach_name}</h2>
              <p>Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="teacher-info">
              <p><strong>Teacher ID:</strong> {teacherInfo.id}</p>
              <p><strong>Total Evaluations:</strong> {pagination.total}</p>
            </div>
            
            {averageRatings && Object.keys(averageRatings).length > 0 && (
              <div className="average-ratings-print">
                <h3>Average Ratings</h3>
                <RatingBarPrint value={averageRatings.avg_clarity} label="Clarity" />
                <RatingBarPrint value={averageRatings.avg_knowledge} label="Knowledge" />
                <RatingBarPrint value={averageRatings.avg_communication} label="Communication" />
                <RatingBarPrint value={averageRatings.avg_availability} label="Availability" />
                <RatingBarPrint value={averageRatings.avg_fairness} label="Fairness" />
                <RatingBarPrint value={averageRatings.avg_overall} label="Overall" />
              </div>
            )}
            
            {evaluations.length > 0 && (
              <div className="evaluations-list-print">
                <h3>Individual Evaluations</h3>
                
                {evaluations.map((evaluation) => (
                  <div key={evaluation.evaluation_id} className="evaluation-card-print">
                    <div className="evaluation-header-print">
                      <span className="student-name">
                        <strong>{evaluation.anonymous ? 'Anonymous' : evaluation.student_name}</strong>
                      </span>
                      <span className="section">{evaluation.section_name}</span>
                      <span className="date">{formatDate(evaluation.submission_date)}</span>
                    </div>
                    
                    <div className="ratings-grid-print">
                      <div className="rating-item-print">
                        <span className="rating-label">Clarity:</span>
                        <span className="rating-value">{evaluation.clarity}/5</span>
                      </div>
                      <div className="rating-item-print">
                        <span className="rating-label">Knowledge:</span>
                        <span className="rating-value">{evaluation.knowledge}/5</span>
                      </div>
                      <div className="rating-item-print">
                        <span className="rating-label">Communication:</span>
                        <span className="rating-value">{evaluation.communication}/5</span>
                      </div>
                      <div className="rating-item-print">
                        <span className="rating-label">Availability:</span>
                        <span className="rating-value">{evaluation.availability}/5</span>
                      </div>
                      <div className="rating-item-print">
                        <span className="rating-label">Fairness:</span>
                        <span className="rating-value">{evaluation.fairness}/5</span>
                      </div>
                      <div className="rating-item-print">
                        <span className="rating-label">Overall:</span>
                        <span className="rating-value">{evaluation.overall}/5</span>
                      </div>
                    </div>
                    
                    {evaluation.comments && (
                      <div className="comments-print">
                        <h4>Comments:</h4>
                        <p>"{evaluation.comments}"</p>
                      </div>
                    )}
                    
                    {evaluation.suggestions && (
                      <div className="suggestions-print">
                        <h4>Suggestions:</h4>
                        <p>"{evaluation.suggestions}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="print-footer">
              <p>Report generated by Apex School Management System</p>
              <p>Page 1 of 1</p>
            </div>
          </div>
        )}
      </div>
      
      {averageRatings && Object.keys(averageRatings).length > 0 && (
        <div className="average-ratings">
          <h3>Average Ratings</h3>
          <RatingBar value={averageRatings.avg_clarity} label="Clarity" />
          <RatingBar value={averageRatings.avg_knowledge} label="Knowledge" />
          <RatingBar value={averageRatings.avg_communication} label="Communication" />
          <RatingBar value={averageRatings.avg_availability} label="Availability" />
          <RatingBar value={averageRatings.avg_fairness} label="Fairness" />
          <RatingBar value={averageRatings.avg_overall} label="Overall" />
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading evaluations...</div>
      ) : evaluations.length > 0 ? (
        <div className="evaluations-list">
          <h3>Individual Evaluations ({pagination.total} total)</h3>
          
          {evaluations.map((evaluation) => (
            <div key={evaluation.evaluation_id} className="evaluation-card">
              <div className="evaluation-header">
                <span className="student-name">
                  {evaluation.anonymous ? 'Anonymous' : evaluation.student_name}
                </span>
                <span className="section">{evaluation.section_name}</span>
                <span className="date">
                  {formatDate(evaluation.submission_date)}
                </span>
              </div>
              
              <div className="ratings-grid">
                <div className="rating-item">
                  <span className="rating-label">Clarity:</span>
                  <span className="rating-value">{evaluation.clarity}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Knowledge:</span>
                  <span className="rating-value">{evaluation.knowledge}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Communication:</span>
                  <span className="rating-value">{evaluation.communication}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Availability:</span>
                  <span className="rating-value">{evaluation.availability}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Fairness:</span>
                  <span className="rating-value">{evaluation.fairness}/5</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Overall:</span>
                  <span className="rating-value">{evaluation.overall}/5</span>
                </div>
              </div>
              
              {evaluation.comments && (
                <div className="comments">
                  <h4>Comments:</h4>
                  <p>{evaluation.comments}</p>
                </div>
              )}
              
              {evaluation.suggestions && (
                <div className="suggestions">
                  <h4>Suggestions:</h4>
                  <p>{evaluation.suggestions}</p>
                </div>
              )}
            </div>
          ))}
          
          <div className="pagination-controls">
            <button 
              onClick={handlePrevPage} 
              disabled={pagination.offset === 0 || loading}
            >
              Previous
            </button>
            <span>
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={!pagination.hasMore || loading}
            >
              Next
            </button>
          </div>
        </div>
      ) : teacherInfo && !loading ? (
        <p>No evaluations found for this teacher.</p>
      ) : null}
    </div>
  );
};

export default TeacherEvaluations;