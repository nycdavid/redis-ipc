import { DateTime } from "luxon";

import Weight from "../../app/javascript/resources/weight";
import Task from "../../app/javascript/resources/task";

import { Weight as _Weight } from "../../app/javascript/resource_types";
import { Task as _Task } from "../../app/javascript/resource_types";

import Client from "ioredis";
import { randomBytes } from "crypto";

const railsChannel = "test_factories_rails";

class Factory {
  static async create(resource: string, attrs = {}) {
    const klass = resourceMap[resource];

    const data = {
      ...(await generator(resource)),
      ...attrs,
    }

    return new klass(data);
  }

  static async attributesFor(resource: string, attrs = {}) {
    return {
      ...(await generator(resource)),
      ...attrs,
    }
  }
}

const wait = (timeToDelay) => {
  return new Promise((resolve) => (setTimeout(resolve, timeToDelay)));
}

const generator = async (resource) => {
  const redisA = new Client({ host: "localhost" });
  const channelId = randomBytes(5).toString("hex");
  await redisA.publish(railsChannel, `${channelId}:||:${resource}`);

  let data = null;
  while (data === null) {
    data = await redisA.get(channelId);
    await wait(10);
  }
  redisA.quit();

  return {
    ...JSON.parse(data),
    id: Math.floor(Math.random() * 1000),
  }
}

const resourceMap = {
  weight: Weight,
  task: Task,
}

export default Factory;
