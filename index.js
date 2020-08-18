module.exports = {
    /**
     * Converts "svn log" lookup into revision object with following string members
     *  
     * { revision, description, date, user }
     * 
     */
    parseSVNLog (svnLog){
        let logItems = null

        // convert all windows linebreaks to unix 
        svnLog = svnLog.replace(/\r\n/g, '\n')

        // svn log items are line divided, split to array
        if (svnLog.includes('\n'))
            logItems = svnLog.split('------------------------------------------------------------------------\n')
        else
            logItems = [svnLog]

        logItems = logItems.filter( item => !!item.length) // remove empty items

        const entries = []
        for (let logItem of logItems){
            const mainItems = logItem.split('|')
            if (mainItems.length < 4)
                continue // not a valid commit message, can't parse
    
            // extra data = file info + description. Both might not be present
            let extraData = mainItems[3].trim().match(/\n(.*)/g)
            
            const revision = mainItems[0].trim().match(/r(.*)/).pop()


            // files info is what is left in extraData. This will normally be a "Changed paths:" line, followed by file info, followed by a blank lline
            // an array of objects :  { file (string, change : 'A/D/M'} 
            // change is add, delete, modify
            const files = [] 
            if (extraData && extraData.length && extraData[0] === '\nChanged paths:'){
                // remove file change header, we don't need this
                extraData.splice(0, 1)

                while (extraData.length){
                    let item = extraData[0].trim()

                    // remove current item from array
                    extraData.splice(0, 1)

                    // if item is too short, we've reached the end of the file change list 
                    if (item.length < 3)
                        break

                    files.push({
                        change : item.substring(0, 1),
                        file : item.substring(2)
                    })
                }
            }
            
            // desciption is whatever is left in the extraData array
            let description = extraData ? extraData.join('') : ''
            description = description.replace(/\n/g, '').replace(/\n/g, '')
    
            entries.push({
                revision,
                description,
                files,
                date : new Date(mainItems[2].trim()),
                user : mainItems[1].trim(),
            })
        }

        return entries
    },
}
