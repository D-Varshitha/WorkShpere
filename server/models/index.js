import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import {
  preferIpv4First,
  normalizePostgresUrl,
  parseConnectionInfoFromUrl
} from '../lib/dbUrl.js';

dotenv.config();
preferIpv4First();

function resolveSslEnabled() {
  const explicit = process.env.DB_SSL;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  const url = (process.env.DATABASE_URL || '').toLowerCase();
  const host = (process.env.DB_HOST || '').toLowerCase();
  const combined = `${url} ${host}`;

  const isLocalHost =
    /(^|@)(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url) ||
    /localhost|127\.0\.0\.1|^\[::1\]$/.test(host);
  if (isLocalHost) return false;

  if (/sslmode=require|sslmode=verify-full|sslmode=verify-ca/.test(url)) return true;

  if (
    /supabase\.co|pooler\.supabase|neon\.tech|render\.com|railway\.app|azure\.com|amazonaws\.com|cockroachlabs\.cloud|aiven\.io|elephantsql\.com/.test(
      combined
    )
  ) {
    return true;
  }

  return false;
}

const hasConnectionString = Boolean(process.env.DATABASE_URL);
const isSslEnabled = resolveSslEnabled();

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = hasConnectionString ? normalizePostgresUrl(rawDatabaseUrl) : null;
// Parse the resolved URL so our logs reflect the actual host/port we connect to.
const parsedUrl = hasConnectionString && databaseUrl ? parseConnectionInfoFromUrl(databaseUrl) : null;

const useIpv4 = process.env.DB_FORCE_IPV4 !== 'false';

function buildDialectOptions() {
  const opts = {};
  if (useIpv4) opts.family = 4;
  if (isSslEnabled) {
    opts.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
    opts.keepAlive = true;
  }
  return Object.keys(opts).length ? opts : undefined;
}

export const dbConnectionInfo = {
  usesConnectionString: hasConnectionString,
  ssl: isSslEnabled,
  host: parsedUrl?.host || process.env.DB_HOST || 'localhost',
  port: parsedUrl?.port || String(process.env.DB_PORT || 5432),
  database: parsedUrl?.database || process.env.DB_NAME || 'postgres',
  supabaseTransactionPooler: Boolean(parsedUrl?.isTransactionPooler)
};

const dialectOptions = buildDialectOptions();

const commonOptions = {
  dialect: 'postgres',
  dialectOptions,
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX || 5),
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  retry: {
    max: 2
  }
};

const sequelize = hasConnectionString
  ? new Sequelize(databaseUrl, {
      ...commonOptions,
      protocol: 'postgres',
      define: {
        underscored: false
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        ...commonOptions,
        define: {
          underscored: false
        }
      }
    );

/** DB column `_id` → JS property `id` (matches API + frontend). */
const uuidPk = () => ({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: '_id'
  }
});

const User = sequelize.define(
  'User',
  {
    ...uuidPk(),
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      defaultValue: 'employee'
    },
    department: { type: DataTypes.STRING, allowNull: false },
    totalLeaves: { type: DataTypes.INTEGER, defaultValue: 24 },
    usedLeaves: { type: DataTypes.INTEGER, defaultValue: 0 },
    managerId: { type: DataTypes.UUID, allowNull: true },

    // FR1.1: onboarding to offboarding
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    archivedAt: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: 'Users' }
);

const Project = sequelize.define(
  'Project',
  {
    ...uuidPk(),
    name: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('planning', 'in-progress', 'completed'),
      defaultValue: 'planning'
    },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
    dueDate: { type: DataTypes.DATE },
    managerId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Projects' }
);

const ProjectMember = sequelize.define(
  'ProjectMember',
  {
    ProjectId: { type: DataTypes.UUID, primaryKey: true },
    UserId: { type: DataTypes.UUID, primaryKey: true },
    role: { type: DataTypes.STRING }
  },
  { tableName: 'ProjectMembers', id: false, timestamps: true }
);

const Task = sequelize.define(
  'Task',
  {
    ...uuidPk(),
    title: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: 'todo'
    },
    dueDate: { type: DataTypes.DATE },
    contributionLog: { type: DataTypes.JSONB, defaultValue: [] },
    projectId: { type: DataTypes.UUID, allowNull: true },
    assignedTo: { type: DataTypes.UUID, allowNull: true },

    // FR6.1: priority levels + estimated time
    priority: { type: DataTypes.STRING, allowNull: true, defaultValue: 'medium' },
    estimatedHours: { type: DataTypes.FLOAT, allowNull: true }
  },
  { tableName: 'Tasks' }
);

const Leave = sequelize.define(
  'Leave',
  {
    ...uuidPk(),
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    reason: { type: DataTypes.TEXT },
    employeeId: { type: DataTypes.UUID, allowNull: true },
    managerId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Leaves' }
);

const Attendance = sequelize.define(
  'Attendance',
  {
    ...uuidPk(),
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false
    },
    userId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Attendances' }
);

const Feedback = sequelize.define(
  'Feedback',
  {
    ...uuidPk(),
    type: {
      type: DataTypes.ENUM('general', 'incident', 'suggestion'),
      allowNull: false
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: true },

    // FR7.2: anonymous option + department context for routing responses
    anonymous: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    department: { type: DataTypes.STRING, allowNull: true }
  },
  { tableName: 'Feedbacks' }
);

const Facility = sequelize.define(
  'Facility',
  {
    ...uuidPk(),
    facilityId: { type: DataTypes.STRING, allowNull: false },
    facilityName: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    fromTime: { type: DataTypes.STRING, allowNull: false },
    toTime: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    requestedBy: { type: DataTypes.STRING },
    employeeId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Facilities' }
);

// FR2/3: Assets + allocation (1:1 mapping between asset and employee)
const Asset = sequelize.define(
  'Asset',
  {
    ...uuidPk(),
    assetType: { type: DataTypes.STRING, allowNull: false },
    condition: { type: DataTypes.STRING, allowNull: false, defaultValue: 'good' },
    assignedEmployeeId: { type: DataTypes.UUID, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Available' },
    assignedDate: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: 'Assets' }
);

const AssetCustodyHistory = sequelize.define(
  'AssetCustodyHistory',
  {
    ...uuidPk(),
    assetId: { type: DataTypes.UUID, allowNull: false },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    assignedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    releasedAt: { type: DataTypes.DATE, allowNull: true },
    reason: { type: DataTypes.STRING, allowNull: true }
  },
  { tableName: 'AssetCustodyHistory' }
);

const AssetMaintenanceRequest = sequelize.define(
  'AssetMaintenanceRequest',
  {
    ...uuidPk(),
    assetId: { type: DataTypes.UUID, allowNull: false },
    issueDescription: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    requestedBy: { type: DataTypes.UUID, allowNull: true },
    resolvedBy: { type: DataTypes.UUID, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: 'AssetMaintenanceRequests' }
);

// FR3: Capacity limits / zones and facility inventory mapping
const FacilityZone = sequelize.define(
  'FacilityZone',
  {
    ...uuidPk(),
    zoneName: { type: DataTypes.STRING, allowNull: false, unique: true },
    capacityLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    safetyThresholdPct: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 80 }
  },
  { tableName: 'FacilityZones' }
);

const FacilityInventory = sequelize.define(
  'FacilityInventory',
  {
    ...uuidPk(),
    facilityId: { type: DataTypes.STRING, allowNull: false, unique: true },
    facilityName: { type: DataTypes.STRING, allowNull: false },
    facilityType: { type: DataTypes.STRING, allowNull: true },
    zoneId: { type: DataTypes.UUID, allowNull: false }
  },
  { tableName: 'FacilityInventory' }
);

// FR4/5: Wellness check-ins and time entries
const WellnessCheckin = sequelize.define(
  'WellnessCheckin',
  {
    ...uuidPk(),
    employeeId: { type: DataTypes.UUID, allowNull: false },
    checkInDate: { type: DataTypes.DATEONLY, allowNull: false },
    stressLevel: { type: DataTypes.INTEGER, allowNull: false }, // 1-10
    mood: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  },
  { tableName: 'WellnessCheckins' }
);

const TimeEntry = sequelize.define(
  'TimeEntry',
  {
    ...uuidPk(),
    userId: { type: DataTypes.UUID, allowNull: false },
    projectId: { type: DataTypes.UUID, allowNull: true },
    taskId: { type: DataTypes.UUID, allowNull: true },
    entryDate: { type: DataTypes.DATEONLY, allowNull: false },
    minutes: { type: DataTypes.FLOAT, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true }
  },
  { tableName: 'TimeEntries' }
);

// FR5.1: multi-level approval workflow for leave
const LeaveApproval = sequelize.define(
  'LeaveApproval',
  {
    ...uuidPk(),
    leaveId: { type: DataTypes.UUID, allowNull: false },
    level: { type: DataTypes.STRING, allowNull: false }, // 'manager' | 'hr'
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    comment: { type: DataTypes.TEXT, allowNull: true },
    decidedBy: { type: DataTypes.UUID, allowNull: true },
    decidedAt: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: 'LeaveApprovals' }
);

// FR7.1: Global Notices
const GlobalNotice = sequelize.define(
  'GlobalNotice',
  {
    ...uuidPk(),
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    audience: { type: DataTypes.STRING, allowNull: false, defaultValue: 'all' }, // all|admin|manager|employee
    isArchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'GlobalNotices' }
);

// FR7.3: Feedback response thread
const FeedbackResponse = sequelize.define(
  'FeedbackResponse',
  {
    ...uuidPk(),
    feedbackId: { type: DataTypes.UUID, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'FeedbackResponses' }
);

// FR1.3: Historical role/department changes
const EmployeeRoleHistory = sequelize.define(
  'EmployeeRoleHistory',
  {
    ...uuidPk(),
    userId: { type: DataTypes.UUID, allowNull: false },
    changedBy: { type: DataTypes.UUID, allowNull: true },
    oldRole: { type: DataTypes.STRING, allowNull: true },
    newRole: { type: DataTypes.STRING, allowNull: true },
    oldDepartment: { type: DataTypes.STRING, allowNull: true },
    newDepartment: { type: DataTypes.STRING, allowNull: true },
    changeType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'role_or_department_change' }
  },
  { tableName: 'EmployeeRoleHistory' }
);

const Notification = sequelize.define(
  'Notification',
  {
    ...uuidPk(),
    message: { type: DataTypes.STRING, allowNull: false },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    userId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'Notifications' }
);

// Password reset tokens are stored hashed (tokenHash) so raw tokens never hit the DB.
const PasswordResetToken = sequelize.define(
  'PasswordResetToken',
  {
    ...uuidPk(),
    tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    usedAt: { type: DataTypes.DATE, allowNull: true }
  },
  { tableName: 'PasswordResetTokens' }
);

// Manager announcements (team scoped)
const TeamAnnouncement = sequelize.define(
  'TeamAnnouncement',
  {
    ...uuidPk(),
    managerId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    isArchived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { tableName: 'TeamAnnouncements' }
);

// Seating arrangement / cubicle assignments
const SeatingAssignment = sequelize.define(
  'SeatingAssignment',
  {
    ...uuidPk(),
    cubicleId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.UUID, allowNull: true }
  },
  { tableName: 'SeatingAssignments' }
);

// Relationships (FK column names match Supabase schema)
User.hasMany(User, { as: 'Employees', foreignKey: 'managerId' });
User.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Project, { as: 'ManagedProjects', foreignKey: 'managerId' });
Project.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

Project.belongsToMany(User, {
  through: ProjectMember,
  as: 'TeamMembers',
  foreignKey: 'ProjectId',
  otherKey: 'UserId'
});
User.belongsToMany(Project, {
  through: ProjectMember,
  as: 'JoinedProjects',
  foreignKey: 'UserId',
  otherKey: 'ProjectId'
});

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedTo', as: 'AssignedTasks' });
Task.belongsTo(User, { as: 'AssignedTo', foreignKey: 'assignedTo' });

User.hasMany(Leave, { as: 'LeavesApplied', foreignKey: 'employeeId' });
Leave.belongsTo(User, { as: 'Employee', foreignKey: 'employeeId' });

User.hasMany(Leave, { as: 'LeavesManaged', foreignKey: 'managerId' });
Leave.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Feedback, { foreignKey: 'createdBy', as: 'FeedbacksCreated' });
Feedback.belongsTo(User, { as: 'CreatedBy', foreignKey: 'createdBy' });

User.hasMany(Facility, { foreignKey: 'employeeId' });
Facility.belongsTo(User, { as: 'Employee', foreignKey: 'employeeId' });

// Asset relationships
User.hasMany(Asset, { foreignKey: 'assignedEmployeeId', as: 'AssignedAssets' });
Asset.belongsTo(User, { foreignKey: 'assignedEmployeeId', as: 'AssignedEmployee' });

Asset.hasMany(AssetCustodyHistory, { foreignKey: 'assetId' });
AssetCustodyHistory.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(AssetCustodyHistory, { foreignKey: 'employeeId', as: 'AssetCustodyEvents' });
AssetCustodyHistory.belongsTo(User, { foreignKey: 'employeeId', as: 'AssetEmployee' });

Asset.hasMany(AssetMaintenanceRequest, { foreignKey: 'assetId' });
AssetMaintenanceRequest.belongsTo(Asset, { foreignKey: 'assetId' });

User.hasMany(AssetMaintenanceRequest, { foreignKey: 'requestedBy', as: 'AssetMaintenanceRequested' });
AssetMaintenanceRequest.belongsTo(User, { foreignKey: 'requestedBy', as: 'MaintenanceRequester' });

// Facility inventory relationships
FacilityZone.hasMany(FacilityInventory, { foreignKey: 'zoneId' });
FacilityInventory.belongsTo(FacilityZone, { foreignKey: 'zoneId' });

// Wellness + time entries
User.hasMany(WellnessCheckin, { foreignKey: 'employeeId', as: 'WellnessCheckins' });
WellnessCheckin.belongsTo(User, { foreignKey: 'employeeId', as: 'WellnessEmployee' });

User.hasMany(TimeEntry, { foreignKey: 'userId', as: 'TimeEntries' });
TimeEntry.belongsTo(User, { foreignKey: 'userId', as: 'TimeEntryUser' });

// Leave approvals
Leave.hasMany(LeaveApproval, { foreignKey: 'leaveId' });
LeaveApproval.belongsTo(Leave, { foreignKey: 'leaveId' });

User.hasMany(LeaveApproval, { foreignKey: 'decidedBy', as: 'LeaveDecisions' });
LeaveApproval.belongsTo(User, { foreignKey: 'decidedBy', as: 'LeaveDecider' });

// Global notices
User.hasMany(GlobalNotice, { foreignKey: 'createdBy', as: 'NoticesCreated' });
GlobalNotice.belongsTo(User, { foreignKey: 'createdBy', as: 'NoticeCreator' });

// Team announcements
User.hasMany(TeamAnnouncement, { foreignKey: 'managerId', as: 'TeamAnnouncements' });
TeamAnnouncement.belongsTo(User, { foreignKey: 'managerId', as: 'AnnouncementManager' });

// Seating assignments
User.hasMany(SeatingAssignment, { foreignKey: 'userId', as: 'SeatingAssignments' });
SeatingAssignment.belongsTo(User, { foreignKey: 'userId', as: 'SeatedUser' });

// Feedback responses
Feedback.hasMany(FeedbackResponse, { foreignKey: 'feedbackId' });
FeedbackResponse.belongsTo(Feedback, { foreignKey: 'feedbackId' });

User.hasMany(FeedbackResponse, { foreignKey: 'createdBy', as: 'FeedbackResponsesCreated' });
FeedbackResponse.belongsTo(User, { foreignKey: 'createdBy', as: 'FeedbackResponder' });

// Employee role history
User.hasMany(EmployeeRoleHistory, { foreignKey: 'userId', as: 'RoleHistoryForEmployee' });
EmployeeRoleHistory.belongsTo(User, { foreignKey: 'userId', as: 'RoleHistoryEmployee' });

User.hasMany(EmployeeRoleHistory, { foreignKey: 'changedBy', as: 'RoleHistoryChangedBy' });
EmployeeRoleHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'RoleHistoryChanger' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' });
Notification.belongsTo(User, { as: 'User', foreignKey: 'userId' });

User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'PasswordResetTokens' });
PasswordResetToken.belongsTo(User, { as: 'User', foreignKey: 'userId' });

export {
  sequelize,
  User,
  Project,
  ProjectMember,
  Task,
  Leave,
  Attendance,
  Feedback,
  Facility,
  Asset,
  AssetCustodyHistory,
  AssetMaintenanceRequest,
  FacilityZone,
  FacilityInventory,
  WellnessCheckin,
  TimeEntry,
  LeaveApproval,
  GlobalNotice,
  FeedbackResponse,
  EmployeeRoleHistory,
  Notification,
  PasswordResetToken,
  TeamAnnouncement,
  SeatingAssignment
};
