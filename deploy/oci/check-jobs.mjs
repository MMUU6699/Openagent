import {Queue} from 'bullmq';
const q=new Queue('copilot',{prefix:'open_agent_job',connection:{db:4,host:process.env.REDIS_SERVER_HOST,port:6379,password:process.env.REDIS_SERVER_PASSWORD}});
console.log(await q.getJobCounts());
for(const j of await q.getFailed(0,10)) console.log(j.name,j.failedReason);
await q.close();
