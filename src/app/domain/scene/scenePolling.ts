export namespace ScenePolling {

    /**
     * 轮巡时实体返回值
     */
    export class ScenePollingView {
        sceneId: string; // 场景主键
        sceneName: string; // 场景名称
        pollingTime: number; // 轮巡时间
        pollingType: number; // 轮巡方式
        isPolling?: boolean; // 是否开启轮巡
    }

    /**
     * 场景轮巡设置实体
     */
    export class ScenePollingForm {
        isPolling: boolean;
        switchType: switchType;
        time: number;
        items: SceneItemsPolling[];
    }

    /**
     * 单个场景轮巡设置实体
     */
    export class SceneItemsPolling {
        id: string;
        sceneId: string;
        sceneItemId: string;
        pollingTime: number;
        switchType: switchType;
    }

    /**
     * 场景轮巡实体保存使用
     */
    export class ScenePollingSave {
        isPolling: boolean;
        sceneId: string;
        pollingTime: number;
        pollingType: number;
        pollingOrder: number;
    }

    /**
     * 切换方式枚举
     */
    export enum switchType {
        rightLeft = 0,
        leftRight = 1,
        DownUp = 2,
        upDown = 3
    }
}
