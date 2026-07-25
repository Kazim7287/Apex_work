/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Typography } from 'antd';

const { Text } = Typography;

const PerformanceUpdateModal = ({ 
  isUpdateModalVisible, 
  handleUpdateOk, 
  handleUpdateCancel, 
  updateForm, 
  selectedStudent 
}) => {
  return (
    <Modal
      title={<span style={{ fontWeight: 600 }}>Update Performance</span>}
      visible={isUpdateModalVisible}
      onOk={handleUpdateOk}
      onCancel={handleUpdateCancel}
      okText="Update"
      cancelText="Cancel"
      width={600}
      bodyStyle={{ padding: '24px' }}
      okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff' } }}
      destroyOnClose
    >
      <Form 
        form={updateForm} 
        layout="vertical"
        size="middle"
      >
        <Form.Item
          name="obtained_marks"
          label={
            <Text strong>
              Obtained Marks for {selectedStudent?.std_name || 'Student'}
            </Text>
          }
          rules={[
            { required: true, message: 'Please enter the obtained marks' },
            { 
              type: 'number', 
              min: 0, 
              message: 'Marks cannot be negative' 
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value >= 0) {
                  return Promise.resolve();
                }
                return Promise.reject('Invalid marks value');
              },
            }),
          ]}
        >
          <Input 
            type="number" 
            placeholder="Enter obtained marks" 
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

PerformanceUpdateModal.propTypes = {
  isUpdateModalVisible: PropTypes.bool.isRequired,
  handleUpdateOk: PropTypes.func.isRequired,
  handleUpdateCancel: PropTypes.func.isRequired,
  updateForm: PropTypes.object.isRequired,
  selectedStudent: PropTypes.shape({
    std_name: PropTypes.string,
  }),
};

PerformanceUpdateModal.defaultProps = {
  selectedStudent: { std_name: 'Student' },
};

export default PerformanceUpdateModal;