
from copy import deepcopy
import datetime
import random
import pm4py
from pm4py.objects.log.obj import Event, Trace, EventLog
from pm4py.algo.simulation.playout.petri_net import algorithm as simulator

from pm4py.algo.conformance.tokenreplay import algorithm as replay

from Traces.TraceManager import TraceManager

def insert_noise(    log, noisy_trace_prob,traceManager:TraceManager, noisy_event_prob = .2, weights=None ):

    classes = _get_event_classes(log)
    log_new = EventLog()
    for trace in log:
        if len(trace) > 0:
            trace_cpy = deepcopy(trace)
            # check if trace makes random selection
            if random.random() <= noisy_trace_prob:
                insert_more_noise = True

                # net, initial_marking, final_marking = pm4py.convert_to_petri_net(bpmn_graph)
                # single_trace_log = EventLog()
                # single_trace_log.append(trace_cpy)
                # replayed_traces = pm4py.conformance_diagnostics_token_based_replay(single_trace_log, net,
                #                                                                    initial_marking, final_marking)
                while insert_more_noise: # or replayed_traces[0]["trace_is_fit"]:
                    # randomly select which kind of noise to insert
                    types = ["skip", "insert", "switch", "rework", "early", "late"]
                    if weights is not None:
                        noise_type = random.choices(types, weights=weights, k=1)[0]
                    else:
                        noise_type = random.choices(types, k=1)[0]
                    if noise_type == "skip":
                        trace_cpy = _skip_event(trace_cpy)
                    if noise_type == "insert":
                        _insert_event(trace_cpy, classes,traceManager)
                    if noise_type == "switch":
                        trace_cpy = _swap_events(trace_cpy)
                    if noise_type == "rework":
                        trace_cpy = _rework_event(trace_cpy,traceManager)
                    if noise_type == "early":
                        trace_cpy = _early_event(trace_cpy)
                    if noise_type == "late":
                        trace_cpy = _late_event(trace_cpy)
                    if noise_type == "repetitation":
                        trace_cpy = _repetitation_event(trace_cpy)

                    # flip coin to see if more noise will be inserted
                    insert_more_noise = random.random() <= noisy_event_prob

                    # single_trace_log = EventLog()
                    # single_trace_log.append(trace_cpy)
                    # replayed_traces = pm4py.conformance_diagnostics_token_based_replay(single_trace_log, net,
                    #                                                                    initial_marking,
                    #                                                                    final_marking)
            log_new.append(trace_cpy)
    return log_new

def _skip_event(trace: Trace):
    del_index = random.randint(0, len(trace) - 1)
    trace2 = Trace()
    timeskipped = datetime.timedelta()
    for i in range(0, len(trace)):
        if i == del_index and i != 0:
            timeskipped = getTimestamp(trace[i]["time:timestamp"]) - getTimestamp(trace[i-1]["time:timestamp"])
        elif i < del_index:
            trace2.append(trace[i])
        elif i > del_index:
            timeAttibutes = []
            trace2.append(trace[i])
            for attribute in trace2[i-1].keys():
                try:
                    if attribute != "time:timestamp":
                        timeAttibutes = [datetime.datetime.strptime(trace[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[i]["time:timestamp"])] 
                except:
                    continue
            if i > 2:
                trace2[i-1]["time:timestamp"] = (getTimestamp(trace2[i-2]["time:timestamp"]) + timeskipped)
            for attribute in timeAttibutes:
                trace2[i-1][attribute[0]] = getTimestamp(trace2[i-1]["time:timestamp"]) + getTimestamp(attribute[1])
    trace2._attributes = trace._attributes
    return trace2


def _insert_event(trace: Trace, tasks,traceManager:TraceManager):
    ins_index = random.randint(0, len(trace))
    task = random.choice(list(tasks))
    e = Event()
    e = task
    trace.insert(ins_index, e)
    timeAdded = datetime.timedelta()
    timeAttibutes = []
    if ins_index == 0:
        timeAdded = getTimedelta(traceManager.places[e["concept:name"]].getAttributeByProbability('time:timestamp'))
        for attribute in trace[ins_index].keys():
            try:
                if attribute != "time:timestamp":
                    timeAttibutes = [datetime.datetime.strptime(trace[ins_index][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[ins_index]["time:timestamp"])] 
            except:
                continue
        trace[ins_index]["time:timestamp"] = (getTimestamp(trace[0]["time:timestamp"]) - timeAdded)
        for attribute in timeAttibutes:
            trace[ins_index][attribute[0]] = getTimestamp(trace[ins_index]["time:timestamp"]) + attribute[1]
    elif ins_index > 0:
        timeAdded = getTimedelta(traceManager.places[e["concept:name"]].getAttributeByProbability('time:timestamp'))
        for i in range(ins_index+1, len(trace)):
            for attribute in trace[i-1].keys():
                try:
                    if attribute != "time:timestamp":
                        timeAttibutes = [attribute,datetime.datetime.strptime(trace[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[i]["time:timestamp"])] 
                except:
                    continue
            if i > 2:
                trace[i-1]["time:timestamp"] = (getTimestamp(trace[i-2]["time:timestamp"]) + timeAdded)
            for attribute in timeAttibutes:
                trace[i-1][attribute[0]] = getTimestamp(trace[i-1]["time:timestamp"]) + getTimestamp(attribute[1])
    return trace


def _swap_events(trace: Trace):
    if len(trace) == 1:
        return trace
    index1 = random.randint(0, len(trace) - 2)
    index2 = index1 + 1
    trace2 = Trace()
    timeAttibutes1 = []
    for attribute in trace[index1].keys():
        try:
            if attribute != "time:timestamp":
                timeAttibutes1 = [attribute,datetime.datetime.strptime(trace[index1][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[index1]["time:timestamp"])] 
        except:
            continue
    timeAttibutes2 = []
    for attribute in trace[index2].keys():
        try:
            if attribute != "time:timestamp":
                timeAttibutes2 = [attribute,datetime.datetime.strptime(trace[index2][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[index2]["time:timestamp"])] 
        except:
            continue
    
    time1 = trace[index1]["time:timestamp"]
    time2 = trace[index2]["time:timestamp"]
    for i in range(len(trace)):
        if i == index1:
            event = deepcopy(trace[index2])
            event["time:timestamp"] = time1
            for attribute in timeAttibutes2:
                event[attribute[0]] = getTimestamp(event["time:timestamp"]) + getTimestamp(attribute[1])
            trace2.append(event)
        elif i == index2:
            event = deepcopy(trace[index1])
            event["time:timestamp"] = time2
            for attribute in timeAttibutes1:
                event[attribute[0]] = getTimestamp(event["time:timestamp"]) + getTimestamp(attribute[1])
            trace2.append(event)
        else:
            trace2.append(trace[i])
    trace2._attributes = trace._attributes
    return trace2


def _rework_event(trace: Trace,traceManager:TraceManager):
    rework_index = random.randint(0, len(trace) - 1)
    insert_index = rework_index + 1
    activity = deepcopy(trace[rework_index])
    trace.insert(insert_index, activity)
    timeAttibutes = []
    timeAdded = datetime.timedelta()
    if rework_index == 0:
        timeAdded = getTimedelta(traceManager.places[trace[rework_index]["concept:name"]].getAttributeByProbability('time:timestamp'))
        for attribute in trace[rework_index].keys():
            try:
                if attribute != "time:timestamp":
                    timeAttibutes = [attribute,datetime.datetime.strptime(trace[rework_index][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[rework_index]["time:timestamp"])] 
            except:
                continue
    elif rework_index > 0:
        timeAdded = getTimestamp(trace[rework_index]["time:timestamp"]) - getTimestamp(trace[rework_index-1]["time:timestamp"])
        for i in range(rework_index+1, len(trace)):
            for attribute in trace[i-1].keys():
                try:
                    if attribute != "time:timestamp":
                        timeAttibutes = [attribute,datetime.datetime.strptime(trace[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[i]["time:timestamp"])] 
                except:
                    continue    
    for i in range(insert_index, len(trace)):
        trace[i]["time:timestamp"] = (getTimestamp(trace[i]["time:timestamp"]) + timeAdded)
        for attribute in trace[i].keys():
            try:
                if attribute != "time:timestamp":
                    trace[i][attribute] = trace[i][attribute] + timeAdded
            except:
                continue    
    return trace


def _early_event(trace: Trace):
    if len(trace) < 3: 
        return trace
    del_index = random.randint(1, len(trace) - 1)
    insert_index = random.randint(0, del_index - 1)  
    timeAttibutes = []      
    timeRemoved = getTimestamp(trace[del_index]["time:timestamp"]) - getTimestamp(trace[del_index-1]["time:timestamp"])
    trace.insert(insert_index, trace[del_index])
    trace2 = Trace()
    for i in range(0, len(trace)):
        if i == del_index+1:
            continue
        else:
            trace2.append(trace[i])
            if del_index >= i >= insert_index: 
                for attribute in trace2[i].keys():
                    try:
                        if attribute != "time:timestamp":
                            trace2[i][attribute] = datetime.datetime.strptime(trace2[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S") + timeRemoved
                    except:
                        continue 
            if i == insert_index and i == 0:
                stmp = trace[1]["time:timestamp"]
                trace2[insert_index]["time:timestamp"] = getTimestamp(stmp) - timeRemoved
            elif i == insert_index:
                if insert_index > 0:
                    trace2[insert_index]["time:timestamp"] = getTimestamp(trace[insert_index-1]["time:timestamp"]) + timeRemoved
                else:
                    trace2[insert_index]["time:timestamp"] = getTimestamp(trace[1]["time:timestamp"]) + timeRemoved
            if del_index >= i > insert_index:
                trace2[i]["time:timestamp"] = getTimestamp(trace2[i-1]["time:timestamp"]) +timeRemoved    
                
    trace2._attributes = trace._attributes
    return trace2


def _late_event(trace: Trace):
    if len(trace) < 3: 
        return trace
    del_index = random.randint(1, len(trace) - 2)
    insert_index = random.randint(del_index + 2, len(trace)+1)
    timeRemoved = getTimestamp(trace[del_index]["time:timestamp"]) - getTimestamp(trace[del_index-1]["time:timestamp"])
    for i in range(del_index+1, len(trace)):
        for attribute in trace[i-1].keys():
            try:
                if attribute != "time:timestamp":
                    timeAttibutes = [attribute,datetime.datetime.strptime(trace[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S")-getTimestamp(trace[i]["time:timestamp"])] 
            except:
                continue 
    trace.insert(insert_index, trace[del_index])
    trace2 = Trace()
    for i in range(0, len(trace)):
        if i == del_index:
            continue
        else:
            trace2.append(trace[i])
            if del_index < i <= insert_index: 
                for attribute in trace2[i-1].keys():
                    try:
                        if attribute != "time:timestamp":
                            trace2[i-1][attribute] = datetime.datetime.strptime(trace2[i][attribute].split('.')[0], "%Y-%m-%dT%H:%M:%S") + timeRemoved
                    except:
                        continue 
            if i == insert_index and i == 0:
                stmp = trace[1]["time:timestamp"]
                trace2[insert_index]["time:timestamp"] = getTimestamp(stmp) - timeRemoved
            elif i == insert_index:
                if insert_index > 0:
                    trace2[insert_index-1]["time:timestamp"] = getTimestamp(trace[insert_index-1]["time:timestamp"]) + timeRemoved
                else:
                    trace2[insert_index-1]["time:timestamp"] = getTimestamp(trace[1]["time:timestamp"]) + timeRemoved
            if del_index < i <= insert_index:
                trace2[i-1]["time:timestamp"] = getTimestamp(trace2[i-2]["time:timestamp"]) +timeRemoved    
    trace2._attributes = trace._attributes
    return trace2
def _repetitation_event(trace: Trace):
    rep_index = random.randint(0, len(trace) - 1)
    rep_count = random.randint(2, 5)
    activity = trace[rep_index]
    for _ in range(rep_count):
        trace.insert(rep_index + 1, activity)
    return trace

def getTimedelta(time):
    if type(time) == datetime.timedelta:
        return time
    if type(time) == float:
        return datetime.timedelta(seconds=int(time))
    return datetime.timedelta(time)

def getTimestamp(time):
    if type(time) == datetime.datetime:
        return time
    if type(time) == float:
        return datetime.datetime.fromtimestamp(int(time))
    return datetime.datetime.strptime(time.split('.')[0], "%Y-%m-%dT%H:%M:%S")


def _get_event_classes(log):
    classes = set()
    for trace in log:
        for event in trace:
            classes.add(event)
    return classes