const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    get,
    remove,
    save,
    getDefaultFilter
}

function query(filterBy = getDefaultFilter()) {
    const filterParams = `?txt=${filterBy.txt}&minSev=${filterBy.minSeverity}`
    return axios.get(BASE_URL + filterParams).then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove').then(res => res.data)
}

function save(bug) {
    const url = BASE_URL + 'save'
    let queryParams = `?title=${bug.title}&desc=${bug.description}&sev=${bug.severity}`
    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios.get(url + queryParams).then(res => res.data)

}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}
