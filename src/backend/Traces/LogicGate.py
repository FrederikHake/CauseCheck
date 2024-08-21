
from pm4py.objects.petri_net.obj import PetriNet

from Traces.LogicGateDecision import LogicGateDecision


class LogicGate:
    def __init__(self, type:str,transition:PetriNet.Transition, place:PetriNet.Place ,index) -> None:
        self.type :str = type
        self.place : PetriNet.Place = place
        self.transition : PetriNet.Transition = transition 
        self.index : int = index
        self.logicGateDecisions : dict[int,LogicGateDecision] = {}
        if self.type == "AND":
            for index, outarc in enumerate(self.transition.out_arcs, start=1):
                if isinstance(outarc.target, PetriNet.Transition):
                    logicGateDecision = LogicGateDecision(outarc.target, self.place, index)
                    self.logicGateDecisions[index](logicGateDecision)
        elif self.type == "XOR":
            for index, outarc in enumerate(self.place.out_arcs, start=1):
                if isinstance(outarc.target, PetriNet.Place):
                    logicGateDecision = LogicGateDecision(self.transition, outarc.target, index)
                    self.logicGateDecisions[index](logicGateDecision)

    def setPreviousPlace(self,place):
        self.previousPlaces.append(PetriNet.Place)

        


    def addLogicGateDecision(self,logicGateDecision):
        self.logicGateDecisions[len(self.logicGateDecisions.keys())] = logicGateDecision
        
    def setLogicGateDecisions(self, index: int, logicGateDecisionProbability: float):
        self.logicGateDecisions[index].setProbability(logicGateDecisionProbability)
    
    def getlogicGateDecisions(self):
        return self.logicGateDecisions
    
    def getLabel(self):
        if self.type == "AND":
            return f"AND {self.index}: {self.transition.label}"
        elif self.type == "XOR":
            if self.transition is None:
                return f"XOR {self.index}: None"
            return f"XOR {self.index}: {self.transition}"
        else:
            return ""

    