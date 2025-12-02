const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {

    const [bug, setBug] = useState(null)
    const [displayMsg, setDisplayMsg] = useState('Loading....')
    const { bugId } = useParams()

    useEffect(() => {
        bugService.get(bugId)
            .then(bug => setBug(bug))
            .catch(err => setDisplayMsg(`Please Slow Down (${err}) `))
    }, [])

    return <div className="bug-details">
        <h3>Bug Details</h3>
        {!bug && <p className="loading">{displayMsg}</p>}
        {
            bug &&
            <div>
                <h4>{bug.title}</h4>
                <h5>Severity: <span>{bug.severity}</span></h5>
                <p>{bug.description}</p>
                {bug.labels.length && (
                    <ul className="labels">
                        {bug.labels.map(label => (
                            <li key={label}>{'['+label+']'}</li>
                        ))}
                    </ul>
                )}
            </div>
        }
        <hr />
        <Link to="/bug">Back to List</Link>
    </div>

}