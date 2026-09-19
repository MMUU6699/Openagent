export declare const AppStateSchema: import("arktype/internal/methods/object.ts").ObjectType<{
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
}, {}>;
export type AppState = typeof AppStateSchema.infer;
export declare const defaultAppState: AppState;
export declare const StateUpdateSchema: import("arktype/internal/methods/object.ts").ObjectType<Record<string, unknown>, {}>;
export type StateUpdate = Partial<AppState>;
//# sourceMappingURL=state.types.d.ts.map