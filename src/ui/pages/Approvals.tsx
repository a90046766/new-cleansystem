import { useState, useEffect } from 'react'
import { SectionTitle, StatusChip } from '../kit'
import { technicianApplicationRepo, technicianRepo } from '../../adapters/local/technicians'
import { staffRepo, staffApplicationRepo } from '../../adapters/local/staff'
import { memberRepo, memberApplicationRepo } from '../../adapters/local/members'
import type { TechnicianApplication } from '../../core/repository'

export default function ApprovalsPage() {
  const [techApps, setTechApps] = useState<TechnicianApplication[]>([])
  const [staffApps, setStaffApps] = useState<any[]>([])
  const [memberApps, setMemberApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      const [ta, sa, ma] = await Promise.all([
        technicianApplicationRepo.listPending(),
        staffApplicationRepo.listPending(),
        memberApplicationRepo.listPending(),
      ])
      setTechApps(ta); setStaffApps(sa); setMemberApps(ma)
    } catch (err) {
      console.error('載入申請失敗:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id: string, app: TechnicianApplication) => {
    const { confirmTwice } = await import('../kit')
    if (!(await confirmTwice(`確定要核准「${app.name}」的申請嗎？`, '核准後不可回到待審，仍要核准？'))) return
    
    setLoading(true)
    try {
      // 核准申請
      await technicianApplicationRepo.approve(id)
      // 技師唯一化（以 email 為準）：若存在則更新，不存在才新增
      try {
        const emailLc = app.email.trim().toLowerCase()
        const list = await technicianRepo.list()
        const existed = list.find(t => (t.email || '').toLowerCase() === emailLc)
        if (existed) {
          await technicianRepo.upsert({ id: existed.id, name: app.name, shortName: app.shortName || app.name, email: emailLc, phone: app.phone, region: app.region as any, status: 'active' })
        } else {
          await technicianRepo.upsert({ name: app.name, shortName: app.shortName || app.name, email: emailLc, phone: app.phone, region: app.region as any, status: 'active' })
        }
      } catch {}
      
      await loadData()
      alert('核准成功')
    } catch (err: any) {
      alert('核准失敗：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (id: string, name: string) => {
    const { confirmTwice } = await import('../kit')
    if (!(await confirmTwice(`確定要婉拒「${name}」的申請嗎？`, '婉拒後不可回到待審，仍要婉拒？'))) return
    
    setLoading(true)
    try {
      await technicianApplicationRepo.reject(id)
      await loadData()
      alert('已婉拒')
    } catch (err: any) {
      alert('操作失敗：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const approveStaff = async (app: any) => {
    const { confirmTwice } = await import('../kit'); if(!(await confirmTwice(`確定核准員工「${app.name}」?`, '核准後不可回到待審，仍要核准？'))) return
    setLoading(true)
    try {
      await staffApplicationRepo.approve(app.id)
      // 唯一化：email 存在則更新，不存在則新增
      const list = await staffRepo.list()
      const existed = list.find(s => s.email.toLowerCase() === (app.email||'').toLowerCase())
      if (existed) await staffRepo.upsert({ id: existed.id, name: app.name, shortName: app.shortName||app.name, email: app.email, phone: app.phone, role: app.role, status: 'active' } as any)
      else await staffRepo.upsert({ name: app.name, shortName: app.shortName||app.name, email: app.email, phone: app.phone, role: app.role, status: 'active' } as any)
      await loadData(); alert('核准成功')
    } catch(e:any){ alert(e?.message||'失敗') } finally { setLoading(false) }
  }
  const rejectStaff = async (app: any) => { const { confirmTwice } = await import('../kit'); if(!(await confirmTwice(`婉拒員工「${app.name}」?`, '確定婉拒？'))) return; await staffApplicationRepo.reject(app.id); await loadData() }

  const approveMember = async (app: any) => {
    const { confirmTwice } = await import('../kit'); if(!(await confirmTwice(`確定核准會員「${app.name}」?`, '核准後不可回到待審，仍要核准？'))) return
    setLoading(true)
    try {
      await memberApplicationRepo.approve(app.id)
      // 唯一化：email 命中則更新，否則建立 MO 碼
      if (app.email) {
        const existed = await memberRepo.findByEmail(app.email)
        if (existed) {
          await memberRepo.upsert({ ...existed, name: app.name, phone: app.phone, referrerCode: app.referrerCode })
        } else {
          await memberRepo.create({ name: app.name, email: app.email, phone: app.phone, referrerCode: app.referrerCode })
        }
      } else {
        await memberRepo.create({ name: app.name, phone: app.phone, referrerCode: app.referrerCode })
      }
      await loadData(); alert('核准成功')
    } catch(e:any){ alert(e?.message||'失敗') } finally { setLoading(false) }
  }
  const rejectMember = async (app: any) => { const { confirmTwice } = await import('../kit'); if(!(await confirmTwice(`婉拒會員「${app.name}」?`, '確定婉拒？'))) return; await memberApplicationRepo.reject(app.id); await loadData() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">審核面板</h1>
        <button 
          onClick={loadData}
          disabled={loading}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? '載入中...' : '重新整理'}
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <SectionTitle>待審核技師/員工/會員申請</SectionTitle>
        
        {techApps.length === 0 ? (
          <div className="mt-4 text-center text-gray-500">目前無待審核申請</div>
        ) : (
          <div className="mt-4 space-y-4">
            {techApps.map((app) => (
              <div key={app.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{app.name}</span>
                      {app.shortName && (
                        <span className="text-sm text-gray-500">({app.shortName})</span>
                      )}
                      <StatusChip kind="pending" text="待審核" />
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div>📧 {app.email}</div>
                      <div>📱 {app.phone}</div>
                      <div>📍 {app.region === 'all' ? '全區' : `${app.region}區`}</div>
                      <div>📅 {new Date(app.appliedAt).toLocaleString('zh-TW')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app.id, app)}
                      disabled={loading}
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      通過
                    </button>
                    <button
                      onClick={() => handleReject(app.id, app.name)}
                      disabled={loading}
                      className="rounded-xl bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                    >
                      婉拒
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {staffApps.map((app:any) => (
              <div key={app.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">[員工] {app.name}</span>
                      <StatusChip kind="pending" text="待審核" />
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div>📧 {app.email}</div>
                      <div>📱 {app.phone||'-'}</div>
                      <div>🧑‍💼 {app.role}</div>
                      <div>📅 {new Date(app.appliedAt).toLocaleString('zh-TW')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>approveStaff(app)} disabled={loading} className="rounded-xl bg-green-500 px-4 py-2 text-sm text-white">通過</button>
                    <button onClick={()=>rejectStaff(app)} disabled={loading} className="rounded-xl bg-gray-500 px-4 py-2 text-sm text-white">婉拒</button>
                  </div>
                </div>
              </div>
            ))}
            {memberApps.map((app:any) => (
              <div key={app.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">[會員] {app.name}</span>
                      <StatusChip kind="pending" text="待審核" />
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div>📧 {app.email||'-'}</div>
                      <div>📱 {app.phone||'-'}</div>
                      <div>🎫 介紹碼 {app.referrerCode||'-'}</div>
                      <div>📅 {new Date(app.appliedAt).toLocaleString('zh-TW')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>approveMember(app)} disabled={loading} className="rounded-xl bg-green-500 px-4 py-2 text-sm text-white">通過</button>
                    <button onClick={()=>rejectMember(app)} disabled={loading} className="rounded-xl bg-gray-500 px-4 py-2 text-sm text-white">婉拒</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
