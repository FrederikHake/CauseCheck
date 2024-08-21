from flask import Blueprint, request, session, make_response, send_file
import pm4py
from pm4py.objects.log.exporter.xes import exporter as xes_exporter
import io
import tempfile

log = Blueprint('log', __name__)
 
@log.route('/noisyLog', methods=['GET'])
def get_noisy_log():
        noisy_log = session.get('noisy_log', None)
        if noisy_log is None:
            return "No noisy log available", 404
        
        return export_log_as_xes(noisy_log)
 
@log.route('/normalLog', methods=['GET'])
def get_normal_log():
    normal_log = session.get('log', None)
    if normal_log is None:
        return "No normal log available", 404
    return export_log_as_xes(normal_log)
 
def export_log_as_xes(log):
    if not isinstance(log, pm4py.objects.log.obj.EventLog):
        return "Log format is not compatible with PM4Py for XES export.", 400

    # Use a NamedTemporaryFile for XES export
    with tempfile.NamedTemporaryFile(suffix=".xes", delete=False) as temp_file:
        xes_exporter.apply(log, temp_file.name)
        temp_file.seek(0)
        # Create a response from the temporary file

        return send_file(temp_file.name, as_attachment=True, download_name='log.xes', mimetype='application/xml')

