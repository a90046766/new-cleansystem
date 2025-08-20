export type AppSettings = {
  countdownEnabled: boolean
  countdownMinutes: number
}

class LocalSettingsRepo {
  private readonly key = 'local-app-settings'
  private load(): Partial<AppSettings> {
    try { const s = localStorage.getItem(this.key); return s ? JSON.parse(s) : {} } catch { return {} }
  }
  private save(obj: Partial<AppSettings>) { localStorage.setItem(this.key, JSON.stringify(obj)) }
  async get(): Promise<AppSettings> {
    const v = this.load()
    return {
      countdownEnabled: v.countdownEnabled ?? true,
      countdownMinutes: v.countdownMinutes ?? 20,
    }
  }
  async set(patch: Partial<AppSettings>): Promise<void> {
    const cur = this.load(); this.save({ ...cur, ...patch })
  }
}

export const settingsRepo = new LocalSettingsRepo()


