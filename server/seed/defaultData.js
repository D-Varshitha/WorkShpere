import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import {
  User,
  Project,
  ProjectMember,
  Task,
  Leave,
  Attendance,
  Feedback,
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
  TeamAnnouncement,
  SeatingAssignment
} from '../models/index.js';

/**
 * Idempotent sample data for demos.
 */
export async function seedDefaultData() {
  const hashedPassword = await bcrypt.hash('password', 10);

  // ---- Users ----
  async function upsertUser({ name, email, role, department, managerId = null }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) return existing;
    return User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      managerId
    });
  }

  const admin = await upsertUser({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    department: 'Administration'
  });

  const manager = await upsertUser({
    name: 'Project Manager',
    email: 'manager@example.com',
    role: 'manager',
    department: 'Engineering'
  });

  const employeeA = await upsertUser({
    name: 'Alice Employee',
    email: 'alice@example.com',
    role: 'employee',
    department: 'Engineering',
    managerId: manager.id
  });

  const employeeB = await upsertUser({
    name: 'Bob Employee',
    email: 'bob@example.com',
    role: 'employee',
    department: 'Design',
    managerId: manager.id
  });

  // Optional: IT department user to support maintenance notifications.
  const itAdmin = await upsertUser({
    name: 'IT Admin',
    email: 'it@example.com',
    role: 'admin',
    department: 'IT'
  });

  // ---- Projects ----
  async function upsertProject({ name, status, progress, description, dueDate }) {
    const existing = await Project.findOne({ where: { name } });
    if (existing) return existing;
    return Project.create({
      name,
      status,
      progress,
      description,
      dueDate,
      managerId: manager.id
    });
  }

  const projectA = await upsertProject({
    name: 'Website Revamp',
    status: 'in-progress',
    progress: 45,
    description: 'Refresh the company website for better UX and performance.',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  });

  const projectB = await upsertProject({
    name: 'HR Automation',
    status: 'planning',
    progress: 15,
    description: 'Build internal automation for leave and attendance workflows.',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // ---- Project Members ----
  async function ensureProjectMember({ ProjectId, UserId, role }) {
    const exists = await ProjectMember.findOne({ where: { ProjectId, UserId } });
    if (exists) return;
    await ProjectMember.create({ ProjectId, UserId, role });
  }

  await ensureProjectMember({ ProjectId: projectA.id, UserId: employeeA.id, role: 'developer' });
  await ensureProjectMember({ ProjectId: projectA.id, UserId: employeeB.id, role: 'designer' });
  await ensureProjectMember({ ProjectId: projectB.id, UserId: employeeA.id, role: 'developer' });

  // ---- Tasks ----
  async function ensureTask(task) {
    const exists = await Task.findOne({ where: { title: task.title, projectId: task.projectId } });
    if (exists) return;
    await Task.create(task);
  }

  await ensureTask({
    title: 'Build landing page',
    status: 'in-progress',
    projectId: projectA.id,
    assignedTo: employeeA.id,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'high',
    estimatedHours: 10
  });

  await ensureTask({
    title: 'Finalize UI mockups',
    status: 'todo',
    projectId: projectA.id,
    assignedTo: employeeB.id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    estimatedHours: 6
  });

  await ensureTask({
    title: 'Define leave workflow',
    status: 'done',
    projectId: projectB.id,
    assignedTo: employeeA.id,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    estimatedHours: 8
  });

  // ---- Leaves ----
  const leave = await Leave.findOne({ where: { employeeId: employeeA.id, reason: 'Family event' } });
  let leaveRow = leave;
  if (!leaveRow) {
    leaveRow = await Leave.create({
      employeeId: employeeA.id,
      managerId: manager.id,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      reason: 'Family event',
      status: 'pending'
    });
  }

  // ---- Leave Approvals (multi-level sample) ----
  const today = new Date();
  const managerApproval = await LeaveApproval.findOne({ where: { leaveId: leaveRow.id, level: 'manager' } });
  if (!managerApproval) {
    await LeaveApproval.create({
      leaveId: leaveRow.id,
      level: 'manager',
      status: 'approved',
      comment: 'Manager approved this request.',
      decidedBy: manager.id,
      decidedAt: today
    });
  }
  const hrApproval = await LeaveApproval.findOne({ where: { leaveId: leaveRow.id, level: 'hr' } });
  if (!hrApproval) {
    await LeaveApproval.create({
      leaveId: leaveRow.id,
      level: 'hr',
      status: 'pending',
      comment: null,
      decidedBy: null,
      decidedAt: null
    });
  }

  // ---- Attendance ----
  async function ensureAttendance(userId, status) {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const exists = await Attendance.findOne({
      where: {
        userId,
        status,
        date: { [Op.between]: [start, end] }
      }
    });
    if (exists) return;
    await Attendance.create({ userId, status, date: new Date(today) });
  }

  await ensureAttendance(manager.id, 'present');
  await ensureAttendance(employeeA.id, 'present');
  await ensureAttendance(employeeB.id, 'late');

  // ---- Team announcements ----
  const existingAnnouncement = await TeamAnnouncement.findOne({ where: { managerId: manager.id, title: 'Standup Update' } });
  if (!existingAnnouncement) {
    await TeamAnnouncement.create({
      managerId: manager.id,
      title: 'Standup Update',
      message: 'Daily standup at 10:00 AM. Please share blockers in advance.',
      isArchived: false
    });
  }

  // ---- Seating assignments ----
  const defaultCubicles = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4'];
  for (const c of defaultCubicles) {
    await SeatingAssignment.findOrCreate({ where: { cubicleId: c }, defaults: { cubicleId: c, userId: null } });
  }
  // Demo assignments
  const seatA1 = await SeatingAssignment.findOne({ where: { cubicleId: 'A1' } });
  if (seatA1 && !seatA1.userId) {
    seatA1.userId = employeeA.id;
    await seatA1.save();
  }
  const seatA2 = await SeatingAssignment.findOne({ where: { cubicleId: 'A2' } });
  if (seatA2 && !seatA2.userId) {
    seatA2.userId = employeeB.id;
    await seatA2.save();
  }

  // ---- Feedback + response ----
  let feedback = await Feedback.findOne({
    where: { message: 'A dark mode option on dashboards would be very helpful.' }
  });
  if (!feedback) {
    feedback = await Feedback.create({
      type: 'suggestion',
      message: 'A dark mode option on dashboards would be very helpful.',
      createdBy: employeeB.id,
      anonymous: false,
      department: employeeB.department
    });
  }

  let feedbackResponse = await FeedbackResponse.findOne({ where: { feedbackId: feedback.id } });
  if (!feedbackResponse) {
    feedbackResponse = await FeedbackResponse.create({
      feedbackId: feedback.id,
      department: employeeB.department,
      message: 'Thanks! We have added it to the roadmap.',
      createdBy: admin.id
    });
  }

  // ---- Global notices ----
  const existingNotice = await GlobalNotice.findOne({ where: { title: 'Holiday Notice' } });
  if (!existingNotice) {
    await GlobalNotice.create({
      title: 'Holiday Notice',
      message: 'Office will be closed on Friday due to maintenance.',
      audience: 'all',
      createdBy: admin.id,
      isArchived: false
    });
  }

  // ---- Facility zones + inventory mapping ----
  let zoneA = await FacilityZone.findOne({ where: { zoneName: 'Main Zone A' } });
  if (!zoneA) {
    zoneA = await FacilityZone.create({
      zoneName: 'Main Zone A',
      capacityLimit: 10,
      safetyThresholdPct: 80
    });
  }

  const facilityIds = [
    { facilityId: 'R1', facilityName: 'Boardroom Alpha', facilityType: 'Boardroom' },
    { facilityId: 'R2', facilityName: 'Conference Room 1', facilityType: 'Conference' },
    { facilityId: 'R3', facilityName: 'Conference Room 2', facilityType: 'Conference' }
  ];

  for (const f of facilityIds) {
    const invExists = await FacilityInventory.findOne({ where: { facilityId: f.facilityId } });
    if (!invExists) {
      await FacilityInventory.create({
        facilityId: f.facilityId,
        facilityName: f.facilityName,
        facilityType: f.facilityType,
        zoneId: zoneA.id
      });
    }
  }

  // ---- Assets + custody + maintenance sample ----
  const asset = await Asset.findOne({ where: { assignedEmployeeId: employeeA.id } });
  let assetRow = asset;
  if (!assetRow) {
    assetRow = await Asset.create({
      assetType: 'Laptop',
      condition: 'excellent',
      assignedEmployeeId: employeeA.id,
      status: 'Assigned',
      assignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    });
    await AssetCustodyHistory.create({
      assetId: assetRow.id,
      employeeId: employeeA.id,
      assignedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      releasedAt: null
    });
  }

  const maintExists = await AssetMaintenanceRequest.findOne({
    where: { assetId: assetRow.id, status: 'pending' }
  });
  if (!maintExists) {
    await AssetMaintenanceRequest.create({
      assetId: assetRow.id,
      issueDescription: 'Keyboard keys are sticking; needs maintenance.',
      status: 'pending',
      requestedBy: admin.id,
      resolvedBy: null,
      resolvedAt: null
    });

    // FR2.2: notify IT about maintenance request
    const notifExists = await Notification.findOne({
      where: { userId: itAdmin.id, message: 'Asset maintenance requested for a laptop.' }
    });
    if (!notifExists) {
      await Notification.create({
        userId: itAdmin.id,
        message: 'Asset maintenance requested for a laptop.',
        read: false
      });
    }
  }

  // ---- Wellness check-in ----
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  const wellnessExists = await WellnessCheckin.findOne({
    where: { employeeId: employeeA.id, checkInDate: checkDate }
  });
  if (!wellnessExists) {
    await WellnessCheckin.create({
      employeeId: employeeA.id,
      checkInDate: checkDate,
      stressLevel: 4,
      mood: 'Good',
      notes: 'Slept well and feeling productive.'
    });
  }

  // ---- Time entries ----
  const entryDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  entryDate.setHours(0, 0, 0, 0);
  const taskForTime = await Task.findOne({ where: { projectId: projectA.id, assignedTo: employeeA.id } });
  const timeExists = await TimeEntry.findOne({
    where: { userId: employeeA.id, entryDate }
  });
  if (!timeExists) {
    await TimeEntry.create({
      userId: employeeA.id,
      projectId: projectA.id,
      taskId: taskForTime?.id || null,
      entryDate,
      minutes: 120,
      notes: 'Worked on landing page deliverables.'
    });
  }

  // ---- Employee role history ----
  const roleHistExists = await EmployeeRoleHistory.findOne({
    where: { userId: employeeB.id, changeType: 'role_or_department_change' }
  });
  if (!roleHistExists) {
    await EmployeeRoleHistory.create({
      userId: employeeB.id,
      changedBy: admin.id,
      oldRole: 'employee',
      newRole: 'employee',
      oldDepartment: 'Design',
      newDepartment: 'Design',
      changeType: 'role_or_department_change'
    });
  }

  console.log('Default seed data inserted (core + extended FR tables).');
}
