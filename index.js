module.exports = {
    /**
     * Converts "svn log" lookup into revision object with following string members
     *  
     * { revision, description, date, user }
     * 
     */
    parseSVNLog (svnLog){
        let logItems = null

        // svn log items are line divided, split to array
        if (svnLog.includes('\r\n'))
            logItems = svnLog.split('------------------------------------------------------------------------\r\n')
        else if (svnLog.includes('\n'))
            logItems = svnLog.split('------------------------------------------------------------------------\n')
        else
            logItems = [svnLog]

        logItems = logItems.filter( item => !!item.length) // remove empty items

        const entries = []
        for (let logItem of logItems){
            logItem = logItem.split('|')
            if (logItem.length !== 4)
                continue // not a valid commit message, can't parse
    
            let message = logItem[3].trim().match(/\n(.*)/g)
            message = message ? message.pop() : ''
            message = message.replace(/\n/g, '').replace(/\n/g, '')
            let revisionNr = logItem[0].trim().match(/r(.*)/).pop()
    
            entries.push({
                revision : revisionNr,
                description : message,
                date : new Date(logItem[2].trim()),
                user : logItem[1].trim(),
            })
        }

        return entries
    },
}