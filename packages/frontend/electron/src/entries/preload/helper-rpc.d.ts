import { Subject } from 'rxjs';
import type { HelperToRenderer } from '../helper/types';
export declare const helperEvents$: Subject<{
    channel: string;
    args: any[];
}>;
export declare const helperRpc: Omit<Readonly<HelperToRenderer>, "then">;
//# sourceMappingURL=helper-rpc.d.ts.map