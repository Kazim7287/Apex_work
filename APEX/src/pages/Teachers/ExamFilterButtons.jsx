/* eslint-disable react/prop-types */
import { Button } from 'antd';

const ExamFilterButtons = ({ examNames, selectedExam, onFilter }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {examNames.map(examName => (
        <Button
          key={examName}
          type={selectedExam === examName || (examName === 'All' && !selectedExam) ? 'primary' : 'default'}
          onClick={() => onFilter(examName)}
          style={{ borderRadius: 8 }}
        >
          {examName}
        </Button>
      ))}
    </div>
  );
};

export default ExamFilterButtons;