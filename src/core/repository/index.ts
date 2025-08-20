// Repository 介面定義
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'support' | 'sales' | 'technician' | 'member'
  phone?: string
  passwordSet: boolean
}

export interface Staff {
  id: string
  name: string
  shortName?: string
  email: string
  phone?: string
  role: 'support' | 'sales'
  status: 'active' | 'suspended'
  points?: number
  refCode?: string
  updatedAt: string
}

export interface TechnicianApplication {
  id: string
  name: string
  shortName?: string
  email: string
  phone: string
  region: 'north' | 'central' | 'south' | 'all'
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
}

export interface StaffApplication {
  id: string
  name: string
  shortName?: string
  email: string
  phone?: string
  role: 'support' | 'sales'
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
}

export interface MemberApplication {
  id: string
  name: string
  email?: string
  phone?: string
  referrerCode?: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
}

export interface Technician {
  id: string
  code: string
  name: string
  shortName?: string
  email: string
  phone?: string
  region: 'north' | 'central' | 'south' | 'all'
  status: 'active' | 'suspended'
  points?: number
  revenueShareScheme?: 'pure70' | 'pure72' | 'pure73' | 'pure75' | 'pure80' | 'base1' | 'base2' | 'base3'
  skills?: Record<string, boolean>
  updatedAt: string
}

export interface Order {
  id: string
  memberId?: string
  customerName: string
  customerPhone: string
  customerAddress: string
  preferredDate?: string // YYYY-MM-DD
  preferredTimeStart: string
  preferredTimeEnd: string
  referrerCode?: string
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other'
  paymentStatus?: 'unpaid' | 'paid' | 'partial'
  pointsUsed?: number
  pointsDeductAmount?: number
  serviceItems: Array<{
    productId?: string
    name: string
    quantity: number
    unitPrice: number
  }>
  assignedTechnicians: string[]
  signatureTechnician?: string
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'canceled'
  platform: '日' | '同' | '黃' | '今'
  photos: string[]
  photosBefore?: string[]
  photosAfter?: string[]
  signatures: Record<string, string>
  workStartedAt?: string
  workCompletedAt?: string
  serviceFinishedAt?: string
  canceledReason?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  unitPrice: number
  groupPrice?: number
  groupMinQty: number
  description?: string
  imageUrls: string[]
  safeStock?: number
  updatedAt: string
}

// 通知中心
export interface Notification {
  id: string
  title: string
  body?: string
  level?: 'info' | 'warning' | 'success'
  target: 'all' | 'tech' | 'support' | 'sales' | 'member' | 'user'
  targetUserEmail?: string
  scheduledAt?: string
  expiresAt?: string
  sentAt?: string
  createdAt: string
}

// 排班
export interface SupportShift {
  id: string
  supportEmail: string
  date: string // YYYY-MM-DD
  slot: 'am' | 'pm' | 'full'
  reason?: string
  color?: string
  updatedAt: string
}

export interface TechnicianLeave {
  id: string
  technicianEmail: string
  date: string // YYYY-MM-DD
  fullDay: boolean
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  reason?: string
  color?: string
  updatedAt: string
}

export interface TechnicianWork {
  id: string
  technicianEmail: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  orderId: string
  quantityLabel?: string
  color?: string
  updatedAt: string
}

// 其他型錄
export interface InventoryItem {
  id: string
  name: string
  productId?: string
  quantity: number
  description?: string
  imageUrls: string[]
  safeStock?: number
  updatedAt: string
}

export interface Promotion {
  id: string
  title: string
  description?: string
  active: boolean
  startAt?: string
  endAt?: string
  rules?: any
  coverUrl?: string
  updatedAt: string
}

export interface DocumentItem {
  id: string
  title: string
  url: string
  tags?: string[]
  updatedAt: string
}

export interface ModelItem {
  id: string
  category: string
  brand: string
  model: string
  notes?: string
  blacklist?: boolean
  attention?: string
  updatedAt: string
}

// 客戶
export interface CustomerAddress {
  id: string
  label?: string
  address: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  addresses: CustomerAddress[]
  notes?: string
  blacklisted?: boolean
  updatedAt: string
}

// 會員（用於積分與介紹人）
export interface Member {
  id: string
  code: string // MOxxxx
  name: string
  email?: string
  phone?: string
  addresses?: CustomerAddress[]
  referrerType?: 'member' | 'technician' | 'sales'
  referrerCode?: string // MOxxxx / SRxxx / SExxx
  points?: number
  updatedAt: string
}

// 回報（對話串）
export interface ReportMessage {
  id: string
  authorEmail: string
  body: string
  createdAt: string
}

export interface ReportThread {
  id: string
  subject: string
  category: 'complaint' | 'announce' | 'reminder' | 'other'
  level: 'normal' | 'urgent' | 'critical'
  target: 'tech' | 'all' | 'subset'
  targetEmails?: string[]
  status: 'open' | 'closed'
  messages: ReportMessage[]
  createdAt: string
  closedAt?: string
}

// 薪資
export interface PayrollRecord {
  id: string
  userEmail: string
  month: string // YYYY-MM
  baseSalary?: number
  bonus?: number
  revenueShareRate?: number // 0~1 之間
  total?: number
  updatedAt: string
}

// 預約訂單（購物車）
export interface ReservationItem {
  productId?: string
  name: string
  unitPrice: number
  quantity: number
}

export interface ReservationOrder {
  id: string
  customerName: string
  customerPhone: string
  items: ReservationItem[]
  status: 'pending' | 'confirmed' | 'canceled'
  createdAt: string
  updatedAt: string
}

// Repository 介面
export interface AuthRepo {
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  resetPassword(newPassword: string): Promise<void>
  getCurrentUser(): User | null
}

export interface StaffRepo {
  list(): Promise<Staff[]>
  upsert(staff: Omit<Staff, 'id' | 'updatedAt'>): Promise<Staff>
  remove(id: string): Promise<void>
  resetPassword(id: string): Promise<void>
}

export interface TechnicianApplicationRepo {
  listPending(): Promise<TechnicianApplication[]>
  submit(app: Omit<TechnicianApplication, 'id' | 'status' | 'appliedAt'>): Promise<void>
  approve(id: string): Promise<void>
  reject(id: string): Promise<void>
}

export interface StaffApplicationRepo {
  listPending(): Promise<StaffApplication[]>
  submit(app: Omit<StaffApplication, 'id' | 'status' | 'appliedAt'>): Promise<void>
  approve(id: string): Promise<void>
  reject(id: string): Promise<void>
}

export interface MemberApplicationRepo {
  listPending(): Promise<MemberApplication[]>
  submit(app: Omit<MemberApplication, 'id' | 'status' | 'appliedAt'>): Promise<void>
  approve(id: string): Promise<void>
  reject(id: string): Promise<void>
}

export interface TechnicianRepo {
  list(): Promise<Technician[]>
  upsert(tech: Omit<Technician, 'id' | 'updatedAt' | 'code'> & { id?: string }): Promise<Technician>
  remove(id: string): Promise<void>
}

export interface OrderRepo {
  list(): Promise<Order[]>
  get(id: string): Promise<Order | null>
  create(draft: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>
  update(id: string, patch: Partial<Order>): Promise<void>
  delete(id: string, reason: string): Promise<void>
  cancel(id: string, reason: string): Promise<void>
  confirm(id: string): Promise<void>
  startWork(id: string, at: string): Promise<void>
  finishWork(id: string, at: string): Promise<void>
}

export interface ProductRepo {
  list(): Promise<Product[]>
  upsert(product: Omit<Product, 'updatedAt'>): Promise<Product>
  remove(id: string): Promise<void>
}

export interface ScheduleRepo {
  listSupport(range?: { start: string; end: string }): Promise<SupportShift[]>
  saveSupportShift(shift: Omit<SupportShift, 'id' | 'updatedAt'> & { id?: string }): Promise<SupportShift>
  listTechnicianLeaves(range?: { start: string; end: string }): Promise<TechnicianLeave[]>
  saveTechnicianLeave(leave: Omit<TechnicianLeave, 'id' | 'updatedAt'> & { id?: string }): Promise<TechnicianLeave>
  listWork(range?: { start: string; end: string }, technicianEmail?: string): Promise<TechnicianWork[]>
  saveWork(work: Omit<TechnicianWork, 'id' | 'updatedAt'> & { id?: string }): Promise<TechnicianWork>
  removeWork(id: string): Promise<void>
}

export interface NotificationRepo {
  listForUser(user: User): Promise<{ items: Notification[]; unreadIds: Record<string, boolean> }>
  markRead(user: User, id: string): Promise<void>
  push(payload: Omit<Notification, 'id' | 'createdAt' | 'sentAt'> & { sentAt?: string }): Promise<Notification>
}

export interface InventoryRepo {
  list(): Promise<InventoryItem[]>
  upsert(item: Omit<InventoryItem, 'updatedAt'>): Promise<InventoryItem>
  remove(id: string): Promise<void>
}

export interface PromotionsRepo {
  list(): Promise<Promotion[]>
  upsert(item: Omit<Promotion, 'updatedAt'>): Promise<Promotion>
  remove(id: string): Promise<void>
}

export interface DocumentsRepo {
  list(): Promise<DocumentItem[]>
  upsert(item: Omit<DocumentItem, 'updatedAt'>): Promise<DocumentItem>
  remove(id: string): Promise<void>
}

export interface ModelsRepo {
  list(): Promise<ModelItem[]>
  upsert(item: Omit<ModelItem, 'updatedAt'>): Promise<ModelItem>
  remove(id: string): Promise<void>
}

export interface CustomerRepo {
  list(): Promise<Customer[]>
  get(id: string): Promise<Customer | null>
  upsert(customer: Omit<Customer, 'id' | 'updatedAt'> & { id?: string }): Promise<Customer>
  remove(id: string): Promise<void>
}

export interface MemberRepo {
  list(): Promise<Member[]>
  get(id: string): Promise<Member | null>
  findByCode(code: string): Promise<Member | null>
  findByEmail(email: string): Promise<Member | null>
  create(draft: Omit<Member, 'id' | 'updatedAt' | 'code' | 'points'>): Promise<Member>
  upsert(member: Omit<Member, 'updatedAt'>): Promise<Member>
}

export interface ReportsRepo {
  list(): Promise<ReportThread[]>
  get(id: string): Promise<ReportThread | null>
  create(thread: Omit<ReportThread, 'id' | 'createdAt' | 'messages' | 'status'> & { messages?: ReportMessage[] }): Promise<ReportThread>
  appendMessage(id: string, msg: Omit<ReportMessage, 'id' | 'createdAt'>): Promise<void>
  close(id: string): Promise<void>
  removeThread(id: string): Promise<void>
  removeMessage(threadId: string, messageId: string): Promise<void>
}

export interface PayrollRepo {
  list(user?: User): Promise<PayrollRecord[]>
  upsert(record: Omit<PayrollRecord, 'id' | 'updatedAt'> & { id?: string }): Promise<PayrollRecord>
  remove(id: string): Promise<void>
}

export interface ReservationsRepo {
  list(): Promise<ReservationOrder[]>
  get(id: string): Promise<ReservationOrder | null>
  create(draft: Omit<ReservationOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReservationOrder>
  update(id: string, patch: Partial<ReservationOrder>): Promise<void>
}
