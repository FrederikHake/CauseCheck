from threading import Lock

# Dictionary to hold locks for each session
session_locks = {}

def get_session_lock(session_id):
    """Retrieve or create a lock for the given session ID."""
    if session_id not in session_locks:
        session_locks[session_id] = Lock()
    return session_locks[session_id]