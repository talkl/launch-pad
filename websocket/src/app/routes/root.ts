import { FastifyInstance } from 'fastify';
import { db } from '@launch-pad/rdb'


export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello API' };
  });
}
