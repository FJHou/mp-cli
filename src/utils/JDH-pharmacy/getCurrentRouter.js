/**
 * 
 */
export function getCurrentRouter() {
    const pages = getCurrentPages()
    const { route, options } = pages[pages.length - 1]

    return {
        route,
        options
    }
}