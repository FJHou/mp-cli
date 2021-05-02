var log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

export function wxInfo(){
	if (!log) return
    log.info.apply(log, arguments)
}
export function wxWarn(){
	if (!log) return
    log.warn.apply(log, arguments)
}
export function wxError(){
	if (!log) return
    log.error.apply(log, arguments)
}
export function wxSetFilterMsg(msg){// 从基础库2.7.3开始支持
	if (!log || !log.setFilterMsg) return
	if (typeof msg !== 'string') return
	log.setFilterMsg(msg)	
}
export function wxAddFilterMsg(msg){ // 从基础库2.8.1开始支持
	if (!log || !log.addFilterMsg) return
    if (typeof msg !== 'string') return
    log.addFilterMsg(msg)
} 