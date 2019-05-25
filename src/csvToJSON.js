export function csvJSON(csv) {
    const lines = cleanLines(csv);
  
    const result = [];

    const headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");
      for (var j = 0; j < headers.length; j++) {
        const key = headers[j].split('-')[0].trim().replace(/"/g,'').replace(/ /g,'_').toLowerCase()
        const value = currentline[j].replace(/\r|\n/, '')
            obj[key] = value;
      }
      if (obj.location && obj.job_title) {
        result.push(obj);
      }
    }
    return {result, headers};
}

/**
 * @function cleanLines
 * This function trys to merge content from the first row in the the CSV.
 * This is needed because sometimes recruiters might have multi line heading in the 
 * same row at the first row.
 * without this algo the returned lines will not be suitable to represent the desired data structure
 * if a column heading is something like "column\n headline" the CSV parser will read "headline" as a value for "column" because parsers usually
 * split by line (\n).
 * @param  {String} csv A text format of the CSV file 
 * @return {Array} Formatted lines
 */
function cleanLines(csv) {
    const lines = csv.split("\n")
    const arr = [];
    let idx = 0 
    for (const line of lines ) {
        if (line) {
            let val = line
            if (val.trim().endsWith("-")){
                let acc = 1
                let target = line + lines[idx + acc ].trim();
                while(target.endsWith("-")) {
                    val += target;
                    lines[idx + acc] = null
                    acc++;
                    target += lines[idx + acc ].trim();
                }
                val = target
                lines[idx + acc ] = null
            }
            arr.push(val)
        }
        idx++
    }
    return arr
}
  