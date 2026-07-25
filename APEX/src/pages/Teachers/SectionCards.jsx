/* eslint-disable react/prop-types */
import { Button, Row, Col } from 'antd';

const SectionCards = ({ assignments, onSectionSelect, loading }) => {
  return (
    <Row gutter={[12, 12]}>
      {assignments.map((assignment) => (
        <Col key={assignment.section_id} xs={24} sm={12} md={8} lg={6}>
          <Button 
            type="primary" 
            onClick={() => onSectionSelect(assignment.section_id)}
            loading={loading}
            style={{
              width: '100%',
              height: 80,
              fontSize: 16,
              fontWeight: 500,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              boxShadow: '0 4px 8px rgba(24, 144, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.3s',
            }}
          >
            <div>{assignment.section_name}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              {assignment.subject_name}
            </div>
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default SectionCards;