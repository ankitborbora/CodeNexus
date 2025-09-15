const { parentPort } = require("node:worker_threads");
const controller = require("./worker_demo/controller");

parentPort.on("message",()=>{
 const result = controller.blockingOperation();
 parentPort.postMessage(result);
});