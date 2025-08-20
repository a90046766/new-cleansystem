export async function getActivePercent() {
    try {
        const { promotionsRepo } = await import('../adapters/local/promotions');
        const list = await promotionsRepo.list();
        const nowTs = Date.now();
        const toTs = (s) => {
            if (!s)
                return undefined;
            if (s.includes('T'))
                return new Date(s).getTime();
            // date-only: 用本地時區起訖
            return new Date(`${s}T00:00:00`).getTime();
        };
        const toEndTs = (s) => {
            if (!s)
                return undefined;
            if (s.includes('T'))
                return new Date(s).getTime();
            return new Date(`${s}T23:59:59`).getTime();
        };
        const active = list.filter((p) => {
            const startTs = toTs(p.startAt);
            const endTs = toEndTs(p.endAt);
            return (p.active !== false) && (startTs === undefined || startTs <= nowTs) && (endTs === undefined || endTs >= nowTs);
        });
        let percent = 0;
        for (const p of active) {
            const rules = p.rules || {};
            if (typeof rules.percent === 'number' && rules.percent > percent)
                percent = rules.percent;
        }
        return percent;
    }
    catch {
        return 0;
    }
}
