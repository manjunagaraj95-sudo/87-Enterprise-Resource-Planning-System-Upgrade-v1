
import React, { useState, useEffect } from 'react';

// Strict Engineering & Error Prevention Rules:
// 1. All handlers defined within functional component scope.
// 2. Null Safety: Optional chaining (?. ) for all data mapping.
// 3. State Immutability: Functional updates with spread operator.
// 4. Centralized Routing: const [view, setView] = useState({ screen: 'DASHBOARD', params: {} })
// 5. RBAC Logic: ROLES configuration to modify UI/Actions dynamically.

// Constants for RBAC
const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  END_USER: 'END_USER',
};

// Map status to CSS classes and colors
const ITEM_STATUS_MAP = {
  Approved: {
    className: 'Approved',
    borderColor: 'var(--status-approved-border)',
  },
  'In Progress': {
    className: 'InProgress',
    borderColor: 'var(--status-in-progress-border)',
  },
  Pending: {
    className: 'Pending',
    borderColor: 'var(--status-pending-border)',
  },
  Rejected: {
    className: 'Rejected',
    borderColor: 'var(--status-rejected-border)',
  },
  Exception: {
    className: 'Exception',
    borderColor: 'var(--status-exception-border)',
  },
};

// Mock Data (Sample Data required)
const mockErpItems = [
  {
    id: 'ERP-001',
    name: 'Accounts Payable Automation',
    type: 'Module Upgrade',
    status: 'In Progress',
    manager: 'Alice Johnson',
    budget: 150000,
    progress: 75,
    lastUpdated: '2023-10-26T10:30:00Z',
    workflowStage: 'Development',
    slaDue: '2023-11-15',
    slaBreached: false,
    description: 'Automating the accounts payable process to reduce manual effort and errors.',
    attachments: [
      { name: 'AP_Automation_Spec_v1.2.pdf', url: '#', type: 'PDF' },
      { name: 'AP_Migration_Plan.xlsx', url: '#', type: 'Excel' },
    ],
    relatedRecords: [
      { id: 'PROJ-101', name: 'Vendor Integration Project', type: 'Project' },
      { id: 'TASK-205', name: 'UI/UX Design for AP Module', type: 'Task' },
    ],
  },
  {
    id: 'ERP-002',
    name: 'Inventory Management System',
    type: 'New Feature',
    status: 'Pending',
    manager: 'Bob Williams',
    budget: 80000,
    progress: 20,
    lastUpdated: '2023-10-25T14:15:00Z',
    workflowStage: 'Approval',
    slaDue: '2023-11-05',
    slaBreached: true,
    description: 'Implementing a new real-time inventory tracking and management system.',
    attachments: [
      { name: 'Inventory_Requirements.docx', url: '#', type: 'Word' },
    ],
    relatedRecords: [],
  },
  {
    id: 'ERP-003',
    name: 'HR Payroll Integration',
    type: 'System Integration',
    status: 'Approved',
    manager: 'Charlie Brown',
    budget: 200000,
    progress: 95,
    lastUpdated: '2023-10-20T09:00:00Z',
    workflowStage: 'Deployment',
    slaDue: '2023-10-30',
    slaBreached: false,
    description: 'Integrating the new HR module with existing payroll system.',
    attachments: [],
    relatedRecords: [],
  },
  {
    id: 'ERP-004',
    name: 'Customer Relationship Module',
    type: 'Module Upgrade',
    status: 'Rejected',
    manager: 'Diana Prince',
    budget: 120000,
    progress: 10,
    lastUpdated: '2023-10-18T11:00:00Z',
    workflowStage: 'Initial Review',
    slaDue: '2023-10-22',
    slaBreached: false, // Could be true if rejected past SLA
    description: 'Upgrading the CRM module for better customer interaction tracking.',
    attachments: [],
    relatedRecords: [],
  },
  {
    id: 'ERP-005',
    name: 'Financial Reporting Enhancements',
    type: 'New Feature',
    status: 'Exception',
    manager: 'Eve Adams',
    budget: 90000,
    progress: 60,
    lastUpdated: '2023-10-24T16:00:00Z',
    workflowStage: 'Testing',
    slaDue: '2023-11-10',
    slaBreached: true,
    description: 'Adding new reporting capabilities for financial analytics.',
    attachments: [],
    relatedRecords: [],
  },
];

const mockAuditLogs = [
  { id: 1, itemId: 'ERP-001', user: 'AdminUser', action: 'Created record', timestamp: '2023-10-01T08:00:00Z', details: 'Initial creation of AP Automation record.' },
  { id: 2, itemId: 'ERP-001', user: 'Alice Johnson', action: 'Updated status', timestamp: '2023-10-05T09:15:00Z', details: 'Status changed from Pending to In Progress.' },
  { id: 3, itemId: 'ERP-002', user: 'Bob Williams', action: 'Added attachment', timestamp: '2023-10-08T11:00:00Z', details: 'Attached Inventory_Requirements.docx.' },
  { id: 4, itemId: 'ERP-001', user: 'AdminUser', action: 'Approved budget', timestamp: '2023-10-10T13:00:00Z', details: 'Budget approved for phase 1.' },
  { id: 5, itemId: 'ERP-005', user: 'System', action: 'SLA Breached', timestamp: '2023-10-24T16:05:00Z', details: 'SLA for Testing phase of Financial Reporting Enhancements breached.' },
  { id: 6, itemId: 'ERP-002', user: 'System', action: 'SLA Breached', timestamp: '2023-11-06T09:00:00Z', details: 'SLA for Approval phase of Inventory Management System breached.' },
];

const WORKFLOW_STAGES = [
  { id: 'Initial Review', name: 'Initial Review', slaDays: 5 },
  { id: 'Approval', name: 'Approval', slaDays: 7 },
  { id: 'Development', name: 'Development', slaDays: 20 },
  { id: 'Testing', name: 'Testing', slaDays: 10 },
  { id: 'Deployment', name: 'Deployment', slaDays: 3 },
  { id: 'Completed', name: 'Completed', slaDays: 0 },
];

function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.PROJECT_MANAGER); // Default role
  const [erpItems, setErpItems] = useState(mockErpItems);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [kpiUpdateTrigger, setKpiUpdateTrigger] = useState(0); // For subtle pulse animation

  // RBAC Logic - check if current user has permission for an action
  const checkPermission = (requiredRoles) => {
    return requiredRoles.includes(currentUserRole);
  };

  // Utility function for formatting
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Handlers for Navigation
  const handleCardClick = (id) => {
    setView({ screen: 'RECORD_DETAIL', params: { id } });
  };

  const handleCreateNew = () => {
    if (checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER])) {
      setView({ screen: 'EDIT_FORM', params: { id: 'new' } });
    } else {
      alert('You do not have permission to create new items.');
    }
  };

  const handleEditRecord = (id) => {
    if (checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER])) {
      setView({ screen: 'EDIT_FORM', params: { id } });
    } else {
      alert('You do not have permission to edit this item.');
    }
  };

  const handleSaveForm = (formData) => {
    // State Immutability: functional update with spread operator
    setErpItems((prevItems) => {
      if (formData.id === 'new') {
        const newId = `ERP-${String(prevItems.length + 1).padStart(3, '0')}`;
        return [...prevItems, { ...formData, id: newId, lastUpdated: new Date().toISOString() }];
      } else {
        return prevItems.map((item) =>
          item.id === formData.id ? { ...item, ...formData, lastUpdated: new Date().toISOString() } : item
        );
      }
    });
    setAuditLogs((prevLogs) => [
      ...prevLogs,
      {
        id: prevLogs.length + 1,
        itemId: formData.id === 'new' ? `ERP-${String(erpItems.length + 1).padStart(3, '0')}` : formData.id,
        user: `User (${currentUserRole})`,
        action: formData.id === 'new' ? 'Created record' : 'Updated record',
        timestamp: new Date().toISOString(),
        details: `${formData.name} was ${formData.id === 'new' ? 'created' : 'updated'}.`,
      },
    ]);
    setView({ screen: 'RECORD_DETAIL', params: { id: formData.id === 'new' ? `ERP-${String(erpItems.length + 1).padStart(3, '0')}` : formData.id } });
  };

  const handleBack = () => {
    if (view.screen === 'RECORD_DETAIL' || view.screen === 'EDIT_FORM') {
      setView({ screen: 'RECORD_LIST', params: {} });
    } else {
      setView({ screen: 'DASHBOARD', params: {} });
    }
  };

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    if (view.screen !== 'RECORD_LIST') {
      setView({ screen: 'RECORD_LIST', params: {} }); // Navigate to list if searching from elsewhere
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterPanelOpen(false);
  };

  // Real-time KPI update trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setKpiUpdateTrigger((prev) => prev + 1);
      // Simulate live updates for KPIs
      setErpItems((prevItems) =>
        prevItems.map((item) => {
          if (Math.random() > 0.7) {
            // Randomly update progress for some items
            return {
              ...item,
              progress: Math.min(100, item.progress + Math.floor(Math.random() * 5)),
              lastUpdated: new Date().toISOString(),
            };
          }
          return item;
        })
      );
    }, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getFilteredAndSearchedItems = () => {
    return erpItems
      .filter((item) => {
        const matchesStatus = filters.status ? item.status === filters.status : true;
        const matchesType = filters.type ? item.type === filters.type : true;
        return matchesStatus && matchesType;
      })
      .filter((item) =>
        searchQuery
          ? item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.manager?.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      );
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Dashboard', screen: 'DASHBOARD' }];
    if (view.screen === 'RECORD_LIST' || view.screen === 'RECORD_DETAIL' || view.screen === 'EDIT_FORM') {
      crumbs.push({ label: 'ERP Items', screen: 'RECORD_LIST' });
    }
    if (view.screen === 'RECORD_DETAIL') {
      const item = erpItems.find((i) => i.id === view.params?.id);
      crumbs.push({ label: item?.name || 'Loading...', screen: 'RECORD_DETAIL', params: view.params });
    }
    if (view.screen === 'EDIT_FORM') {
      const item = erpItems.find((i) => i.id === view.params?.id);
      crumbs.push({ label: item?.name || 'New Item', screen: 'EDIT_FORM', params: view.params });
    }
    return crumbs;
  };

  // --- Reusable Components ---

  const Breadcrumbs = ({ crumbs }) => (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.label}>
          {index > 0 && <span className="text-muted">/</span>}
          {index < crumbs.length - 1 ? (
            <a href="#" onClick={() => setView({ screen: crumb.screen, params: crumb.params })}>
              {crumb.label}
            </a>
          ) : (
            <span className="text-muted">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );

  const StatusIndicator = ({ status }) => {
    const statusInfo = ITEM_STATUS_MAP[status] || {};
    return (
      <span className={`status-indicator ${statusInfo.className}`}>
        {status}
      </span>
    );
  };

  const Card = ({ item, onClick, role }) => {
    const statusInfo = ITEM_STATUS_MAP[item?.status] || {};
    return (
      <div
        className={`card clickable status-${statusInfo.className}`}
        style={{ '--status-color-border': statusInfo.borderColor }}
        onClick={() => onClick(item?.id)}
      >
        <div className="card-status-border" style={{ backgroundColor: statusInfo.borderColor }}></div>
        <div className="card-content">
          <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{item?.name}</h3>
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>ID: {item?.id} | Type: {item?.type}</p>
          <p>Manager: {item?.manager}</p>
          <p>Budget: {formatCurrency(item?.budget)}</p>
        </div>
        <div className="card-footer">
          <StatusIndicator status={item?.status} />
          <span className="text-muted">Last Updated: {formatDate(item?.lastUpdated)}</span>
        </div>
      </div>
    );
  };

  const MilestoneTracker = ({ stages, currentStageId, recordId }) => {
    const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
    return (
      <div className="milestone-tracker">
        <h3>Workflow Progress</h3>
        <div className="milestone-steps">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const item = erpItems.find(i => i.id === recordId);
            const slaBreached = item?.slaBreached && isCurrent; // Only show breached for current stage for simplicity
            const slaMessage = item?.slaDue && isCurrent ? `Due: ${new Date(item.slaDue).toLocaleDateString()}` : '';

            return (
              <div className="milestone-step" key={stage.id}>
                <div
                  className={`milestone-step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className={`milestone-step-title ${isCurrent ? 'active' : ''}`}>
                  {stage.name}
                </div>
                {slaMessage && <div className={`milestone-sla ${slaBreached ? 'breached' : ''}`}>{slaBreached ? 'SLA BREACHED!' : slaMessage}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AuditFeed = ({ logs, currentUserId, recordId }) => {
    // Role-based visibility for logs (e.g., only Admin sees sensitive logs)
    const filteredLogs = logs.filter(log =>
      (log.itemId === recordId) &&
      (currentUserRole === ROLES.ADMIN || !log.action.includes('Approved budget')) // Example: hide budget approvals from non-admins
    );

    if (filteredLogs.length === 0) {
      return (
        <div className="audit-feed-card">
          <h3>Recent Activities</h3>
          <p className="text-muted">No recent activities for this record.</p>
        </div>
      );
    }

    return (
      <div className="audit-feed-card">
        <h3>Recent Activities</h3>
        {filteredLogs.map((log) => (
          <div className="audit-log-item" key={log.id}>
            <div className="audit-log-item-icon">
              <span className="icon icon-activity"></span>
            </div>
            <div className="audit-log-content">
              <p>
                <span className="text-bold">{log.user}</span> {log.action}: {log.details}
              </p>
              <span className="timestamp">{formatDate(log.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const EmptyState = ({ title, message, ctaText, onCtaClick }) => (
    <div className="empty-state">
      <div className="illustration">📊</div> {/* Placeholder for illustration */}
      <h3>{title}</h3>
      <p>{message}</p>
      {onCtaClick && <button className="primary" onClick={onCtaClick}>{ctaText}</button>}
    </div>
  );

  // --- Screen Components ---

  const DashboardScreen = () => {
    // Intelligence: Dynamic visual hierarchy (highlighted KPIs), Trend indicators
    const totalBudget = erpItems.reduce((sum, item) => sum + item.budget, 0);
    const inProgressCount = erpItems.filter((item) => item.status === 'In Progress').length;
    const pendingApprovalCount = erpItems.filter((item) => item.status === 'Pending').length;
    const slaBreachedCount = erpItems.filter((item) => item.slaBreached).length;

    // Dummy trend values (AI-powered feel)
    const budgetTrend = Math.random() > 0.5 ? 'up' : 'down';
    const progressTrend = Math.random() > 0.5 ? 'up' : 'down';

    return (
      <div className="dashboard-screen">
        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>ERP System Overview</h1>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="kpi-card" key={kpiUpdateTrigger}> {/* Trigger re-render for pulse */}
            <p className="kpi-card-title">Total Project Budget</p>
            <p className="kpi-card-value">{formatCurrency(totalBudget)}
              <span className={`kpi-card-trend ${budgetTrend === 'up' ? 'positive' : 'negative'}`}>
                {budgetTrend === 'up' ? '⬆️' : '⬇️'} 2.5%
              </span>
            </p>
          </div>
          <div className="kpi-card" key={kpiUpdateTrigger + 1}>
            <p className="kpi-card-title">Items In Progress</p>
            <p className="kpi-card-value">{inProgressCount}
              <span className={`kpi-card-trend ${progressTrend === 'up' ? 'positive' : 'negative'}`}>
                {progressTrend === 'up' ? '⬆️' : '⬇️'} 1.2%
              </span>
            </p>
          </div>
          <div className="kpi-card" key={kpiUpdateTrigger + 2}>
            <p className="kpi-card-title">Pending Approvals</p>
            <p className="kpi-card-value">{pendingApprovalCount}</p>
          </div>
          <div className="kpi-card" key={kpiUpdateTrigger + 3}>
            <p className="kpi-card-title">SLA Breaches</p>
            <p className="kpi-card-value" style={{ color: slaBreachedCount > 0 ? 'var(--status-rejected-base)' : 'var(--text-main)' }}>
              {slaBreachedCount}
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: 'var(--spacing-xxl)', marginBottom: 'var(--spacing-lg)' }}>Key Metrics & Trends</h2>
        <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '0' }}>
          <div className="chart-container">Bar Chart: Project Progress by Manager</div>
          <div className="chart-container">Line Chart: Budget Burn Rate</div>
          <div className="chart-container">Donut Chart: Items by Status</div>
          <div className="chart-container">Gauge Chart: Overall System Health</div>
        </div>

        <h2 style={{ marginTop: 'var(--spacing-xxl)' }}>Recent System Activity</h2>
        <AuditFeed logs={auditLogs} currentUserId="dashboard" recordId={null} />

        <div style={{ marginTop: 'var(--spacing-xxl)', textAlign: 'center' }}>
          <button className="primary" onClick={() => setView({ screen: 'RECORD_LIST', params: {} })}>
            View All ERP Items
          </button>
        </div>
      </div>
    );
  };

  const RecordListScreen = () => {
    const items = getFilteredAndSearchedItems();
    const [filterPanelOpenState, setFilterPanelOpenState] = useState(false); // Local state for side panel

    const toggleFilterPanel = () => setFilterPanelOpenState(!filterPanelOpenState);

    const handleClearFilters = () => {
      setFilters({ status: '', type: '' });
      setFilterPanelOpenState(false);
    };

    return (
      <div className="record-list-screen">
        <Breadcrumbs crumbs={getBreadcrumbs()} />
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>ERP Items</h1>

        <div className="grid-controls">
          <div className="left-actions">
            <div className="grid-search">
              <input
                type="text"
                placeholder="Search by name, ID, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon icon icon-search"></span>
            </div>
            <button className="outline" onClick={toggleFilterPanel}>
              <span className="icon icon-filter"></span> Filters
            </button>
            <select style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
              <option>All Views</option>
              <option>My Active Projects</option>
              <option>Pending My Approval</option>
            </select>
          </div>
          <div className="right-actions">
            {checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) && (
              <button className="primary" onClick={handleCreateNew}>
                <span className="icon icon-add"></span> Add New Item
              </button>
            )}
            <button className="secondary">
              <span className="icon icon-export"></span> Export to Excel/PDF
            </button>
            {checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) && (
               <button className="outline" onClick={() => alert('Bulk action executed!')}>Bulk Actions</button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="No ERP Items Found"
            message="It looks like there are no items matching your search or filter criteria. Try adjusting them or creating a new item."
            ctaText={checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) ? "Create New ERP Item" : null}
            onCtaClick={checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) ? handleCreateNew : null}
          />
        ) : (
          <div className="card-grid">
            {items.map((item) => (
              <Card key={item.id} item={item} onClick={handleCardClick} role={currentUserRole} />
            ))}
          </div>
        )}

        {/* Side Panel for Filters */}
        <div className={`overlay ${filterPanelOpenState ? 'open' : ''}`} onClick={toggleFilterPanel}></div>
        <div className={`side-panel ${filterPanelOpenState ? 'open' : ''}`}>
          <div className="side-panel-header">
            <h3>Filters</h3>
            <button onClick={toggleFilterPanel} style={{ padding: 'var(--spacing-xs)', color: 'var(--text-light)' }}>✕</button>
          </div>
          <div className="side-panel-content">
            <div className="form-group">
              <label htmlFor="filterStatus">Status</label>
              <select
                id="filterStatus"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All</option>
                {Object.keys(ITEM_STATUS_MAP).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filterType">Type</label>
              <select
                id="filterType"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All</option>
                <option value="Module Upgrade">Module Upgrade</option>
                <option value="New Feature">New Feature</option>
                <option value="System Integration">System Integration</option>
              </select>
            </div>
          </div>
          <div className="side-panel-footer">
            <button className="secondary" onClick={handleClearFilters}>Clear Filters</button>
            <button className="primary" onClick={() => handleApplyFilters(filters)}>Apply Filters</button>
          </div>
        </div>
      </div>
    );
  };

  const RecordDetailScreen = () => {
    const item = erpItems.find((i) => i.id === view.params?.id);
    const [activeTab, setActiveTab] = useState('details');

    if (!item) {
      return (
        <div className="main-content">
          <Breadcrumbs crumbs={getBreadcrumbs()} />
          <p>Record not found.</p>
          <button className="secondary" onClick={handleBack}>
            <span className="icon icon-back"></span> Back to List
          </button>
        </div>
      );
    }

    return (
      <div className="record-detail-screen">
        <Breadcrumbs crumbs={getBreadcrumbs()} />

        <div className="detail-header">
          <h1>{item.name} <StatusIndicator status={item.status} /></h1>
          <div className="detail-actions">
            {checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) && (
              <button className="outline" onClick={() => handleEditRecord(item.id)}>
                <span className="icon icon-edit"></span> Edit Record
              </button>
            )}
            {checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) && (
              <button className="primary" onClick={() => alert(`Approving ${item.name}`)}>
                <span className="icon icon-approve"></span> Approve
              </button>
            )}
            {checkPermission([ROLES.ADMIN, ROLES.PROJECT_MANAGER]) && (
              <button className="secondary" style={{ backgroundColor: 'var(--status-rejected-bg)', color: 'var(--status-rejected-border)' }} onClick={() => alert(`Rejecting ${item.name}`)}>
                <span className="icon icon-reject"></span> Reject
              </button>
            )}
            <button className="secondary" onClick={handleBack}>
              <span className="icon icon-back"></span> Back to List
            </button>
          </div>
        </div>

        {/* Appian Record Alignment: Record Summary Page */}
        <div className="record-summary-card">
          <div className="record-summary-item">
            <label>Item ID</label>
            <p>{item.id}</p>
          </div>
          <div className="record-summary-item">
            <label>Type</label>
            <p>{item.type}</p>
          </div>
          <div className="record-summary-item">
            <label>Project Manager</label>
            <p>{item.manager}</p>
          </div>
          <div className="record-summary-item">
            <label>Budget</label>
            <p>{formatCurrency(item.budget)}</p>
          </div>
          <div className="record-summary-item">
            <label>Current Progress</label>
            <p>{item.progress}%</p>
          </div>
          <div className="record-summary-item">
            <label>Last Updated</label>
            <p>{formatDate(item.lastUpdated)}</p>
          </div>
        </div>

        {/* Milestone Tracker (Work-flow progress) */}
        <MilestoneTracker stages={WORKFLOW_STAGES} currentStageId={item.workflowStage} recordId={item.id} />

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-button ${activeTab === 'related' ? 'active' : ''}`}
            onClick={() => setActiveTab('related')}
          >
            Related Records
          </button>
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button
            className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'details' && (
            <div>
              <h4>Description</h4>
              <p>{item.description}</p>
            </div>
          )}
          {activeTab === 'related' && (
            <div>
              <h4>Related Records</h4>
              {item.relatedRecords?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {item.relatedRecords.map((rec) => (
                    <li key={rec.id} style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <a href="#" onClick={() => handleCardClick(rec.id)}>{rec.name} ({rec.type})</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No related records.</p>
              )}
            </div>
          )}
          {activeTab === 'documents' && (
            <div>
              <h4>Attached Documents</h4>
              {item.attachments?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {item.attachments.map((doc, index) => (
                    <li key={index} className="uploaded-file-item">
                      <span><span className="icon icon-document"></span> {doc.name}</span>
                      <button className="secondary" onClick={() => alert(`Previewing ${doc.name}`)}>Preview</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No documents attached.</p>
              )}
            </div>
          )}
          {activeTab === 'audit' && (
            // Appian Record Alignment: News/Audit Feed
            <AuditFeed logs={auditLogs} recordId={item.id} />
          )}
        </div>
      </div>
    );
  };

  const EditFormScreen = () => {
    const isNew = view.params?.id === 'new';
    const itemToEdit = isNew ? {} : erpItems.find((i) => i.id === view.params?.id);

    const [formData, setFormData] = useState({
      id: itemToEdit?.id || '',
      name: itemToEdit?.name || '',
      type: itemToEdit?.type || '',
      status: itemToEdit?.status || 'Pending',
      manager: itemToEdit?.manager || '',
      budget: itemToEdit?.budget || 0,
      description: itemToEdit?.description || '',
      attachments: itemToEdit?.attachments || [],
      workflowStage: itemToEdit?.workflowStage || 'Initial Review',
    });
    const [errors, setErrors] = useState({});

    // Field-level validations
    const validateField = (name, value) => {
      let message = '';
      if (name === 'name' && !value) message = 'Project Name is mandatory.';
      if (name === 'type' && !value) message = 'Type is mandatory.';
      if (name === 'manager' && !value) message = 'Manager is mandatory.';
      if (name === 'budget' && (value <= 0 || isNaN(value))) message = 'Budget must be a positive number.';
      setErrors((prev) => ({ ...prev, [name]: message }));
      return message === '';
    };

    const handleChange = (e) => {
      const { name, value, type, files } = e.target;
      if (type === 'file') {
        // Handle file upload
        if (files.length > 0) {
          const newFiles = Array.from(files).map(file => ({ name: file.name, url: URL.createObjectURL(file), type: file.type.split('/')[1].toUpperCase() }));
          setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newFiles] })); // State Immutability
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      let isValid = true;
      ['name', 'type', 'manager', 'budget'].forEach(field => {
        if (!validateField(field, formData[field])) isValid = false;
      });

      if (isValid) {
        handleSaveForm(formData);
      } else {
        alert('Please correct the errors in the form.');
      }
    };

    const handleFileDelete = (index) => {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index) // State Immutability
      }));
    };

    return (
      <div className="edit-form-screen">
        <Breadcrumbs crumbs={getBreadcrumbs()} />
        <h1>{isNew ? 'Create New ERP Item' : `Edit: ${itemToEdit?.name}`}</h1>

        <div className="tab-content" style={{ maxWidth: '800px', margin: 'var(--spacing-lg) auto' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Project Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={(e) => validateField('name', e.target.value)}
                placeholder="e.g., Accounts Payable Automation"
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type <span style={{ color: 'red' }}>*</span></label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                onBlur={(e) => validateField('type', e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="Module Upgrade">Module Upgrade</option>
                <option value="New Feature">New Feature</option>
                <option value="System Integration">System Integration</option>
              </select>
              {errors.type && <p className="error-message">{errors.type}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                {Object.keys(ITEM_STATUS_MAP).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="manager">Project Manager <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                onBlur={(e) => validateField('manager', e.target.value)}
                placeholder="e.g., Alice Johnson"
                autoComplete="off" // Auto-populated fields (mocked)
              />
              {errors.manager && <p className="error-message">{errors.manager}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget (USD) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                onBlur={(e) => validateField('budget', e.target.value)}
                placeholder="e.g., 150000"
              />
              {errors.budget && <p className="error-message">{errors.budget}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Provide a detailed description of the ERP item."
              ></textarea>
            </div>

            <div className="form-group">
              <label>Attachments</label>
              <div className="file-upload-area" onClick={() => document.getElementById('file-upload-input').click()}>
                <span className="icon icon-upload"></span> Drag & Drop files here or Click to Upload
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="uploaded-files">
                {formData.attachments?.map((file, index) => (
                  <div key={index} className="uploaded-file-item">
                    <span>{file.name}</span>
                    <button type="button" className="secondary" onClick={() => handleFileDelete(index)}>
                      <span className="icon icon-delete"></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">Save</button>
              <button type="button" className="secondary" onClick={() => handleCardClick(formData.id === 'new' ? '' : formData.id)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Centralized Routing: Render screen based on view state
  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'RECORD_LIST':
        return <RecordListScreen />;
      case 'RECORD_DETAIL':
        return <RecordDetailScreen />;
      case 'EDIT_FORM':
        return <EditFormScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">ERP Upgrade</h1>
        </div>
        <div className="global-search">
          <input
            type="text"
            placeholder="Global Search (e.g. project name, ID)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch(searchQuery)}
          />
          <span className="search-icon icon icon-search"></span>
          {searchQuery && (
            <ul className="search-suggestions">
              {erpItems.filter(item =>
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id?.toLowerCase().includes(searchQuery.toLowerCase())
              ).slice(0, 5).map(item => (
                <li key={item.id} onClick={() => handleCardClick(item.id)}>
                  <span>{item.name}</span> <span className="type">{item.id} ({item.type})</span>
                </li>
              ))}
              {/* Add more suggestion types if needed */}
            </ul>
          )}
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="icon icon-user"></span>
            <span>{currentUserRole}</span>
          </div>
          {/* Role selector for demo purposes */}
          <select
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}
          >
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="main-content">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;