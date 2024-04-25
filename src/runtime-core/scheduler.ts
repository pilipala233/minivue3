

const queue: any[] = [];
const p = Promise.resolve();
//控制当前微任务时只创建一个promise
let isFlushPending = false;

export function nextTick(fn) {

    return fn ? p.then(fn) : p;
}

export function queueJobs(job: any) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}

function queueFlush() {
    if (isFlushPending) return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job
    // 取出头部
    while (job = queue.shift()) {
        job && job();
    }
}