import fs from 'fs'

export const utilService = {
    makeId,
    readJsonFile
}


function readJsonFile(path) {
    const str = fs.readFileSync(path, 'utf8')
    const json = JSON.parse(str)
    return json
}

function makeId(length=6) {
  let id = '' 
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' 
  for (let i = 0;  i < length;  i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length)) 
  }
  return id 
}