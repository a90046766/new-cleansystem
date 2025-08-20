import { SectionTitle } from '../kit'

export default function PageProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-200" />
        <div>
          <div className="text-lg font-semibold">外勤人員</div>
          <div className="text-sm text-gray-500">累積服務時數：0 小時｜本月服務評價：0 分/5 分</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>帳號資訊</SectionTitle>
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between"><span className="text-gray-500">姓名</span><span>楊驊宸</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-500">帳號</span><span>0913788051</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-500">廠商</span><span>日式洗濯有限公司</span></div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <SectionTitle>安全性</SectionTitle>
        <div className="mt-3 space-y-3 text-sm">
          <button className="w-full rounded-xl bg-gray-900 py-3 text-white">變更密碼</button>
          <div className="flex items-center justify-between">
            <div>臉部辨識</div>
            <input type="checkbox" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}


