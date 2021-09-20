const db = require('../models')

module.exports = (() => {

    const matchTimeEntry = async (timeEntry) => {
        const match = await db.models.TimeEntry.findOne({
            where: {
                toggl_id: timeEntry.id
            }
        })
        return match
    }

    const matchContributor = (timeEntry) => {
        return db.models.Contributor.findOne({
            where: {
                toggl_id: timeEntry.uid
            }
        })
    }

    const addTimeEntries = (params) => {
        let contributor
        return params.timeEntries.forEach(async timeEntry => {
            if (!(await matchTimeEntry(timeEntry))) {
                contributor = await matchContributor(timeEntry)
                if (contributor) {
                    try {
                        await db.models.TimeEntry.create({
                            seconds: timeEntry.dur / 1000,
                            toggl_id: timeEntry.id,
                            start_time: timeEntry.start,
                            description: timeEntry.description || null,
                            contributor_id: contributor.id,
                            project_id: params.project_id,
                        })
                    } catch (err) {
                        console.log('error while creating time entry ', err)
                    }

                }
            }
        })
    }

    return {
        addTimeEntries
    }
})();
