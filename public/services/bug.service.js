const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    get,
    remove,
    save,
    getDefaultFilter
}

function query(filterBy = getDefaultFilter()) {
    return axios.get(BASE_URL , {params: filterBy}).then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
    const url = BASE_URL
    if (bug._id) return axios.put(url, bug).then(res => res.data)
    return axios.post(url, bug).then(res => res.data)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, sortBy: 'title', sortDir: 1, pageIdx: 0}
}
