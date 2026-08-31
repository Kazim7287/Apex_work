import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  Layout,
  List,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import Sidebar from './Sidebar';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const EVENTS_API =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/get_events.php';

const COLORS = {
  bg: '#f8fafc',
  sidebar: '#0b132b',
  border: '#e2e8f0',
  navy: '#0f172a',
  muted: '#64748b',
  gold: '#c59b27',
  goldBg: '#fef3c7',
  goldBorder: '#fcd34d',
  green: '#059669',
  greenBg: '#d1fae5',
  actionBlue: '#1e3a8a',
  actionBlueHover: '#1e40af',
};

const Page = styled(Layout)`
  min-height: 100vh;
  background: ${COLORS.bg} !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

/* Wraps the desktop/tablet Sider so the blue trigger button can be
   pinned to its edge and animate together with the collapse. */
const SidebarShell = styled.div`
  position: relative;
  display: flex;
  flex-shrink: 0;
`;

const NavigationSider = styled(Sider)`
  background: ${COLORS.sidebar} !important;
  transition: all 0.2s ease;

  .ant-layout-sider-children {
    background: ${COLORS.sidebar};
  }

  /* antd's built-in trigger is disabled (trigger={null}); this hides
     any leftover default trigger styling defensively. */
  .ant-layout-sider-trigger {
    display: none !important;
  }
`;

/* The "additional blue component" — a floating circular toggle that
   sits on the sidebar's edge. Always present, but this is what the
   user sees appear/flip when the sidebar is minimized/expanded. */
const SidebarTrigger = styled.button`
  position: absolute;
  top: 26px;
  right: -14px;
  z-index: 30;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: ${COLORS.actionBlue};
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.3);
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: ${COLORS.actionBlueHover};
    transform: scale(1.08);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.actionBlueHover};
    outline-offset: 2px;
  }
`;

const ContentLayout = styled(Layout)`
  background: ${COLORS.bg} !important;
  min-width: 0; /* allow content to shrink instead of overflowing */
`;

const TopHeader = styled(Header)`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 80px;
  height: auto;
  padding: 16px 40px !important;
  background: ${COLORS.bg} !important;
  border-bottom: none;

  @media (max-width: 768px) {
    padding: 14px 20px !important;
  }

  @media (max-width: 480px) {
    padding: 12px 16px !important;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const BreadcrumbText = styled.div`
  margin-bottom: 2px;
  color: ${COLORS.muted};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;

  span {
    color: ${COLORS.navy};
    font-weight: 600;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const DashboardTitle = styled(Title)`
  && {
    margin: 0;
    color: ${COLORS.navy};
    font-size: clamp(17px, 2.4vw, 22px);
    font-weight: 800;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const RoleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${COLORS.goldBorder};
  border-radius: 12px;
  background: ${COLORS.goldBg};
  color: ${COLORS.gold};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  @media (max-width: 560px) {
    display: none;
  }
`;

const HomeButton = styled(Button)`
  && {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    background: #fff;
    color: ${COLORS.navy};

    &:hover {
      border-color: ${COLORS.gold};
      color: ${COLORS.gold};
    }
  }
`;

const UserPill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px 4px 6px;
  border: 1px solid ${COLORS.border};
  border-radius: 20px;
  background: #fff;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${COLORS.navy};
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const UserMeta = styled.div`
  strong,
  span {
    display: block;
    line-height: 1.2;
  }

  strong {
    color: ${COLORS.navy};
    font-size: 12px;
    font-weight: 700;
  }

  span {
    color: ${COLORS.muted};
    font-size: 10px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const MainContent = styled(Content)`
  background: ${COLORS.bg} !important;
  padding: 12px 40px 40px 40px !important;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 12px 20px 32px 20px !important;
  }

  @media (max-width: 480px) {
    padding: 12px 14px 28px 14px !important;
  }
`;

const QuickCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const TopBorderCard = styled(Card)`
  && {
    position: relative;
    border: 1px solid ${COLORS.border};
    border-top: 3px solid ${COLORS.gold};
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);

    .ant-card-body {
      padding: 24px;
    }

    @media (max-width: 480px) {
      .ant-card-body {
        padding: 18px;
      }
    }
  }
`;

const CardInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const CardContent = styled.div`
  min-width: 0;

  small {
    display: block;
    color: ${COLORS.muted};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  h2 {
    margin: 6px 0 10px 0;
    color: ${COLORS.navy};
    font-size: clamp(17px, 2vw, 20px);
    font-weight: 800;
  }

  a {
    color: ${({ linkcolor }) => linkcolor || COLORS.actionBlue};
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CardIconBox = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${({ bg }) => bg};
  color: ${({ color }) => color};
  font-size: 20px;
  flex-shrink: 0;
`;

const MainPanelCard = styled(Card)`
  && {
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);

    .ant-card-head {
      min-height: 72px;
      padding: 0 24px;
      border-bottom: 1px solid ${COLORS.border};
    }

    .ant-card-head-wrapper {
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px 0;
    }

    .ant-card-body {
      padding: 8px 24px 20px 24px;
    }

    @media (max-width: 576px) {
      .ant-card-head {
        padding: 0 16px;
      }

      .ant-card-body {
        padding: 8px 16px 20px 16px;
      }
    }
  }
`;

const TableHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const CategoryIconBox = styled.div`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${COLORS.goldBg};
  color: ${COLORS.gold};
  font-size: 18px;
  flex-shrink: 0;
`;

const TableTitleGroup = styled.div`
  min-width: 0;

  h3 {
    margin: 0;
    color: ${COLORS.navy};
    font-size: 17px;
    font-weight: 800;
    white-space: nowrap;
  }

  p {
    margin: 2px 0 0 0;
    color: ${COLORS.muted};
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 480px) {
    p {
      display: none;
    }
  }
`;

const TableHeaderRight = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const SearchInput = styled(Input)`
  && {
    width: clamp(130px, 24vw, 200px);
    border-radius: 8px;
    background: #f8fafc;
  }
`;

const ActionIconButton = styled(Button)`
  && {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    flex-shrink: 0;
  }
`;

const CreateButton = styled(Button)`
  && {
    height: 38px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    border-radius: 10px;
    background: ${COLORS.gold};
    color: #fff;
    font-weight: 600;
    flex-shrink: 0;

    &:hover,
    &:focus {
      background: #b38a20 !important;
      color: #fff !important;
    }
  }

  .btn-label {
    @media (max-width: 420px) {
      display: none;
    }
  }
`;

const StyledEventList = styled(List)`
  .ant-list-item {
    padding: 16px 8px;
    border-bottom: 1px solid ${COLORS.border};
    flex-wrap: wrap;
    gap: 8px;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const SmallPanelCard = styled(Card)`
  && {
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);

    .ant-card-head {
      min-height: 64px;
      padding: 0 20px;
      border-bottom: 1px solid ${COLORS.border};
    }

    .ant-card-body {
      padding: 20px;
    }

    @media (max-width: 480px) {
      .ant-card-head {
        padding: 0 14px;
      }

      .ant-card-body {
        padding: 14px;
      }
    }
  }
`;

const TeacherDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eventQuery, setEventQuery] = useState('');
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // Sidebar collapse state — drives both the manual blue trigger and
  // antd's automatic breakpoint collapse for mid-sized screens.
  const [collapsed, setCollapsed] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 900 });

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(EVENTS_API);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const source = Array.isArray(result)
          ? result
          : Array.isArray(result?.events)
            ? result.events
            : Array.isArray(result?.data)
              ? result.data
              : [];

        const normalized = source.map((event, index) => {
          const date = event.event_date || new Date().toISOString().slice(0, 10);
          const time = event.event_time || '00:00:00';
          return {
            id: event.id || `event-${index}`,
            event_name: event.event_name || 'Unnamed Event',
            event_description: event.event_description || '',
            event_manager: event.event_manager || 'Not specified',
            dateTime: new Date(`${date}T${time}`),
            formattedDate: new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            formattedTime: new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });

        if (!cancelled) setEvents(normalized);
      } catch (fetchError) {
        console.error('Error fetching data:', fetchError);
        if (!cancelled) setError(fetchError.message || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingEvents = useMemo(
    () => events.filter((event) => event.dateTime > currentTime),
    [events, currentTime]
  );

  const nextEvent = upcomingEvents.length
    ? upcomingEvents.reduce((previous, current) =>
        previous.dateTime < current.dateTime ? previous : current
      )
    : null;

  const filteredEvents = upcomingEvents.filter((event) => {
    const query = eventQuery.trim().toLowerCase();
    if (!query) return true;
    return `${event.event_name} ${event.event_description} ${event.event_manager}`
      .toLowerCase()
      .includes(query);
  });

  const countdown = () => {
    if (!nextEvent) return 'No upcoming events scheduled';
    const diff = nextEvent.dateTime - currentTime;
    if (diff <= 0) return `${nextEvent.event_name} is happening now!`;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
  };

  const quickCards = [
    {
      label: 'STUDENT DIRECTORY',
      title: 'Total Students',
      link: '/teacher/register',
      linkText: 'Manage Records →',
      icon: <UsergroupAddOutlined />,
      background: '#1e3a8a',
      color: '#ffffff',
      linkColor: COLORS.actionBlue,
    },
    {
      label: 'FACULTY DIRECTORY',
      title: 'Total Teachers',
      link: '/teacher/list',
      linkText: 'Faculty Management →',
      icon: <UserOutlined />,
      background: COLORS.gold,
      color: '#ffffff',
      linkColor: COLORS.gold,
    },
    {
      label: 'ACADEMICS & SUBJECTS',
      title: 'Total Classes',
      link: '/teacher/class/list',
      linkText: 'View Curriculum →',
      icon: <BookOutlined />,
      background: COLORS.green,
      color: '#ffffff',
      linkColor: COLORS.green,
    },
  ];

  return (
    <Page>
      {!isMobile && (
        <SidebarShell>
          <NavigationSider
            width={240}
            collapsedWidth={80}
            collapsible
            trigger={null}
            collapsed={collapsed}
            breakpoint="lg"
            onBreakpoint={(broken) => setCollapsed(broken)}
            theme="dark"
          >
            {/* Pass `collapsed` down so Sidebar can switch to an
               icon-only layout when minimized. */}
            <Sidebar collapsed={collapsed} />
          </NavigationSider>

          <SidebarTrigger
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 13 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 13 }} />
            )}
          </SidebarTrigger>
        </SidebarShell>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileSidebarVisible(false)}
          open={mobileSidebarVisible}
          width={240}
          styles={{ body: { padding: 0, background: COLORS.sidebar } }}
        >
          <Sidebar />
        </Drawer>
      )}

      <ContentLayout>
        <TopHeader>
          <HeaderLeft>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileSidebarVisible(true)}
                aria-label="Open navigation"
              />
            )}
            <div style={{ minWidth: 0 }}>
              <BreadcrumbText>
                APEX / Teacher / <span>TeacherDashboard</span>
              </BreadcrumbText>
              <DashboardTitle level={3}>Teacher Dashboard</DashboardTitle>
            </div>
          </HeaderLeft>

          <HeaderRight>
            <RoleBadge>Teacher</RoleBadge>
            <Link to="/">
              <HomeButton icon={<HomeOutlined />} aria-label="Home" />
            </Link>
            <UserPill>
              <UserAvatar>T</UserAvatar>
              <UserMeta>
                <strong>Teacher</strong>
                <span>Faculty Member</span>
              </UserMeta>
            </UserPill>
          </HeaderRight>
        </TopHeader>

        <MainContent>
          {error && (
            <Alert
              type="warning"
              showIcon
              closable
              message="Error loading events"
              description={error}
              style={{ marginBottom: 20, borderRadius: 12 }}
            />
          )}

          <QuickCardsGrid>
            {quickCards.map((card) => (
              <TopBorderCard key={card.label}>
                <CardInner>
                  <CardContent linkcolor={card.linkColor}>
                    <small>{card.label}</small>
                    <h2>{card.title}</h2>
                    <Link to={card.link}>{card.linkText}</Link>
                  </CardContent>
                  <CardIconBox bg={card.background} color={card.color}>
                    {card.icon}
                  </CardIconBox>
                </CardInner>
              </TopBorderCard>
            ))}
          </QuickCardsGrid>

          <MainPanelCard
            title={
              <TableHeaderLeft>
                <CategoryIconBox>
                  <CalendarOutlined />
                </CategoryIconBox>
                <TableTitleGroup>
                  <h3>Upcoming College Events</h3>
                  <p>Manage all scheduled academic calendar activities</p>
                </TableTitleGroup>
              </TableHeaderLeft>
            }
            extra={
              <TableHeaderRight>
                <SearchInput
                  placeholder="Search event..."
                  prefix={<SearchOutlined style={{ color: COLORS.muted }} />}
                  value={eventQuery}
                  onChange={(e) => setEventQuery(e.target.value)}
                />
                <ActionIconButton icon={<ReloadOutlined style={{ color: COLORS.muted }} />} />
                {/* <CreateButton icon={<PlusOutlined />}>
                  <span className="btn-label">Create New Event</span>
                </CreateButton> */}
              </TableHeaderRight>
            }
          >
            {loading ? (
              <div style={{ minHeight: 180, display: 'grid', placeItems: 'center' }}>
                <Spin />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <Empty description="No upcoming events found" style={{ padding: '30px 0' }} />
            ) : filteredEvents.length === 0 ? (
              <Empty description="No matching events" style={{ padding: '30px 0' }} />
            ) : (
              <StyledEventList
                dataSource={filteredEvents}
                renderItem={(event) => (
                  <List.Item
                    extra={
                      <Tag
                        color="success"
                        style={{
                          borderRadius: '12px',
                          padding: '2px 10px',
                          fontWeight: 600,
                          border: 'none',
                          background: COLORS.greenBg,
                          color: COLORS.green,
                        }}
                      >
                        ✓ Active
                      </Tag>
                    }
                  >
                    <List.Item.Meta
                      avatar={<CalendarOutlined style={{ color: COLORS.gold, fontSize: 18 }} />}
                      title={
                        <Text strong style={{ color: COLORS.navy, fontSize: 14 }}>
                          {event.event_name}
                        </Text>
                      }
                      description={`${event.formattedDate} at ${event.formattedTime}${
                        event.event_description ? ` · ${event.event_description}` : ''
                      }`}
                    />
                    <Text type="secondary" style={{ fontSize: 12, color: COLORS.muted }}>
                      {event.event_manager}
                    </Text>
                  </List.Item>
                )}
              />
            )}
          </MainPanelCard>

          <BottomGrid>
            <SmallPanelCard
              title={
                <TableHeaderLeft>
                  <CategoryIconBox>
                    <ClockCircleOutlined />
                  </CategoryIconBox>
                  <TableTitleGroup>
                    <h3>Next Event Countdown</h3>
                    <p>Your closest scheduled activity</p>
                  </TableTitleGroup>
                </TableHeaderLeft>
              }
            >
              <div style={{ minHeight: 100, display: 'grid', placeItems: 'center' }}>
                <Space direction="vertical" align="center">
                  <Text type="secondary" style={{ fontSize: 12, color: COLORS.muted }}>
                    Live countdown
                  </Text>
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      color: COLORS.navy,
                      fontWeight: 800,
                      fontSize: 'clamp(16px, 2.4vw, 24px)',
                      textAlign: 'center',
                    }}
                  >
                    {countdown()}
                  </Title>
                </Space>
              </div>
            </SmallPanelCard>

            <SmallPanelCard
              title={
                <TableHeaderLeft>
                  <CategoryIconBox>
                    <UserOutlined />
                  </CategoryIconBox>
                  <TableTitleGroup>
                    <h3>Recent Activity</h3>
                    <p>Your latest activity log</p>
                  </TableTitleGroup>
                </TableHeaderLeft>
              }
            >
              <div
                style={{
                  minHeight: 100,
                  display: 'grid',
                  placeItems: 'center',
                  color: COLORS.muted,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                No recent activity to display
              </div>
            </SmallPanelCard>
          </BottomGrid>
        </MainContent>
      </ContentLayout>
    </Page>
  );
};

export default TeacherDashboard;