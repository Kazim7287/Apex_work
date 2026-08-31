import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, message, Typography, Row, Drawer, Col, Layout, Grid, Form,
  Spin, Tag, Input, Select, Progress, Space, Tooltip, Popconfirm,
  Modal, Table, Empty
} from 'antd';
import styled, { css } from 'styled-components';
import Sidebar from './Sidebar';
import StudentsWithoutMarksModal from './StudentsWithoutMarksModal';
import {
  MenuOutlined, BookOutlined, FolderOpenOutlined, SearchOutlined,
  WarningOutlined, TableOutlined, TrophyOutlined, RiseOutlined,
  CheckCircleOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  ReloadOutlined, FileExcelOutlined, BarChartOutlined, UserOutlined,
  AuditOutlined, SafetyCertificateOutlined, StarFilled,
  ArrowRightOutlined, ClearOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, Cell
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;
const { Option } = Select;

/* ============================== THEME ============================== */
const THEME = {
  bg: '#f8fafc', cardBg: '#ffffff', sidebarBg: '#0b132b',
  primary: '#1e3a8a', primaryLight: '#eff6ff', primaryHover: '#1d4ed8',
  gold: '#d97706', goldLight: '#fef3c7', goldBorder: '#fde68a',
  emerald: '#059669', emeraldLight: '#ecfdf5', emeraldBorder: '#a7f3d0',
  rose: '#e11d48', roseLight: '#fff1f2', roseBorder: '#fecdd3',
  indigo: '#4f46e5', indigoLight: '#eef2ff',
  textMain: '#0f172a', textMuted: '#64748b', textLight: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
};

/* ================= helpers (pure, reused everywhere) ================ */
const calculateGrade = (obtained, total) => {
  if (obtained === null || obtained === undefined || total <= 0) return 'Pending';
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

const getProgressColor = (pct) => {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
};

const GRADE_COLORS = {
  'A+': { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  A: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  B: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  C: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  D: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  F: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  Fail: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  Pending: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
};

const API_BASE = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX';

/* ============================ STYLED (responsive) ============================ */
// Fluid spacing/typography via clamp() replaces most fixed-breakpoint duplication,
// so the same rules scale smoothly from small phones up to ultra-wide monitors.
const PageLayout = styled(Layout)`
  min-height: 100vh;
  background-color: ${THEME.bg} !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const ContentWrapper = styled(Content)`
  background-color: ${THEME.bg};
  min-height: calc(100vh - 64px);
  padding: clamp(16px, 3vw, 24px) clamp(12px, 4vw, 32px) clamp(32px, 5vw, 48px);
  box-sizing: border-box;
  width: 100%;
  max-width: 1600px;
  margin: 0;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0b132b 0%, #1c2a4a 50%, #1e3a8a 100%);
  border-radius: clamp(14px, 2vw, 20px);
  padding: clamp(20px, 4vw, 32px) clamp(18px, 4vw, 36px);
  margin-bottom: clamp(20px, 3vw, 28px);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(11, 19, 43, 0.25), 0 8px 10px -6px rgba(11, 19, 43, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: -60px; right: -40px;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -50px; left: 20%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(14px, 2vw, 20px);
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fde68a;
  margin-bottom: 12px;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: clamp(16px, 2.5vw, 22px) clamp(16px, 2.5vw, 24px);
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${THEME.shadowMd};
    border-color: #cbd5e1;
  }
  .stat-icon-wrapper {
    width: clamp(42px, 4vw, 52px);
    height: clamp(42px, 4vw, 52px);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(18px, 2vw, 22px);
    flex-shrink: 0;
    transition: transform 0.25s ease;
  }
  &:hover .stat-icon-wrapper { transform: scale(1.08); }
`;

const StatLabel = styled(Text)`
  color: ${THEME.textMuted};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatValue = styled.div`
  font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 800;
  color: ${(p) => p.$color || '#0f172a'};
  margin: 4px 0 2px;
  line-height: 1.2;
`;

const StatTrend = styled(Text)`
  color: ${(p) => p.$color || THEME.textMuted};
  font-size: 12px;
  font-weight: 600;
`;

const SectionCardWrapper = styled.div`
  background: ${(p) => (p.$active ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' : '#ffffff')};
  border-radius: 16px;
  padding: clamp(18px, 2.5vw, 24px);
  border: 1px solid ${(p) => (p.$active ? THEME.primary : THEME.border)};
  box-shadow: ${(p) => (p.$active ? `0 0 0 2px rgba(30, 58, 138, 0.15), ${THEME.shadowMd}` : THEME.shadowSm)};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${THEME.shadowMd};
    border-color: ${THEME.primary};
  }
  .section-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 3px 8px;
    border-radius: 6px;
    display: inline-block;
  }
`;

const AlertBanner = styled.div`
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  border: 1px solid #fecdd3;
  border-left: 5px solid #e11d48;
  border-radius: 14px;
  padding: clamp(14px, 2vw, 16px) clamp(14px, 3vw, 20px);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(225, 29, 72, 0.08);

  .alert-left { display: flex; align-items: center; gap: 14px; }
  .alert-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: #ffe4e6;
    color: #e11d48;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
`;

const MainCard = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 1px solid ${THEME.border};
  box-shadow: ${THEME.shadowSm};
  overflow: hidden;
  margin-bottom: 32px;
`;

const TableToolbar = styled.div`
  padding: clamp(14px, 2vw, 20px) clamp(14px, 2.5vw, 24px);
  border-bottom: 1px solid ${THEME.border};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterPillsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExamFilterButton = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? '600' : '500')};
  border: 1px solid ${(p) => (p.$active ? THEME.primary : THEME.border)};
  background: ${(p) => (p.$active ? THEME.primary : '#ffffff')};
  color: ${(p) => (p.$active ? '#ffffff' : THEME.textMuted)};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: ${THEME.primary};
    color: ${(p) => (p.$active ? '#ffffff' : THEME.primary)};
    background: ${(p) => (p.$active ? THEME.primaryHover : '#f8fafc')};
  }
  .pill-count {
    background: ${(p) => (p.$active ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9')};
    color: ${(p) => (p.$active ? '#ffffff' : THEME.textMuted)};
    padding: 1px 7px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
  }
`;

const ChartCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid ${THEME.border};
  padding: clamp(16px, 2.5vw, 20px) clamp(16px, 2.5vw, 24px);
  box-shadow: ${THEME.shadowSm};
  height: 100%;
`;

const GradeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  background-color: ${(p) => GRADE_COLORS[p.$grade]?.bg};
  color: ${(p) => GRADE_COLORS[p.$grade]?.text};
  border: 1px solid ${(p) => GRADE_COLORS[p.$grade]?.border};
`;

/* ========================= small shared pieces ========================= */

// One tooltip renderer reused by both charts instead of two near-duplicate blocks.
const ChartTooltip = ({ active, payload, render }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: '#0f172a', color: '#fff', padding: '8px 12px',
      borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      {render(payload[0].payload)}
    </div>
  );
};

const KpiCard = ({ label, value, valueColor, trendText, trendColor, trendIcon, iconBg, iconColor, icon }) => (
  <StatCard>
    <div>
      <StatLabel>{label}</StatLabel>
      <StatValue $color={valueColor}>{value}</StatValue>
      <StatTrend $color={trendColor}>{trendIcon} {trendText}</StatTrend>
    </div>
    <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg, color: iconColor }}>
      {icon}
    </div>
  </StatCard>
);

const SECTION_PALETTE = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', badgeBg: '#dbeafe', icon: <BookOutlined /> },
  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', badgeBg: '#dcfce7', icon: <FolderOpenOutlined /> },
  { bg: '#fef3c7', border: '#fde68a', text: '#b45309', badgeBg: '#fef9c3', icon: <TrophyOutlined /> },
  { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f', badgeBg: '#fae8ff', icon: <StarFilled /> },
];

const SectionCard = ({ assignment, index, active, onSelect }) => {
  const theme = SECTION_PALETTE[index % SECTION_PALETTE.length];
  return (
    <SectionCardWrapper $active={active} onClick={() => onSelect(assignment.section_id)}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span className="section-badge" style={{ backgroundColor: theme.badgeBg, color: theme.text }}>
            SECTION #{assignment.section_id}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: 10, backgroundColor: theme.bg, color: theme.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {theme.icon}
          </div>
        </div>
        <Title level={4} style={{ margin: '0 0 6px 0', color: '#0f172a', fontWeight: 700 }}>
          {assignment.section_name}
        </Title>
        <Text style={{ color: THEME.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOutlined style={{ color: theme.text }} /> {assignment.subject_name}
        </Text>
      </div>
      <div style={{
        marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: theme.text, fontSize: 13 }}>Record Marks</Text>
        <Button type="primary" size="small" shape="circle" icon={<ArrowRightOutlined />}
          style={{ backgroundColor: theme.text, borderColor: theme.text }} />
      </div>
    </SectionCardWrapper>
  );
};

/* ============================ Add Marks Modal ============================ */
const AddMarksModal = ({ open, onCancel, onOk, form, subjects, exams, students, loading }) => (
  <Modal
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          backgroundColor: '#eff6ff', color: '#1e3a8a', width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          <AuditOutlined />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Record Student Marks</Title>
          <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Enter evaluation scores for the entire class section</Text>
        </div>
      </div>
    }
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    okText="Submit Evaluation"
    cancelText="Cancel"
    width="min(780px, 94vw)"
    confirmLoading={loading}
    destroyOnClose
    style={{ top: 24 }}
  >
    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="subject_name" label={<Text strong>Subject</Text>} rules={[{ required: true, message: 'Please select a subject' }]}>
            <Select placeholder="Select Subject" size="large">
              {subjects.map((s) => <Option key={s.subject_id} value={s.subject_name}>{s.subject_name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="exam_name" label={<Text strong>Examination / Assessment</Text>} rules={[{ required: true, message: 'Please select an exam' }]}>
            <Select placeholder="Select Examination" size="large">
              {exams.map((e) => <Option key={e.id} value={e.exam_name}>{e.exam_name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="total_marks"
        label={<Text strong>Total Maximum Marks</Text>}
        rules={[
          { required: true, message: 'Please enter total marks' },
          { pattern: /^[1-9]\d*$/, message: 'Please enter a valid positive number' },
        ]}
      >
        <Input type="number" placeholder="e.g. 100" min={1} size="large" />
      </Form.Item>

      <div style={{ marginTop: 20, padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Class Students ({students.length})</Title>
        <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Enter obtained marks for each student. Leave blank if student was absent.</Text>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
        {students.length > 0 ? students.map((student, idx) => (
          <div key={student.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
            borderRadius: 8, marginBottom: 8, border: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, backgroundColor: '#eff6ff', color: '#1d4ed8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12,
              }}>
                {idx + 1}
              </div>
              <div>
                <Text strong style={{ color: '#0f172a', display: 'block' }}>{student.std_name || 'Student'}</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Roll #{student.roll_no || student.id}</Text>
              </div>
            </div>
            <Form.Item
              name={`student_${student.id}_marks`}
              style={{ margin: 0, width: 140 }}
              rules={[{
                validator: (_, value) => {
                  if (value === undefined || value === '') return Promise.resolve();
                  if (isNaN(value) || value < 0) return Promise.reject('Must be non-negative');
                  return Promise.resolve();
                },
              }]}
            >
              <Input type="number" placeholder="Marks" min={0} style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Empty description="No enrolled students found in this section." />
          </div>
        )}
      </div>
    </Form>
  </Modal>
);

/* =========================== Update Score Modal =========================== */
const UpdateScoreModal = ({ open, onCancel, onOk, form, student, performance, loading }) => (
  <Modal
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          backgroundColor: '#eff6ff', color: '#1e3a8a', width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          <EditOutlined />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Update Performance Score</Title>
          <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Modify evaluation marks for selected student</Text>
        </div>
      </div>
    }
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    okText="Update Score"
    cancelText="Cancel"
    confirmLoading={loading}
    destroyOnClose
    width="min(520px, 94vw)"
  >
    <div style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, backgroundColor: '#eff6ff', color: '#1e3a8a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
        }}>
          <UserOutlined />
        </div>
        <div>
          <Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{student.std_name}</Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Evaluation ID #{performance?.id}</Text>
        </div>
      </div>
      <Row gutter={12}>
        <Col xs={8}>
          <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>SUBJECT</Text>
          <Text strong style={{ fontSize: 13, color: '#334155' }}>{performance?.subject_name || 'N/A'}</Text>
        </Col>
        <Col xs={8}>
          <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>EXAM</Text>
          <Text strong style={{ fontSize: 13, color: '#334155' }}>{performance?.exam_name || 'N/A'}</Text>
        </Col>
        <Col xs={8}>
          <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>MAX MARKS</Text>
          <Text strong style={{ fontSize: 13, color: '#334155' }}>{performance?.total_marks || '100'}</Text>
        </Col>
      </Row>
    </div>

    <Form form={form} layout="vertical">
      <Form.Item
        name="obtained_marks"
        label={<Text strong>Obtained Marks</Text>}
        rules={[
          { required: true, message: 'Please enter obtained marks' },
          { pattern: /^\d+(\.\d+)?$/, message: 'Please enter a valid non-negative number' },
          () => ({
            validator(_, value) {
              const max = Number(performance?.total_marks) || 100;
              if (value !== undefined && Number(value) > max) {
                return Promise.reject(`Marks cannot exceed total marks (${max})`);
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input type="number" placeholder="Enter new obtained marks" min={0} max={performance?.total_marks} size="large" style={{ borderRadius: 8 }} />
      </Form.Item>
    </Form>
  </Modal>
);

/* =============================== MAIN =============================== */
const CheckPerformanceSection = () => {
  const screens = useBreakpoint();
  const [assignments, setAssignments] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isStudentsWithoutMarksModalVisible, setIsStudentsWithoutMarksModalVisible] = useState(false);

  const [performanceData, setPerformanceData] = useState([]);
  const [selectedExamFilter, setSelectedExamFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState({ std_name: 'Student' });
  const [unmarkedStudents, setUnmarkedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  useEffect(() => { checkSessionAndFetchData(); }, []);

  const api = (path, opts) => fetch(`${API_BASE}/${path}`, { credentials: 'include', ...opts });

  const handleSessionExpired = () => message.error('Session expired. Please login again.');

  const checkSessionAndFetchData = async () => {
    setLoading(true);
    try {
      const res = await api('Filter.php');
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data);
        if (data.length > 0) setSelectedSection(data[0].section_id);
        setSessionChecked(true);
        fetchPerformanceData();
      } else {
        throw new Error(data.error || 'Failed to verify session');
      }
    } catch (err) {
      message.error(err.message || 'Session verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const res = await api('teachPerformance.php');
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
        setPerformanceData([]);
      } else {
        const list = Array.isArray(data) ? data : [];
        setPerformanceData(list);
        setUnmarkedStudents(
          list.filter((s) => s.obtained_marks === null || s.obtained_marks === 0).map((s) => s.student_name)
        );
      }
    } catch {
      message.error('Failed to fetch performance data');
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamsForSection = async (sectionId) => {
    if (!sectionId) return;
    try {
      const res = await api(`exam_read.php?section_id=${sectionId}`);
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.status === 'success') setExams(data.data || []);
      else message.error(data.message || 'Failed to fetch exams');
    } catch {
      message.error('Failed to fetch exams');
    }
  };

  const fetchStudentsBySection = async (sectionId) => {
    if (!sectionId) return;
    try {
      const res = await api('SecStudents.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: sectionId }),
      });
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.error) message.error(data.error);
      else setStudents(data.message ? [] : data.section_students || []);
    } catch {
      message.error('Failed to fetch students');
    }
  };

  const handleSectionSelect = (sectionId) => {
    setSelectedSection(sectionId);
    setSubjects(assignments.filter((a) => a.section_id === sectionId));
    fetchStudentsBySection(sectionId);
    fetchExamsForSection(sectionId);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const subject = subjects.find((s) => s.subject_name === values.subject_name);
      const exam = exams.find((e) => e.exam_name === values.exam_name);
      if (!subject || !exam) return message.error('Invalid subject or exam selection');

      const payload = {
        exam_info: {
          subject_id: subject.subject_id,
          section_id: selectedSection,
          exam_id: exam.id,
          exam_name: exam.exam_name,
          total_marks: values.total_marks,
        },
        student_performance: students.map((s) => ({
          student_id: s.id,
          obtained_marks: values[`student_${s.id}_marks`] !== undefined && values[`student_${s.id}_marks`] !== ''
            ? Number(values[`student_${s.id}_marks`]) : 0,
        })),
      };

      setActionLoading(true);
      const res = await api('Performance.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        message.success(data.message || 'Performance records saved successfully!');
        setIsModalVisible(false);
        form.resetFields();
        fetchPerformanceData();
      }
    } catch (err) {
      console.log('Validate Failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (performanceId) => {
    setActionLoading(true);
    try {
      const res = await api('PerformanceDelete.php', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performance_id: performanceId }),
      });
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.error) message.error(data.error);
      else { message.success(data.message || 'Record deleted successfully'); fetchPerformanceData(); }
    } catch {
      message.error('Failed to delete performance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = (record) => {
    if (!record) return message.error('Invalid student record');
    setSelectedPerformance(record);
    setSelectedStudent({ std_name: record.student_name || 'Student', id: record.student_id });
    updateForm.setFieldsValue({ obtained_marks: record.obtained_marks !== null ? record.obtained_marks : '' });
    setIsUpdateModalVisible(true);
  };

  const handleUpdateOk = async () => {
    try {
      const values = await updateForm.validateFields();
      setActionLoading(true);
      const res = await api('Performanceupdate.php', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performance_id: selectedPerformance.id, obtained_marks: Number(values.obtained_marks) }),
      });
      if (res.status === 401) return handleSessionExpired();
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        message.success(data.message || 'Record updated successfully');
        setIsUpdateModalVisible(false);
        updateForm.resetFields();
        fetchPerformanceData();
      }
    } catch (err) {
      console.log('Validate Failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return message.warning('No records available to export.');

    const rows = filteredData.map((item, index) => {
      const total = Number(item.total_marks) || 0;
      const obtained = item.obtained_marks !== null ? Number(item.obtained_marks) : 0;
      const pct = total > 0 && item.obtained_marks !== null ? `${((obtained / total) * 100).toFixed(1)}%` : 'N/A';
      return {
        '#': index + 1,
        'Student Name': item.student_name || 'N/A',
        Section: item.section_name || 'N/A',
        Subject: item.subject_name || 'N/A',
        'Exam Name': item.exam_name || 'N/A',
        'Total Marks': total,
        'Obtained Marks': item.obtained_marks !== null ? obtained : 'Not Marked',
        Percentage: pct,
        Grade: calculateGrade(item.obtained_marks, total),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance Records');
    worksheet['!cols'] = [4, 22, 14, 18, 16, 12, 14, 12, 8].map((wch) => ({ wch }));
    XLSX.writeFile(workbook, `Teacher_Performance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    message.success('Excel report downloaded successfully!');
  };

  const uniqueExamNames = useMemo(
    () => ['All', ...new Set(performanceData.map((i) => i.exam_name).filter(Boolean))],
    [performanceData]
  );

  const filteredData = useMemo(() => performanceData.filter((item) => {
    const matchExam = selectedExamFilter === 'All' || item.exam_name === selectedExamFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || ['student_name', 'subject_name', 'section_name', 'exam_name']
      .some((k) => item[k]?.toLowerCase().includes(query));
    const grade = calculateGrade(item.obtained_marks, Number(item.total_marks) || 0);
    const gradeMap = {
      'Distinction (80%+)': ['A+', 'A'],
      'Good (60-79%)': ['B', 'C'],
      'Pass (50-59%)': ['D'],
      'Failed (<50%)': ['F'],
    };
    const matchGrade = gradeFilter === 'All'
      ? true
      : gradeFilter === 'Unmarked'
        ? (item.obtained_marks === null || item.obtained_marks === 0)
        : gradeMap[gradeFilter]?.includes(grade);
    return matchExam && matchSearch && matchGrade;
  }), [performanceData, selectedExamFilter, searchQuery, gradeFilter]);

  const metrics = useMemo(() => {
    if (performanceData.length === 0) {
      return { totalRecords: 0, averagePercentage: 0, passCount: 0, passRate: 0, unmarkedCount: unmarkedStudents.length };
    }
    let pctSum = 0, validCount = 0, passCount = 0;
    performanceData.forEach((item) => {
      const total = Number(item.total_marks) || 0;
      const obtained = item.obtained_marks;
      if (total > 0 && obtained !== null && obtained !== undefined) {
        const pct = (obtained / total) * 100;
        pctSum += pct;
        validCount++;
        if (pct >= 50) passCount++;
      }
    });
    return {
      totalRecords: performanceData.length,
      averagePercentage: validCount > 0 ? (pctSum / validCount).toFixed(1) : 0,
      passCount,
      passRate: validCount > 0 ? ((passCount / validCount) * 100).toFixed(1) : 0,
      unmarkedCount: unmarkedStudents.length,
    };
  }, [performanceData, unmarkedStudents]);

  const gradeDistributionData = useMemo(() => {
    const counts = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    performanceData.forEach((item) => {
      const g = calculateGrade(item.obtained_marks, Number(item.total_marks) || 0);
      if (counts[g] !== undefined) counts[g]++;
    });
    const fills = { 'A+': '#059669', A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#d97706', F: '#ef4444' };
    const labels = { 'A+': 'A+ (90%+)', A: 'A (80-89%)', B: 'B (70-79%)', C: 'C (60-69%)', D: 'D (50-59%)', F: 'F (<50%)' };
    return Object.keys(counts).map((g) => ({ grade: labels[g], count: counts[g], fill: fills[g] }));
  }, [performanceData]);

  const examComparisonData = useMemo(() => {
    const examMap = {};
    performanceData.forEach((item) => {
      const name = item.exam_name || 'General';
      const total = Number(item.total_marks) || 0;
      if (total > 0 && item.obtained_marks !== null) {
        examMap[name] = examMap[name] || { totalPct: 0, count: 0 };
        examMap[name].totalPct += (item.obtained_marks / total) * 100;
        examMap[name].count++;
      }
    });
    return Object.keys(examMap).map((name) => ({
      examName: name.length > 15 ? `${name.substring(0, 12)}...` : name,
      fullName: name,
      avgScore: (examMap[name].totalPct / examMap[name].count).toFixed(1),
      count: examMap[name].count,
    }));
  }, [performanceData]);

  const kpiCards = [
    {
      label: 'Total Evaluated', value: metrics.totalRecords, trendText: 'Active Records Logged',
      trendColor: '#10b981', trendIcon: <CheckCircleOutlined />, iconBg: '#eff6ff', iconColor: '#1d4ed8', icon: <AuditOutlined />,
    },
    {
      label: 'Class Average', value: `${metrics.averagePercentage}%`, trendText: 'Overall Score Proficiency',
      trendColor: metrics.averagePercentage >= 60 ? '#10b981' : '#f59e0b', trendIcon: <RiseOutlined />,
      iconBg: '#ecfdf5', iconColor: '#059669', icon: <TrophyOutlined />,
    },
    {
      label: 'Pass Rate (≥50%)', value: `${metrics.passRate}%`, trendText: `${metrics.passCount} of ${metrics.totalRecords} Qualified`,
      trendColor: '#6366f1', iconBg: '#fdf4ff', iconColor: '#a855f7', icon: <SafetyCertificateOutlined />,
    },
    {
      label: 'Unmarked Records', value: metrics.unmarkedCount, valueColor: metrics.unmarkedCount > 0 ? '#e11d48' : '#059669',
      trendText: metrics.unmarkedCount > 0 ? 'Action Required' : 'All Clear! Great Job',
      trendColor: metrics.unmarkedCount > 0 ? '#e11d48' : '#059669',
      trendIcon: metrics.unmarkedCount > 0 ? <WarningOutlined /> : <CheckCircleOutlined />,
      iconBg: metrics.unmarkedCount > 0 ? '#fff1f2' : '#f0fdf4', iconColor: metrics.unmarkedCount > 0 ? '#e11d48' : '#16a34a',
      icon: metrics.unmarkedCount > 0 ? <WarningOutlined /> : <CheckCircleOutlined />,
    },
  ];

  const columns = [
    {
      title: 'Student Details', key: 'student', fixed: screens.md ? 'left' : false, width: 220,
      render: (_, record) => {
        const initials = record.student_name
          ? record.student_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, backgroundColor: '#eff6ff', color: '#1e3a8a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
              border: '1px solid #bfdbfe', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <Text strong style={{ color: '#0f172a', fontSize: 14, display: 'block', lineHeight: 1.3 }}>
                {record.student_name || 'Student'}
              </Text>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>ID #{record.student_id || record.id}</Text>
            </div>
          </div>
        );
      },
      sorter: (a, b) => (a.student_name || '').localeCompare(b.student_name || ''),
    },
    {
      title: 'Class & Section', dataIndex: 'section_name', key: 'section_name', width: 140, responsive: ['sm'],
      render: (text) => (
        <Tag style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 600, color: '#334155' }}>
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Subject', dataIndex: 'subject_name', key: 'subject_name', width: 160,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOutlined style={{ color: '#6366f1', fontSize: 14 }} />
          <Text strong style={{ color: '#1e293b' }}>{text || 'N/A'}</Text>
        </div>
      ),
    },
    {
      title: 'Exam', dataIndex: 'exam_name', key: 'exam_name', width: 150, responsive: ['md'],
      render: (text) => (
        <Tag color="geekblue" style={{ borderRadius: 6, padding: '2px 8px', fontWeight: 500 }}>{text || 'General Exam'}</Tag>
      ),
    },
    {
      title: 'Score', key: 'marks_score', align: 'center', width: 130,
      render: (_, record) => {
        const total = Number(record.total_marks) || 0;
        const obtained = record.obtained_marks;
        if (obtained === null || obtained === undefined) return <Tag color="warning" style={{ borderRadius: 6 }}>Not Marked</Tag>;
        return (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{obtained}</span>
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>/ {total}</span>
          </div>
        );
      },
      sorter: (a, b) => (a.obtained_marks || 0) - (b.obtained_marks || 0),
    },
    {
      title: 'Performance', key: 'percentage', width: 180,
      render: (_, record) => {
        const total = Number(record.total_marks) || 0;
        const obtained = record.obtained_marks;
        if (obtained === null || total <= 0) return <Text type="secondary">Pending</Text>;
        const pct = Math.min(100, Math.max(0, (obtained / total) * 100));
        const strokeColor = getProgressColor(pct);
        return (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: strokeColor }}>{pct.toFixed(1)}%</span>
            </div>
            <Progress percent={pct} strokeColor={strokeColor} showInfo={false} size="small" style={{ margin: 0 }} />
          </div>
        );
      },
      sorter: (a, b) => {
        const aPct = a.total_marks ? ((a.obtained_marks || 0) / a.total_marks) * 100 : 0;
        const bPct = b.total_marks ? ((b.obtained_marks || 0) / b.total_marks) * 100 : 0;
        return aPct - bPct;
      },
    },
    {
      title: 'Grade', key: 'grade', align: 'center', width: 100,
      render: (_, record) => {
        const grade = calculateGrade(record.obtained_marks, Number(record.total_marks) || 0);
        return <GradeBadge $grade={grade}>{grade}</GradeBadge>;
      },
    },
    {
      title: 'Actions', key: 'action', align: 'center', width: 130, fixed: screens.md ? 'right' : false,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Student Marks">
            <Button type="text" icon={<EditOutlined style={{ color: '#2563eb' }} />} onClick={() => handleUpdate(record)}
              style={{ backgroundColor: '#eff6ff', borderRadius: 8 }} />
          </Tooltip>
          <Popconfirm title="Delete Record" description="Are you sure you want to delete this evaluation?"
            onConfirm={() => handleDelete(record.id)} okText="Yes, Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
            <Tooltip title="Delete Record">
              <Button type="text" danger icon={<DeleteOutlined />} style={{ backgroundColor: '#fff1f2', borderRadius: 8 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!sessionChecked) {
    return (
      <PageLayout>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Spin size="large" />
            <Text style={{ display: 'block', marginTop: 16, color: THEME.textMuted }}>Loading Performance Dashboard...</Text>
          </div>
        </Content>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {!screens.md && (
        <>
          <Button type="primary" icon={<MenuOutlined />} onClick={() => setIsDrawerVisible(true)} style={{
            position: 'fixed', top: 16, left: 16, zIndex: 1000, backgroundColor: '#0b132b', borderColor: '#0b132b',
            borderRadius: 8, boxShadow: '0 4px 12px rgba(11, 19, 43, 0.25)',
          }} />
          <Drawer placement="left" closable onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible}
            bodyStyle={{ padding: 0, backgroundColor: '#0b132b' }} width="min(280px, 82vw)">
            <Sidebar collapsed={false} />
          </Drawer>
        </>
      )}

      {screens.md && <Sidebar collapsed={!screens.md} />}

      <Layout style={{ backgroundColor: THEME.bg, minWidth: 0 }}>
        <ContentWrapper>
          <HeroBanner>
            <HeroContent>
              <div>
                <HeroBadge><AuditOutlined /> TEACHER PORTAL • ACADEMIC PERFORMANCE</HeroBadge>
                <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontSize: 'clamp(20px, 3vw, 30px)' }}>
                  Student Performance Hub
                </Title>
                <Paragraph style={{ color: '#cbd5e1', margin: '8px 0 0 0', fontSize: 14, maxWidth: 640 }}>
                  Evaluate, record marks, and monitor student academic performance across all your assigned sections and subjects in real-time.
                </Paragraph>
              </div>

              <Space size="middle" wrap>
                <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(8px)', borderRadius: 10, height: 42, fontWeight: 600, padding: '0 18px',
                }}>
                  Export Excel
                </Button>

                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                  if (assignments.length > 0) handleSectionSelect(assignments[0].section_id);
                  else message.info('No assigned sections found');
                }} style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', borderColor: '#d97706',
                  borderRadius: 10, height: 42, fontWeight: 600, padding: '0 20px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                }}>
                  Record Marks
                </Button>

                <Tooltip title="Refresh Data">
                  <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchPerformanceData} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 10, height: 42, width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} />
                </Tooltip>
              </Space>
            </HeroContent>
          </HeroBanner>

          {unmarkedStudents.length > 0 && (
            <AlertBanner>
              <div className="alert-left">
                <div className="alert-icon"><WarningOutlined /></div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#9f1239', fontWeight: 700 }}>
                    Attention: {unmarkedStudents.length} Students Awaiting Marks
                  </Title>
                  <Text style={{ color: '#be123c', fontSize: 13 }}>
                    Some evaluations have zero or unrecorded scores. Complete marking to generate accurate student report cards.
                  </Text>
                </div>
              </div>
              <Button danger type="primary" onClick={() => setIsStudentsWithoutMarksModalVisible(true)} style={{
                borderRadius: 8, fontWeight: 600, height: 38, background: '#e11d48', boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)',
              }}>
                Review & Add Marks ({unmarkedStudents.length})
              </Button>
            </AlertBanner>
          )}

          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
            {kpiCards.map((card) => (
              <Col xs={24} sm={12} lg={6} key={card.label}>
                <KpiCard {...card} />
              </Col>
            ))}
          </Row>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Assigned Classes & Subjects</Title>
                <Text style={{ color: THEME.textMuted, fontSize: 13 }}>Select a section card to quickly enter or update student marks</Text>
              </div>
              <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600, padding: '4px 10px' }}>
                {assignments.length} Assigned Sections
              </Tag>
            </div>

            <Row gutter={[20, 20]}>
              {assignments.map((assignment, index) => (
                <Col key={assignment.section_id} xs={24} sm={12} lg={8} xl={6}>
                  <SectionCard
                    assignment={assignment}
                    index={index}
                    active={selectedSection === assignment.section_id}
                    onSelect={handleSectionSelect}
                  />
                </Col>
              ))}
            </Row>
          </div>

          {performanceData.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BarChartOutlined style={{ color: THEME.primary, fontSize: 18 }} />
                  <Title level={4} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Academic Performance Insights</Title>
                </div>
                <Button type="text" size="small" onClick={() => setShowAnalytics(!showAnalytics)} style={{ color: THEME.primary, fontWeight: 600 }}>
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
              </div>

              {showAnalytics && (
                <Row gutter={[20, 20]}>
                  <Col xs={24} lg={12}>
                    <ChartCard>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Student Grade Distribution</Title>
                        <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Number of students categorized by achievement tiers</Text>
                      </div>
                      <div style={{ height: 240, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                            <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={(p) => (
                              <ChartTooltip {...p} render={(d) => (<><div style={{ fontWeight: 700 }}>{d.grade}</div><div style={{ color: '#93c5fd' }}>{d.count} Students</div></>)} />
                            )} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                              {gradeDistributionData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </Col>

                  <Col xs={24} lg={12}>
                    <ChartCard>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Exam-wise Average Scores (%)</Title>
                        <Text style={{ color: THEME.textMuted, fontSize: 12 }}>Comparative average percentage scored across different examination types</Text>
                      </div>
                      <div style={{ height: 240, width: '100%' }}>
                        {examComparisonData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={examComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="examName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                              <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={(p) => (
                                <ChartTooltip {...p} render={(d) => (<><div style={{ fontWeight: 700 }}>{d.fullName}</div><div style={{ color: '#38bdf8' }}>Average: {d.avgScore}%</div><div style={{ color: '#94a3b8', fontSize: 11 }}>{d.count} submissions</div></>)} />
                              )} />
                              <Bar dataKey="avgScore" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Text type="secondary">No exam comparison data available</Text>
                          </div>
                        )}
                      </div>
                    </ChartCard>
                  </Col>
                </Row>
              )}
            </div>
          )}

          <MainCard>
            <TableToolbar>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', fontSize: 18 }}>
                  <TableOutlined />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Evaluation Records</Title>
                  <Text style={{ color: THEME.textMuted, fontSize: 13 }}>
                    Showing {filteredData.length} of {performanceData.length} records
                  </Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Search student, subject, exam..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  style={{ width: screens.xs ? '100%' : 260, borderRadius: 10 }}
                />

                <Select value={gradeFilter} onChange={setGradeFilter} style={{ width: 160 }}>
                  <Option value="All">All Grades</Option>
                  <Option value="Distinction (80%+)">Distinction (80%+)</Option>
                  <Option value="Good (60-79%)">Good (60-79%)</Option>
                  <Option value="Pass (50-59%)">Pass (50-59%)</Option>
                  <Option value="Failed (<50%)">Failed (&lt;50%)</Option>
                  <Option value="Unmarked">Unmarked (0)</Option>
                </Select>

                {(searchQuery || gradeFilter !== 'All' || selectedExamFilter !== 'All') && (
                  <Button icon={<ClearOutlined />} onClick={() => { setSearchQuery(''); setGradeFilter('All'); setSelectedExamFilter('All'); }} style={{ borderRadius: 8 }}>
                    Reset Filters
                  </Button>
                )}
              </div>
            </TableToolbar>

            {uniqueExamNames.length > 1 && (
              <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Text strong style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter by Exam:</Text>
                <FilterPillsContainer>
                  {uniqueExamNames.map((examName) => {
                    const count = examName === 'All' ? performanceData.length : performanceData.filter((d) => d.exam_name === examName).length;
                    return (
                      <ExamFilterButton key={examName} $active={selectedExamFilter === examName} onClick={() => setSelectedExamFilter(examName)}>
                        {examName}<span className="pill-count">{count}</span>
                      </ExamFilterButton>
                    );
                  })}
                </FilterPillsContainer>
              </div>
            )}

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading || actionLoading}
              pagination={{
                pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} evaluations`,
                style: { padding: '16px 24px' },
              }}
              scroll={{ x: 900 }}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                    <div>
                      <Text strong style={{ display: 'block', color: '#334155' }}>No performance records match your filters</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>Try searching for a different keyword or reset filters</Text>
                    </div>
                  } />
                ),
              }}
            />
          </MainCard>
        </ContentWrapper>
      </Layout>

      <AddMarksModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
        form={form}
        subjects={subjects}
        exams={exams}
        students={students}
        loading={actionLoading}
      />

      <UpdateScoreModal
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        onOk={handleUpdateOk}
        form={updateForm}
        student={selectedStudent}
        performance={selectedPerformance}
        loading={actionLoading}
      />

      <StudentsWithoutMarksModal
        isVisible={isStudentsWithoutMarksModalVisible}
        onClose={() => setIsStudentsWithoutMarksModalVisible(false)}
        refreshParent={fetchPerformanceData}
      />
    </PageLayout>
  );
};

export default CheckPerformanceSection;