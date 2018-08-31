import { computeLayout, Geometry } from "homotopy-core";
import * as Rx from "rxjs";
import Worker from "worker-loader!./worker.js";

class LayoutWorker {

  constructor() {
    this.nextId = 0;
    this.waiting = new Map();
    this.worker = new Worker();
    this.worker.onmessage = this.onMessage.bind(this);
  }

  start(data, onComplete) {
    let id = this.nextId++;

    this.worker.postMessage({
      type: "start",
      payload: { id, ...data }
    });

    this.waiting.set(id, onComplete);
    return id;
  }

  stop(id) {
    this.worker.postMessage({
      type: "stop",
      payload: { id }
    });
  }

  onMessage({ data }) {
    if (data.type == "completed") {
      let { id, result } = data.payload;

      if (this.waiting.has(id)) {
        this.waiting.get(id)(result);
        this.waiting.delete(id);
      }
    } else if (data.type == "error") {
      throw new Error(data.payload);
    }
  }

}

// Create a layout worker globally and make it survive hot reloads.
const layoutWorker = new LayoutWorker();

export default (diagram, dimension) => {
  let points = [...Geometry.pointsOf(diagram, dimension)];
  let edges = [...Geometry.edgesOf(diagram, dimension)];

  let job = computeLayout(dimension, points, edges);
  let result;
  while (true) {
    let step = job.next();
    if (step.done) {
      result = step.value;
      break;
    }
  }

  return Rx.Observable.create(observer => {
    // let onComplete = result => {
    //   let endTime = new Date().getTime();
    observer.next({
      ...result,
      points,
      edges
    });
    observer.complete();
    // };

    // let id = window.layoutWorker.start({
    //   dimension,
    //   points,
    //   edges
    // }, onComplete);

    return () => {
      // window.layoutWorker.stop(id);
    };
  });
};

// TODO: Hot reloading