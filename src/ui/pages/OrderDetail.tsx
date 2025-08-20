import { SectionTitle, StatusChip, TimelineStep, PhotoGrid } from '../kit'
import { Link, useParams } from 'react-router-dom'
import { authRepo } from '../../adapters/local/auth'
import { can } from '../../utils/permissions'
import { useEffect, useState } from 'react'
import { orderRepo } from '../../adapters/local/orders'
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
  const user = authRepo.getCurrentUser()
  useEffect(() => { if (id) orderRepo.get(id).then(setOrder) }, [id])
  useEffect(() => { if (order) setItemsDraft(order.serviceItems || []) }, [order])
  useEffect(()=>{ (async()=>{ try { if (order?.memberId) { const { memberRepo } = await import('../../adapters/local/members'); const m = await memberRepo.get(order.memberId); setMemberCode(m?.code||''); setMemberName(m?.name||'') } else { setMemberCode(''); setMemberName('') } } catch {} })() },[order?.memberId])
  const [products, setProducts] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ const { productRepo } = await import('../../adapters/local/products'); setProducts(await productRepo.list()) })() },[])
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
              await orderRepo.cancel(order.id, reason)
              const o = await orderRepo.get(order.id); setOrder(o)
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
              try { await orderRepo.delete(order.id, reason); alert('已刪除'); window.history.back() } catch (e:any) { alert(e?.message||'刪除失敗') }
            }}
          >刪除（草稿）</button>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">{order.customerName}</div>
            <div className="text-brand-600 underline">{order.customerAddress}</div>
          </div>
          <a href={`tel:${order.customerPhone}`} className="rounded-full bg-brand-500 px-3 py-2 text-white">撥打</a>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>預約資訊</SectionTitle>
        <div className="mt-3 space-y-2 text-sm">
          <div>下單時間：{new Date(order.createdAt).toLocaleString('zh-TW')}</div>
          <div>服務時間：{order.preferredDate || ''} {order.preferredTimeStart}~{order.preferredTimeEnd}</div>
          <div className="text-xs text-gray-500">推薦碼：{order.referrerCode || '-'} {order.referrerCode && (<button className="ml-2 underline" onClick={()=>navigator.clipboard.writeText(order.referrerCode)}>複製</button>)}</div>
          <div className="text-xs text-gray-700">
            會員：
            {can(user,'orders.update') ? (
              <span className="inline-flex items-center gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="輸入 MOxxxx" value={memberCode} onChange={e=>setMemberCode(e.target.value)} />
                <button className="rounded bg-gray-900 px-2 py-1 text-white" onClick={async()=>{
                  const code = (memberCode||'').trim().toUpperCase()
                  if (!code) { await orderRepo.update(order.id, { memberId: undefined }); const o=await orderRepo.get(order.id); setOrder(o); alert('已取消綁定') ;return }
                  if (!code.startsWith('MO')) { alert('請輸入有效的會員編號（MOxxxx）'); return }
                  try { const { memberRepo } = await import('../../adapters/local/members'); const m = await memberRepo.findByCode(code); if (!m) { alert('查無此會員編號'); return } await orderRepo.update(order.id, { memberId: m.id }); const o=await orderRepo.get(order.id); setOrder(o); alert('已綁定會員：'+(m.name||'') ) } catch { alert('綁定失敗') }
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
            {order.status==='draft' && can(user,'orders.update') && <button onClick={async()=>{ await orderRepo.confirm(order.id); const o=await orderRepo.get(order.id); setOrder(o); alert('已確認') }} className="ml-2 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white">確認</button>}
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
                    await orderRepo.update(order.id, { signatureTechnician: val })
                    const o = await orderRepo.get(order.id)
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
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">項目明細：</div>
              {user?.role!=='technician' && <button onClick={()=>setEditItems(e=>!e)} className="rounded bg-gray-100 px-2 py-1 text-xs">{editItems?'取消':'編輯項目'}</button>}
            </div>
            {!editItems ? (
              <>
                {order.serviceItems?.map((it:any, i:number) => (
                  <div key={i}>{it.name} × {it.quantity} <span className="float-right font-bold text-rose-500">${it.unitPrice}</span></div>
                ))}
                <div className="mt-1 text-xs text-gray-500">合計：{(order.serviceItems||[]).reduce((s:number,it:any)=>s+it.unitPrice*it.quantity,0)}</div>
              </>
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
                  <button onClick={async()=>{ await orderRepo.update(order.id, { serviceItems: itemsDraft }); const o=await orderRepo.get(order.id); setOrder(o); setEditItems(false) }} className="rounded bg-brand-500 px-3 py-1 text-white">儲存</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SignatureModal open={signOpen} onClose={()=>setSignOpen(false)} onSave={async (dataUrl)=>{ await orderRepo.update(order.id, { signatures: { ...(order.signatures||{}), [order.signatureTechnician||'technician']: dataUrl } }); const o = await orderRepo.get(order.id); setOrder(o); setSignOpen(false) }} />

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>照片</SectionTitle>
        <div className="mt-3">
          <PhotoGrid urls={order.photos || []} />
          <div className="mt-3 text-sm">
            <label className="mb-1 block">上傳照片（最多 20 張，≤200KB）</label>
            <input type="file" accept="image/*" multiple onChange={async (e)=>{
              const files = Array.from(e.target.files || [])
              const remain = Math.max(0, 20 - (order.photos?.length || 0))
              const take = files.slice(0, remain)
              const imgs: string[] = []
              for (const f of take) imgs.push(await compressImageToDataUrl(f, 200))
              await orderRepo.update(order.id, { photos: [ ...(order.photos||[]), ...imgs ] })
              const o = await orderRepo.get(order.id); setOrder(o)
            }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>訂單已完成</SectionTitle>
        <div className="mt-2">
          <TimelineStep index={1} title="聯絡客戶" time="2025/07/14 13:57:50" />
          <TimelineStep index={2} title="確認報價" time="2025/07/14 13:57:51" />
          <TimelineStep index={3} title="確認派案" time="2025/07/14 13:58:33" />
          <TimelineStep index={4} title="服務完成" time="2025/08/17 20:25:29" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={async()=>{ if(!confirm('開工前請再次告知公司承諾並取得同意。是否開始？')) return; await orderRepo.startWork(order.id, new Date().toISOString()); const o=await orderRepo.get(order.id); setOrder(o) }} className="rounded bg-brand-500 px-3 py-1 text-white">開始工作</button>
          <button onClick={async()=>{ if(!confirm('是否確認服務完成？')) return; await orderRepo.finishWork(order.id, new Date().toISOString()); const o=await orderRepo.get(order.id); setOrder(o) }} className="rounded bg-gray-900 px-3 py-1 text-white">完成工作</button>
        </div>
      </div>
    </div>
  )
}


