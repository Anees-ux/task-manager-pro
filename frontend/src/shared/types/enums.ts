// ─── All Backend Enums (Mirrored from TaskManager.Domain.Enums) ─────────

export enum TaskItemStatus {
  Backlog = 'Backlog',
  Todo = 'Todo',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Done = 'Done',
  Cancelled = 'Cancelled',
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum ProjectStatus {
  Planning = 'Planning',
  Active = 'Active',
  OnHold = 'OnHold',
  Completed = 'Completed',
}

export enum SubscriptionTier {
  Free = 'Free',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

export enum UserRole {
  Viewer = 'Viewer',
  Developer = 'Developer',
  Manager = 'Manager',
  Admin = 'Admin',
}

export enum ProficiencyLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export enum OverAllocationPolicy {
  Warn = 'Warn',
  Block = 'Block',
  Allow = 'Allow',
}

export enum AiApprovalMode {
  AutoApply = 'AutoApply',
  RequireApproval = 'RequireApproval',
}

export enum AiAgentType {
  TaskRouter = 'TaskRouter',
  StatusAgent = 'StatusAgent',
  CapacityOptimizer = 'CapacityOptimizer',
  RippleAnalyzer = 'RippleAnalyzer',
  BlockerResolver = 'BlockerResolver',
}

export enum AiDecisionAction {
  Assign = 'Assign',
  Reassign = 'Reassign',
  Escalate = 'Escalate',
}

export enum AiDecisionStatus {
  Proposed = 'Proposed',
  Pending = 'Pending',
  Applied = 'Applied',
  Approved = 'Approved',
  Rejected = 'Rejected',
  AutoApplied = 'AutoApplied',
  Expired = 'Expired',
  Escalated = 'Escalated',
}

export enum CapacityStatus {
  Available = 'Available',
  Optimal = 'Optimal',
  Warning = 'Warning',
  Overloaded = 'Overloaded',
  OnLeave = 'OnLeave',
}

export enum DependencyType {
  FinishToStart = 'FinishToStart',
  StartToStart = 'StartToStart',
  FinishToFinish = 'FinishToFinish',
  StartToFinish = 'StartToFinish',
}

export enum TimeOffType {
  Vacation = 'Vacation',
  Sick = 'Sick',
  Personal = 'Personal',
  Other = 'Other',
}

export enum TimeOffStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}
