import { MetricCard, SectionTitle } from '../kit'

export default function PageDispatchHome() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold">結單專區</div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <MetricCard title="待結案" value={2} />
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold">訂單專區</div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <MetricCard title="待服務" value={22} />
          <MetricCard title="已完成" value={295} />
          <MetricCard title="所有派工" value={'›'} />
        </div>
      </div>
    </div>
  )
}


