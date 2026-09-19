import { OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { type AppState, type StateUpdate } from './state.types';
export declare class StateService implements OnModuleInit, OnApplicationShutdown {
    private stateService;
    state$: import("rxjs").Observable<{
        settings: {
            windowSettings: {
                width: number;
                height: number;
                x: number;
                y: number;
                maximized: boolean;
                fullscreen: boolean;
            };
        };
        projects: {
            id: string;
            filePath: string;
            lastOpened: Date;
            title: string;
        }[];
        activeProjectId?: string | undefined;
    }>;
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getState(): AppState;
    getState$(): import("rxjs").Observable<{
        settings: {
            windowSettings: {
                width: number;
                height: number;
                x: number;
                y: number;
                maximized: boolean;
                fullscreen: boolean;
            };
        };
        projects: {
            id: string;
            filePath: string;
            lastOpened: Date;
            title: string;
        }[];
        activeProjectId?: string | undefined;
    }>;
    updateState(update: StateUpdate): Promise<void>;
    resetState(): Promise<void>;
    flush(): Promise<void>;
    handleGetState(): AppState;
    handleUpdateState(update: StateUpdate): Promise<void>;
    handleResetState(): Promise<void>;
    handleFlushState(): Promise<void>;
}
//# sourceMappingURL=state.service.d.ts.map