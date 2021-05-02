
export interface RouterConifgInterface {
    routes: Array<RouteConfigInterface>
}

export interface RouteConfigInterface {
    path: string,
    meta?: {
        [key: string]: any
    }
}

interface  RouterConstructor {
    routes: Array<RouteConfigInterface> | []
    beforeHooks: Array<Function> | [];
    routeMap: Map<string, RouteConfigInterface>;

    navigateTo: (options: any) => {}
    navigateBack: (options: any) => {}
    switchTab: (options: any) => {}
    redirectTo: (options: any) => {}
    reLaunch: (options: any) => {}
    init(): void

    getAbsolutePath(): string

    beforeEach(fn: Function): void
}

export interface  RouterInterface{
    // new(options: RouterConifgInterface): RouterConstructor
    routes: Array<RouteConfigInterface> | []
    beforeHooks: Array<Function> | [];
    routeMap: Map<string, RouteConfigInterface>;

    navigateTo: (options: any) => {}
    navigateBack: (options: any) => {}
    switchTab: (options: any) => {}
    redirectTo: (options: any) => {}
    reLaunch: (options: any) => {}
    init(): void

    getAbsolutePath(): string

    beforeEach(fn: Function): void
}