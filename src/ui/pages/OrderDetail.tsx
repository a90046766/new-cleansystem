import { SectionTitle, StatusChip, TimelineStep, PhotoGrid } from '../kit'
import { Link, useParams } from 'react-router-dom'
import { authRepo } from '../../adapters/local/auth'
import { can } from '../../utils/permissions'
import { useEffect, useState } from 'react'
import { loadAdapters } from '../../adapters'
import { compressImageToDataUrl } from '../../utils/image'
import SignatureModal from '../components/SignatureModal'

export default function PageOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [signOpen, setSignOpen] = useState(false)
  const [editItems, setEditItems] = useState(false)
  const [itemsDraft, setItemsDraft] = useState<any[]>([])
  const [memberCode, setMemberCode] = useState<string>('')
  const [memberName, setMemberName] = useState<string>('')
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0)
  const [createdAtEdit, setCreatedAtEdit] = useState<string>('')
  const [dateEdit, setDateEdit] = useState<string>('')
  const [startEdit, setStartEdit] = useState<string>('')
  const [endEdit, setEndEdit] = useState<string>('')
  const [payMethod, setPayMethod] = useState<'cash'|'transfer'|'card'|'other'|''>('')
  const [payStatus, setPayStatus] = useState<'unpaid'|'paid'|'partial'|''>('')
  const [signAs, setSignAs] = useState<'customer'|'technician'>('technician')
  const user = authRepo.getCurrentUser()
  const [repos, setRepos] = useState<any>(null)
  useEffect(()=>{ (async()=>{ const a = await loadAdapters(); setRepos(a) })() },[])
  useEffect(() => { if (!repos || !id) return; repos.orderRepo.get(id).then(setOrder) }, [id, repos])
  useEffect(() => { if (order) setItemsDraft(order.serviceItems || []) }, [order])
  useEffect(()=>{ (async()=>{ try { if (order?.memberId) { const { memberRepo } = await import('../../adapters/local/members'); const m = await memberRepo.get(order.memberId); setMemberCode(m?.code||''); setMemberName(m?.name||'') } else { setMemberCode(''); setMemberName('') } } catch {} })() },[order?.memberId])
  useEffect(()=>{
    if (!order) return
    const toLocal = (iso:string) => {
      try { return iso.slice(0,19) + (iso.includes('Z')?'':'') } catch { return '' }
    }
    setCreatedAtEdit(order.createdAt?.slice(0,16).replace('T','T') || new Date().toISOString().slice(0,16))
    setDateEdit(order.preferredDate||'')
    setStartEdit(order.preferredTimeStart||'09:00')
    setEndEdit(order.preferredTimeEnd||'12:00')
    setPayMethod((order.paymentMethod as any) || '')
    setPayStatus((order.paymentStatus as any) || '')
  },[order])
  const [products, setProducts] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ if(!repos) return; setProducts(await repos.productRepo.list()) })() },[repos])
  // 倒數計時（開始服務後 N 分鐘內不可按「服務完成」；由設定決定）
  useEffect(()=>{
    if (!order?.workStartedAt || order.status==='completed' || order.status==='canceled') { setTimeLeftSec(0); return }
    const parseTs = (s:string) => {
      if (!s) return 0
      if (s.includes('T')) return Date.parse(s)
      const d = new Date(s); return isNaN(d.getTime()) ? 0 : d.getTime()
    }
    let h: any
    ;(async()=>{
      try {
        const { settingsRepo } = await import('../../adapters/local/settings')
        const s = await settingsRepo.get()
        const COOLDOWN_MS = (s.countdownEnabled ? s.countdownMinutes : 0) * 60 * 1000
        if (!COOLDOWN_MS) { setTimeLeftSec(0); return }
        const started = parseTs(order.workStartedAt)
        const endAt = started + COOLDOWN_MS
        const tick = () => { const now = Date.now(); const left = Math.max(0, Math.floor((endAt - now)/1000)); setTimeLeftSec(left) }
        tick(); h = setInterval(tick, 1000)
      } catch { setTimeLeftSec(0) }
    })()
    return () => { if (h) clearInterval(h) }
  }, [order?.workStartedAt, order?.status])
  if (!order) return <div>載入中...</div>
  const isAdminOrSupport = user?.role==='admin' || user?.role==='support'
  const isAssignedTech = user?.role==='technician' && Array.isArray(order.assignedTechnicians) && order.assignedTechnicians.includes(user?.name || '')
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-amber-50 p-3 text-sm">
        <div className="font-semibold">{order.serviceItems?.[0]?.name || '服務內容'}</div>
        <div className="mt-1 flex items-center gap-2">
          <StatusChip kind={order.status==='completed'?'done':'pending'} text={order.status==='completed'?'已完成':'處理中'} />
        </div>
        <div className="mt-1 text-xs text-gray-600">
          會員：{memberCode ? (<>
            {memberCode}{memberName ? `（${memberName}）` : ''}
            <button className="ml-2 rounded bg-gray-100 px-1.5 py-0.5" onClick={()=>navigator.clipboard.writeText(memberCode)}>複製MO</button>
          </>) : '—'}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {order.status !== 'canceled' && can(user,'orders.cancel') && (
          <button
            className="rounded-xl bg-rose-500 px-4 py-2 text-white"
            onClick={async()=>{
              const { confirmTwice } = await import('../kit')
              if(order.status!=='confirmed'){ alert('僅已確認的訂單可以取消'); return }
              if (!(await confirmTwice('確認要取消此訂單？','取消後需重新下單，仍要取消？'))) return
              const reason = prompt('請輸入取消理由：') || ''
              if (!reason.trim()) return
              await repos.orderRepo.cancel(order.id, reason)
              const o = await repos.orderRepo.get(order.id); setOrder(o)
              alert('已取消')
            }}
          >取消訂單</button>
        )}
        {order.status === 'draft' && can(user,'orders.delete') && (
          <button
            className="rounded-xl bg-gray-900 px-4 py-2 text-white"
            onClick={async()=>{
              const { confirmTwice } = await import('../kit')
              if (!(await confirmTwice('確認要刪除此草稿訂單？','刪除後無法復原，仍要刪除？'))) return
              const reason = prompt('請輸入刪除理由：') || ''
              if (!reason.trim()) return
              try { await repos.orderRepo.delete(order.id, reason); alert('已刪除'); window.history.back() } catch (e:any) { alert(e?.message||'刪除失敗') }
            }}
          >刪除（草稿）</button>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>客戶資料</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>姓名：<input className="w-full rounded border px-2 py-1" value={order.customerName||''} onChange={async e=>{ await repos.orderRepo.update(order.id, { customerName:e.target.value }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} /></div>
          <div>手機：<div className="flex gap-2"><input className="w-full rounded border px-2 py-1" value={order.customerPhone||''} onChange={async e=>{ await repos.orderRepo.update(order.id, { customerPhone:e.target.value }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} /><a href={`tel:${order.customerPhone}`} className="rounded bg-brand-500 px-3 py-1 text-white">撥打</a></div></div>
          <div className="col-span-2">地址：<div className="flex gap-2"><input className="w-full rounded border px-2 py-1" value={order.customerAddress||''} onChange={async e=>{ await repos.orderRepo.update(order.id, { customerAddress:e.target.value }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} /><a className="rounded bg-gray-100 px-3 py-1" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress||'')}`}>地圖</a></div></div>
          <div>會員編號：<span className="text-gray-700">{memberCode||'—'}</span></div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>服務內容</SectionTitle>
        <div className="mt-3 text-sm">
          {!editItems ? (
            <div className="rounded border">
              <div className="grid grid-cols-4 bg-gray-50 px-2 py-1 text-xs text-gray-600"><div>項目</div><div>數量</div><div>單價</div><div className="text-right">小計</div></div>
              {(order.serviceItems||[]).map((it:any,i:number)=>{
                const sub = it.quantity*it.unitPrice
                return <div key={i} className="grid grid-cols-4 items-center px-2 py-1 text-sm"><div>{it.name}</div><div>{it.quantity}</div><div>{it.unitPrice}</div><div className="text-right">{sub}</div></div>
              })}
              <div className="border-t px-2 py-1 text-right text-rose-600">小計：<span className="text-base font-semibold">{(order.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0)}</span></div>
            </div>
          ) : (
            <div className="mt-2 space-y-2 text-sm">
              {itemsDraft.map((it:any, i:number)=>(
                <div key={i} className="grid grid-cols-6 items-center gap-2">
                  <select className="col-span-2 rounded border px-2 py-1" value={it.productId||''} onChange={async (e)=>{ const val=e.target.value; const arr=[...itemsDraft]; if(val){ const p = products.find((x:any)=>x.id===val); arr[i]={...arr[i], productId:val, name:p?.name||it.name, unitPrice:p?.unitPrice||it.unitPrice}; } else { arr[i]={...arr[i], productId:undefined}; } setItemsDraft(arr) }}>
                    <option value="">自訂</option>
                    {products.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}（{p.unitPrice}）</option>))}
                  </select>
                  <input className="col-span-2 rounded border px-2 py-1" value={it.name} onChange={e=>{ const arr=[...itemsDraft]; arr[i]={...arr[i], name:e.target.value}; setItemsDraft(arr) }} />
                  <input type="number" className="rounded border px-2 py-1" value={it.quantity} onChange={e=>{ const arr=[...itemsDraft]; arr[i]={...arr[i], quantity:Number(e.target.value)}; setItemsDraft(arr) }} />
                  <input type="number" className="rounded border px-2 py-1" value={it.unitPrice} onChange={e=>{ const arr=[...itemsDraft]; arr[i]={...arr[i], unitPrice:Number(e.target.value)}; setItemsDraft(arr) }} />
                  <button onClick={()=>{ const arr=[...itemsDraft]; arr.splice(i,1); setItemsDraft(arr) }} className="rounded bg-gray-100 px-2 py-1">刪</button>
                </div>
              ))}
              <div><button onClick={()=>setItemsDraft([...itemsDraft, { name:'', quantity:1, unitPrice:0 }])} className="rounded bg-gray-100 px-2 py-1">新增項目</button></div>
              <div className="text-right">
                <button onClick={async()=>{ await repos.orderRepo.update(order.id, { serviceItems: itemsDraft }); const o=await repos.orderRepo.get(order.id); setOrder(o); setEditItems(false) }} className="rounded bg-brand-500 px-3 py-1 text-white">儲存</button>
              </div>
            </div>
          )}
          {user?.role!=='technician' && <div className="mt-2 text-right"><button onClick={()=>setEditItems(e=>!e)} className="rounded bg-gray-100 px-2 py-1 text-xs">{editItems?'取消':'編輯項目'}</button></div>}

          {/* 積分抵扣區 */}
          <div className="mt-4 rounded border p-2 text-xs text-gray-700">
            <div className="mb-2 font-semibold">積分抵扣</div>
            <div className="grid grid-cols-3 gap-2">
              <div>累積積分：<span className="font-mono">{(order as any).memberPoints ?? '—'}</span></div>
              <div>使用積分：<input type="number" className="w-24 rounded border px-2 py-1" value={order.pointsUsed||0} onChange={async e=>{ const pts=Math.max(0,Number(e.target.value)||0); await repos.orderRepo.update(order.id,{ pointsUsed: pts }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} /></div>
              <div>折抵金額：<input type="number" className="w-24 rounded border px-2 py-1" value={order.pointsDeductAmount||0} onChange={async e=>{ const amt=Math.max(0,Number(e.target.value)||0); await repos.orderRepo.update(order.id,{ pointsDeductAmount: amt }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} /></div>
            </div>
            <div className="mt-2 text-right">
              <div>小計：{(order.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0)}</div>
              <div>折抵：-{order.pointsDeductAmount||0}</div>
              <div className="text-rose-600">應付：<span className="text-base font-semibold">{Math.max(0,(order.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0) - (order.pointsDeductAmount||0))}</span></div>
            </div>
          </div>

          {/* 付款資訊移至服務內容底部 */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>付款方式：
              <select className="rounded border px-2 py-1" value={payMethod} onChange={async e=>{ setPayMethod(e.target.value as any); await repos.orderRepo.update(order.id, { paymentMethod: e.target.value as any }); const o=await repos.orderRepo.get(order.id); setOrder(o) }}>
                <option value="">—</option>
                <option value="cash">現金</option>
                <option value="transfer">轉帳</option>
                <option value="card">刷卡</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>付款狀態：
              <select className="rounded border px-2 py-1" value={payStatus} onChange={async e=>{ setPayStatus(e.target.value as any); await repos.orderRepo.update(order.id, { paymentStatus: e.target.value as any }); const o=await repos.orderRepo.get(order.id); setOrder(o) }}>
                <option value="">—</option>
                <option value="unpaid">未付款</option>
                <option value="partial">部分付款</option>
                <option value="paid">已付款</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>預約資訊</SectionTitle>
        <div className="mt-3 space-y-2 text-sm">
          <div>下單時間（不可改）：<input type="datetime-local" className="w-full rounded border px-2 py-1" value={createdAtEdit} readOnly /></div>
          <div>服務日期：
            <div className="mt-1 grid grid-cols-3 gap-2">
              <input type="date" className="rounded border px-2 py-1" value={dateEdit} onChange={e=>setDateEdit(e.target.value)} onBlur={async()=>{ await repos.orderRepo.update(order.id, { preferredDate: dateEdit }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} />
              <input type="time" className="rounded border px-2 py-1" value={startEdit} onChange={e=>setStartEdit(e.target.value)} onBlur={async()=>{ await repos.orderRepo.update(order.id, { preferredTimeStart: startEdit }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} />
              <input type="time" className="rounded border px-2 py-1" value={endEdit} onChange={e=>setEndEdit(e.target.value)} onBlur={async()=>{ await repos.orderRepo.update(order.id, { preferredTimeEnd: endEdit }); const o=await repos.orderRepo.get(order.id); setOrder(o) }} />
            </div>
          </div>
          <div className="text-xs text-gray-500">推薦碼：{order.referrerCode || '-'} {order.referrerCode && (<button className="ml-2 underline" onClick={()=>navigator.clipboard.writeText(order.referrerCode)}>複製</button>)}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>付款方式：
              <select className="rounded border px-2 py-1" value={payMethod} onChange={async e=>{ setPayMethod(e.target.value as any); await repos.orderRepo.update(order.id, { paymentMethod: e.target.value as any }); const o=await repos.orderRepo.get(order.id); setOrder(o) }}>
                <option value="">—</option>
                <option value="cash">現金</option>
                <option value="transfer">轉帳</option>
                <option value="card">刷卡</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>付款狀態：
              <select className="rounded border px-2 py-1" value={payStatus} onChange={async e=>{ setPayStatus(e.target.value as any); await repos.orderRepo.update(order.id, { paymentStatus: e.target.value as any }); const o=await repos.orderRepo.get(order.id); setOrder(o) }}>
                <option value="">—</option>
                <option value="unpaid">未付款</option>
                <option value="partial">部分付款</option>
                <option value="paid">已付款</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-700">
            會員：
            {can(user,'orders.update') ? (
              <span className="inline-flex items-center gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="輸入 MOxxxx" value={memberCode} onChange={e=>setMemberCode(e.target.value)} />
                <button className="rounded bg-gray-900 px-2 py-1 text-white" onClick={async()=>{
                  const code = (memberCode||'').trim().toUpperCase()
                  if (!code) { await repos.orderRepo.update(order.id, { memberId: undefined }); const o=await repos.orderRepo.get(order.id); setOrder(o); alert('已取消綁定') ;return }
                  if (!code.startsWith('MO')) { alert('請輸入有效的會員編號（MOxxxx）'); return }
                  try { const { memberRepo } = await import('../../adapters/local/members'); const m = await memberRepo.findByCode(code); if (!m) { alert('查無此會員編號'); return } await repos.orderRepo.update(order.id, { memberId: m.id }); const o=await repos.orderRepo.get(order.id); setOrder(o); alert('已綁定會員：'+(m.name||'') ) } catch { alert('綁定失敗') }
                }}>儲存</button>
                {memberCode && <button className="rounded bg-gray-100 px-2 py-1" onClick={()=>navigator.clipboard.writeText(memberCode)}>複製MO</button>}
              </span>
            ) : (
              <span>{memberCode || '—'}{memberName ? `（${memberName}）` : ''}</span>
            )}
          </div>
          <div className="pt-2">
            {user?.role!=='technician' && (
              <Link to={`/schedule?orderId=${order.id}&date=${order.preferredDate||''}&start=${order.preferredTimeStart}&end=${order.preferredTimeEnd}`} className="inline-block rounded-xl bg-brand-500 px-4 py-2 text-white">指派技師</Link>
            )}
            {order.status==='draft' && can(user,'orders.update') && <button onClick={async()=>{ await repos.orderRepo.confirm(order.id); const o=await repos.orderRepo.get(order.id); setOrder(o); alert('已確認') }} className="ml-2 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white">確認</button>}
          </div>
          {Array.isArray(order.assignedTechnicians) && order.assignedTechnicians.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold">已指派技師：</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {order.assignedTechnicians.map((n: string, i: number) => (
                  <span key={i} className="rounded-full bg-brand-100 px-2 py-1 text-xs text-brand-700">{n}</span>
                ))}
              </div>
              {/* 簽名技師選擇（示意：以名稱代替，正式版應用 ID/Email） */}
              <div className="mt-2">
                <label className="text-sm text-gray-600">簽名技師</label>
                <select
                  className="ml-2 rounded-lg border px-2 py-1 text-sm"
                  value={order.signatureTechnician || ''}
                  onChange={async (e) => {
                    const val = e.target.value
                    await repos.orderRepo.update(order.id, { signatureTechnician: val })
                    const o = await repos.orderRepo.get(order.id)
                    setOrder(o)
                  }}
                >
                  <option value="">請選擇</option>
                  {order.assignedTechnicians.map((n: string, i: number) => (
                    <option key={i} value={n}>{n}</option>
                  ))}
                </select>
                <button onClick={()=>setSignOpen(true)} className="ml-2 rounded bg-gray-900 px-3 py-1 text-white">簽名</button>
              </div>
            </div>
          )}
          
        </div>
      </div>
      <SignatureModal open={signOpen} onClose={()=>setSignOpen(false)} onSave={async (dataUrl)=>{ await repos.orderRepo.update(order.id, { signatures: { ...(order.signatures||{}), [order.signatureTechnician||'technician']: dataUrl } }); const o = await repos.orderRepo.get(order.id); setOrder(o); setSignOpen(false) }} />

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>服務照片</SectionTitle>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 font-semibold">清洗前</div>
            <PhotoGrid urls={order.photosBefore || []} />
            <div className="mt-2 text-sm">
              <input type="file" accept="image/*" multiple onChange={async (e)=>{
                const files = Array.from(e.target.files || [])
                const imgs: string[] = []
                for (const f of files) imgs.push(await compressImageToDataUrl(f, 200))
                await repos.orderRepo.update(order.id, { photosBefore: [ ...(order.photosBefore||[]), ...imgs ] })
                const o = await repos.orderRepo.get(order.id); setOrder(o)
              }} />
            </div>
          </div>
          <div>
            <div className="mb-1 font-semibold">清洗後</div>
            <PhotoGrid urls={order.photosAfter || []} />
            <div className="mt-2 text-sm">
              <input type="file" accept="image/*" multiple onChange={async (e)=>{
                const files = Array.from(e.target.files || [])
                const imgs: string[] = []
                for (const f of files) imgs.push(await compressImageToDataUrl(f, 200))
                await repos.orderRepo.update(order.id, { photosAfter: [ ...(order.photosAfter||[]), ...imgs ] })
                const o = await repos.orderRepo.get(order.id); setOrder(o)
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>訂單進度</SectionTitle>
        <div className="mt-2">
          <TimelineStep index={1} title="聯絡客戶" time="2025/07/14 13:57:50" />
          <TimelineStep index={2} title="確認報價" time="2025/07/14 13:57:51" />
          <TimelineStep index={3} title="確認派案" time="2025/07/14 13:58:33" />
          <TimelineStep index={4} title="服務完成" time="2025/08/17 20:25:29" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={async()=>{ if(!confirm('開始服務前請再次告知公司承諾並取得同意。是否開始？')) return; await repos.orderRepo.startWork(order.id, new Date().toISOString()); const o=await repos.orderRepo.get(order.id); setOrder(o) }} className="rounded bg-brand-500 px-3 py-1 text-white">開始服務</button>
          <button disabled={timeLeftSec>0} onClick={async()=>{ if(!confirm('是否確認服務完成？')) return; await repos.orderRepo.finishWork(order.id, new Date().toISOString()); const o=await repos.orderRepo.get(order.id); setOrder(o) }} className={`rounded px-3 py-1 text-white ${timeLeftSec>0? 'bg-gray-400' : 'bg-gray-900'}`}>
            {timeLeftSec>0 ? `服務完成（剩餘 ${String(Math.floor(timeLeftSec/60)).padStart(2,'0')}:${String(timeLeftSec%60).padStart(2,'0')}）` : '服務完成'}
          </button>
        </div>
      </div>
    </div>
  )
}


