import { useEffect, useState } from 'react'
import { staffRepo } from '../../adapters/local/staff'
import { authRepo } from '../../adapters/local/auth'
import { Navigate } from 'react-router-dom'
import { getPermissionOverride, setPermissionOverride, type Permission } from '../../utils/permissions'

export default function StaffManagementPage() {
  const u = authRepo.getCurrentUser()
  if (u && u.role!=='admin') return <Navigate to="/dispatch" replace />
  const [rows, setRows] = useState<any[]>([])
  const [edit, setEdit] = useState<any | null>(null)
  const load = async () => setRows(await staffRepo.list())
  useEffect(() => { load() }, [])
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">員工管理</div>
        <button onClick={()=>setEdit({ name:'', email:'', role:'support', status:'active' })} className="rounded-lg bg-brand-500 px-3 py-1 text-white">新增</button>
      </div>
      {rows.map(s => (
        <div key={s.id} className="rounded-xl border p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.name} <span className="text-xs text-gray-500">{s.refCode || ''}</span></div>
              <div className="text-xs text-gray-500">{s.email}｜{s.role}｜{s.status}｜積分 {s.points||0}</div>
            </div>
            <div className="flex items-center gap-2">
              {s.refCode && <button onClick={()=>navigator.clipboard.writeText(s.refCode)} className="rounded-lg bg-gray-100 px-3 py-1 text-sm">複製編號</button>}
              <button onClick={()=>setEdit(s)} className="rounded-lg bg-gray-900 px-3 py-1 text-white">編輯</button>
              <button onClick={async()=>{ const { confirmTwice } = await import('../kit'); if (await confirmTwice('確認刪除該員工？','刪除後無法復原，仍要刪除？')) { await staffRepo.remove(s.id); load() } }} className="rounded-lg bg-rose-500 px-3 py-1 text-white">刪除</button>
              <button onClick={async()=>{ await staffRepo.resetPassword(s.id); alert('已觸發重設密碼（示意）') }} className="rounded-lg bg-gray-100 px-3 py-1 text-sm">重設密碼</button>
            </div>
          </div>
          <PermissionOverrideEditor email={s.email} />
        </div>
      ))}
      {rows.length===0 && <div className="text-gray-500">尚無員工</div>}
      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-2 text-lg font-semibold">{edit.id?'編輯':'新增'}員工</div>
            <div className="space-y-2 text-sm">
              <div>姓名：<input className="w-full rounded border px-2 py-1" value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} /></div>
              <div>Email：<input className="w-full rounded border px-2 py-1" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} /></div>
              <div>角色：
                <select className="w-full rounded border px-2 py-1" value={edit.role} onChange={e=>setEdit({...edit,role:e.target.value})}>
                  <option value="support">support</option>
                  <option value="sales">sales</option>
                </select>
              </div>
              <div>狀態：
                <select className="w-full rounded border px-2 py-1" value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}>
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={()=>setEdit(null)} className="rounded-lg bg-gray-100 px-3 py-1">取消</button>
              <button onClick={async()=>{ await staffRepo.upsert(edit); setEdit(null); load() }} className="rounded-lg bg-brand-500 px-3 py-1 text-white">儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function PermissionOverrideEditor({ email }: { email: string }){
  const [open, setOpen] = useState(false)
  const [allow, setAllow] = useState<string[]>([])
  const [deny, setDeny] = useState<string[]>([])
  useEffect(()=>{
    const ov = getPermissionOverride(email || '')
    setAllow(ov?.allow || []); setDeny(ov?.deny || [])
  }, [email])
  const toggle = (list: string[], val: string) => list.includes(val) ? list.filter(v=>v!==val) : [...list, val]
  const ALL: Permission[] = ['orders.list','orders.create','orders.update','orders.delete','orders.cancel','reservations.manage','customers.manage','technicians.manage','technicians.schedule.view','technicians.schedule.edit','support.schedule.view','support.schedule.edit','staff.manage','products.manage','inventory.manage','promotions.manage','documents.manage','models.manage','notifications.send','approvals.manage','payroll.view','payroll.edit','reports.view','reports.manage']
  return (
    <div className="mt-2">
      <button onClick={()=>setOpen(o=>!o)} className="rounded bg-gray-100 px-2 py-1 text-xs">{open?'收起權限覆蓋':'編輯權限覆蓋'}</button>
      {open && (
        <div className="mt-2 rounded border p-2">
          <div className="text-xs text-gray-600">允許（Allow）</div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {ALL.map(p => (
              <label key={`a-${p}`} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={allow.includes(p)} onChange={e=>setAllow(toggle(allow, p))} />{p}</label>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">拒絕（Deny）</div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {ALL.map(p => (
              <label key={`d-${p}`} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={deny.includes(p)} onChange={e=>setDeny(toggle(deny, p))} />{p}</label>
            ))}
          </div>
          <div className="mt-2 text-right"><button onClick={()=>{ setPermissionOverride(email, { allow: allow as any, deny: deny as any }); alert('已儲存覆蓋') }} className="rounded bg-brand-500 px-3 py-1 text-xs text-white">儲存覆蓋</button></div>
        </div>
      )}
    </div>
  )
}

