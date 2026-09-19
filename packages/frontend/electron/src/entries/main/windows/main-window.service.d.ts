import { BrowserWindow, nativeTheme } from 'electron';
import { BehaviorSubject } from 'rxjs';
import { HelperProcessManager } from '../helper-process';
export declare class MainWindowManager {
    private readonly helperProcessService;
    maximized$: BehaviorSubject<boolean>;
    fullScreen$: BehaviorSubject<boolean>;
    mainWindowReady: Promise<BrowserWindow> | undefined;
    mainWindow$: BehaviorSubject<BrowserWindow | undefined>;
    private hiddenMacWindow;
    constructor(helperProcessService: HelperProcessManager);
    get mainWindow(): BrowserWindow | undefined;
    private preventMacAppQuit;
    private cleanupWindows;
    private createMainWindow;
    private bindEvents;
    ensureMainWindow(): Promise<BrowserWindow>;
    initAndShowMainWindow(): Promise<BrowserWindow>;
    getMainWindow(): Promise<BrowserWindow>;
    show(): Promise<void>;
    handleThemeChange(theme: (typeof nativeTheme)['themeSource']): void;
    isFullScreen(): boolean;
    isMaximized(): boolean;
    handleMinimizeApp(): void;
    handleHideApp(): void;
    handleMaximizeApp(): void;
    transformToAppUrl(url: URL): string;
    /**
     * Open a URL in a hidden window.
     */
    openUrlInHiddenWindow(urlObj: URL): Promise<BrowserWindow>;
}
//# sourceMappingURL=main-window.service.d.ts.map