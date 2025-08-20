import { useEffect, useState } from 'react'
import { orderRepo } from '../../adapters/local/orders'
import { getActivePercent } from '../../utils/promotions'
import { Link } from 'react-router-dom'
import { authRepo } from '../../adapters/local/auth'
import { can } from '../../utils/permissions'

export default function OrderManagementPage() {
  const [rows, setRows] = useState<any[]>([])
  const user = authRepo.getCurrentUser()
  const [q, setQ] = useState('')
  const [statusTab, setStatusTab] = useState<'all'|'pending'|'completed'|'closed'>('all')
  const [pf, setPf] = useState<Record<string, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<any>({ customerName:'', customerPhone:'', customerAddress:'', preferredDate:'', preferredTimeStart:'09:00', preferredTimeEnd:'12:00', platform:'日', referrerCode:'', serviceItems:[{name:'服務',quantity:1,unitPrice:1000}], assignedTechnicians:[], photos:[], signatures:{} })
  const [activePercent, setActivePercent] = useState<number>(0)
  const [products, setProducts] = useState<any[]>([])
  const load = async () => setRows(await orderRepo.list())
  useEffect(()=>{ load() },[])
  useEffect(()=>{ getActivePercent().then(setActivePercent) },[creating])
  useEffect(()=>{ (async()=>{ try { const { productRepo } = await import('../../adapters/local/products'); setProducts(await productRepo.list()) } catch {} })() },[creating])
  const filtered = rows.filter(o => {
    const hit = !q || o.id.includes(q) || (o.customerName||'').includes(q)
    const pfKeys = Object.keys(pf).filter(k=>pf[k])
    const byPf = pfKeys.length===0 || pfKeys.includes(o.platform)
    const byStatus = (()=>{
      if (statusTab==='all') return true
      if (statusTab==='pending') return ['draft','confirmed','in_progress'].includes(o.status)
      if (statusTab==='completed') return o.status==='completed'
      if (statusTab==='closed') return o.status==='canceled'
      return true
    })()
    const byOwner = (()=>{
      if (!user || user.role!=='technician') return true
      const names: string[] = Array.isArray(o.assignedTechnicians)? o.assignedTechnicians : []
      return names.includes(user.name)
    })()
    return hit && byPf && byStatus && byOwner
  })
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">訂單管理</div>
      <div className="flex items-center gap-2 text-xs">
        {([
          ['all','全部'],
          ['pending','待服務'],
          ['completed','已完成'],
          ['closed','已結案'],
        ] as any[]).map(([key,label])=> (
          <button key={key} onClick={()=>setStatusTab(key)} className={`rounded-full px-2.5 py-1 ${statusTab===key? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>{label}</button>
        ))}
      </div>
        <div className="flex items-center gap-2">
          <input placeholder="搜尋ID/客戶" className="rounded border px-2 py-1 text-sm" value={q} onChange={e=>setQ(e.target.value)} />
          {can(user,'orders.create') && <button onClick={()=>setCreating(true)} className="rounded-lg bg-brand-500 px-3 py-1 text-white">新建訂單</button>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {['日','同','黃','今'].map(p=> (
          <button key={p} onClick={()=>setPf(s=>({ ...s, [p]: !s[p] }))} className={`rounded-full px-2.5 py-1 ${pf[p]? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300' : 'bg-gray-100 text-gray-700'}`}>{p}</button>
        ))}
        <button onClick={()=>setPf({})} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">清除</button>
        {filtered.length>0 && (
          <>
            <button onClick={()=>{
              const header = ['ID','平台','客戶','時間','金額','推薦碼']
              const lines = filtered.map((o:any)=>{
                const amt = (o.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0)
                return [o.id,o.platform,o.customerName,`${(o.preferredDate||'')} ${o.preferredTimeStart}~${o.preferredTimeEnd}`,amt,o.referrerCode||''].join(',')
              })
              const csv = [header.join(','),...lines].join('\n')
              const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'orders.csv'
              a.click(); URL.revokeObjectURL(url)
            }} className="ml-auto rounded bg-gray-900 px-2.5 py-1 text-white">匯出列表 CSV</button>
            <button onClick={()=>{
              const header = ['ID','平台','客戶','時間','金額','推薦碼']
              const rowsHtml = filtered.map((o:any)=>{
                const amt = (o.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0)
                return `<tr><td>${o.id}</td><td>${o.platform}</td><td>${o.customerName}</td><td>${(o.preferredDate||'')} ${o.preferredTimeStart}~${o.preferredTimeEnd}</td><td>${amt}</td><td>${o.referrerCode||''}</td></tr>`
              }).join('')
              const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body><table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
              const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'orders.xls'
              a.click(); URL.revokeObjectURL(url)
            }} className="rounded bg-brand-600 px-2.5 py-1 text-white">匯出 Excel</button>
          </>
        )}
      </div>
      <div className="rounded-2xl bg-white p-2 shadow-card">
        {filtered.map(o => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between border-b p-3 text-sm">
            <div>
              <div className="font-semibold">{o.id} <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${o.platform==='日'?'bg-blue-100 text-blue-700':o.platform==='同'?'bg-purple-100 text-purple-700':o.platform==='黃'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>{o.platform}</span></div>
              <div className="text-xs text-gray-500">{o.customerName}｜{o.preferredDate} {o.preferredTimeStart}~{o.preferredTimeEnd}｜推薦碼 {o.referrerCode||'-'} {o.referrerCode && <button onClick={(e)=>{e.preventDefault(); navigator.clipboard.writeText(o.referrerCode)}} className="ml-1 rounded bg-gray-100 px-2 py-0.5">複製</button>}</div>
              {Array.isArray(o.assignedTechnicians) && o.assignedTechnicians.length>0 && (
                <div className="mt-1 text-[11px] text-gray-500">技師：{o.assignedTechnicians.join('、')}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {o.status==='draft' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">草稿</span>}
              {o.status==='confirmed' && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">已確認</span>}
              {o.status==='in_progress' && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">服務中</span>}
              {o.status==='completed' && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">完成</span>}
              {o.status==='canceled' && <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-700">取消</span>}
              <div className="text-gray-600">›</div>
            </div>
          </Link>
        ))}
        {filtered.length===0 && <div className="p-4 text-center text-gray-500">沒有資料</div>}
      </div>
      {creating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-card">
            <div className="mb-2 text-lg font-semibold">新建訂單</div>
            <div className="space-y-2 text-sm">
              <input className="w-full rounded border px-2 py-1" placeholder="客戶姓名" value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} />
              <input className="w-full rounded border px-2 py-1" placeholder="手機" value={form.customerPhone} onChange={e=>setForm({...form,customerPhone:e.target.value})} />
              <input className="w-full rounded border px-2 py-1" placeholder="地址" value={form.customerAddress} onChange={e=>setForm({...form,customerAddress:e.target.value})} />
              <div className="flex gap-2">
                <input type="date" className="w-full rounded border px-2 py-1" value={form.preferredDate} onChange={e=>setForm({...form,preferredDate:e.target.value})} />
                <input type="time" className="w-full rounded border px-2 py-1" value={form.preferredTimeStart} onChange={e=>setForm({...form,preferredTimeStart:e.target.value})} />
                <input type="time" className="w-full rounded border px-2 py-1" value={form.preferredTimeEnd} onChange={e=>setForm({...form,preferredTimeEnd:e.target.value})} />
              </div>
              <input className="w-full rounded border px-2 py-1" placeholder="推薦碼（MOxxxx / SRxxx / SExxx）" value={form.referrerCode} onChange={e=>setForm({...form,referrerCode:e.target.value})} />
              <div className="grid gap-1 text-xs text-gray-500">
                <div>活動折扣：{activePercent > 0 ? `${activePercent}%` : '—'}</div>
                <input className="w-full rounded border px-2 py-1 text-sm" placeholder="會員編號（MOxxxx）可選" value={(form as any).memberCode||''} onChange={e=>setForm({...form, memberCode: e.target.value})} />
              </div>
              <div>
                <label className="mr-2 text-sm text-gray-600">平台</label>
                <select className="rounded border px-2 py-1 text-sm" value={form.platform||'日'} onChange={e=>setForm({...form, platform: e.target.value})}>
                  <option value="日">日</option>
                  <option value="同">同</option>
                  <option value="黃">黃</option>
                  <option value="今">今</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select className="rounded border px-2 py-1" value={form.serviceItems[0].productId||''} onChange={e=>{
                  const val=e.target.value; const it=form.serviceItems[0]; if(!val){ setForm({...form,serviceItems:[{...it, productId:'', name: it.name}]}); return }
                  const p = products.find((x:any)=>x.id===val); setForm({...form,serviceItems:[{...it, productId: val, name: p?.name || it.name, unitPrice: p?.unitPrice || it.unitPrice}]})
                }}>
                  <option value="">自訂</option>
                  {products.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}（{p.unitPrice}）</option>))}
                </select>
                <input className="col-span-2 rounded border px-2 py-1" placeholder="項目" value={form.serviceItems[0].name} onChange={e=>setForm({...form,serviceItems:[{...form.serviceItems[0],name:e.target.value}]})} />
                <input type="number" className="w-24 rounded border px-2 py-1" placeholder="數量" value={form.serviceItems[0].quantity} onChange={e=>setForm({...form,serviceItems:[{...form.serviceItems[0],quantity:Number(e.target.value)}]})} />
                <input type="number" className="w-28 rounded border px-2 py-1" placeholder="單價" value={form.serviceItems[0].unitPrice} onChange={e=>setForm({...form,serviceItems:[{...form.serviceItems[0],unitPrice:Number(e.target.value)}]})} />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={()=>setCreating(false)} className="rounded-lg bg-gray-100 px-3 py-1">取消</button>
              <button onClick={async()=>{ const percent = await getActivePercent(); const items = form.serviceItems.map((it:any)=> percent>0 ? ({ ...it, unitPrice: Math.round(it.unitPrice * (1 - percent/100)) }) : it); let memberId: string|undefined = undefined; if ((form.memberCode||'').startsWith('MO')) { try { const { memberRepo } = await import('../../adapters/local/members'); const m = await memberRepo.findByCode(form.memberCode); if (m) memberId = m.id } catch {} } await orderRepo.create({ ...form, status:'draft', platform: form.platform||'日', memberId, serviceItems: items } as any); setCreating(false); setForm({ customerName:'', customerPhone:'', customerAddress:'', preferredDate:'', preferredTimeStart:'09:00', preferredTimeEnd:'12:00', platform:'日', referrerCode:'', memberCode:'', serviceItems:[{productId:'',name:'服務',quantity:1,unitPrice:1000}], assignedTechnicians:[], photos:[], signatures:{} }); load() }} className="rounded-lg bg-brand-500 px-3 py-1 text-white">建立</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


