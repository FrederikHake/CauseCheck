import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type NoiseType =
	| 'General Noise'
	| 'Skip'
	| 'Insert'
	| 'Swap'
	| 'Rework'
	| 'Early'
	| 'Late'
	| 'Repetition'
	| 'Replace';

export interface Event {
	type: string;
	activity: string;
	name: string;
	value?: string;
	probability: string;
	days?: string;
	hours?: string;
	minutes?: string;
	seconds?: string;
}

export interface Deviation {
	deviationType: string;
	targetAttribute: string;
	name: string;
	targetName?: string;
	activity?: string;
	selectedEvent?: string;
	repeatCount?: number;
	repeatAfter?: string;
	replaceWith?: string;
	valueA?: string;
	valueB?: string;
	targetRelation?: string;
	targetType: string;
	targetValue?: string;
	targetYears?: number;
	targetMonths?: number;
	targetDays?: number;
	targetHours?: number;
	targetMinutes?: number;
	targetSeconds?: number;
	targetProbability: string;
}

interface Noise {
	type: NoiseType | string;
	percentage: number;
}

export type CategoryType = 'Categorical' | 'Numerical' | 'Time';

export type CategoricalConfig = {
	id: string;
	kind: 'Categorical';
	percentage: number;
	value: string;
};

export type NumericalConfig = {
	id: string;
	kind: 'Numerical';
	percentage: number | '';
	value: string;
};

export type TimeConfig = {
	id: string;
	kind: 'Time';
	percentage: number;
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

export type CategoricalTraceAttribute = {
	kind: 'Categorical';
	id: string;
	category: CategoryType;
	name: string;
	configurations: CategoricalConfig[];
};

export type NumericalTraceAttribute = {
	kind: 'Numerical';
	id: string;
	category: CategoryType;
	name: string;
	configurations: NumericalConfig[];
};

export type TimeTraceAttribute = {
	kind: 'Time';
	id: string;
	category: CategoryType;
	name: string;
	configurations: TimeConfig[];
};

export type TraceAttribute =

	| CategoricalTraceAttribute
	| NumericalTraceAttribute
	| TimeTraceAttribute;
export type TraceAttributeConfig =
	| CategoricalConfig
	| NumericalConfig
	| TimeConfig;

interface PetriNet {
	type: string;
}

interface GatewayProbabilities {
	[key: string]: string;
}

interface StoreState {
	deviations: Deviation[];
	noise: Noise[];
	traceAttributes: TraceAttribute[];
	cases: string;
	events: Event[];
	selectedEvent: string;
	setSelectedEvent: React.Dispatch<React.SetStateAction<string>>;
	uploadedPetriNet?: PetriNet;
	savedProbabilities: { [key: string]: GatewayProbabilities };
	startDate: string;
	startTime: string;
	endDate: string;
	endTime: string;
	isFileUploaded: boolean;
	setFileUploaded: (uploaded: boolean) => void;
	setStartDate: (date: string) => void;
	setStartTime: (time: string) => void;
	setEndDate: (date: string) => void;
	setEndTime: (time: string) => void;
	updateNumberOfCases: (newNumber: string) => void;
	addTraceAttribute: (traceAttribute: TraceAttribute) => void;
	addTraceAttributeConfiguration: (
		traceAttributeId: TraceAttribute['id'],
		traceAttributeConfig: TraceAttributeConfig
	) => void;
	updateTraceAttributeConfiguration: (
		traceAttributeId: TraceAttribute['id'],
		traceAttributeConfig: TraceAttributeConfig
	) => void;
	removeTraceAttribute: (attribute: TraceAttribute['id']) => void;
	removeTraceAttributeConfiguration: (
		attributeId: TraceAttribute['id'],
		traceAttributeConfigId: string
	) => void;
	addDeviation: (deviation: Deviation) => void;
	removeDeviation: (name: string, index: number) => void;
	addNoise: (noise: Noise) => void;
	removeNoise: (type: NoiseType | string) => void;
	addEvent: (event: Event) => void;
	updateEvent: (index: number, updates: Partial<Event>) => void;
	deleteEvent: (index: number) => void;
	addGatewayProbability: (
		gateway: string,
		probabilities: GatewayProbabilities
	) => void;
	removeGatewayProbability: (gateway: string) => void;
	updateGatewayProbability: (
		gateway: string,
		probabilities: GatewayProbabilities
	) => void;
	playoutIsDone: boolean;
	setPlayoutIsDone: (playoutIsDone: boolean) => void;
	isTimeLoaded: boolean;
	setIsTimeLoaded: (playoutIsDone: boolean) => void;
	isLogLoaded: boolean;
	setIsLogLoaded: (isLogLoaded: boolean) => void;
	noiseIsSet: boolean;
	setNoiseIsSet: (noiseIsSet: boolean) => void;
	isDeviationLogLoaded: boolean;
	setIsDeviationLogLoaded: (isDeviationLogLoaded: boolean) => void;
	isTraceVarientLoaded: boolean;
	setIsTraceVarientLoaded: (isTraceVarientLoaded: boolean) => void;
	isNoiseLogLoaded: boolean;
	setIsNoiseLogLoaded: (isNoiseLogLoaded: boolean) => void;
	loadDeviationLog: boolean;
	setLoadDeviationLog: (LoadDeviationLog: boolean) => void;
	deviationsSet: boolean;
	setDeviationsSet: (deviationsSet: boolean) => void;
	completedGateways: { [key: string]: boolean };
	setCompletedGateway: (gateway: string, completed: boolean) => void;
	resetStore: () => void;
} 

export const useStore = create(
	immer<StoreState>((set) => ({
		deviations: [],
		noise: [],
		traceAttributes: [],
		cases: '',
		events: [],
		selectedEvent: '',
		setSelectedEvent: (value: React.SetStateAction<string>) =>
			set((state) => {
				state.selectedEvent = typeof value === 'function' ? value(state.selectedEvent) : value;
			}),
		uploadedPetriNet: undefined,
		playoutIsDone: false,
		isTimeLoaded: false,
		savedProbabilities: {},
		startDate: '',
		startTime: '',
		endDate: '',
		endTime: '',
		isFileUploaded: false,
		setPlayoutIsDone: (playoutIsDone: boolean) =>
			set((state) => {
				state.playoutIsDone = playoutIsDone;
			}),
		isLogLoaded: false,
		setIsLogLoaded: (isLogLoaded: boolean) =>
			set((state) => {
				state.isLogLoaded = isLogLoaded;
			}),
		isTraceVarientLoaded: false,
		setIsTraceVarientLoaded: (isTraceVarientLoaded: boolean) =>
			set((state) => {
				state.isTraceVarientLoaded = isTraceVarientLoaded;
			}),
		isDeviationLogLoaded: false,
		setIsDeviationLogLoaded: (isDeviationLogLoaded: boolean) =>
			set((state) => {
				state.isDeviationLogLoaded = isDeviationLogLoaded;
			}),
		isNoiseLogLoaded: false,
		setIsNoiseLogLoaded: (isNoiseLogLoaded: boolean) =>
			set((state) => {
				state.isNoiseLogLoaded = isNoiseLogLoaded;
			}),
		noiseIsSet: false,
		setNoiseIsSet: (noiseIsSet: boolean) =>
			set((state) => {
				state.noiseIsSet = noiseIsSet;
			}),
		loadDeviationLog: false,
		setLoadDeviationLog: (loadDeviationLog: boolean) =>
			set((state) => {
				state.loadDeviationLog = loadDeviationLog;
			}),
		deviationsSet: false,
		setDeviationsSet: (deviationsSet: boolean) =>
			set((state) => {
				state.deviationsSet = deviationsSet;
			}),
		setIsTimeLoaded: (isTimeLoaded: boolean) =>
			set((state) => {
				state.isTimeLoaded = isTimeLoaded;
			}),
		setFileUploaded: (uploaded: boolean) =>
			set((state) => {
				state.isFileUploaded = uploaded;
			}),
		setStartDate: (date: string) =>
			set((state) => {
				state.startDate = date;
			}),
		setStartTime: (time: string) =>
			set((state) => {
				state.startTime = time;
			}),
		setEndDate: (date: string) =>
			set((state) => {
				state.endDate = date;
			}),
		setEndTime: (time: string) =>
			set((state) => {
				state.endTime = time;
			}),
		updateNumberOfCases: (newNumber: string) =>
			set((state) => {
				state.cases = newNumber;
			}),
		addTraceAttribute: (traceAttribute: TraceAttribute) =>
			set((state) => {
				if (!state.traceAttributes.some((attr) => attr.id === traceAttribute.id)) {
					state.traceAttributes.push(traceAttribute);
				}
			}),
		addTraceAttributeConfiguration: (
			traceAttributeId: TraceAttribute['id'],
			traceAttributeConfig: TraceAttributeConfig
		) =>
			set((state) => {
				const foundTraceAttribute = state.traceAttributes.find(
					(ta) => ta.id === traceAttributeId
				);
				if (foundTraceAttribute) {
					if (
						foundTraceAttribute.kind === 'Categorical' &&
						traceAttributeConfig.kind === 'Categorical'
					) {
						foundTraceAttribute.configurations.push(traceAttributeConfig);
					} else if (
						foundTraceAttribute.kind === 'Time' &&
						traceAttributeConfig.kind === 'Time'
					) {
						foundTraceAttribute.configurations.push(traceAttributeConfig);
					} else if (
						foundTraceAttribute.kind === 'Numerical' &&
						traceAttributeConfig.kind === 'Numerical'
					) {
						foundTraceAttribute.configurations.push(traceAttributeConfig);
					}
				}
			}),
		updateTraceAttributeConfiguration: (
			traceAttributeId: TraceAttribute['id'],
			traceAttributeConfig: TraceAttributeConfig
		) =>
			set((state) => {
				const foundTraceAttribute = state.traceAttributes.find(
					(ta) => ta.id === traceAttributeId
				);
				if (foundTraceAttribute) {
					const configIndex = foundTraceAttribute.configurations.findIndex(
						(c) => c.id === traceAttributeConfig.id
					);
					if (configIndex !== -1) {
						foundTraceAttribute.configurations[configIndex] =
							traceAttributeConfig;
					}
				}
			}),
		removeTraceAttributeConfiguration: (
			traceAttributeId: TraceAttribute['id'],
			traceAttributeConfigId: string
		) =>
			set((state) => {
				const foundTraceAttribute = state.traceAttributes.find(
					(ta) => ta.id === traceAttributeId
				);
				if (foundTraceAttribute) {
					switch (foundTraceAttribute.kind) {
						case 'Categorical':
							foundTraceAttribute.configurations = (
								foundTraceAttribute.configurations as CategoricalConfig[]
							).filter((c) => c.id !== traceAttributeConfigId);
							break;
						case 'Numerical':
							foundTraceAttribute.configurations = (
								foundTraceAttribute.configurations as NumericalConfig[]
							).filter((c) => c.id !== traceAttributeConfigId);
							break;
						case 'Time':
							foundTraceAttribute.configurations = (
								foundTraceAttribute.configurations as TimeConfig[]
							).filter((c) => c.id !== traceAttributeConfigId);
							break;
					}
				}
			}),
		removeTraceAttribute: (traceAttributeId: TraceAttribute['id']) =>
			set((state) => {
				state.traceAttributes = state.traceAttributes.filter(
					(n) => n.id !== traceAttributeId
				);
			}),
		addDeviation: (deviation: Deviation) =>
			set((state) => {
				state.deviations.push(deviation);
			}),
		removeDeviation: (name: string, index: number) =>
			set((state) => {
				const deviationsByName = state.deviations.filter(
					(dev) => dev.name === name
				);
				const otherDeviations = state.deviations.filter(
					(dev) => dev.name !== name
				);
				deviationsByName.splice(index, 1);
				state.deviations = [...otherDeviations, ...deviationsByName];
			}),
		addNoise: (newNoise: Noise) =>
			set((state) => {
				const existingNoise = state.noise.find((n) => n.type === newNoise.type);
				if (!existingNoise) {
					state.noise.push(newNoise);
				}
			}),
		removeNoise: (type: NoiseType | string) =>
			set((state) => {
				state.noise = state.noise.filter((n) => n.type !== type);
			}),
		addEvent: (event: Event) =>
			set((state) => {
				state.events.push(event);
			}),
		updateEvent: (index: number, updates: Partial<Event>) =>
			set((state) => {
				state.events[index] = { ...state.events[index], ...updates };
			}),
		deleteEvent: (index: number) =>
			set((state) => {
				state.events = state.events.filter((_, i) => i !== index);
			}),
		addGatewayProbability: (
			gateway: string,
			probabilities: GatewayProbabilities
		) =>
			set((state) => {
				state.savedProbabilities[gateway] = probabilities;
			}),
		removeGatewayProbability: (gateway: string) =>
			set((state) => {
				delete state.savedProbabilities[gateway];
			}),
		updateGatewayProbability: (
			gateway: string,
			probabilities: GatewayProbabilities
		) =>
			set((state) => {
				state.savedProbabilities[gateway] = probabilities;
			}),
		completedGateways: {},
		setCompletedGateway: (gateway: string, completed: boolean) =>
			set((state) => {
				state.completedGateways[gateway] = completed;
			}),
			resetStore: () =>
				set((state) => {
					state.deviations = [];
					state.noise = [];
					state.traceAttributes = [];
					state.cases = '';
					state.events = [];
					state.selectedEvent = '';
					state.uploadedPetriNet = undefined;
					state.savedProbabilities = {};
					state.startDate = '';
					state.startTime = '';
					state.endDate = '';
					state.endTime = '';
					state.isFileUploaded = false;
					state.playoutIsDone = false;
					state.isLogLoaded = false;
					state.isTraceVarientLoaded = false;
					state.isDeviationLogLoaded = false;
					state.isNoiseLogLoaded = false;
					state.noiseIsSet = false;
					state.loadDeviationLog = false;
					state.deviationsSet = false;
					state.isTimeLoaded = false;
					state.completedGateways = {};
				})			
	}))
);
